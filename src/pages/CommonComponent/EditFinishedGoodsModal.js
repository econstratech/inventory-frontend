import { DropDownList } from '@progress/kendo-react-dropdowns';
import React from 'react';
import { Modal } from 'react-bootstrap';

const EditFinishedGoodsModal = ({ show, handleClose, onSave }) => {
    return (
        <>
            <Modal id="EditFinishedGoodsModal" show={show} onHide={handleClose} backdrop="static" centered size="xxxl">
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title className="gth-modal-title">Edit Finished Goods</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-1">
                    <div className="table-responsive">
                  <table className="table-bordered primary-table-head">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item ID</th>
                        <th>Item Name</th>
                        <th>Item Category</th>
                        <th>Unit</th>
                        <th>Cost Allocation (%)</th>
                        <th>Comment</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      <tr className>
                        <td>1</td>
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
                          <DropDownList
                            style={{ width: '150px' }}
                            className="custom_keno_dropdown"
                          />
                        </td>
                        <td>
                          <div style={{ width: '150px' }}>
                            <input type="number" className="form-control" placeholder="" />
                          </div>

                        </td>
                        <td>
                          <div style={{ minWidth: '150px' }}>
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

export default EditFinishedGoodsModal;
