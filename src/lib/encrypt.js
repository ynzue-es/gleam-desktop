// lib/pkce.js

function base64UrlEncode(arrayBuffer) {
  let string = btoa(String.fromCharCode(...arrayBuffer));
  return string.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

export function generateState() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return base64UrlEncode(array);
}