import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedEventDate, setSelectedEventID } from '../../Global/eventsSlice'
import "./Events.css"
import { eventStatusClasses } from './EventsLoader'
import { isMobile } from 'react-device-detect'
import { setSelectedDay } from '../../Global/store'

function EventDisplay({ eventData, inDayWindow }) {
  // Get contacts from Redux store to display contact name
  const contactsObj = useSelector(state => state.contacts.contacts);
  const dispatch = useDispatch();
  
  // Store contact name in state
  const [contactData, setContactData] = useState(null);

    // Handle click event
    const handleClick = (e) => {
      // If its in the day window it always opens the event window
      if(inDayWindow){
        console.log("selecting event")
        e.stopPropagation(); // prevent clickthrough to the day window
        dispatch(setSelectedEventID(eventData?.id));
        dispatch(setSelectedEventDate(eventData?.date));
      }
      // If its now in the day window (its in a calendar day box)
      else{
        // In mobile just open the day window
        if(isMobile){
          // This will click through to the day box component and set the selected day ther
          // dispatch(setSelectedDay(eventData?.date))
        }
        // On desktop open the event window
        else{
          e.stopPropagation(); // prevent clickthrough to the day window
          dispatch(setSelectedEventID(eventData?.id));
          dispatch(setSelectedEventDate(eventData?.date));
        }
      }
    };
  
  //  Get contact data from global contacts object when contact_id or contacts change
  useEffect(() => {

    // IF thre is a contact try to get that contact id from the contacts
    if (eventData?.contact_id) {
      // Find the contact
      const contact = contactsObj[eventData.contact_id];

      // If there is a contact get the data so it can be displayed
      if (contact) {
        setContactData(contact);
      } 
      // If the matching contact is not found
      else {
        setContactData({});
      }
    } 
    // If there is no contact id in the event 
    else {
      setContactData({});
    }
  }, [eventData?.contact_id, contactsObj]);
  
  return (
    <div 
      className={`eventDisplay ${inDayWindow ? "":"eventDisplaySmall"} ${eventStatusClasses[eventData?.status]} `}
      onClick={handleClick}
    >
      <div className="event-title">{eventData?.title || contactData?.name}</div>
    </div>
  )
}

export default EventDisplay