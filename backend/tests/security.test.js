import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { it } from 'node:test';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return entry.isFile() ? [target] : [];
  }));
  return files.flat();
}

it('contains no hardcoded database credentials or secret values', async () => {
  const files = await sourceFiles(path.join(backendRoot, 'src'));
  files.push(path.join(backendRoot, 'package.json'));
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    assert.doesNotMatch(content, /mongodb(?:\+srv)?:\/\/[^\s'"<]+:[^\s'"<]+@/i, file);
    assert.doesNotMatch(content, /(?:password|secret)\s*[:=]\s*['"][^'"]{8,}['"]/i, file);
  }
});

it('does not add a frontend implementation', async () => {
  const repositoryRoot = path.resolve(backendRoot, '..');
  const entries = await readdir(repositoryRoot, { withFileTypes: true });
  assert.equal(entries.some((entry) => entry.isDirectory() && entry.name.toLowerCase() === 'frontend'), false);
});
