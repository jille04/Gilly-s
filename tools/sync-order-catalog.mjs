import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../public/script.js', import.meta.url), 'utf8');
const target = new URL('../server/order-catalog.generated.mjs', import.meta.url);
const blocks = [
  ['const BUSINESS =', '// Meal plan presets'],
  ['const INGREDIENT_GROUPS =', '// Real, remotely hosted food photography'],
  ['function buildSelection(', '/** Mifflin–St Jeor'],
  ['const meals =', '// js/core/schedule.js'],
  ['const dateParts =', 'function displayDate('],
  ['function manilaNow(', '// js/core/calculations.js'],
  ['function mealTotal(', 'const cartSignature ='],
  ['function pesoRound(', 'function orderTaxLines('],
  ['function mealPriceDetails(', 'function receiptItemPriceDetails('],
];
const definitions = blocks.map(([from, to]) => {
  const start = source.indexOf(from);
  const end = source.indexOf(to, start);
  if (start < 0 || end < 0) throw new Error('Cannot locate catalog block ' + from);
  return source.slice(start, end).trim();
}).join('\n\n').replace('treatment = gillysTaxTreatment()', "treatment = 'unconfigured'");

const output = [
  '// Generated from public/script.js by node tools/sync-order-catalog.mjs.',
  "const macroKeys = ['kcal', 'protein', 'carbs', 'fat'];",
  definitions,
  'export { BUSINESS, PICKUP_BRANCHES, OFFERS, INGREDIENT_GROUPS, mealById, mealTotal, mealPriceDetails,',
  '  defaultCustomization, portionOptions, proteinOptions, toppings, sauces, createSchedule, datePlus,',
  '  manilaNow, demoCartSlots, pesoRound, orderTaxParts };',
  '',
].join('\n');

if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== output) throw new Error('The server catalog must be regenerated.');
} else {
  await writeFile(target, output);
}
