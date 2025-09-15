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
    // Remove an event by id across all date buckets
    removeEventById(state, action){
      const eventId = action.payload
      if(!eventId) return
      for(const date in state.events){
        const list = state.events[date]
        if(!Array.isArray(list)) continue
        const idx = list.findIndex(e => e.id === eventId)
        if(idx !== -1){
          list.splice(idx, 1)
          if(list.length === 0) delete state.events[date]
          break
        }
      }
    },
    // Move an event from one date bucket to another and optionally update its fields
    moveEventToDate(state, action){
      const { eventId, fromDate, toDate, updatedData } = action.payload || {}
      if(!eventId || !toDate) return

      // Locate the event in the specified fromDate or search all dates
      let srcDate = fromDate
      let eventObj = null
      if(srcDate && Array.isArray(state.events[srcDate])){
        const idx = state.events[srcDate].findIndex(e => e.id === eventId)
        if(idx !== -1){
          eventObj = state.events[srcDate][idx]
          state.events[srcDate].splice(idx, 1)
          if(state.events[srcDate].length === 0) delete state.events[srcDate]
        }
      }
      if(!eventObj){
        for(const d in state.events){
          const list = state.events[d]
          if(!Array.isArray(list)) continue
          const idx = list.findIndex(e => e.id === eventId)
          if(idx !== -1){
            eventObj = list[idx]
            list.splice(idx, 1)
            if(list.length === 0) delete state.events[d]
            srcDate = d
            break
          }
        }
      }

      if(!eventObj){
        // If not found, create from updatedData if present
        if(updatedData) eventObj = { id: eventId, ...updatedData }
        else return
      }

      // Prepare target bucket
      if(!Array.isArray(state.events[toDate])) state.events[toDate] = []
      const merged = { ...eventObj, ...(updatedData || {}), date: toDate }
      state.events[toDate].push(merged)

      // Sort by start_time if available
      state.events[toDate].sort((a, b) => {
        const timeA = a.start_time ? a.start_time.replace(':', '') : '9999';
        const timeB = b.start_time ? b.start_time.replace(':', '') : '9999';
        return timeA - timeB;
      })
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
    },
    // Upserts a full event object into the store, maintaining the { date: [events...] } structure
    upsertEvent(state, action) {
      const event = action.payload; // expects { id, date, ... }
      const { id, date } = event || {};
      if (!id || !date) return;
      
      // Ensure no duplicates across dates: remove any existing instance with same id from other dates
      for (const d in state.events) {
        if (!state.events[d]) continue;
        const idx = state.events[d].findIndex(e => e.id === id);
        if (idx !== -1 && d !== date) {
          state.events[d].splice(idx, 1);
          if (state.events[d].length === 0) delete state.events[d];
        }
      }
      
      // Ensure target date array exists
      if (!state.events[date]) state.events[date] = [];
      
      // Insert or update within target date array
      const existingIndex = state.events[date].findIndex(e => e.id === id);
      if (existingIndex !== -1) {
        state.events[date][existingIndex] = { ...state.events[date][existingIndex], ...event };
      } else {
        state.events[date].push(event);
      }
      
      // Sort by start_time if available
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
  removeEventById,
  moveEventToDate,
  updateEvent,
  addEvent,
  upsertEvent
} = eventsSlice.actions;


// Export reducer
export default eventsSlice.reducer;
