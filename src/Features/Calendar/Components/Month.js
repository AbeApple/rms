import React, { useState, useEffect } from 'react';
import Day from './Day';
import './Month.css';

// Builds a calendar with all of the days based on the month string
function Month({monthString}) {
  const [days, setDays] = useState([]);
  
  useEffect(() => {
    if (monthString) {
      generateDays();
    }
  }, [monthString]);
  
  // Generate days for the month
  function generateDays() {
    const [year, monthNum] = monthString.split('-').map(num => parseInt(num));
    const month = monthNum - 1; // Adjust for JavaScript's 0-indexed months (0-11)
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
        
    // Get day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    const daysArray = [];
    
    // Add actual days from previous month instead of null padding
    if (firstDayOfWeek > 0) {
      // Get the last day of the previous month
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
      
      // Add days from previous month
      for (let i = 0; i < firstDayOfWeek; i++) {
        const dayOfPrevMonth = prevMonthLastDay - firstDayOfWeek + i + 1;
        const date = new Date(prevYear, prevMonth, dayOfPrevMonth);
        daysArray.push(date);
      }
    }
    
    // Add all days in the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      daysArray.push(date);
    }
    
    // Remove incomplete last week
    const totalDays = daysArray.length;
    const completeWeeks = Math.floor(totalDays / 7);
    const daysInCompleteWeeks = completeWeeks * 7;
    
    // Only keep complete weeks
    if (daysInCompleteWeeks < totalDays) {
      setDays(daysArray.slice(0, daysInCompleteWeeks));
    } else {
      setDays(daysArray);
    }
  }

  return (
    <div className="monthBox month" data-month={monthString}>
      {/* <div className='monthTitle'>{monthString}</div> */}
      {/* <div className='monthTitle'>
        {new Date(parseInt(monthString.split('-')[0]), parseInt(monthString.split('-')[1]) - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div> */}
      {days.map((date, index) => (
        <Day 
          key={`${index}-${date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : 'pad'}`} 
          date={date}
          monthString={monthString}
        />
      ))}
    </div>
  );
}

export default Month;