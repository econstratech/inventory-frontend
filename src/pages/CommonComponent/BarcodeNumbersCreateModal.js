import { Tooltip } from 'antd';
import React from 'react';
import { Modal } from 'react-bootstrap';

const BarcodeNumbersCreateModal = ({ show, handleClose }) => {
    return (
        <Modal
            id="BarcodeNumbersCreateModal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
            size="xxl"
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-modal-title">Barcode Number</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pb-1">
                <div className="table-responsive">
                    <table className="table primary-table-head mb-0">
                        <tbody>
                            <tr>
                                <td colSpan={7} className="p-0">
                                    <table className="table table-striped primary-table-head">
                                        <thead>
                                            <tr>
                                                <th><div style={{ minWidth: '50px' }} className="p-0">#</div></th>
                                                <th><div style={{ minWidth: '100px' }} className="p-0">Item Id</div></th>
                                                <th><div style={{ minWidth: '150px' }} className="p-0">Item Name</div></th>
                                                <th><div style={{ minWidth: '120px' }} className="p-0">Quantity</div></th>
                                                <th><div style={{ minWidth: '300px' }} className="p-0">Barcode Number</div></th>
                                                <th><div style={{ minWidth: '150px' }} className="p-0">Manufacturing Date</div></th>
                                                <th><div style={{ minWidth: '150px' }} className="p-0">Expiry Date</div></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/** First Row */}
                                            <tr>
                                                <td><div style={{ minWidth: '50px' }} className="p-0">&nbsp;</div></td>
                                                <td><div style={{ minWidth: '100px' }} className="p-0">RM01</div></td>
                                                <td><div style={{ minWidth: '150px' }} className="p-0">Raw Material 1</div></td>
                                                <td>
                                                    <div style={{ minWidth: '120px' }} className="d-flex gap-2 align-items-center p-0">
                                                        5 Kg
                                                        <Tooltip title="Split into child batches">
                                                            <button className="icon-btn line-height-1" type='button'>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    id="Layer_1"
                                                                    data-name="Layer 1"
                                                                    viewBox="0 0 24 24"
                                                                    width={14}
                                                                    height={14}
                                                                    fill="currentColor"
                                                                    className='text-primary'
                                                                >
                                                                    <path d="M23.01,16.06c1.33,1.33,1.33,3.55-.04,4.91l-2.38,2.55c-.3,.32-.7,.48-1.1,.48-.37,0-.73-.13-1.02-.4-.61-.57-.64-1.51-.07-2.12l1.38-1.48h-5.03c-1.53,0-3-.64-4.04-1.77l-4.37-4.73H1.5c-.83,0-1.5-.67-1.5-1.5s.67-1.5,1.5-1.5H6.34l4.37-4.73c1.04-1.12,2.51-1.77,4.04-1.77h5.03l-1.38-1.48c-.57-.61-.53-1.55,.07-2.12,.61-.56,1.55-.53,2.12,.07l2.41,2.59c1.33,1.33,1.33,3.55-.04,4.91l-2.38,2.55c-.3,.32-.7,.48-1.1,.48-.37,0-.73-.13-1.02-.4-.61-.57-.64-1.51-.07-2.12l1.38-1.48h-5.03c-.7,0-1.37,.29-1.84,.8l-3.87,4.2,3.87,4.2c.47,.51,1.14,.8,1.84,.8h5.03l-1.38-1.48c-.57-.61-.53-1.55,.07-2.12,.61-.56,1.55-.53,2.12,.07l2.41,2.59Z" />
                                                                </svg>

                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 p-0" style={{ minWidth: '300px' }}>
                                                        <input type="text" className="form-control form-control-sm rounded-0" placeholder="Prefix" />
                                                        <input type="text" className="form-control form-control-sm rounded-0" placeholder="Suffix" />
                                                        <button className="link-btn p-0" type='button'>
                                                            <i className="fas fa-long-arrow-alt-down text-primary"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }} className="p-0">
                                                        <input type="date" className="form-control form-control-sm" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }} className="p-0">
                                                        <input type="date" className="form-control form-control-sm" />
                                                    </div>
                                                </td>
                                            </tr>

                                            {/** Second Row */}
                                            <tr>
                                                <td><div className="p-0">1</div></td>
                                                <td><div style={{ minWidth: '100px' }} className="p-0">&nbsp;</div></td>
                                                <td><div style={{ minWidth: '150px' }} className="p-0">&nbsp;</div></td>
                                                <td>
                                                    <div style={{ minWidth: '120px' }} className="p-0">
                                                        <input type="number" readOnly className="form-control form-control-sm" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 p-0" style={{ minWidth: '300px' }}>
                                                        <input type="text" className="form-control form-control-sm rounded-0" placeholder="Prefix" />
                                                        <input type="text" className="form-control form-control-sm rounded-0" placeholder="0000" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }} className="p-0">
                                                        <input type="date" className="form-control form-control-sm" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }} className="p-0">
                                                        <input type="date" className="form-control form-control-sm" />
                                                    </div>
                                                </td>
                                            </tr>

                                            {/** Third Row */}
                                            <tr>
                                                <td>
                                                    <div className="d-flex gap-2 align-items-center p-0">
                                                        2
                                                        <Tooltip title="Remove child batches">
                                                            <button className="icon-btn line-height-1 remove_row" type='button'>
                                                                <i className="fas fa-minus-circle text-danger"></i>
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                                <td><div style={{ minWidth: '100px' }} className="p-0">&nbsp;</div></td>
                                                <td><div style={{ minWidth: '150px' }} className="p-0">&nbsp;</div></td>
                                                <td>
                                                    <div style={{ minWidth: '120px' }} className="p-0">
                                                        <input type="number" readOnly className="form-control form-control-sm" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 p-0" style={{ minWidth: '300px' }}>
                                                        <input type="text" className="form-control form-control-sm rounded-0" placeholder="Prefix" />
                                                        <input type="text" className="form-control form-control-sm rounded-0" placeholder="0000" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }} className="p-0">
                                                        <input type="date" className="form-control form-control-sm" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }} className="p-0">
                                                        <input type="date" className="form-control form-control-sm" />
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
            <Modal.Footer className="gth-blue-light-bg d-flex justify-content-between flex-wrap align-items-end">
                <div className='form-group my-1'>
                    <label className='form-label'>Upload File</label>
                    <input type='file' className='form-control' />
                    <button className='btn btn-warning mt-3' type='button'>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            id="Layer_1"
                            data-name="Layer 1"
                            viewBox="0 0 24 24"
                            width={14}
                            height={14}
                            fill="currentColor"
                            className='me-1'
                        >
                            <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
                        </svg>
                        Download Template
                    </button>
                </div>
                <div className='d-flex gap-2'>
                    <button className="btn btn-light" onClick={handleClose} type='button'>
                        Cancel
                    </button>
                    <button className="btn btn-exp-green" onClick={handleClose} type='submit'>
                        Save
                    </button>
                </div>

            </Modal.Footer>
        </Modal>
    );
};

export default BarcodeNumbersCreateModal;
