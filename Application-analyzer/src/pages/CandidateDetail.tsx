import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import AIScoreWidget from "../components/AIScoreWidget";
import StatusBadge from "../components/StatusBadge";
import { getAIScore } from "../data/mockAIScores";
import { toast, ToastContainer } from "react-toastify";
import defpfp from "../assets/defpfp.svg";
import "react-toastify/dist/ReactToastify.css";

interface CandidateApplication {
    id: number;
    job: {
        id: number;
        title: string;
    };
    applicant: {
        id: number;
        user: {
            first_name: string;
            last_name: string;
            email: string;
        };
        phone?: string;
        location?: string;
        picture?: string;
        years_of_experience?: number;
    };
    status: string;
    applied_at: string;
    resume?: string;
    cover_letter?: string;
}

export default function CandidateDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [application, setApplication] = useState<CandidateApplication | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchCandidateDetails();
        }
    }, [id]);

    const fetchCandidateDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/access/applications/${id}/`);
            setApplication(response.data);
        } catch (error: any) {
            console.error("Error fetching candidate details:", error);
            toast.error("Failed to load candidate details");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!id) return;
        try {
            await axios.patch(`/access/applications/${id}/`, { status: newStatus });
            toast.success(`Application ${newStatus}!`);
            fetchCandidateDetails();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="p-10 main-bg min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="fa-solid fa-spinner loading-spinner text-5xl text-green-500 mb-4"></i>
                    <p className="text-gray-600 text-lg">Loading candidate details...</p>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-10 main-bg min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="fa-solid fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
                    <p className="text-gray-600 text-lg">Candidate not found</p>
                    <Link to="/candidates" className="btn-primary mt-4 inline-block">
                        Back to Candidates
                    </Link>
                </div>
            </div>
        );
    }

    const aiScore = getAIScore(application.id);
    const fullName = application.applicant?.user
        ? `${application.applicant.user.first_name} ${application.applicant.user.last_name}`
        : "Unknown Candidate";

    return (
        <div className="p-6 md:p-10 main-bg min-h-screen">
            <ToastContainer />

            {/* Breadcrumb */}
            <div className="mb-6">
                <Link to="/candidates" className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-2">
                    <i className="fa-solid fa-chevron-left"></i>
                    <span>Pascal Onuoha</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Candidate Header Card */}
                    <div className="modern-card p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                                    {fullName.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">{fullName}</h1>
                                    <p className="text-sm text-gray-600">{application.job?.title || "Position Not Specified"}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {application.applicant?.user?.email} • +250124568457
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <button className="text-sm text-blue-600 hover:underline mr-2">
                                    <i className="fa-solid fa-pen mr-1"></i>
                                    Edit
                                </button>
                                <button className="text-sm text-blue-600 hover:underline mr-2">
                                    <i className="fa-brands fa-linkedin mr-1"></i>
                                </button>
                                <button className="text-sm text-blue-600 hover:underline mr-2">
                                    <i className="fa-brands fa-twitter mr-1"></i>
                                </button>
                                <button className="text-sm text-blue-600 hover:underline">
                                    <i className="fa-solid fa-link mr-1"></i>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => updateStatus("shortlisted")}
                                className="btn-success"
                            >
                                Accept Candidate
                            </button>
                            <button
                                onClick={() => updateStatus("rejected")}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                            >
                                Reject Candidate
                            </button>
                            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition">
                                Schedule Interview
                            </button>
                            <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                                Reject Application
                            </button>
                        </div>
                    </div>

                    {/* Overall Candidate Profile */}
                    <div className="modern-card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Overall Candidate Profile</h2>

                        {/* Candidate Files */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Candidate Files</h3>
                            <div className="flex flex-wrap gap-3">
                                {application.resume && (
                                    <a
                                        href={application.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                                    >
                                        <i className="fa-solid fa-file-pdf text-red-500"></i>
                                        <span className="text-sm text-gray-700">Cover_letter.pdf</span>
                                        <span className="text-xs text-gray-500">10 MB</span>
                                    </a>
                                )}
                                {application.resume && (
                                    <a
                                        href={application.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                                    >
                                        <i className="fa-solid fa-file-pdf text-red-500"></i>
                                        <span className="text-sm text-gray-700">My_resume.pdf</span>
                                        <span className="text-xs text-gray-500">12 MB</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Last Experience */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Last Experience</h3>
                            <div className="space-y-4">
                                <div className="border-l-2 border-green-500 pl-4 py-2">
                                    <p className="font-semibold text-gray-800">Senior Data Analyst</p>
                                    <p className="text-sm text-gray-600">Google • (May 2001 - Present)</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        <span className="font-semibold">Responsible for:</span>
                                    </p>
                                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                        <li>Data Exploration and Analysis: They perform exploratory data analysis to uncover insights, trends, and patterns in the data.</li>
                                        <li>Data Cleaning and Preprocessing: Data analysts are responsible for cleaning and preparing data to ensure its accuracy and reliability for analysis.</li>
                                    </ul>
                                </div>

                                <div className="border-l-2 border-gray-300 pl-4 py-2">
                                    <p className="font-semibold text-gray-800">Junior Data Analyst</p>
                                    <p className="text-sm text-gray-600">Microsoft • (May 2021 - May 2023)</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        <span className="font-semibold">Responsible for:</span>
                                    </p>
                                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                        <li>Data Exploration and Analysis: They perform exploratory data analysis to uncover insights, trends, and patterns in the data.</li>
                                        <li>Data Cleaning and Preprocessing: Data analysts are responsible for cleaning and preparing data to ensure its accuracy and reliability for analysis.</li>
                                        <li>Reporting and Communication: They communicate their findings through reports, dashboards, and presentations to help stakeholders make informed decisions based on the data-driven insights.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Current Status */}
                    <div className="modern-card p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Current Status</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Round</p>
                                <StatusBadge status="Final" customClass="badge-blue" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Assigned To</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                        A
                                    </div>
                                    <span className="text-sm text-gray-700">Alemsy</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Interview Date</p>
                                <p className="text-sm text-gray-800 font-medium">
                                    {application.applied_at
                                        ? new Date(application.applied_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "Jul 30, 2021"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* AI Score Widget */}
                    <AIScoreWidget
                        score={aiScore.score}
                        label={aiScore.label}
                        criteria={aiScore.criteria}
                    />
                </div>
            </div>
        </div>
    );
}
