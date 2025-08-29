// Returns yyyy-mm-dd format from a date object (compatible with HTML date inputs)
export function dateString(dateObject){
  if (!dateObject) return null;
  
  // Format date as yyyy-mm-dd string
  const day = dateObject.getDate().toString().padStart(2, '0');
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObject.getFullYear();
  
  return `${year}-${month}-${day}`;
}
export function yearMonthString(dateObject){
    if (!dateObject) return null;
    
    // Format date as yyyy-mm string
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    
    return `${year}-${month}`;
  }

// Returns the month name from a date object
export function monthName(dateObject) {
  if (!dateObject) return '';
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return monthNames[dateObject.getMonth()];
}

export function scrollToThisMonth(){
  // Get current date and format it as YYYY-MM
  const today = new Date();
  const currentMonth = yearMonthString(today);
  console.log('Scrolling to month:', currentMonth);
  
  // Find the element for the current month
  const currentMonthElement = document.querySelector(`.monthBox.month[data-month="${currentMonth}"]`);
  
  if (currentMonthElement) {
    console.log('Found month element:', currentMonthElement);
    
    // Get the scroller element
    const scroller = document.getElementById('calendarScroller');
    if (scroller) {
      // Calculate the position to scroll to
      const scrollPosition = currentMonthElement.offsetTop - scroller.offsetTop;
      
      // Scroll to the position
      scroller.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
      
      console.log('Scrolled to position:', scrollPosition);
    } else {
      // Fallback to scrollIntoView if scroller not found
      currentMonthElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    
    return currentMonth
  } else {
    console.warn('Current month element not found:', currentMonth);
  }
}

export function scrollToToday() {
  // Get current date and format it as YYYY-MM-DD
  const today = new Date();
  const todayString = dateString(today);
  console.log('Scrolling to day:', todayString);
  
  // Find the element for the current day
  const currentDayElement = document.querySelector(`[data-date="${todayString}"]`);
  
  if (currentDayElement) {
    console.log('Found day element:', currentDayElement);
    
    // Get the scroller element
    const scroller = document.getElementById('calendarScroller');
    if (scroller) {
      // Calculate the position to scroll to, positioning the day 400px from bottom
      const viewportHeight = scroller.clientHeight;
      const scrollPosition = currentDayElement.offsetTop - scroller.offsetTop - (viewportHeight - 400);
      
      // Scroll to the position
      scroller.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
      
      console.log('Scrolled to day position:', scrollPosition);
    } else {
      // Fallback to scrollIntoView if scroller not found
      currentDayElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center' // Center the day in the viewport
      });
    }
    
    return todayString;
  } else {
    console.warn('Current day element not found:', todayString);
    // Fallback to month scrolling if day not found
    scrollToThisMonth();
    return null;
  }
}