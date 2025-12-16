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
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Post New Job</h1>
        </div>
        <p className="text-gray-600 ml-14">Fill in the details to create a new job posting</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. Senior Software Engineer"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Describe the role, responsibilities, and what the ideal candidate will do..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            required
            rows={5}
            placeholder="List the skills, qualifications, and experience required..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
          />
          <p className="text-xs text-gray-500 mt-1">Tip: Use bullet points for better readability</p>
        </div>

        {/* Location and Job Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. Remote, New York, On-site"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Salary Range and Deadline Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Salary Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Salary Range
            </label>
            <input
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g. $80,000 - $120,000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - Leave blank if not disclosed</p>
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Application Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={today}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Before you post:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Make sure all information is accurate and up-to-date</li>
              <li>Clearly specify requirements to attract qualified candidates</li>
              <li>Set a realistic deadline for applications</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-6 py-3 bg-accentsecondary text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}
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
