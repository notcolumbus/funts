import { Space } from "lucide-react"

type HeroProps = {
  textClassName: string
}

export function Hero({ textClassName }: HeroProps) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-4 text-center">
      <h1 className={`funts-font text-6xl ${textClassName}`}>Funts</h1>
      <h2 className={`interface-font max-w-[520px] text-2xl ${textClassName}`}>
        The super fast font finder.
      </h2>
      <div className={`interface-font flex items-center gap-3 rounded-full px-5 py-3 text-lg ${textClassName}`}>
        <span>Press</span>
        <Space className="font-semibold" size={32} />
        <span>to start</span>
      </div>
    </div>
  )
}
