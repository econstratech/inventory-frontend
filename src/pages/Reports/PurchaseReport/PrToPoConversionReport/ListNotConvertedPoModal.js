import React from 'react';
import { Modal } from 'react-bootstrap';

const ListNotConvertedPoModal = ({ show, handleClose, data = [] }) => {
    return (
        <Modal
            id="ListNotConvertedPoModal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
            size="md"
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-modal-title">
                    List of Not Converted to PO
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pb-1">
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Quotation No</th>
                                <th>Quotation Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.quotationNo}</td>
                                        <td>{item.quotationDate}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="text-center text-muted">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ListNotConvertedPoModal;
