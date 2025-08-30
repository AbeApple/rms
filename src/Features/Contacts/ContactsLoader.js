import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setContacts } from '../../Global/contactsSlice';

// Sample contact data
const sampleContacts = {
  // Contact 1
  'c001': {
    id: 'c001',
    name: 'John Smith',
    image: { downloadURL: "https://example.com/images/john-smith.jpg" }
  },
  
  // Contact 2
  'c002': {
    id: 'c002',
    name: 'Sarah Johnson',
    image: { downloadURL: "https://example.com/images/sarah-johnson.jpg" }
  },
  
  // Contact 3
  'c003': {
    id: 'c003',
    name: 'Michael Chen',
    image: { downloadURL: "https://example.com/images/michael-chen.jpg" }
  },
  
  // Contact 4
  'c004': {
    id: 'c004',
    name: 'Emily Davis',
    image: { downloadURL: "https://example.com/images/emily-davis.jpg" }
  },
  
  // Contact 5
  'c005': {
    id: 'c005',
    name: 'David Wilson',
    image: { downloadURL: "https://example.com/images/david-wilson.jpg" }
  },
  
  // Contact 6
  'c006': {
    id: 'c006',
    name: 'Lisa Rodriguez',
    image: { downloadURL: "https://example.com/images/lisa-rodriguez.jpg" }
  }
};

export default function ContactsLoader() {
  const dispatch = useDispatch();
  
  // Load contacts into Redux store on component mount
  useEffect(() => {
    loadContactsToStore();
  }, []);
  
  // Function to load contacts into the global state
  const loadContactsToStore = () => {
    dispatch(setContacts(sampleContacts));
  };
  
  // This component doesn't render anything visible
  return null;
}
