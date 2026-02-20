import "./HomePage.css"

const FeatureList = ({ title, text }: { title: string, text: string }) => {
  return (
    <li className="mb-3 list-disc list-inside pl-3 text-start"><span className="font-bold underline decoration-2">{title}</span>: {text}</li>
  )
}

export const HomePage = () => {
  return (
    <div id="home-page" className="flex flex-col items-center gap-[8%] relative pt-[5%] h-screen w-full text-center">
      <h1>Welcome to Henri Chess</h1>
      <div className="max-w-[95%]">
        <h3>This application is still in beta</h3>
        <p className="text-[1.3rem] font-semibold">Some important features have not yet been implemented</p>
      </div>
      <div id="features-list">
        <h4 className="underline decoration-3">The main upcoming features expected for the 01/03/2026:</h4>
        <ul className="pt-6">
          <FeatureList title="Timer in online games" text="Implement timer for online games, giving players 10 mins in total to make all of their moves" />
          <FeatureList title="Social page" text="The social page will have a chat where all users may post messages, there will also be a list of online players and their current activity level (in game, not in game, idle), it will be possible to send an invitation to a game to players who are not currently in a game" />
          <FeatureList title="Credentials Verification and Security" text="On Signup add security measures like min length and requiring different categories of characters, digits and non alphanumerical, only allow 1 account per email adddress, add password recovery" />
          <FeatureList title="Google Auth" text="Allow Users to authenticate via google accounts" />
        </ul>
      </div>
    </div>
  )
}
