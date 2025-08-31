import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedContactID } from '../../Global/contactsSlice';
// import ContactSelector from './ContactSelector';
import ContactSearchAntD from './ContactSearchAntD';
import './ContactBox.css';

export default function ContactBox({contactID, onContactIDChanged = ()=>{}}) {
  const dispatch = useDispatch();
  const contacts = useSelector(state => state.contacts?.contacts);
  const [selectedContactId, setSelectedContactId] = useState(contactID);
  const [contactData, setContactData] = useState(null);
  
  // Update internal state when prop changes
  useEffect(() => {
    if (contactID) {
      setSelectedContactId(contactID);
    }
  }, [contactID]);
  
  // Log contactID when it changes and notify parent
  useEffect(() => {
    console.log('ContactBox - Selected Contact ID changed:', selectedContactId);
    // Only notify parent if the ID actually changed from the initial value
    if (selectedContactId !== contactID) {
      onContactIDChanged(selectedContactId);
    }
  }, [selectedContactId, contactID, onContactIDChanged]);
  
  // Load contact data when contactID changes
  useEffect(() => {
    if (selectedContactId && contacts) {
      const contact = contacts[selectedContactId];
      if (contact) {
        setContactData(contact);
        console.log('Loaded contact data in ContactBox:', contact);
      }
    } else {
      setContactData(null);
    }
  }, [selectedContactId, contacts]);

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
          {contactData?.image?.downloadURL ? (
            <img 
              src={contactData.image.downloadURL} 
              alt={contactData.name || 'Contact'} 
              className="contact-img"
            />
          ) : (
            <div className="image-placeholder">
              {/* Default placeholder when no image is available */}
            </div>
          )}
          <button className="open-button" onClick={() => dispatch(setSelectedContactID(selectedContactId))}>
            Open <span className="arrow-icon">↗</span>
          </button>
        </div>
        
        <div className="contact-fields">
          <div>
            <select>
              <option>Status</option>
              <option>Complete</option>
              <option>Scheduled</option>
              <option>Positive</option>
              <option>Cancelled</option>
            </select>
            <input placeholder="Address"></input>
          </div>
          <div>
            <input placeholder="Email"></input>
            <input placeholder="Phone"></input>
            <input placeholder="Facebook"></input>
          </div>
        
        </div>
      </div>
      
      <div>
        <textarea placeholder='Note'></textarea>
      </div>
    </div>
  );
}