import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedContactID } from '../../Global/contactsSlice';
// import ContactSelector from './ContactSelector';
import ContactSearchAntD from './ContactSearchAntD';
import './ContactBox.css';

export default function ContactBox({contactID, onContactIDChanted = ()=>{}}) {
  const dispatch = useDispatch();
  const [selectedContactId, setSelectedContactId] = useState(contactID);
  
  // Log contactID when it changes
  useEffect(() => {
    console.log('ContactBox - Selected Contact ID changed:', selectedContactId);
    onContactIDChanted(selectedContactId)
  }, [selectedContactId]);

  // Handle contact selection from the ContactSelector
  const handleContactSelected = (contactId) => {
    setSelectedContactId(contactId);
  };

  return (
    <div className="contact-box">
      {/* Original Material UI ContactSelector - commented out
      <ContactSelector 
        initialContactId={selectedContactId} 
        onContactSelected={handleContactSelected} 
      /> */}
      <ContactSearchAntD 
        initialContactId={selectedContactId} 
        onContactSelected={handleContactSelected} 
      />
      
      <div className="contact-details-container">
        <div className="contact-image">
          <div className="image-placeholder">
            {/* Default placeholder when no image is available */}
          </div>
          <button className="open-button" onClick={() => dispatch(setSelectedContactID(selectedContactId))}>
            Open <span className="arrow-icon">↗</span>
          </button>
        </div>
        
        <div className="contact-fields">
          <select>
            <option>Status</option>
            <option>Complete</option>
            <option>Scheduled</option>
            <option>Positive</option>
            <option>Cancelled</option>
          </select>
          <input placeholder="Address"></input>
          <input placeholder="Email"></input>
          <input placeholder="Phone"></input>
        </div>
      </div>
      
      <div>
        <textarea placeholder='Note'></textarea>
      </div>
    </div>
  );
}