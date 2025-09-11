import { createSlice } from '@reduxjs/toolkit';

// Contacts slice
const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    selectedContactID: null,
    contacts: {}  // Format: { contactID: contactObject }
  },
  reducers: {
    setSelectedContactID(state, action) {
      state.selectedContactID = action.payload;
    },
    setContacts(state, action) {
      console.log("contacts laoded: ", action.payload)
      state.contacts = action.payload;
    },
    // Action is the new contact data (including id)
    upsertContact(state, action) {
      const contact = action.payload;
      if (!contact?.id) return;
      
      // If contact exists, update it, otherwise add it
      state.contacts[contact.id] = {
        ...(state.contacts[contact.id] || {}), // Preserve existing data if any
        ...contact // Override with new data
      };
    }
    // TODO action to remove a contact in global state to keep this in sync with database without needing to reload
  },
});

// Export actions
export const { 
  setSelectedContactID,
  setContacts,
  upsertContact
} = contactsSlice.actions;

// Export reducer
export default contactsSlice.reducer;
