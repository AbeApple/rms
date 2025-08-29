import React from 'react'
import { useSelector } from 'react-redux'

export default function EventWindow() {
    
    const selectedEventID = useSelector(state => state.calendar.selectedEventID)
  
    return (
        <div className="window">
            
        </div>
    )
}