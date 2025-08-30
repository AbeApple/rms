import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./DayWindow.css"
import { setSelectedDay } from '../../Global/store'
import { setSelectedEventID } from '../../Global/eventsSlice'
import { dateString } from '../../Global/functions'
import EventDisplay from '../Events/EventDisplay'
import Window from './Window'

export default function DayWindow() {
    
    
    const events = useSelector(state => state.events?.events)
    const selectedDay = useSelector(state => state.calendar.selectedDay)
    const dispatch = useDispatch()

    if(!selectedDay)
        return(<></>)
    else
        return (
            <Window 
                onClose={() => dispatch(setSelectedDay())}
                className="dayWindow"
            >
                <div className="dayWindowHeader">
                    <input type="date" defaultValue={selectedDay}></input>
                </div>
                
                <div className="dayWindowContent">
                    <div className='dayWindowEvents'>
                        <div 
                            className='eventDisplay newEvent eventDisplayLarger'
                            onClick={() => dispatch(setSelectedEventID('new'))}
                        >
                            + New Event
                        </div>
                        {events && selectedDay && events[selectedDay] ? (
                            events[selectedDay].map(eventData => (
                                <EventDisplay 
                                    key={eventData.id} 
                                    eventData={eventData}
                                    className="eventDisplayLarger"
                                />
                            ))
                        ) : (
                            <div className="no-events">No events for this day</div>
                        )}
                    </div>
                    <div className='dayWindowLog'>
                        <textarea placeholder="Add notes for this day..."></textarea>
                    </div>
                </div>
            </Window>
        )
}