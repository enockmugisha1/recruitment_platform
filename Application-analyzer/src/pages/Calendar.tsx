import { useState, useEffect } from 'react';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { calendarService } from '../api/services';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  event_type: string;
  description?: string;
  candidate?: number;
  location?: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarService.getEvents({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
      setEvents(data.results || data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleScheduleInterview = async (eventData: any) => {
    try {
      await calendarService.createEvent(eventData);
      toast.success('Event created successfully!');
      setShowModal(false);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await calendarService.deleteEvent(eventId);
      toast.success('Event deleted successfully!');
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete event');
    }
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return selectedDate && 
           day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear();
  };

  const getEventTypeColor = (type: string) => {
    switch(type) {
      case 'interview':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'meeting':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="px-4 md:px-10 mt-5">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="font-semibold text-2xl">Calendar</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-accentprimary text-white rounded-lg hover:bg-darkblue transition flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          Schedule Event
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h3 className="text-xl font-semibold min-w-[200px] text-center">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold py-2 text-sm md:text-base">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="border border-gray-200 min-h-[80px] md:min-h-[100px] p-1 md:p-2 bg-gray-50" />
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(year, month, day);
            const dayEvents = getEventsForDate(date);
            
            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDate(date);
                }}
                className={`border border-gray-200 min-h-[80px] md:min-h-[100px] p-1 md:p-2 hover:bg-gray-50 transition text-left relative ${
                  isToday(day) ? 'bg-blue-50 border-blue-400' : ''
                } ${isSelected(day) ? 'ring-2 ring-accentprimary' : ''}`}
              >
                <div className={`text-sm md:text-base font-semibold mb-1 ${
                  isToday(day) ? 'text-blue-600' : ''
                }`}>
                  {day}
                </div>
                
                {/* Events for this day */}
                <div className="space-y-1 text-xs">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={`p-1 rounded border truncate cursor-pointer hover:shadow-md transition ${getEventTypeColor(event.event_type)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-gray-500 text-xs">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">
            Events on {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {loading ? (
            <p className="text-gray-500">Loading events...</p>
          ) : getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500">No events scheduled for this day</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map(event => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${getEventTypeColor(event.event_type)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      <p className="text-sm mt-1">
                        <i className="fa-solid fa-clock mr-2"></i>
                        {new Date(event.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {event.location && (
                        <p className="text-sm mt-1">
                          <i className="fa-solid fa-location-dot mr-2"></i>
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm mt-2">{event.description}</p>
                      )}
                      <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-white border">
                        {event.event_type}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDeleteConfirm(true);
                      }}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showModal && (
        <ScheduleInterviewModal
          onClose={() => setShowModal(false)}
          onSchedule={handleScheduleInterview}
          initialDate={selectedDate || undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Event?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedEvent.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
