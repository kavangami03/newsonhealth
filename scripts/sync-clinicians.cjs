#!/usr/bin/env node
/**
 * Sync clinicians collection with the source-site data:
 *  1. Ensure `image` field exists (column + _emdash_fields row).
 *  2. UPDATE the 8 existing clinicians with corrected credentials, bio, and image URL.
 *  3. INSERT 2 new clinicians (Dr Navjot Dhami, Dr Odinaka Nwodo).
 */

const Database = require('better-sqlite3');
const path = require('path');
const { ulid } = require('ulidx');

const db = new Database(path.join(__dirname, '..', 'data.db'));

const IMG = (key) => `https://cdn.prod.website-files.com/683c4dc78bd8a76ef51980b3/${key}`;

const CLINICIANS = [
	{
		slug: 'sally-mok',
		name: 'Dr Sally Mok',
		credentials: 'MB BS, MRCGP, DRCOG, DFSRH, MSc, BSc (Hons)',
		image: IMG('69f092f7cf2ebe17032270dc_f03c9575-5eb9-483a-a8e6-e21298924e25.jpg'),
		bio: 'Dr Sally Mok is a highly experienced GP with over 20 years of clinical experience. She is passionate about providing compassionate, evidence-based care and helping women navigate perimenopause and menopause with confidence through an individualised and holistic approach.',
		initials: 'SM',
	},
	{
		slug: 'zaakira-mahomed',
		name: 'Dr Zaakira Mahomed',
		credentials: 'MBChB, MRCGP, DFSRH',
		image: IMG('69f1d26f13dea6876a15fac2_Zaakira%20Mahomed.png'),
		bio: 'Dr Zaakira Mahomed is an experienced NHS GP with over 11 years of clinical practice and a strong background in women’s health. She is particularly passionate about improving access to care for women from ethnic minority communities, ensuring that support is inclusive and equitable for all.',
		initials: 'ZM',
	},
	{
		slug: 'anj-auckloo',
		name: 'Dr Anj Auckloo',
		credentials: 'MBChB, MRCGP, PGMEc',
		image: IMG('69c289bedd1aca8196773760_Screenshot%202026-03-24%20125509.png'),
		bio: 'Dr Anj Auckloo is a highly experienced GP with a dedicated passion for women’s health, menopause care and reducing health inequalities. Her work is grounded in the belief that informed women can make informed choices, leading to better long-term health.',
		initials: 'AA',
	},
	{
		slug: 'victoria-woodhouse',
		name: 'Dr Victoria Woodhouse',
		credentials: 'MBChB, MRCGP, DRCOG',
		image: IMG('698effdcb3ac55eb10d7515c_Victoria%20Woodhouse.jpg'),
		bio: 'Women’s health has always interested Dr Victoria Woodhouse. She gives her patients the very best evidence-based care and knowledge when assisting them in making informed choices during their menopause journey.',
		initials: 'VW',
	},
	{
		slug: 'sandra-ives',
		name: 'Dr Sandra Ives',
		credentials: 'MBChB, MRCGP, DFSRH',
		image: IMG('6972202458bcde69473c4c6b_Dr%20Sandra%20Ives.jpg'),
		bio: 'Dr Sandra Ives is a GP with over 10 years of clinical practice, combining broad primary care expertise with specialist knowledge in menopause care, dermatology and sexual health, supporting patients through sensitive and complex healthcare needs with compassion and professionalism.',
		initials: 'SI',
	},
	{
		slug: 'yusianmar-borrero',
		name: 'Dr Yusianmar Borrero',
		credentials: 'MBBS, MRCGP',
		image: IMG('697217046d6035014a4f9367_Screenshot%202026-01-22%20122421.png'),
		bio: 'Dr Yusianmar Borrero is a tireless advocate for women’s rights in medicine. Fluent in Spanish, Portuguese, and English, she brings a rich multicultural perspective to her clinical and advocacy work.',
		initials: 'YB',
	},
	{
		slug: 'helen-winpenny',
		name: 'Dr Helen Winpenny',
		credentials: 'MBBS, BSc, DFFP, DRCOG, MRCGP',
		image: IMG('6968d0bcc48c64aeeaf2b8ce_Screenshot%202026-01-15%20113050.png'),
		bio: 'Dr Helen Winpenny’s main clinical focus has always been women’s health, and she remains passionate about improving women’s health at all stages of their lives. She is especially interested in menopause, family planning and promoting healthy lifestyle measures. Dr Helen is committed to empowering women to help them make informed decisions about their healthcare.',
		initials: 'HW',
	},
	{
		slug: 'rebecca-cassin',
		name: 'Dr Rebecca Cassin',
		credentials: 'MRCGP, MBChB, BA (Hons)',
		image: IMG('691df656eafe7d5edf4a8926_Rebecca%20Cassin.jpg'),
		bio: 'Dr Rebecca Cassin combines her NHS GP role with her work at Newson Clinic. She is passionate about helping women navigate hormonal changes with both evidence-based medicine and a personalised approach.',
		initials: 'RC',
	},
	{
		slug: 'navjot-dhami',
		name: 'Dr Navjot Dhami',
		credentials: 'MBChB, DRCOG, MRCGP',
		image: IMG('691df3d69b1a6361540bd0cc_Navjot%20Dhami.jpg'),
		bio: 'Dr Navjot Dhami is a highly experienced GP with a special interest in menopause care and headache medicine. She is passionate about providing evidence-based, compassionate care tailored to each individual.',
		initials: 'ND',
	},
	{
		slug: 'odinaka-nwodo',
		name: 'Dr Odinaka Nwodo',
		credentials: 'MBChB, MRCSEd, MRCGP',
		image: IMG('691453c68bbc2734063d0506_Odi%20Nwodo.jpg'),
		bio: 'Dr Odinaka Nwodo is a GP who is committed to delivering personalised, evidence-based care and has a strong focus on reducing health inequalities in women’s health.',
		initials: 'ON',
	},
];

const tx = db.transaction(() => {
	// 1. Ensure `image` column on ec_clinicians
	const cols = db.prepare('PRAGMA table_info(ec_clinicians)').all().map((c) => c.name);
	if (!cols.includes('image')) {
		db.exec('ALTER TABLE ec_clinicians ADD COLUMN image TEXT');
		console.log('Added image column to ec_clinicians');
	}

	// 2. Ensure `image` field is registered for the clinicians collection
	const cliniciansColl = db.prepare("SELECT id FROM _emdash_collections WHERE slug='clinicians'").get();
	if (!cliniciansColl) throw new Error('clinicians collection not found');

	const hasImageField = db
		.prepare('SELECT 1 FROM _emdash_fields WHERE collection_id = ? AND slug = ?')
		.get(cliniciansColl.id, 'image');
	if (!hasImageField) {
		const maxSort = (
			db.prepare('SELECT MAX(sort_order) AS m FROM _emdash_fields WHERE collection_id = ?').get(cliniciansColl.id)
				?.m ?? 0
		) + 1;
		db.prepare(
			`INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, "unique", sort_order, searchable, translatable, created_at)
			VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 0, 0, ?)`
		).run(ulid(), cliniciansColl.id, 'image', 'Photo URL', 'string', 'TEXT', maxSort, new Date().toISOString());
		console.log('Registered `image` field on clinicians collection');
	}

	// 3. UPDATE / INSERT clinicians
	const now = new Date().toISOString();
	const update = db.prepare(
		`UPDATE ec_clinicians SET name = ?, credentials = ?, bio = ?, image = ?, initials = ?, updated_at = ? WHERE slug = ?`
	);
	const insert = db.prepare(
		`INSERT INTO ec_clinicians (id, slug, status, name, role, credentials, bio, image, initials, featured, created_at, updated_at, published_at, version)
		VALUES (?, ?, 'published', ?, 'GP Menopause Specialist', ?, ?, ?, ?, 0, ?, ?, ?, 1)`
	);

	for (const c of CLINICIANS) {
		const existing = db.prepare('SELECT id FROM ec_clinicians WHERE slug = ?').get(c.slug);
		if (existing) {
			update.run(c.name, c.credentials, c.bio, c.image, c.initials, now, c.slug);
			console.log(' update', c.slug);
		} else {
			insert.run(ulid(), c.slug, c.name, c.credentials, c.bio, c.image, c.initials, now, now, now);
			console.log(' insert', c.slug);
		}
	}
});

tx();
db.close();
console.log('\nClinicians sync complete.');
