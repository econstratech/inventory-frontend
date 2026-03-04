import React from 'react';
import { Modal } from 'react-bootstrap';
import Select from 'react-select';

const ProductionLinkChildBomModal = ({ show, handleClose }) => {
    return (
        <>
            <Modal
                id="ProductionLinkChildBomModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="md"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Link Child BOM</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1 moday-body-overflow-none'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='form-group'>
                                <label className='form-label'>Select BOM</label>
                                <div className="custom-select-wrap">
                                    <Select
                                    // options={options}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="gth-blue-light-bg">
                    <button type='button' className="btn" onClick={handleClose}>
                        Cancel
                    </button>
                    <button type='submit' className="btn btn-exp-green" onClick={handleClose}>
                        Save
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ProductionLinkChildBomModal;
