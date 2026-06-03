/**
 * Smallest possible usage. Uncontrolled mode — the calendar manages its own
 * events. The default inline popovers handle create/edit; default context
 * menus handle copy/cut/paste/delete.
 */
import { Calendar, type CalendarEvent } from 'react-scheduled-calendar';
import 'react-scheduled-calendar/styles.css';

const seed: CalendarEvent[] = [
  {
    id: 1,
    title: 'Team standup',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 30, 0, 0)),
    category: 'work',
  },
  {
    id: 2,
    title: 'Lunch with Maria',
    start: new Date(new Date().setHours(12, 0, 0, 0)),
    end: new Date(new Date().setHours(13, 0, 0, 0)),
    category: 'personal',
  },
];

export default function BasicExample() {
  return (
    <div style={{ height: '100vh', padding: 24 }}>
      <Calendar
        defaultEvents={seed}
        locale="en"
        theme="auto"
        categoryColors={{ work: '#3b82f6', personal: '#10b981' }}
        defaultColor="#6b7280"
        onEventsChange={events => console.log('events changed:', events)}
      />
    </div>
  );
}
