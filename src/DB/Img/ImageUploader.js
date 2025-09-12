pimport { SupabaseClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import "./Supabase.css"
import { supabaseClient } from "./ClientSetup"
import ImageEditor from "./ImageEditor"
import editIcon from "../../../Images/editIconGold.png"

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
const ImageUploader = ({bucket = "user_images", table="contact", itemID, existingImagesArray, setDbStatusCallback = () => {}}) => {

    // The array of image date objects that contains the display url and other data
    // const [displayUrlArray, setDisplayUrlArray] = useState(JSON.parse(existingImages || "[]"))
    const [displayUrlArray, setDisplayUrlArray] = useState(existingImagesArray || [])
    // For cycling through the images
    const [displayUrlArrayIndex, setDisplayUrlArrayIndex] = useState(0)
    // Shows the current image in a large viewer
    const [showLargeImageDisplay, setShowLargeImageDisplay] = useState()
    const [showImageEditor, setShowImageEditor] = useState()
    // Text that displays at the bottom
    const [userMessage, setUserMessage] = useState("")

    useEffect(()=>{
        if(existingImagesArray && Array.isArray(existingImagesArray))
            setDisplayUrlArray(existingImagesArray)
    },[existingImagesArray])

    // #region Uploading

    // When images are dropped onto the box
    const handleDrop = async (event) => {
        
        event.preventDefault();

        // Can eventually make this create a new item when files are uploaded with no itemID, then will put that item id into a callback
        if(!itemID){
            console.log("Must have a valid item ID")
            setUserMessage("Must have a valid item ID to upload images.")
            return
        }
        
        const files = Array.from(event.dataTransfer.files);
        // console.log("1) files: ", files)

        // setDisplayUrlArray(files.map(file => {return {publicUrl: URL.createObjectURL(file)}}))
        
        try {

            // console.log("2) Uploading...")
            setUserMessage("Uploading...")
            setDbStatusCallback("Uploading")

            // Step 1: Upload files to Supabase
            const uploadedFilesData = await uploadFilesToSupabase(files);

            // console.log("6) uploadedFilesData (array) from uploadFilesToSupabase: ", uploadedFilesData)
            // console.log("Upload Complete. Saving...")
            setUserMessage("Upload Complete. Saving...")
            setDbStatusCallback("Saving")
            
            // Step 2: Update user's table with new file URLs and expiry dates
            let updatedImageUrls = await updateUserFilesInDB(uploadedFilesData);
      
            // console.log("Saved")
            setUserMessage("Saved")
            setDbStatusCallback("Saved")

            // Step 3: Update the local state to display the images
            // setDisplayUrlArray((prevList) => [...prevList, ...uploadedFilesData]);
            
            setDisplayUrlArray(updatedImageUrls);

            // Maybe set the image array, this should happen automatically though


          } catch (err) {
            console.error('Error uploading files:', err);
            setUserMessage("Error")
            setDbStatusCallback("Error")
          }


    };

    // If image table: There would be a function that adds these object to the image table and returns the new image IDs
    
    // Returns an array of promises for each upload that resolves to an array of image data objects ex[{publicUrl: "url", storageKey: "id", bucket: "bucket"}]
    const uploadFilesToSupabase = async (files) => {
        const uploadPromises = files.map(async (file) => {
            if(!file){
                console.log("No File")
                setUserMessage("Upload error: no file")
                return
            }

            // console.log("creating upload promise for file: ", file)

            // TODO need to remove the fingerprint to allow duplicate images
            const fileStorageResponse = await supabaseClient.storage
                .from(bucket)
                // .upsert(file?.name, file, { noFingerprint: true });
                // .upload(file?.name, file, { noFingerprint: true });
                .upload(file?.name, file, { upsert: true });
        
            // console.log("3) fileStorageResponse: ", fileStorageResponse)
            if (fileStorageResponse.error){
                console.log("fileStorageResponse.error", fileStorageResponse.error)
                setUserMessage("Error")
                return
            };
        
            // Docs were different for getting the url?
            const publicUrlResponse = await supabaseClient.storage
                .from(bucket)
                .getPublicUrl(fileStorageResponse?.data?.path);
            
            // console.log("4) publicUrlResponse: ",publicUrlResponse)


            // This is what will be stored in the contact data and used to display or delete the image
            const fileObject = {
                bucket: bucket, 
                publicUrl: publicUrlResponse?.data?.publicUrl,
                storageKey: fileStorageResponse?.data?.id,

            }

            // console.log("5) returning fileObject from uploadFilesToSupabase: ",fileObject)
            return fileObject
            // Idk why its in a object or why there is an expiry date
            //   return { url, expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }; // Example expiry date: 30 days from now
        });
      
        // Returning an array of promises so the await will wait for all of them
        return Promise.all(uploadPromises);
    };

    // Putting the urls in the proper table
    async function updateUserFilesInDB(newFilesDataArray){

        // Fetch the existing user data
        const existingDataResponse = await supabaseClient
            .from(table)
            .select('images')
            .eq('id', itemID)
            .single();
        
        if (existingDataResponse.error){
            console.log(existingDataResponse.error)
            setUserMessage("Error")
            return
        };

        // console.log("7) in updateUserFilesInDB existingDataResponse: ", existingDataResponse)

        let existingImageArray = existingDataResponse?.data?.images || []
        // console.log("8) existingImageArray: ", existingImageArray)
        
        // Append the new file data
        const updatedImagesArray = [...newFilesDataArray, ...existingImageArray];
        // const updatedImageUrls = [...newFilesDataArray];
        // console.log("9) updatedImageUrls (combined existing and updated): ", updatedImagesArray)

        
        // let stringifiedArray = JSON.stringify(updatedImageUrls)
        // console.log("10) stringifiedArray", stringifiedArray)

        // Update the user's table with the new file data
        const updateResponse = await supabaseClient
            .from(table)
            .update({ images: updatedImagesArray})
            .eq('id', itemID);
        
        if (updateResponse.error){
            console.log(updateResponse.error)
            setUserMessage("Error")
            return
        }

        // console.log("11) updateResponse", updateResponse)

        return updatedImagesArray

    };
    async function updateUserFilesInDBOld(newFilesDataArray){
        // Fetch the existing user data
        const existingDataResponse = await supabaseClient
            .from(table)
            .select('imageUrls')
            .eq('id', itemID)
            .single();
        
        if (existingDataResponse.error){
            console.log(existingDataResponse.error)
            setUserMessage("Error")
            return
        };

        // console.log("7) in updateUserFilesInDB existingDataResponse: ", existingDataResponse)

        let existingImageArray = JSON.parse(existingDataResponse?.data?.imageUrls || "[]")
        // console.log("8) existingImageArray: ", existingImageArray)
        
        // Append the new file data
        const updatedImageUrls = [...newFilesDataArray, ...existingImageArray];
        // const updatedImageUrls = [...newFilesDataArray];
        // console.log("9) updatedImageUrls (combined existing and updated): ", updatedImageUrls)

        
        let stringifiedArray = JSON.stringify(updatedImageUrls)
        // console.log("10) stringifiedArray", stringifiedArray)

        // Update the user's table with the new file data
        const updateResponse = await supabaseClient
            .from(table)
            .update({ imageUrls: stringifiedArray})
            .eq('id', itemID);
        
        if (updateResponse.error){
            console.log(updateResponse.error)
            setUserMessage("Error")
            return
        }

        // console.log("11) updateResponse", updateResponse)

        return updatedImageUrls

    };

    // From the docs, to upload one file
    async function uploadFile(file) {
        const { data, error } = await SupabaseClient.storage.from('bucket_name').upload('file_path', file, { noFingerprint: true })
        if (error) {
          // Handle error
        } else {
          // Handle success
        }
    }

        /*

        start: AB
        add BC
            get data(AB)
        add CD
            get data (AB)
        
        set to ABBC
        set to ABCD (BC is overwritten)

        so need to have a flag so thihgs can only be uploaded when three is not already an upload in progress
        
        should also have a check to make sure things are not saving when closing the window
            could have a confirmation box saying that is still updating are you sure you want to close the menu?

        this can be added after along with the create new from upload callback call

        The bucket and object key is needed to delete the image

    */

    // #endregion Uploading

    // #region Display and helper functions

    // For the next and previous buttons
    function updateDisplayUrlIndex(amount){
        let newIndex = (displayUrlArrayIndex + amount) % displayUrlArray.length
        if(newIndex < 0)
            newIndex = displayUrlArray.length - 1

        setDisplayUrlArrayIndex(newIndex)

        // If there are no images newIndex will be NaN 
        if(!Number.isNaN(newIndex))
            setUserMessage((newIndex + 1) +" of "+ (displayUrlArray.length))
        else
            setUserMessage("No images to show")
    }
    
    // So the escape button closes the large image viewer
    useEffect(()=>{
        function keyPressListener(e){
            if(e.key === "Escape")
                setShowLargeImageDisplay(false)
        }
        window.addEventListener("keydown", keyPressListener)
        return ()=> window.removeEventListener("keydown", keyPressListener)
    },[])

    // #endregion Display and helper functions


    return (
        <>
            <div className="imageUploaderSB" onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={()=>setShowLargeImageDisplay(true)}>
                <div className="imageArrow imageArrowLeft " title="Previous Image" onClick={(e)=>{e.stopPropagation(); updateDisplayUrlIndex(-1);}}>{"<"}</div>
                <img src={displayUrlArray && displayUrlArray[displayUrlArrayIndex]?.publicUrl} style={{objectFit: "cover"}}></img>
                <div className="imageArrow imageArrowRight " title="Next Image" onClick={(e)=>{e.stopPropagation(); updateDisplayUrlIndex(1)}}>{">"}</div>
                <div className="imageBottomInfo">
                    {userMessage}
                    <div  
                        title={"Edit Images"}
                        // onClick={(e)=>{console.log(existingImagesArray); e.stopPropagation()}} 
                        onClick={(e)=>{setShowImageEditor(true); e.stopPropagation()}} 
                        style={{position: "absolute", right: "5px", bottom: "5px", cursor: "pointer", height: "20px", width: "20px"}}
                    >
                        <img src={editIcon}></img>    
                    </div>
                </div>
            </div>
            {showLargeImageDisplay && 
                <div 
                    style={{
                        position: "fixed", 
                        height: "calc(100vh - 250px)", 
                        width: "calc(100vw - 10px)", 
                        left: "5px", 
                        top: "0px", 
                        backgroundColor: "rgba(224, 201, 234, 0.5)", 
                        borderRadius: "5px", 
                        zIndex: "10"
                    }}>
                    <div className="closeButton" onClick={()=>setShowLargeImageDisplay(false)}>x</div>
                    <div className="imageArrow imageArrowLeft " title="Previous Image"  onClick={(e)=>{e.stopPropagation(); updateDisplayUrlIndex(-1);}}>{"<"}</div>
                    <img src={displayUrlArray[displayUrlArrayIndex]?.publicUrl} style={{objectFit: "contain"}}></img>
                    <div className="imageArrow imageArrowRight " title="Next Image" onClick={(e)=>{e.stopPropagation(); updateDisplayUrlIndex(1)}}>{">"}</div>
                    <div className="imageBottomInfo">{userMessage}</div>
                </div>
            }
            {showImageEditor && 
                <ImageEditor 
                    imageObjectsArray={existingImagesArray}
                    table="contact"
                    itemID={itemID}
                    close={()=>setShowImageEditor(false)} 
                    imageClickCallback={(imageIndex, imgeObject)=>{setShowLargeImageDisplay(true); setDisplayUrlArrayIndex(imageIndex);}}
                    setUserMessageCallback={setUserMessage}
                    setDbStatusCallback={setDbStatusCallback}
                ></ImageEditor>
            }
        </>
    )

}

export default ImageUploader