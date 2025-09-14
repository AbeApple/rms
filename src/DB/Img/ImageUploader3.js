import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import "../Input/InputSupabase.css"
import { supabase } from "../Supabase"
import { setImagesWindowArray, setImagesWindowIndex, setSelectedEditImageArray } from "../../Global/store"
import "./ImageUploader2.css"

/*
    will be able to upload 1 or many files
    will put the files in the given bucket
    will show file upload progress and completion status for each file

    in the case of using it for adding contact images
    add each image display url and also delete url in an object in the contact data in a column in the contact table
    
    will have an edit button that shows all of the files in the array in a window
        the order can be changed with drag and drop
        any of them can be deleted

    if files are dragged onto the screen with files already there they will be uploaded

    if the image is clicked a full screen view of that image will be shown
        it will have arrows that can be clicked to show the other images in the array

    there will be arrows on the main display of the image that allows user to scroll through the images

*/
export default function ImageUploader3({bucket = "user_images", table="images", itemID, itemIdAttribute="contact_id", existingImagesArray, setDbStatusCallback = () => {}, afterUploadCallback, defaultImage, createNewCallback}) {

    const userId = useSelector(state => state.auth?.userId)
    const [imagesArray, setImagesArray] = useState([])
    const [displayIndex, setDisplayIndex] = useState(0)
    const [userMessage, setUserMessage] = useState(0)
    const dispatch = useDispatch()

    // Show an initial default image if there is one
    useEffect(()=>{
        if(defaultImage?.public_url && imagesArray.length === 0){
            console.log("abc")
            setImagesArray([defaultImage])
        }
    },[defaultImage])

    // Load the images that match the inputs
    useEffect(()=>{
        loadImages()
        async function loadImages(){
            const {data, error} = await supabase
            .from(table)
            .select('*')
            .eq("user_id", userId)
            .eq(itemIdAttribute, itemID)
            .order("index", {ascending: true})

            console.log("&&&&&&&&&loaded images data: ", data)

            if(error)
                setUserMessage(error)
            else
                setImagesArray(data)
        }

    },[table, userId, itemIdAttribute, itemID])

    async function handleDrop(event){
        event.preventDefault()

        // Capture files BEFORE any await to avoid SyntheticEvent pooling issues
        const files = Array.from(event?.dataTransfer?.files || [])
        console.log("files: ", files)
        if(!files.length){
            setUserMessage("No files detected")
            return
        }

        let itemIDLocal = itemID

        // Create an item id if there is none (ex: create a new contact to put the images in) 
        if(!itemIDLocal)
            if(createNewCallback)
                itemIDLocal = await createNewCallback()
            else{
                setUserMessage("Must have valid ID or createNewCallback")
                return
            } 

        // Call function to upload them in the database, get an array of objects with image data (id, public_url, etc)
        const imagesData = await uploadFilesToStorage(files)

        // Call function to upload images to table and get refreshed list
        const refreshedImages = await updateTable(imagesData, itemIDLocal)

        // Update local UI immediately
        if(Array.isArray(refreshedImages))
            setImagesArray(refreshedImages)
        console.log("refreshedImages: ", refreshedImages)

        // Call callback function if one is provided (include item id for consumers)
        if(afterUploadCallback && Array.isArray(refreshedImages))
            afterUploadCallback(refreshedImages, itemIDLocal)

    }

    // #region DB helpers

    async function uploadFilesToStorage(files){
        console.log("Uploading...")
        setUserMessage("Uploading...")

        const uploadPromises = files.map(async (file) => {
            if(!file){
                console.log("No File")
                setUserMessage("Upload error: no file")
                return
            }

            const fileStorageResponse = await supabase.storage
                .from(bucket)
                .upload(file?.name, file, { upsert: true });
        
            if (fileStorageResponse.error){
                console.log("fileStorageResponse.error", fileStorageResponse.error)
                setUserMessage("Error")
                return
            };
        
            const publicUrlResponse = await supabase.storage
                .from(bucket)
                .getPublicUrl(fileStorageResponse?.data?.path);
            
            // This is what will be stored in the contact data and used to display or delete the image
            const fileObject = {
                bucket: bucket, 
                public_url: publicUrlResponse?.data?.publicUrl,
                // Store storage path as the key so we can reference/delete later
                storage_key: fileStorageResponse?.data?.path,

            }

            return fileObject
        });
      
        // Returning an array of promises so the await will wait for all of them
        return Promise.all(uploadPromises);
    }
  
    // y item id local
    async function updateTable(newImagesData = [], itemIDLocal) {
        try {
            // Set initial user message
            setUserMessage("Saving...");
        
            // Validate inputs
            if (!Array.isArray(newImagesData) || newImagesData.length === 0) {
                setUserMessage("No new images to save.")
                return []
            }
        
            // Fetch existing images
            const existingImages = await fetchExistingImages(itemIDLocal)
            console.log("existingImages: ", existingImages)

            // Update existing images indicies
            const existingImagesShiftedIndicies = shiftIndicies(existingImages, newImagesData.length)
            console.log("existingImagesShiftedIndicies: ", existingImagesShiftedIndicies)

            // Update the db for those ones
            await upsertRows(existingImagesShiftedIndicies)

            // Add indicies, user_id, and other attribute to the newly uploaded image objects
            const newImagesWithIndex = addIndiciesAndData(newImagesData, itemIDLocal)
            console.log("newImagesWithIndex: ", newImagesWithIndex)
            
            // Insert the new ones
            await insertRows(newImagesWithIndex)
  
            // Fetch existing images (all columns for UI)
            const allImagesFetched = await fetchExistingImages(itemIDLocal)
            console.log("allImagesFetched: ", allImagesFetched)
        
          // Success
          setUserMessage("Saved");
          return allImagesFetched || []

        } catch (error) {
          console.error("Unexpected error:", error);
          setUserMessage("An unexpected error occurred.");
          return { success: false, error: error.message };
        }
    }

    async function fetchExistingImages(itemIDLocal){
    const { data: existing, error: existingFetchError } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .eq(itemIdAttribute, itemIDLocal)
    .order("index", { ascending: true })
    console.log("existing:", existing)

    if (existingFetchError) {
        console.error("existingFetchError:", existingFetchError)
        setUserMessage("Failed to retrieve existing images.")
        return
    }

    return existing
    }

    function shiftIndicies(array, shiftBy){
    return array.map((image) => ({
        id: image.id,
        index: image.index + shiftBy, // Shift existing indices
    }));
    }

    // Adds index values as well as user_id and itemIdAttribute
    function addIndiciesAndData(array, itemIDLocal){
        return array.map((image, index) => ({
                ...image,
                user_id: userId,
                [itemIdAttribute]: itemIDLocal,
                index: index, // New images get indices 0, 1, 2, ...
            }));
    }
    async function insertRows(rows){
         // Insert new images
         const { data: insertedImagesData, error: insertNewError } = await supabase
         .from(table)
         .insert(rows)
         .select("*");
         
         if (insertNewError) {
            console.error("Insert error:", insertNewError);
            setUserMessage("Failed to save new images.");
            return
          }

         return insertedImagesData
    }
    async function upsertRows(rows){
        // Perform upsert (insert new update existing)
        const { data, error: upsertError } = await supabase
        .from(table)
        .upsert(rows, { onConflict: "id" })
        .select("*")

        if(upsertError)
            console.error("upsertRows: ", upsertError)

        return data
    }


    // #endregion DB helpers

    // #region UI helpers

    function nextImage(e){
        e.stopPropagation()

        // Find the new index
        let newIndex = (displayIndex +1) % imagesArray.length
        // Set it 
        setDisplayIndex(newIndex)

        // Display user message for it
        setUserMessage((newIndex + 1) + " of " + imagesArray.length)
        
        console.log("nextImage")
        console.log(imagesArray)
        console.log(imagesArray[newIndex]?.public_url)
    }
    function lastImage(e){
        e.stopPropagation()
        
        // Find the new index
        let newIndex = displayIndex - 1
        if(newIndex < 0)
            newIndex = 0
        // Set it 
        setDisplayIndex(newIndex)
        // Display user message for it
        setUserMessage((newIndex + 1) + " of " + imagesArray.length)

        console.log("lastImage")
        console.log(imagesArray)
        console.log(imagesArray[newIndex]?.public_url)
    }

    // #endregion UI helpers


    return (
        <div className="imageUploaderSB" 
            onDrop={handleDrop}
            onDragOver={e=>e.preventDefault()} 
        >
            <>
                <div className="imageArrow imageArrowLeft" title="Previous Image" onClick={lastImage}>{"<"}</div>
                <img 
                    src={imagesArray[displayIndex]?.public_url} 
                    style={{objectFit: "cover"}} 
                />
                <div className="imageArrow imageArrowRight" title="Next Image" onClick={nextImage}>{">"}</div>
            </>
            <div className="imageBottomInfo">
                {userMessage}
                <div 
                    className="edit-button" 
                    title="Edit Images"
                    onClick={(e)=>{ e.stopPropagation(); dispatch(setSelectedEditImageArray(imagesArray)); }}
                >
                    ✎
                </div>
            </div>
        </div>
    )
}
