import './App.css'
import { Button } from './components/ui/button'
import Logo from './components/ui/logo'
import { useEffect } from "react"

function App() {

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const applyTheme = (e) => {
      if (e.matches) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
    applyTheme(mq)
    mq.addEventListener("change", applyTheme)
    return () => mq.removeEventListener("change", applyTheme)
  }, [])

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
        <div className="flex flex-col h-20 w-80 justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const authUrl = new URL("http://localhost/v1/core/o/authorize/")
              authUrl.searchParams.set("client_id", "jfrGde7FrhdBvgjqIRF1O1Y7WHkJGoNrDQozJ699")
              authUrl.searchParams.set("response_type", "code")
              authUrl.searchParams.set("redirect_uri", "gleam://auth/callback")
              authUrl.searchParams.set("scope", "read write")
              window.electronAPI.openExternal(authUrl.toString())
            }}
          >
            Se connecter
          </Button>
          <Button>Inscription gratuite</Button>
        </div>
      </div>
      <footer className="w-full py-4 flex flex-col items-center space-y-5 mt-auto text-sm">
        <Logo />
        <div className="text-neutral-500 *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          <a href="#"> Conditions d'utilisation</a> | <a href="#">Politique de confidentialité</a>.
        </div>
      </footer>
    </div>
  )
}

export default App