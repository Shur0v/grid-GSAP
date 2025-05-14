import GridBall from "./grid-ball"

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[690px] mx-auto pt-20 px-4">
        <h1 className="text-5xl font-serif mb-8">Set the product direction</h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-12">
          Setting direction is one of the most important things you'll do when building a product and company. A clear
          direction aligns everyone to work toward the same goals.
        </p>
        <GridBall />
      </div>
    </div>
  )
}
