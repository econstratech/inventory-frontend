import { Tooltip } from 'antd';
import React from 'react';
import { Modal } from 'react-bootstrap';

const CustomizeDocumentNumberModal = ({ show, handleClose, onDelete, documentNumberFormatModal, documentNumberDelete }) => {
    return (
        <Modal
            id="CustomizeDocumentNumberModal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
            size='xl'
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-modal-title">Customize Document Number</Modal.Title>
            </Modal.Header>
            <Modal.Body className='pb-1'>
                <div className='d-flex gap-2 align-items-center justify-content-between flex-wrap mb-3'>
                    <div className='d-flex align-items-center gap-2 f-s-14'>
                        <span className='fw-bold text-muted'>Document Series Type:</span>
                        <div className='d-flex align-items-center gap-2 '>
                            Auto
                            <label className="custom-switch">
                                <input type="checkbox" />
                                <div className="switch-slider switch-round" />
                            </label>
                            Manual
                        </div>
                    </div>
                    <button type='button' className='btn btn-outline-primary btn-sm' onClick={documentNumberFormatModal}>
                        <i className="fas fa-plus me-2"></i>Add New Series
                    </button>
                </div>
                <div className='table-responsive'>
                    <table className='table table-bordered primary-table-head'>
                        <thead>
                            <tr>
                                <th>
                                    Name
                                </th>
                                <th>
                                    Prefix/Template
                                </th>
                                <th>
                                    Next Number
                                </th>
                                <th>
                                    Reset Type
                                </th>
                                <th>
                                    Next Document Number
                                </th>
                                <th>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div style={{ minWidth: '200px' }}>
                                        Process Series 1
                                    </div>
                                </td>
                                <td>
                                    <div style={{ minWidth: '200px' }}>
                                        PID
                                    </div>
                                </td>
                                <td>
                                    <div style={{ minWidth: '120px' }}>
                                        00006
                                    </div>
                                </td>
                                <td>
                                    <div style={{ minWidth: '120px' }}>
                                        -
                                    </div>
                                </td>
                                <td>
                                    <div style={{ minWidth: '230px' }}>
                                        PID00006
                                    </div>
                                </td>
                                <td>
                                    <div className='d-flex gap-2'>
                                        <Tooltip title="Edit">
                                            <button type='button' className='icon-btn' onClick={documentNumberFormatModal}>
                                                <i className='fas fa-pen'></i>
                                            </button>
                                        </Tooltip>
                                        <Tooltip title="Delete" onClick={documentNumberDelete}>
                                            <button type='button' className='icon-btn'>
                                                <i className='fas fa-trash-alt text-danger'></i>
                                            </button>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
            
        </Modal>
    );
}

export default CustomizeDocumentNumberModal;
