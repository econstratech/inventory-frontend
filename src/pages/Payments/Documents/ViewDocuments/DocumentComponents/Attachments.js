// import { Tooltip } from 'antd';
// import React, { useState } from 'react'

// function Attachments() {
//     // Attachments file start
//     const [selectedAttachmentFileImages, setSelectedAttachmentFileImages] = useState([]);
//     const [errorMessageVideoUpload, setErrorMessageVideoUpload] = useState('');

//     const handleAttachmentFileChange = (event) => {
//         const files = Array.from(event.target.files);

//         // Check if any file is a video
//         const invalidFiles = files.filter((file) => file.type.includes('video'));

//         if (invalidFiles.length > 0) {
//             setErrorMessageVideoUpload('Video files are not allowed.');
//             return;
//         }

//         // Check if the total number of files exceeds the limit
//         if (selectedAttachmentFileImages.length + files.length > 6) {
//             setErrorMessageVideoUpload('You can upload a maximum of 6 files.');
//             return;
//         }

//         setErrorMessageVideoUpload(''); // Clear any previous error
//         setSelectedAttachmentFileImages([...selectedAttachmentFileImages, ...files]);
//     };

//     const handleAttachmentFileRemove = (index) => {
//         const updatedImages = [...selectedAttachmentFileImages];
//         updatedImages.splice(index, 1);
//         setSelectedAttachmentFileImages(updatedImages);
//     };

//     const getFileIconClass = (file) => {
//         const fileType = file.type || file.name.split('.').pop().toLowerCase();
//         if (fileType.includes('image')) return 'fas fa-image';
//         if (fileType.includes('pdf')) return 'fas fa-file-pdf';
//         if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
//         if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
//         if (fileType.includes('text')) return 'fas fa-file-alt';
//         return 'fas fa-file'; // Default icon for unknown file types
//     };

//     // Attachments file end
//     return (
//         <>
//             <div className='card shadow-none border mb-0'>
//                 <div className='card-header gth-bg-blue-light'>
//                     <div className='d-flex flex-wrap gap-2 align-items-center'>
//                         <h5 className='card-title f-s-16'>Attachments</h5>
//                     </div>
//                 </div>
//                 <div className='card-body doc_body_height_155'>
//                     {errorMessageVideoUpload && (
//                         <div className="alert alert-danger" role="alert">
//                             {errorMessageVideoUpload}
//                         </div>
//                     )}
//                     {selectedAttachmentFileImages.length === 0 ? (
//                         <div className="nodata_button_wrap">
//                             <label className="text-muted mb-1">Upload files (Max: 6 Files X 5Mb)</label>
//                             <input type="file" className="form-control" onChange={handleAttachmentFileChange} multiple />
//                             <p className="f-s-12 fw-medium text-muted mb-0">
//                                 <span className="text-danger me-2">*</span>Allowed file types: Image (e.g., PNG, JPG), PDF, DOC, XLS, TXT.
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="upload-img-prev-wrap">
//                             {selectedAttachmentFileImages.map((file, index) => (
//                                 <div className="img-prev-item position-relative" key={index}>
//                                     <button
//                                         type="button"
//                                         className="link-btn position-absolute top-0 end-0 remove_image"
//                                         onClick={() => handleAttachmentFileRemove(index)}
//                                     >
//                                         <i className="fas fa-minus-circle text-danger"></i>
//                                     </button>
//                                     <Tooltip title={file.name}>
//                                         <div className="file_icon">
//                                             <i className={getFileIconClass(file)}></i>
//                                         </div>
//                                     </Tooltip>
//                                     {/* <p className="file-name">{file.name}</p> */}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </>
//     )
// }

// export default Attachments



import { Tooltip } from 'antd';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

function Attachments() {
    const [files, setFiles] = useState([]);
    const [alert, setAlert] = useState('');
    const maxFiles = 6;
    const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'application/vnd.ms-excel': ['.xls', '.xlsx'],
            'text/plain': ['.txt'],
        },
        onDrop: (acceptedFiles, rejectedFiles) => {
            let totalSize = files.reduce((acc, file) => acc + file.size, 0);
            totalSize += acceptedFiles.reduce((acc, file) => acc + file.size, 0);

            // Check for video files in rejected files
            const hasInvalidFile = rejectedFiles.some(
                (file) => file.file.type.startsWith('video')
            );

            if (hasInvalidFile) {
                setAlert('Video files are not allowed.');
                return;
            }

            if (files.length + acceptedFiles.length > maxFiles) {
                setAlert('You can only upload a maximum of 6 files.');
                return;
            }

            if (totalSize > maxFileSize) {
                setAlert('Total file size must not exceed 5MB.');
                return;
            }

            // If everything is valid, add files and clear the alert
            setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
            setAlert('');
        },
    });

    const getFileIconClass = (file) => {
        const fileType = file.type || file.name.split('.').pop().toLowerCase();
        if (fileType.includes('image')) return 'fas fa-image';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
        if (fileType.includes('text')) return 'fas fa-file-alt';
        return 'fas fa-file';
    };

    const removeFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };

    return (
        <>
            <div className="card shadow-none border mb-0">
                <div className="card-header gth-bg-blue-light">
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                        <h5 className="card-title f-s-16">Attachments</h5>
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
                            {files.length === 0 && (
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
                                        <p className="mb-0">Upload files (Max: 6 Files X 5Mb)</p>
                                    </div>
                                    <p className="mb-0 text-muted">
                                        <span className="text-danger me-2">*</span>Allowed file types: Image (e.g., PNG,
                                        JPG), PDF, DOC, XLS, TXT.
                                    </p>
                                </div>
                            )}
                            {files.length > 0 && (
                                <div className="upload-img-prev-wrap">
                                    {files.map((file) => (
                                        <div
                                            key={file.name}
                                            className="img-prev-item position-relative"
                                        >
                                            <button
                                                type="button"
                                                className="link-btn position-absolute top-0 end-0 remove_image"
                                                onClick={() => removeFile(file.name)}
                                            >
                                                <i className="fas fa-minus-circle text-danger"></i>
                                            </button>
                                            <Tooltip title={file.name}>
                                                <div className="file_icon">
                                                    <i className={getFileIconClass(file)}></i>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default Attachments;