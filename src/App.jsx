import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import Logo from "./components/ui/logo";
import { generateVerifier, generateChallenge, generateState } from "./lib/encrypt";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    applyTheme(mq);
    mq.addEventListener("change", applyTheme);
    return () => mq.removeEventListener("change", applyTheme);
  }, []);

  useEffect(() => {
    console.log("electronAPI dispo ?", window.electronAPI);
    window.electronAPI.onAuthSuccess(async () => {
      console.log("✅ Event auth-success reçu !");
      const tokens = await window.electronAPI.getTokens();
      console.log("🎟️ Tokens récupérés :", tokens);
      if (tokens?.access_token) {
        const res = await fetch(`http://localhost/v1/core/whoami/`, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const data = await res.json();
        setUser(data);
      }
    });
  }, []);

  const handleLogin = async () => {
    const verifier = generateVerifier();
    const challenge = await generateChallenge(verifier);
    const state = generateState();
    const redirect =
      process.env.NODE_ENV === "development"
        ? "http://localhost:4545/callback"
        : "gleam://auth/callback";

    await window.electronAPI.setPkceData({ verifier, state });

    const authUrl = new URL("http://localhost/login?client=desktop");
    authUrl.searchParams.set("code_challenge", challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("redirect_uri", redirect);

    window.electronAPI.openExternal(authUrl.toString());
  };

  return (
    <div className="flex flex-col min-h-[90vh] items-center">
      <div className="flex flex-col items-center space-y-6 flex-1 justify-center">
        <p className="flex items-center justify-center text-4xl">
          Gleam
          <span className="relative flex h-[30px] w-[30px] items-center justify-center ml-5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--foreground)] animate-ping opacity-75"></span>
            <span className="relative inline-flex rounded-full bg-[var(--foreground)] h-[30px] w-[30px]"></span>
          </span>
        </p>
        {user ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-xl font-bold">
              Bienvenue {user.first_name} {user.last_name}
            </p>
            <Button
              variant="destructive"
              onClick={async () => {
                const tokens = await window.electronAPI.getTokens();
                if (tokens?.refresh_token) {
                  try {
                    await fetch("http://localhost/o/revoke_token/", {
                      method: "POST",
                      headers: { "Content-Type": "application/x-www-form-urlencoded" },
                      body: new URLSearchParams({
                        token: tokens.refresh_token,
                        client_id: "4htsqMnFWwVJFPjATKYppz5aVaI4FvCR3o63tv07",
                      }),
                    });
                  } catch (err) {
                    console.error("❌ Erreur lors de la révocation:", err);
                  }
                }
                await window.electronAPI.clearTokens();
                setUser(null);
              }}
            >
              Déconnexion
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-20 w-80 justify-between">
            <Button variant="outline" onClick={handleLogin}>
              Se connecter
            </Button>
            <Button>Inscription gratuite</Button>
          </div>
        )}
      </div>

      <footer className="w-full py-4 flex flex-col items-center space-y-5 mt-auto text-sm">
        <Logo />
        <div className="text-neutral-500 *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          <a href="#"> Conditions d'utilisation</a> |{" "}
          <a href="#">Politique de confidentialité</a>.
        </div>
      </footer>
    </div>
  );
}

export default App;