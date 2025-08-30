import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AutoComplete, Input, Button, Avatar } from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import './ContactSearchAntD.css';

function ContactSearchAntD({ initialContactId, onContactSelected }) {
  const [mode, setMode] = useState('search'); // 'search' or 'edit'
  const [selectedContactId, setSelectedContactId] = useState(initialContactId || null);
  const [inputValue, setInputValue] = useState('');
  
  // Get contacts from Redux store
  const contacts = useSelector(state => state.contacts.contacts);
  
  // Convert contacts object to array for easier filtering
  const contactsArray = Object.values(contacts || {});
  
  // Set input value when selected contact changes
  useEffect(() => {
    if (selectedContactId && contacts[selectedContactId]) {
      setInputValue(contacts[selectedContactId].name);
    } else {
      setInputValue('');
    }
  }, [selectedContactId, contacts]);
  
  // Handle contact selection
  const handleContactSelect = (value, option) => {
    const contactId = option.key;
    setSelectedContactId(contactId);
    if (onContactSelected) {
      onContactSelected(contactId);
    }
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
            value={inputValue}
            onChange={setInputValue}
            placeholder="Search contacts"
            className="contact-autocomplete"
          />
        ) : (
          <Input
            placeholder="Contact name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="contact-input"
          />
        )}
      </div>
    </div>
  );
}

export default ContactSearchAntD;
