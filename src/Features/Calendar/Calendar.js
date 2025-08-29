import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Month from './Components/Month';
import './Calendar.css';
import DayWindow from '../Windows/DayWindow';
import useMonthObserver from './hooks/useMonthObserver';
import WeekdayBar from './Components/WeekdayBar';
import { isMobile } from 'react-device-detect';
import { setVisibleMonths, setMonthInView } from '../../Global/store';
import { scrollToThisMonth, scrollToToday, yearMonthString } from '../../Global/functions';
import userEvent from '@testing-library/user-event';

function Calendar() {
  const dispatch = useDispatch();
  const startMonth = useSelector(state => state.calendar.startMonth);
  const endMonth = useSelector(state => state.calendar.endMonth);
  // Just an array of strings with format YYYY-MM that include all of the months between (inclusive) the start and end months
  const [months, setMonths] = useState([]);
  const [observerActive, setObserverActive] = useState(false);
  
  // Use the month observer hook to track which month is most in view
  const currentMonthInView = useMonthObserver(months, observerActive);

  // Set the inital month start and end date strings (will trigger next use effect)
  useEffect(() => {
    setInitialMonths();
  }, []);

  // When the start and end change update the month array (will trigger next use effect)
  useEffect(() => {
    buildMonthArray()
  }, [startMonth, endMonth]);

  // When the months are changed we need to set up or update the observer (only after already scrolling to current month)
  const setupComplete = useRef(false)
  const initialScrollTimeout = useRef(null)
  
  useEffect(() => {
    // Clear any existing timeout to avoid multiple calls
    if (initialScrollTimeout.current) {
      clearTimeout(initialScrollTimeout.current);
    }
    
    if (months.length > 0 && !setupComplete.current) {
      // Set observer to inactive during initial setup
      setObserverActive(false);
      
      // Wait for DOM to be ready before scrolling
      initialScrollTimeout.current = setTimeout(() => {
        console.log('Initial scroll to today');
        scrollToToday();
        
        // Wait for scroll animation to complete before activating observer
        setTimeout(() => {
          console.log('Activating observer after scroll');
          setupComplete.current = true;
          setObserverActive(true);
        }, 1000); // Wait 1 second after scroll initiated
      }, 500); // Wait for DOM to be ready
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (initialScrollTimeout.current) {
        clearTimeout(initialScrollTimeout.current);
      }
    };
  }, [months])

  // Sets the initial start and end months in global state
  function setInitialMonths() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Create previous month date
    const prevMonthDate = new Date(currentYear, currentMonth - 1);
    // Create next month date
    const nextMonthDate = new Date(currentYear, currentMonth + 1);
    
    // Use yearMonthString to format dates consistently
    const startMonthStr = yearMonthString(prevMonthDate);
    const endMonthStr = yearMonthString(nextMonthDate);
    
    // Update global state with start and end months
    dispatch(setVisibleMonths({ startMonth: startMonthStr, endMonth: endMonthStr }));
  }
  
  // Builds the array of month strings based on the start and end month
  function buildMonthArray() {
    // If start or end month is not defined, don't do anything
    if (!startMonth || !endMonth) return;
    
    // Parse start and end months
    const [startYear, startMonthNum] = startMonth.split('-').map(Number);
    const [endYear, endMonthNum] = endMonth.split('-').map(Number);
    
    // Validate input format
    if (!startMonth.match(/^\d{4}-\d{2}$/) || !endMonth.match(/^\d{4}-\d{2}$/)) {
      throw new Error('Invalid date format. Use yyyy-mm');
    }
    
    // Validate month ranges
    if (startMonthNum < 1 || startMonthNum > 12 || endMonthNum < 1 || endMonthNum > 12) {
      throw new Error('Months must be between 01 and 12');
    }
    
    const result = [];
    let currentYear = startYear;
    let currentMonth = startMonthNum;
    
    // Calculate total months to determine direction
    const startTotalMonths = startYear * 12 + startMonthNum;
    const endTotalMonths = endYear * 12 + endMonthNum;
    
    // Determine step direction (forward or backward)
    const step = startTotalMonths <= endTotalMonths ? 1 : -1;
    
    // Generate months
    while (
      (step > 0 && (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonthNum))) ||
      (step < 0 && (currentYear > endYear || (currentYear === endYear && currentMonth >= endMonthNum)))
    ) {
      result.push(`${currentYear}-${String(currentMonth).padStart(2, '0')}`);
      currentMonth += step;
      
      // Handle year transition
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      } else if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }
    }
    
    setMonths(result);
  }

  
      // Set the current month in view in the store

        // dispatch(setMonthInView(currentMonth));


  // Calculate container style based on mobile detection
  const containerStyle = isMobile ? { height: 'calc(95vh - 80px)' } : {};

  return (
    <div className='calendarContainer' style={containerStyle}>
      {/* <div className='calendarControls'>
        <button className='scrollToTodayButton' onClick={scrollToThisMonth}>Scroll to Current Month</button>
        <button className='scrollToTodayButton' onClick={scrollToToday}>Scroll to Current Day</button>
      </div> */}
      <WeekdayBar />
      <div className='calendarMonthsScroller' id='calendarScroller'>
        {months.map(monthString => (
          <Month key={monthString} monthString={monthString}></Month>
        ))}
      </div>
      <DayWindow />
    </div>
  );
}

export default Calendar;