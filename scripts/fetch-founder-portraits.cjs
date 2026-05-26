#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const https = require('https');

const CANDIDATES = [
	{ key: 'f', url: 'https://cdn.prod.website-files.com/67a0ba9870fb47196d36d40f/67d973658cfa01316efaaefb_1.f.avif' },
	{ key: 'g', url: 'https://cdn.prod.website-files.com/67a0ba9870fb47196d36d40f/67d973b73cfb1b304f7d0b47_1.g.avif' },
	{ key: 'j', url: 'https://cdn.prod.website-files.com/67a0ba9870fb47196d36d40f/67d974a7ee13e101905ac2f9_1.j.avif' },
	{ key: 'n', url: 'https://cdn.prod.website-files.com/67a0ba9870fb47196d36d40f/67d975b7212df9b7e165f549_1.n.avif' },
	{ key: 'p', url: 'https://cdn.prod.website-files.com/67a0ba9870fb47196d36d40f/67d9768ca17b979a55417303_1.p.avif' },
	{ key: 'LOU', url: 'https://cdn.prod.website-files.com/67a0ba9870fb47196d36d40f/6829c28ada7dd9ac7eeaefa3_LOUsmaller.avif' },
	{ key: 'FRCP', url: 'https://cdn.prod.website-files.com/67a0ba9870fb47196d36d40f/67cac7a2d941f7852bc03331_FRCP.avif' },
];

const PREVIEW_DIR = path.join(__dirname, '..', '..', 'preview-portraits');
const STORE_DIR = path.join(__dirname, '..', 'src', 'images', 'founders');

fs.mkdirSync(PREVIEW_DIR, { recursive: true });

function download(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
					return resolve(download(res.headers.location));
				}
				if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
				const chunks = [];
				res.on('data', (c) => chunks.push(c));
				res.on('end', () => resolve(Buffer.concat(chunks)));
				res.on('error', reject);
			})
			.on('error', reject);
	});
}

(async () => {
	for (const c of CANDIDATES) {
		try {
			console.log(' fetching', c.key, '...');
			const buf = await download(c.url);
			// Save original AVIF
			fs.writeFileSync(path.join(STORE_DIR, `candidate-${c.key}.avif`), buf);
			// Convert to small preview JPG
			const jpg = await sharp(buf).resize({ width: 600 }).jpeg({ quality: 80 }).toBuffer();
			fs.writeFileSync(path.join(PREVIEW_DIR, `${c.key}.jpg`), jpg);
			console.log('   saved', c.key, '(' + buf.length + ' bytes)');
		} catch (e) {
			console.log('   FAILED', c.key, e.message);
		}
	}
	console.log('\nPreviews in', PREVIEW_DIR);
})();
