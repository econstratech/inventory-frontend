import React from 'react';
import { Modal } from 'react-bootstrap';

const DemandedProductListModal = ({ show, handleClose, data = [] }) => {
    return (
        <Modal
            id="DemandedProductListModal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
            size="md"
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-modal-title">
                    List of Demanded Products
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pb-1">
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.productName}</td>
                                        <td>{item.productQty}</td>
                                        <td>$ {item.productValue}</td>
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

export default DemandedProductListModal;
