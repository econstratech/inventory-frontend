import React from 'react';
import { Modal } from 'react-bootstrap';

const RejectSaleOrderListModal = ({ show, handleClose, data = [] }) => {
    return (
        <Modal
            id="RejectSaleOrderListModal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
            size="md"
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-modal-title">
                    List of Reject Sale Order No
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pb-1">
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th className='text-nowrap'>Sl no</th>
                                <th className='text-nowrap'>Sale Order No</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.slno}</td>
                                        <td>{item.saleOrderNp}</td>
                                        <td>{item.remarks}</td>
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

export default RejectSaleOrderListModal;
