import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../api/services';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    job_type: 'full_time',
    salary_range: '',
    deadline: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await jobService.createJob(formData);

      toast.success('Job posted successfully! Redirecting to jobs page...', {
        position: 'top-right',
        autoClose: 2000,
      });

      setTimeout(() => navigate('/jobs'), 1500);
    } catch (err: any) {
      let errorMessage = 'Failed to post job';

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title[0];
        } else if (err.response.data.deadline) {
          errorMessage = err.response.data.deadline[0];
        } else {
          // Try to get first error from any field
          const firstError = Object.values(err.response.data)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          }
        }
      }

      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today) for deadline
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Post New Job</h1>
        </div>
        <p className="text-gray-500 ml-14 font-medium">Fill in the details to create a new job posting</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
        {/* Job Title */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. Senior Software Engineer"
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Describe the role, responsibilities, and what the ideal candidate will do..."
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all placeholder:text-gray-400 resize-none"
          />
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">
            Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            required
            rows={5}
            placeholder="List the skills, qualifications, and experience required..."
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all placeholder:text-gray-400 resize-none"
          />
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-1">
            <i className="fas fa-lightbulb text-yellow-500"></i>
            Tip: Use bullet points for better readability
          </p>
        </div>

        {/* Location and Job Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. Remote, New York, On-site"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Job Type */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Salary Range and Deadline Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salary Range */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Salary Range
            </label>
            <input
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g. $80,000 - $120,000"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 font-medium mt-1">Optional - Leave blank if not disclosed</p>
          </div>

          {/* Application Deadline */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Application Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={today}
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-info-circle text-green-600"></i>
          </div>
          <div className="text-sm text-green-800">
            <p className="font-bold mb-1.5">Before you post:</p>
            <ul className="space-y-1 text-green-700 font-medium">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                Make sure all information is accurate and up-to-date
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                Clearly specify requirements to attract qualified candidates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                Set a realistic deadline for applications
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-8 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-sm hover:shadow-md transition-all font-bold flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Posting Job...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Post Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
