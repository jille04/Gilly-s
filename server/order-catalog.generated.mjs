// Generated from public/script.js by node tools/sync-order-catalog.mjs.
const macroKeys = ['kcal', 'protein', 'carbs', 'fat'];
const BUSINESS = Object.freeze({
  name: "Gilly's",
  currency: 'PHP',
  locale: 'en-PH',
  mode: 'cash_on_pickup',
  pricesAreVatInclusive: false, // VAT registration and tax treatment are not verified.
  illustrativeVatRate: 0,
  illustrativeDeliveryFee: 0, // Gilly's does not arrange or charge for deliveries.
  illustrativeDeliveryFeePerDay: true,
  serviceCity: 'Metro Manila',
  timeSlots: ['10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '5:00 PM – 7:00 PM'],
  orderMinLeadDays: 2, // Meal plans / subscriptions; regular checkout has an earlier date option.
  illustrativeSameDayCutoffHour: 11,
  illustrativeSameDayEnabled: true,
  acceptsPayments: true, // Cash at pickup.
  supportEmail: 'support@example.invalid',
  offerDisclaimer: 'Package prices are estimates until confirmed',
});

// Configure these with verified store addresses before launch. The selector keeps
// pickup flexible across Metro Manila rather than locking every order to Taft.
const PICKUP_BRANCHES = Object.freeze([
  { id: 'manila', name: "Gilly's · Manila", area: 'Taft / Malate', address: 'Taft Avenue Building, 2222 Taft Avenue, Malate, City of Manila, Metro Manila 1004', mapQuery: '2222 Taft Avenue Malate Manila' },
  { id: 'makati', name: "Gilly's · Makati", area: 'Makati City', address: 'Makati City, Metro Manila', mapQuery: 'Makati City Metro Manila' },
  { id: 'quezon-city', name: "Gilly's · Quezon City", area: 'Quezon City', address: 'Quezon City, Metro Manila', mapQuery: 'Quezon City Metro Manila' },
  { id: 'taguig', name: "Gilly's · Taguig", area: 'Taguig / BGC', address: 'Taguig, Metro Manila', mapQuery: 'Taguig Metro Manila' },
  { id: 'pasig', name: "Gilly's · Pasig", area: 'Pasig City', address: 'Pasig City, Metro Manila', mapQuery: 'Pasig City Metro Manila' },
]);
const GILLYS_PICKUP_LOCATION = PICKUP_BRANCHES[0].address;
const pickupBranch = (id) => PICKUP_BRANCHES.find((branch) => branch.id === id) || PICKUP_BRANCHES[0];

const OFFERS = [
  {
    id: 'weekday',
    eyebrow: 'BEST FOR THE WORKWEEK',
    name: 'The Weekday Edit',
    subtitle: 'Five lovely lunches, all sorted',
    days: 5,
    periods: ['Lunch'],
    frequency: 'weekly',
    discountRate: 0.08,
    description: '5 lunches · Monday–Friday',
    tag: 'Most popular',
  },
  {
    id: 'seven',
    eyebrow: 'MORE OF THE GOOD STUFF',
    name: 'The Everyday Table',
    subtitle: 'Your lunch and dinner, planned',
    days: 7,
    periods: ['Lunch', 'Dinner'],
    frequency: 'weekly',
    discountRate: 0.12,
    description: '14 meals · 7 consecutive days',
    tag: '',
  },
  {
    id: 'monthly',
    eyebrow: 'A WHOLE MONTH, SIMPLIFIED',
    name: 'The Monthly Ritual',
    subtitle: 'A month of lunches to look forward to',
    days: 20,
    periods: ['Lunch'],
    frequency: 'monthly',
    discountRate: 0.15,
    description: '20 lunches · weekdays only',
    tag: '',
  },
];

const INGREDIENT_GROUPS = [
  {
    id: 'base',
    label: '01 · Choose your base',
    hint: 'Choose one. Swap it anytime',
    mode: 'single',
    required: true,
    options: [
      {
        id: 'brown-rice',
        label: 'Brown rice',
        detail: '1 cup',
        price: 35,
        kcal: 216,
        protein: 5,
        carbs: 45,
        fat: 2,
        allergens: [],
      },
      {
        id: 'white-rice',
        label: 'Steamed white rice',
        detail: '1 cup',
        price: 30,
        kcal: 205,
        protein: 4,
        carbs: 45,
        fat: 0,
        allergens: [],
      },
      {
        id: 'quinoa',
        label: 'Quinoa',
        detail: '1 cup',
        price: 75,
        kcal: 222,
        protein: 8,
        carbs: 39,
        fat: 4,
        allergens: [],
      },
      {
        id: 'greens',
        label: 'Fresh garden greens',
        detail: '80 g',
        price: 30,
        kcal: 18,
        protein: 2,
        carbs: 3,
        fat: 0,
        allergens: [],
      },
    ],
  },
  {
    id: 'protein',
    label: '02 · Pick your protein',
    hint: 'A satisfying bowl starts here',
    mode: 'single',
    required: true,
    options: [
      {
        id: 'chicken',
        label: 'Grilled chicken',
        detail: '100 g',
        price: 95,
        kcal: 165,
        protein: 31,
        carbs: 0,
        fat: 4,
        allergens: [],
      },
      {
        id: 'tofu',
        label: 'Golden tofu',
        detail: '120 g',
        price: 60,
        kcal: 112,
        protein: 13,
        carbs: 3,
        fat: 6,
        allergens: ['Soy'],
      },
      {
        id: 'beef',
        label: 'Beef sirloin',
        detail: '100 g',
        price: 180,
        kcal: 206,
        protein: 29,
        carbs: 0,
        fat: 10,
        allergens: [],
      },
      {
        id: 'salmon',
        label: 'Seared salmon',
        detail: '100 g',
        price: 190,
        kcal: 208,
        protein: 20,
        carbs: 0,
        fat: 13,
        allergens: ['Fish'],
      },
    ],
  },
  {
    id: 'vegetables',
    label: '03 · Add your vegetables',
    hint: 'Switch on as many as you like',
    mode: 'multiple',
    options: [
      {
        id: 'broccoli',
        label: 'Roasted broccoli',
        detail: '80 g',
        price: 40,
        kcal: 28,
        protein: 2,
        carbs: 6,
        fat: 0,
        allergens: [],
      },
      {
        id: 'kamote',
        label: 'Roasted kamote',
        detail: '100 g',
        price: 45,
        kcal: 90,
        protein: 2,
        carbs: 21,
        fat: 0,
        allergens: [],
      },
      {
        id: 'cabbage',
        label: 'Crunchy slaw',
        detail: '70 g',
        price: 25,
        kcal: 20,
        protein: 1,
        carbs: 4,
        fat: 0,
        allergens: [],
      },
      {
        id: 'cucumber',
        label: 'Fresh cucumber',
        detail: '70 g',
        price: 20,
        kcal: 11,
        protein: 1,
        carbs: 3,
        fat: 0,
        allergens: [],
      },
      {
        id: 'avocado',
        label: 'Avocado',
        detail: '60 g',
        price: 65,
        kcal: 96,
        protein: 1,
        carbs: 5,
        fat: 9,
        allergens: [],
      },
    ],
  },
  {
    id: 'sauce',
    label: '04 · Finish with a sauce',
    hint: 'One dressing, or none',
    mode: 'single',
    required: false,
    options: [
      {
        id: 'none',
        label: 'No dressing',
        detail: '',
        price: 0,
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        allergens: [],
      },
      {
        id: 'calamansi',
        label: 'Calamansi vinaigrette',
        detail: '1 serving',
        price: 20,
        kcal: 35,
        protein: 0,
        carbs: 2,
        fat: 3,
        allergens: [],
      },
      {
        id: 'peanut',
        label: 'Peanut sauce',
        detail: '1 serving',
        price: 25,
        kcal: 90,
        protein: 3,
        carbs: 5,
        fat: 7,
        allergens: ['Peanut', 'Soy'],
      },
      {
        id: 'sesame',
        label: 'Sesame glaze',
        detail: '1 serving',
        price: 25,
        kcal: 65,
        protein: 1,
        carbs: 7,
        fat: 4,
        allergens: ['Sesame', 'Soy'],
      },
    ],
  },
  {
    id: 'extras',
    label: '05 · A little something extra',
    hint: 'Completely optional',
    mode: 'multiple',
    options: [
      {
        id: 'egg',
        label: 'Soft-boiled egg',
        detail: '1 piece',
        price: 35,
        kcal: 78,
        protein: 6,
        carbs: 1,
        fat: 5,
        allergens: ['Egg'],
      },
      {
        id: 'edamame',
        label: 'Edamame',
        detail: '60 g',
        price: 39,
        kcal: 73,
        protein: 7,
        carbs: 5,
        fat: 3,
        allergens: ['Soy'],
      },
      {
        id: 'seeds',
        label: 'Toasted sesame seeds',
        detail: '10 g',
        price: 15,
        kcal: 57,
        protein: 2,
        carbs: 2,
        fat: 5,
        allergens: ['Sesame'],
      },
    ],
  },
];

const freshBuild = () => ({
  base: '',
  protein: '',
  vegetables: [],
  sauce: '',
  extras: [],
});

function buildSelection(build = freshBuild()) {
  const picked = [];
  const errors = [];
  for (const group of INGREDIENT_GROUPS) {
    const value = build[group.id];
    const ids = group.mode === 'multiple' ? (Array.isArray(value) ? value : []) : [value];
    const matches = group.options.filter((o) => ids.includes(o.id));
    if (group.required && matches.length === 0) errors.push(group.id);
    picked.push(...matches);
  }
  const nutrients = ['kcal', 'protein', 'carbs', 'fat'].reduce((result, key) => {
    result[key] = picked.reduce((sum, ingredient) => sum + ingredient[key], 0);
    return result;
  }, {});
  return {
    price: picked.reduce((sum, ingredient) => sum + ingredient.price, 0),
    nutrients,
    allergens: [...new Set(picked.flatMap((ingredient) => ingredient.allergens))],
    ingredients: picked,
    errors,
    valid: errors.length === 0,
  };
}

const meals = [
  {
    id: 'herb-chicken',
    name: 'Herb Garden Chicken',
    category: 'High Protein',
    price: 289,
    description: 'Juicy herb-grilled chicken, brown rice, crisp greens, and garden vegetables',
    img: 'https://images.unsplash.com/photo-1762631383628-77f92d18b184?auto=format&fit=crop&w=1100&q=82',
    kcal: 515,
    protein: 40,
    carbs: 52,
    fat: 16,
    allergens: [],
    removables: ['Brown rice', 'Leafy greens', 'Tomato', 'Cucumber'],
    popular: true,
  },
  {
    id: 'salmon-avocado',
    name: 'Sesame Salmon Bowl',
    category: 'Balanced',
    price: 349,
    description: 'Seared salmon, creamy avocado, quinoa, edamame, and sesame',
    img: 'https://images.unsplash.com/photo-1768326119213-e0ad875083a3?auto=format&fit=crop&w=1100&q=82',
    kcal: 560,
    protein: 35,
    carbs: 44,
    fat: 27,
    allergens: ['Fish', 'Soy', 'Sesame'],
    removables: ['Quinoa', 'Avocado', 'Edamame', 'Cucumber'],
    popular: true,
  },
  {
    id: 'korean-beef',
    name: 'Korean Beef & Rice',
    category: 'High Protein',
    price: 329,
    description: 'Tender savory beef, warm rice, bright slaw, and a sunny egg',
    img: 'https://images.unsplash.com/photo-1761064864532-1794a1f8f784?auto=format&fit=crop&w=1100&q=82',
    kcal: 630,
    protein: 38,
    carbs: 63,
    fat: 25,
    allergens: ['Soy', 'Egg', 'Sesame'],
    removables: ['White rice', 'Egg', 'Leafy greens'],
    popular: true,
  },
  {
    id: 'harvest-veggie',
    name: 'Golden Harvest Bowl',
    category: 'Plant-Based',
    price: 259,
    description: 'Roasted squash, chickpeas, crisp broccoli, and herbed quinoa',
    img: 'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?auto=format&fit=crop&w=1100&q=82',
    kcal: 455,
    protein: 17,
    carbs: 62,
    fat: 15,
    allergens: [],
    removables: ['Quinoa', 'Broccoli', 'Chickpeas'],
    popular: true,
  },
  {
    id: 'lemon-chicken',
    name: 'Lemon Pepper Chicken',
    category: 'High Protein',
    price: 299,
    description: 'Golden chicken, garden vegetables, fluffy rice, and citrus herbs',
    img: 'https://images.unsplash.com/photo-1775039983749-aa6003c8ecf9?auto=format&fit=crop&w=1100&q=82',
    kcal: 535,
    protein: 43,
    carbs: 49,
    fat: 18,
    allergens: [],
    removables: ['White rice', 'Broccoli', 'Cucumber'],
    popular: false,
  },
  {
    id: 'sesame-tofu',
    name: 'Sesame Glazed Tofu',
    category: 'Plant-Based',
    price: 269,
    description: 'Crisp tofu, crunchy rainbow greens, brown rice, and sesame glaze',
    img: 'https://images.unsplash.com/photo-1572448910681-3341d74893d2?auto=format&fit=crop&w=1100&q=82',
    kcal: 470,
    protein: 23,
    carbs: 57,
    fat: 17,
    allergens: ['Soy', 'Sesame'],
    removables: ['Brown rice', 'Edamame', 'Cucumber'],
    popular: false,
  },
  {
    id: 'calamansi-chicken',
    name: 'Calamansi Chicken Bowl',
    category: 'Balanced',
    price: 279,
    description:
      'Grilled chicken with calamansi vinaigrette, brown rice, crunchy slaw, and cucumber',
    img: 'https://images.pexels.com/photos/34463118/pexels-photo-34463118/free-photo-of-delicious-grilled-chicken-with-rice-and-vegetables.jpeg?auto=compress&cs=tinysrgb&w=1100',
    kcal: 480,
    protein: 36,
    carbs: 48,
    fat: 14,
    allergens: [],
    removables: ['Brown rice', 'Leafy greens', 'Cucumber'],
    popular: false,
  },
  {
    id: 'kamote-beef',
    name: 'Kamote & Beef Sirloin Bowl',
    category: 'High Protein',
    price: 339,
    description: 'Seared beef sirloin, roasted kamote, broccoli, and fresh garden greens',
    img: 'https://images.pexels.com/photos/7594969/pexels-photo-7594969.jpeg?auto=compress&cs=tinysrgb&w=1100',
    kcal: 590,
    protein: 36,
    carbs: 55,
    fat: 22,
    allergens: [],
    removables: ['Broccoli', 'Leafy greens'],
    popular: false,
  },
  {
    id: 'peanut-tofu',
    name: 'Peanut Tofu Rice Bowl',
    category: 'Plant-Based',
    price: 249,
    description: 'Golden tofu, steamed rice, crunchy slaw, and a light peanut sauce',
    img: 'https://images.pexels.com/photos/1484519/pexels-photo-1484519.jpeg?auto=compress&cs=tinysrgb&w=1100',
    kcal: 480,
    protein: 22,
    carbs: 54,
    fat: 20,
    allergens: ['Peanut', 'Soy'],
    removables: ['White rice', 'Cucumber', 'Leafy greens'],
    popular: false,
  },
];

const customBowl = {
  id: 'custom-bowl',
  name: 'Your Custom Bowl',
  category: 'Build Your Own',
  price: 0,
  description: 'Your ingredients, your way. A bowl built completely by you',
  img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=82',
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  allergens: [],
  removables: [],
  popular: false,
};

const mealById = (id) =>
  id === customBowl.id ? customBowl : meals.find((m) => m.id === id);

const portionOptions = [
  { id: 'regular', label: 'Regular', price: 0, multiplier: 1 },
  { id: 'hearty', label: 'Large portion · 25% more food', price: 55, multiplier: 1.25 },
];

const proteinOptions = [
  {
    id: 'as-is',
    label: 'As prepared',
    price: 0,
    macros: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  },
  {
    id: 'extra-chicken',
    label: 'Extra chicken',
    price: 69,
    macros: { kcal: 115, protein: 22, carbs: 0, fat: 2 },
  },
  {
    id: 'extra-tofu',
    label: 'Extra tofu',
    price: 49,
    macros: { kcal: 90, protein: 9, carbs: 2, fat: 5 },
  },
];

const toppings = [
  {
    id: 'avocado',
    label: 'Fresh avocado',
    price: 45,
    macros: { kcal: 85, protein: 1, carbs: 4, fat: 8 },
    allergens: [],
  },
  {
    id: 'egg',
    label: 'Soft-boiled egg',
    price: 35,
    macros: { kcal: 78, protein: 6, carbs: 1, fat: 5 },
    allergens: ['Egg'],
  },
  {
    id: 'edamame',
    label: 'Extra edamame',
    price: 39,
    macros: { kcal: 70, protein: 7, carbs: 6, fat: 3 },
    allergens: ['Soy'],
  },
];

const sauces = [
  {
    id: 'house',
    label: 'House dressing',
    price: 0,
    macros: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    allergens: [],
  },
  {
    id: 'citrus',
    label: 'Citrus vinaigrette',
    price: 0,
    macros: { kcal: -25, protein: 0, carbs: -1, fat: -2 },
    allergens: [],
  },
  {
    id: 'sesame',
    label: 'Creamy sesame',
    price: 15,
    macros: { kcal: 75, protein: 1, carbs: 2, fat: 7 },
    allergens: ['Sesame'],
  },
];

const removableNutrients = {
  'Brown rice': { kcal: 165, protein: 4, carbs: 35, fat: 1 },
  'White rice': { kcal: 175, protein: 3, carbs: 39, fat: 0 },
  'Leafy greens': { kcal: 14, protein: 1, carbs: 2, fat: 0 },
  Tomato: { kcal: 12, protein: 1, carbs: 3, fat: 0 },
  Cucumber: { kcal: 9, protein: 0, carbs: 2, fat: 0 },
  Quinoa: { kcal: 145, protein: 5, carbs: 26, fat: 2 },
  Avocado: { kcal: 90, protein: 1, carbs: 5, fat: 8 },
  Edamame: { kcal: 65, protein: 6, carbs: 5, fat: 3 },
  Egg: { kcal: 78, protein: 6, carbs: 1, fat: 5 },
  Broccoli: { kcal: 28, protein: 2, carbs: 6, fat: 0 },
  Chickpeas: { kcal: 95, protein: 5, carbs: 15, fat: 2 },
};

const defaultCustomization = () => ({
  // Free, included defaults are pre-selected so Add to cart is never a dead button.
  portion: 'regular',
  protein: 'as-is',
  sauce: 'house',
  toppings: [],
  removed: [],
  builder: freshBuild(),
});

const dateParts = (value) => value.split('-').map(Number);

const toISO = (dt) =>
  [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, '0'),
    String(dt.getDate()).padStart(2, '0'),
  ].join('-');

function datePlus(iso, days) {
  const [y, m, d] = dateParts(iso);
  const dt = new Date(y, m - 1, d, 12);
  dt.setDate(dt.getDate() + days);
  return toISO(dt);
}

function defaultStart() {
  return datePlus(toISO(new Date()), 3);
}

function createSchedule({ start, days, periods, weekdaysOnly = false }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || days < 1 || days > 31 || !periods?.length) {
    return [];
  }

  const results = [];
  let offset = 0;

  while (results.length < days * periods.length && offset < 90) {
    const iso = datePlus(start, offset++);
    const [y, m, d] = dateParts(iso);
    const dow = new Date(y, m - 1, d, 12).getDay();

    if (weekdaysOnly && (dow === 0 || dow === 6)) {
      continue;
    }

    for (const period of periods) {
      results.push({
        id: `${iso}|${period}`,
        date: iso,
        period,
      });
    }
  }

  return results;
}

function manilaNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const part = (name) => parts.find((x) => x.type === name)?.value;
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    hour: Number(part('hour')),
    minute: Number(part('minute')),
  };
}

function earliestCartDate(now = new Date()) {
  const current = manilaNow(now);
  // Demo policy only; never treat this as live fulfillment capacity.
  return BUSINESS.illustrativeSameDayEnabled &&
    current.hour < BUSINESS.illustrativeSameDayCutoffHour
    ? current.date
    : datePlus(current.date, 1);
}

function demoCartSlots(date, now = new Date()) {
  const current = manilaNow(now);
  if (!date || date < earliestCartDate(now)) return [];

  // Use the same configured windows for regular meals, meal plans, and
  // subscriptions. On the current Manila date, omit windows whose start time
  // has already passed; do not arbitrarily restrict same-day delivery to one.
  if (date !== current.date) return [...BUSINESS.timeSlots];
  const minutesNow = current.hour * 60 + current.minute;
  return BUSINESS.timeSlots.filter((slot) => {
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return false;
    const hours = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
    return hours * 60 + Number(match[2]) > minutesNow;
  });
}

function mealTotal(product, custom = {}) {
  if (product?.id === 'custom-bowl') return buildSelection(custom.builder);
  const portion = portionOptions.find((p) => p.id === custom.portion) || portionOptions[0];
  const protein = proteinOptions.find((p) => p.id === custom.protein) || proteinOptions[0];
  const sauce = sauces.find((s) => s.id === custom.sauce) || sauces[0];
  const additions = toppings.filter((t) => (custom.toppings || []).includes(t.id));

  const price =
    product.price +
    portion.price +
    protein.price +
    sauce.price +
    additions.reduce((sum, x) => sum + x.price, 0);

  const removed = (custom.removed || []).filter((x) => (product.removables || []).includes(x));

  const nutrients = {};
  for (const k of macroKeys) {
    nutrients[k] = Math.max(
      0,
      Math.round(
        product[k] * portion.multiplier +
        (protein.macros[k] || 0) +
        (sauce.macros[k] || 0) +
        additions.reduce((sum, x) => sum + (x.macros[k] || 0), 0) -
        removed.reduce(
          (sum, x) => sum + (removableNutrients[x]?.[k] || 0) * portion.multiplier,
          0,
        ),
      ),
    );
  }

  const allergens = [
    ...new Set([
      ...product.allergens,
      ...(sauce.allergens || []),
      ...additions.flatMap((t) => t.allergens || []),
    ]),
  ];

  if (custom.protein === 'extra-tofu') {
    allergens.push('Soy');
  }

  return {
    price,
    nutrients,
    allergens: [...new Set(allergens)],
  };
}

function pesoRound(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
function orderTaxParts(subtotal, discount = 0, treatment = 'unconfigured') {
  const afterDiscount = pesoRound(Math.max(0, Number(subtotal || 0) - Number(discount || 0)));
  if (treatment === 'vat-inclusive') {
    const vatableSales = pesoRound(afterDiscount / 1.12);
    return { taxTreatment: treatment, taxRate: 0.12,
      taxAmount: pesoRound(afterDiscount - vatableSales), vatableSales };
  }
  return { taxTreatment: treatment, taxRate: null, taxAmount: null, vatableSales: null };
}

function mealPriceDetails(product, custom = {}) {
  const selections = [];
  const notes = [];
  const c = custom || {};
  const addCharge = (label, option, prefix = '') => {
    if (!option) return;
    const price = Number(option.price) || 0;
    const fullName = prefix ? `${prefix}: ${option.label}` : option.label;
    if (price > 0) selections.push({ label: fullName, price });
    else notes.push(fullName);
  };
  if (product?.id === 'custom-bowl') {
    const build = c.builder || {};
    const groupLabels = {
      base: 'Base', protein: 'Protein', vegetables: 'Vegetable',
      sauce: 'Sauce', extras: 'Extra',
    };
    for (const group of INGREDIENT_GROUPS) {
      const value = build[group.id];
      const selected = group.mode === 'multiple'
        ? (Array.isArray(value) ? value : []) : [value];
      for (const option of group.options.filter((o) => selected.includes(o.id))) {
        addCharge(option.label, option, groupLabels[group.id] || 'Ingredient');
      }
    }
    return { baseLabel: 'Build Your Own Bowl', basePrice: 0, selections, notes };
  }

  const portion = portionOptions.find((o) => o.id === c.portion);
  const protein = proteinOptions.find((o) => o.id === c.protein);
  const sauce = sauces.find((o) => o.id === c.sauce);
  if (portion) addCharge(portion.label, portion, 'Portion');
  if (protein) addCharge(protein.label, protein, 'Protein');
  if (sauce) addCharge(sauce.label, sauce, 'Dressing');
  for (const topping of toppings.filter((o) => (c.toppings || []).includes(o.id))) {
    addCharge(topping.label, topping, 'Add-on');
  }
  for (const removed of (c.removed || []).filter((name) => (product?.removables || []).includes(name))) {
    notes.push(`Removed: ${removed} (no price change)`);
  }
  return { baseLabel: 'Base meal', basePrice: Number(product?.price) || 0, selections, notes };
}
export { BUSINESS, PICKUP_BRANCHES, OFFERS, INGREDIENT_GROUPS, mealById, mealTotal, mealPriceDetails,
  defaultCustomization, portionOptions, proteinOptions, toppings, sauces, createSchedule, datePlus,
  manilaNow, demoCartSlots, pesoRound, orderTaxParts };
