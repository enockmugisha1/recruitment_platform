import { useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  time: string;
  type: 'interview' | 'deadline' | 'meeting' | 'other';
  description?: string;
  candidate?: string;
  location?: string;
}

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (event: CalendarEvent) => void;
  selectedDate?: Date;
}

export default function ScheduleInterviewModal({ isOpen, onClose, onSchedule, selectedDate }: ScheduleInterviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    candidate: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    description: '',
    type: 'interview' as 'interview' | 'deadline' | 'meeting' | 'other'
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Connect to backend API when calendar endpoints are ready
      // const response = await axios.post('/api/calendar/events/', formData);
      
      // For now, create local event
      const newEvent: CalendarEvent = {
        id: Date.now(),
        title: formData.title,
        date: new Date(formData.date + 'T' + formData.time),
        time: formData.time,
        type: formData.type,
        candidate: formData.candidate,
        location: formData.location,
        description: formData.description
      };

      onSchedule(newEvent);
      
      toast.success('Interview scheduled successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      onClose();
      
      // Reset form
      setFormData({
        title: '',
        candidate: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        location: '',
        description: '',
        type: 'interview'
      });
    } catch (err: any) {
      toast.error('Failed to schedule interview', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Schedule Interview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fas fa-times text-gray-600"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            >
              <option value="interview">Interview</option>
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Technical Interview - John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
          </div>

          {/* Candidate Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Candidate Name {formData.type === 'interview' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="candidate"
              value={formData.candidate}
              onChange={handleChange}
              required={formData.type === 'interview'}
              placeholder="Candidate's full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Meeting Room A, Zoom Link, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add any additional details about this event..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
            <p className="text-sm text-blue-800">
              The candidate will be notified via email once the interview is scheduled.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
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
                  Scheduling...
                </>
              ) : (
                <>
                  <i className="fas fa-calendar-check"></i>
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
