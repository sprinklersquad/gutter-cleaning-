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
const base = { area: '2400', stories: '2', zip: '80915', walkout: false, history: 'older', trees: 'heavy', debris: 'unknown', downspouts: '2', guards: false, access: false, over40: false };
const cases = [
  ['Separate debris and tree line items', {}, 400],
  ['History estimates unseen debris only', { history: 'neglected' }, 425],
  ['Ordinary maintenance', { history: 'annual', trees: 'light', downspouts: '0' }, 280],
  ['Walkout increases height band', { walkout: true }, 480],
  ['Guards require review', { guards: true }, null],
  ['Over 40 feet requires review', { over40: true }, null],
  ['Difficult access requires review', { access: true }, null],
  ['More than six blockages require review', { downspouts: 'many' }, null],
  ['Unknown blockages are not silently charged', { downspouts: 'unknown' }, 330],
  ['Known normal buildup overrides old history', { history: 'neglected', debris: 'normal' }, 375],
  ['Known heavy buildup replaces history estimate', { history: 'neglected', debris: 'heavy' }, 410],
  ['Very heavy buildup', { debris: 'severe' }, 435],
];
for (const [name, patch, price] of cases) {
  const quote = context.calculateQuote({ ...base, ...patch });
  assert.equal(quote.price, price, name);
  if (price === null) {
    assert.ok(quote.review.length, name);
    assert.equal(quote.breakdown.length, 0, 'Custom reviews must not display invented charges');
    assert.equal(Object.keys(quote.plans).length, 0, 'Custom review must not promise maintenance prices');
  } else {
    assert.equal(quote.breakdown.reduce((sum, row) => sum + row.amount, 0), price, 'Visible amounts must sum to the accepted price');
    assert.ok(quote.breakdown.every(row => row.amount >= 0), 'Breakdown must never have negative fees');
    assert.deepEqual(Array.from(quote.breakdown.slice(0, 4), row => row.label), ['House minimum fee', 'Additional house size', 'Debris buildup', 'Tree coverage']);
  }
}
const sample = context.calculateQuote(base);
assert.deepEqual(Array.from(sample.breakdown, row => row.amount), [175, 105, 25, 25, 70]);
assert.equal(sample.breakdown[2].detail, 'Based on cleaning 1–2 years ago');
assert.equal(sample.routinePrice, 305, 'Maintenance excludes initial buildup and today’s blocked downspouts');
assert.equal(sample.plans.annual.perVisit, 290);
assert.equal(sample.plans.annual.annualTotal, 290);
assert.equal(sample.plans.annual.annualSavings, 15);
assert.equal(sample.plans.twice.perVisit, 275);
assert.equal(sample.plans.twice.annualTotal, 550);
assert.equal(sample.plans.twice.annualSavings, 60);
const minimumOnly = context.calculateQuote({ ...base, area: '500', stories: '1', history: 'annual', trees: 'light', downspouts: '0' });
assert.equal(minimumOnly.price, 149);
assert.equal(minimumOnly.breakdown[1].amount, 0, 'Minimum-only job must not have a fake size adjustment');
for (const [stories, minimum] of [['1', 149], ['2', 175], ['3', 250]]) {
  const quote = context.calculateQuote({ ...base, area: '500', stories, history: 'annual', trees: 'light', downspouts: '0' });
  assert.equal(quote.price, minimum, 'Exact advertised minimum must not round up');
  assert.equal(quote.breakdown[0].amount, minimum);
  assert.deepEqual(Array.from(quote.breakdown, row => row.amount), [minimum, 0, 0, 0]);
  assert.equal(quote.plans.annual.perVisit, minimum, 'Annual discount must respect the minimum');
  assert.equal(quote.plans.twice.perVisit, minimum, 'Spring/fall discount must respect the minimum');
  assert.equal(quote.plans.twice.annualSavings, 0, 'No savings claim when the floor prevents a discount');
}
const minimumWithExtra = context.calculateQuote({ ...base, area: '500', stories: '1', downspouts: '1' });
assert.equal(minimumWithExtra.price, 234, 'Exact minimum plus distinct debris/tree/downspout fees');
assert.deepEqual(Array.from(minimumWithExtra.breakdown, row => row.amount), [149, 0, 25, 25, 35]);
const treeDriven = context.calculateQuote({ ...base, history: 'annual' });
assert.ok(treeDriven.breakdown.some(row => row.label === 'Tree coverage' && row.amount === 25));
for (const area of ['501', '1450', '2201', '9999']) {
  for (const stories of ['1', '1.5', '2', '3']) {
    const quote = context.calculateQuote({ ...base, area, stories });
    assert.equal(quote.breakdown.reduce((sum, row) => sum + row.amount, 0), quote.price);
    for (const plan of Object.values(quote.plans)) {
      assert.ok(plan.perVisit >= quote.breakdown[0].amount, 'Plan must preserve the property minimum');
      assert.ok(plan.perVisit <= quote.routinePrice, 'Plan must not cost more than standard maintenance');
      assert.ok(plan.perVisit >= quote.routinePrice * (1 - plan.discount), 'Actual savings cannot exceed the advertised maximum');
      assert.equal(plan.annualTotal, plan.perVisit * plan.visits);
      assert.equal(plan.annualSavings, (quote.routinePrice - plan.perVisit) * plan.visits);
    }
  }
}
for (const patch of [{ zip: '809' }, { area: '0' }, { stories: '4' }, { trees: 'invalid' }, { debris: 'invalid' }, { downspouts: '99' }]) {
  assert.throws(() => context.calculateQuote({ ...base, ...patch }));
}
assert.ok(embed.includes('data-price-breakdown'), 'Customer-friendly dollar breakdown must be present');
assert.ok(!embed.includes('Debris allowance'), 'Do not restore confusing customer terminology');
assert.ok(!embed.includes('lengthLow'), 'Customer price ranges must stay removed');
assert.ok(embed.includes('data-plans'), 'Maintenance comparison must be present');
assert.equal((embed.match(/<svg viewBox=/g) || []).length, 4, 'Four service icons must be present');
console.log(`${cases.length} pricing scenarios, 16 breakdown/plan rounding scenarios, exact story minimums and extras, annual/seasonal totals and savings, 6 invalid-input cases, icons, preview synchronization, and script syntax passed.`);
