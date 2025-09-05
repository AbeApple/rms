import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedEventID } from '../../Global/eventsSlice'
import "./Events.css"
import { eventStatusClasses } from './EventsLoader'
import { isMobile } from 'react-device-detect'

function EventDisplaySmall({eventData, onClick, className = ""}) {
  // Get the selected event ID from Redux store
  const selectedEventID = useSelector(state => state.events.selectedEventID);
  const dispatch = useDispatch();
  
  // Handle click event
  const handleClick = (e) => {
    if (!isMobile) {
      // On desktop: prevent click propagation and open event window
      e.stopPropagation();
      dispatch(setSelectedEventID(eventData?.id));
    } else {
      // On mobile: allow click to propagate to parent (day box)
      // which will open the day window
      if (onClick) {
        onClick();
      }
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