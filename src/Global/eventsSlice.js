import { createSlice } from '@reduxjs/toolkit';

// Events slice
const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    selectedEventID: null,
    selectedEventDate: null, // Date for new events in YYYY-MM-DD format
    events: {},  // Format: { 'YYYY-MM-DD': [eventObjects] }
    reloadTrigger: 0  // Counter to trigger event reloads
  },
  reducers: {
    setSelectedEventID(state, action) {
      state.selectedEventID = action.payload;
    },
    setSelectedEventDate(state, action) {
      state.selectedEventDate = action.payload;
    },
    setEvents(state, action) {
      state.events = action.payload;
    },
    reloadEvents(state) {
      // Increment the counter to trigger a reload
      state.reloadTrigger = state.reloadTrigger + 1;
    },
    updateEvent(state, action) {
      const { eventId, updatedData } = action.payload;
      const eventDate = updatedData.date || updatedData.date;
      
      // Find the event in the state
      for (const date in state.events) {
        const eventIndex = state.events[date]?.findIndex(event => event.id === eventId);
        
        if (eventIndex !== -1 && eventIndex !== undefined) {
          // If the date is changing, we need to move the event to a different date array
          if (updatedData.date && updatedData.date !== date) {
            // Remove from current date array
            const eventToMove = { ...state.events[date][eventIndex], ...updatedData };
            state.events[date] = state.events[date].filter(event => event.id !== eventId);
            
            // If the date array is now empty, remove it
            if (state.events[date].length === 0) {
              delete state.events[date];
            }
            
            // Add to new date array
            if (!state.events[updatedData.date]) {
              state.events[updatedData.date] = [];
            }
            state.events[updatedData.date].push(eventToMove);
            
            // Sort the events by start time
            state.events[updatedData.date].sort((a, b) => {
              const timeA = a.start_time ? a.start_time.replace(':', '') : '9999';
              const timeB = b.start_time ? b.start_time.replace(':', '') : '9999';
              return timeA - timeB;
            });
          } else {
            // Just update the event in place
            state.events[date][eventIndex] = {
              ...state.events[date][eventIndex],
              ...updatedData
            };
          }
          
          return;
        }
      }
    },
    addEvent(state, action) {
      const { event } = action.payload;
      const { id, date } = event;
      
      // Create date array if it doesn't exist
      if (!state.events[date]) {
        state.events[date] = [];
      }
      
      // Add the new event to the appropriate date array
      state.events[date].push(event);
      
      // Sort the events by start time
      state.events[date].sort((a, b) => {
        const timeA = a.start_time ? a.start_time.replace(':', '') : '9999';
        const timeB = b.start_time ? b.start_time.replace(':', '') : '9999';
        return timeA - timeB;
      });
    }
  },
});

// Export actions
export const { 
  setSelectedEventID,
  setSelectedEventDate,
  setEvents,
  setNewEventDate,
  reloadEvents,
  updateEvent,
  addEvent
} = eventsSlice.actions;


// Export reducer
export default eventsSlice.reducer;
