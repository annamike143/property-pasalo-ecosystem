// --- apps/functions/src/index.ts ---
import {onCall, CallableRequest, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "./firebaseAdmin";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tinify = require("tinify");

interface HelloWorldData {
  name: string;
}

interface UploadData {
  fileBuffer: string; // Base64 encoded string of the image
  fileName: string;
  contentType: string;
}

export const helloWorld = onCall(
  {cors: ["http://localhost:3000", "http://localhost:3001"]}, // Allow specific origins
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
  {cors: ["http://localhost:3000", "http://localhost:3001"]}, // Allow specific origins
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

    const {fileBuffer, fileName, contentType} = request.data;

    if (!fileBuffer || !fileName || !contentType) {
      throw new HttpsError("invalid-argument", "Missing required data.");
    }

    logger.info(`Received image ${fileName} for compression.`);

    try {
      // 2. Convert Base64 string back to a Buffer
      const imageBuffer = Buffer.from(fileBuffer, "base64");

      // 3. Compress the image using Tinify
      const source = tinify.fromBuffer(imageBuffer);
      const compressedImageBuffer = await source.toBuffer();
      logger.info(
        `Successfully compressed ${fileName}. ` +
        `Original size: ${imageBuffer.length}, ` +
        `New size: ${compressedImageBuffer.length}`
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
