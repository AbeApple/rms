import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AutoComplete, Input, Button, Avatar } from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import InputSupabase from '../../DB/Input/InputSupabase';
import './ContactSearchAntD.css';
import { upsertContact } from '../../Global/contactsSlice';

function ContactSearchAntD({ parentContactId, onContactSelected = ()=>{}, contactData }) {
  const disatch = useDispatch()
  const [mode, setMode] = useState(parentContactId ? 'edit' : 'search');
  const userId = useSelector(state => state.auth?.userId)
  
  // Get contacts from Redux store
  const contactsObj = useSelector(state => state.contacts.contacts);
  
  // Handle contact selection
  const handleContactSelect = (value, option) => {
    const contactId = option.key;
    onContactSelected(contactId);
    // Switch to edit mode when a contact is selected
    setMode('edit');
  };

  // Toggle between search and edit mode
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'search' ? 'edit' : 'search');
  };

  // Format options for AutoComplete
  const options = Object.values(contactsObj).map(contact => ({
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Avatar 
          src={contact.image?.downloadURL} 
          style={{ backgroundColor: !contact.image?.downloadURL ? '#1890ff' : 'transparent' }}
        >
          {!contact.image?.downloadURL && contact?.name?.charAt(0)}
        </Avatar>
        <span>{contact.name}</span>
      </div>
    ),
    value: contact.name,
    key: contact.id
  }));
  
  
  // Set mode when parentContactId is set or removed
  useEffect(() => {
    console.log("!*!*!*!*!parentContactId changed: ", parentContactId)
    if (parentContactId) {
      setMode('edit');
      console.log("set to edit")
    }else{
      console.log("set to search")
      setMode('search')
    }
  }, [parentContactId, contactsObj]);

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
            recordId={parentContactId}
            defaultValue={contactData?.name}
            type="text"
            placeholder="Contact name"
            className="contact-input"
            defaultStartData={{ user_id: userId }}

            onSaved={(data) => {
              // When a new contact is created the id will be sent to the parent which will sent it to its parent, they will load and update data accordingly
              console.log(`[ContactSearchAntD] updated contact with ID: ${data.id}`);
              onContactSelected(data.id);
              // Also need to put it in the global state so the contacts objects is current
              disatch(upsertContact(data))
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ContactSearchAntD;
