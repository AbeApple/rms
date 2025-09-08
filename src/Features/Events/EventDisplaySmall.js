import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedEventID } from '../../Global/eventsSlice'
import "./Events.css"
import { eventStatusClasses } from './EventsLoader'
import { isMobile } from 'react-device-detect'

function EventDisplaySmall({eventData, onClick, className = ""}) {
  // Get the selected event ID from Redux store
  const selectedEventID = useSelector(state => state.events.selectedEventID);
  // Get contacts from Redux store to display contact name
  const contactsObj = useSelector(state => state.contacts.contacts);
  const dispatch = useDispatch();
  
  // Store contact name in state
  const [contactName, setContactName] = useState(null);
  
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
  
  // Update contact name when contact_id or contacts change
  useEffect(() => {
    console.log('EventDisplaySmall - eventData:', eventData);
    console.log('EventDisplaySmall - contact_id:', eventData?.contact_id);
    console.log('EventDisplaySmall - contactsObj keys:', Object.keys(contactsObj));
    
    if (eventData?.contact_id) {
      console.log('EventDisplaySmall - Looking for contact ID:', eventData.contact_id);
      
      const contact = contactsObj[eventData.contact_id];
      console.log('EventDisplaySmall - Contact lookup result:', contact);
      
      if (contact) {
        console.log('EventDisplaySmall - Contact name:', contact.name);
        setContactName(contact.name);
      } else {
        console.log('EventDisplaySmall - No matching contact found');
        setContactName(null);
      }
    } else {
      console.log('EventDisplaySmall - No contact_id in event data');
      setContactName(null);
    }
  }, [eventData?.contact_id, contactsObj]);
  
  // Log the current state for debugging
  console.log('EventDisplaySmall - Current contactName state:', contactName);
  console.log('EventDisplaySmall - Will display:', eventData?.title || contactName);

  return (
    <div 
      className={`eventDisplay eventDisplaySmall ${eventStatusClasses[status]}`}
      onClick={handleClick}
    >
      <div className="event-title">{eventData?.title || contactName}</div>
    </div>
  )
}

export default EventDisplaySmall