import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedContactID, upsertContact } from '../../Global/contactsSlice';
// import ContactSelector from './ContactSelector';
import ContactSearchAntD from './ContactSearchAntD';
import './ContactBox.css';
import InputCopy from '../../Components/InputCopy';
import { supabase } from '../../DB/Supabase';
import InputSupabase from '../../DB/Input/InputSupabase';
import { eventStatusClasses } from '../Events/EventsLoader';
import SaveStatusIndicator from '../../Components/SaveStatusIndicator';
import ContactImages from './ContactImages';
import ContactImages2 from './ContactImages2';

export default function ContactBox({contactID, onContactIDChanged = ()=>{}}) {
  const dispatch = useDispatch();
  const contacts = useSelector(state => state.contacts.contacts)
  const userId = useSelector(state => state.auth?.userId)
  const [selectedContactIdLocal, setSelectedContactIdLocal] = useState(contactID);
  const [contactData, setContactData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Ensure internal contactID state is in sync with parent component
  useEffect(() => {
      setSelectedContactIdLocal(contactID);
  }, [contactID]);
  
  // If contactID in this component becomes different from parent notify parent with callback funciton
  useEffect(() => {
    console.log('ContactBox - Selected Contact ID changed:', selectedContactIdLocal);
    // Only notify parent if the ID actually changed from the initial value
    if (selectedContactIdLocal !== contactID) {
      console.log('ContactBox - Notifying parent of contact ID change:', selectedContactIdLocal, " from ", contactID);
      onContactIDChanged(selectedContactIdLocal);
    }
  }, [selectedContactIdLocal]);
  
  // Load contact data when contactID changes
  useEffect(() => {
    if (selectedContactIdLocal) {
      loadContactData(selectedContactIdLocal)
    } else {
      setContactData({});
    }
  }, [selectedContactIdLocal]);


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
            .eq('user_id', userId)
            .single();

          console.log("contact data", data)
        
        if (error) {
            throw error;
        }
        
        if (data) {
            console.log('Contact data loaded:', data);
            
            // Transform the data to match our component's expected format
            setContactData(data);
        } else {
            console.error(`No contact found with ID: ${selectedContactIdLocal}`);
            // setLoadError(`contact not found`);
        }
    } catch (error) {
        console.error('Error loading contact data:', error);
        setIsLoading(false);
    } finally {
        setIsLoading(false);
    }
  }

  // Handle contact selection from the ContactSelector 
  const handleContactSelected = (contactID) => {
    console.log("contact selected: ", contactID)
    // TODO call directly when done debugging
    setSelectedContactIdLocal(contactID);
  };

  async function createContact(){
    // Create a contact in the database and return the data {id: newID}
    try{
      // Ensure we include user_id so filtered queries can find this row
      const { data, error } = await supabase
        .from("contacts")
        .insert({ user_id: userId })
        .select()

      console.log("created contact: ", data[0].id)

      if(error){
        console.log("createContact error: ", error)
        return null
      }

      const newContactID = data && data[0] && data[0].id
      if(!newContactID){
        console.log("createContact error: no id returned")
        return null
      }

      console.log("created contact with id: ", newContactID)

      // Update local state immediately (will trigger usEffect to notify parent component)
      setSelectedContactIdLocal(newContactID)

      return newContactID
    }catch(err){
      console.error("createContact exception:", err)
      return null
    }

  }

  return (
    <div className="contact-box" style={{ position: 'relative' }}>

      <SaveStatusIndicator loading={isLoading} saving={isSaving} error={saveError} />

      <ContactSearchAntD 
        parentContactId={selectedContactIdLocal} 
        onContactSelected={handleContactSelected}
        contactData={contactData}
      />
      
      <div className="contact-details-container">
        <div className="contact-image">
          {/* Loads and displays existing (starting with default),  */}
          <ContactImages2 
            contactId={selectedContactIdLocal}
            userId={userId}
            defaultImage={{public_url: contactData?.main_image}}
            createNewCallback={createContact}
          />
          <button className="open-button" onClick={() => dispatch(setSelectedContactID(selectedContactIdLocal))}>
            Open <span className="arrow-icon">↗</span>
          </button>
        </div>
      
        {/* Info fields */}
        <div className="contact-fields">
          <div>
            <InputSupabase
              table="contacts"
              column="status"
              recordId={selectedContactIdLocal}
              defaultValue={contactData?.status || ""}
              type="select"
              options={Object.keys(eventStatusClasses)}
              viewMode={false}
              onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
              onSaved={(data) => { setIsSaving(false); setSaveError(null); if(data?.id) setSelectedContactIdLocal(data.id); if (data) dispatch(upsertContact(data)); }}
              onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
              defaultStartData={{ user_id: userId }}
              className="full-width margin-bottom"
            />
            <InputSupabase
              table="contacts"
              column="address"
              recordId={selectedContactIdLocal}
              defaultValue={contactData?.address || ""}
              type="text"
              viewMode={false}
              onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
              onSaved={(data) => { setIsSaving(false); setSaveError(null); if(data?.id) setSelectedContactIdLocal(data.id); if (data) dispatch(upsertContact(data)); }}
              onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
              defaultStartData={{ user_id: userId }}
              className="full-width margin-bottom"
              showCopyButton
            />
          </div>
          <div>
            <InputSupabase
              table="contacts"
              column="email"
              recordId={selectedContactIdLocal}
              defaultValue={contactData?.email || ""}
              type="text"
              viewMode={false}
              onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
              onSaved={(data) => { setIsSaving(false); setSaveError(null); if(data?.id) setSelectedContactIdLocal(data.id); if (data) dispatch(upsertContact(data)); }}
              onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
              defaultStartData={{ user_id: userId }}
              className="full-width margin-bottom"
              showCopyButton
            />
            <InputSupabase
              table="contacts"
              column="phone"
              recordId={selectedContactIdLocal}
              defaultValue={contactData?.phone || ""}
              type="text"
              viewMode={false}
              onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
              onSaved={(data) => { setIsSaving(false); setSaveError(null); if(data?.id) setSelectedContactIdLocal(data.id); if (data) dispatch(upsertContact(data)); }}
              onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
              defaultStartData={{ user_id: userId }}
              className="full-width margin-bottom"
              showCopyButton
            />
            <InputSupabase
              table="contacts"
              column="facebook"
              recordId={selectedContactIdLocal}
              defaultValue={contactData?.facebook || ""}
              type="text"
              viewMode={false}
              onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
              onSaved={(data) => { setIsSaving(false); setSaveError(null); if(data?.id) setSelectedContactIdLocal(data.id); if (data) dispatch(upsertContact(data)); }}
              onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
              defaultStartData={{ user_id: userId }}
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
          recordId={selectedContactIdLocal}
          defaultValue={contactData?.note || ""}
          type="textarea"
          viewModeOverride={false}
          onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
          onSaved={(data) => { setIsSaving(false); setSaveError(null); if(data?.id) setSelectedContactIdLocal(data.id); if (data) dispatch(upsertContact(data)); }}
          onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
          defaultStartData={{ user_id: userId }}
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