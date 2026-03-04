import { Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const BankDetailsModal = ({
    show,
    handleClose,
    handleSave,
    selectedBankDetailsIndex = 1,
}) => {
    const [showAddBankDetails, setShowAddBankDetails] = useState(false);

    const handleAddNewBankDetails = () => {
        setShowAddBankDetails(!showAddBankDetails);
    };

    const handleNewBankDetailsCancel = () => {
        setShowAddBankDetails(false);
    };

    useEffect(() => {
        if (!show) {
            setShowAddBankDetails(false); // Reset state when modal is closed
        }
    }, [show]);

    const DocumentType = [
        { value: 'Regular', label: 'Regular' },
        { value: 'Unregistered', label: 'Unregistered' },
        { value: 'Composition', label: 'Composition' },
        { value: 'Consumer', label: 'Consumer' },
        { value: 'Unknown', label: 'Unknown' },
    ];

    const handleChangeDocumentType = (selectedDocumentType) => {
        console.log('Selected ', selectedDocumentType);
    };

    const textareaRef = useRef(null);

    const handleInput = () => {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, []);

    const BankDetails = [
        {
            BankName: "XYZ Bank",
            BankBranch: "Mumbai",
        },
        {
            BankName: "ABC Bank",
            BankBranch: "Delhi",
        },
        {
            BankName: "PQR Bank",
            BankBranch: "Chennai",
        },
        {
            BankName: "DEF Bank",
            BankBranch: "Kolkata",
        },
        {
            BankName: "GHI Bank",
            BankBranch: "Bangalore",
        },
        {
            BankName: "LMN Bank",
            BankBranch: "Hyderabad",
        },
        {
            BankName: "OPQ Bank",
            BankBranch: "Ahmedabad",
        },
        {
            BankName: "RST Bank",
            BankBranch: "Pune",
        },
        {
            BankName: "UVW Bank",
            BankBranch: "Jaipur",
        },
        {
            BankName: "CDE Bank",
            BankBranch: "Lucknow",
        },
    ];


    return (
        <form>
            <Modal
                id="BankDetailsDetailsModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Bank Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='moday-body-overflow-none'>
                    <div className={`mb-3 text-end add_new_btn ${showAddBankDetails ? 'd-none' : ''}`}>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleAddNewBankDetails}
                        >
                            <i className="fas fa-plus me-2"></i>Add New Bank Details
                        </button>
                    </div>
                    <div
                        className={`card shadow-none border add_new_wrap ${showAddBankDetails ? '' : 'd-none'}`}
                    >
                        <div className='card-header gth-bg-blue-light'>
                            <h5 className='card-title d-flex align-items-center flex-wrap justify-content-between'>
                                Add New Bank Details
                                <div className='f-s-13 text-primary'>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 20"
                                        width={14}
                                        height={16}
                                        fill="currentColor"
                                        className='me-1'
                                    >
                                        <path
                                            d="M10.0833 10.4136L10.6083 12.6885C10.6917 13.0469 10.3 13.3302 9.98333 13.1386L8 11.9386L6.00833 13.1386C5.69167 13.3302 5.3 13.0469 5.38333 12.6885L5.91667 10.4219L4.16667 8.91355C3.88333 8.67188 4.03333 8.21355 4.4 8.18022L6.71667 7.98022L7.61667 5.84688C7.75833 5.50522 8.24167 5.50522 8.38333 5.84688L9.28333 7.97188L11.6 8.17188C11.9667 8.20522 12.1167 8.66355 11.8333 8.90522L10.0833 10.4136ZM1.49167 3.64688C0.891667 3.91355 0.5 4.51355 0.5 5.17189V9.08855C0.5 13.7136 3.7 18.0385 8 19.0886C12.3 18.0385 15.5 13.7136 15.5 9.08855V5.17189C15.5 4.51355 15.1083 3.91355 14.5083 3.64688L8.675 1.05522C8.24167 0.863552 7.75 0.863552 7.325 1.05522L1.49167 3.64688Z"

                                        />
                                    </svg>
                                    Encrypted Action
                                </div>
                            </h5>
                        </div>
                        <div className='card-body'>

                            <div className='row'>
                                <div className='col-lg-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Bank Name <span className='text-danger'>*</span>
                                        </label>
                                        <input type="text" placeholder="Enter Bank Name" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Account Name <span className='text-danger'>*</span>
                                        </label>
                                        <input type="text" placeholder="Enter Account Name" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Account Number <span className='text-danger'>*</span>
                                        </label>
                                        <input type="text" placeholder="Enter Account Number" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Branch <span className='text-danger'>*</span>
                                        </label>
                                        <input type="text" placeholder="Enter Branch" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>SWIFT Code
                                        </label>
                                        <input type="text" placeholder="Enter SWIFT Code" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>IFSC  <span className='text-danger'>*</span>
                                        </label>
                                        <input type="text" placeholder="Enter IFSC " className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>MICR
                                        </label>
                                        <input type="text" placeholder="Enter MICR" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Address
                                        </label>
                                        <input type="text" placeholder="Enter Address" className="form-control" />
                                    </div>
                                </div>                             

                                <div className='d-flex justify-content-end gap-3'>
                                    <button
                                        type='submit'
                                        className='btn btn-secondary'
                                        onClick={handleNewBankDetailsCancel}
                                    >Cancel</button>
                                    <button
                                        type='submit'
                                        className='btn btn-success'
                                    >Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="position-relative">
                        <input type="search" className="form-control pe-5" placeholder="Search..." />
                        <span className="search-icon">
                            <i className="fas fa-search text-primary"></i>
                        </span>
                        
                    </div>
                    <div className="location_wrap">
                        {BankDetails.map((BankDetails, index) => (
                            <div
                                className={`location_items ${index === selectedBankDetailsIndex ? "selected" : ""
                                    }`}
                                key={index}
                            >
                                <div className="w-100">
                                    <p className="mb-0 f-s-12 gth-text-dark">
                                        <b>{BankDetails.BankName}</b>
                                    </p>
                                    <p className="mb-0 f-s-12 gth-text-dark two-line-clamp"><b>Branch:</b> {BankDetails.BankBranch}</p>
                                </div>
                                <button type="button" className="icon-btn" onClick={handleAddNewBankDetails}>
                                    <i className="fas fa-pen"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </form>
    );
};

export default BankDetailsModal;

