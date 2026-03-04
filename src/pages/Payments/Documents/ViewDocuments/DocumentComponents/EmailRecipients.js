import { DropDownList, MultiSelect } from '@progress/kendo-react-dropdowns';
import { Tooltip } from 'antd';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import EmailTemplateModal from '../../../../CommonComponent/EmailTemplateModal';

const recipientsName = [
    { value: 'John Doe', label: 'John Doe' },
    { value: 'Jane Smith', label: 'Jane Smith' },
    { value: 'David Lee', label: 'David Lee' },
    { value: 'Sarah Jones', label: 'Sarah Jones' },
    { value: 'Michael Brown', label: 'Michael Brown' },
    { value: 'Emily Davis', label: 'Emily Davis' },
    { value: 'Daniel Wilson', label: 'Daniel Wilson' },
    { value: 'Olivia Taylor', label: 'Olivia Taylor' },
    { value: 'James Clark', label: 'James Clark' },
    { value: 'Sophia Adams', label: 'Sophia Adams' }
];

function EmailRecipients() {
    const [selectedRecipientsNameValue, setSelectedRecipientsNameValue] = useState(null);
    const [selectedAdditionalUserValues, setSelectedAdditionalUserValues] = useState([]);
    const [showAdditionalUser, setShowAdditionalUser] = useState(false); // State to toggle visibility

    const handleRecipientsNameChange = (event) => {
        setSelectedRecipientsNameValue(event.target.value);
    };

    const handleAdditionalUserChange = (event) => {
        setSelectedAdditionalUserValues(event.target.value);
    };

    const toggleAdditionalUser = () => {
        setShowAdditionalUser((prevState) => !prevState); // Toggle the visibility state
    };


    // Email Preview Modal start
    const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
    const handleCloseEmailPreviewModal = () => setShowEmailPreviewModal(false);
    const handleShowEmailPreviewModal = () => setShowEmailPreviewModal(true);


    return (
        <>
            <div className='card shadow-none border mb-0'>
                <div className='card-header gth-bg-blue-light'>
                    <div className='d-flex flex-wrap gap-2 align-items-center justify-content-between'>
                        <h5 className='card-title f-s-16'>Email Recipients</h5>
                        <div className='d-flex gap-2'>
                            <button type='button' className='btn btn-outline-primary btn-sm' onClick={handleShowEmailPreviewModal}>
                                <i className="fas fa-envelope-open-text me-2"></i>Email Preview
                            </button>
                            <Tooltip title="Add Additional User">
                                <button
                                    type='button'
                                    className='link-btn additional_user_btn'
                                    onClick={toggleAdditionalUser} // Toggle visibility on click
                                >
                                    <i className="fas fa-user-plus"></i>
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <div className='card-body doc_body_height_155'>
                    <div className='row'>
                        <div className='col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Recipients Name</label>
                                <DropDownList
                                    className="custom_keno_dropdown"
                                    data={recipientsName}
                                    textField="label"
                                    valueField="value"
                                    value={selectedRecipientsNameValue}
                                    onChange={handleRecipientsNameChange}
                                    name="selectDoer"
                                />
                            </div>
                        </div>
                        {showAdditionalUser && ( // Conditional rendering based on visibility state
                            <div className='col-12 additional_user'>
                                <div className='form-group'>
                                    <label className='form-label'>Additional User</label>
                                    <MultiSelect
                                        data={recipientsName}
                                        textField="label"
                                        valueField="value"
                                        value={selectedAdditionalUserValues}
                                        onChange={handleAdditionalUserChange}
                                        name="selectDoer"
                                        className="custom_keno_dropdown"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Email Template Modal Start*/}
            <EmailTemplateModal
                show={showEmailPreviewModal}
                handleClose={handleCloseEmailPreviewModal}
            />
            {/* Email Template Modal end*/}
        </>
    );
}

export default EmailRecipients;
