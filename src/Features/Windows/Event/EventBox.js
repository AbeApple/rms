import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./EventWindow.css"
import { setSelectedEventID, updateEvent, addEvent, reloadEvents } from '../../../Global/eventsSlice'
import Window from '../Window'
import ContactBox from '../../Contacts/ContactBox'
import { eventStatusClasses } from '../../Events/EventsLoader'
import InputSupabase from '../../../DB/Input/InputSupabase'
import { supabase } from '../../../DB/Supabase'


// This is a bunch of trash. need to restart. 
export default function EventBox() {
    
    const dispatch = useDispatch()
    const events = useSelector(state => state.events?.events)
    const selectedEventID = useSelector(state => state.events?.selectedEventID)
    const selectedEventDate = useSelector(state => state.events?.selectedEventDate)
    // Starting with the simple data in the global state (contact_id, title, date)
    const [eventData, setEventData] = useState(events && events[selectedEventDate] && events[selectedEventDate].find(event => event?.id === selectedEventID))
    const justCreated = useRef()

    // State for tracking loading errors
    const [loadError, setLoadError] = useState(null);

    // When the event id changes load the event data
    useEffect(()=>{

        // To prevent the scenario where a new event is created then the date is updated in the db at the same time as a raload so the date here coule be overridden by the null date in the db at the time of loadinFromDB
        if(selectedEventID){
            justCreated.current = true
        }
        else {
            setEventData({date: selectedEventDate})
            justCreated.current = true
        }
 
        // If there is an event to load and we didn't just create a new event load the event data
        if(selectedEventID && !justCreated.current)
            loadEventData()

    },[selectedEventID])

    async function loadEventData(){
        console.log("loading event data ")

        // Get current date in YYYY-MM-DD format for default value
        const today = new Date().toISOString().split('T')[0];
        const eventDate = selectedEventDate || today;

        // If there is no event id (creating new event) just set the date
        if(!selectedEventID){
            setEventData({
                date: eventDate,
            });
        }
        
        // If we have a valid event ID, fetch the event data from Supabase
        if (selectedEventID && selectedEventID !== 'new') {
            setLoadError(null);
            
            try {
                console.log(`Fetching event data for ID: ${selectedEventID}`);
                
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', selectedEventID)
                    .single();
                
                if (error) {
                    throw error;
                }
                
                if (data) {
                    console.log('Event data loaded:', data);
                    
                    // Transform the data to match our component's expected format
                    setEventData(data);
                } else {
                    console.error(`No event found with ID: ${selectedEventID}`);
                    setLoadError(`Event not found`);
                }
            } catch (error) {
                console.error('Error loading event data:', error);
                setLoadError(`Error loading event: ${error.message}`);
            }
        }
    }
    
    // When event data changes update the specific event in the Redux store
    const handleEventSaved = async (value, eventId, column) => {
        console.log("handleEventSaved: ", value, eventId, column)
        const columnsToRefreshFor = ["title", "contact_id", "status", "date", "start_time", "end_time"]
        
        // Only update the Redux store for fields that affect the calendar display
        if(columnsToRefreshFor.includes(column)) {
            // Create the updated data object with snake_case keys
            const updatedData = {};
            
            // Set the value directly with the same column name
            updatedData[column] = value;
            
            // Update the specific event in the Redux store
            dispatch(updateEvent({ eventId, updatedData }));
        }
    }
    
    // Called in a callback when InputSupabase creates a new entry to events and sets the event data in the db
    const handleEventCreated = async (value, newEventId, column) => {
        console.log(`New event created with ID: ${newEventId}, setting ${column} = ${value}`);
        
        // Update the selected event ID in global state
        dispatch(setSelectedEventID(newEventId));
        
        // Create a new event object with snake_case keys
        const newEvent = {
            id: newEventId,
            [column]: value
        };

        // Update local state to this new event data
        setEventData(newEvent)

        // If this is the first field being created, ensure the date is set
        // This is needed because the date might not be the first field the user edits
        if (column !== 'date' && selectedEventDate) {
            try {
                // Set the date in the database for this new event
                const result = await supabase
                    .from('events')
                    .update({ date: selectedEventDate })
                    .eq('id', newEventId)
                    .select();
                
                if (result.error) {
                    console.error('Error setting date for new event:', result.error);
                } else {
                    console.log(`Successfully set date to ${selectedEventDate} for new event ${newEventId}`);
                    // Add date to the new event
                    newEvent.date = selectedEventDate;
                }
            } catch (error) {
                console.error('Error in handleEventCreated:', error);
            }
        }
        
        // Add the new event to the Redux store
        dispatch(addEvent({ event: newEvent }));
    }

    // Create a new event with provided data (used for when contact id is set and there is no event id)
    const createEvent = async (eventData) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const eventDate = selectedEventDate || today;
            
            // Prepare event data with defaults
            const newEventData = {
                date: eventDate,
                status: 'scheduled',
                ...eventData // Override defaults with provided data
            };
            
            console.log('Creating new event:', newEventData);
            
            const { data, error } = await supabase
                .from('events')
                .insert(newEventData)
                .select();

            if (error) {
                console.error('Error creating event:', error);
                return false;
            }

            if (data && data[0]) {
                const newEventId = data[0].id;
                console.log(`Successfully created event ${newEventId}`);
                dispatch(setSelectedEventID(newEventId));
                
                // Create the event object for Redux with snake_case keys
                const eventForRedux = {
                    id: newEventId,
                    ...data[0] // Use the data directly from Supabase which is already in snake_case
                };
                
                // Add the new event to the Redux store
                dispatch(addEvent({ event: eventForRedux }));
                
                return newEventId;
            }
            return false;
        } catch (error) {
            console.error('Error in createEvent:', error);
            return false;
        }
    }

    // Update an existing event with provided data
    const updateEventInDB = async (eventId, eventData) => {
        try {
            if (!eventId || eventId === 'new') {
                console.error('Cannot update event: Invalid event ID');
                return false;
            }
            
            console.log(`Updating event ${eventId} with:`, eventData);
            
            const { error } = await supabase
                .from('events')
                .update(eventData)
                .eq('id', eventId);

            if (error) {
                console.error('Error updating event:', error);
                return false;
            }

            console.log(`Successfully updated event ${eventId}`);
            
            // Update the specific event in the Redux store using the same data
            // No need to transform field names since we're using snake_case consistently
            dispatch(updateEvent({ eventId, updatedData: eventData }));
            
            return true;
        } catch (error) {
            console.error('Error in updateEventInDB:', error);
            return false;
        }
    }

    // Handle contact ID changes
    const handleContactIDChanged = async (contactId) => {
        console.log("event contact id changed: ", contactId)
        // If there is an event id update the event
        if (selectedEventID && selectedEventID !== 'new') {
            // Update existing event with new contact ID
            await updateEventInDB(selectedEventID, { contact_id: contactId });
        } 
        // If not create the event with the contact id
        else {
            // Create new event with contact ID
            await createEvent({ contact_id: contactId });
        }
    }

    return (
        <>
            <div className="content-area">
                <div className='panel-left'>
                    {/* Left side content */}
                    <div className="flex-column">
                        <ContactBox
                            contactID={eventData?.contact_id}
                            onContactIDChanged={handleContactIDChanged}
                        />
                    </div>
                </div>
                
                <div className='panel-right'>
                    {/* Right side content */}
                    <div className="flex-column"> 
                        <div className="row">
                            <InputSupabase
                                table="events"
                                column="date"
                                recordId={selectedEventID}
                                defaultValue={eventData?.date || new Date().toISOString().split('T')[0]}
                                type="date"
                                viewModeOverride={false}
                                // If the date is changed we reload events so they display in the proper day boxes
                                onSaved={data => {handleEventSaved(data); dispatch(reloadEvents())}}
                                onCreatedNew={handleEventCreated}
                                className="half-width"
                            />
                            <InputSupabase
                                table="events"
                                column="status"
                                recordId={selectedEventID}
                                defaultValue={eventData?.status || "scheduled"}
                                type="select"
                                options={Object.keys(eventStatusClasses)}
                                viewModeOverride={false}
                                onSaved={handleEventSaved}
                                onCreatedNew={handleEventCreated}
                                className="half-width"
                            />
                        </div>
                        <div className="row">
                            <InputSupabase
                                table="events"
                                column="title"
                                recordId={selectedEventID}
                                defaultValue={eventData?.title || ""}
                                type="text"
                                viewModeOverride={false}
                                onSaved={handleEventSaved}
                                onCreatedNew={handleEventCreated}
                                fullWidth={true}
                                placeholder="Event Title"
                                // showCopyButton
                            />
                        </div>
                        <div className="textarea-container textarea-container-event-window">
                            <InputSupabase
                                table="events"
                                column="note"
                                recordId={selectedEventID}
                                defaultValue={eventData?.note || ""}
                                type="textarea"
                                viewModeOverride={false}
                                onSaved={handleEventSaved}
                                onCreatedNew={handleEventCreated}
                                placeholder="Notes"
                            />
                        </div>
                        <div className="row">
                            <InputSupabase
                                table="events"
                                column="start_time"
                                recordId={selectedEventID}
                                defaultValue={eventData?.start_time || ""}
                                type="time"
                                viewModeOverride={false}
                                onSaved={handleEventSaved}
                                onCreatedNew={handleEventCreated}
                                placeholder="Start Time"
                            />
                            <InputSupabase
                                table="events"
                                column="end_time"
                                recordId={selectedEventID}
                                defaultValue={eventData?.end_time || ""}
                                type="time"
                                viewModeOverride={false}
                                onSaved={handleEventSaved}
                                onCreatedNew={handleEventCreated}
                                placeholder="End Time"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}