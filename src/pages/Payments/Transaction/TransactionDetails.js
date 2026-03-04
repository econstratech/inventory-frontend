import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../../auth/Auth';
import { Tooltip } from 'antd';
import { Collapse, Modal } from 'react-bootstrap';
import CloseTransactionModal from '../../CommonComponent/CloseTransactionModal';

function TransactionDetails() {
    const navigate = useNavigate();
    const { getGeneralSettingssymbol } = UserAuth();
    // textarea
    const textareaRef = useRef(null);
    const [letterCount, setLetterCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const MAX_LETTER_COUNT = 200;

    const handleInputTextarea = () => {
        const textarea = textareaRef.current;
        // Adjust height for auto-resizing
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;

        // Count letters (excluding spaces)
        const letters = textarea.value.replace(/\s+/g, '');
        const count = letters.length;
        setLetterCount(count);

        // Check if the count exceeds the limit
        if (count > MAX_LETTER_COUNT) {
            setErrorMessage('Message too long');
        } else {
            setErrorMessage('');
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, []);
    // textarea end
    // Attachments file start
    const [selectedAttachmentFileImages, setSelectedAttachmentFileImages] = useState([]);
    const [errorMessageVideoUpload, setErrorMessageVideoUpload] = useState('');

    const handleAttachmentFileChange = (event) => {
        const files = Array.from(event.target.files);

        // Check if any file is a video
        const invalidFiles = files.filter((file) => file.type.includes('video'));

        if (invalidFiles.length > 0) {
            setErrorMessageVideoUpload('Video files are not allowed.');
            return;
        }

        // Check if the total number of files exceeds the limit
        if (selectedAttachmentFileImages.length + files.length > 6) {
            setErrorMessageVideoUpload('You can upload a maximum of 6 files.');
            return;
        }

        setErrorMessageVideoUpload(''); // Clear any previous error
        setSelectedAttachmentFileImages([...selectedAttachmentFileImages, ...files]);
    };

    const handleAttachmentFileRemove = (index) => {
        const updatedImages = [...selectedAttachmentFileImages];
        updatedImages.splice(index, 1);
        setSelectedAttachmentFileImages(updatedImages);
    };

    const getFileIconClass = (file) => {
        const fileType = file.type || file.name.split('.').pop().toLowerCase();
        if (fileType.includes('image')) return 'fas fa-image';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
        if (fileType.includes('text')) return 'fas fa-file-alt';
        return 'fas fa-file'; // Default icon for unknown file types
    };

    // Attachments file end

    // Comment box show
    const [showCommentBox, setShowCommentBox] = useState(false);

    const toggleCommentBox = () => {
        setShowCommentBox((prevState) => !prevState); // Toggle the visibility
    };
    // Comment box show end

    // Collapse panel
    const [openCollapse, setOpenCollapse] = useState({
        panel1: false,
        panel2: false,
        panel3: false,
    });

    const toggleCollapse = (key) => {
        setOpenCollapse((prevState) => ({
            ...prevState,
            [key]: !prevState[key],
        }));
    };

    const handleShowCommentsChange = (e) => {
        const isChecked = e.target.checked;
        setOpenCollapse({
            panel1: isChecked,
            panel2: isChecked,
            panel3: isChecked,
        });
    };
    // Close Transaction Modal start
    const [showCloseTransactionModal, setShowCloseTransactionModal] = useState(false);
    const handleShowCloseTransactionModal = () => setShowCloseTransactionModal(true);
    const handleCloseCloseTransactionModal = () => setShowCloseTransactionModal(false);
    const handleSaveCloseTransaction = () => {
        // Add save logic here
        console.log('Transaction closed');
        setShowCloseTransactionModal(false);
    };

    return (
        <>
            <div className='p-4'>
                <div className='mb-3'>
                    <button
                        type="button"
                        className="link-btn text-dark me-3"
                        onClick={() => navigate(-1)} // Navigate back in history
                    >
                        <i className="fas fa-arrow-left" />
                        <span className='ms-2'>Back</span>
                    </button>
                </div>
                <div className="card mb-0">
                    <div className='card-header bg-primary-dark d-flex align-items-center justify-content-between flex-wrap'>
                        <h5 className='card-title text-white'>Purchase Order for Aluminium Ingots (10 cm x 10 cm x 10 cm) (Dummy)</h5>
                        <div className='ms-auto'>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className='row'>
                            <div className='col-lg-4 col-md-6'>
                                <div className='mb-3'>
                                    <label className='col-form-label mb-0 pb-0'>Buyer</label>
                                    <p className='mb-0'>Weglot Manufacturing</p>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-6'>
                                <div className='mb-3'>
                                    <label className='col-form-label mb-0 pb-0'>Supplier</label>
                                    <p className='mb-0'>Surya Demo Supplier</p>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-6'>
                                <div className='mb-3'>
                                    <label className='col-form-label mb-0 pb-0'>Start Date</label>
                                    <p className='mb-0'>20/01/2025, 4:00 pm</p>
                                </div>
                            </div>
                            <div className='col-12'>
                                <div className='d-flex flex-wrap gap-2 justify-content-end mb-3'>
                                    <div className='badge badge-success'>Invoice : Invoice Created</div>
                                    <div className='badge badge-success'>Goods : Received</div>
                                </div>
                            </div>
                            <div className='col-12'>
                                <div className='p-3 border rounded-3 bg-light'>
                                    <h6>Transaction Timeline</h6>
                                    <div class="timelines">
                                        <div class="timelines-step">
                                            <div class="timelines-circle">
                                                <i class="fas fa-check"></i>
                                            </div>
                                            <h6>PO</h6>
                                            <p>20/01/2025</p>
                                        </div>

                                        <div class="timelines-step">
                                            <div class="timelines-circle">
                                                <i class="fas fa-check"></i>
                                            </div>
                                            <h6>Inward</h6>
                                            <p>20/01/2025</p>
                                        </div>

                                        <div class="timelines-step">
                                            <div class="timelines-circle">
                                                <i class="fas fa-check"></i>
                                            </div>
                                            <h6>Invoice</h6>
                                            <p>20/01/2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='d-flex flex-wrap gap-3 justify-content-end align-items-center my-3'>
                    <label className="custom-switch">
                        <span className="switch-name">Show all comments</span>
                        <input type="checkbox" onChange={handleShowCommentsChange} />
                        <div className="switch-slider switch-round" />
                    </label>
                    <div className="dropdown">
                        <button type='button' className="btn btn-primary dropdown-toggle" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                            Create Document
                        </button>
                        <ul className="dropdown-menu dropdown-min-width260 dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                            <li><Link to="/document/inward-document/create/id" role='button' className="dropdown-item">Inward Document</Link></li>
                            <li><Link to="/document/tax-invoice-document/create/id" role='button' className="dropdown-item">Tax Invoice</Link></li>
                            <li><Link to="/document/proforma-invoice-document/create/id" role='button' className="dropdown-item">Proforma Invoice</Link></li>
                            <li><Link to="/document/receipt-voucher-document/create/id" role='button' className="dropdown-item">Receipt Voucher</Link></li>
                            <li><Link to="/document/purchase-return-challan-document/create/id" role='button' className="dropdown-item">Delivery Challan (Purchase Return)</Link></li>
                        </ul>
                    </div>
                    <button type='button' className='btn btn-danger' onClick={handleShowCloseTransactionModal}>
                        Close/Cancel Transaction
                    </button>
                </div>

                <div className='card'>
                    <div className='card-body'>
                        <div className='d-flex flex-wrap justify-content-between gap-2 flex-row-reverse mb-2'>
                            <div className='ms-auto'>
                                <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                            </div>
                            <div className="profile-wrap me-auto flex-wrap">
                                <div className="exp-avtar bg-exp-purple">
                                    <span>VK</span>
                                </div>
                                <div className="ps-2 profile-name-wrap">
                                    <h5 className="profile-name">Vivek Kumar <span className='text-muted f-s-13'>(Weglot Manufacturing)</span></h5>
                                </div>
                            </div>
                        </div>
                        <div className='row g-2'>
                            <div className='col-lg-2 col-md-4 col-sm-12 col-12'>
                                <div className='text-center'>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        id="Layer_1"
                                        viewBox="0 0 24 24"
                                        data-name="Layer 1"
                                        width={50}
                                        height={50}
                                        fill="currentColor"
                                        className='transaction-icon-color'
                                    >
                                        <path d="m14 7v-6.54a6.977 6.977 0 0 1 2.465 1.59l3.484 3.486a6.954 6.954 0 0 1 1.591 2.464h-6.54a1 1 0 0 1 -1-1zm8 3.485v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515c.163 0 .324.013.485.024v6.976a3 3 0 0 0 3 3h6.976c.011.161.024.322.024.485zm-8 8.515a1 1 0 0 0 -1-1h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1zm3-4a1 1 0 0 0 -1-1h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 1-1z" />
                                    </svg>
                                </div>
                            </div>
                            <div className='col-lg-10 col-md-8 col-sm-12 col-12'>
                                <div className='row'>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Purchase Order</label>
                                            <p className='mb-0'><Link to='/payment/document/purchase-order/id'>PO00001</Link></p>
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Number of Items</label>
                                            <p className='mb-0'>2</p>
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Amount</label>
                                            <p className='mb-0'>{getGeneralSettingssymbol}2,200.00</p>
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Due Date</label>
                                            <p className='mb-0'>30/01/2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12'>
                                {/* collapse panel start */}
                                <div className='card border shadow-none'>
                                    <div className='card-header border-bottom-0 d-flex justify-content-between align-items-center comment-header-bg rounded-10'
                                        role="button"
                                        onClick={() => toggleCollapse('panel1')}
                                        aria-expanded={openCollapse['panel1']}
                                    >
                                        <h6 className='my-1 me-3 f-s-14 d-flex gap-2 align-items-center flex-wrap'>
                                            <div>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    id="Filled"
                                                    viewBox="0 0 24 24"
                                                    width={14}
                                                    height={14}
                                                    fill="currentColor"
                                                    className='me-2'
                                                >
                                                    <path d="M19.675,2.758A11.936,11.936,0,0,0,10.474.1,12,12,0,0,0,12.018,24H19a5.006,5.006,0,0,0,5-5V11.309l0-.063A12.044,12.044,0,0,0,19.675,2.758ZM8,7h4a1,1,0,0,1,0,2H8A1,1,0,0,1,8,7Zm8,10H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Zm0-4H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Z" />
                                                </svg>
                                                Comments : 2
                                            </div>
                                            <span>|</span>
                                            <div>
                                                Attachments : 1
                                            </div>
                                        </h6>
                                        <Tooltip title="Expand">
                                            <button className='link-btn ms-auto' >
                                                <i className="fas fa-sort"></i>
                                            </button>
                                        </Tooltip>
                                    </div>
                                    <Collapse in={openCollapse['panel1']}>
                                        <div className='card-body'>
                                            <div className='d-flex flex-wrap justify-content-between gap-1 flex-row-reverse mb-2'>
                                                <div className='ms-auto'>
                                                    <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                                                </div>
                                                <div className="profile-wrap me-auto flex-wrap">
                                                    <div className="exp-avtar bg-exp-green">
                                                        <span>SK</span>
                                                    </div>
                                                    <div className="ps-2 profile-name-wrap">
                                                        <h5 className="profile-name">Suresh Kumar</h5>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='ps-5 mb-2'>
                                                Maecenas nunc neque, lobortis non purus a, rutrum tempor dui. Vivamus varius turpis et placerat tempus. Nulla sed nisi imperdiet, malesuada arcu eu, hendrerit risus. Quisque a porta massa. Nulla facilisi. Vestibulum quis elit id dui porttitor sollicitudin at nec lectus. Ut scelerisque, felis nec tristique ullamcorper, purus diam interdum tortor, id ullamcorper magna nisl ac ipsum. Integer id sodales est. Ut eleifend molestie sollicitudin. Mauris porttitor quam sit amet posuere sodales. Morbi pellentesque eros sit amet tellus fermentum convallis. Cras dignissim erat id nunc congue, a tristique risus interdum. Etiam eget felis nec odio venenatis facilisis. Suspendisse iaculis diam ac ex suscipit aliquam. Sed ac erat ante.
                                            </div>
                                            <div className='bg-light ms-5 p-3 rounded-3'>
                                                <div className='comment_attachment_wrap'>
                                                    <div className='comment_attachment_item'>
                                                        <div>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                id="Layer_1"
                                                                data-name="Layer 1"
                                                                viewBox="0 0 24 24"
                                                                width={40}
                                                                height={40}
                                                                fill="currentColor"
                                                                className='attachment-icon'
                                                            >
                                                                <path d="m17.467.047c.329.58.533,1.24.533,1.953v8.376c0,1.167-.739,2.27-1.873,2.548-1.648.404-3.127-.841-3.127-2.423V3c0-.552.448-1,1-1s1,.448,1,1v7.5c0,.276.224.5.5.5s.5-.224.5-.5V2.089c0-.873-.512-1.717-1.344-1.984-1.38-.443-2.656.579-2.656,1.895v7c0,.552-.448,1-1,1s-1-.448-1-1V2c0-.732.212-1.409.556-2h-3.556C4.239,0,2,2.239,2,5v14c0,2.761,2.239,5,5,5h10c2.761,0,5-2.239,5-5V5c0-2.601-1.994-4.714-4.533-4.953ZM7,13h4c.552,0,1,.448,1,1s-.448,1-1,1h-4c-.552,0-1-.448-1-1s.448-1,1-1Zm10,6H7c-.552,0-1-.448-1-1s.448-1,1-1h10c.552,0,1,.448,1,1s-.448,1-1,1Z" />
                                                            </svg>
                                                        </div>
                                                        <Tooltip title="New-project-final-testing.png">
                                                            <p className="file-name text-truncate">New-project-final-testing.png</p>
                                                        </Tooltip>
                                                    </div>
                                                    <div className='comment_attachment_item'>
                                                        <div>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                id="Layer_1"
                                                                data-name="Layer 1"
                                                                viewBox="0 0 24 24"
                                                                width={40}
                                                                height={40}
                                                                fill="currentColor"
                                                                className='attachment-icon'
                                                            >
                                                                <path d="m17.467.047c.329.58.533,1.24.533,1.953v8.376c0,1.167-.739,2.27-1.873,2.548-1.648.404-3.127-.841-3.127-2.423V3c0-.552.448-1,1-1s1,.448,1,1v7.5c0,.276.224.5.5.5s.5-.224.5-.5V2.089c0-.873-.512-1.717-1.344-1.984-1.38-.443-2.656.579-2.656,1.895v7c0,.552-.448,1-1,1s-1-.448-1-1V2c0-.732.212-1.409.556-2h-3.556C4.239,0,2,2.239,2,5v14c0,2.761,2.239,5,5,5h10c2.761,0,5-2.239,5-5V5c0-2.601-1.994-4.714-4.533-4.953ZM7,13h4c.552,0,1,.448,1,1s-.448,1-1,1h-4c-.552,0-1-.448-1-1s.448-1,1-1Zm10,6H7c-.552,0-1-.448-1-1s.448-1,1-1h10c.552,0,1,.448,1,1s-.448,1-1,1Z" />
                                                            </svg>
                                                        </div>
                                                        <Tooltip title="New-project-final-testing.png">
                                                            <p className="file-name text-truncate">New-project-final-testing.png</p>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div className='d-flex flex-wrap justify-content-between gap-1 flex-row-reverse mb-2'>
                                                <div className='ms-auto'>
                                                    <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                                                </div>
                                                <div className="profile-wrap me-auto flex-wrap">
                                                    <div className="exp-avtar bg-exp-yellow">
                                                        <span>EJ</span>
                                                    </div>
                                                    <div className="ps-2 profile-name-wrap">
                                                        <h5 className="profile-name">Emily Johnson</h5>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='ps-5 mb-2'>
                                                Maecenas nunc neque, lobortis non purus a, rutrum tempor dui. Vivamus varius turpis et placerat tempus. Nulla sed nisi imperdiet, malesuada arcu eu, hendrerit risus. Quisque a porta massa. Nulla facilisi. Vestibulum quis elit id dui porttitor sollicitudin at nec lectus. Ut scelerisque, felis nec tristique ullamcorper, purus diam interdum tortor, id ullamcorper magna nisl ac ipsum. Integer id sodales est. Ut eleifend molestie sollicitudin. Mauris porttitor quam sit amet posuere sodales. Morbi pellentesque eros sit amet tellus fermentum convallis. Cras dignissim erat id nunc congue, a tristique risus interdum. Etiam eget felis nec odio venenatis facilisis. Suspendisse iaculis diam ac ex suscipit aliquam. Sed ac erat ante.
                                            </div>
                                            <hr />
                                            <div className='mt-3'>
                                                <button
                                                    type='button'
                                                    className='btn btn-primary btn-sm post_comment'
                                                    onClick={toggleCommentBox}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        id="Filled"
                                                        viewBox="0 0 24 24"
                                                        width={14}
                                                        height={14}
                                                        fill="currentColor"
                                                        className='me-1'
                                                    >
                                                        <path d="M20,0H4A4,4,0,0,0,0,4V16a4,4,0,0,0,4,4H6.9l4.451,3.763a1,1,0,0,0,1.292,0L17.1,20H20a4,4,0,0,0,4-4V4A4,4,0,0,0,20,0ZM7,5h5a1,1,0,0,1,0,2H7A1,1,0,0,1,7,5ZM17,15H7a1,1,0,0,1,0-2H17a1,1,0,0,1,0,2Zm0-4H7A1,1,0,0,1,7,9H17a1,1,0,0,1,0,2Z" />
                                                    </svg>
                                                    Post Comment
                                                </button>
                                                {showCommentBox && (
                                                    <div className='post_comment_box mt-3'>
                                                        <div className='mb-3'>
                                                            <textarea
                                                                ref={textareaRef}
                                                                className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                                                                placeholder='Click or Tap to enter something...'
                                                                rows={2}
                                                                onInput={handleInputTextarea}
                                                                style={{ overflow: 'hidden', resize: 'none' }}
                                                            ></textarea>
                                                            <p className='f-s-12 text-muted mb-0 text-end pe-3'>
                                                                {letterCount}/{MAX_LETTER_COUNT}
                                                            </p>
                                                            {errorMessage && (
                                                                <p className='text-danger f-s-12 text-end pe-3'>{errorMessage}</p>
                                                            )}
                                                        </div>
                                                        <div className='mb-3'>
                                                            {errorMessageVideoUpload && (
                                                                <div className="alert alert-danger" role="alert">
                                                                    {errorMessageVideoUpload}
                                                                </div>
                                                            )}
                                                            {selectedAttachmentFileImages.length === 0 ? (
                                                                <div className="nodata_button_wrap">
                                                                    <label className="text-muted mb-1">Upload files (Max: 6 Files X 5Mb)</label>
                                                                    <input type="file" className="form-control" onChange={handleAttachmentFileChange} multiple />
                                                                    <p className="f-s-12 fw-medium text-muted mb-0">
                                                                        <span className="text-danger me-2">*</span>Allowed file types: Image (e.g., PNG, JPG), PDF, DOC, XLS, TXT.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="upload-img-prev-wrap">
                                                                    {selectedAttachmentFileImages.map((file, index) => (
                                                                        <div className="img-prev-item position-relative" key={index}>
                                                                            <button
                                                                                type="button"
                                                                                className="link-btn position-absolute top-0 end-0 remove_image"
                                                                                onClick={() => handleAttachmentFileRemove(index)}
                                                                            >
                                                                                <i className="fas fa-minus-circle text-danger"></i>
                                                                            </button>
                                                                            <Tooltip title={file.name}>
                                                                                <div className="file_icon">
                                                                                    <i className={getFileIconClass(file)}></i>
                                                                                </div>
                                                                            </Tooltip>
                                                                            {/* <p className="file-name">{file.name}</p> */}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className='text-end'>
                                                            <button type='submit' className='btn btn-success'>
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>
                                {/* collapse panel end */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='card'>
                    <div className='card-body'>
                        <div className='d-flex flex-wrap justify-content-between gap-2 flex-row-reverse mb-2'>
                            <div className='ms-auto'>
                                <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                            </div>
                            <div className="profile-wrap me-auto flex-wrap">
                                <div className="exp-avtar bg-exp-purple">
                                    <span>VK</span>
                                </div>
                                <div className="ps-2 profile-name-wrap">
                                    <h5 className="profile-name">Vivek Kumar <span className='text-muted f-s-13'>(Weglot Manufacturing)</span></h5>
                                </div>
                            </div>
                        </div>
                        <div className='row g-2'>
                            <div className='col-lg-2 col-md-4 col-sm-12 col-12'>
                                <div className='text-center'>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        id="Layer_1"
                                        viewBox="0 0 24 24"
                                        data-name="Layer 1"
                                        width={50}
                                        height={50}
                                        fill="currentColor"
                                        className='transaction-icon-color'
                                    >
                                        <path d="m14 7v-6.54a6.977 6.977 0 0 1 2.465 1.59l3.484 3.486a6.954 6.954 0 0 1 1.591 2.464h-6.54a1 1 0 0 1 -1-1zm8 3.485v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515c.163 0 .324.013.485.024v6.976a3 3 0 0 0 3 3h6.976c.011.161.024.322.024.485zm-8 8.515a1 1 0 0 0 -1-1h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1zm3-4a1 1 0 0 0 -1-1h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 1-1z" />
                                    </svg>
                                </div>
                            </div>
                            <div className='col-lg-10 col-md-8 col-sm-12 col-12'>
                                <div className='row'>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Inward Document</label>
                                            <p className='mb-0'><Link to='/payment/document/inward-document/id'>WR00001</Link></p>
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Number of Items</label>
                                            <p className='mb-0'>2</p>
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Document Date</label>
                                            <p className='mb-0'>20/01/2025</p>
                                        </div>
                                    </div>
                                    <div className='col-12'>
                                        <div className='mb-3'>
                                            <Link to="/document/grn/create/id" role="button" className='btn btn-primary btn-sm'>Generate GRN</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12'>
                                <div className='card border shadow-none'>
                                    <div className='card-header border-bottom-0 d-flex justify-content-between align-items-center comment-header-bg rounded-10'
                                        role="button"
                                        onClick={() => toggleCollapse('panel2')}
                                        aria-expanded={openCollapse['panel2']}
                                    >
                                        <h6 className='my-1 me-3 f-s-14 d-flex gap-2 align-items-center flex-wrap'>
                                            <div>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    id="Filled"
                                                    viewBox="0 0 24 24"
                                                    width={14}
                                                    height={14}
                                                    fill="currentColor"
                                                    className='me-2'
                                                >
                                                    <path d="M19.675,2.758A11.936,11.936,0,0,0,10.474.1,12,12,0,0,0,12.018,24H19a5.006,5.006,0,0,0,5-5V11.309l0-.063A12.044,12.044,0,0,0,19.675,2.758ZM8,7h4a1,1,0,0,1,0,2H8A1,1,0,0,1,8,7Zm8,10H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Zm0-4H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Z" />
                                                </svg>
                                                Comments : 2
                                            </div>
                                            <span>|</span>
                                            <div>
                                                Attachments : 1
                                            </div>
                                        </h6>
                                        <Tooltip title="Expand">
                                            <button className='link-btn ms-auto' >
                                                <i className="fas fa-sort"></i>
                                            </button>
                                        </Tooltip>
                                    </div>
                                    <Collapse in={openCollapse['panel2']}>
                                        <div className='card-body'>
                                            <div className='d-flex flex-wrap justify-content-between gap-1 flex-row-reverse mb-2'>
                                                <div className='ms-auto'>
                                                    <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                                                </div>
                                                <div className="profile-wrap me-auto flex-wrap">
                                                    <div className="exp-avtar bg-exp-red">
                                                        <span>MB</span>
                                                    </div>
                                                    <div className="ps-2 profile-name-wrap">
                                                        <h5 className="profile-name">Michael Brown</h5>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='ps-5 mb-2'>
                                                Maecenas nunc neque, lobortis non purus a, rutrum tempor dui. Vivamus varius turpis et placerat tempus. Nulla sed nisi imperdiet, malesuada arcu eu, hendrerit risus. Quisque a porta massa. Nulla facilisi. Vestibulum quis elit id dui porttitor sollicitudin at nec lectus. Ut scelerisque, felis nec tristique ullamcorper, purus diam interdum tortor, id ullamcorper magna nisl ac ipsum. Integer id sodales est. Ut eleifend molestie sollicitudin. Mauris porttitor quam sit amet posuere sodales. Morbi pellentesque eros sit amet tellus fermentum convallis. Cras dignissim erat id nunc congue, a tristique risus interdum. Etiam eget felis nec odio venenatis facilisis. Suspendisse iaculis diam ac ex suscipit aliquam. Sed ac erat ante.
                                            </div>
                                            <div className='bg-light ms-5 p-3 rounded-3'>
                                                <div className='comment_attachment_wrap'>
                                                    <div className='comment_attachment_item'>
                                                        <div>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                id="Layer_1"
                                                                data-name="Layer 1"
                                                                viewBox="0 0 24 24"
                                                                width={40}
                                                                height={40}
                                                                fill="currentColor"
                                                                className='attachment-icon'
                                                            >
                                                                <path d="m17.467.047c.329.58.533,1.24.533,1.953v8.376c0,1.167-.739,2.27-1.873,2.548-1.648.404-3.127-.841-3.127-2.423V3c0-.552.448-1,1-1s1,.448,1,1v7.5c0,.276.224.5.5.5s.5-.224.5-.5V2.089c0-.873-.512-1.717-1.344-1.984-1.38-.443-2.656.579-2.656,1.895v7c0,.552-.448,1-1,1s-1-.448-1-1V2c0-.732.212-1.409.556-2h-3.556C4.239,0,2,2.239,2,5v14c0,2.761,2.239,5,5,5h10c2.761,0,5-2.239,5-5V5c0-2.601-1.994-4.714-4.533-4.953ZM7,13h4c.552,0,1,.448,1,1s-.448,1-1,1h-4c-.552,0-1-.448-1-1s.448-1,1-1Zm10,6H7c-.552,0-1-.448-1-1s.448-1,1-1h10c.552,0,1,.448,1,1s-.448,1-1,1Z" />
                                                            </svg>
                                                        </div>
                                                        <Tooltip title="New-project-final-testing.png">
                                                            <p className="file-name text-truncate">New-project-final-testing.png</p>
                                                        </Tooltip>
                                                    </div>
                                                    <div className='comment_attachment_item'>
                                                        <div>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                id="Layer_1"
                                                                data-name="Layer 1"
                                                                viewBox="0 0 24 24"
                                                                width={40}
                                                                height={40}
                                                                fill="currentColor"
                                                                className='attachment-icon'
                                                            >
                                                                <path d="m17.467.047c.329.58.533,1.24.533,1.953v8.376c0,1.167-.739,2.27-1.873,2.548-1.648.404-3.127-.841-3.127-2.423V3c0-.552.448-1,1-1s1,.448,1,1v7.5c0,.276.224.5.5.5s.5-.224.5-.5V2.089c0-.873-.512-1.717-1.344-1.984-1.38-.443-2.656.579-2.656,1.895v7c0,.552-.448,1-1,1s-1-.448-1-1V2c0-.732.212-1.409.556-2h-3.556C4.239,0,2,2.239,2,5v14c0,2.761,2.239,5,5,5h10c2.761,0,5-2.239,5-5V5c0-2.601-1.994-4.714-4.533-4.953ZM7,13h4c.552,0,1,.448,1,1s-.448,1-1,1h-4c-.552,0-1-.448-1-1s.448-1,1-1Zm10,6H7c-.552,0-1-.448-1-1s.448-1,1-1h10c.552,0,1,.448,1,1s-.448,1-1,1Z" />
                                                            </svg>
                                                        </div>
                                                        <Tooltip title="New-project-final-testing.png">
                                                            <p className="file-name text-truncate">New-project-final-testing.png</p>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div className='d-flex flex-wrap justify-content-between gap-1 flex-row-reverse mb-2'>
                                                <div className='ms-auto'>
                                                    <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                                                </div>
                                                <div className="profile-wrap me-auto flex-wrap">
                                                    <div className="exp-avtar bg-exp-blue">
                                                        <span>JD</span>
                                                    </div>
                                                    <div className="ps-2 profile-name-wrap">
                                                        <h5 className="profile-name">Jessica Davis</h5>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='ps-5 mb-2'>
                                                Maecenas nunc neque, lobortis non purus a, rutrum tempor dui. Vivamus varius turpis et placerat tempus. Nulla sed nisi imperdiet, malesuada arcu eu, hendrerit risus. Quisque a porta massa. Nulla facilisi. Vestibulum quis elit id dui porttitor sollicitudin at nec lectus. Ut scelerisque, felis nec tristique ullamcorper, purus diam interdum tortor, id ullamcorper magna nisl ac ipsum. Integer id sodales est. Ut eleifend molestie sollicitudin. Mauris porttitor quam sit amet posuere sodales. Morbi pellentesque eros sit amet tellus fermentum convallis. Cras dignissim erat id nunc congue, a tristique risus interdum. Etiam eget felis nec odio venenatis facilisis. Suspendisse iaculis diam ac ex suscipit aliquam. Sed ac erat ante.
                                            </div>
                                            <hr />
                                            <div className='mt-3'>
                                                <button
                                                    type='button'
                                                    className='btn btn-primary btn-sm post_comment'
                                                    onClick={toggleCommentBox}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        id="Filled"
                                                        viewBox="0 0 24 24"
                                                        width={14}
                                                        height={14}
                                                        fill="currentColor"
                                                        className='me-1'
                                                    >
                                                        <path d="M20,0H4A4,4,0,0,0,0,4V16a4,4,0,0,0,4,4H6.9l4.451,3.763a1,1,0,0,0,1.292,0L17.1,20H20a4,4,0,0,0,4-4V4A4,4,0,0,0,20,0ZM7,5h5a1,1,0,0,1,0,2H7A1,1,0,0,1,7,5ZM17,15H7a1,1,0,0,1,0-2H17a1,1,0,0,1,0,2Zm0-4H7A1,1,0,0,1,7,9H17a1,1,0,0,1,0,2Z" />
                                                    </svg>
                                                    Post Comment
                                                </button>
                                                {showCommentBox && (
                                                    <div className='post_comment_box mt-3'>
                                                        <div className='mb-3'>
                                                            <textarea
                                                                ref={textareaRef}
                                                                className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                                                                placeholder='Click or Tap to enter something...'
                                                                rows={2}
                                                                onInput={handleInputTextarea}
                                                                style={{ overflow: 'hidden', resize: 'none' }}
                                                            ></textarea>
                                                            <p className='f-s-12 text-muted mb-0 text-end pe-3'>
                                                                {letterCount}/{MAX_LETTER_COUNT}
                                                            </p>
                                                            {errorMessage && (
                                                                <p className='text-danger f-s-12 text-end pe-3'>{errorMessage}</p>
                                                            )}
                                                        </div>
                                                        <div className='mb-3'>
                                                            {errorMessageVideoUpload && (
                                                                <div className="alert alert-danger" role="alert">
                                                                    {errorMessageVideoUpload}
                                                                </div>
                                                            )}
                                                            {selectedAttachmentFileImages.length === 0 ? (
                                                                <div className="nodata_button_wrap">
                                                                    <label className="text-muted mb-1">Upload files (Max: 6 Files X 5Mb)</label>
                                                                    <input type="file" className="form-control" onChange={handleAttachmentFileChange} multiple />
                                                                    <p className="f-s-12 fw-medium text-muted mb-0">
                                                                        <span className="text-danger me-2">*</span>Allowed file types: Image (e.g., PNG, JPG), PDF, DOC, XLS, TXT.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="upload-img-prev-wrap">
                                                                    {selectedAttachmentFileImages.map((file, index) => (
                                                                        <div className="img-prev-item position-relative" key={index}>
                                                                            <button
                                                                                type="button"
                                                                                className="link-btn position-absolute top-0 end-0 remove_image"
                                                                                onClick={() => handleAttachmentFileRemove(index)}
                                                                            >
                                                                                <i className="fas fa-minus-circle text-danger"></i>
                                                                            </button>
                                                                            <Tooltip title={file.name}>
                                                                                <div className="file_icon">
                                                                                    <i className={getFileIconClass(file)}></i>
                                                                                </div>
                                                                            </Tooltip>
                                                                            {/* <p className="file-name">{file.name}</p> */}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className='text-end'>
                                                            <button type='submit' className='btn btn-success'>
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                <div className='card'>
                    <div className='card-body'>
                        <div className='d-flex flex-wrap justify-content-between gap-2 flex-row-reverse mb-2'>
                            <div className='ms-auto'>
                                <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                            </div>
                            <div className="profile-wrap me-auto flex-wrap">
                                <div className="exp-avtar bg-exp-purple">
                                    <span>VK</span>
                                </div>
                                <div className="ps-2 profile-name-wrap">
                                    <h5 className="profile-name">Vivek Kumar <span className='text-muted f-s-13'>(Weglot Manufacturing)</span></h5>
                                </div>
                            </div>
                        </div>
                        <div className='row g-2'>
                            <div className='col-lg-2 col-md-4 col-sm-12 col-12'>
                                <div className='text-center'>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        id="Layer_1"
                                        viewBox="0 0 24 24"
                                        data-name="Layer 1"
                                        width={50}
                                        height={50}
                                        fill="currentColor"
                                        className='transaction-icon-color'
                                    >
                                        <path d="m14 7v-6.54a6.977 6.977 0 0 1 2.465 1.59l3.484 3.486a6.954 6.954 0 0 1 1.591 2.464h-6.54a1 1 0 0 1 -1-1zm8 3.485v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515c.163 0 .324.013.485.024v6.976a3 3 0 0 0 3 3h6.976c.011.161.024.322.024.485zm-8 8.515a1 1 0 0 0 -1-1h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1zm3-4a1 1 0 0 0 -1-1h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 1-1z" />
                                    </svg>
                                </div>
                            </div>
                            <div className='col-lg-10 col-md-8 col-sm-12 col-12'>
                                <div className='row'>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Invoice</label>
                                            <p className='mb-0'><Link to='/payment/document/tax-invoice/id'>INV00001</Link></p>
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Number of Items</label>
                                            <p className='mb-0'>2</p>
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Amount</label>
                                            <p className='mb-0'>{getGeneralSettingssymbol}3,200.00</p>
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-6'>
                                        <div className='mb-3'>
                                            <label className='col-form-label mb-0 pb-0'>Payment Date</label>
                                            <p className='mb-0'>20/01/2025</p>
                                        </div>
                                    </div>
                                    <div className='col-12'>
                                        <div className='mb-3'>
                                            <div>
                                                Payment Made: {getGeneralSettingssymbol}0.00
                                            </div>
                                            <div>
                                                Total Balance Amount: {getGeneralSettingssymbol}3,200.00
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12'>
                                {/* collapse start */}
                                <div className='card border shadow-none'>
                                    <div className='card-header border-bottom-0 d-flex justify-content-between align-items-center comment-header-bg rounded-10'
                                        role="button"
                                        onClick={() => toggleCollapse('panel3')}
                                        aria-expanded={openCollapse['panel3']}
                                    >
                                        <h6 className='my-1 me-3 f-s-14 d-flex gap-2 align-items-center flex-wrap'>
                                            <div>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    id="Filled"
                                                    viewBox="0 0 24 24"
                                                    width={14}
                                                    height={14}
                                                    fill="currentColor"
                                                    className='me-2'
                                                >
                                                    <path d="M19.675,2.758A11.936,11.936,0,0,0,10.474.1,12,12,0,0,0,12.018,24H19a5.006,5.006,0,0,0,5-5V11.309l0-.063A12.044,12.044,0,0,0,19.675,2.758ZM8,7h4a1,1,0,0,1,0,2H8A1,1,0,0,1,8,7Zm8,10H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Zm0-4H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Z" />
                                                </svg>
                                                Comments : 2
                                            </div>
                                            <span>|</span>
                                            <div>
                                                Attachments : 1
                                            </div>
                                        </h6>
                                        <Tooltip title="Expand">
                                            <button className='link-btn ms-auto' >
                                                <i className="fas fa-sort"></i>
                                            </button>
                                        </Tooltip>
                                    </div>
                                    <Collapse in={openCollapse['panel3']}>
                                        <div className='card-body'>
                                            <div className='d-flex flex-wrap justify-content-between gap-1 flex-row-reverse mb-2'>
                                                <div className='ms-auto'>
                                                    <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                                                </div>
                                                <div className="profile-wrap me-auto flex-wrap">
                                                    <div className="exp-avtar bg-exp-blue-1">
                                                        <span>SM</span>
                                                    </div>
                                                    <div className="ps-2 profile-name-wrap">
                                                        <h5 className="profile-name">Sarah Martinez</h5>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='ps-5 mb-2'>
                                                Maecenas nunc neque, lobortis non purus a, rutrum tempor dui. Vivamus varius turpis et placerat tempus. Nulla sed nisi imperdiet, malesuada arcu eu, hendrerit risus. Quisque a porta massa. Nulla facilisi. Vestibulum quis elit id dui porttitor sollicitudin at nec lectus. Ut scelerisque, felis nec tristique ullamcorper, purus diam interdum tortor, id ullamcorper magna nisl ac ipsum. Integer id sodales est. Ut eleifend molestie sollicitudin. Mauris porttitor quam sit amet posuere sodales. Morbi pellentesque eros sit amet tellus fermentum convallis. Cras dignissim erat id nunc congue, a tristique risus interdum. Etiam eget felis nec odio venenatis facilisis. Suspendisse iaculis diam ac ex suscipit aliquam. Sed ac erat ante.
                                            </div>
                                            <div className='bg-light ms-5 p-3 rounded-3'>
                                                <div className='comment_attachment_wrap'>
                                                    <div className='comment_attachment_item'>
                                                        <div>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                id="Layer_1"
                                                                data-name="Layer 1"
                                                                viewBox="0 0 24 24"
                                                                width={40}
                                                                height={40}
                                                                fill="currentColor"
                                                                className='attachment-icon'
                                                            >
                                                                <path d="m17.467.047c.329.58.533,1.24.533,1.953v8.376c0,1.167-.739,2.27-1.873,2.548-1.648.404-3.127-.841-3.127-2.423V3c0-.552.448-1,1-1s1,.448,1,1v7.5c0,.276.224.5.5.5s.5-.224.5-.5V2.089c0-.873-.512-1.717-1.344-1.984-1.38-.443-2.656.579-2.656,1.895v7c0,.552-.448,1-1,1s-1-.448-1-1V2c0-.732.212-1.409.556-2h-3.556C4.239,0,2,2.239,2,5v14c0,2.761,2.239,5,5,5h10c2.761,0,5-2.239,5-5V5c0-2.601-1.994-4.714-4.533-4.953ZM7,13h4c.552,0,1,.448,1,1s-.448,1-1,1h-4c-.552,0-1-.448-1-1s.448-1,1-1Zm10,6H7c-.552,0-1-.448-1-1s.448-1,1-1h10c.552,0,1,.448,1,1s-.448,1-1,1Z" />
                                                            </svg>
                                                        </div>
                                                        <Tooltip title="New-project-final-testing.png">
                                                            <p className="file-name text-truncate">New-project-final-testing.png</p>
                                                        </Tooltip>
                                                    </div>
                                                    <div className='comment_attachment_item'>
                                                        <div>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                id="Layer_1"
                                                                data-name="Layer 1"
                                                                viewBox="0 0 24 24"
                                                                width={40}
                                                                height={40}
                                                                fill="currentColor"
                                                                className='attachment-icon'
                                                            >
                                                                <path d="m17.467.047c.329.58.533,1.24.533,1.953v8.376c0,1.167-.739,2.27-1.873,2.548-1.648.404-3.127-.841-3.127-2.423V3c0-.552.448-1,1-1s1,.448,1,1v7.5c0,.276.224.5.5.5s.5-.224.5-.5V2.089c0-.873-.512-1.717-1.344-1.984-1.38-.443-2.656.579-2.656,1.895v7c0,.552-.448,1-1,1s-1-.448-1-1V2c0-.732.212-1.409.556-2h-3.556C4.239,0,2,2.239,2,5v14c0,2.761,2.239,5,5,5h10c2.761,0,5-2.239,5-5V5c0-2.601-1.994-4.714-4.533-4.953ZM7,13h4c.552,0,1,.448,1,1s-.448,1-1,1h-4c-.552,0-1-.448-1-1s.448-1,1-1Zm10,6H7c-.552,0-1-.448-1-1s.448-1,1-1h10c.552,0,1,.448,1,1s-.448,1-1,1Z" />
                                                            </svg>
                                                        </div>
                                                        <Tooltip title="New-project-final-testing.png">
                                                            <p className="file-name text-truncate">New-project-final-testing.png</p>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div className='d-flex flex-wrap justify-content-between gap-1 flex-row-reverse mb-2'>
                                                <div className='ms-auto'>
                                                    <p class="mb-0 text-end fw-medium">20/01/2025, 4:00 pm</p>
                                                </div>
                                                <div className="profile-wrap me-auto flex-wrap">
                                                    <div className="exp-avtar bg-exp-yellow">
                                                        <span>DA</span>
                                                    </div>
                                                    <div className="ps-2 profile-name-wrap">
                                                        <h5 className="profile-name">David Anderson</h5>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='ps-5 mb-2'>
                                                Maecenas nunc neque, lobortis non purus a, rutrum tempor dui. Vivamus varius turpis et placerat tempus. Nulla sed nisi imperdiet, malesuada arcu eu, hendrerit risus. Quisque a porta massa. Nulla facilisi. Vestibulum quis elit id dui porttitor sollicitudin at nec lectus. Ut scelerisque, felis nec tristique ullamcorper, purus diam interdum tortor, id ullamcorper magna nisl ac ipsum. Integer id sodales est. Ut eleifend molestie sollicitudin. Mauris porttitor quam sit amet posuere sodales. Morbi pellentesque eros sit amet tellus fermentum convallis. Cras dignissim erat id nunc congue, a tristique risus interdum. Etiam eget felis nec odio venenatis facilisis. Suspendisse iaculis diam ac ex suscipit aliquam. Sed ac erat ante.
                                            </div>
                                            <hr />
                                            <div className='mt-3'>
                                                <button
                                                    type='button'
                                                    className='btn btn-primary btn-sm post_comment'
                                                    onClick={toggleCommentBox}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        id="Filled"
                                                        viewBox="0 0 24 24"
                                                        width={14}
                                                        height={14}
                                                        fill="currentColor"
                                                        className='me-1'
                                                    >
                                                        <path d="M20,0H4A4,4,0,0,0,0,4V16a4,4,0,0,0,4,4H6.9l4.451,3.763a1,1,0,0,0,1.292,0L17.1,20H20a4,4,0,0,0,4-4V4A4,4,0,0,0,20,0ZM7,5h5a1,1,0,0,1,0,2H7A1,1,0,0,1,7,5ZM17,15H7a1,1,0,0,1,0-2H17a1,1,0,0,1,0,2Zm0-4H7A1,1,0,0,1,7,9H17a1,1,0,0,1,0,2Z" />
                                                    </svg>
                                                    Post Comment
                                                </button>
                                                {showCommentBox && (
                                                    <div className='post_comment_box mt-3'>
                                                        <div className='mb-3'>
                                                            <textarea
                                                                ref={textareaRef}
                                                                className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                                                                placeholder='Click or Tap to enter something...'
                                                                rows={2}
                                                                onInput={handleInputTextarea}
                                                                style={{ overflow: 'hidden', resize: 'none' }}
                                                            ></textarea>
                                                            <p className='f-s-12 text-muted mb-0 text-end pe-3'>
                                                                {letterCount}/{MAX_LETTER_COUNT}
                                                            </p>
                                                            {errorMessage && (
                                                                <p className='text-danger f-s-12 text-end pe-3'>{errorMessage}</p>
                                                            )}
                                                        </div>
                                                        <div className='mb-3'>
                                                            {errorMessageVideoUpload && (
                                                                <div className="alert alert-danger" role="alert">
                                                                    {errorMessageVideoUpload}
                                                                </div>
                                                            )}
                                                            {selectedAttachmentFileImages.length === 0 ? (
                                                                <div className="nodata_button_wrap">
                                                                    <label className="text-muted mb-1">Upload files (Max: 6 Files X 5Mb)</label>
                                                                    <input type="file" className="form-control" onChange={handleAttachmentFileChange} multiple />
                                                                    <p className="f-s-12 fw-medium text-muted mb-0">
                                                                        <span className="text-danger me-2">*</span>Allowed file types: Image (e.g., PNG, JPG), PDF, DOC, XLS, TXT.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="upload-img-prev-wrap">
                                                                    {selectedAttachmentFileImages.map((file, index) => (
                                                                        <div className="img-prev-item position-relative" key={index}>
                                                                            <button
                                                                                type="button"
                                                                                className="link-btn position-absolute top-0 end-0 remove_image"
                                                                                onClick={() => handleAttachmentFileRemove(index)}
                                                                            >
                                                                                <i className="fas fa-minus-circle text-danger"></i>
                                                                            </button>
                                                                            <Tooltip title={file.name}>
                                                                                <div className="file_icon">
                                                                                    <i className={getFileIconClass(file)}></i>
                                                                                </div>
                                                                            </Tooltip>
                                                                            {/* <p className="file-name">{file.name}</p> */}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className='text-end'>
                                                            <button type='submit' className='btn btn-success'>
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>
                                {/* collapse end */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Close Transaction Modal Start*/}
            <CloseTransactionModal
                show={showCloseTransactionModal}
                onClose={handleCloseCloseTransactionModal}
                onSave={handleSaveCloseTransaction}
            />
            {/* Close Transaction Modal end*/}
        </>
    )
}

export default TransactionDetails