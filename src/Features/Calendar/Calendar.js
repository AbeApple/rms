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

  // Effect to update visible months when current month in view changes
  useEffect(() => {
    if (currentMonthInView && months.length > 0) {
      // Update the month in view in Redux store
      dispatch(setMonthInView(currentMonthInView));
      
      // Check if we need to load more months
      ensureMonthBuffer(currentMonthInView);
    }
  }, [currentMonthInView, months]);
  
  // Ensures we always have at least 2 months before and after the current month in view
  function ensureMonthBuffer(currentMonth) {
    if (!currentMonth || !startMonth || !endMonth) return;
    
    // Parse current, start and end months
    const [currentYear, currentMonthNum] = currentMonth.split('-').map(Number);
    const [startYear, startMonthNum] = startMonth.split('-').map(Number);
    const [endYear, endMonthNum] = endMonth.split('-').map(Number);
    
    // Calculate total months for comparison
    const currentTotalMonths = currentYear * 12 + currentMonthNum;
    const startTotalMonths = startYear * 12 + startMonthNum;
    const endTotalMonths = endYear * 12 + endMonthNum;
    
    let newStartMonth = startMonth;
    let newEndMonth = endMonth;
    let needsUpdate = false;
    
    // Check if we need to add months before
    if (currentTotalMonths - startTotalMonths < 2) {
      // Calculate new start date to maintain 2 months buffer before current month
      const newStartDate = new Date(currentYear, currentMonthNum - 3, 1);
      newStartMonth = yearMonthString(newStartDate);
      needsUpdate = true;
      console.log('Adding month before:', newStartMonth);
    }
    
    // Check if we need to add months after
    if (endTotalMonths - currentTotalMonths < 2) {
      // Calculate new end date to maintain 2 months buffer after current month
      const newEndDate = new Date(currentYear, currentMonthNum + 2, 1);
      newEndMonth = yearMonthString(newEndDate);
      needsUpdate = true;
      console.log('Adding month after:', newEndMonth);
    }
    
    // Update visible months if needed - use requestAnimationFrame for smoother updates
    if (needsUpdate) {
      requestAnimationFrame(() => {
        dispatch(setVisibleMonths({ startMonth: newStartMonth, endMonth: newEndMonth }));
      });
    }
  }

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
  const scrollerRef = useRef(null)
  
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
        // scrollToToday();
        scrollToThisMonth();
        
        // Wait for scroll animation to complete before activating observer
        setTimeout(() => {
          console.log('Activating observer after scroll');
          setupComplete.current = true;
          setObserverActive(true);
          
          // Ensure we're not at the very top by adding a small offset
          const scroller = document.getElementById('calendarScroller');
          if (scroller && scroller.scrollTop === 0) {
            scroller.scrollTop = 2;
          }
        }, 800); // Reduced from 1000ms to 800ms for faster activation
      }, 300); // Reduced from 500ms to 300ms for faster initial load
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (initialScrollTimeout.current) {
        clearTimeout(initialScrollTimeout.current);
      }
    };
  }, [months])
  
  // Add scroll event listener for smoother loading and prevent scrolling to the very top
  useEffect(() => {
    const scroller = document.getElementById('calendarScroller');
    if (scroller) {
      scrollerRef.current = scroller;
      
      const handleScroll = () => {
        // If we have a current month in view and observer is active
        if (currentMonthInView && observerActive && setupComplete.current) {
          // Check if we're near the edges to preload more content
          const scrollPosition = scroller.scrollTop;
          const scrollHeight = scroller.scrollHeight;
          const clientHeight = scroller.clientHeight;
          
          // If we're within 20% of the top or bottom, ensure buffer
          if (scrollPosition < clientHeight * 0.2 || 
              scrollPosition > scrollHeight - clientHeight * 1.2) {
            ensureMonthBuffer(currentMonthInView);
          }
          
          // Prevent scrolling all the way to the top
          // If scroll position is at the very top (0), push it down slightly
          if (scrollPosition === 0) {
            // Use a small offset (2px) to keep it just slightly scrolled
            requestAnimationFrame(() => {
              scroller.scrollTop = 2;
            });
          }
        }
      };
      
      // Add passive listener for better performance
      scroller.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        scroller.removeEventListener('scroll', handleScroll);
      };
    }
  }, [currentMonthInView, observerActive, setupComplete.current])

  // Sets the initial start and end months in global state
  function setInitialMonths() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Create date for 2 months before current month
    const prevMonthDate = new Date(currentYear, currentMonth - 2);
    // Create date for 2 months after current month
    const nextMonthDate = new Date(currentYear, currentMonth + 2);
    
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
    </div>
  );
}

export default Calendar;