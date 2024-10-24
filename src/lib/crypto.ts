const encoder = new TextEncoder();

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, [
    "deriveBits",
  ]);

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    256, // 256 bits
  );
}

export async function saltAndHashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await deriveKey(password, salt);
  const keyArray = Array.from(new Uint8Array(derivedKey));

  return `${btoa(String.fromCharCode.apply(null, Array.from(salt)))}:${btoa(String.fromCharCode.apply(null, keyArray))}`;
}

export async function verifyPassword(storedHash: string, inputPassword: string): Promise<boolean> {
  const [saltString, keyString] = storedHash.split(":");
  const salt = Uint8Array.from(atob(saltString), (c) => c.charCodeAt(0));
  const storedKey = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));

  const derivedKey = await deriveKey(inputPassword, salt);

  return arrayBufferEquals(derivedKey, storedKey.buffer);
}

function arrayBufferEquals(buf1: ArrayBuffer, buf2: ArrayBuffer): boolean {
  if (buf1.byteLength != buf2.byteLength) return false;
  const dv1 = new Int8Array(buf1);
  const dv2 = new Int8Array(buf2);
  for (let i = 0; i != buf1.byteLength; i++) {
    if (dv1[i] != dv2[i]) return false;
  }
  return true;
}
