import pdfIcon from "../assets/pdfIcon.svg"
import docIcon from "../assets/docIcon.svg"
import counterImg from "../assets/counter.svg"
import greenTick from "../assets/greenTick.svg"
import redx from "../assets/redx.svg"

export default function CandGeneral() {
  return (
    <div className="grid grid-cols-3 p-3 gap-x-8">
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mt-4">
          Candidate Files
          <a className="text-sm inline-block ml-2 text-accentprimary/75 underline" href="#">Edit</a>
        </h3>

        <div className="flex gap-5 mt-5">
          <button className="flex items-center gap-3 py-2 px-4 bg-lightblue rounded-lg border border-textdark/15 hover:bg-accentprimary/20 hover:shadow-lg transition">
            <img src={pdfIcon} alt="pdf icon" />
            <p>
              Cover_letter.pdf
              <span className="text-xs text-textdark/50 self-center inline-block ml-2">2d ago</span>
            </p>
          </button>
          <button className="flex items-center gap-3 py-2 px-4 bg-lightblue rounded-lg border border-textdark/15 hover:bg-accentprimary/20 hover:shadow-lg transition">
            <img src={docIcon} alt="pdf icon" />
            <p>
              My_resume.docx
              <span className="text-xs text-textdark/50 self-center inline-block ml-2">2d ago</span>
            </p>
          </button>
        </div>

        <h3 className="text-lg font-semibold mt-12">
          Last Experience
          <a className="text-sm inline-block ml-2 text-accentprimary/75 underline" href="#">Edit</a>
        </h3>
        <div className="flex gap-2 mt-4">
          <div className="w-3 h-14 bg-graybg rounded-full" />
          <div className="">
            <h4>Senior Data Analyst</h4>
            <p className="mt-2 flex gap-4">Google
              <span className="text-textdark/50">(May 2021 - Present)</span>
            </p>

            <p className="mt-2">Responsible for;</p>
            <ol className="list-decimal ml-6 text-textdark/50 space-y-1">
              <li>Data Exploration and Analysis: They perform exploratory data analysis to uncover insights, trends, and patterns in the data, often using statistical and visualisation techniques.</li>
              <li>Data Cleaning and Preprocessing: Data analysts are responsible for cleaning and preparing raw renewable data to ensure its accuracy and reliability for analysis.</li>
              <li>Reporting and Communication: Data analysts communicate their findings through reports, dashboards, and presentations to help stakeholders make informed decisions based on the data-driven insights.</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <div className="w-3 h-14 bg-graybg rounded-full" />
          <div className="">
            <h4>Junior Data Analyst</h4>
            <p className="mt-2 flex gap-4">Microsoft
              <span className="text-textdark/50">(May 2020 - May 2021)</span>
            </p>

            <p className="mt-2">Responsible for;</p>
            <ol className="list-decimal ml-6 text-textdark/50 space-y-1">
              <li>Data Exploration and Analysis: They perform exploratory data analysis to uncover insights, trends, and patterns in the data, often using statistical and visualisation techniques.</li>
              <li>Data Cleaning and Preprocessing: Data analysts are responsible for cleaning and preparing raw renewable data to ensure its accuracy and reliability for analysis.</li>
              <li>Reporting and Communication: Data analysts communicate their findings through reports, dashboards, and presentations to help stakeholders make informed decisions based on the data-driven insights.</li>
            </ol>
          </div>
        </div>
      </div>


      <div className="border-4 border-graybg rounded-lg pt-14 mr-5 mt-2">
        <div className="w-56 bg-white/50 mx-auto pt-10 border border-graybg rounded-lg flex flex-col items-center gap-2">
          <img className="mx-auto" src={counterImg} alt="counter" />
          <p className="font-semibold">Score: <span className="text-mygreen">Potential Fit</span></p>
          <a className="text-sm text-accentprimary/75 underline font-semibold mb-2" href="#">Edit</a>
        </div>
        <ul className="px-6 text-darkblue/80 mt-14 space-y-4">
          <li className="flex justify-between">
            <p>Qualifications and skills match</p>
            <img src={greenTick} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>Experience Relevance</p>
            <img src={greenTick} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>Education</p>
            <img src={greenTick} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>Keywords Match</p>
            <img src={redx} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>Years of Experience</p>
            <img src={greenTick} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>Job Hopping</p>
            <img src={redx} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>Cultural Fit</p>
            <img src={greenTick} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>Interview Performance</p>
            <img src={greenTick} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>References</p>
            <img src={redx} alt="tick" />
          </li>
          <li className="flex justify-between">
            <p>Additional Factors</p>
            <img src={greenTick} alt="tick" />
          </li>
        </ul>
      </div>
    </div>
  )
}