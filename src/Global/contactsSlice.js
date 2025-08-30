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
    }
  },
});

// Export actions
export const { 
  setSelectedContactID,
  setContacts
} = contactsSlice.actions;

// Export reducer
export default contactsSlice.reducer;
