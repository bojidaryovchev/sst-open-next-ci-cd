import { pbkdf2Sync, randomBytes } from "crypto";

export const saltAndHashPassword = (password: string): string => {
  const saltRounds = 10; // Number of iterations for hashing
  const salt = randomBytes(16).toString("hex"); // Generate a 16-byte salt
  const hash = pbkdf2Sync(password, salt, saltRounds, 64, "sha512").toString("hex"); // Derive the key

  return `${salt}:${hash}`; // Return the salt and hash as a combined string
};

export const verifyPassword = (storedHash: string, inputPassword: string): boolean => {
  const [salt, originalHash] = storedHash.split(":");
  const saltRounds = 10; // Same number of iterations used for hashing
  const inputHash = pbkdf2Sync(inputPassword, salt, saltRounds, 64, "sha512").toString("hex");

  return inputHash === originalHash; // Compare the hashed passwords
};
