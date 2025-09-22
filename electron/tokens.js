import keytar from "keytar";

const SERVICE_NAME = "gleam-desktop";
const ACCOUNT_NAME = "oauth-token";

async function saveTokens(tokens) {
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, JSON.stringify(tokens));
  console.log("Tokens sauvegardés dans le coffre système !");
}

async function getTokens() {
  const data = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  return data ? JSON.parse(data) : null;
}

async function clearTokens() {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  console.log("Tokens supprimés du coffre système !");
}

async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem("pkce_verifier");
  const response = await fetch("http://localhost/v1/core/o/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:4545/callback",
      client_id: "4htsqMnFWwVJFPjATKYppz5aVaI4FvCR3o63tv07",
      code_verifier: verifier,
    }),
  });

  const data = await response.json();
  console.log("Token response:", data);
  return data;
}