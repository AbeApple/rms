import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./EventWindow.css"
import { setSelectedEventDate, setSelectedEventID } from '../../../Global/eventsSlice'
import Window from '../Window'
import EventBox from './EventBox'


// This is a bunch of trash. need to restart. 
export default function EventWindow() {
    
    const dispatch = useDispatch()
    const selectedEventID = useSelector(state => state.events?.selectedEventID)
    const selectedEventDate = useSelector(state => state.events?.selectedEventDate)

    function closeWindow(){
        dispatch(setSelectedEventID())
        dispatch(setSelectedEventDate())
    }

    if(!selectedEventID && !selectedEventDate)
        return (<></>)

    return (

        <Window 
            onClose={closeWindow}
            className="eventWindow"
            title={`Event`}
        >
            <EventBox></EventBox>
           
        </Window>
    )
}