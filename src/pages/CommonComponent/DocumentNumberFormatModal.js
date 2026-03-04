import { Tooltip } from 'antd';
import React, { useState } from "react";
import { Modal } from 'react-bootstrap';

const DocumentNumberFormatModal = ({ show, handleClose, onDelete }) => {
    const [isCustomFormatVisible, setCustomFormatVisible] = useState(false);

    const toggleCustomFormat = () => {
        setCustomFormatVisible(!isCustomFormatVisible);
    };
    return (
        <>
            <Modal
                id="DocumentNumberFormatModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Document Number Format</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <div className='form-group'>
                                <label className='form-label'>
                                    Series Name
                                    <span className='text-danger ms-1'>*</span>
                                    <Tooltip title="Give name to your number series for identification">
                                        <i className='fas fa-info-circle text-primary ms-2'></i>
                                    </Tooltip>
                                </label>
                                <input type='text' className='form-control' />
                            </div>
                        </div>
                        <div className='col-lg-6'>
                            <div className='form-group'>
                                <label className='form-label'>
                                    Prefix
                                    <span className='text-danger ms-1'>*</span>
                                    <Tooltip title="Fixed repeating code of intitials(Eg: PO for Purchase Order, REL for Reliance)">
                                        <i className='fas fa-info-circle text-primary ms-2'></i>
                                    </Tooltip>
                                </label>
                                <input type='text' className='form-control' />
                            </div>
                        </div>
                        <div className='col-lg-6'>
                            <div className='form-group'>
                                <label className='form-label'>
                                    Next Number
                                    <span className='text-danger ms-1'>*</span>
                                    <Tooltip title="This number automatically keeps increasing with each creation">
                                        <i className='fas fa-info-circle text-primary ms-2'></i>
                                    </Tooltip>
                                </label>
                                <input type='text' className='form-control' />
                            </div>
                        </div>
                    </div>
                    <div className='form-group text-end'>
                        <button
                            className="btn btn-light btn-sm"
                            onClick={toggleCustomFormat}
                        >
                            <i
                                className={`fas ${isCustomFormatVisible ? "fa-eye-slash" : "fa-eye"
                                    } me-1`}
                            ></i>
                            {isCustomFormatVisible ? "Hide Custom Format" : "Show Custom Format"}
                        </button>
                    </div>
                    <div className='alert gth-alert-danger-light'>
                        <p className='text-center mb-2'>Next Document Number</p>
                        <div className="progress">
                            <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: "100%" }}></div>
                        </div>
                        <div className='text-center fs-4 fw-bold'>
                            ABC0001
                        </div>
                    </div>
                    <div className='card bg-primary-light shadow-none mb-0'>
                        <div className='card-body'>
                            <div className='overflow-x-scroll mb-3'>
                                <h6 className='fw-bold'>Instructions</h6>
                                <div className='d-flex gap-3 align-items-center'>
                                    <div className='form-group mb-0 w-100'>
                                        <label className='col-form-label text-muted mb-0 pb-0'>Prefix</label>
                                        <div className='border px-3 py-2 rounded w-100'>
                                            SP/
                                        </div>
                                    </div>
                                    <div className='form-group mb-0'>
                                        <i className="fas fa-plus"></i>
                                    </div>
                                    <div className='form-group mb-0 w-100'>
                                        <label className='col-form-label text-muted mb-0 pb-0 text-nowrap'>Next Number</label>
                                        <div className='border px-3 py-2 rounded w-100'>
                                            0001
                                        </div>
                                    </div>
                                    <div className='form-group mb-0'>
                                        <i className="fas fa-equals"></i>
                                    </div>
                                    <div className='form-group mb-0 w-100'>
                                        <label className='col-form-label text-muted mb-0 pb-0 text-nowrap'>Next Document Number</label>
                                        <div className='border px-3 py-2 rounded w-100'>
                                            SP/0001
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {isCustomFormatVisible && (
                                <div className='custom_format_instruction'>
                                    <h6 className='fw-bold'>Custom Format Instructions</h6>
                                    <p className='mb-1'>
                                        Lets assume some examples -
                                    </p>
                                    <ul>
                                        <li>
                                            PEPSI/PO/2024-2025/0001 (PO by Pepsico) : PEPSI/PO/20[[fin_year_p1]]-[[fin_year_p2]]/[[inc_number]]
                                        </li>
                                        <li>
                                            HIND/INV/0223/12/24 (Invoice by Hindalco) : HIND/INV/[[inc_number]]/[[month]]/[[cal_year]]
                                        </li>
                                        <li>
                                            REL/RAW/0560 (Item ID by Reliance) :: REL/RAW/[[inc_number]]
                                        </li>
                                    </ul>
                                    <p className='mb-1'>Use following <b>MAGIC CODES</b> in 'Template' input field to generate personalised custom format</p>
                                    <div className='table-responsive'>
                                        <table className='table'>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div>
                                                            [[month]]
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <button type='button' className='btn btn-sm btn-light'>
                                                                <i className="fas fa-copy me-2"></i> Copy
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '300px' }}>
                                                            Denotes current month.<br />
                                                            Eg: for today's date (10/12/2024), it is - <b>12</b>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>
                                                            [[cal_year]]
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <button type='button' className='btn btn-sm btn-light'>
                                                                <i className="fas fa-copy me-2"></i> Copy
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '300px' }}>
                                                            Denotes <b>last 2 digits</b> of current Calendar Year.<br />
                                                            Eg: for today's date (10/12/2024), it is - <b>24</b>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>
                                                            [[fin_year_p1]]
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <button type='button' className='btn btn-sm btn-light'>
                                                                <i className="fas fa-copy me-2"></i> Copy
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '300px' }}>
                                                            Denotes <b>last 2 digits</b> of Year 1 current Financial Year.<br />
                                                            Eg: for today's date ( 10/12/2024 ), it is - <b>24</b>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>
                                                            [[fin_year_p2]]
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <button type='button' className='btn btn-sm btn-light'>
                                                                <i className="fas fa-copy me-2"></i> Copy
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '300px' }}>
                                                            Denotes <b>last 2 digits</b> of Year 2 current Financial Year.<br />
                                                            Eg: for today's date ( 10/12/2024 ), it is - <b>25</b>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>
                                                            [[inc_number]]
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <button type='button' className='btn btn-sm btn-light'>
                                                                <i className="fas fa-copy me-2"></i> Copy
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '300px' }}>
                                                            Denotes the next number in the ongoing series
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p>
                                        [Note: If you do not mention [[inc_number]] in the Template input field, the Next Number will be added to the Template]
                                    </p>
                                    <h6 className='fw-bold'>Auto Reset Series</h6>
                                    <p className='mb-1'>Auto reset 'Next Number' in number series based on chosen duration. It can be one of the followings:</p>
                                    <ul className='mb-0'>
                                        <li>Month : Series is reset on 1st day of every month</li>
                                        <li>
                                            Calendar Year : Series is reset on 01 Jan of every year
                                        </li>
                                        <li>
                                            Financial Year : Series is reset on 01 April of every year
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="gth-blue-light-bg">
                    <button type='button' className="btn btn-light" onClick={handleClose}>
                        Cancel
                    </button>
                    <button type='submit' className="btn btn-exp-green" onClick={handleClose}>
                        Save
                    </button>
                </Modal.Footer>

            </Modal>
        </>
    );
}

export default DocumentNumberFormatModal;
