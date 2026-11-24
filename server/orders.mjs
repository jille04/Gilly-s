import {
  BUSINESS, PICKUP_BRANCHES, OFFERS, INGREDIENT_GROUPS, mealById, mealTotal, mealPriceDetails,
  defaultCustomization, portionOptions, proteinOptions, toppings, sauces, createSchedule, datePlus,
  manilaNow, demoCartSlots, pesoRound, orderTaxParts,
} from './order-catalog.generated.mjs';
import { HttpError } from './http.mjs';
import { data } from './supabase.mjs';

export const TAX_TREATMENTS = ['unconfigured', 'vat-inclusive', 'non-vat'];
export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const ORDER_ID = /^GLY-[0-9]{8}-[A-F0-9]{16}$/;
const PHONE = /^09[0-9]{9}$/;
const orderColumns = 'id,version,created_at,status,status_history,pickup_confirmation,snapshot';
const PAGE_SIZE = 100;

const invalid = (message) => { throw new HttpError(400, message); };

function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const value = new Date(date + 'T00:00:00Z');
  return Number.isFinite(value.valueOf()) && value.toISOString().slice(0, 10) === date;
}

function choices(values, allowed) {
  if (values == null) return [];
  if (!Array.isArray(values) || values.some(value => !allowed.includes(value))) invalid('Choose valid meal options.');
  return [...new Set(values)];
}

function single(value, options, fallback) {
  const selected = value ?? fallback;
  if (!options.some(option => option.id === selected)) invalid('Choose valid meal options.');
  return selected;
}

function customization(product, raw) {
  const defaults = defaultCustomization();
  const source = raw || {};
  if (product.id === 'custom-bowl') {
    const build = {};
    for (const group of INGREDIENT_GROUPS) {
      const value = source.builder?.[group.id];
      if (group.mode === 'multiple') {
        build[group.id] = choices(value, group.options.map(option => option.id));
        if (group.required && !build[group.id].length) invalid('Complete the required bowl selections.');
      } else {
        build[group.id] = value || '';
        if (group.required || build[group.id]) single(value, group.options);
      }
    }
    return { ...defaults, builder: build };
  }
  return {
    ...defaults,
    portion: single(source.portion, portionOptions, defaults.portion),
    protein: single(source.protein, proteinOptions, defaults.protein),
    sauce: single(source.sauce, sauces, defaults.sauce),
    toppings: choices(source.toppings, toppings.map(topping => topping.id)),
    removed: choices(source.removed, product.removables || []),
  };
}

function pickupDetails(kind, raw, now) {
  const branch = PICKUP_BRANCHES.find(branch => branch.id === raw?.branchId);
  if (!branch) invalid('Choose a pickup location.');
  const date = raw.date;
  const minimumScheduledDate = datePlus(manilaNow(now).date, BUSINESS.orderMinLeadDays);
  if (!validDate(date) || (kind !== 'cart' && date < minimumScheduledDate)) invalid('Choose an eligible pickup date.');
  const allowedTimes = kind === 'cart' ? demoCartSlots(date, now) : BUSINESS.timeSlots;
  if (!allowedTimes.includes(raw.time)) invalid('Choose an available pickup time.');
  const contactName = typeof raw.contactName === 'string' ? raw.contactName.trim() : '';
  const contactPhone = typeof raw.contactPhone === 'string' ? raw.contactPhone.trim() : '';
  if (contactName.length < 2 || contactName.length > 100 || !PHONE.test(contactPhone)) {
    invalid('Enter a pickup name and an 11-digit Philippine mobile number.');
  }
  const instructions = typeof raw.instructions === 'string' ? raw.instructions.trim() : '';
  if (instructions.length > 500) invalid('Keep pickup instructions to 500 characters or less.');
  return {
    branchId: branch.id, branchName: branch.name, locationName: branch.name + ' · ' + branch.address,
    date, time: raw.time, contactName, contactPhone, instructions,
  };
}

function scheduleFor(kind, start, raw) {
  if (kind === 'cart') return { slots: [], discountRate: 0 };
  if (kind === 'plan') {
    const days = raw?.days;
    const periods = choices(raw?.periods, ['Breakfast', 'Lunch', 'Dinner']);
    if (![5, 7].includes(days) || !periods.length) invalid('Complete your meal plan schedule.');
    return { slots: createSchedule({ start, days, periods, weekdaysOnly: days === 5 }), discountRate: 0 };
  }
  const offer = OFFERS.find(offer => offer.id === raw?.offerId);
  if (!offer) invalid('Choose a subscription package.');
  return {
    slots: createSchedule({ start, days: offer.days, periods: offer.periods, weekdaysOnly: [5, 20].includes(offer.days) }),
    discountRate: offer.discountRate,
  };
}

export function createSnapshot(body, email, treatment, now = new Date()) {
  const { kind } = body;
  if (!['cart', 'plan', 'subscription'].includes(kind)) invalid('Choose a valid order type.');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100) invalid('Check the meals in your order.');
  const pickup = pickupDetails(kind, body.pickup, now);
  const { slots, discountRate } = scheduleFor(kind, pickup.date, body.schedule);
  const slotIds = new Set(slots.map(slot => slot.id));
  const items = body.items.map(item => {
    const product = mealById(item?.productId);
    if (!product) invalid('A selected meal is no longer available.');
    const quantity = item.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) invalid('Check the meal quantity.');
    if (kind !== 'cart' && (quantity !== 1 || !slotIds.delete(item.slot))) invalid('Check the meals on your schedule.');
    const custom = customization(product, item.custom);
    const price = mealTotal(product, custom);
    return {
      productId: product.id, quantity, custom, label: product.name,
      priceBreakdown: mealPriceDetails(product, custom),
      estimatedLineTotal: pesoRound(price.price * quantity),
      ...(kind === 'cart' ? {} : { slot: item.slot }),
    };
  });
  if (slotIds.size) invalid('Select a meal for every scheduled slot.');
  const itemSubtotal = pesoRound(items.reduce((sum, item) => sum + item.estimatedLineTotal, 0));
  const discount = pesoRound(itemSubtotal * discountRate);
  const estimatedTotal = pesoRound(itemSubtotal - discount);
  if (body.estimatedTotal !== estimatedTotal || body.taxTreatment !== treatment) {
    throw new HttpError(409, 'The order estimate changed. Review the updated summary and try again.');
  }
  return {
    kind, payment: 'cash_on_pickup', fulfillment: 'customer_pickup', pickup,
    customer: { email, name: pickup.contactName, phone: pickup.contactPhone },
    delivery: { date: pickup.date, time: pickup.time, instructions: pickup.instructions },
    delivery_date: pickup.date, delivery_time: pickup.time,
    items, estimated_total: estimatedTotal,
    pricing: { itemSubtotal, discount, deliveryFee: 0, ...orderTaxParts(itemSubtotal, discount, treatment) },
  };
}

function fromRow(row) {
  return {
    ...row.snapshot,
    id: row.id, version: row.version, created_at: row.created_at,
    status: row.status, status_history: row.status_history, pickup_confirmation: row.pickup_confirmation,
  };
}

export async function taxTreatment(env) {
  const [row] = await data(env, 'gillys_settings', { query: { id: 'eq.1', select: 'tax_treatment' } });
  if (!TAX_TREATMENTS.includes(row?.tax_treatment)) throw Error('Missing tax treatment');
  return row.tax_treatment;
}

export async function saveTaxTreatment(env, treatment) {
  if (!TAX_TREATMENTS.includes(treatment)) invalid('Select a valid tax treatment.');
  const [row] = await data(env, 'gillys_settings', {
    admin: true, method: 'PATCH', body: { tax_treatment: treatment },
    query: { id: 'eq.1', select: 'tax_treatment' }, prefer: 'return=representation',
  });
  if (!row) throw Error('Missing tax treatment');
  return row.tax_treatment;
}

function lookupRequest(env, userId, requestId) {
  return data(env, 'gillys_orders', {
    admin: true,
    query: { user_id: 'eq.' + userId, request_id: 'eq.' + requestId, select: orderColumns, limit: 1 },
  });
}

export async function submitOrder(env, user, body) {
  if (typeof body.requestId !== 'string' || !UUID.test(body.requestId)) invalid('An order request ID is required.');
  const [existing] = await lookupRequest(env, user.id, body.requestId);
  if (existing) return fromRow(existing);
  const snapshot = createSnapshot(body, user.email, await taxTreatment(env));
  const date = manilaNow().date.replaceAll('-', '');
  const id = 'GLY-' + date + '-' + crypto.randomUUID().replaceAll('-', '').slice(-16).toUpperCase();
  const [inserted] = await data(env, 'gillys_orders', {
    admin: true, method: 'POST', body: { id, user_id: user.id, request_id: body.requestId, snapshot },
    query: { on_conflict: 'user_id,request_id', select: orderColumns },
    prefer: 'resolution=ignore-duplicates,return=representation',
  });
  if (inserted) return fromRow(inserted);
  const [saved] = await lookupRequest(env, user.id, body.requestId);
  if (!saved) throw Error('Unable to retrieve the saved order');
  return fromRow(saved);
}

export async function orderPage(env, search, customer) {
  const after = search.get('after');
  const orderId = search.get('id');
  const query = { select: orderColumns, order: 'created_at.desc,id.desc', limit: PAGE_SIZE + 1 };
  if (orderId) {
    if (!ORDER_ID.test(orderId)) invalid('Invalid order reference.');
    query.id = 'eq.' + orderId;
  } else if (after) {
    const [timestamp, id, extra] = after.split('|');
    // Keep full Postgres timestamp precision for a stable cursor.
    if (extra !== undefined || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(timestamp) || !ORDER_ID.test(id)) {
      invalid('Invalid order cursor.');
    }
    query.or = '(created_at.lt.' + timestamp + ',and(created_at.eq.' + timestamp + ',id.lt.' + id + '))';
  }
  const rows = await data(env, 'gillys_orders', customer ? { query, token: customer.token } : { query, admin: true });
  const orders = rows.slice(0, PAGE_SIZE).map(fromRow);
  const last = orders.at(-1);
  return { orders, cursor: rows.length > PAGE_SIZE ? last.created_at + '|' + last.id : null };
}

export async function transitionOrder(env, body, actor, customerId = null) {
  if (typeof body.id !== 'string' || !ORDER_ID.test(body.id) || !Number.isInteger(body.version) || body.version < 1) {
    invalid('Select a valid order.');
  }
  if (customerId && typeof body.received !== 'boolean') invalid('Select a pickup response.');
  const next = customerId ? (body.received ? 'Picked Up' : 'Pickup Issue') : body.nextStatus;
  if (typeof next !== 'string' || next.length > 30) invalid('Select a valid order status.');
  const [row] = await data(env, 'rpc/gillys_transition_order', {
    admin: true, method: 'POST',
    body: { p_order_id: body.id, p_expected_version: body.version, p_next_status: next,
      p_actor: actor, p_customer_id: customerId },
  });
  if (!row) throw new HttpError(409, 'The order status has changed or the order is unavailable. Refresh and try again.');
  return fromRow(row);
}
