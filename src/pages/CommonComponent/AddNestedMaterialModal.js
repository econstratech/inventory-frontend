import { DropDownList } from '@progress/kendo-react-dropdowns';
import React from 'react';
import { Modal } from 'react-bootstrap';


const AddNestedMaterialModal = ({ show, handleClose }) => {
    return (
        <>
            <Modal
                id="AddNestedMaterial"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="xxl"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Add Nested Material</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1 moday-body-overflow-none'>
                    <div className="table-responsive">
                        <table className="table-bordered primary-table-head">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item ID <span className="text-danger">*</span></th>
                                    <th>Item Name <span className="text-danger">*</span></th>
                                    <th>Item Category</th>
                                    <th>Stock</th>
                                    <th>Unit</th>
                                    <th>Required Qty/Unit</th>
                                    <th>Comment</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <DropDownList
                                            style={{ minWidth: '200px' }}
                                            className="custom_keno_dropdown"
                                            defaultValue={'Select ID'}
                                        />
                                    </td>
                                    <td>
                                        <div className='custom-select-wrap'>
                                            <DropDownList
                                                style={{ minWidth: '200px' }}
                                                className="custom_keno_dropdown"
                                                defaultValue={'Goods Name'}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '150px' }}>Finished Goods</div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '150px' }}>
                                            <input type="number" className="form-control" placeholder="Quantity" readOnly />
                                        </div>
                                    </td>
                                    <td>
                                        <DropDownList
                                            style={{ minWidth: '150px' }}
                                            className="custom_keno_dropdown"
                                        />
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '150px' }}>
                                            <input type="number" className="form-control" placeholder="" />
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: '250px' }}>
                                            <input type="text" className="form-control" placeholder="" />
                                        </div>
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
                        Save
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AddNestedMaterialModal;
