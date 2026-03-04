import React from 'react';
import { Modal } from 'react-bootstrap';

const CloseTransactionModal = ({
    show,
    onClose,
    onSave,
}) => {
    return (
        <Modal
            id="CloseTransactionModal"
            show={show}
            onHide={onClose}
            backdrop="static"
            centered
            size="md"
        >
            <form>
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Close/Cancel Transaction</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0 fs-6">
                        Are you sure you want to close this transaction?
                    </p>
                </Modal.Body>
                <Modal.Footer className="gth-blue-light-bg">
                    <button type="button" className="btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-exp-green"
                        onClick={(e) => {
                            e.preventDefault();
                            onSave();
                        }}
                    >
                        Save
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default CloseTransactionModal;
