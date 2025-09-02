import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedEventID } from '../../Global/eventsSlice'
import "./Events.css"
import { eventStatusClasses } from './EventsLoader'

function EventDisplaySmall({eventData, onClick, className = ""}) {
  // Get the selected event ID from Redux store
  const selectedEventID = useSelector(state => state.events.selectedEventID);
  const dispatch = useDispatch();
  
  // Handle click event
  const handleClick = () => {
    if (onClick) {
      // Use the provided onClick handler if available
      onClick();
    } else {
      // Otherwise dispatch the action directly
      dispatch(setSelectedEventID(eventData?.id));
    }
  };

  // Get the status from the event data
  const status = eventData?.status || "scheduled";
  
  return (
    <div 
      className={`eventDisplay eventDisplaySmall ${eventStatusClasses[status]}`}
      onClick={handleClick}
    >
      {eventData?.title}
    </div>
  )
}

export default EventDisplaySmall