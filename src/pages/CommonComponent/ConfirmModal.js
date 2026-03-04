import React from 'react';
import { Modal } from 'react-bootstrap';

const ConfirmModal = ({
  show,
  handleClose,
  onConfirm,
  title = null,
  message = null,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
}) => {
  return (
    <Modal
      id="confirm-modal"
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Confirmation'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="delete-confirm-wrap d-flex align-items-start">
          <div className="delete-confirm-icon mb-3 text-center me-3 mt-1">
            <i className="fas fa-exclamation-circle text-primary fs-1"></i>
          </div>
          <div>
            <p className="text-muted f-s-14 mb-1">
              {message || 'Are you sure you want to continue?'}
            </p>
            <p className="text-muted f-s-14 mb-1 fw-bold">
              Do you want to continue?
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <button type="button" className="btn btn-secondary" onClick={handleClose}>
          <i className="far fa-times-circle me-2"></i>
          {cancelLabel}
        </button>
        <button type="button" className="btn btn-exp-green" onClick={onConfirm}>
          <i className="far fa-check-circle me-2"></i>
          {confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
