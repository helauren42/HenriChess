import "./HomePage.css"

// const FeatureList = ({ title, text }: { title: string, text: string }) => {
//   return (
//     <li className="mb-3 list-disc list-inside pl-3 text-start"><span className="font-bold underline decoration-2">{title}</span>: {text}</li>
//   )
// }

export const HomePage = () => {
  return (
    <div id="home-page" className="flex flex-col items-center gap-[8%] relative pt-[5%] h-screen w-full text-center">
      <h1>Welcome to Henri Chess</h1>
      <div className="max-w-[75%] flex flex-col gap-2">
        <h3>Watch a quick demo</h3>
        <video controls className="rounded-2xl">
          <source src="/videos/demo.mp4" type="video/mp4" />
        </video>
      </div>
      <div id="features-list">
        <ul className="pt-6">
        </ul>
      </div>
    </div>
  )
}
