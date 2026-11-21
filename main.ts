// gta6-meme-x-01 entry: hand the X post to the gate.
//
// The post itself is the entry — the house reads it from X and the judge
// ranks the posts. This program's only job is to place POST.json, which names
// the post, into /output where the gate reads it. It sanity-checks the URL
// first: a malformed POST.json fails here, loudly, instead of silently at
// the gate.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address as the gate reads it: x.com or twitter.com, an optional
// www./mobile. prefix, a handle, /status/ and digits; a query or fragment
// after it is read past.
const POST_URL =
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+([?#].*)?$/;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const src = join(BOT_DIR, 'POST.json');
if (!existsSync(src)) fail(`POST.json not found in ${BOT_DIR}`);

let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(src, 'utf8'));
} catch (err) {
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

const url = (parsed as { url?: unknown }).url;
if (typeof url !== 'string' || !POST_URL.test(url)) {
  fail(`POST.json url is not an X post address: ${String(url)}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(src, join(OUTPUT_DIR, 'POST.json'));
console.log(`entry post: ${url}`);
