(function () {
  'use strict';

// js/config.js
// src/config.js
/**
 * All commercial values are illustrative, not approved Gilly's business terms.
 */
const BUSINESS = Object.freeze({
  name: "Gilly's",
  currency: 'PHP',
  locale: 'en-PH',
  mode: 'cash_on_pickup',
  pricesAreVatInclusive: false, // VAT registration and tax treatment are not verified.
  illustrativeVatRate: 0,
  serviceCity: 'Metro Manila',
  timeSlots: ['10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '5:00 PM – 7:00 PM'],
  maxCartLines: 100,
  maxLineQuantity: 99,
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

// Meal plan presets (illustrative), modeled on goal-first, calorie-tier ordering flows.
const PLAN_PROGRAMS = [
  { id: 'balanced', name: 'Balanced', note: 'A little of everything' },
  { id: 'protein', name: 'High Protein', note: 'Protein-first picks' },
  { id: 'light', name: 'Light', note: 'Lighter, lower-kcal picks' },
];
const CALORIE_TIERS = [1200, 1500, 1800, 2000];

// js/core/builder.js
// src/core/builder.js
/**
 * Illustrative ingredient catalog. Replace with approved kitchen costs, weights,
 * recipe nutrients, allergen controls, and availability before production use.
 * Values below are demo pesos and estimated macronutrients per serving.
 */
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

// Real, remotely hosted food photography for the build-your-bowl catalog.
// These are decorative because each adjacent card repeats the ingredient name.
const BUILDER_INGREDIENT_IMAGES = {
  'brown-rice': 'https://images.unsplash.com/photo-1536304993881-ff9e9e8d5b0f?auto=format&fit=crop&w=700&q=82',
  'white-rice': 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=700&q=82',
  quinoa: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=82',
  greens: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=82',
  chicken: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=82',
  tofu: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=82',
  beef: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=82',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=82',
  broccoli: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=700&q=82',
  kamote: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=700&q=82',
  cabbage: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=700&q=82',
  cucumber: 'https://images.unsplash.com/photo-1604977046806-87b43d958d5b?auto=format&fit=crop&w=700&q=82',
  avocado: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=82',
  none: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=82',
  calamansi: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=700&q=82',
  peanut: 'https://aem.sobeys.com/adobe/dynamicmedia/deliver/dm-aid--923f897d-5446-428f-94aa-8770a3aabd3e/sauce-chinoise-1160x650-bs007358-pub-67290-01.jpg.webp?preferwebp=true',
  sesame: 'https://images.unsplash.com/photo-1572448910681-3341d74893d2?auto=format&fit=crop&w=700&q=82',
  egg: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3f59?auto=format&fit=crop&w=700&q=82',
  edamame: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=700&q=82',
  seeds: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=700&q=82',
};

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

/** Mifflin–St Jeor adult BMR and estimated TDEE. Not a clinical prescription. */
function dailyCalorieEstimate({ age, height, weight, sex, activity, goal }) {
  const years = Number(age);
  const cm = Number(height);
  const kg = Number(weight);
  const factor = Number(activity);
  const errors = {};
  if (!Number.isInteger(years) || years < 18 || years > 100) errors.age = 'Enter an age from 18 to 100.';
  if (!Number.isFinite(cm) || cm < 100 || cm > 250) errors.height = 'Enter a height from 100 to 250 cm.';
  if (!Number.isFinite(kg) || kg < 25 || kg > 350) errors.weight = 'Enter a weight from 25 to 350 kg.';
  if (!['male', 'female'].includes(sex)) errors.sex = 'Choose a formula setting.';
  if (![1.2, 1.375, 1.55, 1.725, 1.9].includes(factor)) errors.activity = 'Choose your activity level.';
  if (!['maintain', 'loss', 'gain'].includes(goal)) errors.goal = 'Choose your goal.';
  if (Object.keys(errors).length) {
    return {
      valid: false,
      errors,
      message: 'Check the highlighted fields and try again.',
    };
  }
  const bmr = 10 * kg + 6.25 * cm - 5 * years + (sex === 'male' ? 5 : -161);
  const maintenance = Math.round(bmr * factor);
  const difference = goal === 'loss' ? -300 : goal === 'gain' ? 300 : 0;
  return {
    valid: true,
    bmr: Math.round(bmr),
    maintenance,
    target: Math.max(1200, maintenance + difference),
    mealReference: Math.round(Math.max(1200, maintenance + difference) / 3),
    capped: maintenance + difference < 1200,
  };
}

// js/data.js
// src/data.js
/**
 * Menu information; calories and macros are illustrative estimates.
 */
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

// js/core/schedule.js
// src/core/schedule.js
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

function defaultStart(now = new Date()) {
  return datePlus(manilaNow(now).date, BUSINESS.orderMinLeadDays);
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

function displayDate(iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  const [y, m, d] = dateParts(iso);
  return new Intl.DateTimeFormat('en-PH', opts).format(new Date(y, m - 1, d, 12));
}

function groupByDay(schedule) {
  const grouped = {};
  for (const slot of schedule) {
    (grouped[slot.date] ??= []).push(slot);
  }
  return Object.entries(grouped);
}

/** Pickup windows use the restaurant’s Manila time. */
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
  // has already passed; do not arbitrarily restrict same-day pickup to one.
  if (date !== current.date) return [...BUSINESS.timeSlots];
  const minutesNow = current.hour * 60 + current.minute;
  return BUSINESS.timeSlots.filter((slot) => {
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return false;
    const hours = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
    return hours * 60 + Number(match[2]) > minutesNow;
  });
}

// js/core/calculations.js
// src/core/calculations.js
const macroKeys = ['kcal', 'protein', 'carbs', 'fat'];

const money = (value) =>
  new Intl.NumberFormat(BUSINESS.locale, {
    style: 'currency',
    currency: BUSINESS.currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

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

const cartSignature = (item) => JSON.stringify([item.productId, item.custom]);

function addOrIncrement(items, incoming) {
  const match = items.find(item => cartSignature(item) === cartSignature(incoming));
  if (!match && items.length >= BUSINESS.maxCartLines) return items;
  if (match && match.quantity + incoming.quantity > BUSINESS.maxLineQuantity) return items;
  return match
    ? items.map(item => item.id === match.id ? { ...item, quantity: item.quantity + incoming.quantity } : item)
    : [...items, incoming];
}

function cartSummary(items) {
  const subtotal = items.reduce((sum, it) => {
    const m = mealById(it.productId);
    return sum + (m ? mealTotal(m, it.custom).price * it.quantity : 0);
  }, 0);

  return { subtotal, total: subtotal };
}

function periodSlots(schedule, assignments) {
  return schedule.map((slot) => ({
    ...slot,
    selection: assignments[slot.id] || null,
  }));
}

function scheduledSummary(
  schedule,
  assignments,
  discountRate = 0,
) {
  const selected = periodSlots(schedule, assignments).filter((slot) => slot.selection);

  const value = selected.reduce((sum, slot) => {
    const meal = mealById(slot.selection.productId);
    return sum + (meal ? mealTotal(meal, slot.selection.custom).price : 0);
  }, 0);

  const savings = Math.round(value * discountRate * 100) / 100;

  return {
    value,
    savings,
    total: value - savings,
    filled: selected.length,
    count: schedule.length,
  };
}

function vatComponent(inclusiveAmount, vatRate = BUSINESS.illustrativeVatRate) {
  return Math.round(((inclusiveAmount * vatRate) / (1 + vatRate)) * 100) / 100;
}

/** Estimated kcal per pickup date for a scheduled plan. */
function dailyKcal(schedule, assignments) {
  const days = {};
  for (const slot of schedule) {
    days[slot.date] ??= 0;
    const sel = assignments[slot.id];
    const meal = sel ? mealById(sel.productId) : null;
    if (meal) days[slot.date] += mealTotal(meal, sel.custom).nutrients.kcal || 0;
  }
  return days;
}

/** Days whose planned kcal is above the daily target (target <= 0 means no target). */
function overTargetDays(byDay, target) {
  const t = Number(target);
  if (!(t > 0)) return [];
  return Object.entries(byDay)
    .filter(([, kcal]) => kcal > t)
    .map(([date, kcal]) => ({ date, kcal, over: kcal - t }));
}

const PERIOD_SHARE = { Breakfast: 0.25, Lunch: 0.4, Dinner: 0.35 };

// js/core/store.js
// src/core/store.js
// Account drafts are isolated by email. Guest drafts are limited to the current tab.
const ACCOUNT_DRAFT_PREFIX = 'gillys2-account-draft-v1:';
const GUEST_DRAFT_KEY = 'gillys2-guest-draft-v1';

const fresh = () => ({
  cart: [],
  plan: {
    days: 0,
    start: '',
    periods: [],
    target: 0,
    program: '',
    assignments: {},
  },
  subscription: {
    offerId: '',
    start: '',
    target: 0,
    assignments: {},
  },
  checkout: {
    name: '',
    phone: '',
    date: '',
    instructions: '',
    time: '',
    pickupBranch: 'manila',
    accountEmail: null,
  },
});

function normalizeDraft(candidate) {
  const defaults = fresh();
  if (!candidate || typeof candidate !== 'object') return defaults;
  const plan = { ...defaults.plan, ...(candidate.plan || {}) };
  const subscription = { ...defaults.subscription, ...(candidate.subscription || {}) };
  if (!plan.assignments || typeof plan.assignments !== 'object' || Array.isArray(plan.assignments)) plan.assignments = {};
  if (!subscription.assignments || typeof subscription.assignments !== 'object' || Array.isArray(subscription.assignments)) subscription.assignments = {};
  // Older versions could save prefilled form choices even when no one selected them.
  if (!Object.keys(plan.assignments).length && !Number(plan.target) &&
      plan.days === 5 && plan.program === 'balanced' &&
      JSON.stringify(plan.periods) === JSON.stringify(['Breakfast', 'Lunch', 'Dinner'])) {
    Object.assign(plan, defaults.plan);
  }
  if (!Object.keys(subscription.assignments).length && !Number(subscription.target) &&
      subscription.offerId === 'weekday') {
    Object.assign(subscription, defaults.subscription);
  }
  if (plan.start && plan.start < defaultStart()) plan.start = '';
  if (subscription.start && subscription.start < defaultStart()) subscription.start = '';
  return {
    ...defaults,
    cart: Array.isArray(candidate.cart) ? candidate.cart
      .filter(item => item && typeof item.id === 'string' && mealById(item.productId) && item.custom)
      .slice(0, BUSINESS.maxCartLines)
      .map(item => ({ ...item, quantity: Math.min(BUSINESS.maxLineQuantity, Math.max(1, Math.trunc(Number(item.quantity)) || 1)) }))
      : [],
    plan,
    subscription,
    checkout: defaults.checkout, // Pickup details belong to the current order.
  };
}

function draftStorageKey(email) {
  return `${ACCOUNT_DRAFT_PREFIX}${String(email || '').trim().toLowerCase()}`;
}

function loadAccountDraft(email) {
  try {
    const raw = globalThis.localStorage?.getItem(draftStorageKey(email));
    return raw ? normalizeDraft(JSON.parse(raw)) : fresh();
  } catch {
    return fresh();
  }
}

function loadGuestDraft() {
  try {
    return normalizeDraft(JSON.parse(globalThis.sessionStorage?.getItem(GUEST_DRAFT_KEY) || 'null'));
  } catch {
    return fresh();
  }
}

function clearGuestDraft() {
  try { globalThis.sessionStorage?.removeItem(GUEST_DRAFT_KEY); } catch {}
}

const store = loadGuestDraft();

function draftSnapshot() {
  return {
    cart: store.cart,
    plan: store.plan,
    subscription: store.subscription,
  };
}

function applyDraft(draft) {
  const next = normalizeDraft(draft);
  store.cart = next.cart;
  store.plan = next.plan;
  store.subscription = next.subscription;
  store.checkout = next.checkout;
}

function activateAccountDraft(email, visitorDraft) {
  const saved = loadAccountDraft(email);
  const guest = normalizeDraft(visitorDraft);
  const existing = fresh();
  applyDraft({
    cart: guest.cart.length ? guest.cart : saved.cart,
    plan: JSON.stringify(guest.plan) !== JSON.stringify(existing.plan) ? guest.plan : saved.plan,
    subscription: JSON.stringify(guest.subscription) !== JSON.stringify(existing.subscription)
      ? guest.subscription : saved.subscription,
  });
  save();
  clearGuestDraft();
}

const freshAuth = () => ({ values: {}, errors: {}, general: '', notice: '' });

const ui = {
  auth: freshAuth(),
  authNext: null,
  authSubmitting: false,
  contactEditing: false,
  cartReviewKind: 'cart',
  route: typeof location !== 'undefined' ? location.pathname : '/',
  category: 'All meals',
  query: '',
  overlay: null,
  notification: '',
  selectedProduct: null,
  selectionContext: null,
  editId: null,
  codSubmitting: false,
  pendingOrder: null,
  orderLoad: null,
  lastCodOrder: null,
  receiptOrderId: null,
  orders: [],
  ordersLoaded: false,
  ordersLoading: false,
  ordersError: '',
  errors: {},
  mobileNav: false,
  menu: null,
  bannerIndex: 0,
  builder: freshBuild(),
  builderContext: null,
  calorieForm: {
    age: '',
    height: '',
    weight: '',
    sex: '',
    activity: '',
    goal: '',
  },
  calorieResult: null,
};

function save() {
  const email = getAccount()?.email;
  try {
    const draft = JSON.stringify(draftSnapshot());
    if (email) globalThis.localStorage?.setItem(draftStorageKey(email), draft);
    else globalThis.sessionStorage?.setItem(GUEST_DRAFT_KEY, draft);
  } catch {}
}

function persist() {
  save();
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('gillys:updated'));
  }
}

function makeItem(productId, custom = defaultCustomization(), quantity = 1) {
  const randomId =
    globalThis.crypto?.randomUUID?.() ||
    Math.random().toString(36).slice(2) + Date.now().toString(36);
  return {
    id: `item-${randomId}`,
    productId,
    custom: structuredClone(custom),
    quantity,
  };
}

function clearDraft(kind) {
  if (kind === 'plan') {
    store.plan.assignments = {};
  }
  if (kind === 'subscription') {
    store.subscription.assignments = {};
  }
  persist();
}

// Customer credentials are handled by Supabase through the Pages API.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PH_MOBILE = /^09\d{9}$/;
let customerAccount = null;
let profileSaving = false;

function currentSession() { return customerAccount; }
function getAccount() { return customerAccount; }

async function customerApi(action, body, query = '') {
  if (FILE_MODE) throw Error('Sign in on the Gilly’s website or run the Cloudflare local preview.');
  const response = await fetch(new URL('api/customer/' + action + query, WEBSITE_ROOT), {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = Error(data?.error || 'The Gilly’s connection is unavailable. Try again shortly.');
    error.status = response.status;
    throw error;
  }
  return data;
}

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

function validateSignUp(values) {
  const errors = {};
  const name = String(values.name || '').trim();
  const email = normalizeEmail(values.email);
  const phone = String(values.phone || '').replace(/[\s-]/g, '');
  const password = String(values.password || '');
  if (name.length < 2 || name.length > 100) errors.name = 'Enter your full name (2–100 characters)';
  if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address';
  if (phone && !PH_MOBILE.test(phone)) errors.phone = 'Enter an 11-digit mobile number starting with 09, or leave it blank';
  if (password.length < 8 || password.length > 72) errors.password = 'Use 8–72 characters';
  if (values.confirm !== password) errors.confirm = 'Passwords do not match';
  return errors;
}

async function submitCustomerCredentials(kind, values, resetting) {
  const email = normalizeEmail(values.email);
  const password = values.password || '';
  const errors = kind === 'signup' ? validateSignUp(values) : {};
  if (!resetting && !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address';
  if (kind === 'signin' && !password) errors.password = 'Enter your password';
  if (resetting) {
    if (password.length < 8 || password.length > 72) errors.password = 'Use 8–72 characters';
    if (values.confirm !== password) errors.confirm = 'Passwords do not match';
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    if (kind === 'signin') {
      customerAccount = await customerApi('signin', { email, password });
      return { ok: true, session: customerAccount };
    }
    if (kind === 'signup') {
      await customerApi('signup', { name: values.name, email, phone: values.phone, password });
      return { ok: true };
    }
    if (resetting) {
      await customerApi('reset', { password });
      customerAccount = null;
      return { ok: true, passwordReset: true };
    }
    await customerApi('recover', { email });
    return { ok: true, notice: 'If that email has an account, a reset link will arrive shortly. Open it in this same browser.' };
  } catch (error) {
    return { ok: false, general: error.message };
  }
}

async function signOut() {
  await customerApi('logout', {});
  customerAccount = null;
}

async function updateAccountRecord(email, mutate) {
  const account = getAccount();
  if (!account || account.email !== email) return { ok: false, general: 'Sign in to update your account.' };
  if (profileSaving) return { ok: false, general: 'A profile update is in progress. Please wait.' };
  const updated = structuredClone(account);
  mutate(updated);
  profileSaving = true;
  try {
    const saved = await customerApi('profile', updated);
    if (customerAccount === account) customerAccount = saved;
    return { ok: true };
  } catch (error) {
    if (error.status === 409 && customerAccount === account) {
      const latest = await customerApi('session').catch(() => null);
      if (latest && customerAccount === account) customerAccount = latest;
    }
    return { ok: false, general: error.message };
  } finally {
    profileSaving = false;
  }
}

// js/components/ui.js
// src/components/ui.js
// Brand artwork uses the chef mascot as the icon, while the website renders
// the Gilly's wordmark as live cursive text for cleaner scaling and readability.
const brandLockup = () => `
<span class="g-brand-lockup">
  <img
    class="g-brand-mark"
    src="/assets/gilly-mascot-160.webp"
    alt=""
    width="76"
    height="76"
    decoding="async"
  />
  <span class="g-brand-wordmark">Gilly’s</span>
</span>
`;

const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c],
  );

const ico = (name, size = 20) => {
  const paths = {
    bag: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
    cart: '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.6 12.2a2 2 0 0 0 2 1.8H20"/><path d="M6 7h15l-2 8H7"/>',
    arrow: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14m-7-7h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'map-pin': '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    'external-link': '<path d="M14 3h7v7M21 3l-10 10"/><path d="M20 13v7H4V4h7"/>',
    leaf: '<path d="M20 4C11 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-7 11-16Z"/><path d="M4 20c2-5 6-8 11-11"/>',
    truck:
      '<path d="M3 6h12v11H3zM15 10h4l3 4v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2 6M20 5v6h-6"/>',
    trash: '<path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
    edit: '<path d="m4 17-1 4 4-1L20 7l-4-4L4 17Z"/>',
    shield: '<path d="M12 2 3 6v7c0 5 4 8 9 9 5-1 9-4 9-9V6l-9-4Z"/><path d="m8 12 3 3 5-6"/>',
    heart: '<path d="M20 9c0 5-8 11-8 11S4 14 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1Z"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    play: '<path d="M7 4.5v15l12-7.5-12-7.5Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
  };
  return `
<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  ${paths[name] || paths.arrow}
</svg>
`;
};

const nav = [
  ['/menu', 'Order Meals'],
  ['/build', 'Build a Bowl'],
  ['/meal-plans', 'Plans'],
];

// Top navigation keeps four essentials; the two planning pages share one menu.
const NAV_PLANS = [
  ['/meal-plans', 'Meal Plans', 'Schedule meals once, no auto-renewal'],
  ['/subscriptions', 'Subscriptions', 'Weekly and monthly packages'],
];

const isRouteActive = (...prefixes) =>
  prefixes.some((prefix) => ui.route === prefix || ui.route.startsWith(`${prefix}/`));

function header() {
  const count = store.cart.reduce((a, c) => a + c.quantity, 0);
  const session = currentSession();
  const firstName = session?.name ? escapeHtml(session.name.split(' ')[0]) : null;
  const userActive = isRouteActive('/account', '/orders', '/receipt');
  const navLink = (url, label) => `
      <a href="${url}" data-link class="sh-link ${isRouteActive(url) ? 'active' : ''}" ${isRouteActive(url) ? 'aria-current="page"' : ''}>${label}</a>`;
  return `
<header class="sh">
  <div class="sh-bar wrap">
    <a href="/" data-link class="brand sh-brand" aria-label="Gilly's home">
      ${brandLockup(44)}
    </a>
    <nav class="sh-nav" aria-label="Main navigation">
      ${navLink('/menu', 'Order Meals')}
      ${navLink('/build', 'Build a Bowl')}
      ${navLink('/meal-plans', 'Meal Plans')}
      ${navLink('/calorie-calculator', 'Calorie Guide')}
    </nav>
    <div class="sh-actions">
      ${session ? `
      <div class="sh-dd sh-user ${ui.menu === 'user' ? 'open' : ''}">
        <button type="button" class="sh-user-btn ${userActive ? 'active' : ''}" data-action="menu-toggle" data-menu="user" aria-haspopup="true" aria-expanded="${ui.menu === 'user'}" aria-label="Account menu">
          ${ico('user', 20)}
          <span class="sh-user-name">Hi, ${firstName}</span>
          ${ico('chevron-down', 14)}
        </button>
        <div class="sh-dd-menu sh-dd-right" role="menu">
          <a href="/account" data-link role="menuitem" class="${isRouteActive('/account') ? 'active' : ''}"><strong>My Information</strong></a>
          <a href="/orders" data-link role="menuitem" class="${isRouteActive('/orders', '/receipt') ? 'active' : ''}"><strong>Order History</strong></a>
          <button type="button" role="menuitem" data-action="sign-out"><strong>Sign out</strong></button>
        </div>
      </div>` : `
      <button type="button" class="btn btn-primary sh-signin" data-action="auth-open" data-mode="signin" aria-label="Sign in">
        ${ico('user', 18)}<span>Sign in</span>
      </button>`}
      <button type="button" class="sh-cart" data-action="cart-open" aria-label="Open cart with ${count} items" title="View your cart">
        ${ico('cart', 22)}
        ${count > 0 ? `<span class="sh-cart-count" aria-hidden="true">${count}</span>` : ''}
      </button>
      <button type="button" class="sh-burger" data-action="toggle-mobile" aria-label="Toggle navigation" aria-expanded="${ui.mobileNav}">
        ${ico(ui.mobileNav ? 'close' : 'menu', 24)}
      </button>
    </div>
  </div>
  ${ui.mobileNav ? `
  <nav class="sh-mobile" aria-label="Mobile navigation">
    ${firstName ? `<span class="sh-mobile-greeting">Hi, ${firstName}!</span>` : ''}
    ${nav.map(([url, label]) => `<a href="${url}" data-link class="${isRouteActive(url) ? 'active' : ''}">${label}</a>`).join('')}
    <a href="/calorie-calculator" data-link class="${isRouteActive('/calorie-calculator') ? 'active' : ''}">Calorie Guide</a>
    <div class="sh-mobile-account">
      ${session ? `
      <a href="/account" data-link>My Information</a>
      <a href="/orders" data-link>Order History</a>
      <button type="button" data-action="sign-out">Sign out</button>` : `
      <button type="button" class="btn btn-primary" data-action="auth-open" data-mode="signin">Sign in</button>
      <button type="button" class="btn btn-outline" data-action="auth-open" data-mode="signup">Create account</button>`}
    </div>
  </nav>` : ''}
</header>
`;
}

function footer() {
  return `
<footer class="g-foot">
  <div class="wrap g-foot-grid">
    <div>
      <a href="/" data-link class="brand">
        ${brandLockup(56)}
      </a>
      <p>
        Good food, good days
      </p>
    </div>
    <div>
      <strong>
        Explore
      </strong>
      ${nav.map(([url, label]) => `
        <a href="${url}" data-link>
          ${label}
        </a>
      `).join('')}
      <a href="/calorie-calculator" data-link>
        Calorie Guide
      </a>
    </div>
    <div>
      <strong>
        Help
      </strong>
      ${currentSession()
    ? '<a href="/account" data-link>My Information</a><a href="/orders" data-link>Order History</a>'
    : '<button type="button" class="foot-link-btn" data-action="auth-open" data-mode="signin">Sign in</button><button type="button" class="foot-link-btn" data-action="auth-open" data-mode="signup">Create account</button>'}
      <a href="/information" data-link>
        Pickup & FAQs
      </a>
    </div>
    <div>
      <strong>
        Metro Manila pickup
      </strong>
      <p class="foot-address">
        Choose your Gilly's pickup hub at checkout: Manila, Makati, Quezon City, Taguig, or Pasig.
      </p>
      <p class="foot-hours">
        Pickup windows: ${BUSINESS.timeSlots.map(escapeHtml).join(' · ')}
      </p>
      <p class="foot-note">
        Pickup only. Pay in cash when you collect your order.
      </p>
    </div>
  </div>
  <div class="wrap g-foot-bottom">
    <span>© ${new Date().getFullYear()} Gilly's</span>
    <a href="${new URL(FILE_MODE ? 'index.html#/admin/login' : 'admin/', WEBSITE_ROOT).href}" class="g-foot-staff-link" data-staff-login>Admin Login</a>
  </div>
</footer>
`;
}

// Resize remote photos to the width actually needed and describe them for srcset.
const sizedUrl = (url, width) => String(url).replace(/([?&])w=\d+/, `$1w=${width}`);

function imgTag(src, alt, { widths = [480, 800], sizes = '100vw', eager = false, cls = '' } = {}) {
  const srcset = widths.map((w) => `${sizedUrl(src, w)} ${w}w`).join(', ');
  return `<img ${cls ? `class="${cls}" ` : ''}src="${sizedUrl(src, widths[0])}" srcset="${srcset}" sizes="${sizes}" alt="${escapeHtml(alt)}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async" />`;
}

// Skeleton shimmer while photos load; a soft maroon fallback if one fails.
function enhanceImages() {
  root?.querySelectorAll('img').forEach((img) => {
    if (img.dataset.enhanced) return;
    img.dataset.enhanced = '1';
    const done = (ok) => {
      img.classList.remove('is-pending');
      img.classList.add(ok ? 'is-loaded' : 'is-broken');
      const host = img.parentElement;
      if (!ok && host?.matches('.g-tile-photo, .promo-media, .build-visual, .custom-photo')) {
        host.classList.add('img-failed');
        img.style.visibility = 'hidden';
      }
    };
    if (img.complete) { if (img.naturalWidth > 0) done(true); else if (img.currentSrc || img.getAttribute('src')) done(false); return; }
    img.classList.add('is-pending');
    img.addEventListener('load', () => done(true), { once: true });
    img.addEventListener('error', () => done(false), { once: true });
  });
}

const dietSlug = (category) => String(category).toLowerCase().replace(/[^a-z]+/g, '-');

function skeletonCards(count = 4) {
  return `<div class="g-tiles" aria-busy="true" aria-label="Loading meals">${Array.from({ length: count }, () => `
<article class="g-tile skeleton-card" aria-hidden="true">
  <div class="sk-photo skeleton"></div>
  <div class="g-tile-body">
    <div class="sk-line sk-title skeleton"></div>
    <div class="sk-line sk-facts skeleton"></div>
    <div class="sk-line skeleton"></div>
    <div class="sk-line sk-short skeleton"></div>
  </div>
  <div class="sk-bar skeleton"></div>
</article>`).join('')}</div>`;
}

function card(meal, { priority = false } = {}) {
  const name = escapeHtml(meal.name);
  return `
<article class="g-tile meal-card" data-action="customize" data-id="${meal.id}" role="button" tabindex="0" aria-label="Customize ${name}">
  <div class="g-tile-photo" aria-hidden="true">
    ${imgTag(meal.img, `${meal.name}, a ${String(meal.category).toLowerCase()} bowl`, { widths: [420, 720], sizes: '(max-width: 600px) 92vw, (max-width: 1100px) 46vw, 300px', eager: priority })}
  </div>
  <div class="g-tile-body">
    <div class="g-tile-title-row">
      <h3>${name}</h3>
      <strong class="meal-card-price">${money(meal.price)}</strong>
    </div>
    <ul class="meal-facts" aria-label="Nutrition and diet">
      <li class="fact-kcal"><b>${meal.kcal}</b> kcal</li>
      <li class="fact-protein"><b>${meal.protein}g</b> protein</li>
      <li class="fact-tag tag-${dietSlug(meal.category)}">${escapeHtml(meal.category)}</li>
    </ul>
    <p>
      ${escapeHtml(meal.description)}
    </p>
  </div>
</article>
`;
}

const fieldset = (legend, contents, small = '') => `
<fieldset class="choice-group">
  <legend>
    ${legend}${small ? `
    <span>
      ${small}
    </span>
  ` : ''}
  </legend>
  ${contents}
</fieldset>
`;

function mobileCartBar(extraClass = '') {
  const count = store.cart.reduce((n, it) => n + it.quantity, 0);
  if (!count) return '';
  const total = cartSummary(store.cart).total;
  return `
<div class="mobile-cartbar ${extraClass}" role="region" aria-label="Cart summary">
  <div class="mcb-stats">
    <span><b>${count}</b> ${count === 1 ? 'item' : 'items'}</span>
    <span><b>${money(total)}</b></span>
    <span><b>${fmtKcal(cartKcal())}</b> kcal</span>
  </div>
  <button type="button" class="btn btn-primary" data-action="cart-open">View cart</button>
</div>`;
}

function checkoutProgress(current) {
  const steps = ['Cart', 'Details', 'Confirm'];
  return `
<ol class="checkout-progress" aria-label="Checkout progress">
  ${steps.map((label, i) => {
    const n = i + 1;
    const state = n < current ? 'done' : n === current ? 'current' : 'todo';
    return `<li class="${state}" ${state === 'current' ? 'aria-current="step"' : ''}><span class="cp-dot">${state === 'done' ? ico('check', 14) : n}</span><span class="cp-label">${label}</span><span class="sr-only">${state === 'done' ? ' (completed)' : ''}</span></li>`;
  }).join('')}
</ol>`;
}

const fmtKcal = (value) => Math.round(Number(value) || 0).toLocaleString('en-PH');
const refocus = (selector) => root?.querySelector(selector)?.focus({ preventScroll: true });

function cartKcal(items = store.cart) {
  return items.reduce((sum, it) => {
    const meal = mealById(it.productId);
    const unit = meal ? Math.round(mealTotal(meal, it.custom).nutrients?.kcal || 0) : 0;
    return sum + unit * it.quantity;
  }, 0);
}

function kcalChip(unit, quantity) {
  return `<span class="kcal-chip"><b>${fmtKcal(unit * quantity)} kcal</b>${quantity > 1 ? `<i>${fmtKcal(unit)} each × ${quantity}</i>` : ''}</span>`;
}

function kcalBar(items, extraClass = '') {
  const count = items.reduce((n, it) => n + it.quantity, 0);
  return `
<div class="kcal-bar ${extraClass}" role="status">
  <span class="kcal-bar-label">Total calories</span>
  <strong>${fmtKcal(cartKcal(items))} kcal</strong>
  <span class="kcal-bar-meta">${count} ${count === 1 ? 'item' : 'items'}</span>
</div>`;
}

function customizerModal() {
  const info = ui.overlay;
  if (!info || info.type !== 'customize') return '';
  const meal = mealById(info.productId);
  if (!meal) return '';

  const choice = info.custom || defaultCustomization();
  const calc = mealTotal(meal, choice);
  // Quantity is chosen here only when adding a new item to the cart.
  const canSetQty = info.kind === 'cart' && !info.editId;
  const qty = canSetQty ? Math.min(99, Math.max(1, Number(info.quantity) || 1)) : 1;

  const radio = (options, key) =>
    options
      .map(
        (o) => `
<label class="option-row">
  <input type="radio" name="${key}" value="${o.id}" data-modifier="${key}" ${choice[key] === o.id ? 'checked' : ''}/>
  <span class="radio-visual">
  </span>
  <span class="option-name">
    ${escapeHtml(o.label)}
  </span>
  <span class="option-price">
    ${o.price ? `+${money(o.price)}` : 'Included'}
  </span>
</label>
`,
      )
      .join('');

  const context =
    info.kind === 'plan'
      ? 'Add to this meal slot'
      : info.kind === 'subscription'
        ? 'Choose for this pickup'
        : info.editId
          ? 'Save changes'
          : 'Add to cart';

  return `
  <div class="modal-backdrop" data-action="overlay-close">
    <section role="dialog" aria-modal="true" aria-labelledby="customize-title" class="customizer modal" data-stop="true">
      <button class="modal-x" data-action="overlay-close" aria-label="Close">
        ${ico('close')}
      </button>
      <div class="custom-photo">
        ${imgTag(meal.img, `${meal.name} bowl`, { widths: [640, 960], sizes: '(max-width: 820px) 100vw, 340px', eager: true })}
      </div>
      <div class="custom-body">
        <div class="custom-head">
        <h2 id="customize-title">
          ${escapeHtml(meal.name)}
        </h2>
        <p class="muted">
          ${escapeHtml(meal.description)}
        </p>
        <div class="nutrition-strip kcal-sticky" role="group" aria-label="Nutrition for ${qty} ${qty === 1 ? 'serving' : 'servings'}">
          <span>
            <b>
              ${fmtKcal(calc.nutrients.kcal * qty)}
            </b>
            <small>
              kcal
            </small>
          </span>
          <span>
            <b>
              ${fmtKcal(calc.nutrients.protein * qty)}g
            </b>
            <small>
              protein
            </small>
          </span>
          <span>
            <b>
              ${fmtKcal(calc.nutrients.carbs * qty)}g
            </b>
            <small>
              carbs
            </small>
          </span>
          <span>
            <b>
              ${fmtKcal(calc.nutrients.fat * qty)}g
            </b>
            <small>
              fat
            </small>
          </span>
          ${qty > 1 ? `<em class="kcal-note">${qty} × ${fmtKcal(calc.nutrients.kcal)} kcal each</em>` : ''}
        </div>
        </div>
        <div class="custom-scroll">
        ${fieldset('Pick your portion', radio(portionOptions, 'portion'))}
        ${fieldset('Extra protein', radio(proteinOptions, 'protein'), 'Optional')}
        ${fieldset('Dressing', radio(sauces, 'sauce'))}
        ${fieldset(
  'Leave these out',
  meal.removables
    .map(
      (ingredient) => `
                <label class="option-row">
                  <input type="checkbox" data-remove="${ingredient}" ${(choice.removed || []).includes(ingredient) ? 'checked' : ''}/>
                  <span class="checkbox-visual">
                  </span>
                  <span class="option-name">
                    No ${escapeHtml(ingredient.toLowerCase())}
                  </span>
                  <span class="option-price">
                    No charge
                  </span>
                </label>
              `,
    )
    .join(''),
  'Optional',
)}
        ${fieldset(
  'Make it extra',
  toppings
    .map(
      (t) => `
                <label class="option-row">
                  <input type="checkbox" data-top="${t.id}" ${choice.toppings.includes(t.id) ? 'checked' : ''}/>
                  <span class="checkbox-visual">
                  </span>
                  <span class="option-name">
                    ${escapeHtml(t.label)}
                  </span>
                  <span class="option-price">
                    +${money(t.price)}
                  </span>
                </label>
              `,
    )
    .join(''),
  'Optional',
)}
        <p class="allergen">
          <b>
            Allergen note:
          </b>
          ${calc.allergens.length
    ? calc.allergens.join(', ')
    : 'No declared allergens in the recipe.'} Ask Gilly’s about ingredients and allergens before ordering.
        </p>
      </div>
      <div class="custom-footer">
        ${canSetQty ? `
        <div class="qty-stepper" role="group" aria-label="Quantity">
          <button type="button" data-action="modal-qty-dec" aria-label="Decrease quantity" ${qty <= 1 ? 'disabled' : ''}>${ico('minus', 16)}</button>
          <output>${qty}</output>
          <button type="button" data-action="modal-qty-inc" aria-label="Increase quantity" ${qty >= BUSINESS.maxLineQuantity ? 'disabled' : ''}>${ico('plus', 16)}</button>
        </div>` : ''}
        <div class="custom-total">
          <small>
            ${info.kind === 'cart' ? (qty > 1 ? `Total for ${qty}` : 'Item total') : 'Per meal'}
          </small>
          <strong>
            ${money(calc.price * qty)}
          </strong>
        </div>
        <button class="btn btn-primary" data-action="custom-submit" ${choice.portion && choice.sauce ? '' : 'disabled'}>
          ${context}
        </button>
      </div>
    </section>
  </div>
`;
}

function chooserModal() {
  const info = ui.overlay;
  if (!info || info.type !== 'choose') return '';

  return `
<div class="modal-backdrop" data-action="overlay-close">
  <section class="choose-modal modal" role="dialog" aria-modal="true" aria-labelledby="chooser-heading" data-stop="true">
    <div class="choose-head">
      <div>
        <h2 id="chooser-heading">
          Choose your ${escapeHtml(info.period.toLowerCase())}
        </h2>
      </div>
      <button class="modal-x inline-x" data-action="overlay-close" aria-label="Close">
        ${ico('close')}
      </button>
    </div>
    <div class="chooser-grid">
      <button class="choose-meal choose-custom" data-action="choose-builder" aria-label="Build your own bowl">
        <span class="choose-build-thumb" aria-hidden="true">?</span>
        <span class="choose-meal-info">
          <strong>
            Build your own bowl
          </strong>
          <small>
            Pick ingredients &amp; see live macros
          </small>
        </span>
        ${ico('plus', 20)}
      </button>
      ${meals
  .map(
    (m) => `
            <button class="choose-meal" data-action="choose-product" data-id="${m.id}">
              <img src="${sizedUrl(m.img, 240)}" alt="${escapeHtml(m.name)} bowl" loading="lazy" decoding="async"/>
              <span>
                <strong>
                  ${escapeHtml(m.name)}
                </strong>
                <small>
                  ${money(m.price)} · ${m.kcal} kcal
                </small>
              </span>
              ${ico('plus', 20)}
            </button>
          `,
  )
  .join('')}
    </div>
  </section>
</div>
`;
}

function cartDrawer() {
  if (!ui.overlay || ui.overlay.type !== 'cart') return '';
  const s = cartSummary(store.cart);

  return `
<div class="drawer-backdrop" data-action="overlay-close">
  <aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-heading" data-stop="true">
    <div class="drawer-head">
      <div>
        <h2 id="cart-heading">
          Your bag
          <span>
            (${store.cart.reduce((n, it) => n + it.quantity, 0)})
          </span>
        </h2>
      </div>
      <button class="icon-btn" data-action="overlay-close" aria-label="Close bag">
        ${ico('close')}
      </button>
    </div>
    ${store.cart.length
  ? `
          ${kcalBar(store.cart, 'drawer-kcal')}
          <div class="drawer-items">
            ${store.cart
    .map((it) => {
      const m = mealById(it.productId);
      if (!m) return '';
      const cost = mealTotal(m, it.custom);
      return `
                  <article class="bag-item">
                    <img src="${sizedUrl(m.img, 240)}" alt="${escapeHtml(m.name)} bowl" loading="lazy" decoding="async"/>
                    <div class="bag-info">
                      <strong>
                        ${escapeHtml(m.name)}
                      </strong>
                      <small>
                        ${escapeHtml(
        m.id === 'custom-bowl'
          ? (cost.ingredients || []).map((x) => x.label).join(' · ')
          : [
            it.custom.portion === 'hearty'
              ? 'Hearty portion'
              : 'Regular portion',
            it.custom.protein !== 'as-is' ? 'Extra protein' : '',
            ...(it.custom.toppings || []),
            ...(it.custom.removed || []).map((x) => 'No ' + x),
          ]
            .filter(Boolean)
            .join(' · '),
      )}
                      </small>
                      ${kcalChip(Math.round(cost.nutrients?.kcal || 0), it.quantity)}
                      <span class="bag-line-price">
                        ${money(cost.price * it.quantity)}
                      </span>
                      <div class="bag-tools">
                        <div class="qty">
                          <button aria-label="Decrease quantity" data-action="qty-dec" data-id="${it.id}">
                            ${ico('minus', 14)}
                          </button>
                          <span>
                            ${it.quantity}
                          </span>
                          <button aria-label="Increase quantity" data-action="qty-inc" data-id="${it.id}" ${it.quantity >= BUSINESS.maxLineQuantity ? 'disabled' : ''}>
                            ${ico('plus', 14)}
                          </button>
                        </div>
                        <button data-action="cart-edit" data-id="${it.id}">
                          Edit
                        </button>
                        <button data-action="cart-remove" data-id="${it.id}">
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                `;
    })
    .join('')}
          </div>
          <div class="drawer-bottom">
            <div class="summary-line">
              <span>
                Subtotal
              </span>
              <strong>
                ${money(s.subtotal)}
              </strong>
            </div>
            <div class="summary-line">
              <span>
                Pickup
              </span>
              <span>
                Free
              </span>
            </div>
            ${orderTaxLines(orderTaxParts(s.subtotal, 0))}
            <div class="summary-line total">
              <span>
                Total · Cash at Pickup
              </span>
              <strong>
                ${money(s.total)}
              </strong>
            </div>
            <p class="caption">
              Pickup time is confirmed when your order is accepted.
            </p>
            <button class="btn btn-primary full" data-action="go-checkout" data-kind="cart">
              Review cart
            </button>
            <button class="text-btn full" data-action="overlay-close">
              Keep browsing
            </button>
          </div>
        `
  : `
          <div class="empty-cart">
            <span class="empty-icon">
              ${ico('bag', 40)}
            </span>
            <h3>
              Your cart is empty
            </h3>
            <p>
              Something delicious is just a click away
            </p>
            <button class="btn btn-primary" data-action="cart-shop">
              Explore the menu
            </button>
          </div>
        `}
  </aside>
</div>
`;
}

function focusDescriptor(el) {
  if (!el || el === document.body || !el.getAttribute) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  const tag = el.tagName.toLowerCase();
  let selector = tag;
  for (const attr of ['data-action', 'data-id', 'data-mode', 'data-target', 'data-next', 'data-kind', 'data-slot',
    'data-modifier', 'data-top', 'data-remove', 'data-builder', 'data-period', 'data-auth',
    'data-checkout', 'data-plan', 'data-menu', 'name', 'aria-label']) {
    const value = el.getAttribute(attr);
    if (value) selector += `[${attr}="${CSS.escape(value)}"]`;
  }
  if (el.matches('input[type="radio"], input[type="checkbox"]')) {
    selector += `[value="${CSS.escape(el.value)}"]`;
  }
  return selector === tag ? null : selector;
}

function authModal() {
  const info = ui.overlay;
  if (!info || info.type !== 'auth') return '';
  const mode = ['signin', 'signup', 'forgot'].includes(info.mode) ? info.mode : 'signin';
  const resetStep = mode === 'forgot' && ui.auth.reset === true;
  const copy = {
    signin: ['Welcome back', 'Sign in to pick up where you left off.'],
    signup: ['Join Gilly’s', 'Create an account to save your details and orders.'],
    forgot: resetStep
      ? ['Reset your password', 'Choose a new password for your account.']
      : ['Reset your password', 'Enter the email address linked to your account.'],
  }[mode];
  const forms = {
    signin: `
<form id="signin-form" class="auth-form" novalidate>
  ${authField('email', 'Email address', 'email', 'autocomplete="email" placeholder="e.g. maria@example.com" required')}
  ${authPassword('password', 'Password', 'current-password')}
  <button type="submit" class="btn btn-primary full">Sign in</button>
</form>
<div class="auth-links">
  <button type="button" class="auth-link-btn" data-action="auth-mode" data-mode="forgot">Forgot password?</button>
  <button type="button" class="auth-link-btn" data-action="auth-mode" data-mode="signup">New to Gilly’s? Create an account</button>
</div>`,
    signup: `
<form id="signup-form" class="auth-form" novalidate>
  ${authField('name', 'Full name', 'text', 'autocomplete="name" placeholder="e.g. Maria Santos" required')}
  ${authField('email', 'Email address', 'email', 'autocomplete="email" placeholder="e.g. maria@example.com" required')}
  ${authField('phone', 'Mobile number <span class="optional">(optional)</span>', 'tel', 'autocomplete="tel" inputmode="tel" placeholder="e.g. 0917 123 4567"')}
  ${authPassword('password', 'Password', 'new-password')}
  ${authPassword('confirm', 'Confirm password', 'new-password')}
  <button type="submit" class="btn btn-primary full">Create account</button>
</form>
<div class="auth-links">
  <button type="button" class="auth-link-btn" data-action="auth-mode" data-mode="signin">Already have an account? Sign in</button>
</div>`,
    forgot: `
${resetStep ? `
<form id="reset-password-form" class="auth-form" novalidate>
  ${authPassword('password', 'New password', 'new-password')}
  ${authPassword('confirm', 'Confirm new password', 'new-password')}
  <button type="submit" class="btn btn-primary full">Reset password</button>
</form>` : `
<form id="forgot-form" class="auth-form" novalidate>
  ${authField('email', 'Email address', 'email', 'autocomplete="email" placeholder="e.g. maria@example.com" required')}
  <button type="submit" class="btn btn-primary full">Send reset link</button>
</form>`}
<div class="auth-links">
  <button type="button" class="auth-link-btn" data-action="auth-mode" data-mode="signin">Back to sign in</button>
</div>`,
  }[mode];

  return `
<div class="modal-backdrop" data-action="overlay-close">
  <section role="dialog" aria-modal="true" aria-labelledby="auth-title" class="auth-modal modal" data-stop="true">
    <button class="modal-x" data-action="overlay-close" aria-label="Close">
      ${ico('close')}
    </button>
    <div class="auth-modal-head">
      <img class="auth-modal-mark" src="/assets/gilly-mascot-160.webp" alt="" width="56" height="56" decoding="async" />
      <div>
        <h2 id="auth-title">${copy[0]}</h2>
        <p>${copy[1]}</p>
      </div>
    </div>
    ${authNotice()}
    ${forms}
  </section>
</div>
`;
}

function openAuth(mode = 'signin', next) {
  ui.authNext = next !== undefined ? next : ui.authNext;
  ui.auth = freshAuth();
  ui.overlay = { type: 'auth', mode };
  ui.mobileNav = false;
  ui.menu = null;
  render({ keepScroll: true });
}

function overlay() {
  return customizerModal() || chooserModal() || cartDrawer() || authModal();
}

function toast() {
  return ui.notification
    ? `
      <div class="toast" role="status" aria-live="polite">
        <span class="toast-icon">${ico('check', 18)}</span>
        <span class="toast-text">${escapeHtml(ui.notification)}</span>
        ${ui.notificationAction === 'view-cart' ? '<button type="button" class="toast-action" data-action="cart-open">View cart</button>' : ''}
        <button type="button" class="toast-close" data-action="toast-close" aria-label="Dismiss notification">${ico('close', 16)}</button>
      </div>
    `
    : '';
}

let sharedTaxTreatment = 'unconfigured';
function gillysTaxTreatment() { return sharedTaxTreatment; }
async function refreshTaxTreatment() {
  const { taxTreatment } = await customerApi('settings');
  sharedTaxTreatment = taxTreatment;
}
function pesoRound(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
function orderTaxParts(subtotal, discount = 0, treatment = gillysTaxTreatment()) {
  const afterDiscount = pesoRound(Math.max(0, Number(subtotal || 0) - Number(discount || 0)));
  if (treatment === 'vat-inclusive') {
    const vatableSales = pesoRound(afterDiscount / 1.12);
    return { taxTreatment: treatment, taxRate: 0.12,
      taxAmount: pesoRound(afterDiscount - vatableSales), vatableSales };
  }
  return { taxTreatment: treatment, taxRate: null, taxAmount: null, vatableSales: null };
}
function orderTaxLines(taxInfo, lineClass = 'summary-line') {
  if (taxInfo?.taxTreatment === 'vat-inclusive' && Number.isFinite(Number(taxInfo.taxAmount))) {
    return `<div class="${lineClass}"><span>VATable sales (excl. VAT)</span><strong>${money(taxInfo.vatableSales)}</strong></div>
      <div class="${lineClass}"><span>12% VAT (included)</span><strong>${money(taxInfo.taxAmount)}</strong></div>`;
  }
  if (taxInfo?.taxTreatment === 'non-vat') {
    return `<div class="${lineClass}"><span>VAT</span><strong>Not charged</strong></div>`;
  }
  return '';
}

function summaryRows(value, savings = 0, subscription = false) {
  const tax = orderTaxParts(value, savings);
  return `
    <div class="summary-line"><span>${subscription ? 'Meal package value' : 'Meal subtotal'}</span><strong>${money(value)}</strong></div>
    ${savings ? `<div class="summary-line saving"><span>Package discount</span><strong>−${money(savings)}</strong></div>` : ''}
    <div class="summary-line"><span>Pickup</span><strong>Free</strong></div>
    ${orderTaxLines(tax)}
    <div class="summary-line total"><span>Total · Cash at Pickup</span><strong>${money(pesoRound(value - savings))}</strong></div>
  `;
}

function offerCard(offer) {
  const starting = 279 * offer.days * offer.periods.length * (1 - offer.discountRate);

  return `
<article class="offer-card ${offer.tag ? 'featured' : ''}">
  ${offer.tag ? `
    <span class="offer-featured">
      ${offer.tag}
    </span>
  ` : ''}
  <h3>
    ${escapeHtml(offer.name)}
  </h3>
  <p>
    ${escapeHtml(offer.subtitle)}
  </p>
  <div class="offer-divider">
  </div>
  <strong class="offer-price">
    ${money(starting)}
    <small>
      / ${offer.frequency}
    </small>
  </strong>
  <span class="offer-caption">
    Estimated at ${money(279)} per meal
  </span>
  <ul class="tick-list">
    <li>
      ${ico('check', 16)}${offer.description}
    </li>
    <li>
      ${ico('check', 16)}Customize each meal
    </li>
    <li>
      ${ico('check', 16)}${Math.round(offer.discountRate * 100)}% estimated savings
    </li>
    <li>
      ${ico('check', 16)}Customer pickup
    </li>
  </ul>
  <button class="btn ${offer.tag ? 'btn-primary' : 'btn-outline'} full" data-action="offer-select" data-id="${offer.id}">
    Explore this package
  </button>
</article>
`;
}

// js/pages/builder.js
// src/pages/builder-views.js
const safe = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

const units = [
  ['kcal', 'Calories', 'kcal'],
  ['protein', 'Protein', 'g'],
  ['carbs', 'Carbs', 'g'],
  ['fat', 'Fat', 'g'],
];

function builderPage() {
  const result = buildSelection(ui.builder);
  const context = ui.builderContext;
  const previewMeal = ({
    chicken: mealById('herb-chicken'),
    tofu: mealById('sesame-tofu'),
    beef: mealById('korean-beef'),
    salmon: mealById('salmon-avocado'),
  })[ui.builder.protein] || customBowl;
  const previewProtein = result.ingredients.find((item) => INGREDIENT_GROUPS.find((group) => group.id === 'protein')?.options.some((option) => option.id === item.id));
  const ingredientImage = BUILDER_INGREDIENT_IMAGES;
  const requiredGroups = INGREDIENT_GROUPS.filter((group) => group.required);
  const pickedGroups = requiredGroups.filter((group) => {
    const chosen = ui.builder[group.id];
    return Array.isArray(chosen) ? chosen.length > 0 : !!chosen;
  }).length;
  const progressPct = requiredGroups.length ? Math.round((pickedGroups / requiredGroups.length) * 100) : 100;
  const actionLabel =
    context?.kind === 'plan' || context?.kind === 'subscription'
      ? 'Save to meal schedule'
      : context?.editId
        ? 'Save bowl changes'
        : 'Add bowl to cart';
  return `
  <main class="build-page">
    <div class="build-intro-shell">
      <div class="build-intro wrap">
        <h1>
          Build your bowl
        </h1>
        <p>
          Pick a base and a protein, then switch on the extras you crave
        </p>
      </div>
    </div>
    <div class="wrap build-layout">
      <div class="build-form" aria-label="Choose your bowl ingredients">
        ${INGREDIENT_GROUPS.map(
  (group) => `
            <fieldset class="ingredient-group">
              <legend>
                ${group.label}
              </legend>
              <p>
                ${group.hint}
              </p>
              <div class="ingredient-grid">
                ${group.options
      .map((option) => {
        const value = ui.builder[group.id];
        const checked =
          group.mode === 'multiple'
            ? Array.isArray(value) && value.includes(option.id)
            : value === option.id;
        return `
                    <label class="ingredient-option ${checked ? 'is-active' : ''}">
                      <input data-builder="${group.id}" type="${group.mode === 'multiple' ? 'checkbox' : 'radio'}" name="ingredient-${group.id}" value="${option.id}" ${checked ? 'checked' : ''}/>
                      <span class="ingredient-option-photo" aria-hidden="true">
                        ${imgTag(ingredientImage[option.id] || customBowl.img, '', { widths: [240, 480], sizes: '(max-width: 490px) 100vw, (max-width: 900px) 50vw, 260px', cls: 'ingredient-option-img' })}
                      </span>
                      <span class="ingredient-switch" aria-hidden="true">
                        <span>
                        </span>
                      </span>
                      <span class="ingredient-copy">
                        <strong>
                          ${safe(option.label)}
                        </strong>
                        <small>
                          ${safe(option.detail)} · ${option.kcal} kcal
                        </small>
                      </span>
                      <span class="ingredient-price">
                        ${option.price ? money(option.price) : 'Free'}
                      </span>
                    </label>
                  `;
      })
      .join('')}
              </div>
            </fieldset>
          `,
).join('')}
      </div>
      <aside id="your-bowl" class="build-summary ${ui.sheetOpen ? 'open' : ''}" aria-live="polite">
        <div class="sheet-bar">
          <button type="button" class="sheet-handle" data-action="sheet-toggle" aria-expanded="${!!ui.sheetOpen}" aria-controls="sheet-body">
            <span class="sheet-grip" aria-hidden="true"></span>
            <span class="sheet-stat"><b>${result.nutrients.kcal}</b> kcal</span>
            <span class="sheet-stat"><b>${money(result.price)}</b></span>
            <span class="sheet-toggle-label">${ui.sheetOpen ? 'Hide' : 'Review'} ${ico('chevron-down', 16)}</span>
          </button>
          <button type="button" class="btn btn-primary sheet-add" data-action="builder-add" ${result.valid ? '' : 'disabled'}>${context?.editId ? 'Save' : context ? 'Save' : 'Add'}</button>
        </div>
        <div id="sheet-body" class="sheet-body">
        <div class="build-visual">
          ${imgTag(previewMeal.img, `Preview of a ${previewProtein ? previewProtein.label.toLowerCase() : 'custom'} bowl`, { widths: [600, 900], sizes: '(max-width: 900px) 100vw, 420px' })}
          <div class="build-visual-caption">
            <span>Your bowl preview</span>
            <strong>${previewProtein ? `${safe(previewProtein.label)} selected` : 'Choose a protein to update'}</strong>
          </div>
        </div>
        <div class="build-summary-inner">
          <div class="build-summary-heading">
            <h2>
              Your bowl
            </h2>
            <button type="button" data-action="builder-reset" class="reset-link">
              Start over
            </button>
          </div>
          <div class="build-progress">
            <div class="build-progress-head">
              <span>Bowl progress</span>
              <strong>${pickedGroups} of ${requiredGroups.length} required picks</strong>
            </div>
            <div class="progress-track" role="progressbar" aria-label="Required picks" aria-valuemin="0" aria-valuemax="${requiredGroups.length}" aria-valuenow="${pickedGroups}">
              <span style="width:${progressPct}%"></span>
            </div>
          </div>
          <div class="ingredient-receipt">
            ${result.ingredients.map((item) => `
              <div class="ingredient-receipt-item">
                ${imgTag(ingredientImage[item.id] || customBowl.img, item.label, { widths: [160, 240], sizes: '42px', cls: 'ingredient-thumb' })}
                <span class="ingredient-receipt-copy">
                  <b>${safe(item.label)}</b>
                  <small>${safe(item.detail || 'Selected ingredient')}</small>
                </span>
                <strong>
                  ${money(item.price)}
                </strong>
              </div>
            `).join('')}
          </div>
          <div class="bowl-macro-grid">
            ${units.map(([key, label, unit]) => `
              <div>
                <strong>
                  ${result.nutrients[key]}${unit === 'g' ? 'g' : ''}
                </strong>
                <small>
                  ${label}
                </small>
              </div>
            `).join('')}
          </div>
          <div class="macro-rail" aria-hidden="true">
            ${[
    ['protein', 4],
    ['carbs', 4],
    ['fat', 9],
  ]
    .map(([key, rate]) => {
      const total =
        result.nutrients.protein * 4 +
        result.nutrients.carbs * 4 +
        result.nutrients.fat * 9;
      return `
                  <span class="macro-${key}" style="width:${total ? ((result.nutrients[key] * rate) / total) * 100 : 0}%">
                  </span>
                `;
    })
    .join('')}
          </div>
          <p class="macro-key">
            <span class="mk mk-protein">
              ●
            </span>
            Protein &nbsp;
            <span class="mk mk-carbs">
              ●
            </span>
            Carbs &nbsp;
            <span class="mk mk-fat">
              ●
            </span>
            Fat
          </p>
          <p class="bowl-allergens">
            ${result.allergens.length ? `Contains: ${safe(result.allergens.join(', '))}.` : 'No declared allergens in the selected ingredients.'} Verify before consumption
          </p>
          <div class="build-total">
            <span>
              Estimated bowl total
            </span>
            <strong>
              ${money(result.price)}
            </strong>
          </div>
          <button type="button" class="btn btn-primary full" data-action="builder-add" ${result.valid ? '' : 'disabled'}>
            ${actionLabel}
          </button>
          ${!context ? '<button type="button" class="build-buy-link" data-action="builder-buy" ' + (result.valid ? '' : 'disabled') + '>Add and review cart</button>' : ''}
        </div>
        </div>
      </aside>
    </div>
    ${mobileCartBar('on-build')}
  </main>
`;
}

function caloriePage() {
  const f = ui.calorieForm;
  const r = ui.calorieResult;
  const errorFor = (key) => r?.errors?.[key] || '';
  const control = (key, label, placeholder, min, max) => `
<label class="calc-field ${errorFor(key) ? 'is-invalid' : ''}">
  ${label}
  <input type="number" step="1" min="${min}" max="${max}" data-calorie="${key}" value="${safe(f[key])}" placeholder="${placeholder}" aria-invalid="${Boolean(errorFor(key))}" aria-describedby="${errorFor(key) ? `calorie-${key}-error` : ''}"/>
  ${errorFor(key) ? `<span class="field-error" id="calorie-${key}-error">${safe(errorFor(key))}</span>` : ''}
</label>
`;
  return `
<main class="calorie-page">
  <div class="wrap calc-header">
    <h1>
      Make room for meals that
      <em>
        fit you
      </em>
    </h1>
    <p>
      Get an estimate based on your age, height, weight, and activity level. Then browse meals with a number in mind
    </p>
  </div>
  <div class="wrap calorie-layout">
    <form id="calorie-form" class="calorie-form" novalidate>
      ${r && !r.valid ? `<div class="calc-validation-summary" role="alert"><strong>Please review the highlighted fields.</strong><span>Each field has a specific suggestion below it.</span></div>` : ''}
      <div class="calc-form-grid">
        ${control('age', 'Age (18+)', 'e.g. 25', 18, 100)}
        ${control('height', 'Height (cm)', 'e.g. 165', 100, 250)}
        ${control('weight', 'Weight (kg)', 'e.g. 65', 25, 350)}
        <label class="calc-field ${errorFor('sex') ? 'is-invalid' : ''}">
          Formula setting
          <select data-calorie="sex" aria-invalid="${Boolean(errorFor('sex'))}" aria-describedby="${errorFor('sex') ? 'calorie-sex-error' : ''}">
            <option value="" disabled ${!f.sex ? 'selected' : ''}>Choose a formula</option>
            <option value="female" ${f.sex === 'female' ? 'selected' : ''}>
              Female equation
            </option>
            <option value="male" ${f.sex === 'male' ? 'selected' : ''}>
              Male equation
            </option>
          </select>
          ${errorFor('sex') ? `<span class="field-error" id="calorie-sex-error">${safe(errorFor('sex'))}</span>` : ''}
        </label>
        <label class="calc-field ${errorFor('activity') ? 'is-invalid' : ''}">
          Activity level
          <select data-calorie="activity" aria-invalid="${Boolean(errorFor('activity'))}" aria-describedby="${errorFor('activity') ? 'calorie-activity-error' : ''}">
            <option value="" disabled ${!f.activity ? 'selected' : ''}>Choose your activity level</option>
            ${[
  ['1.2', 'Mostly seated / little exercise'],
  ['1.375', 'Light activity (1–3 days/week)'],
  ['1.55', 'Moderate activity (3–5 days/week)'],
  ['1.725', 'Very active (6–7 days/week)'],
  ['1.9', 'Extra active / physical work'],
]
  .map(
    ([v, l]) =>
      `
                    <option value="${v}" ${String(f.activity) === v ? 'selected' : ''}>
                      ${l}
                    </option>
                  `,
  )
  .join('')}
          </select>
          ${errorFor('activity') ? `<span class="field-error" id="calorie-activity-error">${safe(errorFor('activity'))}</span>` : ''}
        </label>
        <label class="calc-field ${errorFor('goal') ? 'is-invalid' : ''}">
          Personal goal
          <select data-calorie="goal" aria-invalid="${Boolean(errorFor('goal'))}" aria-describedby="${errorFor('goal') ? 'calorie-goal-error' : ''}">
            <option value="" disabled ${!f.goal ? 'selected' : ''}>Choose your goal</option>
            ${[
  ['maintain', 'Maintain weight'],
  ['loss', 'Gradual weight loss'],
  ['gain', 'Gradual weight gain'],
]
  .map(
    ([v, l]) =>
      `
                    <option value="${v}" ${f.goal === v ? 'selected' : ''}>
                      ${l}
                    </option>
                  `,
  )
  .join('')}
          </select>
          ${errorFor('goal') ? `<span class="field-error" id="calorie-goal-error">${safe(errorFor('goal'))}</span>` : ''}
        </label>
      </div>
      <button class="btn btn-primary" type="submit">
        Calculate my estimate
      </button>
      <p class="calc-privacy">
        Your height, weight, and age are used only in this tab. They are not stored in your cart or sent to a server
      </p>
    </form>
    <aside class="calorie-result" aria-live="polite">
      ${r?.valid
  ? `
            <div class="calorie-figure">
              <strong>
                ${r.target.toLocaleString('en-PH')}
              </strong>
              <span>
                kcal / day
              </span>
            </div>
            <p>
              Estimated daily calorie target based on your inputs
            </p>
            <div class="calorie-extra">
              <span>
                Estimated maintenance
              </span>
              <b>
                ${r.maintenance.toLocaleString('en-PH')} kcal
              </b>
            </div>
            <div class="calorie-extra">
              <span>
                Evenly divided across 3 meals
              </span>
              <b>
                ~${r.mealReference.toLocaleString('en-PH')} kcal
              </b>
            </div>
            ${r.capped ? '<small>This calculation provides general guidance only; consult a qualified professional for individual needs</small>' : ''}
            <a href="/build" data-link class="btn btn-primary full">
              Build a meal around your day
            </a>
            <button type="button" class="btn btn-outline full" data-action="calorie-use-plan">
              Use ${r.target.toLocaleString('en-PH')} kcal for a meal plan
            </button>
          `
  : `
            <div class="calorie-empty">
              <div class="calorie-empty-number">
                —
              </div>
              <h2>
                Your estimate will appear here
              </h2>
              <p>
                Fill in your details to see a daily energy estimate and a simple per-meal reference
              </p>
            </div>
          `}
      <p class="calorie-disclaimer">
        Uses the Mifflin–St Jeor adult equation and common activity multipliers. This is a rough estimate, not a nutrition diagnosis or prescribed calorie limit. Nutritional needs can differ substantially
      </p>
    </aside>
  </div>
</main>
`;
}

// js/pages/shared.js
// src/pages/views.js
const link = (url, label, cls = 'btn btn-primary') =>
  `
    <a href="${url}" data-link class="${cls}">
      ${label}
    </a>
  `;

const title = (eyebrow, heading, sub) => `
<div class="g-pagehead">
  <div class="wrap">
    <h1>
      ${heading}
    </h1>
    ${sub ? `
      <p>
        ${sub}
      </p>
    ` : ''}
  </div>
</div>
`;

const crumb = (part) => `
<div class="wrap breadcrumb">
  <a href="/" data-link>
    Home
  </a>
  ${ico('chevron', 15)}
  <span>
    ${escapeHtml(part)}
  </span>
</div>
`;

// js/pages/home.js
// One first impression: a promo carousel that doubles as the homepage hero.
const HERO_PHOTO = 'https://images.pexels.com/photos/7594969/pexels-photo-7594969.jpeg?auto=compress&cs=tinysrgb&w=1100';

function promoBanners() {
  const best = Math.round(Math.max(...OFFERS.map((offer) => offer.discountRate)) * 100);
  const photo = (meal) => ({ img: meal?.img, alt: `${meal?.name}, a ${String(meal?.category).toLowerCase()} bowl from Gilly’s` });
  return [
    { id: 'hero', title: 'Bowls you’ll crave by lunch', text: 'Hot, fresh, and built around you', cta: 'Order now', href: '/menu', cta2: 'Build your own', href2: '/build', img: HERO_PHOTO, alt: 'Fresh grain bowl with colorful vegetables and wholesome ingredients' },
    { id: 'plans', title: `Save up to ${best}% on meal packages`, text: 'Choose a one-time schedule or a repeat package, then plan meals around your calorie target.', cta: 'Choose a schedule', href: '/meal-plans', cta2: 'See repeat packages', href2: '/subscriptions', ...photo(meals[1]) },
    { id: 'build', title: 'Build a bowl your way', text: 'Every ingredient, with price, calories and macros shown as you go.', cta: 'Start building', href: '/build', cta2: 'See the menu', href2: '/menu', ...photo(meals[3]) },
    { id: 'calorie', title: 'Know your daily calories', text: 'Get an estimate in under a minute, then plan your meals around it.', cta: 'Open Calorie Guide', href: '/calorie-calculator', cta2: 'Order meals', href2: '/menu', ...photo(meals[2]) },
  ];
}

const prefersReducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const bannerPaused = () => (ui.bannerPaused === undefined ? prefersReducedMotion() : ui.bannerPaused);

function promoCarousel() {
  const banners = promoBanners();
  const active = Math.min(Math.max(ui.bannerIndex || 0, 0), banners.length - 1);
  return `
<section class="promo" aria-roledescription="carousel" aria-label="Featured at Gilly’s" data-count="${banners.length}">
  <div class="promo-viewport">
    <div class="promo-track" style="transform:translateX(-${active * 100}%)">
      ${banners.map((b, n) => {
    const Heading = n === 0 ? 'h1' : 'h2';
    return `
      <article class="promo-slide promo-${b.id}" role="group" aria-roledescription="slide" aria-label="${n + 1} of ${banners.length}" ${n === active ? '' : 'inert aria-hidden="true"'}>
        <div class="promo-media">
          ${b.img ? imgTag(b.img, b.alt, { widths: [800, 1280, 1800], sizes: '100vw', eager: n === 0 }) : ''}
        </div>
        <div class="promo-copy wrap">
          <${Heading}>${escapeHtml(b.title)}</${Heading}>
          <p>${escapeHtml(b.text)}</p>
          <div class="promo-actions">
            <a href="${b.href}" data-link class="btn promo-cta">${escapeHtml(b.cta)}</a>
            <a href="${b.href2}" data-link class="btn promo-cta-2">${escapeHtml(b.cta2)}</a>
          </div>
        </div>
      </article>`;
  }).join('')}
    </div>
    <button type="button" class="promo-arrow promo-prev" data-action="banner-prev" aria-label="Previous banner">${ico('chevron-left', 22)}</button>
    <button type="button" class="promo-arrow promo-next" data-action="banner-next" aria-label="Next banner">${ico('chevron', 22)}</button>
    <div class="promo-controls">
      <div class="promo-dots" role="group" aria-label="Choose a banner">
        ${banners.map((b, n) => `<button type="button" class="promo-dot ${n === active ? 'active' : ''}" data-action="banner-go" data-index="${n}" aria-label="Show banner ${n + 1}: ${escapeHtml(b.title)}" ${n === active ? 'aria-current="true"' : ''}></button>`).join('')}
      </div>
      <button type="button" class="promo-pause" data-action="banner-toggle" aria-label="${bannerPaused() ? 'Play' : 'Pause'} automatic sliding">${ico(bannerPaused() ? 'play' : 'pause', 14)}</button>
    </div>
  </div>
</section>`;
}

let bannerTimer = null;

function showBanner(index, { user = false } = {}) {
  const el = root?.querySelector('.promo');
  if (!el) return;
  const count = Number(el.dataset.count) || 1;
  const next = ((index % count) + count) % count;
  ui.bannerIndex = next;
  el.querySelector('.promo-track').style.transform = `translateX(-${next * 100}%)`;
  el.querySelectorAll('.promo-slide').forEach((slide, n) => {
    slide.toggleAttribute('inert', n !== next);
    if (n === next) slide.removeAttribute('aria-hidden');
    else slide.setAttribute('aria-hidden', 'true');
  });
  el.querySelectorAll('.promo-dot').forEach((dot, n) => {
    dot.classList.toggle('active', n === next);
    if (n === next) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  if (user) restartBannerTimer();
}

function stopBannerTimer() {
  clearInterval(bannerTimer);
  bannerTimer = null;
}

function restartBannerTimer() {
  stopBannerTimer();
  if (!root?.querySelector('.promo') || bannerPaused()) return;
  bannerTimer = setInterval(() => {
    const host = root?.querySelector('.promo');
    if (!host) { stopBannerTimer(); return; }
    // Never slide while the visitor is reading, hovering or using the controls.
    if (document.hidden || host.matches(':hover') || host.querySelector(':focus-visible')) return;
    showBanner((ui.bannerIndex || 0) + 1);
  }, 6000);
}

function setupBanner() {
  const el = root?.querySelector('.promo');
  if (!el) { stopBannerTimer(); return; }
  let startX = null;
  const viewport = el.querySelector('.promo-viewport');
  viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) showBanner((ui.bannerIndex || 0) + (dx < 0 ? 1 : -1), { user: true });
  }, { passive: true });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showBanner((ui.bannerIndex || 0) - 1, { user: true });
    if (e.key === 'ArrowRight') showBanner((ui.bannerIndex || 0) + 1, { user: true });
  });
  restartBannerTimer();
}

function home() {
  return `
<main class="home-page">
  ${promoCarousel()}
  <section class="g-feature">
    <div class="wrap g-feature-grid">
      ${[
  ['/menu', 'Order meals', 'Ready-made bowls, adjusted to your portion and taste.', meals[0].img, 'Order now', `${meals[0].name} bowl`],
  ['/build', 'Build a bowl', 'Every ingredient, with price and macros shown as you go.', meals[3].img, 'Start building', `${meals[3].name} bowl`],
  ['/meal-plans', 'Meal plans', 'A week of meals sized to your calorie target.', meals[1].img, 'Plan my week', `${meals[1].name} bowl`],
]
  .map(
    ([href, t, d, img, cta, alt]) => `
          <article class="g-feature-card">
            ${imgTag(img, alt, { widths: [420, 720], sizes: '(max-width: 700px) 92vw, 380px' })}
            <h2>
              ${t}
            </h2>
            <p>
              ${d}
            </p>
            ${link(href, cta, 'btn btn-primary')}
          </article>
        `,
  )
  .join('')}
    </div>
  </section>
  <section class="g-section g-section-cream">
    <div class="wrap">
      <h2>
        Our most-ordered bowls
      </h2>
      ${ui.booting ? skeletonCards(4) : `<div class="g-tiles">
        ${meals
  .filter((m) => m.popular)
  .map((m) => card(m))
  .join('')}
      </div>`}
    </div>
  </section>
  <section class="g-how" id="how-it-works" aria-labelledby="how-title">
    <div class="wrap">
      <h2 id="how-title">How pickup works</h2>
      <ol class="g-steps">
      <li class="g-step">
        <span class="g-step-num" aria-hidden="true">01</span>
        <h3>Pick your bowls</h3>
        <p>Browse the menu, choose a regular or large portion, and add your bowls to the cart.</p>
      </li>
      <li class="g-step">
        <span class="g-step-num" aria-hidden="true">02</span>
        <h3>Choose a pickup window</h3>
        <p>Tell us the day and the time window. We prepare it fresh for when you arrive.</p>
      </li>
      <li class="g-step">
        <span class="g-step-num" aria-hidden="true">03</span>
        <h3>Pay at pickup</h3>
        <p>No fees and no prepayment. Pay in cash when you collect your order.</p>
      </li>
      </ol>
    </div>
  </section>
</main>
`;
}

// js/pages/menu.js
function menu() {
  const list = meals.filter(
    (m) =>
      (ui.category === 'All meals' || m.category === ui.category) &&
      (m.name + ' ' + m.description + ' ' + m.category)
        .toLowerCase()
        .includes(ui.query.toLowerCase()),
  );
  const filters = ['All meals', 'High Protein', 'Balanced', 'Plant-Based'];

  return `
<main>
  ${title('GOOD FOOD STARTS HERE', 'Order meals', 'Tap a bowl to customize it.')}
  <div class="wrap menu-space">
    <div class="menu-toolbar">
      <div class="filter-row" role="group" aria-label="Filter menu">
        ${filters
  .map(
    (f) => `
              <button class="filter-chip ${ui.category === f ? 'selected' : ''}" data-action="filter" data-value="${f}" aria-pressed="${ui.category === f}">
                ${f}
              </button>
            `,
  )
  .join('')}
      </div>
      <label class="search-field">
        ${ico('search', 18)}
        <input id="meal-search" type="search" placeholder="Search meals" value="${escapeHtml(ui.query)}" aria-label="Search meals" data-search/>
        <span class="sr-only">
          Search meals
        </span>
      </label>
    </div>
    <div id="menu-results">
      ${ui.booting ? skeletonCards(8) : menuResults(list)}
    </div>
  </div>
  ${mobileCartBar()}
</main>
`;
}

function menuResults(list) {
  return `
${list.length
  ? `
      <div class="g-tiles">
        ${list.map((m, i) => card(m, { priority: i < 2 })).join('')}
      </div>
    `
  : `
      <div class="empty-state">
        <h3>
          No meals found
        </h3>
        <p>
          Try another search or see all meals
        </p>
        <button class="btn btn-outline" data-action="reset-filters">
          See all meals
        </button>
      </div>
    `
}
`;
}

// js/pages/scheduling.js
const planSchedule = () =>
  createSchedule({
    start: store.plan.start,
    days: Number(store.plan.days),
    periods: store.plan.periods,
    weekdaysOnly: Number(store.plan.days) === 5,
  });

const subOffer = () => OFFERS.find((o) => o.id === store.subscription.offerId) || OFFERS[0];

const subSchedule = () => {
  // No subscription cycle is created until a customer chooses a package.
  if (!OFFERS.some((o) => o.id === store.subscription.offerId)) return [];
  const o = subOffer();
  return createSchedule({
    start: store.subscription.start,
    days: o.days,
    periods: o.periods,
    weekdaysOnly: o.days === 5 || o.days === 20,
  });
};

const dateOptions = () => `min="${defaultStart()}"`;

const scheduleSection = (kind, schedule, assignments, target = 0, kcalByDay = {}) => {
  return `
<div class="schedule-list">
  ${groupByDay(schedule)
  .map(
    ([date, slots], i) => `
        <section class="day-panel">
          <div class="day-date">
            <span>
              DAY ${String(i + 1).padStart(2, '0')}
            </span>
            <h3>
              ${displayDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            ${kind === 'plan' || kind === 'subscription'
        ? `
                  <div class="kcal-line ${target > 0 && kcalByDay[date] > target ? 'over' : ''}">
                    ${Math.round(kcalByDay[date] || 0)} kcal${target > 0 ? ` of ${target}` : ''}${target > 0 && kcalByDay[date] > target
          ? `
                        ·
                        <strong>
                          ${Math.round(kcalByDay[date] - target)} over your daily target
                        </strong>
                      `
          : ''}
                  </div>
                `
        : ''}
          </div>
          <div class="day-slots">
            ${slots
        .map((slot) => {
          const selection = assignments[slot.id];
          const meal = selection ? mealById(selection.productId) : null;
          return `
                  <div class="slot ${meal ? 'filled' : ''}">
                    <div class="slot-type">
                      <span class="slot-period">
                        ${escapeHtml(slot.period)}
                      </span>
                      ${meal
              ? `
                            <span class="slot-set">
                              ${ico('check', 13)} Selected
                            </span>
                          `
              : `
                            <span class="slot-open">
                              Not selected
                            </span>
                          `}
                    </div>
                    ${meal
              ? `
                          <div class="slot-filled">
                            <img src="${sizedUrl(meal.img, 240)}" alt="${escapeHtml(meal.name)} bowl" loading="lazy" decoding="async"/>
                            <div>
                              <strong>
                                ${escapeHtml(meal.name)}
                              </strong>
                              <span>
                                ${money(mealTotal(meal, selection.custom).price)} · ${escapeHtml(selection.custom.portion)} portion
                              </span>
                            </div>
                            <button class="edit-round" aria-label="Change ${escapeHtml(slot.period)} for ${date}" data-action="slot-choose" data-kind="${kind}" data-slot="${slot.id}">
                              ${ico('edit', 17)}
                            </button>
                          </div>
                          <div class="slot-links">
                            <button data-action="slot-copy" data-kind="${kind}" data-slot="${slot.id}">
                              Copy to empty ${escapeHtml(slot.period.toLowerCase())} slots
                            </button>
                            <button data-action="slot-clear" data-kind="${kind}" data-slot="${slot.id}">
                              Clear
                            </button>
                          </div>
                        `
              : `
                          <button class="empty-slot" data-action="slot-choose" data-kind="${kind}" data-slot="${slot.id}">
                            ${ico('plus', 19)} Choose a meal
                          </button>
                        `}
                  </div>
                `;
        })
        .join('')}
          </div>
        </section>
      `,
  )
  .join('')}
</div>
`;
};

// Scheduled meals begins with one shared choice. The plan and repeat-package
// flows retain their own state, pricing, review and checkout rules afterwards.
function scheduledModePicker(active) {
  const oneTime = active === 'plan';
  return `
<section class="wrap scheduled-mode" aria-label="Choose scheduled meal type">
  <div class="scheduled-mode-intro">
    <p class="eyebrow">Scheduled meals</p>
    <div>
      <h2>Choose how you’d like to plan</h2>
      <p>Start with one flexible schedule, or set up a repeat package. You can customize every meal either way.</p>
    </div>
  </div>
  <div class="scheduled-mode-options">
    <a class="scheduled-mode-card ${oneTime ? 'is-selected' : ''}" href="/meal-plans" data-link ${oneTime ? 'aria-current="page"' : ''}>
      <span class="scheduled-mode-kicker">One time</span>
      <h3>Meal plan</h3>
      <p>Build a 5- or 7-day schedule for the dates you choose. No automatic renewal.</p>
      <span class="scheduled-mode-action">Build a plan ${ico('arrow', 16)}</span>
    </a>
    <a class="scheduled-mode-card ${!oneTime ? 'is-selected' : ''}" href="/subscriptions" data-link ${!oneTime ? 'aria-current="page"' : ''}>
      <span class="scheduled-mode-kicker">Repeat</span>
      <h3>Meal package</h3>
      <p>Choose a weekly or monthly package, then fill the first cycle with meals you like.</p>
      <span class="scheduled-mode-action">Choose a package ${ico('arrow', 16)}</span>
    </a>
  </div>
  <p class="scheduled-mode-note">Repeat packages keep their own terms and review step. They are never mixed with a one-time plan.</p>
</section>`;
}

// js/pages/meal-plans.js
function mealPlans() {
  const schedule = planSchedule();
  const summary = scheduledSummary(schedule, store.plan.assignments);
  const target = Number(store.plan.target) || 0;
  const kcalByDay = dailyKcal(schedule, store.plan.assignments);
  const over = overTargetDays(kcalByDay, target);

  return `
  <main>
    ${title(
  'SCHEDULED MEALS',
  'Plan once or make it a habit.',
  'Choose the schedule that fits you, then customize every meal around your routine.',
)}
    ${scheduledModePicker('plan')}
    <div class="wrap page-layout">
      <div class="main-col">
        <section class="config-card">
          <div class="step-title">
            <span>
              01
            </span>
            <div>
              <h2>
                Make your plan
              </h2>
              <p>
                Choose when you'd like us to prepare your meals
              </p>
            </div>
          </div>
          <div class="config-fields">
            <label>
              How many days?
              <select data-plan="days" required>
                <option value="" ${!store.plan.days ? 'selected' : ''} disabled>Choose the number of days</option>
                <option value="5" ${store.plan.days === 5 ? 'selected' : ''}>
                  5 weekdays (Monday–Friday)
                </option>
                <option value="7" ${store.plan.days === 7 ? 'selected' : ''}>
                  7 consecutive days
                </option>
              </select>
            </label>
            <label>
              Start date
              <input type="date" data-plan="start" value="${store.plan.start}" ${dateOptions()} required/>
            </label>
          </div>
          <div class="period-chooser">
            <strong>
              1 · Pick your goal
            </strong>
            <div class="period-pills">
              ${PLAN_PROGRAMS.map((p) => `
                <button type="button" class="period-pill ${store.plan.program === p.id ? 'selected' : ''}" data-action="plan-program" data-id="${p.id}" title="${escapeHtml(p.note)}">
                  ${escapeHtml(p.name)}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="period-chooser">
            <strong>
              2 · Which meals do you want?
            </strong>
            <div class="period-pills">
              ${['Breakfast', 'Lunch', 'Dinner']
    .map(
      (p) => `
                    <label class="period-pill ${store.plan.periods.includes(p) ? 'selected' : ''}">
                      <input data-period="${p}" type="checkbox" ${store.plan.periods.includes(p) ? 'checked' : ''}/>
                      ${p}
                    </label>
                  `,
    )
    .join('')}
            </div>
          </div>
        </section>
        <section class="config-card">
          <div class="step-title">
            <span>
              02
            </span>
            <div>
              <h2>
                Set your daily calories
              </h2>
              <p>
                Enter a target, or get a personalized estimate in the Calorie Guide. We'll warn you if a day goes over
              </p>
            </div>
          </div>
          <div class="config-fields">
            <label>
              Daily calorie target (kcal)
              <input type="number" min="0" step="50" data-plan="target" value="${target || ''}" placeholder="e.g. 1800"/>
            </label>
          </div>
          <div class="plan-calorie-guide">
            <div>
              <strong>Not sure of your target?</strong>
              <p>Use the Calorie Guide for a clearer estimate, then apply it directly to this meal plan.</p>
            </div>
            <a href="/calorie-calculator" data-link class="btn btn-outline">Open Calorie Guide</a>
          </div>
        </section>
        <section class="slots-section">
          <div class="step-title">
            <span>
              03
            </span>
            <div>
              <h2>
                Fill your days with something good
              </h2>
              <p>
                Auto-fill a week that fits your target, then swap anything you like
              </p>
            </div>
          </div>
          <button class="btn btn-outline" data-action="plan-autofill">
            Auto-fill empty meals for my target
          </button>
          ${schedule.length
            ? scheduleSection('plan', schedule, store.plan.assignments, target, kcalByDay)
            : '<div class="schedule-empty-note">Choose the number of days, start date, and meal periods to create your schedule.</div>'}
        </section>
      </div>
      <aside class="sticky-aside">
        <div class="review-box">
          <h3>
            Looking good so far
          </h3>
          <div class="progress">
            <div style="width:${summary.count ? (summary.filled / summary.count) * 100 : 0}%">
            </div>
          </div>
          <div class="progress-label">
            <span>
              ${summary.filled} of ${summary.count} meals selected
            </span>
            <strong>
              ${summary.count ? Math.round((summary.filled / summary.count) * 100) : 0}%
            </strong>
          </div>
          ${over.length
    ? `
                <div class="kcal-warning" role="alert">
                  <strong>
                    Over your daily calorie target
                  </strong>
                  <span>
                    ${over.length} ${over.length === 1 ? 'day is' : 'days are'} above ${target} kcal (highest: ${Math.round(Math.max(...over.map((d) => d.kcal)))} kcal). Swap a meal or adjust your target
                  </span>
                </div>
              `
    : ''}
          ${summaryRows(summary.value)}
          <div class="soft-note">
            ${ico('calendar', 18)} Pickup dates and times are subject to availability
          </div>
          <div class="soft-note">
            ${ico('calendar', 18)} One-time plan only. Never renews automatically
          </div>
          <button class="btn btn-primary full" data-action="plan-review" ${summary.count === 0 || summary.filled !== summary.count ? 'disabled' : ''}>
            Review your plan
          </button>
          ${summary.filled < summary.count
    ? `
                <small class="aside-help">
                  Choose ${summary.count - summary.filled} more ${summary.count - summary.filled === 1 ? 'meal' : 'meals'} to continue
                </small>
              `
    : ''}
        </div>
      </aside>
    </div>
  </main>
`;
}

const selectionTable = (schedule, assignments) => `
<div class="review-meals">
  ${groupByDay(schedule)
  .map(
    ([date, slots]) => `
        <div class="review-day">
          <strong>
            ${displayDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}
          </strong>
          ${slots
        .map((slot) => {
          const sel = assignments[slot.id];
          const m = sel && mealById(sel.productId);
          return `
                <div>
                  <span>
                    ${slot.period}
                  </span>
                  <b>
                    ${m ? escapeHtml(m.name) : 'Not selected'}
                  </b>
                  <span>
                    ${m ? money(mealTotal(m, sel.custom).price) : '—'}
                  </span>
                </div>
              `;
        })
        .join('')}
        </div>
      `,
  )
  .join('')}
</div>
`;

function planReview() {
  const schedule = planSchedule();
  const summary = scheduledSummary(schedule, store.plan.assignments);

  if (!summary.count || summary.filled !== summary.count) {
    return `
<main class="wrap review-page">
  <h1>
    Your meal plan needs a few more meals
  </h1>
  ${link('/meal-plans', 'Continue planning')}
</main>
`;
  }

  return `
<main class="wrap review-page">
  ${crumb('Review Meal Plan')}
  <div class="review-grid">
    <div>
      <h1>
        Everything in its place
      </h1>
      <p class="lead">
        Take one last look at your planned meals before pickup details
      </p>
      <div class="review-panel">
        ${selectionTable(schedule, store.plan.assignments)}
      </div>
    </div>
    <aside>
      <div class="review-box">
        <h3>
          Your plan summary
        </h3>
        <p>
          ${summary.count} meals · ${store.plan.days} days · from ${displayDate(schedule[0].date)}
        </p>
        ${summaryRows(summary.value)}
        <div class="soft-note">
          No recurring charges. This plan is purchased once
        </div>
        <button type="button" class="btn btn-primary full" data-action="open-cart-review" data-kind="plan">Review in cart</button>
        ${link('/meal-plans', 'Edit schedule', 'text-btn full')}
      </div>
    </aside>
  </div>
</main>
`;
}

// js/pages/subscriptions.js
function subscriptions() {
  return `
  <main>
    ${title(
  'SCHEDULED MEALS',
  'Make good food part of your routine.',
  'Choose a repeat package after comparing it with a one-time meal plan.',
)}
    ${scheduledModePicker('subscription')}
    <div class="wrap subscriptions-space">
      <div class="section-heading offer-intro">
        <div>
          <h2>
            Choose a repeat package
          </h2>
        </div>
        <p>
          Select a package for your first cycle. Its pricing, selections, and review stay separate from one-time meal plans.
        </p>
      </div>
      <div class="offer-grid">
        ${OFFERS.map(offerCard).join('')}
      </div>
    </div>
  </main>
`;
}

function subscriptionCustomize() {
  if (!OFFERS.some((offer) => offer.id === store.subscription.offerId)) {
    return `<main class="wrap review-page"><h1>Choose your package</h1>
      <p class="lead">Select a subscription package before choosing your meals.</p>
      ${link('/subscriptions', 'Explore packages', 'btn btn-primary')}</main>`;
  }
  const o = subOffer();
  const schedule = subSchedule();
  const summary = scheduledSummary(schedule, store.subscription.assignments, o.discountRate, true);
  const target = Number(store.subscription.target) || 0;
  const kcalByDay = dailyKcal(schedule, store.subscription.assignments);
  const over = overTargetDays(kcalByDay, target);
  const f = ui.calorieForm;

  return `
  <main>
    ${title(
  'YOUR ROUTINE, YOUR RULES',
  `Make ${escapeHtml(o.name)} yours`,
  `Your meals for one ${o.frequency} cycle, with the estimated total updating as you go`,
)}
    <div class="wrap page-layout">
      <div class="main-col">
        <section class="config-card">
          <div class="step-title">
            <span>
              01
            </span>
            <div>
              <h2>
                Set your first pickup
              </h2>
              <p>
                ${o.description} · ${o.frequency} pickup schedule
              </p>
            </div>
          </div>
          <div class="config-fields">
            <label>
              First pickup date
              <input type="date" value="${store.subscription.start}" data-sub-start ${dateOptions()} required/>
            </label>
            <div class="small-rule">
              <span>
                Offer
              </span>
              <strong>
                ${escapeHtml(o.name)}
              </strong>
              <a href="/subscriptions" data-link>
                Change package
              </a>
            </div>
          </div>
        </section>
        <section class="config-card subscription-calorie-settings">
          <div class="step-title">
            <span>02</span>
            <div>
              <h2>Set your daily calories</h2>
              <p>Set a target and see a warning when your selected meals go over.</p>
            </div>
          </div>
          <div class="config-fields">
            <label>
              Daily calorie target (kcal)
              <input type="number" min="0" step="50" data-sub-target
                value="${target || ''}" placeholder="e.g. 1800" />
            </label>
          </div>
          <details class="plan-calc">
            <summary>Not sure? Calculate my daily calories</summary>
            <div class="plan-calc-grid">
              ${[
                ['age', 'Age', '18+'],
                ['height', 'Height (cm)', '165'],
                ['weight', 'Weight (kg)', '60'],
              ].map(([key, label, placeholder]) => `
                <label>${label}
                  <input type="number" data-calorie="${key}"
                    value="${escapeHtml(String(f[key] ?? ''))}" placeholder="${placeholder}" />
                </label>
              `).join('')}
              <label>Sex
                <select data-calorie="sex">
                  <option value="" disabled ${!f.sex ? 'selected' : ''}>Choose a formula</option>
                  <option value="female" ${f.sex === 'female' ? 'selected' : ''}>Female</option>
                  <option value="male" ${f.sex === 'male' ? 'selected' : ''}>Male</option>
                </select>
              </label>
              <label>Activity
                <select data-calorie="activity">
                  <option value="" disabled ${!f.activity ? 'selected' : ''}>Choose your activity level</option>
                  ${[
                    ['1.2', 'Little or no exercise'],
                    ['1.375', 'Light (1–3 days/wk)'],
                    ['1.55', 'Moderate (3–5 days/wk)'],
                    ['1.725', 'Very active (6–7 days/wk)'],
                    ['1.9', 'Extra active'],
                  ].map(([value, label]) => `
                    <option value="${value}" ${String(f.activity) === value ? 'selected' : ''}>
                      ${label}
                    </option>
                  `).join('')}
                </select>
              </label>
              <label>Goal
                <select data-calorie="goal">
                  <option value="" disabled ${!f.goal ? 'selected' : ''}>Choose your goal</option>
                  ${[
                    ['maintain', 'Maintain'],
                    ['loss', 'Lose weight'],
                    ['gain', 'Gain weight'],
                  ].map(([value, label]) => `
                    <option value="${value}" ${f.goal === value ? 'selected' : ''}>
                      ${label}
                    </option>
                  `).join('')}
                </select>
              </label>
            </div>
            <button type="button" class="btn btn-outline" data-action="sub-calc">
              Calculate and use as my target
            </button>
            ${ui.calorieResult && !ui.calorieResult.valid ? `
              <p class="calc-err" role="alert">${escapeHtml(ui.calorieResult.message)}</p>
            ` : ''}
            <small>Calorie estimate based on Mifflin–St Jeor. Individual needs vary.</small>
          </details>
        </section>
        <section class="slots-section">
          <div class="step-title">
            <span>
              03
            </span>
            <div>
              <h2>
                Make every meal yours
              </h2>
              <p>
                Choose what sounds good. Fill future ${o.periods.join(' and ').toLowerCase()}s with one click
              </p>
            </div>
          </div>
          ${schedule.length
            ? scheduleSection('subscription', schedule, store.subscription.assignments, target, kcalByDay)
            : '<div class="schedule-empty-note">Choose your first pickup date to create your meal schedule.</div>'}
        </section>
      </div>
      <aside class="sticky-aside">
        <div class="review-box">
          <h3>
            ${escapeHtml(o.name)}
          </h3>
          <div class="progress">
            <div style="width:${summary.count ? (summary.filled / summary.count) * 100 : 0}%">
            </div>
          </div>
          <div class="progress-label">
            <span>
              ${summary.filled} of ${summary.count} meals selected
            </span>
            <strong>
              ${Math.round((summary.filled / (summary.count || 1)) * 100)}%
            </strong>
          </div>
          <div class="subscription-calorie-overview">
            <strong>Daily calories</strong>
            <span>${target ? `Target: ${target.toLocaleString('en-PH')} kcal / day` : 'Set a daily calorie target above'}</span>
          </div>
          ${over.length ? `
            <div class="kcal-warning" role="alert" aria-live="assertive">
              <strong>Calorie target exceeded</strong>
              <span>
                ${over.length} ${over.length === 1 ? 'day is' : 'days are'} above ${target.toLocaleString('en-PH')} kcal.
                Highest planned day: ${Math.round(Math.max(...over.map((day) => day.kcal)))} kcal.
                Change a meal or adjust your target.
              </span>
            </div>
          ` : ''}
          ${summaryRows(summary.value, summary.savings, true)}
          <button class="btn btn-primary full" data-action="sub-review" ${summary.filled !== summary.count || !summary.count ? 'disabled' : ''}>
            Review package
          </button>
          ${summary.filled < summary.count
    ? `
                <small class="aside-help">
                  Select ${summary.count - summary.filled} remaining meals to continue
                </small>
              `
    : ''}
        </div>
      </aside>
    </div>
  </main>
`;
}

function subscriptionReview() {
  if (!OFFERS.some((offer) => offer.id === store.subscription.offerId)) {
    return `<main class="wrap review-page"><h1>Choose your package first</h1>
      ${link('/subscriptions', 'Explore packages', 'btn btn-primary')}</main>`;
  }
  const o = subOffer();
  const schedule = subSchedule();
  const s = scheduledSummary(schedule, store.subscription.assignments, o.discountRate, true);
  const target = Number(store.subscription.target) || 0;
  const kcalByDay = dailyKcal(schedule, store.subscription.assignments);
  const over = overTargetDays(kcalByDay, target);

  if (!s.count || s.filled !== s.count) {
    return `
<main class="wrap review-page">
  <h1>
    First finish choosing your meals
  </h1>
  ${link('/subscriptions/customize', 'Finish choosing')}
</main>
`;
  }

  return `
<main class="wrap review-page">
  ${crumb('Review Subscription')}
  <div class="review-grid">
    <div>
      <h1>
        A happy little habit
      </h1>
      <p class="lead">
        Review your first cycle, estimated price, and your preferred pickup schedule
      </p>
      <div class="review-panel">
        ${selectionTable(schedule, store.subscription.assignments)}
      </div>
      <div class="subscription-review-calories">
        <h2>Daily calorie breakdown</h2>
        ${Object.entries(kcalByDay).map(([date, kcal]) => `
          <div class="subscription-review-day ${target && kcal > target ? 'is-over' : ''}">
            <span>${displayDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <strong>${Math.round(kcal)} kcal${target ? ` / ${target} kcal` : ''}</strong>
          </div>
        `).join('')}
      </div>
    </div>
    <aside>
      <div class="review-box">
        <h3>
          ${escapeHtml(o.name)}
        </h3>
        ${over.length ? `
          <div class="kcal-warning" role="alert">
            <strong>Calorie target exceeded</strong>
            <span>${over.length} ${over.length === 1 ? 'day exceeds' : 'days exceed'} your daily target. You can still edit your meals before checkout.</span>
          </div>
        ` : ''}
        ${summaryRows(s.value, s.savings, true)}
        <p class="renewal-terms">
          <b>
            First cycle:
          </b>
          ${money(s.total)} (estimated).
          <br/>
          <b>
            Future cycles:
          </b>
          Recalculated from eligible meal selections and approved promotion terms; a fixed amount is not guaranteed.
          <br/>
          <b>
            Frequency:
          </b>
          ${o.frequency}
          <br/>
          <b>
            Cancellation:
          </b>
          Must be defined and confirmed by the business before activation
        </p>
        <button type="button" class="btn btn-primary full" data-action="open-cart-review" data-kind="subscription">Review in cart</button>
        ${link('/subscriptions/customize', 'Edit meals', 'text-btn full')}
      </div>
    </aside>
  </div>
</main>
`;
}


// A dedicated cart-review step sits between selecting meals and pickup checkout.
// Regular meals, one-time plans and subscription cycles retain separate orders;
// they are not merged or double-counted together.
function availableCartKinds() {
  const kinds = [];
  if (store.cart.length) kinds.push('cart');
  const plan = scheduledSummary(planSchedule(), store.plan.assignments);
  if (plan.count && plan.filled) kinds.push('plan');
  const subscription = scheduledSummary(
    subSchedule(), store.subscription.assignments, subOffer().discountRate,
  );
  if (subscription.count && subscription.filled) kinds.push('subscription');
  return kinds;
}

function cartReview() {
  const kinds = availableCartKinds();
  const preferred = ui.cartReviewKind || 'cart';
  const kind = kinds.includes(preferred) ? preferred : kinds[0] || 'cart';
  ui.cartReviewKind = kind;
  const isCart = kind === 'cart';
  const isPlan = kind === 'plan';
  const schedule = isCart ? null : isPlan ? planSchedule() : subSchedule();
  const assignments = isPlan ? store.plan.assignments : store.subscription.assignments;
  const result = isCart
    ? cartSummary(store.cart)
    : isPlan
      ? scheduledSummary(schedule, assignments)
      : scheduledSummary(schedule, assignments, subOffer().discountRate);
  const complete = isCart ? store.cart.length > 0 : result.count > 0 && result.count === result.filled;
  const label = isCart ? 'Meals' : isPlan ? 'Meal Plan' : 'Subscription';
  const editPath = isCart ? '/menu' : isPlan ? '/meal-plans' : '/subscriptions/customize';
  const subtotal = isCart ? result.subtotal : result.value;
  const discount = isCart ? 0 : result.savings;
  const total = result.total;
  const itemCount = isCart ? store.cart.reduce((count, item) => count + item.quantity, 0) : result.count;
  const itemLabel = isCart ? (itemCount === 1 ? 'bowl' : 'bowls') : (itemCount === 1 ? 'scheduled meal' : 'scheduled meals');
  const orderType = isCart ? 'Ready-made order' : isPlan ? 'One-time meal plan' : 'Repeat meal package';
  // Do not infer VAT registration or display an unverified VAT charge.

  const items = isCart
    ? store.cart.map((item) => {
      const product = mealById(item.productId);
      if (!product) return '';
      const calculated = mealTotal(product, item.custom);
      const unitKcal = Math.round(calculated.nutrients?.kcal || 0);
      return `<article class="cart-review-item">
        ${imgTag(product.img, `${product.name} bowl`, { widths: [160, 280], sizes: '88px', cls: 'cart-thumb' })}
        <div class="cart-review-item-info">
          <strong>${escapeHtml(product.name)}</strong>
          <small>${money(calculated.price)} each</small>
          ${kcalChip(unitKcal, item.quantity)}
          <div class="cart-review-controls">
            <div class="qty" aria-label="Quantity controls">
              <button type="button" data-action="qty-dec" data-id="${escapeHtml(item.id)}" aria-label="Decrease quantity">${ico('minus', 14)}</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="qty-inc" data-id="${escapeHtml(item.id)}" aria-label="Increase quantity" ${item.quantity >= BUSINESS.maxLineQuantity ? 'disabled' : ''}>${ico('plus', 14)}</button>
            </div>
            <button type="button" class="cart-review-link" data-action="cart-edit" data-id="${escapeHtml(item.id)}">Edit</button>
            <button type="button" class="cart-review-link" data-action="cart-remove" data-id="${escapeHtml(item.id)}">Remove</button>
          </div>
        </div>
        <strong class="cart-review-price">${money(calculated.price * item.quantity)}</strong>
      </article>`;
    }).join('')
    : `<p class="cart-review-schedule-note">${result.filled} of ${result.count} scheduled meals selected.</p>
       ${selectionTable(schedule, assignments)}
       ${!isPlan ? (() => {
         const target = Number(store.subscription.target) || 0;
         const kcalByDay = dailyKcal(schedule, assignments);
         const over = overTargetDays(kcalByDay, target);
         return `<div class="cart-review-calorie-list">
           <h3>Daily calories</h3>
           ${Object.entries(kcalByDay).map(([date, kcal]) => `<div class="subscription-review-day ${target && kcal > target ? 'is-over' : ''}">
             <span>${displayDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
             <strong>${Math.round(kcal)} kcal${target ? ` / ${target} kcal` : ''}</strong>
           </div>`).join('')}
           ${over.length ? `<div class="kcal-warning" role="alert"><strong>Calorie target exceeded</strong><span>${over.length} ${over.length === 1 ? 'day is' : 'days are'} above your daily target. Edit your meals or target to adjust.</span></div>` : ''}
         </div>`;
       })() : ''}`;

  return `<main class="wrap cart-review-page">
    ${crumb('Your Cart')}
    <div class="cart-review-intro">
      <div><h1>Your cart</h1><p class="lead">Check your choices and total before entering pickup details.</p></div>
      ${kinds.length ? checkoutProgress(1) : ''}
    </div>
    ${!kinds.length ? `<section class="cart-review-empty">
      <div class="empty-icon">${ico('bag', 40)}</div>
      <h2>Your cart is empty</h2>
      <p>Nothing here yet. Pick a ready-made bowl or build your own and it will show up here.</p>
      <div class="empty-actions">
        ${link('/menu', 'Back to the menu', 'btn btn-primary')}
        ${link('/build', 'Build a bowl', 'btn btn-outline')}
      </div>
    </section>` : `
      ${kinds.length > 1 ? `<div class="cart-review-kinds" aria-label="Choose your pending order">
        ${kinds.map((option) => `<button type="button" data-action="cart-review-kind" data-kind="${option}" class="cart-review-kind ${kind === option ? 'selected' : ''}" aria-pressed="${kind === option}">
          ${option === 'cart' ? 'Meals' : option === 'plan' ? 'Meal Plan' : 'Subscription'}
        </button>`).join('')}
      </div>` : ''}
      ${isCart ? kcalBar(store.cart, 'cart-kcal') : ''}
      <div class="cart-review-grid">
        <section class="cart-review-panel">
          <div class="cart-review-panel-heading"><h2>${label}</h2>${link(editPath, isCart ? 'Add more meals' : 'Edit meal selections', 'cart-review-add')}</div>
          ${items}
        </section>
        <aside class="cart-review-sidebar">
          <div class="review-box">
            <h3>Order summary</h3>
            <div class="cart-summary-snapshot">
              <span>${itemCount} ${itemLabel}</span>
              <strong>${orderType}</strong>
            </div>
            <div class="summary-line"><span>Meal subtotal</span><strong>${money(subtotal)}</strong></div>
            ${discount > 0 ? `<div class="summary-line"><span>Package discount</span><strong>−${money(discount)}</strong></div>` : ''}
            <div class="summary-line"><span>Pickup</span><strong>Free</strong></div>
            ${orderTaxLines(orderTaxParts(subtotal, discount))}
            <div class="summary-line total"><span>Total · Cash at Pickup</span><strong>${money(total)}</strong></div>
            ${!complete ? `<p class="cart-review-incomplete">Complete the remaining meal selections before checkout.</p>` : ''}
            <div class="cart-next-steps">
              <div>${ico('calendar', 16)}<span><b>Pickup details next</b>Choose your date and preferred pickup time.</span></div>
              <div>${ico('check', 16)}<span><b>Cash at pickup</b>Your total is confirmed before you place the order.</span></div>
            </div>
            <button type="button" class="btn btn-primary full" data-action="cart-proceed-checkout" data-kind="${kind}" ${!complete ? 'disabled' : ''}>Continue to pickup details</button>
            <p class="cart-review-cod-note">You can review your details before the order is saved.</p>
          </div>
        </aside>
      </div>`}
  </main>`;
}

// Show selected options in checkout without making any extra charges.
function checkoutChoiceNotes(meal, custom = {}) {
  const details = mealPriceDetails(meal, custom);
  if (!details) return '';
  const additions = details.selections.map(choice =>
    `<div class="g-checkout-choice"><span>${escapeHtml(choice.label)}</span><span>+${money(choice.price)} / meal</span></div>`);
  const removals = details.notes
    .filter(note => /Removed:/.test(note))
    .map(note => `<div class="g-checkout-choice"><span>${escapeHtml(note)}</span></div>`);
  if (!additions.length && !removals.length) return '';
  return `<div class="g-checkout-choices">${[...additions, ...removals].join('')}</div>`;
}

// js/core/orders.js
function collectCodRequest(kind) {
  const account = getAccount();
  if (!account) throw new Error('Please sign in before submitting a pickup request.');
  const schedule = kind === 'plan' ? planSchedule() : kind === 'subscription' ? subSchedule() : null;
  const pickupName = store.checkout.name.trim();
  const pickupPhone = store.checkout.phone.replace(/[\s-]/g, '');
  const branch = pickupBranch(store.checkout.pickupBranch);
  const pickup = {
    locationName: `${branch.name} · ${branch.address}`,
    branchId: branch.id,
    branchName: branch.name,
    date: kind === 'cart' ? store.checkout.date : schedule[0]?.date,
    time: store.checkout.time,
    contactName: pickupName,
    contactPhone: pickupPhone,
    instructions: store.checkout.instructions.trim(),
  };
  const cart = kind === 'cart' ? cartSummary(store.cart) : null;
  const scheduled = kind === 'plan'
    ? scheduledSummary(schedule, store.plan.assignments)
    : kind === 'subscription'
      ? scheduledSummary(schedule, store.subscription.assignments, subOffer().discountRate)
      : null;
  const summary = cart || scheduled;
  if (!summary) throw new Error('There are no meals to order.');
  const lineItem = (productId, quantity, custom, slot = '') => {
    const product = mealById(productId);
    const unitPrice = product ? mealTotal(product, custom).price : 0;
    return {
      productId,
      quantity,
      custom,
      label: product?.name || 'Selected meal',
      // Preserve the customer's exact selections and per-serving charges at checkout.
      // This makes historic receipts stable if menu prices change later.
      priceBreakdown: product ? mealPriceDetails(product, custom) : null,
      estimatedLineTotal: Math.round(unitPrice * quantity * 100) / 100,
      ...(slot ? { slot } : {}),
    };
  };

  const items = kind === 'cart'
    ? store.cart.map(({ productId, quantity, custom }) => lineItem(productId, quantity, custom))
    : schedule
      .filter((slot) => (kind === 'plan' ? store.plan.assignments : store.subscription.assignments)[slot.id])
      .map((slot) => {
        const selected = (kind === 'plan' ? store.plan.assignments : store.subscription.assignments)[slot.id];
        return lineItem(selected.productId, 1, selected.custom, slot.id);
      });
  return {
    kind,
    payment: 'cash_on_pickup',
    fulfillment: 'customer_pickup',
    customer: {
      name: pickupName,
      phone: pickupPhone,
      email: account.email,
    },
    pickup,
    items,
    // Snapshot the breakdown at checkout so older orders retain their original
    // quantities, prices and discounts when the menu changes.
    pricing: {
      itemSubtotal: pesoRound(cart ? cart.subtotal : scheduled.value),
      discount: pesoRound(scheduled?.savings || 0),
      ...orderTaxParts(cart ? cart.subtotal : scheduled.value, scheduled?.savings || 0),
    },
    schedule: kind === 'plan'
      ? { days: Number(store.plan.days), periods: [...store.plan.periods] }
      : kind === 'subscription' ? { offerId: store.subscription.offerId } : null,
    // Displayed prices are estimates pending merchant verification.
    estimatedTotal: Math.round(Number(summary.total) * 100) / 100,
  };
}

const LOCAL_ORDERS_PREFIX = 'gillys-offline-orders-v1:';
const PENDING_PICKUP_KEY = 'gillys2-pending-pickup-v1';

function clearPendingPickup() {
  ui.pendingOrder = null;
  try { globalThis.sessionStorage?.removeItem(PENDING_PICKUP_KEY); } catch {}
}

function publicOrderReference(order) {
  const id = String(order?.id || '');
  if (!id.startsWith('LOCAL-')) return id;
  // Deterministic display-only alias for earlier browser-saved orders.
  const date = new Date(order?.created_at || Date.now());
  const d = Number.isNaN(date.getTime()) ? new Date() : date;
  const dateCode = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d).replace(/\D/g, '');
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `GLY-${dateCode}-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

function legacyOrdersForAccount(email) {
  try {
    const records = JSON.parse(localStorage.getItem(LOCAL_ORDERS_PREFIX + normalizeEmail(email)) || '[]');
    return Array.isArray(records) ? records.filter(order => order?.id && normalizeEmail(order.customer?.email) === email)
      .map(order => ({ ...order, local_only: true })) : [];
  } catch { return []; }
}

async function submitCodRequest(preview) {
  const fingerprint = new Uint8Array(await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(JSON.stringify(preview))));
  const signature = Array.from(fingerprint, byte => byte.toString(16).padStart(2, '0')).join('');
  let pending = ui.pendingOrder;
  if (!pending) {
    try { pending = JSON.parse(globalThis.sessionStorage?.getItem(PENDING_PICKUP_KEY) || 'null'); } catch {}
  }
  if (pending?.signature !== signature || !/^[a-f0-9-]{36}$/i.test(pending.requestId || '')) {
    pending = { signature, requestId: crypto.randomUUID() };
  }
  ui.pendingOrder = pending;
  try { globalThis.sessionStorage?.setItem(PENDING_PICKUP_KEY, JSON.stringify(pending)); } catch {}
  const order = await customerApi('order', {
    requestId: ui.pendingOrder.requestId, kind: preview.kind, pickup: preview.pickup,
    schedule: preview.schedule, estimatedTotal: preview.estimatedTotal,
    taxTreatment: preview.pricing.taxTreatment,
    items: preview.items.map(({ productId, quantity, custom, slot }) => ({ productId, quantity, custom, slot })),
  });
  clearPendingPickup();
  return order;
}

async function confirmOrderPickup(orderId, received) {
  const order = ui.orders.find(order => order.id === orderId);
  if (!order || order.local_only) throw Error('This order is unavailable for pickup updates.');
  const updated = await customerApi('pickup', { id: orderId, version: order.version, received });
  ui.orders = ui.orders.map(order => order.id === updated.id ? updated : order);
  if (ui.lastCodOrder?.id === updated.id) ui.lastCodOrder = updated;
}

function isOrderPage(path) {
  return ['/orders', '/receipt', '/order-confirmation'].includes(path);
}

async function loadOrders() {
  const email = getAccount()?.email;
  if (!email || ui.ordersLoading) return;
  const load = Symbol();
  ui.orderLoad = load;
  ui.ordersLoading = true;
  ui.ordersError = '';
  if (isOrderPage(currentPath())) render({ keepScroll: true });
  try {
    const orders = [];
    let cursor = null;
    do {
      const result = await customerApi('orders', undefined, cursor ? '?after=' + encodeURIComponent(cursor) : '');
      orders.push(...result.orders);
      cursor = result.cursor;
    } while (cursor && ui.orderLoad === load);
    if (ui.orderLoad !== load) return;
    ui.orders = [...orders, ...legacyOrdersForAccount(email)];
    ui.ordersLoaded = true;
  } catch (error) {
    if (ui.orderLoad !== load) return;
    ui.ordersError = error.message;
    if (!ui.ordersLoaded) ui.orders = legacyOrdersForAccount(email);
  } finally {
    if (ui.orderLoad === load) {
      ui.ordersLoading = false;
      if (isOrderPage(currentPath())) render({ keepScroll: true });
    }
  }
}

// js/pages/checkout.js
function pickupContactSection() {
  const c = store.checkout;
  const contactName = c.name;
  const contactPhone = c.phone;
  const branch = pickupBranch(c.pickupBranch);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapQuery)}`;
  return `
    <div class="checkout-address-heading"><h2>Pickup information</h2></div>
    <div class="checkout-address-fields">
      <div class="form-cols">
        <label>Pickup contact name
          <input type="text" data-checkout="name" maxlength="100" value="${escapeHtml(contactName)}" placeholder="e.g. Maria Santos" autocomplete="name" required />
          <span class="error-text" data-error="name"></span>
        </label>
        <label>Pickup contact number
          <input type="tel" data-checkout="phone" value="${escapeHtml(contactPhone)}" placeholder="e.g. 09171234567" autocomplete="tel" inputmode="tel" required />
          <span class="error-text" data-error="phone"></span>
        </label>
      </div>
      <label class="pickup-branch-select">
        Choose your pickup branch
        <select data-checkout="pickupBranch" required>
          ${PICKUP_BRANCHES.map((option) => `<option value="${option.id}" ${option.id === branch.id ? 'selected' : ''}>${escapeHtml(option.name)} · ${escapeHtml(option.area)}</option>`).join('')}
        </select>
        <span class="error-text" data-error="pickupBranch"></span>
      </label>
      <div class="pickup-location-card" aria-label="Selected pickup location">
        ${ico('map-pin', 20)}
        <div>
          <span class="pickup-location-label">Pickup from</span>
          <strong>${escapeHtml(branch.name)}</strong>
          <p>${escapeHtml(branch.address)}</p>
          <small>Metro Manila pickup · Free customer pickup · Your order summary is shown before you collect.</small>
          <a class="pickup-map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Open in Google Maps ${ico('arrow', 14)}</a>
        </div>
      </div>
    </div>
  `;
}

const checkoutGate = (kind) => {
  const next = `/checkout/${kind}`;
  return `
<main class="wrap checkout-page gate-box">
  ${crumb('Pickup & checkout')}
  <h1>
    Sign in to check out
  </h1>
  <p class="lead">
    Sign in to enter your pickup details, or create an account if you’re new. Your meal selections will stay ready.
  </p>
  <div class="account-actions">
    <button type="button" class="btn btn-primary" data-action="auth-go" data-target="/signin" data-next="${next}">
      Sign in
    </button>
    <button type="button" class="btn btn-outline" data-action="auth-go" data-target="/signup" data-next="${next}">
      New here? Create an account first
    </button>
  </div>
</main>
`;
};

function checkout(kind) {
  const valid = ['cart', 'plan', 'subscription'].includes(kind);
  if (!valid) return notFound();

  const c = store.checkout;
  const schedule = kind === 'plan' ? planSchedule() : kind === 'subscription' ? subSchedule() : [];
  const s =
    kind === 'cart'
      ? cartSummary(store.cart)
      : kind === 'plan'
        ? scheduledSummary(schedule, store.plan.assignments)
        : scheduledSummary(
          schedule,
          store.subscription.assignments,
          subOffer().discountRate,
        );

  const hasItems = kind === 'cart' ? store.cart.length > 0 : s.filled === s.count && s.count > 0;

  const titlekind =
    kind === 'cart'
      ? 'your order'
      : kind === 'plan'
        ? 'your meal plan'
        : 'your subscription';

  if (!hasItems) {
    return `
  <main class="wrap review-page">
    <section class="cart-review-empty">
      <div class="empty-icon">${ico('bag', 40)}</div>
      <h1>There’s nothing to check out yet</h1>
      <p>Choose some meals first and we’ll bring you right back here.</p>
      <div class="empty-actions">
        ${link(
  kind === 'cart' ? '/menu' : kind === 'plan' ? '/meal-plans' : '/subscriptions',
  kind === 'cart' ? 'Back to the menu' : 'Find your meals',
  'btn btn-primary',
)}
      </div>
    </section>
  </main>
`;
  }

  const account = getAccount();
  if (!account) return checkoutGate(kind);

  return `
<main class="wrap checkout-page">
  ${crumb('Pickup & checkout')}
  <div class="checkout-grid">
    <div>
      <h1>
        Review ${titlekind}
      </h1>
      <p class="lead">
        Check your meals, pickup details, and total.
      </p>
      ${checkoutProgress(2)}
      <form id="checkout-form" novalidate>
        <section class="form-panel">
          ${pickupContactSection()}
          <div class="pickup-schedule">
            <div class="pickup-schedule-heading">
              ${ico('calendar', 18)}
              <div>
                <strong>Choose pickup time</strong>
                <span>${kind === 'cart'
    ? 'Choose a pickup date and your preferred time window.'
    : `Scheduled pickup dates: ${kind === 'plan'
      ? `${store.plan.days} days beginning ${displayDate(schedule[0].date)}`
      : `${subOffer().days} days beginning ${displayDate(schedule[0].date)}`}`}</span>
              </div>
            </div>
            ${kind === 'cart'
  ? `
                <label class="pickup-date-field">
                  Requested pickup date
                  <input type="date" data-checkout="date" value="${escapeHtml(c.date && c.date >= earliestCartDate() ? c.date : '')}" min="${earliestCartDate()}" required/>
                  <small class="sample-slot-notice">
                    Pickup times depend on kitchen availability.
                  </small>
                  <span class="error-text" data-error="date">
                  </span>
                </label>
              `
  : ''}
            <label class="pickup-time-field">
              Preferred pickup time window
              <select data-checkout="time" required>
                <option value="">
                  Choose a pickup time
                </option>
                ${(kind === 'cart'
  ? demoCartSlots(c.date)
  : BUSINESS.timeSlots
)
  .map(
    (t) => `
                    <option value="${escapeHtml(t)}" ${c.time === t ? 'selected' : ''}>
                      ${escapeHtml(t)}
                    </option>
                  `,
  )
  .join('')}
              </select>
              <span class="error-text" data-error="time">
              </span>
            </label>
          </div>
          <label>
            Pickup instructions
            <span class="optional">
              (optional)
            </span>
            <textarea data-checkout="instructions" maxlength="500" rows="3" placeholder="Additional pickup requests (optional)">
              ${escapeHtml(c.instructions)}
            </textarea>
          </label>
        </section>
        <section class="form-panel">
          <h2>
            Payment & confirmation
          </h2>
          <div class="checkout-cod-only" aria-label="Payment method">
            <strong>Cash at Pickup</strong>
            <p>Pay in cash when collecting your meals.</p>
          </div>
        </section>
        <div class="checkout-errors" role="alert" id="checkout-errors" hidden>
        </div>
        <button class="btn btn-primary checkout-submit" type="submit">
          Submit pickup request
        </button>

      </form>
    </div>
    <aside class="sticky-aside">
      <div class="review-box">
        <h3>
          Order Summary
        </h3>
        <p>
          ${kind === 'cart'
  ? `${store.cart.reduce((a, x) => a + x.quantity, 0)} items`
  : kind === 'plan'
    ? `${s.count} meals · one-time`
    : `${s.count} meals · pickup summary (one cycle)`}
        </p>
        ${kind === 'cart'
  ? store.cart
    .map((it) => {
      const m = mealById(it.productId);
      return m
        ? `
                      <div class="checkout-line">
                        <span>
                          ${it.quantity} × ${escapeHtml(m.name)}
                        </span>
                        <b>
                          ${money(mealTotal(m, it.custom).price * it.quantity)}
                        </b>
                      </div>
                      ${checkoutChoiceNotes(m, it.custom)}
                    `
        : '';
    })
    .join('')
  : ''}
        ${summaryRows(
    kind === 'cart' ? s.subtotal : s.value,
    kind === 'subscription' ? s.savings : 0,
    kind === 'subscription',
  )}
        ${kind === 'subscription'
  ? `
              <p class="renewal-terms">
                Your selection covers one pickup cycle. Future cycles require separate confirmation.
              </p>
            `
  : ''}
      </div>
    </aside>
  </div>
</main>
`;
}

function orderConfirmation() {
  const order = getAccount() ? (ui.lastCodOrder || ui.orders[0]) : null;
  const price = order ? receiptBreakdown(order) : null;
  const contact = order ? receiptDetails(order) : null;
  return `
<main class="wrap completed-page">
  <div class="completed-icon">${ico('check', 42)}</div>
  <span class="eyebrow">Gilly's · Customer Pickup</span>
  <h1>${order ? (order.local_only ? 'Pickup summary saved on this device' : 'Pickup request submitted') : 'Order summary'}</h1>
  ${order ? `
    <section class="g-confirmation-summary" aria-label="Saved pickup summary">
      <div class="g-confirmation-top">
        <div><span>Reference</span><strong>${escapeHtml(publicOrderReference(order))}</strong></div>
        <div><span>Pickup date &amp; time</span><strong>${escapeHtml([contact.date,contact.time].filter(Boolean).join(' · '))}</strong></div>
        <div class="g-confirmation-location"><span>Pickup location</span><strong>${escapeHtml(contact.address || GILLYS_PICKUP_LOCATION)}</strong></div>
        <div><span>Pickup contact</span><strong>${escapeHtml(contact.name)}${contact.phone ? ' · ' + escapeHtml(contact.phone) : ''}</strong></div>
        <div><span>Payment</span><strong>Cash at Pickup</strong></div>
      </div>
      <h2>Your meals</h2>
      ${price.rows.map(row => `<div class="g-confirmation-item">
        <div class="g-confirmation-meal"><span>${row.quantity} × ${escapeHtml(row.name)}</span><strong>${row.amount == null ? '—' : money(row.amount)}</strong></div>
        ${row.priceDetails ? `<div class="g-confirmation-item-details">
          <div><span>${escapeHtml(row.priceDetails.baseLabel)}</span><strong>${money(row.priceDetails.basePrice)} / serving</strong></div>
          ${row.priceDetails.selections.map(part => `<div><span>+ ${escapeHtml(part.label)}</span><strong>${money(part.price)} / serving</strong></div>`).join('')}
          ${row.priceDetails.notes.map(note => `<div><span>${escapeHtml(note)}</span></div>`).join('')}
        </div>` : ''}
      </div>`).join('')}
      <div class="g-confirmation-totals">
        <div><span>Meal subtotal</span><strong>${money(price.itemSubtotal)}</strong></div>
        ${price.discount > 0 ? `<div><span>Package discount</span><strong>−${money(price.discount)}</strong></div>` : ''}
        <div><span>Pickup</span><strong>Free</strong></div>
        ${price.taxTreatment === 'vat-inclusive' && price.taxAmount != null ? `
          <div><span>VATable sales (excluding VAT)</span><strong>${money(price.vatableSales)}</strong></div>
          <div><span>12% VAT (included)</span><strong>${money(price.taxAmount)}</strong></div>` : ''}
        ${price.taxTreatment === 'non-vat' ? '<div><span>VAT</span><strong>Not charged</strong></div>' : ''}
        <div class="g-confirmation-grand"><span>Total · Cash at Pickup</span><strong>${money(price.total)}</strong></div>
      </div>
    </section>
    <p class="g-confirmation-notice">${order.local_only ? 'This older summary is saved on this device only.' : 'Follow the status of your request in My Orders.'}</p>
  ` : '<p>View your saved pickup summaries under My Orders.</p>'}
  <div class="completed-links">
    ${order ? `<button type="button" class="btn btn-primary" data-action="order-receipt" data-id="${escapeHtml(order.id)}">View Full Summary</button>` : ''}
    ${link('/orders', 'My Orders', 'btn btn-outline')}
    ${link('/menu', 'Browse Meals', 'btn btn-outline')}
  </div>
</main>`;
}

// js/pages/account.js
const authValue = (key) => escapeHtml(ui.auth.values[key] || '');

const authError = (key) =>
  ui.auth.errors[key]
    ? `
      <span class="error-text" role="alert">
        ${escapeHtml(ui.auth.errors[key])}
      </span>
    `
    : '';

const authField = (key, label, type, attrs = '') => `
<label>
  <span>
    ${label}
  </span>
  <input data-auth="${key}" type="${type}" value="${authValue(key)}" ${attrs}/>
  ${authError(key)}
</label>
`;

const authPassword = (key, label, autocomplete) => `
<label>
  ${label}
  <span class="password-wrap">
    <input data-auth="${key}" type="password" autocomplete="${autocomplete}" required ${attrsForPassword(key)}/>
    <button type="button" class="password-toggle" data-action="toggle-password" aria-label="Show password">
      Show
    </button>
  </span>
  ${authError(key)}
</label>
`;

const attrsForPassword = (key) =>
  key === 'confirm'
    ? 'placeholder="Re-enter your password"'
    : 'placeholder="At least 8 characters"';

const authNotice = () => {
  if (ui.auth.general) {
    return `
      <div class="auth-alert" role="alert">
        ${escapeHtml(ui.auth.general)}
      </div>
    `;
  }
  if (ui.auth.notice) {
    return `
      <div class="service-note" role="status">
        ${escapeHtml(ui.auth.notice)}
      </div>
    `;
  }
  return '';
};

const authBrand = (purpose) => `
<div class="auth-brand" aria-label="gilly's — Good food, good days">
  <span class="auth-brand-lockup">
    <img class="auth-brand-mark"
      src="/assets/Cheerful Gilly Chef Mascot.png"
      alt="Gilly’s chef mascot" width="82" height="82" decoding="async" />
    <span class="auth-brand-copy">
      <span class="g-brand-wordmark auth-brand-wordmark">gilly's</span>
      <span class="auth-brand-tagline">Good food, good days</span>
    </span>
  </span>
</div>
<div class="auth-form-intro">
  <h2>${purpose === 'signup' ? 'Join Gilly’s' : 'Welcome back'}</h2>
  <p>${purpose === 'signup' ? 'Create your account to make ordering your favorites easier.' : 'Sign in to enjoy your favorites again.'}</p>
</div>
`;

const authFrame = (eyebrow, heading, sub, body) => `
<main class="auth-page">
  ${title(eyebrow, heading, sub)}
  <div class="wrap auth-wrap">
    <section class="form-panel auth-card">
      ${authNotice()}
      ${body}
    </section>
  </div>
</main>
`;

function signInPage() {
  return authFrame(
    'WELCOME BACK',
    'Sign in to Gilly’s.',
    'Return to your meal plans and pickup details where you left off.',
    `
${authBrand('signin')}
<form id="signin-form" class="auth-form" novalidate>
  ${authField('email', 'Email address', 'email', 'autocomplete="email" placeholder="e.g. maria@example.com" required')}
  ${authPassword('password', 'Password', 'current-password')}
  <button type="submit" class="btn btn-primary full">
    Sign in
  </button>
</form>
<div class="auth-links">
  <a href="/forgot-password" data-link>
    Forgot password?
  </a>
  <a href="/signup" data-link>
    New here? Create an account
  </a>
</div>

`,
  );
}

function signUpPage() {
  return authFrame(
    'GOOD TO HAVE YOU HERE',
    'Create your Gilly’s account.',
    'Create your account, then sign in with it to continue.',
    `
${authBrand('signup')}
<form id="signup-form" class="auth-form" novalidate>
  ${authField('name', 'Full name', 'text', 'autocomplete="name" placeholder="e.g. Maria Santos" required')}
  ${authField('email', 'Email address', 'email', 'autocomplete="email" placeholder="e.g. maria@example.com" required')}
  ${authField('phone', 'Mobile number <span class="optional">(optional)</span>', 'tel', 'autocomplete="tel" inputmode="tel" placeholder="e.g. 0917 123 4567"')}
  ${authPassword('password', 'Password', 'new-password')}
  ${authPassword('confirm', 'Confirm password', 'new-password')}
  <button type="submit" class="btn btn-primary full">
    Create account
  </button>
</form>
<div class="auth-links">
  <a href="/signin" data-link>
    Already have an account? Sign in
  </a>
</div>

`,
  );
}

function forgotPasswordPage() {
  return authFrame(
    'ACCOUNT HELP',
    'Account assistance',
    'Enter the email address linked to your account.',
    `
<form id="forgot-form" class="auth-form" novalidate>
  ${authField('email', 'Email address', 'email', 'autocomplete="email" placeholder="e.g. maria@example.com" required')}
  <button type="submit" class="btn btn-primary full">
    Request account assistance
  </button>
</form>
<div class="auth-links">
  <a href="/signin" data-link>
    Back to sign in
  </a>
</div>
`,
  );
}

const accountSignedOut = () => {
  return `
  <main>
    ${title(
  'GOOD TO HAVE YOU HERE',
  'Your Gilly’s account.',
  'One place for your details, meal plans and subscription drafts.',
)}
    <div class="wrap account-layout account-layout--single">
      <div class="account-box">
        <div class="account-icon">
          ${ico('user', 33)}
        </div>
        <h2>
          Sign in or create an account
        </h2>
        <p>
          Save your favorite meals and view previous pickup orders.
        </p>
        <div class="account-actions">
          <button type="button" class="btn btn-primary" data-action="auth-open" data-mode="signin">Sign in</button>
          <button type="button" class="btn btn-outline" data-action="auth-open" data-mode="signup">Create account</button>
        </div>
      </div>
      
    </div>
  </main>
`;
};

function orderHistory(account) {
  const orders = ui.orders;
  return `
<section class="demo-history" id="my-orders">
  
  ${ui.ordersLoading ? '<p class="caption">Loading your orders…</p>' : ''}
  ${ui.ordersError ? `<p class="checkout-errors" role="alert">${escapeHtml(ui.ordersError)}</p>` : ''}
  ${ui.ordersLoaded && !orders.length ? '<p class="caption">No pickup requests yet.</p>' : ''}
  ${orders.map((order) => `
    <article class="demo-history-item">
      <div>
        <strong>${escapeHtml(publicOrderReference(order))}</strong>
        <small>${escapeHtml(new Date(order.created_at).toLocaleDateString('en-PH'))} · ${escapeHtml(order.kind === 'cart' ? 'Meals' : order.kind === 'plan' ? 'Meal plan' : 'Subscription cycle')}</small>
        <small>${order.local_only ? 'Saved on this device only' : 'Status: ' + escapeHtml(order.status)}</small>
        ${order.status === 'Picked Up' && order.pickup_confirmation?.received
          ? '<small class="order-delivery-verified">Order pickup confirmed</small>' : ''}
        ${order.status === 'Pickup Issue'
          ? '<small class="order-delivery-alert">Pickup issue reported — the order is flagged for review.</small>' : ''}
        ${order.status === 'Ready for Pickup'
          ? '<small class="order-delivery-prompt">Has your order been collected?</small>' : ''}
        <small>Total: ${money(order.estimated_total)}</small>
        <small>Requested pickup: ${escapeHtml(order.pickup?.date || order.delivery_date || '')} · ${escapeHtml(order.pickup?.time || order.delivery_time || '')}</small>
        <small>Pickup location: ${escapeHtml(order.pickup?.locationName || GILLYS_PICKUP_LOCATION)}</small>
      </div>
      <div class="order-history-actions">
        ${order.status === 'Ready for Pickup' && !order.local_only ? `
          <button type="button" class="btn btn-primary order-delivery-confirm-button" data-action="pickup-confirm-collected" data-id="${escapeHtml(order.id)}">Confirm Picked Up</button>
          <button type="button" class="btn btn-outline order-delivery-issue-button" data-action="pickup-report-issue" data-id="${escapeHtml(order.id)}">Report Pickup Issue</button>
        ` : ''}
        <button type="button" class="btn btn-primary" data-action="order-receipt" data-id="${escapeHtml(order.id)}">View Summary</button>
        ${order.kind === 'cart' && order.items?.length ? `<button type="button" class="btn btn-outline" data-action="order-reorder" data-id="${escapeHtml(order.id)}">Reorder meals</button>` : ''}
      </div>
    </article>`).join('')}
  <button type="button" class="btn btn-outline" data-action="refresh-orders" ${ui.ordersLoading ? 'disabled' : ''}>Refresh orders</button>
</section>`;
}

const accountSignedIn = (account) => {
  const o = subOffer();
  const schedule = subSchedule();
  const filled = schedule.filter((slot) => store.subscription.assignments[slot.id]).length;
  const firstName = escapeHtml(String(account.name || '').split(' ')[0] || 'there');

  return `
  <main>
    ${title(
  'GOOD TO HAVE YOU HERE',
  `Hello, ${firstName}`,
  'Manage your contact details, saved meal plans, and pickup orders.',
)}
    <div class="wrap account-layout account-layout--single">
      <div class="account-box">
        <div class="account-icon">
          ${ico('user', 33)}
        </div>
        <h2>My Information</h2>
        <p>
          <strong>${escapeHtml(account.name)}</strong><br/>
          ${escapeHtml(account.email)}${account.phone ? ` · ${escapeHtml(account.phone)}` : ''}
        </p>
        <button type="button" class="btn btn-outline" data-action="contact-edit" aria-expanded="${ui.contactEditing}">
          ${ui.contactEditing ? 'Cancel edit' : 'Edit pickup contact'}
        </button>
        ${ui.contactEditing ? `
          <form id="pickup-contact-form" class="auth-form" novalidate>
            <label>Name <input id="pickup-contact-name" name="name" autocomplete="name" maxlength="100" value="${escapeHtml(account.name)}" required /></label>
            <label>Mobile number <input name="phone" type="tel" autocomplete="tel" value="${escapeHtml(account.phone || '')}" /></label>
            <p class="checkout-errors" role="alert"></p>
            <button type="submit" class="btn btn-primary">Save pickup contact</button>
          </form>` : ''}
        ${filled
    ? `
              <div class="draft-account">
                <h3>
                  ${escapeHtml(o.name)}
                </h3>
                <p>
                  ${filled} of ${schedule.length} meals selected
                </p>
                ${link('/subscriptions/customize', 'Edit package draft', 'btn btn-outline')}
              </div>
            `
    : ''}
        <div class="account-actions">
          ${link('/menu', 'Browse our menu')}
          <button type="button" class="btn btn-outline" data-action="sign-out">
            Sign out
          </button>
        </div>
      </div>
      
    </div>
  </main>
`;
};

function account() {
  const account = getAccount();
  return account ? accountSignedIn(account) : accountSignedOut();
}

function ordersPage() {
  const account = getAccount();
  if (!account) return `
<main class="wrap demo-history-page">
  <h1>Order History</h1>
  <p class="lead">Sign in to view your orders and receipts.</p>
  <button type="button" class="btn btn-primary" data-action="auth-go" data-target="/signin" data-next="/orders">Sign in</button>
</main>`;
  return `
<main class="wrap demo-history-page">
  <h1>Order History</h1>
  <p class="lead">Find your orders, check their status, and view or download an order summary.</p>
  
  ${orderHistory(account)}
  <div class="account-actions">
    ${link('/account', 'My Information', 'btn btn-outline')}
    ${link('/menu', 'Order more meals', 'btn btn-primary')}
  </div>
</main>`;
}

// js/pages/receipt.js
// Embed the receipt-only brand image so canvas export is not tainted by file:// or remote origins.
const RECEIPT_BRAND_DATA_URI = 'data:image/jpeg;base64,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';
// This document acknowledges an order request. It is NOT a paid sales receipt
// or an official BIR invoice. The amount is an estimate until Gilly's confirms it.
function getReceiptId() {
  const query = FILE_MODE ? location.hash.split('?')[1] || '' : location.search.slice(1);
  return new URLSearchParams(query).get('order') || ui.receiptOrderId || ui.lastCodOrder?.id || null;
}

function getReceiptOrder() {
  const id = getReceiptId();
  if (!id || !getAccount()) return null;
  return ui.orders.find((order) => order.id === id || publicOrderReference(order) === id)
    || (ui.lastCodOrder && (ui.lastCodOrder.id === id || publicOrderReference(ui.lastCodOrder) === id)
      ? ui.lastCodOrder : null);
}

// Keep the itemized checkout pricing and the customer receipt in agreement.
// Add-ons are charged per serving; removal choices do not reduce a meal's price.
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

function receiptItemPriceDetails(item, product, lineAmount, quantity) {
  const saved = item.priceBreakdown;
  const details = saved && Array.isArray(saved.selections)
    ? saved : (product ? mealPriceDetails(product, item.custom) : null);
  if (!details || lineAmount == null) return null;
  const base = Number(details.basePrice);
  if (!Number.isFinite(base)) return null;
  const selections = details.selections.map((selection) => ({
    label: String(selection.label || 'Added item'),
    price: Number(selection.price),
  }));
  if (selections.some((part) => !Number.isFinite(part.price))) return null;
  const pricedUnit = Math.round((base + selections.reduce((sum, part) => sum + part.price, 0)) * 100) / 100;
  const orderedUnit = Math.round((lineAmount / quantity) * 100) / 100;
  if (Math.abs(pricedUnit - orderedUnit) > 0.01) {
    // Do not show today's add-on prices against a historic order total.
    return { baseLabel: 'Price at order', basePrice: orderedUnit, selections: [], notes: [] };
  }
  return {
    baseLabel: String(details.baseLabel || 'Base meal'),
    basePrice: base,
    selections,
    notes: Array.isArray(details.notes) ? details.notes.map((v) => String(v)) : [],
  };
}

function receiptRows(order) {
  return (order.items || []).map((item, index) => {
    const product = mealById(item.productId);
    const quantity = Math.max(1, Number(item.quantity) || 1);
    // Earlier orders may not have a saved description or line amount.
    const name = String(item.label || product?.name || 'Selected meal');
    const amount = item.estimatedLineTotal !== undefined && item.estimatedLineTotal !== null && Number.isFinite(Number(item.estimatedLineTotal))
      ? Number(item.estimatedLineTotal)
      : (product ? mealTotal(product, item.custom || {}).price * quantity : null);
    return { number: index + 1, name, quantity, amount,
      priceDetails: receiptItemPriceDetails(item, product, amount, quantity) };
  });
}

function receiptDetails(order) {
  const customer = order.customer || {};
  const pickup = order.pickup || order.delivery || {};
  const details = {
    name: pickup.contactName || customer.name || order.name || '',
    phone: pickup.contactPhone || customer.phone || order.phone || '',
    address: pickup.locationName || GILLYS_PICKUP_LOCATION,
    email: customer.email || order.email || '',
    date: pickup.date || order.delivery_date || '',
    time: pickup.time || order.delivery_time || '',
    instructions: pickup.instructions || order.instructions || '',
  };
  return details;
}

// The same financial snapshot feeds the on-screen statement and PDF download.
// Do not imply VAT registration or add an unverified 12% charge to the total.
function receiptBreakdown(order) {
  const rows = receiptRows(order);
  const round = (number) => Math.round(Number(number || 0) * 100) / 100;
  const total = round(order.estimated_total);
  const sumOfItems = round(rows.reduce((sum, row) => sum + (row.amount ?? 0), 0));
  const allItemsPriced = rows.every((row) => row.amount != null);
  const stored = order.pricing;
  const hasSnapshot = stored
    && Number.isFinite(Number(stored.itemSubtotal))
    && Number.isFinite(Number(stored.discount));

  // Never calculate a tax amount from an unverified VAT-registration assumption.
  // Display only a separately verified tax snapshot, when one exists.
  const tax = {
    taxTreatment: ['vat-inclusive','non-vat'].includes(stored?.taxTreatment) ? stored.taxTreatment : 'unconfigured',
    taxAmount: stored?.taxTreatment === 'vat-inclusive' && stored?.taxAmount != null && Number.isFinite(Number(stored.taxAmount)) ? round(stored.taxAmount) : null,
    vatableSales: stored?.taxTreatment === 'vat-inclusive' && stored?.vatableSales != null && Number.isFinite(Number(stored.vatableSales)) ? round(stored.vatableSales) : null,
  };
  if (hasSnapshot) {
    const itemSubtotal = round(stored.itemSubtotal);
    const discount = round(stored.discount);
    const adjustment = round(total - (itemSubtotal - discount));
    return { rows, total, itemSubtotal, discount, adjustment, allItemsPriced, ...tax };
  }

  // Older records can reconcile the recorded total without inferring a fee.
  return {
    rows, total, itemSubtotal: allItemsPriced ? sumOfItems : null,
    discount: null,
    adjustment: allItemsPriced ? round(total - sumOfItems) : null,
    allItemsPriced,
    ...tax,
  };
}

function receiptDocument(order) {
  const info = receiptDetails(order);
  const breakdown = receiptBreakdown(order);
  const rows = breakdown.rows;
  const type = order.kind === 'plan' ? 'Meal plan' : order.kind === 'subscription' ? 'Subscription cycle' : 'Meals';
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  return `
    <article class="receipt-sheet" id="printable-receipt">
      <div class="receipt-topline">
        <div class="receipt-brand-lockup">
          <img class="receipt-brand-image" src="${RECEIPT_BRAND_DATA_URI}" alt="Gilly's chef mascot and complete cursive wordmark" width="320" height="97" />
        </div>
        <div class="receipt-heading">
          <strong>ORDER SUMMARY</strong>
          <small>Cash at pickup</small>
        </div>
      </div>
      <div class="receipt-meta">
        <div><span>Order reference</span><strong>${escapeHtml(publicOrderReference(order))}</strong></div>
        <div><span>Order date</span><strong>${escapeHtml(orderDate)}</strong></div>
        <div><span>Order type</span><strong>${escapeHtml(type)}</strong></div>
        <div><span>Status</span><strong>${escapeHtml(order.status || 'Pending confirmation')}</strong></div>
      </div>
      <section class="receipt-delivery-grid" aria-label="Pickup information">
        <div class="receipt-customer">
          <h2>Pickup contact</h2>
          <p><strong>${escapeHtml(info.name || 'Recipient not available')}</strong></p>
          ${info.phone ? `<p>${escapeHtml(info.phone)}</p>` : ''}
        </div>
        <div class="receipt-schedule">
          <h2>Pickup schedule</h2>
          ${info.address ? `<p><strong>Pickup location:</strong> ${escapeHtml(info.address)}</p>` : ''}
          <p>${escapeHtml([info.date, info.time].filter(Boolean).join(' · ') || 'To be confirmed')}</p>
          ${info.instructions ? `<p class="receipt-instructions">Notes: ${escapeHtml(info.instructions)}</p>` : ''}
        </div>
      </section>
      <div class="receipt-section-title"><h2>Items ordered</h2><span>${rows.reduce((sum, row) => sum + row.quantity, 0)} item(s)</span></div>
      <div class="receipt-table-wrap">
        <table class="receipt-items">
          <thead><tr><th>Meal</th><th>Unit price</th><th>Qty</th><th>Amount</th></tr></thead>
          <tbody>
            ${rows.map((row) => `<tr class="receipt-main-row">
              <td data-label="Meal"><strong>${escapeHtml(row.name)}</strong></td>
              <td data-label="Unit price">${row.amount == null ? '—' : money(row.amount / row.quantity)}</td>
              <td data-label="Qty">${row.quantity}</td>
              <td data-label="Amount">${row.amount == null ? '—' : money(row.amount)}</td>
            </tr>${row.priceDetails ? `<tr class="receipt-detail-row"><td colspan="4">
              <div class="receipt-itemization">
                <div class="receipt-itemization-head">Price details <span>Per serving</span></div>
                <div class="receipt-itemization-line"><span>${escapeHtml(row.priceDetails.baseLabel)}</span><strong>${money(row.priceDetails.basePrice)}</strong></div>
                ${row.priceDetails.selections.map((choice) => `<div class="receipt-itemization-line receipt-added-choice"><span>${escapeHtml(choice.label)}</span><strong>+${money(choice.price)}</strong></div>`).join('')}
                ${row.priceDetails.notes.map((note) => `<div class="receipt-itemization-note">${escapeHtml(note)}</div>`).join('')}
                <div class="receipt-itemization-subtotal"><span>Configured unit price</span><strong>${row.amount == null ? '—' : money(row.amount / row.quantity)}</strong></div>
                ${row.quantity > 1 ? `<div class="receipt-itemization-note">${row.quantity} × ${row.amount == null ? '—' : money(row.amount / row.quantity)} = ${row.amount == null ? '—' : money(row.amount)}</div>` : ''}
              </div>
            </td></tr>` : ''}`).join('')}
          </tbody>
        </table>
      </div>
      <section class="receipt-summary-card" aria-label="Order price breakdown">
        <div class="receipt-summary-head">
          <h2>Payment breakdown</h2>
          
        </div>
        <div class="receipt-totals">
          <div class="receipt-breakdown-row"><span>Meal subtotal</span><strong>${breakdown.itemSubtotal == null ? 'To be confirmed' : money(breakdown.itemSubtotal)}</strong></div>
          ${breakdown.discount != null && breakdown.discount > 0
            ? `<div class="receipt-breakdown-row receipt-discount"><span>Package discount</span><strong>−${money(breakdown.discount)}</strong></div>` : ''}
          <div class="receipt-breakdown-row"><span>Pickup</span><strong>Free</strong></div>
          ${breakdown.adjustment != null && Math.abs(breakdown.adjustment) >= 0.01
            ? `<div class="receipt-breakdown-row"><span>Price adjustment</span><strong>${money(breakdown.adjustment)}</strong></div>` : ''}
          ${breakdown.taxTreatment === 'vat-inclusive' && breakdown.taxAmount != null ? `
            <div class="receipt-breakdown-row receipt-tax"><span>VATable sales (excl. VAT)</span><strong>${money(breakdown.vatableSales)}</strong></div>
            <div class="receipt-breakdown-row"><span>12% VAT (included)</span><strong>${money(breakdown.taxAmount)}</strong></div>` : ''}
          ${breakdown.taxTreatment === 'non-vat' ? '<div class="receipt-breakdown-row"><span>VAT</span><strong>Not charged</strong></div>' : ''}
        </div>
        <div class="receipt-total">
          <span>Amount due at pickup</span>
          <strong>${money(breakdown.total)}</strong>
        </div>
      </section>
      <div class="receipt-payment-line"><span>Payment</span><strong>Cash at Pickup · Due on collection</strong></div>
    </article>`;
}

function receiptPage() {
  if (!getAccount()) return `
    <main class="wrap receipt-page">
      <h1>Sign in to view your receipt</h1>
      <button type="button" class="btn btn-primary" data-action="auth-open" data-mode="signin" data-next="/receipt">Sign in</button>
    </main>`;

  const order = getReceiptOrder();
  return `
    <main class="wrap receipt-page">
      <div class="receipt-toolbar">
        <div>
          <span class="eyebrow">ORDER DETAILS</span>
          <h1>Order Summary</h1>
        </div>
        <div class="receipt-actions">
          ${link('/orders', 'Back to Order History', 'btn btn-outline')}
          ${order ? `
            <button type="button" class="btn btn-primary" data-action="receipt-download">Download PDF</button>
            <button type="button" class="btn btn-outline" data-action="receipt-print">Print Summary</button>
          ` : ''}
        </div>
      </div>
      ${order ? receiptDocument(order) : `
        <section class="receipt-missing">
          ${ui.ordersLoading ? '<p>Loading your order…</p>' : '<p>Select an order from Order History to view its receipt.</p>'}
          ${ui.ordersError ? `<p role="alert">${escapeHtml(ui.ordersError)}</p>` : ''}
          ${link('/orders', 'View Order History', 'btn btn-primary')}
        </section>
      `}
    </main>`;
}

function openReceipt(id) {
  ui.receiptOrderId = id;
  go('/receipt');
  // Use the customer-facing GLY reference in the URL, including for old records.
  const order = ui.orders.find((entry) => entry.id === id)
    || (ui.lastCodOrder?.id === id ? ui.lastCodOrder : null);
  const ref = order ? publicOrderReference(order) : id;
  if (FILE_MODE) {
    location.hash = `/receipt?order=${encodeURIComponent(ref)}`;
  } else {
    const url = new URL(location.href);
    url.searchParams.set('order', ref);
    history.replaceState({}, '', url);
  }
}

// Load the PDF renderer only when downloading. HTML is the single source of
// truth, so the exported A4 PDF captures the same receipt sheet shown onscreen.
// The bundled renderer has no database/backend dependency. It is fetched from
// a fixed CDN URL on first use (internet required on the first download).
let receiptPdfLibraryPromise = null;
function loadReceiptPdfLibrary() {
  if (typeof window.html2pdf === 'function') return Promise.resolve();
  if (receiptPdfLibraryPromise) return receiptPdfLibraryPromise;
  const cdns = [
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.3/html2pdf.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.3/dist/html2pdf.bundle.min.js',
  ];
  receiptPdfLibraryPromise = new Promise((resolve, reject) => {
    const load = (index) => {
      if (index >= cdns.length) {
        reject(new Error('PDF download requires an internet connection. Please check your connection and try again.'));
        return;
      }
      const script = document.createElement('script');
      script.src = cdns[index];
      script.async = true;
      script.onload = () => {
        if (typeof window.html2pdf === 'function') resolve();
        else load(index + 1);
      };
      script.onerror = () => { script.remove(); load(index + 1); };
      document.head.appendChild(script);
    };
    load(0);
  }).catch((error) => { receiptPdfLibraryPromise = null; throw error; });
  return receiptPdfLibraryPromise;
}

let receiptPdfDownloading = false;
async function downloadReceiptPdf() {
  if (receiptPdfDownloading) return;
  const order = getReceiptOrder();
  const sheet = document.getElementById('printable-receipt');
  if (!order || !sheet) return;
  const button = document.querySelector('[data-action="receipt-download"]');
  receiptPdfDownloading = true;
  if (button) {
    button.disabled = true;
    button.textContent = 'Preparing PDF…';
  }
  try {
    await loadReceiptPdfLibrary();
    // Wait for the actual Gilly's receipt image and the website fonts to load.
    await Promise.all([...sheet.querySelectorAll('img')].map((img) => img.complete
      ? Promise.resolve() : new Promise((done) => { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); })));
    if (document.fonts?.ready) await document.fonts.ready;
    const filename = `Gillys_Order_${publicOrderReference(order)}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');
    const options = {
      margin: [6, 6, 6, 6], filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        logging: false, scrollY: 0, windowWidth: 1200,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.receipt-summary-card', '.receipt-total'] },
    };
    await window.html2pdf().set(options).from(sheet).save();
  } catch (error) {
    notify(error?.message || 'Unable to download the PDF. Please try again.');
    console.error('Gilly’s PDF download failed:', error);
  } finally {
    receiptPdfDownloading = false;
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = 'Download PDF Receipt';
    }
  }
}

// js/pages/information.js
function information() {
  return `
  <main>
    ${title(
  'A FEW GOOD THINGS TO KNOW',
  'Pickup & helpful details.',
  'Everything you need to know about ordering from Gilly’s.',
)}
    <div class="wrap faq-list">
      <section>
        <h2>Where do I pick up my order?</h2>
        <p>Choose your pickup branch at checkout. Check My Orders for the confirmed pickup location and time before heading out.</p>
      </section>
      <section>
        <h2>
          Can I order today?
        </h2>
        <p>
          Same-day pickup depends on preparation time and availability.
        </p>
      </section>
      <section>
        <h2>What do I need to collect my order?</h2>
        <p>Wait for your order to be marked Ready for Pickup, then bring your order reference and cash to your chosen branch.</p>
      </section>
      <section>
        <h2>
          Do Meal Plans renew?
        </h2>
        <p>
          No. Meal Plans are individual, one-time scheduled purchases. Subscriptions are separate recurring packages, and their renewals must be expressly disclosed and authorized
        </p>
      </section>
      <section>
        <h2>
          How does payment work?
        </h2>
        <p>
          Pay in cash when you collect your order at the selected branch. Pickup is free.
        </p>
      </section>
      <section>
        <h2>
          Are nutrition and allergen values final?
        </h2>
        <p>
          Nutrition figures are estimates and may vary with portions and ingredients. For allergen information, contact Gilly’s before ordering.
        </p>
      </section>
    </div>
  </main>
`;
}

function notFound() {
  return `
<main class="wrap completed-page">
  <h1>
    We couldn't find that page
  </h1>
  <p>
    There's always something good on the menu
  </p>
  ${link('/menu', 'Explore meals')}
</main>
`;
}

// js/pages/router.js
// One HTML file per page, organized by category.
// index.html stays at the root so the website opens directly and Cloudflare
// Pages can serve the home page automatically. No build or local server needed.
const PAGE_FILES = Object.freeze({
  '/': 'index.html',
  '/menu': 'pages/ordering/menu/menu.html',
  '/build': 'pages/ordering/build-a-bowl/build.html',
  '/calorie-calculator': 'pages/nutrition/calorie-guide/calorie-calculator.html',
  '/meal-plans': 'pages/meal-plans/overview/meal-plans.html',
  '/meal-plans/review': 'pages/meal-plans/review/meal-plans-review.html',
  '/subscriptions': 'pages/subscriptions/overview/subscriptions.html',
  '/subscriptions/customize': 'pages/subscriptions/customize/subscriptions-customize.html',
  '/subscriptions/review': 'pages/subscriptions/review/subscriptions-review.html',
  '/cart': 'pages/checkout/cart/cart.html',
  '/checkout/cart': 'pages/checkout/cart/checkout-cart.html',
  '/checkout/plan': 'pages/checkout/meal-plan/checkout-plan.html',
  '/checkout/subscription': 'pages/checkout/subscription/checkout-subscription.html',
  '/order-confirmation': 'pages/checkout/confirmation/order-confirmation.html',
  '/account': 'pages/account/profile/account.html',
  '/orders': 'pages/orders/history/orders.html',
  '/receipt': 'pages/orders/receipt/receipt.html',
  '/signin': 'pages/account/sign-in/signin.html',
  '/signup': 'pages/account/sign-up/signup.html',
  '/forgot-password': 'pages/account/password-recovery/forgot-password.html',
  '/information': 'pages/support/information/information.html',
  '/not-found': 'pages/support/not-found/not-found.html',
});

// Recognize direct links to any page, even when opened from a nested folder.
const FILE_ROUTES = Object.fromEntries(
  Object.entries(PAGE_FILES).map(([route, filename]) => [filename.split('/').at(-1), route]),
);

function pageFile(route) {
  return PAGE_FILES[normalizeRoute(route)] || PAGE_FILES['/not-found'];
}

function normalizeRoute(rawRoute) {
  let route = String(rawRoute || '/');

  if (route.includes('://')) {
    try {
      route = new URL(route).pathname;
    } catch {}
  }

  route = route.split('?')[0].split('#')[0];
  const basename = decodeURIComponent(route.split('/').filter(Boolean).at(-1) || '');

  // Named HTML files work by direct opening (file://) and on Cloudflare.
  if (basename.endsWith('.html')) {
    return FILE_ROUTES[basename] || '/not-found';
  }

  // Cloudflare Pages may also present index.html without its extension.
  if (route === '/index') return '/';

  // Cloudflare Pages may canonicalize /pages/.../menu.html to /pages/.../menu.
  if (route.includes('/pages/') && FILE_ROUTES[`${basename}.html`]) {
    return FILE_ROUTES[`${basename}.html`];
  }

  if (route.startsWith('/gillys-2.0')) {
    route = route.slice('/gillys-2.0'.length) || '/';
  }

  if (route.length > 1 && route.endsWith('/')) {
    route = route.slice(0, -1);
  }

  return route || '/';
}

const PAGE_TITLES = Object.freeze({
  '/': "Gilly's | Home",
  '/menu': "Gilly's | Order Meals",
  '/build': "Gilly's | Build a Bowl",
  '/calorie-calculator': "Gilly's | Calorie Guide",
  '/meal-plans': "Gilly's | Meal Plans",
  '/meal-plans/review': "Gilly's | Review Meal Plan",
  '/subscriptions': "Gilly's | Subscriptions",
  '/subscriptions/customize': "Gilly's | Customize Subscription",
  '/subscriptions/review': "Gilly's | Review Subscription",
  '/cart': "Gilly's | Your Cart",
  '/checkout/cart': "Gilly's | Cart Checkout",
  '/checkout/plan': "Gilly's | Meal Plan Checkout",
  '/checkout/subscription': "Gilly's | Subscription Checkout",
  '/order-confirmation': "Gilly's | Pickup Request",
  '/account': "Gilly's | Account",
  '/orders': "Gilly's | Order History",
  '/receipt': "Gilly's | Order Summary",
  '/signin': "Gilly's | Sign In",
  '/signup': "Gilly's | Create Account",
  '/forgot-password': "Gilly's | Password Help",
  '/information': "Gilly's | Pickup and FAQs",
  '/not-found': "Gilly's | Page Not Found",
});

const AUTH_ROUTES = { '/signin': 'signin', '/signup': 'signup', '/forgot-password': 'forgot' };

function routeView(route) {
  const norm = normalizeRoute(route);
  if (norm === '/') return home();
  if (norm === '/menu') return menu();
  if (norm === '/build') return builderPage();
  if (norm === '/calorie-calculator') return caloriePage();
  if (norm === '/meal-plans') return mealPlans();
  if (norm === '/meal-plans/review') return planReview();
  if (norm === '/subscriptions') return subscriptions();
  if (norm === '/subscriptions/customize') return subscriptionCustomize();
  if (norm === '/subscriptions/review') return subscriptionReview();
  if (norm === '/cart') return cartReview();
  if (norm.startsWith('/checkout/')) return checkout(norm.slice('/checkout/'.length));
  if (norm === '/order-confirmation') return orderConfirmation();
  if (norm === '/account') return account();
  if (norm === '/orders') return ordersPage();
  if (norm === '/receipt') return receiptPage();
  if (AUTH_ROUTES[norm]) return home();
  if (norm === '/information') return information();
  return notFound();
}

// js/app.js
// src/app.js
const root = document.getElementById('app');

// This shared script lives at the project root, so its own URL is a reliable
// base for links from all nested HTML pages (file:// and https://).
const WEBSITE_ROOT = new URL('./', document.currentScript.src);
const FILE_MODE = location.protocol === 'file:';

function currentPath() {
  if (FILE_MODE && location.hash.startsWith('#/')) {
    return normalizeRoute(location.hash.slice(1));
  }
  const path = location.pathname;
  const base = WEBSITE_ROOT.pathname;
  return normalizeRoute(path.startsWith(base) ? '/' + path.slice(base.length) : path);
}

function navigateTo(path) {
  const route = normalizeRoute(path);
  if (FILE_MODE) {
    // Stay on the same document locally so cart and form state are not lost.
    location.hash = route;
  } else {
    history.pushState({}, '', new URL(pageFile(route), WEBSITE_ROOT).href);
  }
}

function fixLocalLinksAndImages() {
  // Administrators can open the same portal from the footer on Cloudflare or file://.
  // The local preview uses the root hash route, sharing the demo's origin.
  root.querySelectorAll('a[data-staff-login]').forEach((link) => {
    link.href = new URL(FILE_MODE ? 'index.html#/admin/login' : 'admin/', WEBSITE_ROOT).href;
  });

  // Existing interactive templates use logical routes such as /menu.
  // Turn their links into real HTML file URLs without changing that logic.
  root.querySelectorAll('a[data-link][href]').forEach((link) => {
    const route = link.getAttribute('href');
    if (!route || route.startsWith('#') || route.includes('://')) return;
    link.dataset.route = route;
    link.setAttribute('href', new URL(pageFile(route), WEBSITE_ROOT).href);
  });

  // Images generated by the shared script must use the website's root too.
  root.querySelectorAll('[src^="/assets/"]').forEach((element) => {
    const asset = element.getAttribute('src').slice(1);
    element.setAttribute('src', new URL(asset, WEBSITE_ROOT).href);
  });
}
let toastTimer;

function render({ scroll = false, keepScroll = false } = {}) {
  if (!root) return;
  const oldY = window.scrollY;
  const focused = root.contains(document.activeElement) ? document.activeElement : null;
  ui.route = normalizeRoute(currentPath());
  const routeChanged = ui.renderedRoute !== ui.route;
  ui.renderedRoute = ui.route;
  document.title = PAGE_TITLES[ui.route] || PAGE_TITLES['/not-found'];
  // Sign-in, sign-up and password help always open as a modal over the page.
  if (AUTH_ROUTES[ui.route] && ui.overlay?.type !== 'auth') ui.overlay = { type: 'auth', mode: AUTH_ROUTES[ui.route] };
  syncCheckoutToAccount();

  // Scrollable panels are rebuilt on every render; remember where they were.
  const innerScroll = {};
  ['.drawer-items', '.custom-body', '.custom-scroll', '.chooser-grid'].forEach((selector) => {
    const node = root.querySelector(selector);
    if (node) innerScroll[selector] = node.scrollTop;
  });

  const overlayKey = ui.overlay ? `${ui.overlay.type}:${ui.overlay.mode || ''}` : '';
  const overlayChanged = overlayKey !== (ui.lastOverlayKey || '');
  const overlayOpening = overlayKey && !ui.lastOverlayKey;
  const overlayClosing = !overlayKey && ui.lastOverlayKey;
  const retainFocus = !routeChanged && !overlayChanged ? focusDescriptor(focused) : null;
  const selection = retainFocus && typeof focused.selectionStart === 'number'
    ? [focused.selectionStart, focused.selectionEnd] : null;
  if (overlayOpening) ui.returnFocus = focusDescriptor(focused);

  root.innerHTML = `${header()}${routeView(ui.route)}${footer()}${overlay()}${toast()}`;
  fixLocalLinksAndImages();
  document.body.classList.toggle('overlay-active', !!ui.overlay);
  Object.entries(innerScroll).forEach(([selector, top]) => {
    const node = root.querySelector(selector);
    if (node) node.scrollTop = top;
  });
  setupBanner();
  enhanceImages();
  markRequired();
  if (overlayKey && overlayKey !== ui.lastOverlayKey) {
    root.querySelector('.modal-backdrop, .drawer-backdrop')?.classList.add('is-entering');
  }
  if (overlayClosing && ui.returnFocus) {
    const target = (() => { try { return root.querySelector(ui.returnFocus); } catch { return null; } })();
    target?.focus({ preventScroll: true });
    ui.returnFocus = null;
  }
  ui.lastOverlayKey = overlayKey;

  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else if (keepScroll) {
    window.scrollTo({ top: oldY, behavior: 'instant' });
  }

  const focusScope = ui.overlay ? root.querySelector('[role="dialog"]') : root;
  const restored = retainFocus ? focusScope?.querySelector(retainFocus) : null;
  if (restored && !restored.disabled) {
    restored.focus({ preventScroll: true });
    if (selection) restored.setSelectionRange?.(...selection);
  } else if (ui.overlay) {
    const first = ui.overlay.type === 'auth' ? root.querySelector('.auth-modal input') : null;
    const button = first || root.querySelector('.modal .modal-x, .cart-drawer .drawer-head button');
    button?.focus({ preventScroll: true });
  } else if (routeChanged && scroll) {
    const heading = root.querySelector('main h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
}

function go(path) {
  const requested = normalizeRoute(path);
  if (AUTH_ROUTES[requested]) {
    openAuth(AUTH_ROUTES[requested]);
    return;
  }
  if (/^(Added to|Meal updated)/.test(ui.notification || '')) ui.notification = '';
  ui.overlay = null;
  ui.auth = freshAuth();
  ui.mobileNav = false;
  ui.menu = null;
  const target = requested;
  ui.authNext = ui.authNext && target === ui.authNext ? ui.authNext : null;
  if (!getAccount() && /^\/checkout\/(cart|plan|subscription)$/.test(target)) {
    // Keep the selected meals and return to checkout after sign-in.
    ui.authNext = target;
  }
  if (target === '/checkout/cart' && store.checkout.date && store.checkout.date < earliestCartDate()) {
    // An expired date is cleared, never replaced with a selection made for the customer.
    store.checkout.date = '';
    store.checkout.time = '';
  }
  if (target !== currentPath()) {
    navigateTo(target);
  }
  render({ scroll: true });
  if (isOrderPage(target) && !ui.ordersLoading) loadOrders();
}

function dismissToast() {
  clearTimeout(toastTimer);
  ui.notification = '';
  const node = root?.querySelector('.toast');
  if (!node) return;
  node.classList.add('is-leaving');
  setTimeout(() => node.remove(), 200);
}

function notify(msg, action = '') {
  ui.notification = msg;
  ui.notificationAction = action;
  clearTimeout(toastTimer);
  root.querySelector('.toast')?.remove();
  root.insertAdjacentHTML('beforeend', toast());
  root.querySelector('.toast')?.classList.add('is-entering');
  toastTimer = setTimeout(dismissToast, 4500);
}

async function submitAuth(kind, form) {
  const visitorDraft = kind === 'signin' && !getAccount() ? draftSnapshot() : null;
  const values = {};
  form.querySelectorAll('[data-auth]').forEach((el) => {
    values[el.dataset.auth] = el.value;
  });

  if (ui.authSubmitting) return;
  const button = form.querySelector('[type="submit"]');
  ui.authSubmitting = true;
  if (button) button.disabled = true;
  const result = await submitCustomerCredentials(kind, values, ui.auth.reset === true);
  ui.authSubmitting = false;
  if (button) button.disabled = false;

  if (result.ok && kind === 'signup') {
    ui.overlay = { type: 'auth', mode: 'signin' };
    ui.auth = { ...freshAuth(), values: { email: values.email }, notice: 'If your account needs email confirmation, open the link from Gilly’s first, then sign in.' };
    render({ keepScroll: true });
    return;
  }

  if (result.ok && kind === 'signin') {
    activateAccountDraft(result.session.email, visitorDraft);
    const firstName = String(result.session.name).split(' ')[0];
    const next = ui.authNext;
    ui.authNext = null;
    ui.overlay = null;
    ui.auth = freshAuth();
    // Stay on the current page unless a pending destination (such as checkout) was waiting.
    if (next) go(next);
    else if (AUTH_ROUTES[ui.route]) go('/');
    else render({ keepScroll: true });
    if (isOrderPage(currentPath())) loadOrders();
    notify(firstName ? `Welcome back, ${firstName}` : 'Welcome back');
    return;
  }

  if (result.ok && kind === 'forgot' && result.passwordReset) {
    ui.overlay = { type: 'auth', mode: 'signin' };
    ui.auth = { ...freshAuth(), notice: 'Password updated. You can now sign in.' };
    render({ keepScroll: true });
    root.querySelector('[data-auth="email"]')?.focus();
    return;
  }

  ui.auth = {
    values: { ...values, password: '', confirm: '' },
    errors: result.errors || {},
    general: result.general || '',
    notice: result.notice || '',
    reset: ui.auth.reset || null,
  };
  render({ keepScroll: true });
  const firstKey = Object.keys(ui.auth.errors)[0];
  if (firstKey) root.querySelector(`[data-auth="${firstKey}"]`)?.focus();
}

function syncCheckoutToAccount() {
  const account = getAccount();
  if (store.checkout.accountEmail === (account?.email || null)) return;
  Object.assign(store.checkout, {
    accountEmail: account?.email || null,
    name: account?.name || '',
    phone: account?.phone || '',
  });
}

async function submitPickupContact(form) {
  const account = getAccount();
  if (!account || profileSaving) return;
  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.replace(/[\s-]/g, '');
  const error = form.querySelector('[role="alert"]');
  if (name.length < 2 || name.length > 100 || (phone && !PH_MOBILE.test(phone))) {
    error.textContent = 'Enter your name and an 11-digit mobile number starting with 09, or leave the number blank.';
    return;
  }
  error.textContent = '';
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  const result = await updateAccountRecord(account.email, record => Object.assign(record, { name, phone }));
  if (!result.ok) {
    error.textContent = result.general;
    button.disabled = false;
    return;
  }
  if (store.checkout.name === account.name) store.checkout.name = name;
  if (store.checkout.phone === account.phone) store.checkout.phone = phone;
  ui.contactEditing = false;
  render({ keepScroll: true });
  root.querySelector('[data-action="contact-edit"]')?.focus();
  notify('Pickup contact updated');
}

function closeOverlay() {
  const wasAuth = ui.overlay?.type === 'auth';
  ui.overlay = null;
  if (wasAuth) { ui.auth = freshAuth(); ui.authNext = null; }
  // A sign-in URL has nothing of its own behind the modal; return to the homepage.
  if (AUTH_ROUTES[ui.route]) { go('/'); return; }
  render({ keepScroll: true });
}

function startCustomize(productId, kind = 'cart', slot = null, editId = null) {
  const meal = mealById(productId);
  if (!meal) return;
  if (productId === 'custom-bowl') {
    const selected = editId ? store.cart.find((item) => item.id === editId) : null;
    const assigned = slot
      ? (kind === 'plan' ? store.plan.assignments : store.subscription.assignments)[slot]
      : null;
    ui.builder = structuredClone((selected || assigned)?.custom?.builder || freshBuild());
    ui.builderContext = { kind, slot, editId };
    go('/build');
    return;
  }
  let custom = defaultCustomization();

  if (kind === 'cart' && editId) {
    const item = store.cart.find((it) => it.id === editId);
    if (item) custom = structuredClone(item.custom);
  }

  if (slot && (kind === 'plan' || kind === 'subscription')) {
    const item = (kind === 'plan' ? store.plan.assignments : store.subscription.assignments)[slot];
    if (item) custom = structuredClone(item.custom);
  }

  ui.overlay = {
    type: 'customize',
    productId,
    kind,
    slot,
    editId,
    custom,
  };
  render({ keepScroll: true });
}

function openChooser(kind, slot) {
  ui.overlay = {
    type: 'choose',
    kind,
    slot,
    period: slot.split('|')[1],
  };
  render({ keepScroll: true });
}


function cartAdd(info) {
  const fresh = makeItem(info.productId, info.custom, info.editId ? 1 : Math.min(99, Math.max(1, Number(info.quantity) || 1)));
  if (info.editId) {
    store.cart = store.cart.map((it) =>
      it.id === info.editId
        ? {
          ...it,
          productId: info.productId,
          custom: structuredClone(info.custom),
        }
        : it,
    );
  } else {
    const next = addOrIncrement(store.cart, fresh);
    if (next === store.cart) {
      notify('Cart limit reached. Reduce the quantity or remove a meal before adding more.');
      return false;
    }
    store.cart = next;
  }
  persist();
  ui.overlay = null;
  render({ keepScroll: true });
  notify(info.editId ? 'Meal updated in your cart' : 'Added to your cart', info.editId ? '' : 'view-cart');
  return true;
}

function scheduleAdd(info) {
  const assigns = info.kind === 'plan' ? store.plan.assignments : store.subscription.assignments;
  assigns[info.slot] = {
    productId: info.productId,
    custom: structuredClone(info.custom),
  };
  persist();
  ui.overlay = null;
  render({ keepScroll: true });
  if (info.kind === 'subscription') {
    const target = Number(store.subscription.target) || 0;
    const exceeded = overTargetDays(dailyKcal(subSchedule(), store.subscription.assignments), target);
    if (exceeded.length) {
      notify(`Calorie alert: ${exceeded.length} ${exceeded.length === 1 ? 'day is' : 'days are'} over your daily target.`);
    } else {
      notify('Meal added to your schedule');
    }
  } else {
    notify('Meal added to your schedule');
  }
}

function modifyCustom(element) {
  const info = ui.overlay;
  if (!info || info.type !== 'customize') return;
  const prior = root.querySelector('.custom-body')?.scrollTop || 0;

  const key = element.dataset.modifier;
  if (key) info.custom[key] = element.value;

  if (element.dataset.top) {
    const t = element.dataset.top;
    info.custom.toppings = element.checked
      ? [...new Set([...info.custom.toppings, t])]
      : info.custom.toppings.filter((x) => x !== t);
  }

  if (element.dataset.remove) {
    const t = element.dataset.remove;
    info.custom.removed = element.checked
      ? [...new Set([...(info.custom.removed || []), t])]
      : (info.custom.removed || []).filter((x) => x !== t);
  }

  render({ keepScroll: true });
  const body = root.querySelector('.custom-body');
  if (body) body.scrollTop = prior;
}

function updateSchedule(field, value) {
  if (field === 'days') store.plan.days = value ? Number(value) : 0;
  if (field === 'start') store.plan.start = value;
  if (field === 'target') store.plan.target = Math.max(0, Math.round(Number(value) || 0));
  persist();
  render({ keepScroll: true });
}

function validateCheckout(form, kind) {
  const values = store.checkout;
  const account = getAccount();
  const errors = {};
  const name = values.name.trim();
  const phone = values.phone.replace(/[\s-]/g, '');
  if (name.length < 2 || name.length > 100) errors.name = 'Enter the pickup contact name (2–100 characters)';
  if (!PH_MOBILE.test(phone)) errors.phone = 'Enter an 11-digit PH mobile number starting with 09';
  if (!account || !EMAIL_PATTERN.test(account.email)) errors.email = 'Sign in with a valid account';
  if (!PICKUP_BRANCHES.some((branch) => branch.id === values.pickupBranch)) errors.pickupBranch = 'Choose a Metro Manila pickup branch';
  if (kind === 'cart' && (!values.date || values.date < earliestCartDate())) errors.date = 'Choose an eligible requested pickup date';
  if (kind === 'cart' && values.date && values.time && !demoCartSlots(values.date).includes(values.time)) errors.time = 'Choose an available pickup time for this date';
  if (!values.time || !BUSINESS.timeSlots.includes(values.time)) errors.time = 'Select a pickup time window';
  if (kind !== 'cart') {
    const schedule = kind === 'plan' ? planSchedule() : subSchedule();
    const assignments = kind === 'plan' ? store.plan.assignments : store.subscription.assignments;
    if (!schedule.length || schedule[0].date < defaultStart() || schedule.some(slot => !assignments[slot.id])) {
      errors.schedule = 'Update your pickup dates and select a meal for every scheduled slot.';
    }
  }
  form.querySelectorAll('[data-error]').forEach(el => { el.textContent = errors[el.dataset.error] || ''; });
  const general = form.querySelector('#checkout-errors');
  if (Object.keys(errors).length) {
    general.hidden = false;
    general.textContent = errors.schedule || 'Please correct the highlighted pickup details';
    form.querySelector(`[data-error="${Object.keys(errors)[0]}"]`)?.closest('label')?.querySelector('input,select')?.focus();
    return false;
  }
  general.hidden = true;
  return true;
}

// Render the exact items and financial snapshot the customer is about to save.
function pickupConfirmationReview(preview) {
  const moneyRow = (label, value, className = '') =>
    `<div class="g-preconfirm-row ${className}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  const rows = (preview.items || []).map(item => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const details = item.priceBreakdown;
    const options = Array.isArray(details?.selections) ? details.selections : [];
    const notes = Array.isArray(details?.notes) ? details.notes.filter(x => /Removed:/.test(x)) : [];
    return `<div class="g-preconfirm-item">
      ${moneyRow(`${qty} × ${item.label || 'Meal'}`, money(item.estimatedLineTotal))}
      ${options.map(opt => `<div class="g-preconfirm-option"><span>${escapeHtml(opt.label)}</span><span>+${money(opt.price)} / meal</span></div>`).join('')}
      ${notes.map(note => `<div class="g-preconfirm-option"><span>${escapeHtml(note)}</span></div>`).join('')}
    </div>`;
  }).join('');
  const p = preview.pricing || {};
  return `<div class="g-preconfirm-review">
    <div class="g-preconfirm-schedule">
      ${moneyRow('Pickup', preview.pickup?.locationName || GILLYS_PICKUP_LOCATION)}
      ${moneyRow('Schedule', [preview.pickup?.date, preview.pickup?.time].filter(Boolean).join(' · '))}
      ${moneyRow('Pickup contact', preview.customer?.name || '')}
    </div>
    <h3>Meals</h3>
    ${rows}
    <div class="g-preconfirm-totals">
      ${moneyRow('Meal subtotal', money(p.itemSubtotal))}
      ${Number(p.discount) > 0 ? moneyRow('Package discount', `−${money(p.discount)}`) : ''}
      ${moneyRow('Pickup', 'Free')}
      ${p.taxTreatment === 'vat-inclusive' && p.taxAmount != null ? `
        ${moneyRow('VATable sales (excluding VAT)', money(p.vatableSales))}
        ${moneyRow('12% VAT (included)', money(p.taxAmount))}` : ''}
      ${p.taxTreatment === 'non-vat' ? moneyRow('VAT', 'Not charged') : ''}
      ${moneyRow('Total · Cash at Pickup', money(preview.estimatedTotal), 'g-preconfirm-grand')}
    </div>
  </div>`;
}

// Consistent Gilly's confirmation dialog with an accessible question-mark icon.
// The secondary action stays on the left; the affirmative action stays on the right.
function askCustomerConfirmation({ title, message, confirmLabel = 'Yes, Confirm', detailsHtml = '', progress = 0 }) {
  return new Promise((resolve) => {
    document.querySelector('.g-confirm-overlay')?.remove();
    const previouslyFocused = document.activeElement;
    const host = document.createElement('div');
    host.className = 'g-confirm-overlay';
    host.innerHTML = `
      <section class="g-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="g-confirm-title" aria-describedby="g-confirm-message">
        ${progress ? checkoutProgress(progress) : ''}
        <div class="g-confirm-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="50" height="50" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="24" cy="24" r="21"></circle>
            <path d="M17.5 17.5a7 7 0 1 1 10.8 6c-2.5 1.8-4.3 2.8-4.3 6.1"></path>
            <circle cx="24" cy="34.5" r="1.2" fill="currentColor" stroke="none"></circle>
          </svg>
        </div>
        <h2 id="g-confirm-title">${escapeHtml(title)}</h2>
        <p id="g-confirm-message">${escapeHtml(message)}</p>
        ${detailsHtml}
        <div class="g-confirm-actions">
          <button type="button" class="g-confirm-cancel" data-choice="cancel">Cancel</button>
          <button type="button" class="g-confirm-accept" data-choice="confirm">${escapeHtml(confirmLabel)}</button>
        </div>
      </section>`;
    let completed = false;
    const finish = (answer) => {
      if (completed) return;
      completed = true;
      host.removeEventListener('keydown', onKeydown);
      host.remove();
      previouslyFocused?.focus?.({ preventScroll: true });
      resolve(answer);
    };
    const onKeydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); finish(false); }
      if (event.key !== 'Tab') return;
      const buttons = [...host.querySelectorAll('button')];
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault(); buttons.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === buttons.at(-1)) {
        event.preventDefault(); buttons[0].focus();
      }
    };
    host.addEventListener('keydown', onKeydown);
    host.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-choice]')?.dataset.choice;
      if (choice) finish(choice === 'confirm');
      else if (event.target === host) finish(false);
    });
    document.body.appendChild(host);
    host.querySelector('.g-confirm-cancel').focus({ preventScroll: true });
  });
}

async function onAction(element, event) {
  const action = element.dataset.action;
  const id = element.dataset.id;
  const kind = element.dataset.kind;
  const slot = element.dataset.slot;

  switch (action) {
    case 'builder-reset':
      ui.builder = freshBuild();
      render({ keepScroll: true });
      break;

    case 'choose-builder': {
      const previous = ui.overlay;
      if (previous?.type === 'choose') {
        ui.builderContext = { kind: previous.kind, slot: previous.slot, editId: null };
      } else {
        ui.builderContext = null;
      }
      ui.builder = freshBuild();
      go('/build');
      break;
    }

    case 'builder-add':
    case 'builder-buy': {
      const context = ui.builderContext;
      const productId = 'custom-bowl';
      const custom = { ...defaultCustomization(), builder: structuredClone(ui.builder) };
      if (context?.kind === 'plan' || context?.kind === 'subscription') {
        scheduleAdd({ ...context, productId, custom });
        go(context.kind === 'plan' ? '/meal-plans' : '/subscriptions/customize');
      } else {
        if (!cartAdd({ productId, custom, editId: context?.editId })) break;
        if (action === 'builder-buy') { ui.cartReviewKind = 'cart'; go('/cart'); }
        else if (context?.editId) {
          ui.builderContext = null;
          ui.overlay = { type: 'cart' };
          render({ keepScroll: true });
        } else {
          ui.builderContext = null;
          notify('Your custom bowl is in your cart');
        }
      }
      break;
    }

    case 'toggle-mobile':
      ui.menu = null;
      ui.mobileNav = !ui.mobileNav;
      render({ keepScroll: true });
      break;

    case 'cart-open':
      ui.cartReviewKind = 'cart';
      go('/cart');
      break;

    case 'overlay-close':
      closeOverlay();
      break;

    case 'cart-shop':
      go('/menu');
      break;

    case 'customize':
      startCustomize(id);
      break;

    case 'choose-product': {
      const prev = ui.overlay;
      if (prev?.type === 'choose') {
        startCustomize(id, prev.kind, prev.slot);
      }
      break;
    }

    case 'custom-submit': {
      const info = ui.overlay;
      if (info?.type === 'customize') {
        if (!info.custom?.portion || !info.custom?.sauce) {
          notify('Choose your portion and dressing first');
          break;
        }
        if (info.kind === 'cart') {
          cartAdd(info);
        } else {
          scheduleAdd(info);
        }
      }
      break;
    }

    case 'filter':
      ui.category = element.dataset.value;
      render({ keepScroll: true });
      break;

    case 'reset-filters':
      ui.category = 'All meals';
      ui.query = '';
      render({ keepScroll: true });
      break;

    case 'qty-inc':
      store.cart = store.cart.map((it) =>
        it.id === id ? { ...it, quantity: Math.min(it.quantity + 1, BUSINESS.maxLineQuantity) } : it,
      );
      persist();
      render({ keepScroll: true });
      refocus(`[data-action="qty-inc"][data-id="${CSS.escape(id)}"]:not([disabled])`);
      if (document.activeElement === document.body) refocus(`[data-action="qty-dec"][data-id="${CSS.escape(id)}"]`);
      break;

    case 'modal-qty-inc':
    case 'modal-qty-dec': {
      const info = ui.overlay;
      if (info?.type !== 'customize') break;
      info.quantity = Math.min(BUSINESS.maxLineQuantity, Math.max(1, (Number(info.quantity) || 1) + (action === 'modal-qty-inc' ? 1 : -1)));
      render({ keepScroll: true });
      refocus(`[data-action="${action}"]:not([disabled])`) ;
      if (!root.contains(document.activeElement) || document.activeElement === document.body) {
        refocus('[data-action="modal-qty-inc"]');
      }
      break;
    }

    case 'qty-dec':
      store.cart = store.cart
        .map((it) => (it.id === id ? { ...it, quantity: it.quantity - 1 } : it))
        .filter((it) => it.quantity > 0);
      persist();
      render({ keepScroll: true });
      refocus(`[data-action="qty-dec"][data-id="${CSS.escape(id)}"]`);
      break;

    case 'cart-remove':
      store.cart = store.cart.filter((it) => it.id !== id);
      persist();
      render({ keepScroll: true });
      notify('Meal removed from your cart');
      break;

    case 'cart-edit': {
      const it = store.cart.find((item) => item.id === id);
      if (it) startCustomize(it.productId, 'cart', null, it.id);
      break;
    }

    case 'pickup-confirm-collected':
    case 'pickup-report-issue': {
      const received = action === 'pickup-confirm-collected';
      askCustomerConfirmation({
        title: received ? 'Confirm Order Pickup?' : 'Report a Pickup Issue?',
        message: received
          ? 'Have you received your order? Confirming will mark this order as Picked Up.'
          : 'Was your order unavailable or not released at the agreed pickup? Report it for review.',
        confirmLabel: received ? 'Yes, Confirm' : 'Report Issue',
      }).then(async (approved) => {
        if (!approved) return;
        try {
          await confirmOrderPickup(id, received);
          render({ keepScroll: true });
          notify(received ? 'Pickup confirmed. Thank you!' : 'Pickup issue recorded.');
        } catch (error) {
          notify(error.message);
          if (error.status === 409) loadOrders();
        }
      });
      break;
    }

    case 'order-receipt':
      openReceipt(id);
      break;

    case 'receipt-print':
      window.print();
      break;

    case 'receipt-download':
      if (getReceiptOrder()) downloadReceiptPdf();
      break;

    case 'order-reorder': {
      const order = ui.orders.find((entry) => entry.id === id);
      if (!order || order.kind !== 'cart') break;
      const items = (order.items || []).filter((item) => mealById(item.productId));
      if (!items.length) {
        notify('These meals are no longer on the menu');
        break;
      }
      let next = store.cart;
      for (const item of items) {
        const updated = addOrIncrement(next, makeItem(
          item.productId,
          item.custom || defaultCustomization(),
          Math.min(BUSINESS.maxLineQuantity, Math.max(1, Math.trunc(Number(item.quantity)) || 1)),
        ));
        if (updated === next) {
          notify('Your cart has reached its limit. Remove some meals before reordering.');
          return;
        }
        next = updated;
      }
      store.cart = next;
      persist();
      ui.cartReviewKind = 'cart';
      go('/cart');
      notify('Meals added to your cart. Review before saving a new pickup order.');
      break;
    }

    case 'refresh-orders':
      loadOrders();
      break;

    case 'sign-out':
      try { await signOut(); }
      catch (error) { notify(error.message); break; }
      ui.orderLoad = null;
      ui.ordersLoading = false;
      clearPendingPickup();
      ui.orders = [];
      ui.ordersLoaded = false;
      ui.receiptOrderId = null;
      ui.lastCodOrder = null;
      ui.contactEditing = false;
      ui.ordersError = '';
      ui.authNext = null;
      applyDraft(fresh());
      clearGuestDraft();
      ui.builder = freshBuild();
      ui.builderContext = null;
      ui.selectedProduct = null;
      ui.selectionContext = null;
      ui.calorieResult = null;
      go('/');
      notify('You have signed out');
      break;

    case 'auth-go':
      ui.authNext = element.dataset.next || null;
      go(element.dataset.target);
      break;

    case 'auth-open':
      openAuth(element.dataset.mode || 'signin', element.dataset.next || null);
      break;

    case 'auth-mode':
      ui.auth = freshAuth();
      ui.overlay = { type: 'auth', mode: element.dataset.mode || 'signin' };
      render({ keepScroll: true });
      break;

    case 'menu-toggle': {
      const name = element.dataset.menu;
      ui.menu = ui.menu === name ? null : name;
      syncMenus();
      break;
    }

    case 'toast-close':
      dismissToast();
      break;

    case 'sheet-toggle': {
      ui.sheetOpen = !ui.sheetOpen;
      const sheet = element.closest('.build-summary');
      sheet?.classList.toggle('open', ui.sheetOpen);
      element.setAttribute('aria-expanded', String(ui.sheetOpen));
      const label = element.querySelector('.sheet-toggle-label');
      if (label) label.firstChild.textContent = `${ui.sheetOpen ? 'Hide' : 'Review'} `;
      break;
    }

    case 'banner-prev':
      showBanner((ui.bannerIndex || 0) - 1, { user: true });
      break;

    case 'banner-next':
      showBanner((ui.bannerIndex || 0) + 1, { user: true });
      break;

    case 'banner-go':
      showBanner(Number(element.dataset.index) || 0, { user: true });
      break;

    case 'banner-toggle':
      ui.bannerPaused = !bannerPaused();
      element.setAttribute('aria-label', `${ui.bannerPaused ? 'Play' : 'Pause'} automatic sliding`);
      element.innerHTML = ico(ui.bannerPaused ? 'play' : 'pause', 14);
      restartBannerTimer();
      break;

    case 'contact-edit':
      ui.contactEditing = !ui.contactEditing;
      render({ keepScroll: true });
      root.querySelector(ui.contactEditing ? '#pickup-contact-name' : '[data-action="contact-edit"]')?.focus();
      break;

    case 'toggle-password': {
      const input = element.closest('.password-wrap')?.querySelector('input');
      if (!input) break;
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      element.textContent = reveal ? 'Hide' : 'Show';
      element.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      break;
    }

    case 'go-checkout':
      ui.cartReviewKind = 'cart';
      go('/cart');
      break;

    case 'open-cart-review':
      if (availableCartKinds().includes(kind)) {
        ui.cartReviewKind = kind;
        go('/cart');
      }
      break;

    case 'cart-review-kind':
      if (availableCartKinds().includes(kind)) {
        ui.cartReviewKind = kind;
        render({ keepScroll: true });
      }
      break;

    case 'cart-proceed-checkout':
      if (!availableCartKinds().includes(kind)) break;
      if (kind !== 'cart') {
        const summary = kind === 'plan'
          ? scheduledSummary(planSchedule(), store.plan.assignments)
          : scheduledSummary(subSchedule(), store.subscription.assignments, subOffer().discountRate);
        if (!summary.count || summary.filled !== summary.count) {
          notify('Finish selecting your scheduled meals before checkout');
          break;
        }
      }
      go(`/checkout/${kind}`);
      break;

    case 'slot-choose':
      openChooser(kind, slot);
      break;

    case 'slot-clear': {
      const assignments = kind === 'plan' ? store.plan.assignments : store.subscription.assignments;
      delete assignments[slot];
      persist();
      render({ keepScroll: true });
      break;
    }

    case 'slot-copy': {
      const assignments = kind === 'plan' ? store.plan.assignments : store.subscription.assignments;
      const schedule = kind === 'plan' ? planSchedule() : subSchedule();
      const selected = assignments[slot];
      if (!selected) break;

      let copies = 0;
      for (const s of schedule) {
        if (s.period === slot.split('|')[1] && !assignments[s.id]) {
          assignments[s.id] = structuredClone(selected);
          copies++;
        }
      }
      persist();
      render({ keepScroll: true });
      notify(
        copies
          ? `Copied to ${copies} empty ${slot.split('|')[1].toLowerCase()} slots`
          : 'No empty matching slots left',
      );
      break;
    }

    case 'plan-program': {
      store.plan.program = id;
      persist();
      render({ keepScroll: true });
      break;
    }

    case 'sub-calc': {
      ui.calorieResult = dailyCalorieEstimate(ui.calorieForm);
      if (ui.calorieResult.valid) {
        store.subscription.target = ui.calorieResult.target;
        persist();
        notify(`Daily target set to ${ui.calorieResult.target} kcal`);
      }
      render({ keepScroll: true });
      break;
    }

    case 'plan-calc': {
      ui.calorieResult = dailyCalorieEstimate(ui.calorieForm);
      if (ui.calorieResult.valid) {
        store.plan.target = ui.calorieResult.target;
        persist();
        notify(`Daily target set to ${ui.calorieResult.target} kcal`);
      }
      render({ keepScroll: true });
      break;
    }

    case 'calorie-use-plan': {
      if (!ui.calorieResult?.valid) break;
      store.plan.target = ui.calorieResult.target;
      persist();
      go('/meal-plans');
      notify(`Daily target set to ${ui.calorieResult.target} kcal`);
      break;
    }

    case 'plan-autofill': {
      const target = Number(store.plan.target) || 0;
      if (!planSchedule().length) {
        notify('Choose your days, start date and meal periods first');
        break;
      }
      if (!store.plan.program) {
        notify('Choose a meal goal first');
        break;
      }
      if (!target) {
        notify('Set a daily calorie target first');
        break;
      }
      const days = {};
      for (const s of planSchedule()) {
        const idx = (days[s.period] = (days[s.period] ?? -1) + 1);
        if (store.plan.assignments[s.id]) continue;
        const program = store.plan.program;
        const budget = target * (PERIOD_SHARE[s.period] || 0.33) * (program === 'light' ? 0.9 : 1);
        const ranked = meals
          .map((m) => {
            const n = mealTotal(m, defaultCustomization()).nutrients;
            return { m, k: n.kcal, p: n.protein };
          })
          .sort((a, b) => Math.abs(a.k - budget) - Math.abs(b.k - budget));
        let fits = ranked.filter((x) => x.k <= budget);
        if (program === 'protein')
          fits = [...fits].sort((a, b) => b.p / (b.k || 1) - a.p / (a.k || 1));
        const pool = (fits.length ? fits : ranked.slice(-1)).slice(0, 3);
        const pick = pool[idx % pool.length].m;
        store.plan.assignments[s.id] = { productId: pick.id, custom: defaultCustomization() };
      }
      persist();
      render({ keepScroll: true });
      notify('Filled your empty meals to fit your target');
      break;
    }

    case 'plan-review': {
      const schedule = planSchedule();
      if (schedule.length && schedule.every((x) => store.plan.assignments[x.id])) {
        go('/meal-plans/review');
      }
      break;
    }

    case 'offer-select': {
      if (!OFFERS.some((o) => o.id === id)) break;
      store.subscription.offerId = id;
      store.subscription.assignments = {};
      persist();
      go('/subscriptions/customize');
      break;
    }

    case 'sub-review': {
      const schedule = subSchedule();
      if (schedule.length && schedule.every((x) => store.subscription.assignments[x.id])) {
        go('/subscriptions/review');
      }
      break;
    }
  }
}

function syncMenus() {
  root?.querySelectorAll('.sh-dd').forEach((dropdown) => {
    const button = dropdown.querySelector('[data-action="menu-toggle"]');
    const open = !!ui.menu && button?.dataset.menu === ui.menu;
    dropdown.classList.toggle('open', open);
    button?.setAttribute('aria-expanded', String(open));
  });
}

// Global click delegation
root?.addEventListener('click', (event) => {
  if (ui.menu && !event.target.closest('.sh-dd')) {
    ui.menu = null;
    syncMenus();
  }
  const link = event.target.closest('a[data-link]');
  if (link) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const href = link.dataset.route || link.getAttribute('href') || '/';
    if (href === '/build') {
      ui.builderContext = null;
      ui.builder = freshBuild();
    }
    go(href);
    return;
  }

  const action = event.target.closest('[data-action]');
  if (!action || action.disabled) return;

  // Only the bare modal backdrop closes the overlay; clicks inside never bubble to backdrop close.
  if (
    action.dataset.action === 'overlay-close' &&
    action.classList.contains('modal-backdrop') &&
    event.target !== action
  ) {
    return;
  }
  if (
    action.dataset.action === 'overlay-close' &&
    action.classList.contains('drawer-backdrop') &&
    event.target !== action
  ) {
    return;
  }

  event.preventDefault();
  onAction(action, event);
});

// Meal cards are intentionally the action: the full card opens its customizer
// without adding a redundant button below the meal details.
root?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const mealCard = event.target.closest('.meal-card[data-action="customize"]');
  if (!mealCard) return;
  event.preventDefault();
  mealCard.click();
});

// Change events for form fields and modifiers
root?.addEventListener('change', (event) => {
  const e = event.target;
  if (e.dataset.builder) {
    const group = e.dataset.builder;
    if (e.type === 'checkbox') {
      const selected = new Set(ui.builder[group] || []);
      e.checked ? selected.add(e.value) : selected.delete(e.value);
      ui.builder[group] = [...selected];
    } else {
      ui.builder[group] = e.value;
    }
    render({ keepScroll: true });
    return;
  }
  if (e.dataset.calorie) {
    ui.calorieForm[e.dataset.calorie] = e.value;
    ui.calorieResult = null;
    // Give immediate feedback while the customer corrects a value instead of
    // leaving a stale error state on a now-edited field.
    const field = e.closest('.calc-field');
    field?.classList.remove('is-invalid');
    e.removeAttribute('aria-invalid');
    e.removeAttribute('aria-describedby');
    field?.querySelector('.field-error')?.remove();
    const form = e.closest('#calorie-form');
    if (form && !form.querySelector('.calc-field.is-invalid')) {
      form.querySelector('.calc-validation-summary')?.remove();
    }
    return;
  }
  if (e.dataset.modifier || e.dataset.top || e.dataset.remove) {
    modifyCustom(e);
    return;
  }
  if (e.dataset.plan) {
    updateSchedule(e.dataset.plan, e.value);
    return;
  }
  if (e.dataset.period) {
    const current = new Set(store.plan.periods);
    if (e.checked) current.add(e.dataset.period);
    else current.delete(e.dataset.period);
    if (!current.size) {
      e.checked = true;
      notify('Choose at least one meal period');
      return;
    }
    store.plan.periods = ['Breakfast', 'Lunch', 'Dinner'].filter((p) => current.has(p));
    persist();
    render({ keepScroll: true });
    return;
  }
  if (e.dataset.subStart !== undefined) {
    store.subscription.start = e.value;
    persist();
    render({ keepScroll: true });
    return;
  }
  if (e.dataset.subTarget !== undefined) {
    store.subscription.target = Math.max(0, Math.round(Number(e.value) || 0));
    persist();
    render({ keepScroll: true });
    return;
  }
  if (e.dataset.checkout) {
    store.checkout[e.dataset.checkout] = e.value;
    if (e.dataset.checkout === 'date') {
      store.checkout.time = '';
      render({ keepScroll: true });
    }
    if (e.dataset.checkout === 'pickupBranch') {
      render({ keepScroll: true });
    }
    // Pickup contact details are kept out of meal drafts.
  }
});

// Input events for search and form fields
root?.addEventListener('input', (event) => {
  const e = event.target;
  if (e.dataset.calorie) ui.calorieForm[e.dataset.calorie] = e.value;
  if (e.dataset.search !== undefined) {
    ui.query = e.value;
    const list = meals.filter(
      (m) =>
        (ui.category === 'All meals' || m.category === ui.category) &&
        (m.name + ' ' + m.description + ' ' + m.category)
          .toLowerCase()
          .includes(ui.query.toLowerCase()),
    );
    const resultsContainer = root.querySelector('#menu-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = menuResults(list);
    }
  }
  if (e.dataset.checkout) {
    store.checkout[e.dataset.checkout] = e.value;
    if (e.dataset.checkout === 'date') {
      store.checkout.time = '';
      render({ keepScroll: true });
    }
    // Pickup contact details are kept out of meal drafts.
  }
});

// Checkout submission
root?.addEventListener('submit', async (event) => {
  if (event.target.id === 'calorie-form') {
    event.preventDefault();
    ui.calorieResult = dailyCalorieEstimate(ui.calorieForm);
    render({ keepScroll: true });
    if (!ui.calorieResult.valid) {
      requestAnimationFrame(() => root?.querySelector('.calorie-form .is-invalid input, .calorie-form .is-invalid select')?.focus());
    }
    return;
  }
  if (event.target.id === 'signin-form') {
    event.preventDefault();
    submitAuth('signin', event.target);
    return;
  }
  if (event.target.id === 'signup-form') {
    event.preventDefault();
    submitAuth('signup', event.target);
    return;
  }
  if (event.target.id === 'forgot-form' || event.target.id === 'reset-password-form') {
    event.preventDefault();
    submitAuth('forgot', event.target);
    return;
  }
  if (event.target.id === 'pickup-contact-form') {
    event.preventDefault();
    await submitPickupContact(event.target);
    return;
  }
  if (event.target.id === 'checkout-form') {
    event.preventDefault();
    const kind = currentPath().split('/').pop();
    if (ui.codSubmitting || !validateCheckout(event.target, kind)) return;
    const preview = collectCodRequest(kind);
    const approved = await askCustomerConfirmation({
      title: 'Review Pickup Summary',
      message: 'Please review your meals, pickup schedule, and total.',
      confirmLabel: 'Submit pickup request',
      detailsHtml: pickupConfirmationReview(preview),
      progress: 3,
    });
    if (!approved || ui.codSubmitting) return;
    const button = event.target.querySelector('[type="submit"]');
    ui.codSubmitting = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'Submitting…';
    }
    try {
      const order = await submitCodRequest(preview);
      ui.lastCodOrder = order;
      ui.ordersLoaded = false;
      ui.orders = [order, ...ui.orders.filter(entry => entry.id !== order.id)];
      // Start the next pickup with fresh details and the account contact.
      const defaults = fresh();
      store.checkout = defaults.checkout;
      if (kind === 'cart') store.cart = [];
      if (kind === 'plan') store.plan = defaults.plan;
      if (kind === 'subscription') store.subscription = defaults.subscription;
      ui.builder = freshBuild();
      ui.builderContext = null;
      ui.selectedProduct = null;
      ui.selectionContext = null;
      ui.calorieResult = null;
      persist();
      go('/order-confirmation');
    } catch (error) {
      if (error.status === 401) {
        customerAccount = null;
        ui.orderLoad = null;
        ui.ordersLoading = false;
        ui.orders = [];
        ui.ordersLoaded = false;
        ui.receiptOrderId = null;
        ui.lastCodOrder = null;
        applyDraft(fresh());
        openAuth('signin', currentPath());
        ui.auth.notice = 'Your session expired. Sign in again to continue your pickup request.';
        render({ keepScroll: true });
        return;
      }
      if (error.status === 409) {
        await refreshTaxTreatment().catch(() => {});
        render({ keepScroll: true });
      }
      const general = root.querySelector('#checkout-errors');
      if (general) {
        general.hidden = false;
        general.textContent = error.message || 'Could not submit your order. Please try again.';
      }
      if (button) {
        button.disabled = false;
        button.textContent = 'Submit pickup request';
      }
    } finally {
      ui.codSubmitting = false;
    }
  }

});

// Browser history popstate
window.addEventListener('popstate', () => {
  ui.overlay = null;
  ui.auth = freshAuth();
  ui.mobileNav = false;
  ui.menu = null;
  render({ scroll: true });
  if (isOrderPage(currentPath())) loadOrders();
});

// Browsers use hash history when previewing local HTML files.
window.addEventListener('hashchange', () => {
  if (!FILE_MODE) return;
  ui.overlay = null;
  ui.mobileNav = false;
  render({ scroll: true });
});

// Escape key and Tab focus trap for modals
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && ui.sheetOpen && !ui.overlay && !ui.menu) {
    ui.sheetOpen = false;
    const sheet = root?.querySelector('.build-summary');
    sheet?.classList.remove('open');
    sheet?.querySelector('.sheet-handle')?.setAttribute('aria-expanded', 'false');
    return;
  }
  if (event.key === 'Escape' && ui.menu && !ui.overlay) {
    const trigger = root?.querySelector(`[data-action="menu-toggle"][data-menu="${ui.menu}"]`);
    ui.menu = null;
    syncMenus();
    trigger?.focus();
    return;
  }
  if (event.key === 'Escape' && ui.overlay) {
    closeOverlay();
    return;
  }
  if (event.key !== 'Tab' || !ui.overlay) return;

  const dialog = root?.querySelector('[role="dialog"]');
  if (!dialog) return;

  const nodes = [
    ...dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    ),
  ].filter((x) => x.getClientRects().length);

  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});


// ---------------------------------------------------------------------------
// Inline form validation: runs when a field loses focus, then live while fixing.
// It reuses the existing patterns; submit-time validation is unchanged.
// ---------------------------------------------------------------------------
const FIELD_VALIDATORS = {
  name: (v, el) => (!v.trim() ? (el.required ? 'Enter your full name' : '') : v.trim().length >= 2 ? '' : 'Enter your full name'),
  email: (v) => (EMAIL_PATTERN.test(normalizeEmail(v)) ? '' : 'Enter a valid email, like maria@example.com'),
  phone: (v, el) => {
    const phone = v.replace(/[\s-]/g, '');
    if (!phone) return el.required ? 'Enter your mobile number' : '';
    return PH_MOBILE.test(phone) ? '' : 'Use 11 digits starting with 09, like 09171234567';
  },
  password: (v, el, form) => (form.id === 'signin-form' ? (v ? '' : 'Enter your password') : v.length >= 8 ? '' : 'Use at least 8 characters'),
  confirm: (v, el, form) => (v && v === form.querySelector('[data-auth="password"]')?.value ? '' : 'Passwords do not match'),
  date: (v) => (v && v >= earliestCartDate() ? '' : 'Choose an eligible pickup date'),
  time: (v) => (v ? '' : 'Select a pickup time window'),
};
const VALIDATED_FORMS = '#signin-form, #signup-form, #forgot-form, #reset-password-form, #checkout-form, #calorie-form';

function fieldKey(el) {
  return el.dataset.auth || el.dataset.checkout || null;
}

function validateFieldMessage(el) {
  const form = el.closest('form');
  const key = fieldKey(el);
  const value = String(el.value ?? '');
  if (key && FIELD_VALIDATORS[key]) return FIELD_VALIDATORS[key](value, el, form);
  if (el.required && !value.trim()) return 'This field is required';
  if (el.type === 'number' && value !== '' && !el.checkValidity()) return `Enter a number between ${el.min} and ${el.max}`;
  return '';
}

let fieldMsgId = 0;
function showFieldState(el, message) {
  const label = el.closest('label');
  if (!label) return;
  let box = label.querySelector('.error-text');
  if (!box) {
    box = document.createElement('span');
    box.className = 'error-text';
    label.appendChild(box);
  }
  if (!box.id) box.id = `field-msg-${++fieldMsgId}`;
  const filled = String(el.value ?? '').trim() !== '';
  box.classList.toggle('is-ok', !message && filled);
  box.textContent = message || (filled ? 'Looks good' : '');
  box.setAttribute('role', message ? 'alert' : 'status');
  label.classList.toggle('is-invalid', !!message);
  label.classList.toggle('is-valid', !message && filled);
  el.setAttribute('aria-invalid', message ? 'true' : 'false');
  el.setAttribute('aria-describedby', box.id);
}

function checkField(el) {
  if (!el.closest(VALIDATED_FORMS) || el.type === 'checkbox' || el.type === 'radio' || el.type === 'search') return;
  if (!(el.matches('input, select, textarea'))) return;
  showFieldState(el, validateFieldMessage(el));
}

root?.addEventListener('focusout', (event) => {
  const el = event.target;
  if (!el.matches?.('input, select, textarea')) return;
  if (!el.closest(VALIDATED_FORMS)) return;
  // Leaving an untouched, empty optional field should not show anything.
  if (!el.dataset.touched && !String(el.value ?? '').trim() && !el.required) return;
  el.dataset.touched = '1';
  checkField(el);
});

root?.addEventListener('input', (event) => {
  const el = event.target;
  if (!el.matches?.('input, select, textarea') || !el.closest(VALIDATED_FORMS)) return;
  if (el.dataset.touched) checkField(el);
  if (el.dataset.auth === 'password') {
    const confirm = el.closest('form')?.querySelector('[data-auth="confirm"]');
    if (confirm?.dataset.touched) checkField(confirm);
  }
});

root?.addEventListener('change', (event) => {
  const el = event.target;
  if (el.matches?.('select') && el.closest(VALIDATED_FORMS)) {
    el.dataset.touched = '1';
    checkField(el);
  }
});

// Visible required markers on every labelled required control.
function markRequired() {
  root?.querySelectorAll(VALIDATED_FORMS).forEach((form) => {
    let any = false;
    form.querySelectorAll('label').forEach((label) => {
      // Reserve a message slot under every text field so feedback never shifts the layout.
      const field = label.querySelector('input, select, textarea');
      if (field && !['checkbox', 'radio', 'search', 'hidden'].includes(field.type) && !label.querySelector('.error-text')) {
        const slot = document.createElement('span');
        slot.className = 'error-text';
        label.appendChild(slot);
      }
      const control = label.querySelector('input[required], select[required], textarea[required]');
      if (!control || control.type === 'checkbox' || control.type === 'radio') return;
      any = true;
      if (label.querySelector('.req')) return;
      const marker = document.createElement('span');
      marker.className = 'req';
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = ' *';
      const first = [...label.childNodes].find((n) => (n.nodeType === 3 && n.textContent.trim()) || (n.nodeType === 1 && n.tagName === 'SPAN' && !n.classList.contains('password-wrap') && !n.classList.contains('error-text')));
      if (first && first.nodeType === 1) {
        first.append(marker);
      } else if (first) {
        const text = document.createElement('span');
        text.className = 'label-text';
        text.textContent = first.textContent.trim();
        text.append(marker);
        first.replaceWith(text);
      } else {
        label.prepend(marker);
      }
    });
    if (any && !form.querySelector('.req-note') && form.id !== 'calorie-form' && !form.closest('.auth-modal')) {
      form.insertAdjacentHTML('afterbegin', '<p class="req-note"><span class="req" aria-hidden="true">*</span> Required field</p>');
    }
  });
}

async function initializeSite() {
  ui.booting = true;
  if (!FILE_MODE) {
    const url = new URL(location.href);
    const callback = url.searchParams.get('auth');
    if (callback) {
      url.searchParams.delete('auth');
      history.replaceState(history.state, '', url.href);
    }
    const [account] = await Promise.allSettled([customerApi('session'), refreshTaxTreatment()]);
    if (account.status === 'fulfilled') {
      customerAccount = account.value;
      activateAccountDraft(customerAccount.email, draftSnapshot());
    }
    if (callback === 'reset') {
      ui.overlay = { type: 'auth', mode: 'forgot' };
      ui.auth = { ...freshAuth(), reset: true };
    } else if (['confirmed', 'confirmation-error', 'expired'].includes(callback)) {
      const messages = {
        confirmed: 'Email confirmation complete. You can sign in.',
        'confirmation-error': 'This confirmation link is unavailable. Try signing in or requesting a reset.',
        expired: 'This reset link is unavailable. Request a new link and open it in this browser.',
      };
      ui.overlay = { type: 'auth', mode: callback === 'expired' ? 'forgot' : 'signin' };
      ui.auth = { ...freshAuth(), notice: messages[callback] };
    }
  }
  render();
  if (isOrderPage(currentPath()) && getAccount()) loadOrders();
  Promise.race([document.fonts?.ready, new Promise((resolve) => setTimeout(resolve, 450))])
    .catch(() => {})
    .then(() => setTimeout(() => {
      if (!ui.booting) return;
      ui.booting = false;
      if (['/', '/menu'].includes(ui.route) && !ui.overlay) render({ keepScroll: true });
    }, 120));
}
initializeSite();

})();

// v10: one scroll lock for every modal (customizer, chooser, cart drawer, sign-in,
// and the checkout confirmation dialog). Locks <html> as well as <body>, because
// body-only overflow:hidden does not stop the page scrolling behind the modal.
(function setupScrollLock() {
  const SCROLLABLE = '.modal, .custom-body, .custom-scroll, .drawer-items, .chooser-grid, .auth-modal, .g-confirm-dialog, .g-preconfirm-review';
  const isLocked = () => document.body.classList.contains('overlay-active') || !!document.querySelector('.g-confirm-overlay');
  const sync = () => document.documentElement.classList.toggle('scroll-locked', isLocked());
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  // Older iOS Safari: stop touch-dragging on the dim backdrop from moving the page.
  document.addEventListener('touchmove', (e) => {
    if (isLocked() && !e.target.closest(SCROLLABLE)) e.preventDefault();
  }, { passive: false });
  sync();
})();
