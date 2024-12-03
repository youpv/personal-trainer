/**
 * Calendar page component displaying training sessions in a calendar view
 * This file demonstrates:
 * - Integration with react-big-calendar
 * - Date handling with date-fns
 * - View switching functionality
 * - Event display customization
 */

import { useState, useEffect } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'sonner';
import api, { Training } from '../services/api';

/**
 * Locale configuration for the calendar
 * Demonstrates date-fns locale setup with Monday as first day of week
 */
const locales = {
  'en-US': {
    ...enUS,
    options: {
      ...enUS.options,
      weekStartsOn: 1, // Monday
    },
  },
};

/**
 * Calendar localizer configuration using date-fns
 * Required for react-big-calendar to handle dates correctly
 */
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

/**
 * Interface for calendar events transformed from training data
 */
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  customer: string;
}

/**
 * Calendar page component that displays training sessions in a calendar view
 * Demonstrates:
 * - Data fetching and transformation
 * - Calendar view switching
 * - Event display
 */
const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>('month');
  const [loading, setLoading] = useState(true);

  // Fetch and transform training data on component mount
  useEffect(() => {
    fetchTrainings();
  }, []);

  /**
   * Fetches training data and transforms it into calendar events
   */
  const fetchTrainings = async () => {
    try {
      const trainings = await api.getTrainings();
      const calendarEvents = trainings.map((training: Training) => ({
        id: training.id,
        title: `${training.activity} / ${training.customer.firstname} ${training.customer.lastname}`,
        start: new Date(training.date),
        end: new Date(new Date(training.date).getTime() + training.duration * 60000),
        customer: `${training.customer.firstname} ${training.customer.lastname}`,
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler for calendar view changes
   */
  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Loading state display
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', minHeight: 'calc(100vh - 180px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Training Calendar
        </Typography>
        {/* Optional: View switching controls */}
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, value) => value && handleViewChange(value)}
          aria-label="calendar view"
        >
          <ToggleButton value="month" aria-label="month view">
            Month
          </ToggleButton>
          <ToggleButton value="week" aria-label="week view">
            Week
          </ToggleButton>
          <ToggleButton value="day" aria-label="day view">
            Day
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Optional: Styled calendar container */}
      <Box sx={{ 
        height: 'calc(100vh - 250px)',
        minHeight: 600,
        backgroundColor: 'white',
        p: 2,
        borderRadius: 1,
        '& .rbc-event': {
          backgroundColor: theme => theme.palette.primary.main,
        },
        '& .rbc-today': {
          backgroundColor: theme => theme.palette.primary.light + '20',
        },
      }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={handleViewChange}
          tooltipAccessor={event => `${event.title}\nDuration: ${
            Math.round((event.end.getTime() - event.start.getTime()) / 60000)
          } minutes`}
          culture="en-US"
        />
      </Box>
    </Box>
  );
};

export default CalendarPage; 