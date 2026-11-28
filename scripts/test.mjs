import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const commitSha = (process.env.GITHUB_SHA || '1234567890abcdef').slice(0, 7);

execFileSync(process.execPath, ['scripts/build.mjs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    GITHUB_SHA: commitSha
  }
});

const html = readFileSync('dist/index.html', 'utf8');
const requiredFragments = [
  '<!DOCTYPE html>',
  '<html lang="pl">',
  `<meta name="commit-sha" content="${commitSha}">`,
  '<strong id="commit-hash">',
  '<a id="app-link" href="app/#/login">'
];

const missingFragments = requiredFragments.filter((fragment) => !html.includes(fragment));

if (missingFragments.length > 0) {
  console.error('Test nie przeszedł. Brakujące fragmenty:');
  for (const fragment of missingFragments) {
    console.error(`- ${fragment}`);
  }
  process.exit(1);
}

console.log(`Testy przeszły: dist/index.html zawiera commit ${commitSha}.`);
