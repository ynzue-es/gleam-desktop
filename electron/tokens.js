export async function exchangeCodeForToken(code, pkce_verifier) {
  const response = await fetch("http://localhost/o/token/", {   // <-- mets bien ton port backend
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:4545/callback",
      client_id: "4htsqMnFWwVJFPjATKYppz5aVaI4FvCR3o63tv07",
      code_verifier: pkce_verifier,
    }),
  });
  const text = await response.text();
  console.log("Raw token response:", text);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Token endpoint did not return JSON. See raw response above.");
  }
  return data;
}