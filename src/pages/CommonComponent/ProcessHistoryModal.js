import React from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

const ProcessHistoryModal = ({ show, onClose, historyData }) => {
    return (
        <>
            <Modal
                id="ProcessHistoryModal"
                show={show}
                onHide={onClose}
                backdrop="static"
                centered
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Process Change History</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pb-1">
                    <div className="table-responsive">
                        <table className="table table-striped primary-table-head mb-0">
                            <thead>
                                <tr>
                                    <th>
                                        <div>Process Number</div>
                                    </th>
                                    <th>
                                        <div>Action Type</div>
                                    </th>
                                    <th>
                                        <div>Comment</div>
                                    </th>
                                    <th>
                                        <div>Creation Date</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData && historyData.length > 0 ? (
                                    historyData.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div style={{ minWidth: "170px" }}>
                                                    <span >
                                                        {item.processNumber}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ minWidth: "200px" }}>{item.actionType}</div>
                                            </td>
                                            <td>
                                                <div style={{ minWidth: "200px" }}>{item.comment}</div>
                                            </td>
                                            <td>
                                                <div style={{ minWidth: "200px" }}>{item.creationDate}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            No history available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ProcessHistoryModal;
