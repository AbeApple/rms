import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedEventID } from '../../Global/eventsSlice'
import "./Events.css"
import { eventStatusClasses } from './EventsLoader'

function EventDisplay({eventData, onClick, className = ""}) {
  // Get the selected event ID from Redux store
  const selectedEventID = useSelector(state => state.events.selectedEventID);
  // Get contacts from Redux store to display contact name
  const contactsObj = useSelector(state => state.contacts.contacts);
  const dispatch = useDispatch();
  
  // Store contact name in state
  const [contactName, setContactName] = useState(null);
  
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
  
  // Update contact name when contact_id or contacts change
  useEffect(() => {
    console.log('EventDisplay - eventData:', eventData);
    console.log('EventDisplay - contact_id:', eventData?.contact_id);
    console.log('EventDisplay - contactsObj type:', typeof contactsObj);
    console.log('EventDisplay - contactsObj keys:', Object.keys(contactsObj));
    
    if (eventData?.contact_id) {
      console.log('EventDisplay - Looking for contact ID:', eventData.contact_id);
      console.log('EventDisplay - Contact exists in obj?', eventData.contact_id in contactsObj);
      
      const contact = contactsObj[eventData.contact_id];
      console.log('EventDisplay - Contact lookup result:', contact);
      
      if (contact) {
        console.log('EventDisplay - Contact name:', contact.name);
        setContactName(contact.name);
      } else {
        console.log('EventDisplay - No matching contact found');
        setContactName(null);
      }
    } else {
      console.log('EventDisplay - No contact_id in event data');
      setContactName(null);
    }
  }, [eventData?.contact_id, contactsObj]);
  
  // Log the current state for debugging
  console.log('EventDisplay - Current contactName state:', contactName);
  console.log('EventDisplay - Will display:', eventData?.title || contactName);

  return (
    <div 
      className={`eventDisplay ${eventStatusClasses[eventData?.status]} `}
      onClick={handleClick}
    >
      <div className="event-title">{eventData?.title || contactName}</div>
    </div>
  )
}

export default EventDisplay