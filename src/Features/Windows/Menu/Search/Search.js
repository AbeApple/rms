import React from 'react';
import { useDispatch } from 'react-redux';
import { setEvents, setReloadTrigger } from '../../../../Global/eventsSlice';
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
                    dispatch(setReloadTrigger(Date.now()));
                    alert('All events deleted successfully');
                }
            } catch (error) {
                console.error('Exception when deleting events:', error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    return (
        <div>
            <button 
                onClick={handleDeleteAllEvents}
                style={{ 
                    backgroundColor: '#ff4d4d', 
                    color: 'white', 
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                }}
            >
                Delete All Events
            </button>
        </div>
    );
}