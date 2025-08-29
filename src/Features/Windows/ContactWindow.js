import React from 'react'
import { useSelector } from 'react-redux'

export default function ContactWindow() {
    
    const selectedContactID = useSelector(state => state.calendar.selectedContactID)
  
    return (
        <div className="window">
            
        </div>
    )
}