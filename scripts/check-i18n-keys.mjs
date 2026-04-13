import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '..', 'messages');

const de = JSON.parse(readFileSync(join(messagesDir, 'de.json'), 'utf-8'));
const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf-8'));
const es = JSON.parse(readFileSync(join(messagesDir, 'es.json'), 'utf-8'));

/**
 * Recursively flatten an object to dot-notation keys.
 * Arrays are treated as a single key (not expanded per-index).
 *
 * @param {Record<string, unknown>} obj
 * @param {string} prefix
 * @returns {string[]}
 */
function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      // Arrays are treated as a terminal key (not walked further)
      keys.push(fullKey);
    } else if (value !== null && typeof value === 'object') {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const deKeys = new Set(flattenKeys(de));
const locales = [
  { name: 'en', data: en },
  { name: 'es', data: es },
];

let totalMissing = 0;

for (const { name, data } of locales) {
  const localeKeys = new Set(flattenKeys(data));
  const missingKeys = [...deKeys].filter((key) => !localeKeys.has(key));

  if (missingKeys.length > 0) {
    for (const key of missingKeys) {
      console.warn(`[i18n] ${name}: missing key "${key}"`);
    }
  }

  console.log(`[i18n] ${name}: ${missingKeys.length} missing key(s)`);
  totalMissing += missingKeys.length;
}

// Exit 0 — warnings only; not a build blocker (visibility only)
process.exit(0);
