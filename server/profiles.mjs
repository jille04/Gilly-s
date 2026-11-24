import { HttpError } from './http.mjs';
import { data } from './supabase.mjs';
import { UUID } from './orders.mjs';

const columns = 'name,phone,addresses,version';
const phonePattern = /^(?:09[0-9]{9})?$/;

function clean(value, max) {
  if (typeof value !== 'string' || value.trim().length > max) {
    throw new HttpError(400, 'Check the length of your profile details.');
  }
  return value.trim();
}

function profileDetails(body) {
  const name = clean(body.name, 100);
  const phone = clean(body.phone, 11);
  if (name.length < 2 || !phonePattern.test(phone) || !Array.isArray(body.addresses) || body.addresses.length > 30) {
    throw new HttpError(400, 'Check your name, phone number, and saved addresses.');
  }
  const ids = new Set();
  const addresses = body.addresses.map(address => {
    if (!address || typeof address.id !== 'string' || !UUID.test(address.id) || ids.has(address.id)) {
      throw new HttpError(400, 'A saved address is invalid.');
    }
    ids.add(address.id);
    const street = clean(address.street, 200);
    const barangay = clean(address.barangay, 100);
    const recipientPhone = clean(address.phone, 11);
    if (street.length < 6 || barangay.length < 2 || !phonePattern.test(recipientPhone)) {
      throw new HttpError(400, 'Check the saved street, barangay, and phone number.');
    }
    return { id: address.id, label: clean(address.label, 30), name: clean(address.name, 100),
      phone: recipientPhone, street, barangay, city: 'City of Manila', isDefault: address.isDefault === true };
  });
  return { name, phone, addresses };
}

export async function profile(env, customer) {
  const { user, token } = customer;
  const [row] = await data(env, 'gillys_profiles', { token, query: { select: columns, limit: 1 } });
  const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim().slice(0, 100) : '';
  const metadataPhone = typeof user.user_metadata?.phone === 'string' ? user.user_metadata.phone : '';
  return {
    email: user.email,
    ...(row || { name: metadataName.length >= 2 ? metadataName : 'Customer',
      phone: phonePattern.test(metadataPhone) ? metadataPhone : '', addresses: [], version: 0 }),
  };
}

export async function saveProfile(env, customer, body) {
  const version = body.version;
  if (!Number.isSafeInteger(version) || version < 0) throw new HttpError(400, 'Invalid profile version.');
  const fields = profileDetails(body);
  const userId = customer.user.id;
  const [row] = version === 0
    ? await data(env, 'gillys_profiles', {
      admin: true, method: 'POST', body: { user_id: userId, ...fields }, query: { on_conflict: 'user_id', select: columns },
      prefer: 'resolution=ignore-duplicates,return=representation',
    })
    : await data(env, 'gillys_profiles', {
      admin: true, method: 'PATCH', body: { ...fields, version: version + 1 },
      query: { user_id: 'eq.' + userId, version: 'eq.' + version, select: columns }, prefer: 'return=representation',
    });
  if (!row) throw new HttpError(409, 'Your profile changed in another session. Review your details and try again.');
  return { email: customer.user.email, ...row };
}
