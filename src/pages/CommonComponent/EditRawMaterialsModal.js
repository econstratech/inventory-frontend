import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Tooltip } from 'antd';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

const EditRawMaterialsModal = ({ show, handleClose, onSave, handleChildBom, handleDelete, handleNestedItem }) => {
    //table disable row show
    const [expandedDisableTableRow, setExpandedDisableTableRow] = useState(false);

    const handleToggleDisableTableRow = () => {
        setExpandedDisableTableRow(!expandedDisableTableRow);
    };
    return (
        <>
            <Modal
                id="EditRawMaterialsModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="xxxl"
            >
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title className="gth-modal-title">Edit Raw Materials</Modal.Title>
                    </Modal.Header>
                    <Modal.Body >
                        <div className="table-responsive">
                            <table className="table table-bordered primary-table-head raw_material_table">
                                <thead>
                                    <tr>
                                        <th>&nbsp;</th>
                                        <th>#</th>
                                        <th>Item ID</th>
                                        <th>Item Name</th>
                                        <th>Item Category</th>
                                        <th>Current Stock</th>
                                        <th>Required Quantity</th>
                                        <th>Quantity Manufactured</th>
                                        <th>Unit</th>
                                        <th>Comment</th>
                                        <th>Alternate Items</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="active_tr">
                                        <td>
                                            <div style={{ width: '20px', textAlign: 'center' }}>
                                                <Tooltip title={expandedDisableTableRow ? "Collapse" : "Expand"}>
                                                    <button
                                                        className="link-btn collapse_disable_tr"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleToggleDisableTableRow();
                                                        }}
                                                    >
                                                        <button type='button' className='link-btn'>
                                                            {
                                                                expandedDisableTableRow
                                                                    ? <>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            id="Layer_1"
                                                                            data-name="Layer 1"
                                                                            viewBox="0 0 24 24"
                                                                            width={14}
                                                                            height={14}
                                                                            fill="currentColor"
                                                                            className=''
                                                                        >
                                                                            <path d="M24,12c0,.828-.671,1.5-1.5,1.5H1.5c-.829,0-1.5-.672-1.5-1.5s.671-1.5,1.5-1.5H22.5c.829,0,1.5,.672,1.5,1.5Zm-11.293,3.293c-.391-.391-1.024-.391-1.414,0l-3.163,3c-.63,.63-.184,1.707,.707,1.707h1.663v2.5c0,.828,.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-2.5h1.663c.891,0,1.337-1.077,.707-1.707l-3.163-3Zm-1.414-6.586c.391,.391,1.024,.391,1.414,0l3.163-3c.63-.63,.184-1.707-.707-1.707h-1.663V1.5c0-.828-.671-1.5-1.5-1.5s-1.5,.672-1.5,1.5v2.5h-1.663c-.891,0-1.337,1.077-.707,1.707l3.163,3Z" />
                                                                        </svg>

                                                                    </>
                                                                    : <>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            id="Layer_1"
                                                                            data-name="Layer 1"
                                                                            viewBox="0 0 24 24"
                                                                            width={14}
                                                                            height={14}
                                                                            fill="currentColor"
                                                                            className=''
                                                                        >
                                                                            <path d="M17.087,16.923h-3.587V6.923h3.587c.811,0,1.218-.994,.644-1.575L12.644,.193c-.356-.36-.932-.36-1.288,0L6.269,5.348c-.574,.581-.167,1.575,.644,1.575h3.587v10h-3.587c-.811,0-1.218,.994-.644,1.575l5.087,5.154c.356,.36,.932,.36,1.288,0l5.087-5.154c.574-.581,.167-1.575-.644-1.575Z" />
                                                                        </svg>
                                                                    </>
                                                            }
                                                        </button>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                        <td className="active_td">1</td>
                                        <td>
                                            <DropDownList
                                                style={{ width: '200px' }}
                                                className="custom_keno_dropdown"
                                                //data={finishedGoodsID}
                                                defaultValue={'Select ID'}
                                                disabled
                                            />
                                        </td>
                                        <td>
                                            <div className='custom-select-wrap'>
                                                <DropDownList
                                                    style={{ width: '200px' }}
                                                    className="custom_keno_dropdown"
                                                    defaultValue={'Goods Name'}
                                                    disabled
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ width: '150px' }}>Finished Goods</div>
                                        </td>
                                        <td>
                                            <div style={{ width: '150px' }}>125</div>
                                        </td>
                                        <td>
                                            <div style={{ width: '150px' }}>
                                                <input type="number" className="form-control" placeholder="" disabled />
                                                <div className='text-danger f-s-12 text-center'>Insufficient Stock</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ width: '160px' }}>
                                                <input type="number" className="form-control" placeholder="" disabled />
                                            </div>
                                        </td>
                                        <td>
                                            <DropDownList
                                                style={{ width: '150px' }}
                                                className="custom_keno_dropdown"
                                                disabled
                                            />
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 align-items-center" style={{ width: '170px' }}>
                                                <span className="f-s-14">-</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 align-items-center" style={{ width: '170px' }}>
                                                <span className="f-s-14">0</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Tooltip title="Change Child BOM">
                                                    <button type='button' className="icon-btn cursor-not-allowed"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleChildBom();
                                                        }}
                                                        disabled
                                                    >
                                                        <i className="fas fa-link"></i>
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Remove">
                                                    <button type='button' className="icon-btn cursor-not-allowed"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDelete();
                                                        }}
                                                        disabled
                                                    >
                                                        <i className="fas fa-trash-alt text-danger "></i>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedDisableTableRow && (
                                        <>
                                            <tr className="diable_tr">
                                                <td>
                                                    <div style={{ width: '20px', textAlign: 'center' }}>&nbsp;</div>
                                                </td>
                                                <td className="disable_td">1.1</td>
                                                <td>
                                                    <DropDownList
                                                        style={{ width: '200px' }}
                                                        className="custom_keno_dropdown"
                                                        //data={finishedGoodsID}
                                                        defaultValue={'Select ID'}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <div className='custom-select-wrap'>
                                                        <DropDownList
                                                            style={{ width: '200px' }}
                                                            className="custom_keno_dropdown"
                                                            defaultValue={'Goods Name'}
                                                            disabled
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ width: '150px' }}>Finished Goods</div>
                                                </td>
                                                <td>
                                                    <div style={{ width: '150px' }}>125</div>
                                                </td>
                                                <td>
                                                    <div style={{ width: '150px' }}>
                                                        <input type="number" className="form-control" placeholder="" disabled />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ width: '160px' }}>
                                                        <input type="number" className="form-control" placeholder="" disabled />
                                                    </div>
                                                </td>
                                                <td>
                                                    <DropDownList
                                                        style={{ width: '150px' }}
                                                        className="custom_keno_dropdown"
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 align-items-center" style={{ width: '170px' }}>
                                                        <span className="f-s-14">-</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 align-items-center" style={{ width: '170px' }}>
                                                        <span className="f-s-14">0</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Tooltip title="Change Child BOM">
                                                            <button type='button' className="icon-btn cursor-not-allowed"
                                                                disabled
                                                            >
                                                                <i className="fas fa-link"></i>
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip title="Remove">
                                                            <button type='button' className="icon-btn cursor-not-allowed"
                                                                disabled
                                                            >
                                                                <i className="fas fa-trash-alt text-danger "></i>
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="diable_tr">
                                                <td>
                                                    <div style={{ width: '20px', textAlign: 'center' }}>&nbsp;</div>
                                                </td>
                                                <td className="disable_td">1.1</td>
                                                <td>
                                                    <DropDownList
                                                        style={{ width: '200px' }}
                                                        className="custom_keno_dropdown"
                                                        //data={finishedGoodsID}
                                                        defaultValue={'Select ID'}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <div className='custom-select-wrap'>
                                                        <DropDownList
                                                            style={{ width: '200px' }}
                                                            className="custom_keno_dropdown"
                                                            defaultValue={'Goods Name'}
                                                            disabled
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ width: '150px' }}>Finished Goods</div>
                                                </td>
                                                <td>
                                                    <div style={{ width: '150px' }}>125</div>
                                                </td>
                                                <td>
                                                    <div style={{ width: '150px' }}>
                                                        <input type="number" className="form-control" placeholder="" disabled />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ width: '160px' }}>
                                                        <input type="number" className="form-control" placeholder="" disabled />
                                                    </div>
                                                </td>
                                                <td>
                                                    <DropDownList
                                                        style={{ width: '150px' }}
                                                        className="custom_keno_dropdown"
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 align-items-center" style={{ width: '170px' }}>
                                                        <span className="f-s-14">-</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 align-items-center" style={{ width: '170px' }}>
                                                        <span className="f-s-14">0</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Tooltip title="Change Child BOM">
                                                            <button type='button' className="icon-btn cursor-not-allowed"
                                                                disabled
                                                            >
                                                                <i className="fas fa-link"></i>
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip title="Remove">
                                                            <button type='button' className="icon-btn cursor-not-allowed"
                                                                disabled
                                                            >
                                                                <i className="fas fa-trash-alt text-danger "></i>
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                    <tr className="active_tr">
                                        <td>
                                            <div style={{ width: '20px', textAlign: 'center' }}>&nbsp;</div>
                                        </td>
                                        <td className="active_td">2</td>
                                        <td>
                                            <DropDownList
                                                style={{ width: '200px' }}
                                                className="custom_keno_dropdown"
                                                //data={finishedGoodsID}
                                                defaultValue={'Select ID'}
                                            />
                                        </td>
                                        <td>
                                            <div className='custom-select-wrap'>
                                                <DropDownList
                                                    style={{ width: '200px' }}
                                                    className="custom_keno_dropdown"
                                                    defaultValue={'Goods Name'}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ width: '150px' }}>Finished Goods</div>
                                        </td>
                                        <td>
                                            <div style={{ width: '150px' }}>125</div>
                                        </td>
                                        <td>
                                            <div style={{ width: '150px' }}>
                                                <input type="number" className="form-control" placeholder="Quantity" />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ width: '160px' }}>
                                                <input type="number" className="form-control" placeholder="" />
                                            </div>
                                        </td>
                                        <td>
                                            <DropDownList
                                                style={{ width: '150px' }}
                                                className="custom_keno_dropdown"
                                            />
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 align-items-center" style={{ width: '170px' }}>
                                                <span className="f-s-14">-</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 align-items-center" style={{ width: '170px' }}>
                                                <span className="f-s-14">0</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Tooltip title="Change Child BOM">
                                                    <button type='button' className="icon-btn cursor-not-allowed"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleChildBom();
                                                        }}
                                                    >
                                                        <i className="fas fa-link"></i>
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Add Nested Item">
                                                    <button type='button' className="table-btn"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleNestedItem();
                                                        }}
                                                    >
                                                        <i className="fas fa-network-wired"></i>
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Remove">
                                                    <button type='button' className="icon-btn cursor-not-allowed"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDelete();
                                                        }}
                                                    >
                                                        <i className="fas fa-trash-alt text-danger "></i>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <button type='button' className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                                e.preventDefault();
                                //handleAddNewRow();
                            }}
                        >
                            <i className="fas fa-plus me-2"></i>Add Raw Material Row
                        </button>
                    </Modal.Body>
                    <Modal.Footer className="gth-blue-light-bg">
                        <button type='button' className="btn" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type='submit'
                            className="btn btn-exp-green"
                            onClick={(e) => {
                                e.preventDefault();
                                onSave();
                            }}
                        >
                            Update
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
};

export default EditRawMaterialsModal;
