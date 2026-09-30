// Gera os PNGs do manifest a partir dos SVGs em static/icones (rodar com `npm run icones`).
// Os PNGs são commitados: o build não depende do sharp.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const pasta = fileURLToPath(new URL('../static/icones/', import.meta.url));

const saidas = [
	{ origem: 'icone.svg', destino: 'icone-192.png', tamanho: 192 },
	{ origem: 'icone.svg', destino: 'icone-512.png', tamanho: 512 },
	{ origem: 'icone-maskable.svg', destino: 'icone-maskable-512.png', tamanho: 512 }
];

for (const { origem, destino, tamanho } of saidas) {
	const svg = await readFile(pasta + origem);
	await sharp(svg, { density: 72 * (tamanho / 512) * 4 })
		.resize(tamanho, tamanho)
		.png({ compressionLevel: 9 })
		.toFile(pasta + destino);
	console.log(`${destino} (${tamanho}x${tamanho}) a partir de ${origem}`);
}
