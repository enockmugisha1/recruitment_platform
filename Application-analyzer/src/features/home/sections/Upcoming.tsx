import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calendarService } from "../../../api/services";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  event_type: string;
  candidate?: any;
  description?: string;
}

export default function Upcoming() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarService.getEvents({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });

      const allEvents = data.results || data || [];
      const upcoming = allEvents.filter((e: CalendarEvent) =>
        new Date(e.date) >= new Date()
      ).sort((a: CalendarEvent, b: CalendarEvent) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setEvents(upcoming);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const isToday = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  const isTomorrow = (dateString: string) => {
    const eventDate = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return eventDate.toDateString() === tomorrow.toDateString();
  };

  const todayEvents = events.filter(e => isToday(e.date));
  const tomorrowEvents = events.filter(e => isTomorrow(e.date));
  const laterEvents = events.filter(e => !isToday(e.date) && !isTomorrow(e.date));

  const getEventColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-liblue/35 text-lidarkblue border-lidarkblue/50 hover:bg-liblue hover:border-lidarkblue';
      case 'meeting':
        return 'bg-ligreen/35 text-lidarkgreen border-lidarkgreen/50 hover:bg-ligreen hover:border-lidarkgreen';
      default:
        return 'bg-liblue/35 text-lidarkblue border-lidarkblue/50 hover:bg-liblue hover:border-lidarkblue';
    }
  };

  return (
    <aside className="bg-lightgraybg px-2 text-sm h-svh rounded-xl shadow-sm">
      <h2 className="flex font-bold pl-2 mt-5 gap-2 text-base text-gray-800">
        Upcoming Meetings
        <button
          onClick={() => navigate('/calendar')}
          className="border-2 w-6 aspect-square rounded-full flex items-center justify-center border-green-600 text-green-600 hover:bg-green-600 hover:text-lightgraybg transition-all"
        >
          <i className="fa-solid fa-plus w-full text-center"></i>
        </button>
      </h2>

      <div className="overflow-y-scroll h-full mt-4 pb-20">
        {loading ? (
          <p className="text-center text-textdark/50 py-4">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-textdark/50 py-4">No upcoming events</p>
        ) : (
          <>
            {todayEvents.length > 0 && (
              <>
                <p className="font-semibold text-textdark/50 indent-2 mb-2">Today</p>
                {todayEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => navigate('/calendar')}
                    className={`flex w-full transition-colors rounded border-r-4 mt-1 ${getEventColor(event.event_type)}`}
                  >
                    <time className="min-w-14 flex justify-center items-center text-base font-semibold border-r border-current/50">
                      {formatTime(event.date)}
                    </time>
                    <div className="my-1 ml-2 space-y-0.5 text-left">
                      <p><span className="font-semibold">{event.title}</span></p>
                      <p className="text-xs">{event.event_type}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {tomorrowEvents.length > 0 && (
              <>
                <p className="font-semibold text-textdark/50 indent-2 mt-5 mb-2">Tomorrow</p>
                {tomorrowEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => navigate('/calendar')}
                    className={`flex w-full transition-colors rounded border-r-4 mt-1 ${getEventColor(event.event_type)}`}
                  >
                    <time className="min-w-14 flex justify-center items-center text-base font-semibold border-r border-current/50">
                      {formatTime(event.date)}
                    </time>
                    <div className="my-1 ml-2 space-y-0.5 text-left">
                      <p><span className="font-semibold">{event.title}</span></p>
                      <p className="text-xs">{event.event_type}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {laterEvents.length > 0 && laterEvents.slice(0, 5).map(event => (
              <button
                key={event.id}
                onClick={() => navigate('/calendar')}
                className={`flex w-full transition-colors rounded border-r-4 mt-1 ${getEventColor(event.event_type)}`}
              >
                <time className="min-w-14 flex justify-center items-center text-base font-semibold border-r border-current/50">
                  {formatTime(event.date)}
                </time>
                <div className="my-1 ml-2 space-y-0.5 text-left">
                  <p><span className="font-semibold">{event.title}</span></p>
                  <p className="text-xs">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </aside>
  )
}
