// import React, { useState } from 'react';

// function ManageSignature() {
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [errorMessage, setErrorMessage] = useState('');

//     const handleManageSignatureChange = (event) => {
//         const file = event.target.files[0]; // Get the first selected file

//         if (!file) return; // If no file is selected, exit

//         // Validate file type
//         const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
//         if (!validImageTypes.includes(file.type)) {
//             setErrorMessage('Only image files (JPEG, PNG, GIF) are allowed.');
//             return;
//         }

//         // Validate file size (5MB max)
//         const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
//         if (file.size > maxFileSize) {
//             setErrorMessage('File size exceeds the 5MB limit.');
//             return;
//         }

//         // If validation passes, clear the error and set the file
//         setErrorMessage('');
//         setSelectedImage(file);
//     };

//     const handleImageRemove = () => {
//         setSelectedImage(null);
//         setErrorMessage(''); // Clear any error message
//     };

//     return (
//         <div className="card shadow-none border mb-0">
//             <div className="card-header gth-bg-blue-light">
//                 <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
//                     <h5 className="card-title f-s-16">Manage Signature</h5>
//                 </div>
//             </div>
//             <div className="card-body doc_body_height_155">
//                 {/* Show error message if exists */}
//                 {errorMessage && (
//                     <div className="alert alert-danger" role="alert">
//                         {errorMessage}
//                     </div>
//                 )}

//                 {/* File upload section */}
//                 {selectedImage === null ? (
//                     <div className="nodata_button_wrap">
//                         <label className="text-muted mb-1">Upload signature (Max file size 2Mb)</label>
//                         <input
//                             type="file"
//                             className="form-control"
//                             onChange={handleManageSignatureChange}
//                             accept="image/*" // Accept only image files
//                         />
//                     </div>
//                 ) : (
//                     <div className="upload-img-prev-wrap">
//                         <div className="img-prev-item signature_imag_wrap position-relative">
//                             <button
//                                 type="button"
//                                 className="link-btn position-absolute top-0 end-0 remove_image"
//                                 onClick={handleImageRemove}
//                             >
//                                 <i className="fas fa-minus-circle text-danger"></i>
//                             </button>
//                             {/* Show image preview */}
//                             <img
//                                 src={URL.createObjectURL(selectedImage)}
//                                 alt="preview"
//                                 className="img-fluid"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default ManageSignature;


import { Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

function ManageSignature() {
    const [file, setFile] = useState(null); // Single file state
    const [alert, setAlert] = useState('');
    const [preview, setPreview] = useState(null); // File preview (for images)

    const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/png': [],
            'image/jpeg': [],
            'image/jpg': [],
            'application/pdf': [],
        },
        maxFiles: 1, // Limit to 1 file
        onDrop: (acceptedFiles, rejectedFiles) => {
            if (rejectedFiles.length > 0) {
                setAlert('Only PNG, JPG, JPEG, or PDF files are allowed, and the file must not exceed 2MB.');
                return;
            }

            const selectedFile = acceptedFiles[0];

            if (selectedFile.size > maxFileSize) {
                setAlert('File size must not exceed 2MB.');
                return;
            }

            // Clear previous alert and set the file
            setAlert('');
            setFile(selectedFile);

            // Set preview if it's an image
            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile));
            } else {
                setPreview(null); // Clear preview for non-image files
            }
        },
    });

    const removeFile = () => {
        setFile(null);
        setPreview(null);
    };

    // Clean up the preview URL on component unmount
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <div className="card shadow-none border mb-0">
            <div className="card-header gth-bg-blue-light">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                    <h5 className="card-title f-s-16">Manage Signature</h5>
                </div>
            </div>
            <div className="card-body doc_body_height_155">
                {alert ? (
                    <div
                        className="gth-alert p-3 gth-bg-light-red rounded-3 mb-3 fade show d-flex justify-content-between"
                        role="alert"
                    >
                        <div>{alert}</div>
                        <button
                            type="button"
                            className="link-btn text-danger ms-auto"
                            onClick={() => setAlert('')}
                            aria-label="Close"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ) : (
                    <>
                        {!file ? (
                            <div className="drop_zone_outer_wrap">
                                <div
                                    {...getRootProps({ className: 'dropzone' })}
                                    className="drop_zone_file_area"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        id="Layer_1"
                                        data-name="Layer 1"
                                        viewBox="0 0 24 24"
                                        width={20}
                                        height={20}
                                        fill="currentColor"
                                        className="text-primary"
                                    >
                                        <path d="M17.974,7.146c-.331-.066-.602-.273-.742-.569-1.55-3.271-5.143-5.1-8.734-4.438-3.272,.6-5.837,3.212-6.384,6.501-.162,.971-.15,1.943,.033,2.89,.06,.309-.073,.653-.346,.901-1.145,1.041-1.801,2.524-1.801,4.07,0,3.032,2.467,5.5,5.5,5.5h11c4.136,0,7.5-3.364,7.5-7.5,0-3.565-2.534-6.658-6.026-7.354Zm-2.853,6.562c-.195,.195-.451,.293-.707,.293s-.512-.098-.707-.293l-1.707-1.707v5c0,.553-.448,1-1,1s-1-.447-1-1v-5l-1.707,1.707c-.391,.391-1.023,.391-1.414,0s-.391-1.023,0-1.414l2.707-2.707c.386-.386,.893-.58,1.4-.583l.014-.003,.014,.003c.508,.003,1.014,.197,1.4,.583l2.707,2.707c.391,.391,.391,1.023,0,1.414Z" />
                                    </svg>
                                    <input {...getInputProps()} />
                                    <p className="mb-0">Drag 'n' Drop files here, or click to select files</p>
                                    <p className="mb-0">Upload signature (Max file size 2MB)</p>
                                </div>
                                <p className="mb-0 text-muted">
                                    <span className="text-danger me-2">*</span>Allowed file types: PNG, JPG, JPEG, and PDF.
                                </p>
                            </div>
                        ) : (
                            <div className="upload-img-prev-wrap">
                                <div className="img-prev-item signature_imag_wrap position-relative">
                                    <button
                                        type="button"
                                        className="link-btn position-absolute top-0 end-0 remove_image"
                                        onClick={removeFile}
                                    >
                                        <i className="fas fa-minus-circle text-danger"></i>
                                    </button>
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="img-fluid" />
                                    ) : (
                                        <div className="file_icon">
                                            <i className="fas fa-file-pdf fa-2x text-danger"></i>
                                            <p className="mb-0">{file.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ManageSignature;