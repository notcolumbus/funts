import { Space } from "lucide-react"

export function Hero() {
  return (
    <div className="relative z-10 flex flex-col items-center gap-4 text-center">
      <h1 className="funts-font text-6xl text-white">Funts</h1>
      <h2 className="max-w-[520px] text-2xl font-semibold text-white">
        The super fast font finder.
      </h2>
      <div className="flex items-center gap-3 rounded-full px-5 py-3 text-lg text-white">
        <span>Press</span>
        <Space className="font-semibold text-white" size={32} />
        <span>to start</span>
      </div>
    </div>
  )
}
