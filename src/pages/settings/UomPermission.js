import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Modal,
  Table,
} from "react-bootstrap";
import { PrivateAxios } from "../../environment/AxiosInstance";
import Loader from "../landing/loder/Loader";
import { SuccessMessage, ErrorMessage } from "../../environment/ToastMessage";
import { Tooltip } from "antd";
import SettingsInventoryTopBar from "./settingsInventory/SettingsInventoryTopBar";

function WarehousesPermission() {
  const [key, setKey] = useState("In-Stock Stores");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [update, setUpdate] = useState(false);
  const [create, setCreate] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [departmentValue, setDepartmentValue] = useState("");
  const [departmentInputValue, setDepartmentInputValue] = useState({
    unit_name: "",
    bill_uom: "",
    unit_description: "",
  });

  const departmentData = () => {
    setLoading(true);
    PrivateAxios.get('master/uom/list')
      .then((res) => {
        setLoading(false);
        // Wrap the response data in an array if it's a single object
        const responseData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setData(responseData);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    departmentData();
  }, []);

  const departmentUpdateModelClose = () => {
    setUpdate(false);
    setDepartmentValue("");
  };
  const departmentCreateModelClose = () => {
    setCreate(false);
  };
  const deleteModalClose = () => {
    setDeleteShow(false);
    setDeleteId("");
  };

  const createStore = () => {
    setLoading(true);
    PrivateAxios.post("master/uom", departmentInputValue)
      .then((res) => {
        setLoading(false);
        SuccessMessage(res.data.data);
        departmentCreateModelClose();
        departmentData();
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };
  const UpdateDepartment = () => {
    setLoading(true);
    PrivateAxios.put(`updateuom/${departmentValue.id}`, departmentValue)
      .then((res) => {
        const updatedDepartment = data.map((item) =>
          item.id === departmentValue.id
            ? {
              ...item,
              name: departmentValue.name,
              bill_uom: departmentValue.bill_uom,
              unit_description: departmentValue.unit_description
            }
            : item
        );

        setLoading(false);
        SuccessMessage(res.data.data);
        departmentUpdateModelClose();
        departmentData();
      })
      .catch((res) => {
        setLoading(false);
      });
  };
  const deleteDepartment = async () => {
    setLoading(true);
    try {
      const response = await PrivateAxios.delete(
        `iomdelete/${deleteId}`
      );

      if (response.status === 200) {
        const updatedData = data.filter((item) => item.id !== deleteId);
        setData(updatedData);
        SuccessMessage(response.data.data);
        deleteModalClose();
      } else if (response.status === 400) {
        deleteModalClose();
        ErrorMessage(
          response.data.error || "Wrong data please try again"
        );
      }
    } catch (error) {
      ErrorMessage(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <SettingsInventoryTopBar />
          <div className='p-4'>
            <div className='card'>
              <div className='card-header d-flex flex-wrap gap-3 justify-content-between align-items-center border-bottom-0'>
                <div>
                  <h3 className="card-title">Unit of Measurement</h3>
                  <p className="mb-0">This is a list of UOM that can be used while creating a product or service in inventory module
                  </p>
                </div>

                <button type='button' onClick={() => setCreate(true)} className='btn btn-primary btn-sm ms-auto'>
                  <i className="fas fa-plus me-2"></i>
                  New Unit of Measurement
                </button>
              </div>
              <div className="card-body p-0">
                <div className="">
                  <Table responsive className="table-bordered primary-table-head">
                    <thead>
                      <tr>
                        <th scope="col">Sl.No</th>
                        <th scope="col">Unit Name</th>
                        <th scope="col">Symbol</th>
                        {/* <th scope="col">E-Way Bill UOM</th> */}
                        {/* <th scope="col">Unit Description</th> */}
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data && data.length > 0 ? (
                        data.map((item, i) => (
                          <tr key={i}>
                            <th scope="row">{i + 1}</th>
                            <td>{item.name}</td>
                            <td>{item.label}</td>
                            {/* <td>{item.bill_uom}</td>
                            <td>{item.unit_description}</td> */}
                            <td>
                              <div className="d-flex gap-2">
                                <Tooltip title="Edit">
                                  <button type='button' onClick={() => { setDepartmentValue(item); setUpdate(true); }} className="icon-btn">
                                    <i class="fas fa-pen"></i>
                                  </button>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <button type='button' onClick={() => { setDeleteShow(true); setDeleteId(item.id); }} className="icon-btn">
                                    <i class="fas fa-trash-alt text-danger"></i>
                                  </button>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* create Department */}
      <Modal
        backdrop="static"
        keyboard={false}
        centered
        show={create}
        onHide={departmentCreateModelClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Unit of Measurement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Unit Name</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Unit Name"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Symbol</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Symbol"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    label: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">E-Way Bill UOM</label>
              <Form.Select
                required
                aria-label="Default select example"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    bill_uom: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="BAGS">BAGS</option>
                <option value="BALE">BALE</option>
                <option value="BUNDLES">BUNDLES</option>
                <option value="BUCKLES">BUCKLES</option>
                <option value="BILLION OF UNITS">BILLION OF UNITS</option>
                <option value="BOX">BOX</option>
                <option value="BOTTLES">BOTTLES</option>
                <option value="BUNCHES">BUNCHES</option>
                <option value="CANS">CANS</option>
                <option value="CUBIC METERS">CUBIC METERS</option>
                <option value="CUBIC CENTIMETERS">CUBIC CENTIMETERS</option>
                <option value="CENTIMETERS">CENTIMETERS</option>
                <option value="CARTONS">CARTONS</option>
                <option value="DOZENS">DOZENS</option>
                <option value="DRUMS">DRUMS</option>
                <option value="GREAT GROSS">GREAT GROSS</option>
                <option value="GRAMMES">GRAMMES</option>
                <option value="GROSS">GROSS</option>
                <option value="GROSS YARDS">GROSS YARDS</option>
                <option value="KILOGRAMS">KILOGRAMS</option>
                <option value="KILOLITRE">KILOLITRE</option>
                <option value="KILOMETRE">KILOMETRE</option>
                <option value="LITRES">LITRES</option>
                <option value="MILILITRE">MILILITRE</option>
                <option value="METERS">METERS</option>
                <option value="METRIC TON">METRIC TON</option>
                <option value="NUMBERS">NUMBERS</option>
                <option value="OTHERS">OTHERS</option>
                <option value="PACKS">PACKS</option>
                <option value="PIECES">PIECES</option>
                <option value="PAIRS">PAIRS</option>
                <option value="QUINTAL">QUINTAL</option>
                <option value="ROLLS">ROLLS</option>
                <option value="SETS">SETS</option>
                <option value="SQUARE FEET">SQUARE FEET</option>
                <option value="SQUARE METERS">SQUARE METERS</option>
                <option value="SQUARE YARDS">SQUARE YARDS</option>
                <option value="TABLETS">TABLETS</option>
                <option value="TEN GROSS">TEN GROSS</option>
                <option value="THOUSANDS">THOUSANDS</option>
                <option value="TONNES">TONNES</option>
                <option value="TUBES">TUBES</option>
                <option value="US GALLONS">US GALLONS</option>
                <option value="UNITS">UNITS</option>
                <option value="YARDS">YARDS</option>
              </Form.Select>
            </div>
          </div> */}
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">Unit Description</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Unit Description"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    unit_description: e.target.value,
                  })
                }
              />
            </div>
          </div> */}

        </Modal.Body>
        <Modal.Footer>
          <Button type='reset'
            variant="secondary"
            onClick={departmentCreateModelClose}
          >
            Close
          </Button>
          <Button type='submit' variant="success" onClick={createStore}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update department */}
      <Modal
        show={update}
        onHide={departmentUpdateModelClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update {key}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Unit Name</label>
              <input
                type="text"
                className={`form-control`}
                value={departmentValue.unit_name}
                placeholder="Enter Unit Name"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    unit_name: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">E-Way Bill UOM</label>
              <Form.Select
                value={departmentValue.bill_uom}
                required
                aria-label="Default select example"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    bill_uom: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="BAGS">BAGS</option>
                <option value="BALE">BALE</option>
                <option value="BUNDLES">BUNDLES</option>
                <option value="BUCKLES">BUCKLES</option>
                <option value="BILLION OF UNITS">BILLION OF UNITS</option>
                <option value="BOX">BOX</option>
                <option value="BOTTLES">BOTTLES</option>
                <option value="BUNCHES">BUNCHES</option>
                <option value="CANS">CANS</option>
                <option value="CUBIC METERS">CUBIC METERS</option>
                <option value="CUBIC CENTIMETERS">CUBIC CENTIMETERS</option>
                <option value="CENTIMETERS">CENTIMETERS</option>
                <option value="CARTONS">CARTONS</option>
                <option value="DOZENS">DOZENS</option>
                <option value="DRUMS">DRUMS</option>
                <option value="GREAT GROSS">GREAT GROSS</option>
                <option value="GRAMMES">GRAMMES</option>
                <option value="GROSS">GROSS</option>
                <option value="GROSS YARDS">GROSS YARDS</option>
                <option value="KILOGRAMS">KILOGRAMS</option>
                <option value="KILOLITRE">KILOLITRE</option>
                <option value="KILOMETRE">KILOMETRE</option>
                <option value="LITRES">LITRES</option>
                <option value="MILILITRE">MILILITRE</option>
                <option value="METERS">METERS</option>
                <option value="METRIC TON">METRIC TON</option>
                <option value="NUMBERS">NUMBERS</option>
                <option value="OTHERS">OTHERS</option>
                <option value="PACKS">PACKS</option>
                <option value="PIECES">PIECES</option>
                <option value="PAIRS">PAIRS</option>
                <option value="QUINTAL">QUINTAL</option>
                <option value="ROLLS">ROLLS</option>
                <option value="SETS">SETS</option>
                <option value="SQUARE FEET">SQUARE FEET</option>
                <option value="SQUARE METERS">SQUARE METERS</option>
                <option value="SQUARE YARDS">SQUARE YARDS</option>
                <option value="TABLETS">TABLETS</option>
                <option value="TEN GROSS">TEN GROSS</option>
                <option value="THOUSANDS">THOUSANDS</option>
                <option value="TONNES">TONNES</option>
                <option value="TUBES">TUBES</option>
                <option value="US GALLONS">US GALLONS</option>
                <option value="UNITS">UNITS</option>
                <option value="YARDS">YARDS</option>
              </Form.Select>
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Unit Description</label>
              <input
                type="text"
                value={departmentValue.unit_description}
                className={`form-control`}
                placeholder="Enter GSTIN"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    unit_description: e.target.value,
                  })
                }
              />
            </div>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={departmentUpdateModelClose}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={UpdateDepartment}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete department */}
      <Modal
        show={deleteShow}
        onHide={deleteModalClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="delete-confirm-wrap d-flex align-items-start">
            <div className="delete-confirm-icon mb-3 text-center me-3 mt-1">
              <i class="fas fa-exclamation-triangle text-danger fs-1"></i>
            </div>
            <div>
              <p className="text-muted f-s-14 mb-1">
                Are you sure you want to delete?
              </p>
              <p className="text-muted f-s-14 mb-1 fw-bold">
                Do you want to continue?
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="gth-light-red-bg">
          <button type='button'
            className="btn btn-secondary"
            onClick={deleteModalClose}
          >
            <i className="far fa-times-circle me-2"></i>No
          </button>
          <button type='submit' className="btn btn-exp-red" onClick={deleteDepartment}>
            <i className="far fa-check-circle me-2"></i>Yes
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default WarehousesPermission;
