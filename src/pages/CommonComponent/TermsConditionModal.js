import { Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const TermsConditionModal = ({
    show,
    handleClose,
    handleSave,
    selectedTermsConditionIndex = 1,
}) => {
    const [showAddTermsCondition, setShowAddTermsCondition] = useState(false);

    const handleAddNewTermsCondition = () => {
        setShowAddTermsCondition(!showAddTermsCondition);
    };

    const handleNewTermsConditionCancel = () => {
        setShowAddTermsCondition(false);
    };

    useEffect(() => {
        if (!show) {
            setShowAddTermsCondition(false); // Reset state when modal is closed
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

    const TermsCondition = [
        {
            TermsConditionType: "Payment Terms",
            TermsConditionDescription: "All invoices must be paid within 30 days from the date of issue.",
        },
        {
            TermsConditionType: "Delivery Terms",
            TermsConditionDescription: "Goods will be delivered within 7 business days after order confirmation.",
        },
        {
            TermsConditionType: "Cancellation Policy",
            TermsConditionDescription: "Orders canceled within 24 hours of confirmation will not incur any charges.",
        },
        {
            TermsConditionType: "Refund Policy",
            TermsConditionDescription: "Refunds will be processed within 15 business days upon approval of the request.",
        },
        {
            TermsConditionType: "Liability",
            TermsConditionDescription: "The company is not liable for damages caused by misuse of the product.",
        },
        {
            TermsConditionType: "Warranty",
            TermsConditionDescription: "Products come with a 1-year limited warranty against manufacturing defects.",
        },
        {
            TermsConditionType: "Confidentiality",
            TermsConditionDescription: "All information shared during the business relationship will remain confidential.",
        },
        {
            TermsConditionType: "Governing Law",
            TermsConditionDescription: "This agreement is governed by the laws of the State of California.",
        },
        {
            TermsConditionType: "Intellectual Property",
            TermsConditionDescription: "All intellectual property rights remain the sole property of the company.",
        },
        {
            TermsConditionType: "Force Majeure",
            TermsConditionDescription: "The company is not responsible for delays caused by natural disasters or unforeseen events.",
        },
    ];


    return (
        <form>
            <Modal
                id="TermsConditionDetailsModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Terms & Conditions</Modal.Title>
                </Modal.Header>
                <Modal.Body className='moday-body-overflow-none'>
                    <div className={`mb-3 text-end add_new_btn ${showAddTermsCondition ? 'd-none' : ''}`}>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleAddNewTermsCondition}
                        >
                            <i className="fas fa-plus me-2"></i>Add New Terms & Conditions
                        </button>
                    </div>
                    <div
                        className={`card shadow-none border add_new_wrap ${showAddTermsCondition ? '' : 'd-none'}`}
                    >
                        <div className='card-header gth-bg-blue-light'>
                            <h5 className='card-title'>Add New Terms & Conditions</h5>
                        </div>
                        <div className='card-body'>
                            <div className='row'>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Document Type
                                            <Tooltip title="Documents for which this T&C is applicable">
                                                <span className='text-primary ms-2'><i className="fas fa-info-circle"></i></span>
                                            </Tooltip>
                                        </label>
                                        <div className='custom-select-wrap'>
                                            <Select
                                                name="DocumentType"
                                                options={DocumentType}
                                                placeholder="Select..."
                                                onChange={handleChangeDocumentType}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>T&C heading <span className='text-danger'>*</span>
                                            <Tooltip title="This name will help you identify a specific T&C">
                                                <span className='text-primary ms-2'><i className="fas fa-info-circle"></i></span>
                                            </Tooltip>
                                        </label>
                                        <input type="text" placeholder="Enter T&C heading" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Description <span className='text-danger'>*</span>
                                            <Tooltip title="Detailed description which is printed in the document">
                                                <span className='text-primary ms-2'><i className="fas fa-info-circle"></i></span>
                                            </Tooltip>
                                        </label>
                                        <textarea
                                            ref={textareaRef}
                                            className='form-control'
                                            placeholder='Enter Description'
                                            rows={2}
                                            onInput={handleInput}
                                            style={{ overflow: 'hidden', resize: 'none' }}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className='d-flex justify-content-end gap-3'>
                                    <button
                                        type='submit'
                                        className='btn btn-secondary'
                                        onClick={handleNewTermsConditionCancel}
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
                        {TermsCondition.map((termsCondition, index) => (
                            <div
                                className={`location_items ${index === selectedTermsConditionIndex ? "selected" : ""
                                    }`}
                                key={index}
                            >
                                <div className="w-100">
                                    <p className="mb-0 f-s-12 gth-text-dark">
                                        <b>{termsCondition.TermsConditionType}</b>
                                    </p>
                                    <p className="mb-0 f-s-12 gth-text-dark two-line-clamp">{termsCondition.TermsConditionDescription}</p>
                                </div>
                                <button type="button" className="icon-btn" onClick={handleAddNewTermsCondition}>
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

export default TermsConditionModal;

