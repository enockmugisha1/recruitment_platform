import { useState } from 'react';
import { aiResumeService } from '../api/services';
import { toast } from 'react-toastify';

interface AnalysisResult {
  skills: string[];
  experience_years: number;
  education: string[];
  match_score?: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

interface AIResumeAnalyzerProps {
  applicationId?: number;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export default function AIResumeAnalyzer({ applicationId, onAnalysisComplete }: AIResumeAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setAnalyzing(true);
      const analysisResult = await aiResumeService.analyzeResume(file);
      setResult(analysisResult);
      setShowModal(true);
      toast.success('Resume analyzed successfully!');
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (error: any) {
      // Check if AI service is not available
      if (error.response?.status === 404 || error.response?.status === 501) {
        toast.warning('AI Resume Analyzer is not yet deployed. Coming soon!', {
          autoClose: 5000,
        });
      } else {
        toast.error(error.response?.data?.detail || 'Failed to analyze resume');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMatchToJob = async () => {
    if (!applicationId) return;

    try {
      setAnalyzing(true);
      const matchResult = await aiResumeService.matchCandidateToJob(applicationId);
      setResult(matchResult);
      setShowModal(true);
      toast.success('Candidate matched to job successfully!');
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 501) {
        toast.warning('AI Matching service is not yet deployed. Coming soon!', {
          autoClose: 5000,
        });
      } else {
        toast.error(error.response?.data?.detail || 'Failed to match candidate');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 p-3 rounded-lg">
            <i className="fa-solid fa-brain text-purple-600 text-2xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-800 mb-1">
              AI Resume Analyzer
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Use AI to analyze resumes, extract skills, and match candidates to jobs automatically
            </p>
            
            <div className="flex flex-wrap gap-2">
              <label className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={analyzing}
                  className="hidden"
                />
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                  analyzing 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}>
                  {analyzing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-upload"></i>
                      Analyze Resume
                    </>
                  )}
                </span>
              </label>

              {applicationId && (
                <button
                  onClick={handleMatchToJob}
                  disabled={analyzing}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    analyzing 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <i className="fa-solid fa-chart-line"></i>
                  Match to Job
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              <i className="fa-solid fa-info-circle mr-1"></i>
              {applicationId 
                ? 'Click "Match to Job" to get AI-powered candidate matching'
                : 'Upload a resume (PDF/DOC, max 5MB) to get AI insights'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Results Modal */}
      {showModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                <i className="fa-solid fa-brain text-purple-600 mr-2"></i>
                AI Analysis Results
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            {/* Match Score */}
            {result.match_score !== undefined && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Match Score</div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-green-600">
                    {result.match_score}%
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${result.match_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {result.skills && result.skills.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  <i className="fa-solid fa-code mr-2 text-blue-600"></i>
                  Skills Detected
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {result.experience_years !== undefined && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  <i className="fa-solid fa-briefcase mr-2 text-green-600"></i>
                  Experience
                </h4>
                <p className="text-gray-700">
                  {result.experience_years} {result.experience_years === 1 ? 'year' : 'years'} of professional experience
                </p>
              </div>
            )}

            {/* Education */}
            {result.education && result.education.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  <i className="fa-solid fa-graduation-cap mr-2 text-purple-600"></i>
                  Education
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.education.map((edu, index) => (
                    <li key={index} className="text-gray-700">{edu}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  <i className="fa-solid fa-star mr-2 text-yellow-600"></i>
                  Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  <i className="fa-solid fa-exclamation-triangle mr-2 text-orange-600"></i>
                  Areas for Development
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-gray-700">{weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            {result.recommendation && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">
                  <i className="fa-solid fa-lightbulb mr-2 text-yellow-500"></i>
                  AI Recommendation
                </h4>
                <p className="text-gray-700">{result.recommendation}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
