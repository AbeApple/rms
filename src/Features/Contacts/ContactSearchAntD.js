import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AutoComplete, Input, Button, Avatar } from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import InputSupabase from '../../DB/Input/InputSupabase';
import './ContactSearchAntD.css';

function ContactSearchAntD({ initialContactId, onContactSelected = ()=>{} }) {
  const [mode, setMode] = useState(initialContactId ? 'edit' : 'search'); // 'search' or 'edit'
  const [selectedContactId, setSelectedContactId] = useState(initialContactId || null);
  const [contactName, setContactName] = useState('');
  
  // Get contacts from Redux store
  const contactsArray = useSelector(state => state.contacts.contacts);
  
  // Handle contact selection
  const handleContactSelect = (value, option) => {
    const contactId = option.key;
    setSelectedContactId(contactId);
    onContactSelected(contactId);
    // Switch to edit mode when a contact is selected
    setMode('edit');
  };

  // Toggle between search and edit mode
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'search' ? 'edit' : 'search');
  };

  // Format options for AutoComplete
  const options = contactsArray.map(contact => ({
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Avatar 
          src={contact.image?.downloadURL} 
          style={{ backgroundColor: !contact.image?.downloadURL ? '#1890ff' : 'transparent' }}
        >
          {!contact.image?.downloadURL && contact.name.charAt(0)}
        </Avatar>
        <span>{contact.name}</span>
      </div>
    ),
    value: contact.name,
    key: contact.id
  }));
  
  // Find selected contact name when ID changes
  useEffect(() => {
    if (selectedContactId) {
      const selectedContact = contactsArray.find(contact => contact.id === selectedContactId);
      if (selectedContact) {
        setContactName(selectedContact.name);
      }
    } else {
      setContactName('');
    }
  }, [selectedContactId, contactsArray]);
  
  // Set initial mode and load contact name based on initialContactId
  useEffect(() => {
    if (initialContactId) {
      setMode('edit');
      // Find the contact name for the initial contact ID
      const initialContact = contactsArray.find(contact => contact.id === initialContactId);
      if (initialContact) {
        setContactName(initialContact.name);
      }
    }
  }, [initialContactId, contactsArray]);

  return (
    <div className="contact-search-antd">
      <div className="selector-container">
        <Button 
          icon={mode === 'search' ? <EditOutlined /> : <SearchOutlined />}
          onClick={toggleMode}
          className="mode-toggle-button"
        />
        
        {mode === 'search' ? (
          <AutoComplete
            options={options}
            style={{ width: '100%' }}
            onSelect={handleContactSelect}
            placeholder="Search contacts"
            className="contact-autocomplete"
          />
        ) : (
          <InputSupabase
            table="contacts"
            column="name"
            recordId={selectedContactId || 'new'}
            defaultValue={contactName}
            type="text"
            placeholder="Contact name"
            className="contact-input"
            viewModeOverride={false} // Always in edit mode
            onSaved={(value, newId) => {
              console.log('[ContactSearchAntD] Input timeout (500ms delay)');
              if (newId) {
                console.log(`[ContactSearchAntD] Created new contact with ID: ${newId}`);
                setSelectedContactId(newId);
                onContactSelected(newId);
              } else {
                console.log(`[ContactSearchAntD] Updated contact ${selectedContactId}`);
                onContactSelected(selectedContactId);
              }
              // Stay in edit mode after saving
            }}
            onCreatedNew={(value, newId) => {
              console.log(`[ContactSearchAntD] Created new contact with ID: ${newId}`);
              setSelectedContactId(newId);
              onContactSelected(newId);
              setContactName(value);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ContactSearchAntD;
