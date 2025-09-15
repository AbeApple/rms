import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./EventWindow.css"
import { setSelectedEventID, setSelectedEventDate, updateEvent, addEvent, removeEventById, upsertEvent, moveEventToDate } from '../../../Global/eventsSlice'
import ContactBox from '../../Contacts/ContactBox'
import { eventStatusClasses } from '../../Events/EventsLoader'
import InputSupabase from '../../../DB/Input/InputSupabase'
import { supabase } from '../../../DB/Supabase'
import SaveStatusIndicator from '../../../Components/SaveStatusIndicator'

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
    const userId = useSelector(state => state.auth?.userId)
    // Starting with the simple data in the global state (contact_id, title, date)
    const [eventData, setEventData] = useState(events && events[selectedEventDate] && events[selectedEventDate].find(event => event?.id === selectedEventID))
    const isCreatingRef = useRef()
    const savingAwaitingLoadRef = useRef(false)


    // State for tracking loading errors
    const [loadError, setLoadError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // When the event id changes load the event data
    useEffect(()=>{

        loadEventData()

    },[selectedEventID])

    // If we are awaiting a load after save (e.g., created new event), only turn off saving once loading completes
    useEffect(()=>{
        if(!isLoading && isSaving && savingAwaitingLoadRef.current){
            savingAwaitingLoadRef.current = false
            setIsSaving(false)
            setSaveError(null)
        }
    },[isLoading])

    async function loadEventData() {
        console.log("Loading event data");
        setIsLoading(true);
        setLoadError(null);

        // Get current date in YYYY-MM-DD format for default value
        const today = new Date().toISOString().split('T')[0];
        const eventDate = selectedEventDate || today;

        // If there is no event id or it's a placeholder 'new', just set the date and stop loading
        if(!selectedEventID || selectedEventID === 'new'){
            setEventData({
                date: eventDate,
            });
            setIsLoading(false);
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
            } finally {
                setIsLoading(false);
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

        // If the date changed, move the event between date buckets in Redux without full reload
        if(newData?.date && (newData.date !== eventData?.date)){
            dispatch(moveEventToDate({
                eventId: combinedData?.id,
                fromDate: eventData?.date || selectedEventDate,
                toDate: newData.date,
                updatedData: combinedData,
            }))
        }
    }

    // Delete the current event
    async function handleDeleteEvent(){
        try{
            if(!selectedEventID || selectedEventID === 'new') return
            const ok = window.confirm('Delete this event? This cannot be undone.')
            if(!ok) return
            setIsSaving(true)
            setSaveError(null)

            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', selectedEventID)

            if(error){
                console.error('Error deleting event:', error)
                setSaveError('Error deleting event')
            }else{
                // Remove from Redux without full reload and close window by clearing selection
                dispatch(removeEventById(selectedEventID))
                dispatch(setSelectedEventID(null))
                dispatch(setSelectedEventDate(null))
                // Also clear local state so the UI resets immediately
                setEventData({})
            }
        }catch(err){
            console.error('handleDeleteEvent exception:', err)
            setSaveError('Error deleting event')
        }finally{
            setIsSaving(false)
        }
    }

    // Remove the associated contact from the current event
    async function handleRemoveContact(){
        try{
            if(!selectedEventID || selectedEventID === 'new') return
            setIsSaving(true)
            setSaveError(null)

            const eventDate = eventData?.date || selectedEventDate
            const updatePayload = { id: selectedEventID, contact_id: null, date: eventDate }
            await updateEventDb(updatePayload)
            // Update redux so UI reflects immediately
            dispatch(upsertEvent(updatePayload))
            // Update local state so ContactBox receives null and clears immediately
            setEventData(prev => ({ ...(prev || {}), contact_id: null }))
        }catch(err){
            console.error('handleRemoveContact exception:', err)
            setSaveError('Error removing contact')
        }finally{
            setIsSaving(false)
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
                user_id: userId,
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
                    date: selectedEventDate,
                    user_id: userId,
                    ...data[0] // Use the data directly from Supabase which is already in snake_case
                };
                
                // Add the new event to the Redux store
                dispatch(upsertEvent(eventForRedux));
                
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
        try{
            setIsSaving(true)
            if (selectedEventID && selectedEventID !== 'new') {
                // If there is no contact and no event just return
                if(!contactId) {
                    console.log("no contactId or eventID returning")
                    setIsSaving(false)
                    return
                }
                const eventDate = eventData?.date || selectedEventDate;
                let newEventData = { id: selectedEventID, contact_id: contactId, date: eventDate }
                console.log("updated event ", newEventData)
                // Update existing event with new contact ID
                await updateEventDb(newEventData);
                dispatch(upsertEvent(newEventData))
            } 
            // If not create the event with the contact id
            else {
                // Create new event with contact ID
                // Creating a brand new event will trigger a data load; delay turning off saving until that finishes
                savingAwaitingLoadRef.current = true
                await createEvent({ contact_id: contactId });
            }
            // For update path, loading likely won't change, so clear saving immediately when not awaiting
            if(!savingAwaitingLoadRef.current){
                setIsSaving(false)
                setSaveError(null)
            }
        }catch(err){
            console.error('Error updating/creating event from contact change:', err)
            setIsSaving(false)
            setSaveError('Error saving event')
        }
    }

    return (
        <>
            <div className="content-area" style={{ position: 'relative' }}>
                <SaveStatusIndicator loading={isLoading} saving={isSaving} error={saveError || loadError} />
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
                                onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
                                onSaved={(data) => { setIsSaving(false); handleEventSaved(data); }}
                                onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
                                defaultStartData={{ user_id: userId, date: selectedEventDate }}
                                className="half-width"
                                isCreatingRef={isCreatingRef}
                            />
                            <InputSupabase
                                table="events"
                                column="status"
                                recordId={selectedEventID}
                                defaultValue={eventData?.status || "scheduled"}
                                type="select"
                                options={["Status", ...Object.keys(eventStatusClasses)]}
                                viewModeOverride={false}
                                onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
                                onSaved={(data) => { setIsSaving(false); handleEventSaved(data); }}
                                onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
                                defaultStartData={{ user_id: userId, date: selectedEventDate }}
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
                                onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
                                onSaved={(data) => { setIsSaving(false); handleEventSaved(data); }}
                                onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
                                defaultStartData={{ user_id: userId, date: selectedEventDate }}
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
                                onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
                                onSaved={(data) => { setIsSaving(false); handleEventSaved(data); }}
                                onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
                                defaultStartData={{ user_id: userId, date: selectedEventDate }}
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
                                onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
                                onSaved={(data) => { setIsSaving(false); handleEventSaved(data); }}
                                onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
                                defaultStartData={{ user_id: userId, date: selectedEventDate }}
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
                                onSaveStart={() => { setIsSaving(true); setSaveError(null); }}
                                onSaved={(data) => { setIsSaving(false); handleEventSaved(data); }}
                                onError={(msg) => { setIsSaving(false); setSaveError(msg); }}
                                defaultStartData={{ user_id: userId, date: selectedEventDate }}
                                placeholder="End Time"
                                isCreatingRef={isCreatingRef}
                            />
                        </div>
                        {/* Contact remove and Delete Event buttons */}
                        <div className="row" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <button
                                className="secondary-button"
                                onClick={handleRemoveContact}
                                disabled={!selectedEventID || selectedEventID === 'new' || isSaving}
                                title={!selectedEventID || selectedEventID === 'new' ? 'Save event before modifying' : 'Remove the linked contact from this event'}
                                style={{ flex: 1 }}
                            >
                                Remove Contact
                            </button>
                            <button
                                className="danger-button"
                                onClick={handleDeleteEvent}
                                disabled={!selectedEventID || selectedEventID === 'new' || isSaving}
                                title={!selectedEventID || selectedEventID === 'new' ? 'Save event before deleting' : 'Delete this event'}
                                style={{ flex: 1 }}
                            >
                                Delete Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}