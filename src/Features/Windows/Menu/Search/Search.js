import React from 'react';
import { useDispatch } from 'react-redux';
import { reloadEvents, setEvents } from '../../../../Global/eventsSlice';
import { setContacts, setSelectedContactID } from '../../../../Global/contactsSlice';
import { supabase } from '../../../../DB/Supabase';

export default function Search() {
    const dispatch = useDispatch();

    // Function to delete all events
    const handleDeleteAllEvents = async () => {
        if (window.confirm('Are you sure you want to delete ALL events? This action cannot be undone.')) {
            try {
                // Delete all records from the events table
                const { error } = await supabase
                    .from('events')
                    .delete()
                    .neq('id', '0'); // This ensures all records are deleted
                
                if (error) {
                    console.error('Error deleting events:', error);
                    alert(`Error deleting events: ${error.message}`);
                } else {
                    console.log('All events deleted successfully');
                    // Clear events in Redux store
                    dispatch(setEvents({}));
                    // Trigger a reload of events data
                    dispatch(reloadEvents(Date.now()));
                    alert('All events deleted successfully');
                }
            } catch (error) {
                console.error('Exception when deleting events:', error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    // Function to delete all contacts
    const handleDeleteAllContacts = async () => {
        if (window.confirm('Are you sure you want to delete ALL contacts? This action cannot be undone.')) {
            try {
                const { error } = await supabase
                    .from('contacts')
                    .delete()
                    .neq('id', '0');

                if (error) {
                    console.error('Error deleting contacts:', error);
                    alert(`Error deleting contacts: ${error.message}`);
                } else {
                    console.log('All contacts deleted successfully');
                    dispatch(setContacts({}));
                    alert('All contacts deleted successfully');
                }
            } catch (error) {
                console.error('Exception when deleting contacts:', error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    // Function to log out
    const handleLogOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
                alert(`Error signing out: ${error.message}`);
            } else {
                // Optionally clear local Redux caches
                dispatch(setEvents({}));
                dispatch(setContacts({}));
            }
        } catch (error) {
            console.error('Exception during sign out:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
            <button 
                onClick={handleDeleteAllEvents}
                style={{ 
                    backgroundColor: '#ff4d4d', 
                    color: 'white', 
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Delete All Events
            </button>

            <button 
                onClick={handleDeleteAllContacts}
                style={{ 
                    backgroundColor: '#ff7043', 
                    color: 'white', 
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Delete All Contacts
            </button>

            <button 
                onClick={handleLogOut}
                style={{ 
                    backgroundColor: '#607d8b', 
                    color: 'white', 
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Log Out
            </button>

            <button 
                onClick={()=>dispatch(setSelectedContactID('new'))}
                style={{ 
                    backgroundColor: '#1976d2', 
                    color: 'white', 
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Create Contact
            </button>
        </div>
    );
}