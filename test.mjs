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
  if (price === null) {
    assert.ok(quote.review.length, name);
    assert.equal(quote.breakdown.length, 0, 'Custom reviews must not display invented charges');
  } else {
    assert.equal(quote.breakdown.reduce((sum, row) => sum + row.amount, 0), price, 'Visible amounts must sum to the accepted price');
    assert.ok(quote.breakdown.every(row => row.amount > 0), 'Hide zero-value adjustments');
  }
}
const sample = context.calculateQuote(base);
assert.deepEqual(Array.from(sample.breakdown, row => row.amount), [175, 105, 25, 70]);
assert.equal(sample.breakdown[2].detail, 'Last cleaned 1–2 years ago');
const minimumOnly = context.calculateQuote({ ...base, area: '500', stories: '1', history: 'annual', trees: 'light', downspouts: '0' });
assert.equal(minimumOnly.price, 149);
assert.equal(minimumOnly.breakdown.length, 1, 'Minimum-only job must not have a fake size adjustment');
for (const [stories, minimum] of [['1', 149], ['2', 175], ['3', 250]]) {
  const quote = context.calculateQuote({ ...base, area: '500', stories, history: 'annual', trees: 'light', downspouts: '0' });
  assert.equal(quote.price, minimum, 'Exact advertised minimum must not round up');
  assert.equal(quote.breakdown[0].amount, minimum);
  assert.equal(quote.breakdown.length, 1);
}
const minimumWithExtra = context.calculateQuote({ ...base, area: '500', stories: '1', downspouts: '1' });
assert.equal(minimumWithExtra.price, 209, 'Minimum plus $25 cleaning and $35 downspout must remain exact');
assert.deepEqual(Array.from(minimumWithExtra.breakdown, row => row.amount), [149, 25, 35]);
const treeDriven = context.calculateQuote({ ...base, history: 'annual' });
assert.ok(treeDriven.breakdown.some(row => row.detail === 'Heavy tree coverage or pine needles'));
for (const area of ['501', '1450', '2201', '9999']) {
  for (const stories of ['1', '1.5', '2', '3']) {
    const quote = context.calculateQuote({ ...base, area, stories });
    assert.equal(quote.breakdown.reduce((sum, row) => sum + row.amount, 0), quote.price);
  }
}
for (const patch of [{ zip: '809' }, { area: '0' }, { stories: '4' }, { trees: 'invalid' }, { downspouts: '99' }]) {
  assert.throws(() => context.calculateQuote({ ...base, ...patch }));
}
assert.ok(embed.includes('data-price-breakdown'), 'Customer-friendly dollar breakdown must be present');
assert.ok(!embed.includes('Debris allowance'), 'Do not restore confusing customer terminology');
assert.ok(!embed.includes('lengthLow'), 'Customer price ranges must stay removed');
console.log(`${cases.length} pricing scenarios, 16 breakdown rounding scenarios, 3 exact story minimums, exact minimum plus extras, tree-driven breakdowns, 5 invalid-input cases, preview synchronization, and script syntax passed.`);
