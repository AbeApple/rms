import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://jaigseevhheijmqjwdpw.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Check if the key is available
if (!supabaseKey) {
  console.error('REACT_APP_SUPABASE_KEY is not defined in environment variables!');
  console.error('Make sure your .env file is in the project root and contains REACT_APP_SUPABASE_KEY=your_key');
  console.error('Also ensure you have restarted your development server after adding the .env file');
}

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== Authentication Functions =====

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} - Supabase response
 */
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} - Supabase response
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
};

/**
 * Sign out the current user
 * @returns {Promise} - Supabase response
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

/**
 * Get the current user session
 * @returns {Promise} - Current session or null
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Error getting session:', error);
    return { session: null, error };
  }
};

/**
 * Get the current user
 * @returns {Promise} - Current user or null
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Error getting user:', error);
    return { user: null, error };
  }
};

// ===== Events Table Functions =====

/**
 * Get all events for a user
 * @param {string} userId - User ID
 * @returns {Promise} - Events array or error
 */
export const getEvents = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: [], error };
  }
};

/**
 * Get a specific event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise} - Event data or error
 */
export const getEventById = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    return { data: null, error };
  }
};

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise} - Created event or error
 */
export const createEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing event
 * @param {string} eventId - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise} - Updated event or error
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    return { data: null, error };
  }
};

/**
 * Delete an event
 * @param {string} eventId - Event ID
 * @returns {Promise} - Success status or error
 */
export const deleteEvent = async (eventId) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
    return { success: false, error };
  }
};

// ===== Contacts Table Functions =====

/**
 * Get all contacts for a user
 * @param {string} userId - User ID
 * @returns {Promise} - Contacts array or error
 */
export const getContacts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return { data: [], error };
  }
};

/**
 * Get a specific contact by ID
 * @param {string} contactId - Contact ID
 * @returns {Promise} - Contact data or error
 */
export const getContactById = async (contactId) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching contact with ID ${contactId}:`, error);
    return { data: null, error };
  }
};

/**
 * Create a new contact
 * @param {Object} contactData - Contact data
 * @returns {Promise} - Created contact or error
 */
export const createContact = async (contactData) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData])
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating contact:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing contact
 * @param {string} contactId - Contact ID
 * @param {Object} contactData - Updated contact data
 * @returns {Promise} - Updated contact or error
 */
export const updateContact = async (contactId, contactData) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update(contactData)
      .eq('id', contactId)
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error(`Error updating contact with ID ${contactId}:`, error);
    return { data: null, error };
  }
};

/**
 * Delete a contact
 * @param {string} contactId - Contact ID
 * @returns {Promise} - Success status or error
 */
export const deleteContact = async (contactId) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting contact with ID ${contactId}:`, error);
    return { success: false, error };
  }
};

// ===== Contact Dependencies Table Functions =====

/**
 * Get all dependencies for a contact
 * @param {string} contactId - Contact ID
 * @returns {Promise} - Dependencies array or error
 */
export const getContactDependencies = async (contactId) => {
  try {
    const { data, error } = await supabase
      .from('contact_dependencies')
      .select('*')
      .eq('contact_id', contactId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching dependencies for contact ID ${contactId}:`, error);
    return { data: [], error };
  }
};

/**
 * Create a new contact dependency
 * @param {Object} dependencyData - Dependency data
 * @returns {Promise} - Created dependency or error
 */
export const createContactDependency = async (dependencyData) => {
  try {
    const { data, error } = await supabase
      .from('contact_dependencies')
      .insert([dependencyData])
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating contact dependency:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing contact dependency
 * @param {string} dependencyId - Dependency ID
 * @param {Object} dependencyData - Updated dependency data
 * @returns {Promise} - Updated dependency or error
 */
export const updateContactDependency = async (dependencyId, dependencyData) => {
  try {
    const { data, error } = await supabase
      .from('contact_dependencies')
      .update(dependencyData)
      .eq('id', dependencyId)
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error(`Error updating dependency with ID ${dependencyId}:`, error);
    return { data: null, error };
  }
};

/**
 * Delete a contact dependency
 * @param {string} dependencyId - Dependency ID
 * @returns {Promise} - Success status or error
 */
export const deleteContactDependency = async (dependencyId) => {
  try {
    const { error } = await supabase
      .from('contact_dependencies')
      .delete()
      .eq('id', dependencyId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting dependency with ID ${dependencyId}:`, error);
    return { success: false, error };
  }
};

// ===== Images Table Functions =====

/**
 * Get all images for a user
 * @param {string} userId - User ID
 * @returns {Promise} - Images array or error
 */
export const getImages = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching images:', error);
    return { data: [], error };
  }
};

/**
 * Get a specific image by ID
 * @param {string} imageId - Image ID
 * @returns {Promise} - Image data or error
 */
export const getImageById = async (imageId) => {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching image with ID ${imageId}:`, error);
    return { data: null, error };
  }
};

/**
 * Upload an image to storage and create a record in the images table
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID
 * @param {Object} metadata - Additional metadata for the image
 * @returns {Promise} - Created image record or error
 */
export const uploadImage = async (file, userId, metadata = {}) => {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(filePath);
    
    // Create a record in the images table
    const imageData = {
      user_id: userId,
      url: publicUrl,
      file_path: filePath,
      file_name: fileName,
      file_type: file.type,
      file_size: file.size,
      ...metadata
    };
    
    const { data, error } = await supabase
      .from('images')
      .insert([imageData])
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { data: null, error };
  }
};

/**
 * Delete an image (both record and storage file)
 * @param {string} imageId - Image ID
 * @param {string} filePath - Path to file in storage
 * @returns {Promise} - Success status or error
 */
export const deleteImage = async (imageId, filePath) => {
  try {
    // Delete the file from storage
    const { error: storageError } = await supabase
      .storage
      .from('images')
      .remove([filePath]);
    
    if (storageError) throw storageError;
    
    // Delete the record from the images table
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting image with ID ${imageId}:`, error);
    return { success: false, error };
  }
};

// Export the supabase client for direct access if needed
export { supabase };