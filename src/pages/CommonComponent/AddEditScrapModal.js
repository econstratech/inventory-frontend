import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Tooltip } from 'antd';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

const AddEditScrapModal = ({ show, handleClose, handleDelete }) => {
    //Scrap
      const [rows, setRows] = useState([
        { id: 1, category: "Finished Goods", quantity: 0, unit: "", costAllocation: 0, comment: "" },
      ]);
    
      const handleAddScrapRow = () => {
        const newRow = {
          id: rows.length + 1,
          category: "Finished Goods",
          quantity: 0,
          unit: "",
          costAllocation: 0,
          comment: "",
        };
        setRows((prevRows) => [...prevRows, newRow]);
      };
    
      const handleScrapInputChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
      };
    
      const handleRemoveRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
      };
      //Scrap end
    return (
        <>
            <Modal
                id="AddEditScrapModal"
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="xxxl"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Edit Scraps</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                <div className="table-responsive">
                  <table className="table-bordered primary-table-head">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item ID</th>
                        <th>Item Name</th>
                        <th>Item Category</th>
                        <th>Estimated Quantity</th>
                        <th>Actual Quantity</th>
                        <th>Unit</th>
                        <th>Cost Allocation (%)</th>
                        <th>Comment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id}>
                          <td>{index + 1}</td>
                          <td>
                            <DropDownList
                              style={{ width: "200px" }}
                              className="custom_keno_dropdown"
                              //data={finishedGoodsID}
                              defaultValue={"Select ID"}
                            />
                          </td>
                          <td>
                            <div className="custom-select-wrap">
                              <DropDownList
                                style={{ width: "200px" }}
                                className="custom_keno_dropdown"
                                defaultValue={"Goods Name"}
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ width: "150px" }}>{row.category}</div>
                          </td>
                          <td>
                            <div style={{ width: "150px" }}>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Quantity"
                                value={row.quantity}
                                onChange={(e) =>
                                  handleScrapInputChange(index, "quantity", e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ width: "150px" }}>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Quantity"
                                value={row.quantity}
                                onChange={(e) =>
                                  handleScrapInputChange(index, "quantity", e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <DropDownList
                              style={{ width: "150px" }}
                              className="custom_keno_dropdown"
                              value={row.unit}
                              onChange={(e) =>
                                handleScrapInputChange(index, "unit", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <div style={{ width: "150px" }}>
                              <input
                                type="number"
                                className="form-control"
                                placeholder=""
                                value={row.costAllocation}
                                onChange={(e) =>
                                  handleScrapInputChange(index, "costAllocation", e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ width: "150px" }}>
                              <input
                                type="text"
                                className="form-control"
                                placeholder=""
                                value={row.comment}
                                onChange={(e) =>
                                  handleScrapInputChange(index, "comment", e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div
                              className="d-flex gap-2 align-items-center"
                              style={{ width: "80px" }}
                            >
                              <Tooltip title="Remove">
                                <button
                                  className="table-btn"
                                 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(index);
                                }}
                                >
                                  <i className="fas fa-trash-alt text-danger"></i>
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type='button' className="btn btn-sm btn-outline-primary" onClick={handleAddScrapRow}>
                  <i className="fas fa-plus me-2"></i>Add Scrap Row
                </button>
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

export default AddEditScrapModal;
