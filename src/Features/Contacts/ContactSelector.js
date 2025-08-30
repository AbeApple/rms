import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Autocomplete, TextField, Box, IconButton, InputAdornment } from '@mui/material';
import './ContactSelector.css';

function ContactSelector({ initialContactId, onContactSelected }) {
  const [mode, setMode] = useState('search'); // 'search' or 'edit'
  const [selectedContactId, setSelectedContactId] = useState(initialContactId || null);
  const [searchText, setSearchText] = useState('');
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
  const handleContactSelect = (contactId) => {
    setSelectedContactId(contactId);
    if (onContactSelected) {
      onContactSelected(contactId);
    }
  };

  // Toggle between search and edit mode
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'search' ? 'edit' : 'search');
  };

  return (
    <div className="contact-selector">
      {mode === 'search' ? (
        <div className="selector-container">
          <button 
            className="mode-toggle-button" 
            onClick={toggleMode}
          >
            ✏️
          </button>
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
                  {!option.image?.downloadURL && option.name.charAt(0)}
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
            className="contact-autocomplete"
          />
        </div>
      ) : (
        <div className="selector-container">
          <button 
            className="mode-toggle-button" 
            onClick={toggleMode}
          >
            🔍
          </button>
          <TextField
            label="Contact name"
            variant="outlined"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="contact-input"
          />
        </div>
      )}
    </div>
  );
}

export default ContactSelector;
