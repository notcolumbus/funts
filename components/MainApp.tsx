import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { getFontFamily } from "@/lib/fonts"
import { useFontLoader } from "@/hooks/useFontLoader"
import { useFonts } from "@/hooks/useFonts"

import type { BackgroundTheme } from "./ThemeSelector"
import { ThemeSelector } from "./ThemeSelector"

type MainAppProps = {
  selectedTheme: BackgroundTheme
  onSelectTheme: (theme: BackgroundTheme) => void
}

export function MainApp({ selectedTheme, onSelectTheme }: MainAppProps) {
  const {
    current,
    deleteCurrent,
    isDeleting,
    position,
    total,
    error,
    isLoading,
    nextFont,
    previousFont,
  } = useFonts()
  const { loadFont } = useFontLoader()
  const [previewText, setPreviewText] = useState("The quick brown fox")
  const [isEditingPreview, setIsEditingPreview] = useState(false)
  const previewTextRef = useRef(previewText)
  const previewElementRef = useRef<HTMLHeadingElement>(null)
  const fontFamily = current ? getFontFamily(current) : undefined

  useEffect(() => {
    if (current) {
      void loadFont(current).catch(() => {})
    }
  }, [current, loadFont])

  useEffect(() => {
    previewTextRef.current = previewText
  }, [previewText])

  useEffect(() => {
    const previewElement = previewElementRef.current
    if (!isEditingPreview || !previewElement) {
      return
    }

    previewElement.focus()

    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(previewElement)
    range.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [isEditingPreview])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || isDeleting || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.target instanceof HTMLElement &&
          (event.target.isContentEditable || event.target.closest("input, textarea, select, [contenteditable='true']"))) return

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault()
        nextFont()
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault()
        previousFont()
      } else if (event.key.toLowerCase() === "d") {
        event.preventDefault()
        void deleteCurrent()
      } else if (event.code === "Space" && !(event.target instanceof HTMLElement && event.target.closest("button"))) {
        event.preventDefault()
        nextFont()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [deleteCurrent, isDeleting, nextFont, previousFont])

  const statusText = isLoading
    ? "Loading fonts..."
    : error
      ? "Could not load fonts"
      : current
        ? current.name
        : "No fonts found"

  return (
    <section className={`interface-font z-10 ${selectedTheme.textClassName}`}>
      <h1 className="funts-font absolute top-2 left-2 p-3 text-2xl">Funts</h1>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.h2
            ref={previewElementRef}
            key={current?.id ?? statusText}
            dir="ltr"
            contentEditable={Boolean(current) && isEditingPreview}
            suppressContentEditableWarning
            className="pointer-events-auto max-w-[1000px] cursor-text text-5xl leading-none font-bold tracking-normal outline-none sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ fontFamily, direction: "ltr", unicodeBidi: "isolate" }}
            onClick={() => {
              if (!current) {
                return
              }

              setIsEditingPreview(true)
            }}
            onBlur={() => {
              const nextText = previewTextRef.current.trim()
              setPreviewText(nextText || "The quick brown fox")
              setIsEditingPreview(false)
            }}
            onInput={(event) => {
              previewTextRef.current = event.currentTarget.textContent ?? ""
            }}
            onKeyDown={(event) => {
              event.stopPropagation()
            }}
            initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
            transition={{ duration: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {current ? previewText : statusText}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-5 left-5 flex items-center gap-3 px-3 py-2">
        <div>
          <p className="text-lg leading-tight font-semibold sm:text-xl">{current?.name ?? statusText}</p>
          {error && <p role="alert" className="text-sm">{error}</p>}
        </div>
        {current ? (
          <div className="flex items-center gap-2">
            <span className="text-sm" aria-label={`Font ${position} of ${total}`}>{position} / {total}</span>
            <button type="button" onClick={previousFont} disabled={isDeleting} aria-label="Previous font" className="rounded-full border border-current px-3 py-1">←</button>
            <button type="button" onClick={nextFont} disabled={isDeleting} aria-label="Next font" className="rounded-full border border-current px-3 py-1">→</button>
            <button type="button" disabled={isDeleting} onClick={() => void deleteCurrent()} className="rounded-full border border-current px-3 py-1 text-sm disabled:opacity-50">{isDeleting ? "Deleting…" : "Delete"}</button>
          </div>
        ) : null}
      </div>

      <ThemeSelector selectedTheme={selectedTheme} onSelectTheme={onSelectTheme} />
    </section>
  )
}
