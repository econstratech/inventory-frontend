import React from 'react';
import { Modal } from 'react-bootstrap';

const BarcodeNumbersViewModal = ({ show, handleClose,createBarcodeModal }) => {
    return (
        <>
            <Modal
                id="BarcodeNumbersViewModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Barcode Numbers</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className="table-responsive">
                        <table className="table table-striped primary-table-head mb-0">
                            <thead>
                                <tr>
                                    <th><div>#</div></th>
                                    <th><div>Approval Number</div></th>
                                    <th><div>Barcode Present</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(4)].map((_, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div>{index + 1}</div>
                                        </td>
                                        <td>
                                            <div style={{ minWidth: '150px' }}>
                                                <span className="link-btn">
                                                    IAP0007                                                    
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ minWidth: '150px' }} className="d-flex gap-2 align-items-center">
                                                {index % 2 === 0 ? "Yes" : "No"}
                                                <button type='button' className="icon-btn" onClick={createBarcodeModal}>
                                                    <i className="fas fa-plus text-primary"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default BarcodeNumbersViewModal;
