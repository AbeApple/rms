import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedContactID } from '../../Global/contactsSlice';
// import ContactSelector from './ContactSelector';
import ContactSearchAntD from './ContactSearchAntD';
import './ContactBox.css';
import { setImagesArray } from '../../Global/store';
import InputCopy from '../../Components/InputCopy';
import { supabase } from '../../DB/Supabase';
import InputSupabase from '../../DB/Input/InputSupabase';
import { eventStatusClasses } from '../Events/EventsLoader';

export default function ContactBox({contactID, onContactIDChanged = ()=>{}}) {
  const dispatch = useDispatch();
  const contacts = useSelector(state => state.contacts.contacts)
  const [selectedContactId, setSelectedContactId] = useState(contactID);
  const [contactData, setContactData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure internal contactID state is in sync with parent component
  useEffect(() => {
      setSelectedContactId(contactID);
  }, [contactID]);
  
  // If contactID in this component becomes different from parent notify parent with callback funciton
  useEffect(() => {
    console.log('ContactBox - Selected Contact ID changed:', selectedContactId);
    // Only notify parent if the ID actually changed from the initial value
    if (selectedContactId !== contactID) {
      console.log('ContactBox - Notifying parent of contact ID change:', selectedContactId, " from ", contactID);
      onContactIDChanged(selectedContactId);
    }
  }, [selectedContactId]);
  
  // Load contact data when contactID changes
  useEffect(() => {
    if (selectedContactId) {
      loadContactData(selectedContactId)
    } else {
      setContactData({});
    }
  }, [selectedContactId]);


  // get contact data from supabase
  async function loadContactData(contactID){

    setIsLoading(true)
         
    // Get simple data immediately
    setContactData(contacts && contacts[contactID])

    try {
        console.log(`Fetching contact data for ID: ${contactID}`);
        
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', contactID)
            .single();
        
        if (error) {
            throw error;
        }
        
        if (data) {
            console.log('Contact data loaded:', data);
            
            // Transform the data to match our component's expected format
            setContactData(data);
        } else {
            console.error(`No contact found with ID: ${selectedContactId}`);
            // setLoadError(`contact not found`);
        }
    } catch (error) {
        console.error('Error loading contact data:', error);
        setIsLoading(false);
    } finally {
        setIsLoading(false);
    }
  }

  // Handle updates to contact data (is there a purpose of this function?)
  const handleContactUpdated = (value, recordId, column) => {
    console.log(`Contact updated: ${column} = ${value}`);
    // If a new contat was created update the id (will trigger parent callback too if different from current)
    setSelectedContactID(recordId)
  }

  // Handle contact selection from the ContactSelector 
  const handleContactSelected = (contactID) => {
    console.log("contact selected: ", contactID)
    // TODO call directly when done debugging
    setSelectedContactId(contactID);
  };

  return (
    <div className="contact-box">

      <ContactSearchAntD 
        parentContactId={selectedContactId} 
        onContactSelected={handleContactSelected}
        contactData={contactData}
      />
      
      <div className="contact-details-container">
        <div 
          className="contact-image" 
        >
          {contactData?.image?.downloadURL ? (
            <img 
              src={contactData.image.downloadURL} 
              alt={contactData.name || 'Contact'} 
              className="contact-img"
              onClick={()=>dispatch(setImagesArray([contactData?.image?.downloadURL]))}
            />
          ) : (
            <div className="image-placeholder"></div>
          )}
          <button className="open-button" onClick={() => dispatch(setSelectedContactID(selectedContactId))}>
            Open <span className="arrow-icon">↗</span>
          </button>
        </div>
      
        {/* Info fields */}
        <div className="contact-fields">
          <div>
            <InputSupabase
              table="contacts"
              column="status"
              recordId={selectedContactId}
              defaultValue={contactData?.status || ""}
              type="select"
              options={Object.keys(eventStatusClasses)}
              viewMode={false}
              onSaved={handleContactUpdated}
              className="full-width margin-bottom"
            />
            <InputSupabase
              table="contacts"
              column="address"
              recordId={selectedContactId}
              defaultValue={contactData?.address || ""}
              type="text"
              viewMode={false}
              onSaved={handleContactUpdated}
              className="full-width margin-bottom"
              showCopyButton
            />
          </div>
          <div>
            <InputSupabase
              table="contacts"
              column="email"
              recordId={selectedContactId}
              defaultValue={contactData?.email || ""}
              type="text"
              viewMode={false}
              onSaved={handleContactUpdated}
              className="full-width margin-bottom"
              showCopyButton
            />
            <InputSupabase
              table="contacts"
              column="phone"
              recordId={selectedContactId}
              defaultValue={contactData?.phone || ""}
              type="text"
              viewMode={false}
              onSaved={handleContactUpdated}
              className="full-width margin-bottom"
              showCopyButton
            />
            <InputSupabase
              table="contacts"
              column="facebook"
              recordId={selectedContactId}
              defaultValue={contactData?.facebook || ""}
              type="text"
              viewMode={false}
              onSaved={handleContactUpdated}
              className="full-width margin-bottom"
              showCopyButton
            />
          </div>
        
        </div>
      </div>

      {/* Note */}
      <div className="textarea-container">
        <InputSupabase
          table="contacts"
          column="note"
          recordId={selectedContactId}
          defaultValue={contactData?.note || ""}
          type="textarea"
          viewModeOverride={false}
          onSaved={handleContactUpdated}
          fullWidth={true}
          placeholder="Note"
        />
      </div>

      {/* Collapsable boxes with the title on the top left like the material ui auto complete title */}
      <div>ID: {"contactID:"+contactID}</div>
      <div>Dependencies</div>
      <div>Stats</div>

    </div>
  );
}