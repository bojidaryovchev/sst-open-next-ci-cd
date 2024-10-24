const encoder = new TextEncoder();

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function saltAndHashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const keyBuffer = await crypto.subtle.exportKey("raw", key);
  const keyArray = Array.from(new Uint8Array(keyBuffer));

  return `${btoa(String.fromCharCode.apply(null, Array.from(salt)))}:${btoa(String.fromCharCode.apply(null, keyArray))}`;
}

export async function verifyPassword(storedHash: string, inputPassword: string): Promise<boolean> {
  const [saltString, keyString] = storedHash.split(":");
  const salt = Uint8Array.from(atob(saltString), (c) => c.charCodeAt(0));
  const storedKey = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));

  const inputKey = await deriveKey(inputPassword, salt);
  const inputKeyBuffer = await crypto.subtle.exportKey("raw", inputKey);

  return arrayBufferEquals(inputKeyBuffer, storedKey.buffer);
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
