import React from 'react'
import { useSelector } from 'react-redux'

export default function ConfirmationWindow({title, message, onConfirm, onCancel, confirmText = "Comfirm", cancelText = "Cancel"}) {
      
    return (
        <div className="window smallWindow">
            <div className='closeButton' onClick={onCancel}>x</div>
            <div>{title}</div>
            <div>{message}</div>
            <div onClick={onCancel}>{cancelText}</div>
            <div onClick={onConfirm}>{confirmText}</div>
        </div>
    )
}