import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedEventID } from '../../Global/eventsSlice'
import "./Events.css"
import { eventStatusClasses } from './EventsLoader'

function EventDisplay({eventData, onClick, className = ""}) {
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
  
  return (
    <div 
      className={`eventDisplay ${eventStatusClasses[eventData?.status]} `}
      onClick={handleClick}
    >
      {eventData?.title}
    </div>
  )
}

export default EventDisplay