import React, { useMemo, memo } from 'react';
import './Day.css';
import { useDispatch } from 'react-redux';
import { setSelectedDay } from '../../../Global/store';
import { dateString } from '../../../Global/functions';
import MonthIndicator from './MonthIndicator';

// Displays the day as a square with the number at the top right
function Day({ date, monthString}) {
  const dispatch = useDispatch();
  
  // Memoize calculations that depend on date and monthString
  const dayData = useMemo(() => {
    // Check if this day belongs to the current month or not
    const isCurrentMonthDay = () => {
      if (!date) return true;

      let dayMonth = date.getMonth() + 1 // JavaScript months are 0-indexed
      let currentMonth = parseInt(monthString.split("-")[1])

      return dayMonth === currentMonth;
    };
    
    // Determine if a day needs padding
    const needsPadding = () => {
      if (!date) return false;
      
      // If day is not from current month, it needs padding
      if (!isCurrentMonthDay()) return true;
      
      // Get the last day of the month
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // If the last day of the month is a Saturday
      if (lastDayOfMonth.getDay() === 6) {
        // Get the date of the Sunday that starts the last week
        const startOfLastWeek = new Date(lastDayOfMonth);
        startOfLastWeek.setDate(lastDayOfMonth.getDate() - lastDayOfMonth.getDay());
        
        // If this day is in the last week of the month
        if (date >= startOfLastWeek && date <= lastDayOfMonth) {
          return true;
        }
      }
      
      return false;
    };
    
    // Create a data attribute for the current day in YYYY-MM-DD format
    const dataDateAttr = date ? dateString(date) : '';
    
    // Check if this day is today
    const isToday = () => {
      if (!date) return false;
      const today = new Date();
      return dateString(date) === dateString(today);
    };
    
    return {
      needsPadding: needsPadding(),
      dataDateAttr,
      isToday: isToday()
    };
  }, [date, monthString]);
  
  return (
    <div 
      className={dayData.needsPadding ? 'dayBoxOuter dayBoxOuterPad' : 'dayBoxOuter'}
      data-date={dayData.dataDateAttr}
    >
      {/* The month indicator above the day box */}
      <MonthIndicator date={date} />
      <div 
        className={`dayBox${dayData.isToday ? ' today' : ''}`}
        onClick={() => date && dispatch(setSelectedDay(dateString(date)))}
      >
        <div className='dayBoxDate'>{date?.getDate()}</div>
        <div className='dayBoxContent'>
            {/* <div>{monthString}</div>
            <div>{dateString(date)}</div> */}
        </div>
      </div>
    </div>
  );
}

// Use memo to prevent unnecessary re-renders
export default memo(Day);