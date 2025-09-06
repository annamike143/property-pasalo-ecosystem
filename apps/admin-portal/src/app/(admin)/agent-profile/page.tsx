"use client";
import React from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/firebase';
import type { AgentProfile } from '@repo/types';
import ImageUploader from '@/components/ImageUploader';
import './agent-profile.css';

const defaultProfile: AgentProfile = {
	name: '',
	title: '',
	portraitImageUrl: '',
	philosophy: '',
	contact: { phone: '', email: '' }
};

export default function AgentProfilePage() {
	const [profile, setProfile] = React.useState<AgentProfile>(defaultProfile);
	const [loading, setLoading] = React.useState(true);
	const [saving, setSaving] = React.useState(false);
	const [error, setError] = React.useState('');

	React.useEffect(() => {
		const r = ref(database, 'siteContent/agentProfile');
		const unsub = onValue(r, (snap) => {
			if (snap.exists()) {
				const v = snap.val() as AgentProfile;
				setProfile({
					name: v.name || '',
					title: v.title || '',
					portraitImageUrl: v.portraitImageUrl || '',
					philosophy: v.philosophy || '',
					contact: { phone: v.contact?.phone || '', email: v.contact?.email || '' }
				});
			} else {
				setProfile(defaultProfile);
			}
			setLoading(false);
		});
		return () => unsub();
	}, []);

	const updateField = (key: keyof AgentProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const value = e.target.value;
		setProfile(prev => ({ ...prev, [key]: value } as AgentProfile));
	};

	const updateContact = (key: 'phone' | 'email') => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setProfile(prev => ({ ...prev, contact: { ...(prev.contact || {}), [key]: value } } as AgentProfile));
	};

	const onUploadComplete = (url: string) => {
		setProfile(prev => ({ ...prev, portraitImageUrl: url }));
	};

	const save = async () => {
		setSaving(true);
		setError('');
		try {
			await set(ref(database, 'siteContent/agentProfile'), profile);
			alert('Agent profile saved.');
		} catch (e) {
			console.error(e);
			setError('Failed to save agent profile.');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p>Loading agent profile…</p>;

	return (
		<div className="agent-profile-page">
			<h1>Agent Profile</h1>
			<div className="form-grid">
				<div className="form-left">
					<label className="label">Portrait</label>
					<ImageUploader currentImageUrl={profile.portraitImageUrl} onUploadComplete={onUploadComplete} />
				</div>
				<div className="form-right">
					<div className="form-group">
						<label className="label" htmlFor="name">Name</label>
						<input id="name" className="input" value={profile.name} onChange={updateField('name')} placeholder="e.g., Alex Reyes" />
					</div>
					<div className="form-group">
						<label className="label" htmlFor="title">Title</label>
						<input id="title" className="input" value={profile.title} onChange={updateField('title')} placeholder="e.g., Lead Property Specialist" />
					</div>
					<div className="form-group">
						<label className="label" htmlFor="philosophy">Philosophy</label>
						<textarea id="philosophy" className="textarea" value={profile.philosophy} onChange={updateField('philosophy')} placeholder="A short statement that reflects your approach…" />
					</div>
					<div className="two-col">
						<div className="form-group">
							<label className="label" htmlFor="phone">Phone (optional)</label>
							<input id="phone" className="input" value={profile.contact?.phone || ''} onChange={updateContact('phone')} placeholder="+63 9XX XXX XXXX" />
						</div>
						<div className="form-group">
							<label className="label" htmlFor="email">Email (optional)</label>
							<input id="email" className="input" type="email" value={profile.contact?.email || ''} onChange={updateContact('email')} placeholder="agent@propertypasalo.ph" />
						</div>
					</div>
				</div>
			</div>
			{error && <div className="error">{error}</div>}
			<div className="actions">
				<button onClick={save} className="save-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Agent Profile'}</button>
			</div>
		</div>
	);
}

