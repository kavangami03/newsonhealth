#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data.db'));

const UPDATES = [
	{
		slug: 'home_sections',
		label: 'Homepage',
		label_singular: 'Section',
		description: 'Editable text + media for each section of the homepage. One entry per section.',
		icon: 'house',
	},
	{
		slug: 'services',
		label: 'Services',
		label_singular: 'Service',
		description: 'Service cards shown on the homepage carousel and /services.',
		icon: 'briefcase-medical',
	},
	{
		slug: 'clinics',
		label: 'Clinics',
		label_singular: 'Clinic',
		description: 'Clinic locations shown on the homepage and /clinics.',
		icon: 'map-pin',
	},
	{
		slug: 'appointments',
		label: 'Appointments',
		label_singular: 'Appointment Option',
		description: 'Booking options on the homepage (Video, In-person, etc.).',
		icon: 'calendar',
	},
	{
		slug: 'clinicians',
		label: 'Clinicians',
		label_singular: 'Clinician',
		description: 'Doctor and specialist profiles shown on the homepage and /meet-the-team.',
		icon: 'stethoscope',
	},
	{
		slug: 'posts',
		label: 'Posts',
		label_singular: 'Post',
		description: 'Blog and advice articles.',
		icon: 'newspaper',
	},
	{
		slug: 'faqs',
		label: 'FAQs',
		label_singular: 'FAQ',
		description: 'Frequently asked questions shown on /faqs.',
		icon: 'question',
	},
	{
		slug: 'pages',
		label: 'Pages',
		label_singular: 'Page',
		description: 'Generic CMS pages rendered at /[slug].',
		icon: 'file-text',
	},
];

const stmt = db.prepare(
	'UPDATE _emdash_collections SET label = ?, label_singular = ?, description = ?, icon = ?, updated_at = ? WHERE slug = ?'
);

const tx = db.transaction(() => {
	const now = new Date().toISOString();
	for (const u of UPDATES) {
		const r = stmt.run(u.label, u.label_singular, u.description, u.icon, now, u.slug);
		console.log(' ', u.slug.padEnd(15), '->', u.label.padEnd(15), '(rows:', r.changes + ', icon:', u.icon + ')');
	}
});

tx();
db.close();
console.log('Labels updated.');
