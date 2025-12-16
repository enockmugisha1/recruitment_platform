import defpfp from "../../../assets/defpfp.svg"
import pfp from "../../candidates/assets/pfp.jpg"
import person1 from "../../../assets/person1.png"
import person2 from "../../../assets/person2.png"
import person3 from "../../../assets/person3.png"

export default function RAOnboard() {

  return (
    <div className="bg-lightgraybg onboardtable place-items-center py-4 mt-5 gap-y-1 rounded-lg px-1">
      <div className="grid grid-cols-subgrid col-span-full justify-items-center text-sm text-textdark/50 font-normal rounded-lg py-2">
        <div className=""></div>
        <div>Onboarded On</div>
        <div>Training</div>
        <div>Documentation</div>
        <div>Supervisor</div>
        <div className="">Project</div>
      </div>

      <div className="col-span-full grid grid-cols-subgrid place-items-center hover:bg-graybg py-2 rounded-lg group transition-colors relative">

        <div className="flex gap-5 text-textdark justify-self-start pl-5">
          <img src={defpfp} alt="Case Icon" />
          <div className="text-start font-semibold space-y-1.5 w-full">
            <p>Sruthi Nambiar</p>
            <p className="text-xs text-textdark/50">Sr. Software Developer</p>
          </div>
        </div>
        <div className="text-textdark font-semibold">Jul 3, 2023</div>
        <div><span className="font-semibold">06/</span>10</div>
        <div><span className="font-semibold">06/</span>10</div>
        <div className="text-sm font-semibold bg-lightred text-darkred w-36 py-1 text-center rounded-xl">Not allocated</div>
        <div className="text-sm font-semibold bg-lightred text-darkred w-36 py-1 text-center rounded-xl">Not allocated</div>

        <a className="w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0" href="#">
          <i className="fa-solid fa-ellipsis-vertical text-xl w-full text-center"></i>
        </a>
      </div>

      <div className="col-span-6 h-px w-full bg-graybg" />


      <div className="col-span-full grid grid-cols-subgrid place-items-center hover:bg-graybg py-2 rounded-lg group transition-colors relative">

        <div className="flex gap-5 text-textdark justify-self-start pl-5">
          <img className="h-10 aspect-square object-cover rounded-full"
            src={person1} alt="Case Icon" />
          <div className="text-start font-semibold space-y-1.5 w-full">
            <p>Natalie Portman</p>
            <p className="text-xs text-textdark/50">Sr. Product Designer</p>
          </div>
        </div>
        <div className="text-textdark font-semibold">Jul 9, 2023</div>
        <div><span className="font-semibold">02/</span>8</div>
        <div><span className="font-semibold">06/</span>10</div>
        <div className="w-36 py-1 bg-lightblue rounded-xl font-semibold text-xs leading-5 text-center indent-6 relative">
          <img className="h-full aspect-square object-cover rounded-full absolute top-0 outline outline-4 outline-slate-300"
            src={pfp} alt="" />
          Raghav Menon
        </div>
        <div className="text-sm font-semibold bg-lightgreen text-darkgreen w-36 py-1 text-center rounded-xl">Respilon</div>

        <a className="w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0" href="#">
          <i className="fa-solid fa-ellipsis-vertical text-xl w-full text-center"></i>
        </a>
      </div>

      <div className="col-span-6 h-px w-full bg-graybg" />


      <div className="col-span-full grid grid-cols-subgrid place-items-center hover:bg-graybg py-2 rounded-lg group transition-colors relative">
        <div className="flex gap-5 text-textdark justify-self-start pl-5">
          <img className="h-10 aspect-square object-cover rounded-full"
            src={person2} alt="Case Icon" />
          <div className="text-start font-semibold space-y-1.5 w-full">
            <p>Ikshitha Gupta</p>
            <p className="text-xs text-textdark/50">Product Lead</p>
          </div>
        </div>
        <div className="text-textdark font-semibold">Mar 20, 2023</div>
        <div><span className="font-semibold">01/</span>5</div>
        <div><span className="font-semibold">06/</span>10</div>
        <div className="text-sm font-semibold bg-lightred text-darkred w-36 py-1 text-center rounded-xl">Not allocated</div>
        <div className="text-sm font-semibold bg-lightred text-darkred w-36 py-1 text-center rounded-xl">Not allocated</div>

        <a className="w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0" href="#">
          <i className="fa-solid fa-ellipsis-vertical text-xl w-full text-center"></i>
        </a>
      </div>

      <div className="col-span-6 h-px w-full bg-graybg" />

      <div className="col-span-full grid grid-cols-subgrid place-items-center hover:bg-graybg py-2 rounded-lg group transition-colors relative">
        <div className="flex gap-5 text-textdark justify-self-start pl-5">
          <img className="h-10 aspect-square object-cover rounded-full"
            src={person3} alt="Case Icon" />
          <div className="text-start font-semibold space-y-1.5 w-full">
            <p>Ramesh Bhagat</p>
            <p className="text-xs text-textdark/50">Sr. Java Developer</p>
          </div>
        </div>
        <div className="text-textdark font-semibold">Aug 18, 2023</div>
        <div><span className="font-semibold">07/</span>10</div>
        <div><span className="font-semibold">06/</span>10</div>
        <div className="w-36 py-1 bg-lightblue rounded-xl font-semibold text-xs leading-5 text-center indent-6 relative">
          <img className="h-full aspect-square object-cover rounded-full absolute top-0 outline outline-4 outline-slate-300"
            src={pfp} alt="" />
          Raghav Menon
        </div>
        <div className="text-sm font-semibold bg-lightgreen text-darkgreen w-36 py-1 text-center rounded-xl">Respilon</div>

        <a className="w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0" href="#">
          <i className="fa-solid fa-ellipsis-vertical text-xl w-full text-center"></i>
        </a>
      </div>

      <div className="col-span-6 h-px w-full bg-graybg" />


      <div className="col-span-full grid grid-cols-subgrid place-items-center hover:bg-graybg py-2 rounded-lg group transition-colors relative">
        <div className="flex gap-5 text-textdark justify-self-start pl-5">
          <img className="h-10 aspect-square object-cover rounded-full"
            src={defpfp} alt="Case Icon" />
          <div className="text-start font-semibold space-y-1.5 w-full">
            <p>Sruthi Nambiar</p>
            <p className="text-xs text-textdark/50">Sr. Software Developer</p>
          </div>
        </div>
        <div className="text-textdark font-semibold">Sep 22, 2023</div>
        <div><span className="font-semibold">06/</span>10</div>
        <div><span className="font-semibold">06/</span>10</div>
        <div className="text-sm font-semibold bg-lightred text-darkred w-36 py-1 text-center rounded-xl">Not allocated</div>
        <div className="text-sm font-semibold bg-lightred text-darkred w-36 py-1 text-center rounded-xl">Not allocated</div>

        <a className="w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0" href="#">
          <i className="fa-solid fa-ellipsis-vertical text-xl w-full text-center"></i>
        </a>
      </div>

      <div className="col-span-full h-px w-full bg-graybg" />
    </div>
  )
}