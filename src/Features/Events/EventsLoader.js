import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setEvents } from '../../Global/eventsSlice';

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

export default function EventsLoader() {
  const dispatch = useDispatch();
  
  // Load events into Redux store on component mount
  useEffect(() => {
    loadEventsToStore();
  }, []);
  
  // Function to load events into the global state
  const loadEventsToStore = () => {
    dispatch(setEvents(sampleEvents));
  };
  
  // This component doesn't render anything visible
  return null;
}
