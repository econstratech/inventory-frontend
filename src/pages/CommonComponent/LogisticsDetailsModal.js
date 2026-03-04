import { Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const LogisticsDetailsModal = ({
    show,
    handleClose,
    handleSave,
    selectedLogisticsIndex = 1,
}) => {
    const [showAddLogistics, setShowAddLogistics] = useState(false);

    const handleAddNewLogistics = () => {
        setShowAddLogistics(!showAddLogistics);
    };

    const handleNewLogisticsCancel = () => {
        setShowAddLogistics(false);
    };

    useEffect(() => {
        if (!show) {
            setShowAddLogistics(false); // Reset state when modal is closed
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

    const logistics = [
        {
            logisticsType: "Air",
            logisticsDescription: "Main Address, Mumbai (Maharashtra)",
        },
        {
            logisticsType: "By Road",
            logisticsDescription: "Secondary Address, Delhi (UP)",
        },
        {
            logisticsType: "Sea",
            logisticsDescription: "Via Chennai Port"
        },
        {
            logisticsType: "Rail",
            logisticsDescription: "Indian Railways"
        },
        {
            logisticsType: "Courier",
            logisticsDescription: "DHL Express"
        },
        {
            logisticsType: "Truck",
            logisticsDescription: "Private Truck"
        },
        {
            logisticsType: "Air Cargo",
            logisticsDescription: "Emirates Airlines"
        },
        {
            logisticsType: "Ship",
            logisticsDescription: "Container Ship"
        },
        {
            logisticsType: "Multimodal",
            logisticsDescription: "Air and Road"
        },
        {
            logisticsType: "Combined Transport",
            logisticsDescription: "Rail and Road"
        }
    ];

    return (
        <form>
            <Modal
                id="LogisticsDetailsModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Logistic Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='moday-body-overflow-none'>
                    <div className={`mb-3 text-end add_new_btn ${showAddLogistics ? 'd-none' : ''}`}>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleAddNewLogistics}
                        >
                            <i className="fas fa-plus me-2"></i>Add New Logistics
                        </button>
                    </div>
                    <div
                        className={`card shadow-none border add_new_wrap ${showAddLogistics ? '' : 'd-none'}`}
                    >
                        <div className='card-header gth-bg-blue-light'>
                            <h5 className='card-title'>Add New Logistic Details</h5>
                        </div>
                        <div className='card-body'>
                            <div className='row'>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Document Type
                                            <Tooltip title="Documents for which this logistic detail is applicable">
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
                                        <label className='form-label'>Logistic Type <span className='text-danger'>*</span>
                                            <Tooltip title="This name will help you identify a specific Logistic Type">
                                                <span className='text-primary ms-2'><i className="fas fa-info-circle"></i></span>
                                            </Tooltip>
                                        </label>
                                        <input type="text" placeholder="Enter Logistic Type" className="form-control" />
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
                                        onClick={handleNewLogisticsCancel}
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
                        {logistics.map((logistic, index) => (
                            <div
                                className={`location_items ${index === selectedLogisticsIndex ? "selected" : ""
                                    }`}
                                key={index}
                            >
                                <div className="w-100">
                                    <p className="mb-0 f-s-12 gth-text-dark">
                                        <b>{logistic.logisticsType}</b>
                                    </p>
                                    <p className="mb-0 f-s-12 gth-text-dark two-line-clamp">{logistic.logisticsDescription}</p>
                                </div>
                                <button type="button" className="icon-btn" onClick={handleAddNewLogistics}>
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

export default LogisticsDetailsModal;

