import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./EventWindow.css"
import { setSelectedEventID, updateEvent, addEvent, reloadEvents, upsertEvent } from '../../../Global/eventsSlice'
import Window from '../Window'
import ContactBox from '../../Contacts/ContactBox'
import { eventStatusClasses } from '../../Events/EventsLoader'
import InputSupabase from '../../../DB/Input/InputSupabase'
import { supabase } from '../../../DB/Supabase'

/*
    TODO:
    Tehre is a bug where if user puts in a title and then a note 
    faster than the title save creates a new record
    It creats a rerocd for thte title and a seperate one for the note
    would need to put creating ref in this component, 
    then have inputsupabase react to it, not creating while already crating
    this is implemented locally inthe inputsupabase but not from parent component

    would put creatinRef in this component
    then could send in the ref to be used to prevent double saves, and also updated in the input supabase 

*/
async function updateEventDb(eventData){
    if(!eventData.id){
        console.log("updateEventDb no event id")
        return
    }
    const result = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventData?.id)
        .select();
    
    return result            
}

// This is a bunch of trash. need to restart. 
export default function EventBox() {
    
    const dispatch = useDispatch()
    const events = useSelector(state => state.events?.events)
    const selectedEventID = useSelector(state => state.events?.selectedEventID)
    const selectedEventDate = useSelector(state => state.events?.selectedEventDate)
    // Starting with the simple data in the global state (contact_id, title, date)
    const [eventData, setEventData] = useState(events && events[selectedEventDate] && events[selectedEventDate].find(event => event?.id === selectedEventID))
    const isCreatingRef = useRef()


    // State for tracking loading errors
    const [loadError, setLoadError] = useState(null);

    // When the event id changes load the event data
    useEffect(()=>{

        loadEventData()

    },[selectedEventID])

    async function loadEventData() {
        console.log("Loading event data");

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
    
    function handleEventSaved(newData){
        // Combine existing data with new data
        let combinedData = {...eventData, ...newData}
        
        if(!selectedEventID || selectedEventID === "new")
            dispatch(setSelectedEventID(combinedData.id))

        // If there is no date add it
        if(!combinedData.date){
            combinedData.date = selectedEventDate

            // Call update event db funci=ton to add date to db (need to create)
            let result = updateEventDb(combinedData)

        }

        // Update the global state for immeidate display without reload
        dispatch(upsertEvent(combinedData))

        // If the thing that was changed was the data we need to reload events so they all display in the proper day boxes
        if(newData.date){
            dispatch(reloadEvents())
        }
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

    // Handle contact ID changes
    const handleContactIDChanged = async (contactId) => {
        console.log("event contact id changed: ", contactId)
        // If there is an event id update the event
        if (selectedEventID && selectedEventID !== 'new') {
            let newEventData = { id: selectedEventID, contact_id: contactId }
            console.log("updated event ", newEventData)
            // Update existing event with new contact ID
            await updateEventDb(newEventData);
            dispatch(upsertEvent(newEventData))
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
                                onSaved={handleEventSaved}
                                className="half-width"
                                isCreatingRef={isCreatingRef}
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
                                className="half-width"
                                isCreatingRef={isCreatingRef}
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
                                fullWidth={true}
                                placeholder="Event Title"
                                isCreatingRef={isCreatingRef}
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
                                placeholder="Notes"
                                isCreatingRef={isCreatingRef}
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
                                placeholder="Start Time"
                                isCreatingRef={isCreatingRef}
                            />
                            <InputSupabase
                                table="events"
                                column="end_time"
                                recordId={selectedEventID}
                                defaultValue={eventData?.end_time || ""}
                                type="time"
                                viewModeOverride={false}
                                onSaved={handleEventSaved}
                                placeholder="End Time"
                                isCreatingRef={isCreatingRef}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}