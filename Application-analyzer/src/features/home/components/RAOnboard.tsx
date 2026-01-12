import defpfp from "../../../assets/defpfp.svg"
import pfp from "../../candidates/assets/pfp.jpg"
import person1 from "../../../assets/person1.png"
import person2 from "../../../assets/person2.png"
import person3 from "../../../assets/person3.png"

export default function RAOnboard() {

  const onboardData = [
    {
      name: "Sruthi Nambiar",
      role: "Sr. Software Developer",
      image: defpfp,
      onboardedOn: "Jul 3, 2023",
      training: { completed: 6, total: 10 },
      documentation: { completed: 6, total: 10 },
      supervisor: null,
      project: null
    },
    {
      name: "Natalie Portman",
      role: "Sr. Product Designer",
      image: person1,
      onboardedOn: "Jul 9, 2023",
      training: { completed: 2, total: 8 },
      documentation: { completed: 6, total: 10 },
      supervisor: { name: "Raghav Menon", image: pfp },
      project: "Respi lon"
    },
    {
      name: "Ikshitha Gupta",
      role: "Product Lead",
      image: person2,
      onboardedOn: "Mar 20, 2023",
      training: { completed: 1, total: 5 },
      documentation: { completed: 6, total: 10 },
      supervisor: null,
      project: null
    },
    {
      name: "Ramesh Bhagat",
      role: "Sr. Java Developer",
      image: person3,
      onboardedOn: "Aug 18, 2023",
      training: { completed: 7, total: 10 },
      documentation: { completed: 6, total: 10 },
      supervisor: { name: "Raghav Menon", image: pfp },
      project: "Respiron"
    },
    {
      name: "Sruthi Nambiar",
      role: "Sr. Software Developer",
      image: defpfp,
      onboardedOn: "Sep 22, 2023",
      training: { completed: 6, total: 10 },
      documentation: { completed: 6, total: 10 },
      supervisor: null,
      project: null
    }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Onboarded On</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Training</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Documentation</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Supervisor</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {onboardData.map((employee, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={employee.image}
                      alt={employee.name}
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{employee.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{employee.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 font-semibold">{employee.onboardedOn}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      <span className="font-bold text-gray-800">{employee.training.completed}/</span>
                      {employee.training.total}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(employee.training.completed / employee.training.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      <span className="font-bold text-gray-800">{employee.documentation.completed}/</span>
                      {employee.documentation.total}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(employee.documentation.completed / employee.documentation.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {employee.supervisor ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={employee.supervisor.image}
                        alt={employee.supervisor.name}
                        className="h-6 w-6 rounded-full object-cover border border-gray-200"
                      />
                      <span className="text-xs font-semibold text-gray-700">{employee.supervisor.name}</span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">
                      Not allocated
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {employee.project ? (
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                      {employee.project}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">
                      Not allocated
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ml-auto">
                    <i className="fa-solid fa-ellipsis-vertical text-gray-400"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}