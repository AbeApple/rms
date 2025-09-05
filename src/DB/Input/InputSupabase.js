import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../Supabase.js'
import "./InputSupabase.css"
import InputCopy from '../../Components/InputCopy.js'
/**
 * InputSupabase Component
 * 
 * A generic component for displaying and editing data in Supabase tables
 * Handles both view and edit modes with automatic saving
 * 
 * @param {string} props.table - Database table name
 * @param {string} props.column - Database column name
 * @param {string} props.recordId - Record ID in the database (or 'new' for new records)
 * @param {string} props.defaultValue - Initial value to display
 * @param {string} props.type - Input type (text, textarea, select, etc.)
 * @param {string} props.label - Label for the input field
 * @param {boolean} props.fullWidth - If true, the input will take full width
 * @param {Array} props.options - Options for select inputs
 * @param {boolean} props.viewModeOverride - If true, displays in view-only mode
 * @param {Function} props.onUpdate - Optional callback when value is updated
 */
export default function InputSupabase(props) {

  const {  
    table,
    column,
    recordId,
    defaultValue,
    type = 'text',
    label,
    fullWidth,
    options,
    viewModeOverride,
    onSaveStart = ()=>{},
    // sends back (new value, id, column name)
    onSaved = ()=>{},
    // sends back (new value, new id, column name)
    onCreatedNew = ()=>{},
    showCopyButton,
    placeholder,
    ...otherProps
  } = props

  // After this amount of inactivity after an input the input will save
  const timeout = 500 // ms
  const inputTimeout = useRef()
  
  // Current value state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Changes from an input to a display
  const [viewMode, setViewMode] = useState(true)
  
  // The parent component can set the view mode if the prop changes
  useEffect(() => {
    setViewMode(viewModeOverride)
  }, [viewModeOverride])

  // Saves the data after a delay
  function inputUpdated(value) {
    
    // Clear the timeout so it only saves once after the timeout interval
    clearTimeout(inputTimeout.current)

    // After the timeout interval save the value to the database
    inputTimeout.current = setTimeout(() => {
      saveToDb(value)
    }, timeout)
  }

  /**
   * Save data to Supabase database
   * @param {any} value - Value to save
   */
  async function saveToDb(value) {
    
    // Tells the parent component a save to db call has started
    onSaveStart()
    
    // Check to ensure proper table and column
    if (!table || !column) {
      console.error('Missing table or column for database operation')
      return
    }
    
    setIsSaving(true)
    setSaveError(null)
    
    try {
      // Format special kvalues if needed
      let formattedValue = value;
      
      // Handle boolean values (convert "true"/"false" strings to actual booleans)
      if (value === "true" || value === "false") {
        formattedValue = value === "true";
      }
      
      // Handle numeric values
      if (!isNaN(value) && value !== "") {
        formattedValue = Number(value);
      }
      
      let result;
      
      // Check if this is a new record or an existing one
      if (recordId === 'new' || !recordId) {
        
        result = await supabase
          .from(table)
          .insert({ [column]: formattedValue })
          .select()
        
        // If successful and we have data, call the callback with the new ID and column name
        if (!result.error && result.data && result.data.length > 0) {
          console.log(`Successfully created new ${table} record with ID: ${result.data[0].id}`)
          onCreatedNew(formattedValue, result.data[0].id, column)
        }
      } else {
        // Update existing record
        console.log(`Updating ${table} record ${recordId}, setting ${column} = ${formattedValue}`)
        
        result = await supabase
          .from(table)
          .update({ [column]: formattedValue })
          .eq('id', recordId)
          .select()
        
        // If successful, call the callback with the new value, record ID, and column name
        if (!result.error) {
          console.log(`Successfully updated ${table} record ${recordId}`)
          onSaved(formattedValue, recordId, column)
        }
      }
      
      // Handle errors
      if (result.error) {
        console.error('Error in database operation:', result.error)
        setSaveError(result.error.message)
      }
    } catch (error) {
      console.error('Error in saveToDb:', error)
      setSaveError(error.message)
    } finally {
      setIsSaving(false)
    }
  }
  
  /**
   * Toggle between view and edit modes
   */
  function toggleEditMode() {
    setViewMode(!viewMode)
  }

  // No need for a separate render function

  // Simplest possible rendering
  if (viewMode) {
    return <span>{defaultValue || ''}</span>
  }
  
  // For edit mode, return the appropriate input directly
  return (
    <>
      {label && <span>{label + ': '}</span>}
      {type === 'textarea' && (
        <textarea 
          className={fullWidth ? 'full-width' : ''}
          placeholder={placeholder || column}
          onChange={(e) => inputUpdated(e.target.value)}
          defaultValue={defaultValue}
        />
      )}
      {type === 'select' && (
        <select 
          className={props.className}
          onChange={(e) => inputUpdated(e.target.value)}
          defaultValue={defaultValue}
        >
          {options?.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      )}
      {type !== 'textarea' && type !== 'select' && (
        <InputCopy 
          {...otherProps} 
          className={fullWidth ? 'full-width' : props.className || 'half-width'}
          showCopyButton={showCopyButton}
          onChange={(e) => inputUpdated(e.target.value)}
          defaultValue={defaultValue}
          placeholder={placeholder || column}
        />
      )}
      {saveError && <small style={{ color: 'red' }}>{saveError}</small>}
    </>
  )
}