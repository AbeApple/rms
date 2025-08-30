import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./EventWindow.css"
import { setSelectedEventID } from '../../Global/eventsSlice'
import Window from './Window'
import ContactBox from '../Contacts/ContactBox'

export default function EventWindow() {
    
    const dispatch = useDispatch()
    const selectedEventID = useSelector(state => state.events?.selectedEventID)
    const [eventData, setEventData] = useState()

    // When the event id changes load the event data
    useEffect(()=>{
        loadEventData()
    },[selectedEventID])

    function loadEventData(){
        // Get current date in YYYY-MM-DD format for default value
        const today = new Date().toISOString().split('T')[0];
        
        setEventData({
            title: "",
            date: today,
            startTime: "",
            endTime: "",
            contactID: null,
            note: "",
            status: "scheduled"
        })
    }

    if(!selectedEventID)
        return(<></>)

    return (
        <Window 
            onClose={() => dispatch(setSelectedEventID())}
            className="eventWindow"
        >
            <div className="eventWindowHeader">
                {/* <input type='date'></input> */}
            </div>
            
            <div className="eventWindowContent">
                <div className='eventWindowLeft'>
                    {/* Left side content */}
                    <div className="leftSideContent">
                        <ContactBox></ContactBox>
                    </div>
                </div>
                
                <div className='eventWindowRight'>
                    {/* Right side content */}
                    <div className="rightSideContent">
                        <div className="input-row">
                            <input type="date"></input>
                            <select>
                                <option>Status</option>
                                <option>Complete</option>
                                <option>Scheduled</option>
                                <option>Positive</option>
                                <option>Cancelled</option>
                            </select>
                        </div>
                        <div className="input-row">
                            <input placeholder="Event Title" className="full-width"></input>
                        </div>
                        <div className="textarea-container">
                            <textarea placeholder='Event Note'></textarea>
                        </div>
                        <div className="input-row">
                            <input type="time" placeholder='Start Time'></input>
                            <input type="time" placeholder='End Time'></input>
                        </div>
                    </div>
                </div>
            </div>
        </Window>
    )
}