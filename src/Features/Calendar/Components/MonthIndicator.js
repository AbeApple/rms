import React from 'react';
import { monthName } from '../../../Global/functions';
import './MonthIndicator.css';

function MonthIndicator({ date }) {
  // Only show for the first day of the month
  if (!date || date.getDate() !== 1) {
    return null;
  }

  const year = date.getFullYear() % 100; // Get last two digits of year
  const month = monthName(date);
  
  return (
    <div className="dayMonthIndicator">
      <span className="full-month-name">{`${month} ${year}`}</span>
      <span className="short-month-name">{`${month.substring(0, 3)} ${year}`}</span>
    </div>
  );
}

export default MonthIndicator;
