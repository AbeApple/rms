import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Autocomplete, TextField, Box } from '@mui/material';
import { AutoComplete } from 'antd';
import './AutocompleteTests.css';

function AutocompleteTests() {
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [antSearchText, setAntSearchText] = useState('');
  
  // Get contacts from Redux store
  const contacts = useSelector(state => state.contacts.contacts);
  
  // Convert contacts object to array for easier filtering
  const contactsArray = Object.values(contacts || {});
  
  // Filter contacts based on search text for Ant Design
  const filteredContacts = contactsArray.filter(contact => 
    contact.name.toLowerCase().includes(antSearchText.toLowerCase())
  );
  
  // Log contactID when it changes
  useEffect(() => {
    console.log('Selected Contact ID changed:', selectedContactId);
  }, [selectedContactId]);
  
  // Handle contact selection
  const handleContactSelect = (contactId) => {
    setSelectedContactId(contactId);
  };

  return (
    <div className="autocomplete-tests">
      <h2>Contact Autocomplete Tests</h2>
      
      <div className="test-container">
        <h3>Material UI Autocomplete</h3>
        <Autocomplete
          options={contactsArray}
          getOptionLabel={(option) => option.name}
          renderOption={(props, option) => (
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 2 }} {...props}>
              <div style={{ backgroundColor: '#e0e0e0', borderRadius: '50%', width: 32, height: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <img 
                  src={option.image?.downloadURL} 
                  alt={option.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span>{option.name}</span>
            </Box>
          )}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Search contacts" 
              variant="outlined" 
              fullWidth 
              onChange={(e) => setSearchText(e.target.value)}
            />
          )}
          onChange={(event, newValue) => {
            if (newValue) {
              handleContactSelect(newValue.id);
            } else {
              handleContactSelect(null);
            }
          }}
          value={contactsArray.find(contact => contact.id === selectedContactId) || null}
        />
      </div>
      
      <div className="test-container">
        <h3>Ant Design Autocomplete</h3>
        <AutoComplete
          style={{ width: '100%' }}
          placeholder="Search contacts"
          value={antSearchText}
          onChange={value => {
            setAntSearchText(value);
            // If the input is cleared, set the selected contact ID to null
            if (!value) {
              handleContactSelect(null);
            }
          }}
          onSelect={(value, option) => handleContactSelect(option.key)}
          allowClear={true}
          options={filteredContacts.map(contact => ({
            key: contact.id,
            value: contact.name,
            label: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#e0e0e0', borderRadius: '50%', width: 32, height: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginRight: 12 }}>
                  <img 
                    src={contact.image?.downloadURL} 
                    alt={contact.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {!contact.image?.downloadURL && contact.name.charAt(0)}
                </div>
                <span>{contact.name}</span>
              </div>
            )
          }))}
        />
      </div>
      
      {selectedContactId && (
        <div className="selected-contact">
          <h3>Selected Contact:</h3>
          <p>{contacts[selectedContactId]?.name}</p>
        </div>
      )}
    </div>
  );
}

export default AutocompleteTests;