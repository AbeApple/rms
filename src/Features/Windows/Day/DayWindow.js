import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./DayWindow.css"
import { setSelectedDay } from '../../../Global/store'
import { setSelectedEventID, selectedEventDate, setSelectedEventDate } from '../../../Global/eventsSlice'
import { dateString } from '../../../Global/functions'
import EventDisplay from '../../Events/EventDisplay'
import Window from '../Window'
import InputSupabase from '../../../DB/Input/InputSupabase'
import { supabase } from '../../../DB/Supabase'
import SaveStatusIndicator from '../../../Components/SaveStatusIndicator'

export default function DayWindow() {

    const events = useSelector(state => state.events?.events)
    const selectedDay = useSelector(state => state.calendar.selectedDay)
    const userId = useSelector(state => state.auth?.userId)
    const [dayRecordId, setDayRecordId] = useState(null)
    const [dayNote, setDayNote] = useState("")
    const [isLoadingNote, setIsLoadingNote] = useState(false)
    const [isSavingNote, setIsSavingNote] = useState(false)
    const [noteError, setNoteError] = useState(null)
    const dispatch = useDispatch()

    // Load day's note for this user/date
    useEffect(() => {
        async function loadDay() {
            if (!userId || !selectedDay) {
                setDayRecordId(null)
                setDayNote("")
                setIsLoadingNote(false)
                return
            }
            setIsLoadingNote(true)
            setNoteError(null)
            try {
                const { data, error } = await supabase
                    .from('days')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('date', selectedDay)
                    .maybeSingle()

                if (error) {
                    throw error
                }

                if (data) {
                    setDayRecordId(data.id)
                    setDayNote(data.note || "")
                } else {
                    // no existing row
                    setDayRecordId(null)
                    setDayNote("")
                }
            } catch (err) {
                console.error('Error loading day note:', err)
                setDayRecordId(null)
                setDayNote("")
                setNoteError(err?.message || 'Failed to load')
            } finally {
                setIsLoadingNote(false)
            }
        }
        loadDay()
    }, [userId, selectedDay])

    if(!selectedDay)
        return(<></>)
    else
        return (
            <Window 
                onClose={() => dispatch(setSelectedDay())}
                className="dayWindow"
                title=" "
            >
                
                <div className="dayWindowContent">
                    <div className='dayWindowEvents'>
                        
                        <div className="dayWindowTop">
                            <input type="date" defaultValue={selectedDay}></input>
                            <div 
                                className='eventDisplay newEvent eventDisplayLarger'
                                onClick={() => {
                                    // Set the new event date first, then open the event window
                                    dispatch(setSelectedEventDate(selectedDay));
                                }}
                            >
                                + New Event
                            </div>
                        </div>
                       
                        {events && selectedDay && events[selectedDay] ? (
                            events[selectedDay].map(eventData => (
                                <EventDisplay 
                                    key={eventData.id} 
                                    eventData={eventData}
                                    inDayWindow
                                />
                            ))
                        ) : (
                            <div className="no-events">No events for this day</div>
                        )}
                    </div>
                    <div className='dayWindowLog' style={{ position: 'relative' }}>
                        <SaveStatusIndicator loading={isLoadingNote} saving={isSavingNote} error={noteError} />
                        <InputSupabase
                            table="days"
                            column="note"
                            recordId={dayRecordId}
                            defaultValue={dayNote}
                            type="textarea"
                            viewModeOverride={false}
                            onSaveStart={() => { setIsSavingNote(true); setNoteError(null); }}
                            onSaved={(row) => { setIsSavingNote(false); if (row?.id) setDayRecordId(row.id); if (row?.note !== undefined) setDayNote(row.note || ""); }}
                            onError={(msg) => { setIsSavingNote(false); setNoteError(msg || 'Save failed'); }}
                            defaultStartData={{ user_id: userId, date: selectedDay }}
                            placeholder="Add notes for this day..."
                        />
                    </div>
                </div>
            </Window>
        )
}