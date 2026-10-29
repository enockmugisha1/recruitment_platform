import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";
import AIScoreWidget from "../components/AIScoreWidget";
import StatusBadge from "../components/StatusBadge";
import ApplicationStatusControl from "../components/ApplicationStatusControl";
import { Application } from "../api/services";
import { getAIScore } from "../data/mockAIScores";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// The pipeline a recruiter moves an application through (rejected is a side exit)
const PIPELINE: { key: string; label: string }[] = [
    { key: "submitted", label: "Submitted" },
    { key: "under_review", label: "Under Review" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "accepted", label: "Accepted" },
];

const fileName = (url?: string | null) => (url ? decodeURIComponent(url.split("/").pop() || "file") : "");

export default function CandidateDetail() {
    const { id } = useParams<{ id: string }>();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchCandidateDetails();
    }, [id]);

    const fetchCandidateDetails = async () => {
        try {
            setLoading(true);
            // The API only returns this application if it belongs to one of the
            // logged-in recruiter's jobs; anything else comes back as 404.
            const response = await axios.get(`/access/applications/${id}/`);
            setApplication(response.data);
        } catch (error: any) {
            console.error("Error fetching candidate details:", error);
            setApplication(null);
            toast.error("Failed to load candidate details");
        } finally {
            setLoading(false);
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
    const fullName = `${application.first_name} ${application.last_name}`.trim() || "Unknown Candidate";
    const currentStep = PIPELINE.findIndex((p) => p.key === application.status);
    const rejected = application.status === "rejected";

    return (
        <div className="p-6 md:p-10 main-bg min-h-screen">
            <ToastContainer />

            {/* Breadcrumb */}
            <div className="mb-6">
                <Link to="/candidates" className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-2">
                    <i className="fa-solid fa-chevron-left"></i>
                    <span>Back to candidates</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Candidate Header Card */}
                    <div className="modern-card p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                {application.picture ? (
                                    <img src={application.picture} alt={fullName} className="w-16 h-16 rounded-full object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                                        {fullName.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">{fullName}</h1>
                                    <p className="text-sm text-gray-600">
                                        Applied for <span className="font-semibold">{application.job_title}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {application.email}
                                        {application.phone ? ` • ${application.phone}` : ""}
                                    </p>
                                </div>
                            </div>
                            <StatusBadge status={application.status} />
                        </div>

                        {/* Review progress: Submitted -> Under Review -> Shortlisted -> Accepted */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase mb-2">Review progress</p>
                            <div className="flex items-center">
                                {PIPELINE.map((step, i) => {
                                    const done = !rejected && i <= currentStep;
                                    return (
                                        <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                                                        }`}
                                                >
                                                    {done ? <i className="fa-solid fa-check"></i> : i + 1}
                                                </div>
                                                <span className="text-[11px] text-gray-600 mt-1 whitespace-nowrap">{step.label}</span>
                                            </div>
                                            {i < PIPELINE.length - 1 && (
                                                <div className={`h-0.5 flex-1 mx-2 mb-4 ${!rejected && i < currentStep ? "bg-green-500" : "bg-gray-200"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {rejected && (
                                <p className="text-xs text-red-600 mt-3 font-semibold">This application was rejected.</p>
                            )}
                        </div>

                        {/* Next-step buttons (only the moves the pipeline allows) */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase mb-2">Move this application</p>
                            <ApplicationStatusControl
                                application={application}
                                onChanged={(updated) => setApplication((prev) => (prev ? { ...prev, ...updated } : updated))}
                            />
                        </div>
                    </div>

                    {/* What the applicant submitted */}
                    <div className="modern-card p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Submission</h2>

                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Files</h3>
                            <div className="flex flex-wrap gap-3">
                                {application.resume && (
                                    <a
                                        href={application.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                                    >
                                        <i className="fa-solid fa-file-pdf text-red-500"></i>
                                        <span className="text-sm text-gray-700">Resume — {fileName(application.resume)}</span>
                                    </a>
                                )}
                                {application.cover_letter ? (
                                    <a
                                        href={application.cover_letter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                                    >
                                        <i className="fa-solid fa-file-lines text-blue-500"></i>
                                        <span className="text-sm text-gray-700">Cover letter — {fileName(application.cover_letter)}</span>
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400">No cover letter attached</span>
                                )}
                            </div>
                        </div>

                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Applicant details</h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-xs text-gray-500 uppercase">Email</dt>
                                <dd className="text-gray-800">{application.email}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500 uppercase">Phone</dt>
                                <dd className="text-gray-800">{application.phone || "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500 uppercase">Location</dt>
                                <dd className="text-gray-800">{application.location || "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500 uppercase">Years of experience</dt>
                                <dd className="text-gray-800">{application.years_of_experience ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500 uppercase">Education</dt>
                                <dd className="text-gray-800">{application.education || "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500 uppercase">LinkedIn</dt>
                                <dd className="text-gray-800">
                                    {application.linkedin ? (
                                        <a href={application.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            View profile
                                        </a>
                                    ) : (
                                        "—"
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="modern-card p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Current Status</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                                <StatusBadge status={application.status} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Position</p>
                                <p className="text-sm text-gray-800 font-medium">{application.job_title}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Submitted on</p>
                                <p className="text-sm text-gray-800 font-medium">
                                    {new Date(application.applied_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <AIScoreWidget score={aiScore.score} label={aiScore.label} criteria={aiScore.criteria} />
                </div>
            </div>
        </div>
    );
}