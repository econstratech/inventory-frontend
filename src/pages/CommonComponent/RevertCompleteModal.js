import React from "react";
import { Modal } from "react-bootstrap";

const RevertCompleteModal = ({
    show,
    onClose,
    onRevert
}) => {
    return (
        <>
            <Modal
                id="RevertCompleteModal"
                show={show}
                onHide={onClose}
                backdrop="static"
                centered
                size="md"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Process Revert</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pb-1">
                    <h6>Are you sure you want to revert completion of the process?</h6>
                    <ol className="f-s-14">
                        <li>All parent processes in the hierarchy will be moved to In Progress Stage.</li>
                        <li>You will have to again mark the parent process as complete.</li>
                    </ol>
                </Modal.Body>
                <Modal.Footer className="gth-blue-light-bg">
                    <button type='button' className="btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type='submit' className="btn btn-exp-green" onClick={onRevert}>
                        Revert
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default RevertCompleteModal;
