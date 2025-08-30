import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./EventWindow.css"
import { setSelectedEventID } from '../../Global/eventsSlice'
import Window from './Window'

export default function EventWindow() {
    
    const dispatch = useDispatch()
    const selectedEventID = useSelector(state => state.events?.selectedEventID)
    const [eventData, setEventData] = useState()
    const [contactData, setContactData] = useState()

    // When the event id changes load the event data
    useEffect(()=>{
        loadEventDate()
    },[selectedEventID])

    // when the event data loads load the contact data
    useEffect(()=>{
        loadContactData()
    },[eventData])

    function loadEventDate(){
        setEventData({
            name: null,
            date: "",
            time: "",
            contactID: null,
            note: "",
            
        })
    }
    function loadContactData(){
        setContactData({
            name: null,
            contactID: null,
            note: "",

        })
    }

    if(!selectedEventID)
        return(<></>)

    return (
        <Window 
            onClose={() => dispatch(setSelectedEventID())}
            className="eventWindow"
        >
            <div>Event Menu</div>
            {eventData?.title}        
        </Window>
    )
}