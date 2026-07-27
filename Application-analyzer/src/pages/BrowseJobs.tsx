import { useEffect, useState } from 'react'
import { jobService, applicationService, Job } from '../api/services'
import { toast } from 'react-toastify'
import { getSavedJobIds, toggleSavedJob } from '../utils/savedJobs'

export default function BrowseJobs() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedJobType, setSelectedJobType] = useState('all')
    const [applyingToJob, setApplyingToJob] = useState<number | null>(null)
    const [savedIds, setSavedIds] = useState<number[]>(() => getSavedJobIds())

    const handleToggleSave = (jobId: number) => {
        const nowSaved = toggleSavedJob(jobId)
        setSavedIds(getSavedJobIds())
        toast.success(nowSaved ? 'Job saved' : 'Job removed from saved jobs')
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const response = await jobService.getAllJobs({ active_only: true })
            const jobsList = response.results || response
            setJobs(Array.isArray(jobsList) ? jobsList : [])
        } catch (error: any) {
            console.error('Error fetching jobs:', error)
            toast.error(error.response?.data?.detail || 'Failed to load jobs')
        } finally {
            setLoading(false)
        }
    }

    const handleApplyToJob = async (jobId: number) => {
        try {
            setApplyingToJob(jobId)
            const formData = new FormData()
            formData.append('job', jobId.toString())
            formData.append('cover_letter', '')
            await applicationService.applyForJob(formData)
            toast.success('Application submitted successfully!')
            // Optionally refresh jobs or mark as applied
            fetchJobs()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to apply to job')
        } finally {
            setApplyingToJob(null)
        }
    }

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = selectedJobType === 'all' || job.job_type === selectedJobType
        return matchesSearch && matchesType
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-lg text-gray-600">Loading jobs...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-10">
            <div className="max-w-[1920px] mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Jobs</h1>
                    <p className="text-gray-600">Find your next opportunity</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search by job title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Job Type
                            </label>
                            <select
                                value={selectedJobType}
                                onChange={(e) => setSelectedJobType(e.target.value)}
                                className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                    </p>
                </div>

                {/* Jobs Grid */}
                {filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h3>
                                            <button
                                                onClick={() => handleToggleSave(job.id)}
                                                aria-label={savedIds.includes(job.id) ? 'Remove from saved jobs' : 'Save job'}
                                                className="shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <i className={`${savedIds.includes(job.id) ? 'fa-solid text-emerald-600' : 'fa-regular text-gray-400'} fa-bookmark text-xl`}></i>
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mb-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                                {job.job_type?.replace('_', ' ').toUpperCase()}
                                            </span>
                                            {job.location && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    {job.location}
                                                </span>
                                            )}
                                            {job.salary_range && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                    </svg>
                                                    {job.salary_range}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

                                {job.requirements && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Requirements:</h4>
                                        <p className="text-gray-600 text-sm line-clamp-2">{job.requirements}</p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        Posted {new Date(job.created_at).toLocaleDateString()}
                                        {job.deadline && (
                                            <span className="ml-3">
                                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleApplyToJob(job.id)}
                                        disabled={applyingToJob === job.id}
                                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {applyingToJob === job.id ? 'Applying...' : 'Apply Now'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
