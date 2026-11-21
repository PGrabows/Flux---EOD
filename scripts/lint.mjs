import { readFileSync } from 'node:fs';

const files = [
  'index.html',
  'scripts/build.mjs',
  'scripts/test.mjs',
  'scripts/lint.mjs'
];

const failures = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) {
      failures.push(`${file}:${index + 1}: spacja lub tabulator na końcu linii`);
    }

    if (line.includes('\t')) {
      failures.push(`${file}:${index + 1}: użyj spacji zamiast tabulatora`);
    }
  });
}

const html = readFileSync('index.html', 'utf8');

if (!html.startsWith('<!DOCTYPE html>')) {
  failures.push('index.html:1: dokument musi zaczynać się od <!DOCTYPE html>');
}

if (!html.includes('<html lang="pl">')) {
  failures.push('index.html: brak deklaracji <html lang="pl">');
}

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicatedIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

for (const id of duplicatedIds) {
  failures.push(`index.html: zduplikowany identyfikator "${id}"`);
}

if (failures.length > 0) {
  console.error('Lint nie przeszedł:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Lint przeszedł dla ${files.length} plików.`);
