import { useState } from "react"
import RAJobs from "../components/RAJobs";
import RAOnboard from "../components/RAOnboard";
import RACands from "../components/RACands";

export default function RequireAttention() {

  const [selected, setSelected] = useState(0);

  const dists: { [key: number]: number } = {
    "0": 25,
    "1": 25 + 62,
    "2": 25 + 62 + 120,
  }

  return (
    <>
      <h2 className="font-semibold text-xl indent-6 mt-8">Require Attention</h2>
      <div className="*:px-2 px-4 py-1.5 flex gap-2 mt-4 relative">
        <div style={{ left: dists[selected], width: selected === 0 ? 32 : 85 }}
          className="absolute bottom-0 w-8 h-0.5 bg-accentsecondary rounded transition-all" />
        <button onClick={() => setSelected(0)} className={selected === 0 ? "font-semibold" : "text-textdark/50"}>
          Jobs
        </button>
        <button onClick={() => setSelected(1)} className={selected === 1 ? "font-semibold" : "text-textdark/50"}>
          Onboarding
        </button>
        <button onClick={() => setSelected(2)} className={selected === 2 ? "font-semibold" : "text-textdark/50"}>
          Candidates
        </button>
      </div>

      {selected === 0 ?
      <RAJobs />
      : selected === 1 ?
      <RAOnboard /> 
      : <RACands />}
      
    </>
  )
}