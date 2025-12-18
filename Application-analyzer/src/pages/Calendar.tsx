import { useState, useEffect } from 'react';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { calendarService } from '../api/services';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  time: string;
  event_type: 'interview' | 'deadline' | 'meeting' | 'other';
  description?: string;
  candidate?: number;
  candidate_name?: string;
  location?: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await calendarService.getEvents({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
      
      // Transform backend data to match frontend format
      const transformedEvents = response.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: new Date(event.date),
        time: new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        event_type: event.event_type,
        description: event.description,
        candidate: event.candidate,
        candidate_name: event.candidate_name,
        location: event.location,
      }));
      
      setEvents(transformedEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to load events');
      }
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
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
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
      toast.success('Event scheduled successfully!');
      fetchEvents(); // Refresh events
      setShowModal(false);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.detail || 'Failed to schedule event');
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    
    try {
      await calendarService.updateEvent(selectedEvent.id, eventData);
      toast.success('Event updated successfully!');
      fetchEvents(); // Refresh events
      setShowEditModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.detail || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await calendarService.deleteEvent(eventId);
      toast.success('Event deleted successfully!');
      fetchEvents(); // Refresh events
    } catch (error: any) {
      console.error('Error deleting event:', error);
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
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear();
  };

  const getEventTypeColor = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'interview': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'meeting': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeBadge = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'interview': return 'bg-blue-100 text-blue-700';
      case 'deadline': return 'bg-red-100 text-red-700';
      case 'meeting': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Calendar</h1>
        <p className="text-gray-600">Manage interviews, deadlines, and meetings</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous Month"
          >
            <i className="fas fa-chevron-left text-gray-600"></i>
          </button>
          
          <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
            {monthNames[month]} {year}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next Month"
          >
            <i className="fas fa-chevron-right text-gray-600"></i>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-accentsecondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Today
          </button>
          
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-accentprimary text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Schedule Interview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square p-2"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(year, month, day);
                const dayEvents = getEventsForDate(date);
                
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-2 border rounded-lg cursor-pointer transition-all
                      ${isToday(day) ? 'bg-accentsecondary text-white border-accentsecondary' : 'border-gray-200 hover:border-accentsecondary'}
                      ${isSelected(day) ? 'ring-2 ring-accentsecondary' : ''}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-semibold ${isToday(day) ? 'text-white' : 'text-gray-700'}`}>
                        {day}
                      </span>
                      
                      {/* Event indicators */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(event.event_type)}`}
                            title={event.title}
                          ></div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-gray-500">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Event Types</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Interviews</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Deadlines</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Meetings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedDate ? (
                <>
                  Events for {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
                </>
              ) : (
                'Upcoming Events'
              )}
            </h3>

            {/* Event List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-2xl text-accentprimary"></i>
                  <p className="mt-3 text-sm text-gray-500">Loading events...</p>
                </div>
              ) : (selectedDate ? getEventsForDate(selectedDate) : events.slice(0, 10))
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(event => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm flex-1">
                        {event.title}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeBadge(event.event_type)}`}>
                        {event.event_type}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock w-4"></i>
                        <span>{event.time}</span>
                      </div>
                      
                      {event.candidate_name && (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-user w-4"></i>
                          <span>{event.candidate_name}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-map-marker-alt w-4"></i>
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.description && (
                        <div className="flex items-start gap-2 mt-2">
                          <i className="fas fa-info-circle w-4 mt-0.5"></i>
                          <span className="text-gray-500">{event.description}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium transition"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

              {!loading && (selectedDate ? getEventsForDate(selectedDate) : events).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-calendar-times text-3xl mb-2"></i>
                  <p className="text-sm">No events scheduled</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 px-4 py-2 bg-accentprimary text-white rounded-lg text-xs hover:bg-opacity-90"
                  >
                    Schedule Your First Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSchedule={handleScheduleInterview}
        selectedDate={selectedDate || undefined}
      />

      {/* Edit Event Modal - Using same modal for now, can be extended later */}
      {showEditModal && selectedEvent && (
        <ScheduleInterviewModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onSchedule={handleUpdateEvent}
          selectedDate={selectedEvent.date}
        />
      )}
    </div>
  );
}
