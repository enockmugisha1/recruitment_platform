import { useEffect, useState } from "react";
import axios from "../api/axios";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";

interface Application {
  id: number;
  job: {
    id: number;
    title: string;
  } | number;
  applicant: {
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    phone: string;
    location: string;
    years_of_experience: number;
  } | number;
  resume: string;
  cover_letter?: string;
  status: string;
  applied_at: string;
}

interface Meeting {
  id: number;
  candidate: string;
  time: string;
  date: string;
}

export default function RecruiterApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("positionsLeft");
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, jobsRes] = await Promise.all([
        axios.get("/access/applications/"),
        axios.get("/access/jobs/")
      ]);

      setApplications(appsRes.data.results || appsRes.data);
      setJobs(jobsRes.data.results || jobsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock upcoming meetings for UI
  const upcomingMeetings: Meeting[] = [
    { id: 1, candidate: "Web Research check screening call plans", time: "03:00 - 3:45", date: "May 13" },
    { id: 2, candidate: "Web Research check screening call plans", time: "03:00 - 3:45", date: "May 13" },
    { id: 3, candidate: "Web Research check screening call plans", time: "03:00 - 3:45", date: "May 14" },
  ];

  // Calculate statistics
  const stats = {
    scheduled: 33,
    interviewFeedback: 2,
    totalCandidates: applications.length || 44,
    otherAcceptance: 13,
    documentationsPending: 17,
    totalCandidatesDB: 107,
    supervisorAssign: 5,
    projectAllocation: 56
  };

  const tabs = [
    { key: "positionsLeft", label: "Positions Left" },
    { key: "applications", label: "Applications" },
    { key: "interviewed", label: "Interviewed" },
    { key: "rejected", label: "Rejected" },
    { key: "feedbackPending", label: "Feedback Pending" },
    { key: "offered", label: "Offered" }
  ];

  // Pagination Logic
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-screen flex flex-col main-bg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 py-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Statistics and Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                count={stats.scheduled}
                label="Applicants Scheduled"
                illustration={
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="35" cy="30" r="15" fill="#4CAF50" opacity="0.2" />
                      <circle cx="35" cy="30" r="8" fill="#4CAF50" />
                      <path d="M20 50 Q35 45 50 50" stroke="#4CAF50" strokeWidth="3" fill="none" />
                      <circle cx="65" cy="40" r="12" fill="#81C784" opacity="0.3" />
                      <circle cx="65" cy="40" r="6" fill="#66BB6A" />
                    </svg>
                  </div>
                }
              />
              <StatCard
                count={stats.interviewFeedback}
                label="Interview / Feedback Pending"
                illustration={
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="35" r="18" fill="#FFA726" opacity="0.2" />
                      <circle cx="50" cy="35" r="10" fill="#FFA726" />
                      <rect x="35" y="55" width="30" height="35" rx="5" fill="#FFB74D" opacity="0.3" />
                    </svg>
                  </div>
                }
              />
              <StatCard
                count={stats.totalCandidates}
                label="Total Candidates Pending"
                illustration={
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="30" cy="30" r="12" fill="#42A5F5" opacity="0.3" />
                      <circle cx="30" cy="30" r="7" fill="#42A5F5" />
                      <circle cx="50" cy="30" r="12" fill="#42A5F5" opacity="0.3" />
                      <circle cx="50" cy="30" r="7" fill="#42A5F5" />
                      <circle cx="70" cy="30" r="12" fill="#42A5F5" opacity="0.3" />
                      <circle cx="70" cy="30" r="7" fill="#42A5F5" />
                    </svg>
                  </div>
                }
              />
              <StatCard
                count={stats.otherAcceptance}
                label="Other Acceptance Pending"
                illustration={
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="40" r="15" fill="#AB47BC" opacity="0.2" />
                      <path d="M40 40 L48 48 L65 30" stroke="#AB47BC" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                }
              />
              <StatCard
                count={stats.documentationsPending}
                label="Documentations Pending"
                illustration={
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect x="30" y="20" width="40" height="55" rx="3" fill="#EF5350" opacity="0.2" />
                      <line x1="40" y1="35" x2="60" y2="35" stroke="#EF5350" strokeWidth="2" />
                      <line x1="40" y1="45" x2="60" y2="45" stroke="#EF5350" strokeWidth="2" />
                      <line x1="40" y1="55" x2="55" y2="55" stroke="#EF5350" strokeWidth="2" />
                    </svg>
                  </div>
                }
              />
              <StatCard
                count={stats.totalCandidatesDB}
                label="Total Candidates"
                illustration={
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="35" r="15" fill="#26A69A" opacity="0.3" />
                      <circle cx="50" cy="35" r="10" fill="#26A69A" />
                      <path d="M25 70 Q50 60 75 70" stroke="#26A69A" strokeWidth="3" fill="none" />
                    </svg>
                  </div>
                }
              />
              <StatCard
                count={stats.supervisorAssign}
                label="Supervisor Assign Pending"
                illustration={
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="35" cy="35" r="12" fill="#5C6BC0" opacity="0.3" />
                      <circle cx="65" cy="35" r="12" fill="#5C6BC0" opacity="0.3" />
                      <line x1="35" y1="45" x2="65" y2="45" stroke="#5C6BC0" strokeWidth="3" />
                    </svg>
                  </div>
                }
              />
              <StatCard
                count={stats.projectAllocation}
                label="Project Allocation Pending"
                illustration={
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="40" cy="40" r="15" fill="#7E57C2" opacity="0.2" />
                      <circle cx="60" cy="60" r="12" fill="#9575CD" opacity="0.3" />
                      <path d="M40 50 L60 55" stroke="#7E57C2" strokeWidth="3" />
                    </svg>
                  </div>
                }
              />
            </div>

            {/* Require Attention Section */}
            <div className="modern-card p-6 flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Require Attention</h2>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
                <button className="px-3 py-1 text-sm font-semibold text-gray-700 hover:text-green-600 border-b-2 border-green-500">Jobs</button>
                <button className="px-3 py-1 text-sm font-semibold text-gray-400 hover:text-gray-600">Onboarding</button>
                <button className="px-3 py-1 text-sm font-semibold text-gray-400 hover:text-gray-600">Candidates</button>
              </div>

              {/* Tab Content Navigation */}
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1 rounded-t transition-colors ${activeTab === tab.key
                      ? "bg-gray-100 text-gray-800 font-semibold"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                {loading ? (
                  <div className="text-center py-8">
                    <i className="fa-solid fa-spinner loading-spinner text-3xl text-green-500 mb-3"></i>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fa-solid fa-inbox text-4xl mb-3 opacity-30"></i>
                    <p>No jobs found</p>
                  </div>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50 sticky top-0 z-10">
                        <tr className="text-gray-600 text-xs">
                          <th className="text-left py-3 px-2 font-semibold">Jobs</th>
                          <th className="text-center py-3 px-2 font-semibold">3</th>
                          <th className="text-center py-3 px-2 font-semibold">123</th>
                          <th className="text-center py-3 px-2 font-semibold">40</th>
                          <th className="text-center py-3 px-2 font-semibold">33</th>
                          <th className="text-center py-3 px-2 font-semibold">7</th>
                          <th className="text-center py-3 px-2 font-semibold">2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedJobs.map((job, index) => (
                          <tr key={job.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs shrink-0">
                                  {job.title?.charAt(0) || 'J'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 line-clamp-1">{job.title || 'Untitled Job'}</p>
                                  <p className="text-xs text-gray-500">30 days ago</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-center text-gray-700">{Math.floor(Math.random() * 10)}</td>
                            <td className="text-center text-gray-700">{123 - index * 25}</td>
                            <td className="text-center text-gray-700">{40 - index * 5}</td>
                            <td className="text-center text-gray-700">{33 - index * 3}</td>
                            <td className="text-center text-gray-700">{7 - index}</td>
                            <td className="text-center text-gray-700">{2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Upcoming Meetings */}
          <div className="lg:col-span-1">
            <div className="modern-card p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Upcoming Meetings</h3>
                <i className="fa-solid fa-ellipsis-vertical text-gray-400 cursor-pointer hover:text-gray-600"></i>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Today</p>
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400 hover:shadow-sm transition-shadow">
                    <p className="text-sm text-gray-800 font-medium mb-1">{meeting.candidate}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <i className="fa-solid fa-clock text-blue-400"></i>
                      <span>{meeting.time}</span>
                    </div>
                  </div>
                ))}

                <p className="text-xs font-semibold text-gray-500 uppercase mt-6">This Week</p>
                <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400 hover:shadow-sm transition-shadow">
                  <p className="text-sm text-gray-800 font-medium mb-1">Web Research check screening call plans</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <i className="fa-solid fa-clock text-green-400"></i>
                    <span>May 15 • 03:00 - 3:45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
