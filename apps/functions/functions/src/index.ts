// --- apps/functions/src/index.ts ---
import {
  onCall,
  onRequest,
  CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "./firebaseAdmin";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tinify = require("tinify");
import * as nodemailer from "nodemailer";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {config} = require("firebase-functions");
import {Request, Response} from "express";

interface HelloWorldData {
  name: string;
}

interface UploadData {
  fileBuffer: string; // Base64 encoded string of the image
  fileName: string;
  contentType: string;
  resize?: { method: 'fit' | 'cover' | 'thumb' | 'scale'; width?: number; height?: number };
}

// --- TypeScript Interface for the incoming lead data ---
interface LeadData {
  firstName: string;
  lastName: string;
  email?: string; // Optional for Seller Inquiry
  phone?: string; // Optional for some forms
  businessPage?: string; // Optional
  type: "LEAD" | "SELLER_INQUIRY"; // To distinguish form types
  interestedProperty?: string; // Optional
  listingId?: string; // Optional: link the inquiry to a listing
}

export const helloWorld = onCall(
  {cors: true}, // Allow all origins
  async (request: CallableRequest<HelloWorldData>) => {
    const name = request.data.name || "world";
    const message = `Hello, ${name}! Welcome to the Property Pasalo backend.`;

    logger.info(`Said hello to ${name}`, {structuredData: true});

    return {
      success: true,
      message: message,
    };
  }
);

export const compressAndUploadImage = onCall(
  {
    cors: true,
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async (request: CallableRequest<UploadData>) => {
    // Initialize Tinify with API key from environment or config
    if (!tinify.key) {
      try {
        // Try to get from environment variable first
        const apiKey = process.env.TINIFY_API_KEY;
        if (apiKey) {
          tinify.key = apiKey;
        } else {
          // Fallback to functions config (deprecated but still working)
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const {config} = require("firebase-functions");
          tinify.key = config().tinify?.key;
        }
      } catch (error) {
        logger.error("Failed to initialize Tinify API key:", error);
        throw new HttpsError(
          "failed-precondition",
          "Image compression service not configured."
        );
      }
    }

    // 1. Check if user is an authenticated admin
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in as an admin."
      );
    }

  const {fileBuffer, fileName, contentType, resize} = request.data;

    if (!fileBuffer || !fileName || !contentType) {
      throw new HttpsError("invalid-argument", "Missing required data.");
    }

    logger.info(`Received image ${fileName} for compression.`);

    try {
      // 2. Convert Base64 string back to a Buffer
      const imageBuffer = Buffer.from(fileBuffer, "base64");

      // 3. Compress the image using Tinify
      let source = tinify.fromBuffer(imageBuffer);
      if (resize && (resize.width || resize.height)) {
        source = source.resize({
          method: resize.method || 'cover',
          width: resize.width,
          height: resize.height,
        });
      }
      const compressedImageBuffer = await source.toBuffer();
      logger.info(
        "Successfully compressed " + fileName + ". " +
        "Original size: " + imageBuffer.length + ", " +
        "New size: " + compressedImageBuffer.length + ". " +
        "Region: us-central1 with CORS enabled."
      );

      // 4. Upload the compressed image to Firebase Storage
      // Use the default bucket for the project
      const bucket = admin.storage().bucket();
      const filePath = `property-images/${Date.now()}_${fileName}`;
      const file = bucket.file(filePath);

      logger.info(`Uploading to default bucket: ${bucket.name}`);

      await file.save(compressedImageBuffer, {
        metadata: {contentType: contentType},
      });

      // 5. Make the file public and get its URL
      await file.makePublic();
      const publicUrl = file.publicUrl();

      logger.info(`Successfully uploaded to ${publicUrl}`);

      // 6. Return the public URL to the frontend
      return {
        success: true,
        message: "Image compressed and uploaded successfully.",
        url: publicUrl,
      };
    } catch (error) {
      logger.error("Error processing image:", error);
      if (error instanceof tinify.Error) {
        throw new HttpsError(
          "internal",
          "Tinify API error: " + (error as Error).message
        );
      }
      throw new HttpsError(
        "internal",
        "An unexpected error occurred during image processing."
      );
    }
  }
);

// New CORS-friendly version using onRequest
export const compressAndUploadImageV2 = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async (req: Request, res: Response) => {
    // Handle CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      // Parse the request body
  const {fileBuffer, fileName, contentType, resize} = req.body as UploadData;

      if (!fileBuffer || !fileName || !contentType) {
        res.status(400).json({error: "Missing required data"});
        return;
      }

      // Verify Firebase Auth token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const token = authHeader.split("Bearer ")[1];
      await admin.auth().verifyIdToken(token);

      // Initialize Tinify with API key from environment or config
      if (!tinify.key) {
        try {
          // Try to get from environment variable first
          const apiKey = process.env.TINIFY_API_KEY;
          if (apiKey) {
            tinify.key = apiKey;
          } else {
            // Fallback to functions config (deprecated but still working)
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const {config} = require("firebase-functions");
            tinify.key = config().tinify?.key;
          }
        } catch (error) {
          logger.error("Failed to initialize Tinify API key:", error);
          res.status(500).json({
            error: "Image compression service not configured.",
          });
          return;
        }
      }

      logger.info("Received image " + fileName + " for compression.");

      // Convert Base64 string back to a Buffer
      const imageBuffer = Buffer.from(fileBuffer, "base64");

      // Compress the image using Tinify
      let source = tinify.fromBuffer(imageBuffer);
      if (resize && (resize.width || resize.height)) {
        source = source.resize({
          method: resize.method || 'cover',
          width: resize.width,
          height: resize.height,
        });
      }
      const compressedImageBuffer = await source.toBuffer();
      logger.info(
        "Successfully compressed " + fileName + ". " +
        "Original size: " + imageBuffer.length + ", " +
        "New size: " + compressedImageBuffer.length + ". " +
        "Using onRequest with explicit CORS."
      );

      // Upload the compressed image to Firebase Storage
      const bucket = admin.storage().bucket();
      const filePath = "property-images/" + Date.now() + "_" + fileName;
      const file = bucket.file(filePath);

      logger.info("Uploading to default bucket: " + bucket.name);

      await file.save(compressedImageBuffer, {
        metadata: {contentType: contentType},
      });

      // Make the file public and get its URL
      await file.makePublic();
      const publicUrl = file.publicUrl();

      logger.info("Successfully uploaded to " + publicUrl);

      // Return the public URL
      res.json({
        success: true,
        message: "Image compressed and uploaded successfully.",
        url: publicUrl,
      });
    } catch (error) {
      logger.error("Error processing image:", error);
      if (error instanceof tinify.Error) {
        res.status(500).json({
          error: "Tinify API error: " + (error as Error).message,
        });
      } else {
        res.status(500).json({
          error: "An unexpected error occurred during image processing.",
        });
      }
    }
  }
);

// --- Lead Capture Function for Forms ---
export const writeLeadToDb = onCall(
  {
    cors: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://property-pasalo.web.app",
    ],
  }, // Allow specific origins
  async (request: CallableRequest<LeadData>) => {
    logger.info("Received new lead submission:", request.data);

    const {data} = request;

    // 1. Validate the incoming data
    if (!data.firstName || !data.lastName || !data.type) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: firstName, lastName, " +
        "and type are required."
      );
    }

    // 2. Prepare the data object to be saved
    const newLeadRecord = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      businessPage: data.businessPage || null,
      status: data.type, // Directly use the type as the initial status
      interestedProperty: data.interestedProperty || null,
      listingId: data.listingId || null,
      createdAt: admin.database.ServerValue.TIMESTAMP, // server timestamp
      notes: "New inquiry received from website.",
    };

    try {
      // 3. Write the new record to the '/inquiries' collection
      const inquiriesRef = admin.database().ref("inquiries");
      const newInquiryRef = await inquiriesRef.push(newLeadRecord);

      logger.info(
        `Successfully saved new inquiry for ${data.firstName} ` +
        `${data.lastName} with ID: ${newInquiryRef.key}`
      );

      // 4. Optional: Add to activity feed for status page
      const eventsRef = admin.database().ref("events");
      await eventsRef.push({
        message: `New ${data.type.toLowerCase()} inquiry from ` +
        `${data.firstName} ${data.lastName}`,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        type: "INQUIRY_RECEIVED",
      });

      // 5. Return a success message to the frontend
      return {
        success: true,
        message: "Inquiry successfully submitted.",
        inquiryId: newInquiryRef.key,
      };
    } catch (error) {
      logger.error("Error writing lead to database:", error);
      throw new HttpsError(
        "internal",
        "An error occurred while saving the inquiry. Please try again."
      );
    }
  }
);

// --- Simple Test Function for CORS Debugging ---
export const testCorsV3 = onRequest(
  {
    region: "us-central1",
    memory: "128MiB",
    timeoutSeconds: 10,
  },
  async (req: Request, res: Response) => {
    logger.info("testCorsV3 called", {
      method: req.method,
      origin: req.headers.origin,
    });

    // Set comprehensive CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With");
    res.set("Access-Control-Max-Age", "3600");

    if (req.method === "OPTIONS") {
      logger.info("Responding to OPTIONS request");
      res.status(200).send("");
      return;
    }

    logger.info("Responding to actual request");
    res.json({
      success: true,
      message: "CORS test successful",
      timestamp: new Date().toISOString(),
      method: req.method,
      headers: req.headers,
    });
  }
);

// --- CORS-Friendly Version using onRequest ---
export const writeLeadToDbV2 = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (req: Request, res: Response) => {
    // Handle CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    try {
      const data = req.body as LeadData;
      logger.info("Received new lead submission (V2):", data);

      // 1. Validate the incoming data
      if (!data.firstName || !data.lastName || !data.type) {
        res.status(400).json({
          error: "Missing required fields: firstName, lastName, and type " +
          "are required.",
        });
        return;
      }

      // 2. Prepare the data object to be saved
      const newLeadRecord = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        businessPage: data.businessPage || null,
        status: data.type, // Directly use the type as the initial status
        interestedProperty: data.interestedProperty || null,
        listingId: data.listingId || null,
        createdAt: admin.database.ServerValue.TIMESTAMP, // server timestamp
        notes: "New inquiry received from website.",
      };

      // 3. Write the new record to the '/inquiries' collection
      const inquiriesRef = admin.database().ref("inquiries");
      const newInquiryRef = await inquiriesRef.push(newLeadRecord);

      logger.info(
        `Successfully saved new inquiry for ${data.firstName} ` +
        `${data.lastName} with ID: ${newInquiryRef.key}`
      );

      // 4. Optional: Add to activity feed for status page
      const eventsRef = admin.database().ref("events");
      await eventsRef.push({
        message: `New ${data.type.toLowerCase()} inquiry from ` +
        `${data.firstName} ${data.lastName}`,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        type: "INQUIRY_RECEIVED",
      });

      // 5. Return a success message to the frontend
      res.json({
        success: true,
        message: "Inquiry successfully submitted.",
        inquiryId: newInquiryRef.key,
      });
    } catch (error) {
      logger.error("Error writing lead to database (V2):", error);
      res.status(500).json({
        error: "An error occurred while saving the inquiry. " +
        "Please try again.",
      });
    }
  }
);

// --- TypeScript Interface for the incoming data from SmartBot ---
interface ConfirmationData {
  inquiryId: string;
  // You can add any other data SmartBot sends here
}

export const confirmLeadAndNotify = onCall(
  {
    cors: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://property-pasalo.web.app",
    ],
  }, // Allow specific origins
  async (request: CallableRequest<ConfirmationData>) => {
    // NOTE: For this function, we will NOT check for admin auth,
    // because it's being called by your trusted SmartBot server, not a user.
    // For higher security, we could implement an API key check later.

    const {data} = request;
    logger.info("Received lead confirmation:", data);

    if (!data.inquiryId) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required field: inquiryId is required."
      );
    }

    const {inquiryId} = data;
    const db = admin.database();
    const inquiryRef = db.ref(`inquiries/${inquiryId}`);

    try {
      // 1. Fetch the original inquiry to get the full details
      const snapshot = await inquiryRef.once("value");
      if (!snapshot.exists()) {
        throw new HttpsError(
          "not-found",
          `Inquiry with ID ${inquiryId} not found.`
        );
      }
      const inquiryData = snapshot.val();

      // 2. Update the inquiry's status to CONFIRMED
      await inquiryRef.update({status: "CONFIRMED"});
      logger.info(`Updated inquiry ${inquiryId} to CONFIRMED.`);

      // 3. Create a new event for the social proof widget
      const eventMessage = inquiryData.type === "SELLER_INQUIRY" ?
        `${inquiryData.firstName} ${inquiryData.lastName.charAt(0)}. ` +
        "just inquired about selling." :
        `${inquiryData.firstName} ${inquiryData.lastName.charAt(0)}. ` +
        "just booked a viewing!";

      const eventsRef = db.ref("events");
      await eventsRef.push({
        message: eventMessage,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        clientId: inquiryId, // Link back to the client
      });
      logger.info("Created new event for social proof widget.");

      // 3b. Increment the live viewing counter
      const counterRef = db.ref("liveStatus/viewingsBookedCount");
      await counterRef.transaction((current) => {
        const n = typeof current === "number" ? current : 0;
        return n + 1;
      });
      logger.info("Incremented liveStatus/viewingsBookedCount");

      // 4. Send the notification email to the admin
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config().email.user,
          pass: config().email.pass,
        },
      });

  const mailOptions = {
        from: `"Property Pasalo Alerts" <${config().email.user}>`,
        to: "mikemolinasalazar28@gmail.com", // Your personal email
        subject: `✅ CONFIRMED: New ${inquiryData.type} from ` +
        `${inquiryData.firstName} ${inquiryData.lastName}`,
        html: `
              <h2>New Confirmed Inquiry!</h2>
              <p>The user has successfully engaged with the Messenger bot.</p>
              <p><strong>Type:</strong> ${inquiryData.type}</p>
              <p><strong>Name:</strong> ${inquiryData.firstName} ${
  inquiryData.lastName
}</p>
              <p><strong>Email:</strong> ${inquiryData.email || "N/A"}</p>
              <p><strong>Phone:</strong> ${inquiryData.phone || "N/A"}</p>
              <p><strong>Interested In:</strong> ${
  inquiryData.interestedProperty || "N/A"
}</p>
      <p><strong>Listing ID:</strong> ${inquiryData.listingId || "N/A"}</p>
              <p><strong>Next Step:</strong> Review in your Admin Portal ` +
        `and follow up.</p>
            `,
      };

      await transporter.sendMail(mailOptions);
      logger.info("Admin notification email sent successfully.");

      return {
        success: true,
        message: "Lead confirmed and notifications sent.",
      };
    } catch (error) {
      logger.error(
        `Error processing confirmation for inquiry ${inquiryId}:`,
        error
      );
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        "An unexpected error occurred during lead confirmation."
      );
    }
  }
);

// --- RTDB Trigger: When a client becomes a HOMEOWNER, publish an event ---
import { onValueWritten } from "firebase-functions/v2/database";

export const onClientStatusChange = onValueWritten(
  {
    ref: "/clients/{clientId}",
    region: "us-central1",
  },
  async (event) => {
    try {
      const beforeVal = event.data.before.val();
      const afterVal = event.data.after.val();
      if (!afterVal) return; // deleted or invalid

      const prevStatus = beforeVal?.status;
      const newStatus = afterVal?.status;
      if (prevStatus === "HOMEOWNER" || newStatus !== "HOMEOWNER") return;

      const firstName = afterVal.firstName || "Client";
      const lastName = afterVal.lastName || "";
      const location = afterVal.location || ""; // optional if present
      const message = location
        ? `${firstName} ${lastName.charAt(0)}. just became a homeowner in ${location}!`
        : `${firstName} ${lastName.charAt(0)}. just became a homeowner!`;

      const eventsRef = admin.database().ref("events");
      await eventsRef.push({
        message,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        type: "HOMEOWNER_CREATED",
      });
      logger.info("Published HOMEOWNER_CREATED event");
    } catch (err) {
      logger.error("onClientStatusChange error", err);
    }
  }
);

// --- Bootstrap: Allow a signed-in user to grant themselves admin ONLY if no admins exist ---
export const grantSelfAdmin = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const db = admin.database();
  const adminsRef = db.ref('siteConfig/admins');
  const snap = await adminsRef.once('value');
  const admins = snap.exists() ? snap.val() as Record<string, boolean> : null;
  const hasAnyAdmin = !!admins && Object.values(admins).some(Boolean);
  if (hasAnyAdmin) {
    throw new HttpsError('permission-denied', 'Admins already exist. Ask an admin to grant you access.');
  }
  await adminsRef.update({ [uid]: true });
  return { success: true, uid };
});
