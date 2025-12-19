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
  onClose: () => void;
  onSchedule: (event: any) => void;
  initialDate?: Date;
}

export default function ScheduleInterviewModal({ onClose, onSchedule, initialDate }: ScheduleInterviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    candidate_id: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    description: '',
    event_type: 'interview' as 'interview' | 'deadline' | 'meeting' | 'other'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submitted with data:', formData);
    setLoading(true);

    try {
      // Combine date and time into ISO format
      const dateTime = `${formData.date}T${formData.time}:00`;
      console.log('🕐 Combined datetime:', dateTime);
      
      // Prepare data for backend
      const eventData = {
        title: formData.title,
        event_type: formData.event_type,
        date: dateTime,
        location: formData.location || '',
        description: formData.description || '',
        candidate: formData.candidate_id ? parseInt(formData.candidate_id) : null,
      };

      console.log('📤 Sending event data to backend:', eventData);
      
      // Call the onSchedule function (which calls backend)
      await onSchedule(eventData);
      
      toast.success('Event scheduled successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      onClose();
      
      // Reset form
      setFormData({
        title: '',
        candidate_id: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        location: '',
        description: '',
        event_type: 'interview'
      });
    } catch (err: any) {
      console.error('Error scheduling event:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error ||
                          err.message ||
                          'Failed to schedule event';
      toast.error(errorMessage, {
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
              name="event_type"
              value={formData.event_type}
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

          {/* Candidate ID (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Candidate ID <span className="text-gray-500 text-xs">(optional, for interviews)</span>
            </label>
            <input
              type="number"
              name="candidate_id"
              value={formData.candidate_id}
              onChange={handleChange}
              placeholder="Enter candidate ID (if applicable)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentsecondary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for general meetings/deadlines. For interviews, you can add candidate ID.
            </p>
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
              Event will be added to your calendar. You can view and manage all events from the calendar page.
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
                  Schedule Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
