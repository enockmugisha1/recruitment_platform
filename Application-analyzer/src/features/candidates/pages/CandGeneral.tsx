import pdfIcon from "../assets/pdfIcon.svg"
import docIcon from "../assets/docIcon.svg"
import AIScoreWidget from "../../../components/AIScoreWidget"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "../../../api/axios"

export default function CandGeneral() {
  const { candId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        await axios.get(`/access/applications/${candId}/`);
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [candId]);

  const mockCriteria = [
    { name: "Qualifications and skills match", matched: true },
    { name: "Experience Relevance", matched: true },
    { name: "Education", matched: true },
    { name: "Keywords Match", matched: false },
    { name: "Years of Experience", matched: true },
    { name: "Job Hopping", matched: false },
    { name: "Cultural Fit", matched: true },
    { name: "Interview Performance", matched: true },
    { name: "References", matched: false },
    { name: "Additional Factors", matched: true },
  ];

  if (loading) return <div className="p-10 text-center">Loading candidate profile...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 p-6 gap-8">
      <div className="lg:col-span-2 space-y-10">
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Candidate Files
            <button className="text-xs text-accentprimary hover:underline font-normal">Edit</button>
          </h3>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-3 py-3 px-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group">
              <img src={pdfIcon} alt="pdf" className="w-8 h-8" />
              <div className="text-left">
                <p className="font-semibold text-gray-700 group-hover:text-accentprimary transition-colors">Cover_letter.pdf</p>
                <p className="text-xs text-gray-400">2d ago</p>
              </div>
            </button>
            <button className="flex items-center gap-3 py-3 px-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group">
              <img src={docIcon} alt="doc" className="w-8 h-8" />
              <div className="text-left">
                <p className="font-semibold text-gray-700 group-hover:text-accentprimary transition-colors">My_resume.pdf</p>
                <p className="text-xs text-gray-400">2d ago</p>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Last Experience
            <button className="text-xs text-accentprimary hover:underline font-normal">Edit</button>
          </h3>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-1 h-full bg-blue-100 rounded-full" />
              </div>
              <div className="pb-4">
                <h4 className="text-lg font-bold text-gray-800">Senior Data Analyst</h4>
                <p className="text-accentprimary font-medium mt-1">Google <span className="text-gray-400 font-normal ml-2">(May 2021 - Present)</span></p>
                <div className="mt-4">
                  <p className="font-semibold text-sm text-gray-700 mb-2">Responsible for;</p>
                  <ul className="space-y-2">
                    {[
                      "Data Exploration and Analysis: They perform exploratory data analysis to uncover insights, trends, and patterns in the data, often using statistical and visualisation techniques.",
                      "Data Cleaning and Preprocessing: Data analysts are responsible for cleaning and preparing raw renewable data to ensure its accuracy and reliability for analysis.",
                      "Reporting and Communication: Data analysts communicate their findings through reports, dashboards, and presentations to help stakeholders make informed decisions based on the data-driven insights."
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                        <span className="text-accentprimary font-bold">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-1 h-full bg-gray-100 rounded-full" />
              </div>
              <div className="pb-4">
                <h4 className="text-lg font-bold text-gray-800">Junior Data Analyst</h4>
                <p className="text-accentprimary font-medium mt-1">Microsoft <span className="text-gray-400 font-normal ml-2">(May 2020 - May 2021)</span></p>
                <div className="mt-4">
                  <p className="font-semibold text-sm text-gray-700 mb-2">Responsible for;</p>
                  <ul className="space-y-2">
                    {[
                      "Data Exploration and Analysis: They perform exploratory data analysis to uncover insights, trends, and patterns in the data, often using statistical and visualisation techniques.",
                      "Data Cleaning and Preprocessing: Data analysts are responsible for cleaning and preparing raw renewable data to ensure its accuracy and reliability for analysis.",
                      "Reporting and Communication: Data analysts communicate their findings through reports, dashboards, and presentations to help stakeholders make informed decisions based on the data-driven insights."
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                        <span className="text-accentprimary font-bold">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <AIScoreWidget
            score={75}
            label="Potential Fit"
            criteria={mockCriteria}
          />
        </div>
      </div>
    </div>
  );
}