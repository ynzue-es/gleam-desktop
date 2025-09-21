// lib/pkce.js

// Générer un code_verifier aléatoire (43–128 chars)
export function generateVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array); // API navigateur
  return base64UrlEncode(array);
}

// Générer le challenge (SHA256 du verifier)
export async function generateChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

// Helper Base64URL
function base64UrlEncode(arrayBuffer) {
  let string = btoa(String.fromCharCode(...arrayBuffer));
  return string.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}