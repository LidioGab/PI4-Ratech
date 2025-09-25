export async function sha256Hex(text) {
  if (typeof text !== 'string') text = String(text ?? '');
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPasswordClientSide(plainPassword) {
  return sha256Hex(plainPassword);
}
