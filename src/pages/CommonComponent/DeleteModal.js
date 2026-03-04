import React from 'react';
import { Modal } from 'react-bootstrap';

const DeleteModal = ({ show, handleClose, onDelete, title = null, message = null }) => {
    return (
        <Modal
            id="delete-modal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-text-danger">{title || "Delete Confirmation"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="delete-confirm-wrap d-flex align-items-start">
                    <div className="delete-confirm-icon mb-3 text-center me-3 mt-1">
                        <i class="fas fa-exclamation-triangle text-danger fs-1"></i>
                    </div>
                    <div>
                        <p className="text-muted f-s-14 mb-1">
                            {message || "Are you sure you want to delete?"}
                        </p>
                        <p className="text-muted f-s-14 mb-1 fw-bold">
                            Do you want to continue?
                        </p>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-center gth-light-red-bg'>
                <button type='button' className='btn btn-secondary' onClick={handleClose}>
                    <i className="far fa-times-circle me-2"></i>No
                </button>
                <button type='submit' className='btn btn-exp-red' onClick={onDelete}>
                    <i className="far fa-check-circle me-2"></i>Yes
                </button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteModal;
