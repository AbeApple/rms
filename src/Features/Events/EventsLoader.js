import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEvents } from '../../Global/eventsSlice';
import { supabase } from '../../DB/Supabase';
import { dateString } from '../../Global/functions';

// Sample event data
const sampleEvents = {
  // Event 1: August 5th
  '2025-08-05': [
    {
      id: '1',
      title: 'Team Meeting',
      note: 'Quarterly planning session',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c001',
      startTime: '09:00',
      endTime: '10:30'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      note: 'Discuss new project requirements',
      date: '2025-08-05',
      status: 'Waiting',
      contactID: 'c002',
      startTime: '12:00',
      endTime: '13:30'
    },
    {
      id: '1',
      title: 'Team Meeting',
      note: 'Quarterly planning session',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c001',
      startTime: '09:00',
      endTime: '10:30'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      note: 'Discuss new project requirements',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c002',
      startTime: '12:00',
      endTime: '13:30'
    },
    {
      id: '1',
      title: 'Team Meeting',
      note: 'Quarterly planning session',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c001',
      startTime: '09:00',
      endTime: '10:30'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      note: 'Discuss new project requirements',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c002',
      startTime: '12:00',
      endTime: '13:30'
    },
    {
      id: '1',
      title: 'Team Meeting',
      note: 'Quarterly planning session',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c001',
      startTime: '09:00',
      endTime: '10:30'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      note: 'Discuss new project requirements',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c002',
      startTime: '12:00',
      endTime: '13:30'
    },
    {
      id: '1',
      title: 'Team Meeting',
      note: 'Quarterly planning session',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c001',
      startTime: '09:00',
      endTime: '10:30'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      note: 'Discuss new project requirements',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c002',
      startTime: '12:00',
      endTime: '13:30'
    },
    {
      id: '1',
      title: 'Team Meeting',
      note: 'Quarterly planning session',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c001',
      startTime: '09:00',
      endTime: '10:30'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      note: 'Discuss new project requirements',
      date: '2025-08-05',
      status: 'Scheduled',
      contactID: 'c002',
      startTime: '12:00',
      endTime: '13:30'
    },
  ],
  
  // Event 2: August 10th
  '2025-08-10': [
    {
      id: '3',
      title: 'Product Demo',
      note: 'Show new features to stakeholders',
      date: '2025-08-10',
      status: 'Positive',
      contactID: 'c003',
      startTime: '14:00',
      endTime: '15:00'
    }
  ],
  
  // Event 3: August 15th
  '2025-08-15': [
    {
      id: '4',
      title: 'Training Workshop',
      note: 'New employee onboarding',
      date: '2025-08-15',
      status: 'Complete',
      contactID: 'c004',
      startTime: '10:00',
      endTime: '16:00'
    }
  ],
  
  // Event 4: August 20th
  '2025-08-20': [
    {
      id: '5',
      title: 'Code Review',
      note: 'Review sprint deliverables',
      date: '2025-08-20',
      status: 'Cancelled',
      contactID: 'c005',
      startTime: '11:00',
      endTime: '12:00'
    }
  ],
  
  // Event 5: August 25th
  '2025-08-25': [
    {
      id: '6',
      title: 'Project Deadline',
      note: 'Submit final deliverables',
      date: '2025-08-25',
      status: 'Notice',
      contactID: 'c006',
      startTime: '17:00',
      endTime: '18:00'
    }
  ],
  '2025-08-30': [
    {
      id: '7',
      title: 'Follow-up Meeting',
      note: 'Review project outcomes',
      date: '2025-08-30',
      status: 'Was Positive',
      contactID: 'c007',
      startTime: '13:00',
      endTime: '14:00'
    }
  ]
};

// Object with display names as keys and CSS class names as values
export const eventStatusClasses = {
  "Scheduled": "scheduled",
  "Waiting": "waiting",
  "Cancelled": "cancelled",
  "Positive": "positive",
  "Complete": "complete",
  "Notice": "notice",
  "Was Positive": "wasPositive"
}

// Helper function to sort events by start time
const sortEventsByStartTime = (events) => {
  return [...events].sort((a, b) => {
    // Convert time strings to comparable values
    const timeA = a.startTime ? a.startTime.replace(':', '') : '9999';
    const timeB = b.startTime ? b.startTime.replace(':', '') : '9999';
    return timeA - timeB;
  });
};

export default function EventsLoader() {
  const dispatch = useDispatch();
  const startMonth = useSelector(state => state.calendar.startMonth);
  const endMonth = useSelector(state => state.calendar.endMonth);
  const reloadTrigger = useSelector(state => state.events.reloadTrigger);
  
  // Load events into Redux store on component mount, when date range changes, or when reload is triggered
  useEffect(() => {
    if (startMonth && endMonth) {
      console.log('Loading events due to date change or reload trigger:', { startMonth, endMonth, reloadTrigger });
      loadEventsFromSupabase();
    } else {
      // If no date range is available, initialize with empty events object
      dispatch(setEvents({}));
    }
  }, [startMonth, endMonth, reloadTrigger]);
  
  /**
   * Fetch events directly from Supabase within a specific date range, excluding note data
   * @param {string} startDateStr - Start date in YYYY-MM-DD format
   * @param {string} endDateStr - End date in YYYY-MM-DD format
   * @returns {Promise<{data: Array, error: Object}>} - Events data or error
   */
  const fetchEventsInDateRange = async (startDateStr, endDateStr) => {
    try {
      // Query events table with date range filter and select only needed fields (excluding note)
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, status, contact_id, start_time, end_time')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching events in date range:', error);
      return { data: [], error };
    }
  };

  // Function to load events from Supabase based on date range
  const loadEventsFromSupabase = async () => {
    try {
      // Convert month strings to date objects for comparison
      const startDate = new Date(`${startMonth}-01`);
      const endMonthLastDay = new Date(endMonth.split('-')[0], parseInt(endMonth.split('-')[1]), 0).getDate();
      const endDate = new Date(`${endMonth}-${endMonthLastDay}`);
      
      // Format dates as YYYY-MM-DD for Supabase query
      const startDateStr = dateString(startDate);
      const endDateStr = dateString(endDate);
      
      console.log(`Fetching events between ${startDateStr} and ${endDateStr}`);
      
      // Fetch events within date range
      const { data: eventsData, error } = await fetchEventsInDateRange(startDateStr, endDateStr);
      
      if (error) {
        console.error('Error fetching events:', error);
        dispatch(setEvents({}));
        return;
      }
      
      // Organize events by date
      const organizedEvents = {};
      
      eventsData.forEach(event => {
        const dateKey = event.date; // Date is already in YYYY-MM-DD format
        
        // Create event object with proper field names
        const eventObject = {
          id: event.id,
          title: event.title,
          date: event.date,
          status: event.status,
          contactID: event.contact_id,
          startTime: event.start_time,
          endTime: event.end_time
        };
        
        // Initialize array for this date if it doesn't exist
        if (!organizedEvents[dateKey]) {
          organizedEvents[dateKey] = [];
        }
        
        // Add event to the array for this date
        organizedEvents[dateKey].push(eventObject);
      });
      
      // Sort events by start time for each date using the helper function
      Object.keys(organizedEvents).forEach(date => {
        organizedEvents[date] = sortEventsByStartTime(organizedEvents[date]);
      });
      
      console.log(`Loaded ${Object.values(organizedEvents).flat().length} events`);
      
      // Update Redux store with organized events
      dispatch(setEvents(organizedEvents));
    } catch (error) {
      console.error('Error in loadEventsFromSupabase:', error);
      dispatch(setEvents({}));
    }
  };
  
  // This component doesn't render anything visible
  return null;
}
