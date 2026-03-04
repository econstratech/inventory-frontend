import React from "react";
import { Modal } from "react-bootstrap";

const CancelProcessModal = ({
    show,
    onClose,
    onCancel
}) => {
    return (
        <>
            <Modal
                id="CancelProcessModal"
                show={show}
                onHide={onClose}
                backdrop="static"
                centered
                size="md"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-text-danger">Process Cancel</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pb-1">
                    <h6>Are you sure you want to cancel the production order Document?</h6>
                </Modal.Body>
                <Modal.Footer className="gth-light-red-bg">
                    <button type='button' className="btn" onClick={onClose}>
                        Go Back
                    </button>
                    <button type='submit' className="btn btn-exp-red" onClick={onCancel}>
                        Yes, Cancel
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CancelProcessModal;
