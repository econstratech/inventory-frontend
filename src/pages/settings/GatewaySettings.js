import React, { useEffect, useState } from "react";
import { PrivateAxios } from "../../environment/AxiosInstance";
import { SuccessMessage } from "../../environment/ToastMessage";
import { Button, Modal, Form, Table } from "react-bootstrap";
import GstApiTopBar from "./gstApi/GstApiTopBar";
import { Tooltip } from "antd";

function GatewaySettings() {
    const [department, setDepartment] = useState([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteShow, setDeleteShow] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [formData, setFormData] = useState({
        gatewayname: "",
        keyid: "",
        keysecret: "",
      });
    
    // Available gateway options
    const gatewayOptions = [
      { value: "razorpay", label: "Razorpay" },
      // Add more if needed
    ];
    
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
       
        const response = await PrivateAxios.post("/pos/addgateway", formData);
        if (response.status === 200) {
          SuccessMessage("Gateway account created successfully!");
          handleClose();
          departmentData();
        }
      } catch (error) {
        console.error("Error creating gateway account:", error);
      }
    };
    
    const deleteDepartment = () => {
      setLoading(true);
      PrivateAxios.delete(`pos/deletegateway/${deleteId}`)
        .then((res) => {
          const updatedList = department.filter((item) => item.id !== deleteId);
          setDepartment(updatedList);
          setLoading(false);
          SuccessMessage(res.data.data);
          deleteModalClose();
        })
        .catch(() => {
          setLoading(false);
        });
    };
    
    const deleteModalClose = () => {
      setDeleteShow(false);
      setDeleteId('');
    };
    
    const departmentData = () => {
      setLoading(true);
      PrivateAxios.get("pos/allgateways")
        .then((res) => {
          setLoading(false);
          setDepartment(res.data.data);
        })
        .catch(() => {
          setLoading(false);
        });
    };
    
    useEffect(() => {
      departmentData();
    }, []);
 

  return (
    <>
    <GstApiTopBar />
    <div className="p-4">
      <div className="card">
        <div className="card-header d-block">
          <h3 className="card-title">Payment Gateways</h3>
          <p className="mb-0">
            Here is the list of your Payment gateways. You can create a new account using add new button, {" "}
           
          </p>
        </div>
        {department.length === 0 ? (
          <>
            <div className="col-12 mt-100 text-center">
              <div className="pt-10 px-3">
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/invoice.png`}
                  className="img-fluid mt-4"
                  alt="Delivery Address"
                />
              </div>
              <Button type='button' className="mb-5" variant="success" onClick={handleShow}>
                + Add New Gateway
              </Button>
              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="md"
              >
                <Modal.Header closeButton>
                  <Modal.Title>New account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form onSubmit={handleSubmit}>
  <div className="form-group">
    <label className="form-label">Gateway Name</label>
    <Form.Select
      name="gatewayname"
      value={formData.gatewayname}
      onChange={handleChange}
      required
    >
<option value="">Select Gateway</option>
      <option value="razorpay">Razorpay</option>
      {/* Add more gateways as needed */}
    </Form.Select>
  </div>

  <div className="form-group">
    <label className="form-label">Key Id</label>
    <Form.Control
      type="text"
      name="keyid"
      value={formData.keyid}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label className="form-label">Key Secret</label>
    <Form.Control
      type="text"
      name="keysecret"
      value={formData.keysecret}
      onChange={handleChange}
      required
    />
  </div>

  <Button variant="success" type="submit">
    Submit
  </Button>
</Form>

                </Modal.Body>
              </Modal>

            </div>
          </>
        ) : (

          <div className="col-12">
            <div className="">
            <Table responsive className="table-bordered primary-table-head">
                <thead>
                  <tr>
                    <th scope="col">SL.NO</th>
                    <th scope="col">Gateway Name</th>
                    <th scope="col">Key Id</th>
                    <th scope="col">Key Secret</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {department.map((data, i) => (
                    <tr key={i}>
                      <th scope="row">{i + 1}</th>
                      <td>{data.gatewayname}</td>
                      <td>{data.keyid}</td>
                      <td>{data.keysecret}</td>
                      <td>
                        {" "}
                        <div className="d-flex">
                        <Tooltip title="Delete">
                        <button
                              onClick={() => {
                                setDeleteShow(true);
                                setDeleteId(data.id);
                              }}
                              className="me-1 icon-btn"
                            >
                              <i className='fas fa-trash-alt text-danger'></i>
                            </button>
                        </Tooltip>
                        
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
                              <div className="delete-confirm-wrap text-center">
                                <div className="delete-confirm-icon mb-3 mt-2">
                                  <img src={process.env.PUBLIC_URL + '/assets/images/delete-warning.svg'} alt="Warning" className="img-fluid" />
                                </div>
                                <h4 className="text-muted">Are you sure?</h4>
                                <p className="text-muted">
                                  Do you really want to delete these record?
                                </p>
                              </div>
                            </Modal.Body>
                            <Modal.Footer>
                              <button type='reset' className='btn btn-secondary btn-sm' onClick={deleteModalClose}>
                                Cancel
                              </button>
                              <button type='submit' className='btn btn-exp-red btn-sm' onClick={deleteDepartment}>
                                Delete
                              </button>
                            </Modal.Footer>
                          </Modal>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

        )}
      </div>
    </div>
    </>

  );
}

export default GatewaySettings;
