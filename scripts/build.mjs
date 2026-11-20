import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../index.html', import.meta.url);
const outputDirectory = new URL('../dist/', import.meta.url);
const outputPath = new URL('../dist/index.html', import.meta.url);

const commitSha = (process.env.GITHUB_SHA || 'localdev').slice(0, 7);
const html = readFileSync(sourcePath, 'utf8');

const requiredFragments = [
  '<!DOCTYPE html>',
  '<html lang="pl">',
  '<title>Szkielet Aplikacji</title>',
  'id="commit-hash"'
];

for (const fragment of requiredFragments) {
  if (!html.includes(fragment)) {
    throw new Error(`Brak wymaganego fragmentu w index.html: ${fragment}`);
  }
}

const commitMeta = `<meta name="commit-sha" content="${commitSha}">`;
const output = html.includes('<meta name="commit-sha"')
  ? html.replace(/<meta name="commit-sha" content="[^"]*">/, commitMeta)
  : html.replace('<title>', `${commitMeta}\n    <title>`);

if (!output.includes(commitMeta)) {
  throw new Error('Nie udało się dodać skrótu commita do dokumentu HTML.');
}

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, output);
console.log(`Zbudowano dist/index.html dla commita ${commitSha}`);
