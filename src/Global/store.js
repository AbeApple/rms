import { configureStore, createSlice } from '@reduxjs/toolkit';
import eventsReducer from './eventsSlice';
import contactsReducer from './contactsSlice';
import { yearMonthString } from './functions';

// UI state slice
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    showMenu: false,
    imagesArray: null,
  },
  reducers: {
    setShowMenu(state, action) {
      state.showMenu = action.payload;
    },
    setImagesArray(state, action) {
      state.imagesArray = action.payload;
    },
  },
});

export const { setShowMenu, setImagesArray } = uiSlice.actions;

// Slice to track visible months and selected day
const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    startMonth: null, // Format: 'YYYY-MM'
    endMonth: null,   // Format: 'YYYY-MM'
    selectedDay: null, // Format: 'YYYY-MM-DD'
    monthInView: null, // Format: 'YYYY-MM'
  },
  reducers: {
    setVisibleMonths(state, action) {
      state.startMonth = action.payload.startMonth;
      state.endMonth = action.payload.endMonth;
    },
    setSelectedDay(state, action) {
      console.log("selected date: ", typeof action.payload, action.payload )
      state.selectedDay = action.payload;
    },
    setMonthInView(state, action) {
      console.log("setMonthInView: ", action.payload);
      state.monthInView = action.payload;
      
      // If no month in view or no start/end months, do nothing
      if (!action.payload || !state.startMonth || !state.endMonth) {
        console.log("No month data available ", action.payload, state.startMonth, state.endMonth);
        return;
      }
      
      try {
        // Parse strings to create date objects reliably (avoids potential parsing issues with new Date('YYYY-MM'))
        const [viewYear, viewMonth] = action.payload.split('-').map(Number);
        const viewDate = new Date(viewYear, viewMonth - 1, 1);
        
        const [startYear, startMonthNum] = state.startMonth.split('-').map(Number);
        const startDate = new Date(startYear, startMonthNum - 1, 1);
        
        const [endYear, endMonthNum] = state.endMonth.split('-').map(Number);
        const endDate = new Date(endYear, endMonthNum - 1, 1);
        
        // Check if all dates are valid
        if (isNaN(viewDate.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Invalid date detected");
          return;
        }
        
        // Create dates for one month before and after view date
        const viewMinusOne = new Date(viewDate);
        viewMinusOne.setMonth(viewDate.getMonth() - 1);
        
        const viewPlusOne = new Date(viewDate);
        viewPlusOne.setMonth(viewDate.getMonth() + 1);
        
        // If view date minus one month is before start date, extend start
        if (viewMinusOne < startDate) {
          state.startMonth = yearMonthString(viewMinusOne);
          console.log(`Extended start month to: ${state.startMonth}`);
        }
        
        // If view date plus one month is after end date, extend end
        if (viewPlusOne > endDate) {
          state.endMonth = yearMonthString(viewPlusOne);
          console.log(`Extended end month to: ${state.endMonth}`);
        }
      } catch (error) {
        console.error("Error adjusting months:", error);
      }
    },
  },
});

export const { setVisibleMonths, setSelectedDay, setMonthInView } = calendarSlice.actions;

export default configureStore({
  reducer: {
    calendar: calendarSlice.reducer,
    ui: uiSlice.reducer,
    events: eventsReducer,
    contacts: contactsReducer,
  },
});