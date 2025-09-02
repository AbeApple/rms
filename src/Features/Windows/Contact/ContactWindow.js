import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './ContactWindow.css'
import Window from '../Window'
import { setSelectedContactID } from '../../../Global/contactsSlice'
import ContactBox from '../../Contacts/ContactBox'

export default function ContactWindow() {
    const dispatch = useDispatch()
    const selectedContactID = useSelector(state => state.contacts?.selectedContactID)
    
    // Don't render if no contact is selected
    if (!selectedContactID) {
        return null
    }
    
    return (
        <Window 
            onClose={() => dispatch(setSelectedContactID(null))}
            className="contactWindow"
            title=" "
        >
            <div>
                <ContactBox contactID={selectedContactID}></ContactBox>
            </div>
        </Window>
    )
}