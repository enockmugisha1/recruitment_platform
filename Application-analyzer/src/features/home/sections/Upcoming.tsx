import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "../../../api/axios"

interface CalendarEvent {
  id: number
  title: string
  event_type: 'interview' | 'meeting' | 'deadline' | 'other'
  date: string
  candidate_name?: string
  location?: string
  time?: string
}

interface UpcomingEvents {
  today: CalendarEvent[]
  tomorrow: CalendarEvent[]
  this_week: CalendarEvent[]
}

export default function Upcoming() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<UpcomingEvents>({
    today: [],
    tomorrow: [],
    this_week: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('/access/calendar/upcoming/')
      setEvents(response.data)
    } catch (error: any) {
      console.error('Error fetching upcoming events:', error)
      // Don't show error toast for empty data or 403
      if (error.response?.status !== 404 && error.response?.status !== 403) {
        // toast.error('Failed to load upcoming meetings')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'interview':
        return 'bg-liblue/35 text-lidarkblue border-lidarkblue/50 hover:bg-liblue hover:border-lidarkblue'
      case 'meeting':
        return 'bg-ligreen/35 text-lidarkgreen border-lidarkgreen/50 hover:bg-ligreen hover:border-lidarkgreen'
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-400 hover:bg-red-200 hover:border-red-600'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400 hover:bg-gray-200 hover:border-gray-600'
    }
  }

  const renderEvent = (event: CalendarEvent) => (
    <a 
      key={event.id} 
      href="#" 
      onClick={(e) => {
        e.preventDefault()
        navigate('/calendar')
      }}
      className={`flex w-full transition-colors rounded border-r-4 mt-2 ${getEventColor(event.event_type)}`}
    >
      <time className="min-w-14 flex justify-center items-center text-base font-semibold border-r border-current/50">
        {formatTime(event.date)}
      </time>
      <div className="my-1 ml-2 space-y-0.5 pr-2">
        <p>
          <span className="font-semibold">{event.candidate_name || 'N/A'}; </span>
          {event.title}
        </p>
        <p className="text-xs">
          {event.event_type}
          {event.location && <span className="font-semibold"> | {event.location}</span>}
        </p>
      </div>
    </a>
  )

  return (
    <aside className="bg-lightgraybg px-2 text-sm rounded-lg h-auto lg:h-svh">
      <h2 className="flex font-semibold pl-2 mt-5 gap-2 text-base">
        Upcoming Meetings
        <button 
          onClick={() => navigate('/calendar')}
          className="border-2 w-6 aspect-square rounded-full flex items-center justify-center border-accentprimary text-accentprimary hover:bg-accentprimary hover:text-lightgraybg transition"
        >
          <i className="fa-solid fa-plus w-full text-center"></i>
        </button>
      </h2>

      <div className="overflow-y-auto h-full mt-4 pb-20 lg:pb-32">
        {loading ? (
          <div className="text-center py-10">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-accentprimary"></i>
            <p className="mt-3 text-textdark/50 text-xs">Loading meetings...</p>
          </div>
        ) : events.today.length === 0 && events.tomorrow.length === 0 && events.this_week.length === 0 ? (
          <div className="text-center py-10 px-4">
            <i className="fa-regular fa-calendar text-4xl text-textdark/30"></i>
            <p className="mt-3 text-textdark/50">No upcoming meetings</p>
            <button 
              onClick={() => navigate('/calendar')}
              className="mt-4 px-4 py-2 bg-accentprimary text-white rounded-lg text-xs hover:bg-darkblue transition"
            >
              Schedule Meeting
            </button>
          </div>
        ) : (
          <>
            {events.today.length > 0 && (
              <>
                <p className="font-semibold text-textdark/50 indent-2 mb-2">Today</p>
                {events.today.map(event => renderEvent(event))}
              </>
            )}

            {events.tomorrow.length > 0 && (
              <>
                <p className="font-semibold text-textdark/50 indent-2 mt-5 mb-2">Tomorrow</p>
                {events.tomorrow.map(event => renderEvent(event))}
              </>
            )}

            {events.this_week.length > 0 && (
              <>
                <p className="font-semibold text-textdark/50 indent-2 mt-5 mb-2">This Week</p>
                {events.this_week.map(event => renderEvent(event))}
              </>
            )}
          </>
        )}
      </div>

    </aside>
  )
}
