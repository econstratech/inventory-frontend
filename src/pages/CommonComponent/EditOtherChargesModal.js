import React from 'react';
import { Modal } from 'react-bootstrap';

const EditOtherChargesModal = ({ show, handleClose }) => {
    return (
        <>
            <Modal
                id="EditOtherChargesModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="xxl"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Edit Other Charges</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className="table-responsive">
                        <table className="table table-bordered primary-table-head mb-0">
                            <thead>
                                <tr>
                                    <th><div>#</div></th>
                                    <th><div>Classification</div></th>
                                    <th><div className="text-end">Estimated Amount</div></th>
                                    <th><div className="text-end">Actual Amount</div></th>
                                    <th><div>Comment</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div>1</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '250px' }}>Labour Charges</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="number" className="form-control text-end" /></div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="number" className="form-control text-end" /></div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="text" className="form-control" /></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div>2</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '250px' }}>Machinery Charges</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="number" className="form-control text-end" /></div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="number" className="form-control text-end" /></div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="text" className="form-control" /></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div>3</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '250px' }}>Electricity Charges</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="number" className="form-control text-end" /></div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="number" className="form-control text-end" /></div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="text" className="form-control" /></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div>4</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '250px' }}>Other Charges</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="number" className="form-control text-end" /></div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="number" className="form-control text-end" /></div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '200px' }}><input type="text" className="form-control" /></div>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer className="gth-blue-light-bg">
                    <button type='button' className="btn" onClick={handleClose}>
                        Cancel
                    </button>
                    <button type='submit' className="btn btn-exp-green" onClick={handleClose}>
                        Update
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default EditOtherChargesModal;
