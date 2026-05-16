import { useEffect, useState } from "react"

import cloud from "../assets/cloud.png"
import { Hero } from "./components/Hero"
import { MainApp } from "./components/MainApp"
import { backgroundThemes } from "./components/ThemeSelector"

export function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(backgroundThemes[0])

  function startApp() {
    setHasStarted(true)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat) {
        return
      }

      event.preventDefault()
      startApp()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <main className="h-screen w-screen overflow-hidden" onClick={startApp}>
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden ${selectedTheme.backgroundClassName}`}
      >
        <img
          src={cloud}
          alt="cloud"
          className="pointer-events-none absolute top-6 -left-40 w-[520px] opacity-95"
        />
        <img
          src={cloud}
          alt="cloud"
          className="pointer-events-none absolute top-24 -right-32 w-[420px] opacity-85"
        />
        {hasStarted ? (
          <MainApp selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} />
        ) : (
          <Hero textClassName={selectedTheme.textClassName} />
        )}
      </div>
    </main>
  )
}
