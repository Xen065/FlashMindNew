import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../services/api';
import './StudyCalendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function StudyCalendar({ compact = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
    loadSummary();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await calendarAPI.getEvents({ year, month });
      setEvents(response.data.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await calendarAPI.getSummary();
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await calendarAPI.getDayEvents(dateStr);
      setDayEvents(response.data.data.events || []);
    } catch (error) {
      console.error('Error loading day events:', error);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startPadding = firstDay.getDay();

    // Add empty cells for padding
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === dateStr;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatEventType = (type) => {
    const icons = { task: '📝', exam: '📚', session: '🎯' };
    return icons[type] || '📅';
  };

  if (compact) {
    const upcomingEvents = events
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);

    return (
      <div className="calendar-compact">
        <div className="calendar-compact-header">
          <span className="calendar-compact-title">📅 Upcoming</span>
        </div>
        {summary && (
          <div className="calendar-summary-compact">
            {summary.overdueTasks.count > 0 && (
              <div className="summary-item urgent">⚠️ {summary.overdueTasks.count} overdue</div>
            )}
            {summary.todayTasks.count > 0 && (
              <div className="summary-item">📋 {summary.todayTasks.count} due today</div>
            )}
            {summary.upcomingExams.count > 0 && (
              <div className="summary-item">📚 {summary.upcomingExams.count} exams soon</div>
            )}
          </div>
        )}
        {upcomingEvents.map((event, idx) => (
          <div key={idx} className="calendar-compact-event">
            <span className="event-icon">{formatEventType(event.type)}</span>
            <span className="event-title">{event.title}</span>
            <span className="event-date">
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="study-calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="btn-nav">‹</button>
        <h3>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={nextMonth} className="btn-nav">›</button>
      </div>

      {summary && (
        <div className="calendar-summary">
          {summary.overdueTasks.count > 0 && (
            <div className="summary-badge urgent">
              ⚠️ {summary.overdueTasks.count} overdue task{summary.overdueTasks.count !== 1 ? 's' : ''}
            </div>
          )}
          {summary.todayTasks.count > 0 && (
            <div className="summary-badge today">
              📋 {summary.todayTasks.count} due today
            </div>
          )}
          {summary.upcomingExams.count > 0 && (
            <div className="summary-badge exams">
              📚 {summary.upcomingExams.count} upcoming exam{summary.upcomingExams.count !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <div className="calendar-grid">
        {WEEKDAYS.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}

        {getDaysInMonth().map((date, index) => {
          const dayEvents = date ? getEventsForDate(date) : [];
          return (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${selectedDate?.toDateString() === date?.toDateString() ? 'selected' : ''}`}
              onClick={() => date && handleDateClick(date)}
            >
              {date && (
                <>
                  <div className="day-number">{date.getDate()}</div>
                  {dayEvents.length > 0 && (
                    <div className="day-events">
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          className={`event-dot ${event.type}`}
                          style={{ backgroundColor: event.color }}
                          title={event.title}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="more-events">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="selected-day-panel">
          <div className="panel-header">
            <h4>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
            <button onClick={() => setSelectedDate(null)} className="btn-close">✕</button>
          </div>
          <div className="panel-events">
            {dayEvents.length === 0 ? (
              <p className="no-events">No events on this day</p>
            ) : (
              dayEvents.map((event, idx) => (
                <div key={idx} className="event-item" style={{ borderLeftColor: event.color }}>
                  <div className="event-icon">{formatEventType(event.type)}</div>
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                    <div className="event-type">{event.type}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudyCalendar;
