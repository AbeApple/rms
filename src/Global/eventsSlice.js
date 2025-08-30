import { createSlice } from '@reduxjs/toolkit';

// Events slice
const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    selectedEventID: null,
    events: {}  // Format: { 'YYYY-MM-DD': [eventObjects] }
  },
  reducers: {
    setSelectedEventID(state, action) {
      state.selectedEventID = action.payload;
    },
    setEvents(state, action) {
      state.events = action.payload;
    }
  },
});

// Export actions
export const { 
  setSelectedEventID,
  setEvents
} = eventsSlice.actions;


// Export reducer
export default eventsSlice.reducer;
