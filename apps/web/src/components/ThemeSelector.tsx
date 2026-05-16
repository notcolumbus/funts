import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { useTheme } from "@/components/theme-provider"

export type BackgroundTheme = {
  id: string
  name: string
  backgroundClassName: string
  textClassName: string
  swatchClassName: string
}

export const backgroundThemes: BackgroundTheme[] = [
  {
    id: "sky",
    name: "Sky",
    backgroundClassName: "bg-linear-to-b from-[#0072cd] to-[#60baff]",
    textClassName: "text-white",
    swatchClassName: "bg-linear-to-b from-[#0072cd] to-[#60baff]",
  },
  {
    id: "sunrise",
    name: "Sunrise",
    backgroundClassName:
      "bg-linear-to-b from-[#ffcf4a] via-[#ff8f70] to-[#7f5dff]",
    textClassName: "text-white",
    swatchClassName: "bg-linear-to-b from-[#ffcf4a] via-[#ff8f70] to-[#7f5dff]",
  },
  {
    id: "mint",
    name: "Mint",
    backgroundClassName: "bg-linear-to-b from-[#d7fff1] to-[#7ee8c2]",
    textClassName: "text-[#12372f]",
    swatchClassName: "bg-linear-to-b from-[#d7fff1] to-[#7ee8c2]",
  },
  {
    id: "night",
    name: "Night",
    backgroundClassName: "bg-linear-to-b from-[#1b255f] to-[#020617]",
    textClassName: "text-[#f8fafc]",
    swatchClassName: "bg-linear-to-b from-[#1b255f] to-[#020617]",
  },
]

type ThemeSelectorProps = {
  selectedTheme: BackgroundTheme
  onSelectTheme: (theme: BackgroundTheme) => void
}

export function ThemeSelector({
  selectedTheme,
  onSelectTheme,
}: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { theme: colorMode, setTheme: setColorMode } = useTheme()
  const colorModes = ["light", "dark", "system"] as const

  function closeMenu() {
    setIsOpen(false)
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu()
      return
    }

    setIsOpen(true)
  }

  function selectTheme(theme: BackgroundTheme) {
    onSelectTheme(theme)
    closeMenu()
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu()
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className="interface-font absolute right-5 bottom-5 z-20">
      <motion.button
        type="button"
        aria-label="Choose background"
        aria-expanded={isOpen}
        className={`size-10 rounded-full border-2 border-white/80 shadow-lg shadow-blue-950/20 ${selectedTheme.swatchClassName}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => {
          event.stopPropagation()
          toggleMenu()
        }}
      />

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="dialog"
            aria-label="Background options"
            className="absolute right-0 bottom-14 w-[min(420px,calc(100vw-40px))] origin-bottom-right rounded-2xl border border-black/10 bg-[#f5f5f5] p-4 text-[#222222] shadow-xl shadow-blue-950/20 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-[#f5f5f5]"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Theme</h2>
              <div className="flex rounded-full bg-black/5 p-1 dark:bg-white/10">
                {colorModes.map((mode) => (
                  <motion.button
                    key={mode}
                    type="button"
                    className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                      colorMode === mode
                        ? "bg-white text-[#222222] dark:bg-[#f5f5f5] dark:text-[#0f0f0f]"
                        : "text-black/50 hover:text-[#222222] dark:text-white/50 dark:hover:text-[#f5f5f5]"
                    }`}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      setColorMode(mode)
                    }}
                  >
                    {mode}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {backgroundThemes.map((theme) => (
                <motion.button
                  key={theme.id}
                  type="button"
                  className="group min-w-0 text-left"
                  whileHover={{ scale: selectedTheme.id === theme.id ? 1.04 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    selectTheme(theme)
                  }}
                >
                  <motion.span
                    className={`block h-24 rounded-lg ${theme.swatchClassName} ${
                      selectedTheme.id === theme.id ? "" : "opacity-90 group-hover:opacity-100"
                    }`}
                    animate={{ scale: selectedTheme.id === theme.id ? 1.04 : 1 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
