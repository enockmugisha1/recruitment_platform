import Overview from "../features/home/sections/Overview"
import RequireAttention from "../features/home/sections/RequireAttention"
import Upcoming from "../features/home/sections/Upcoming"

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 mt-5 mx-4 gap-4">
        <div className="lg:col-span-4 pt-3 rounded">
          <Overview />
          <RequireAttention />
        </div>
        <Upcoming />
      </div>
    </>
  )
}
