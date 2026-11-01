import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const embed = await readFile(new URL('./embed.html', import.meta.url), 'utf8');
const preview = await readFile(new URL('./index.html', import.meta.url), 'utf8');
assert.ok(preview.includes(embed), 'Preview must contain the current component');
const script = embed.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'Component must include its script');
new vm.Script(script);
const context = {};
vm.runInNewContext(script.slice(script.indexOf('const CONFIG'), script.indexOf('// ENGINE END')) + '\nglobalThis.calculateQuote = calculate;', context);
const base = { area: '2400', stories: '2', zip: '80915', walkout: false, history: 'older', trees: 'heavy', downspouts: '2', guards: false, access: false, over40: false };
const cases = [
  ['Inclusive price', {}, 375],
  ['History and tree charges do not stack', { history: 'neglected' }, 400],
  ['Ordinary maintenance', { history: 'annual', trees: 'light', downspouts: '0' }, 280],
  ['Walkout increases height band', { walkout: true }, 455],
  ['Guards require review', { guards: true }, null],
  ['Over 40 feet requires review', { over40: true }, null],
  ['Difficult access requires review', { access: true }, null],
  ['More than six blockages require review', { downspouts: 'many' }, null],
  ['Unknown blockages are not silently charged', { downspouts: 'unknown' }, 305],
];
for (const [name, patch, price] of cases) {
  const quote = context.calculateQuote({ ...base, ...patch });
  assert.equal(quote.price, price, name);
  if (price === null) assert.ok(quote.review.length, name);
}
for (const patch of [{ zip: '809' }, { area: '0' }, { stories: '4' }, { trees: 'invalid' }, { downspouts: '99' }]) {
  assert.throws(() => context.calculateQuote({ ...base, ...patch }));
}
assert.ok(!embed.includes('data-breakdown'), 'Old customer surcharge breakdown must stay removed');
assert.ok(!embed.includes('lengthLow'), 'Customer price ranges must stay removed');
console.log(`${cases.length} pricing scenarios, 5 invalid-input cases, preview synchronization, and script syntax passed.`);
