import React, { useEffect, useState } from "react";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { SuccessMessage } from "../../../environment/ToastMessage";
import { Button, Modal, Form, Table } from "react-bootstrap";
import GstApiTopBar from "./GstApiTopBar";
import { Tooltip } from "antd";

function EwayBill() {
  const [department, setDepartment] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [formData, setFormData] = useState({
    gstNumber: "",
    username: "",
    password: "",
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await PrivateAxios.post("/addwaybill", formData);
      if (response.status === 200) {
        SuccessMessage("E-way Bill API account created successfully!");
        handleClose();
        departmentData();
      }
    } catch (error) {
      console.error("Error creating E-way Bill API account:", error);
    }
  };

  const deleteDepartment = () => {
    setLoading(true)
    PrivateAxios.delete(`deletewaybill/${deleteId}`)
      .then((res) => {
        const deleteDepartment = department.filter((item) => item.id != deleteId);
        setDepartment(deleteDepartment)
        setLoading(false)
        SuccessMessage(res.data.data);
        deleteModalClose();
      }).catch((res) => {
        setLoading(false)
      })
  }
  const deleteModalClose = () => {
    setDeleteShow(false);
    setDeleteId('')
  }
  const departmentData = () => {
    setLoading(true);
    PrivateAxios.get("allwaybill")
      .then((res) => {
        setLoading(false);
        setDepartment(res.data.data);
      })
      .catch((err) => {
        setLoading(false);
      });
  };
  useEffect(() => {
    departmentData();
  }, []);

  console.log(department.length);

  return (
    <>
  <GstApiTopBar />
    <div className="p-4">
      <div className="card">
        <div className="card-header ">
          <h3 className="card-title">E-way bill API account</h3>
          <p className="mb-0">
            Here is the list of your E-way bill API accounts. You can create an
            E-way Bill API account by following these steps,{" "}
            <a
              href="https://tranzact-data.s3.amazonaws.com/Steps_to_create_Eway_bill_API_account.pdf"
              target="_blank"
            >
              Click here.
            </a>
          </p>
        </div>
        {department.length === 0 ? (
          <>
            <div className="col-12 mt-100 text-center">
              <div className="pt-10 p-5">
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/invoice.png`}
                  className="img-fluid mt-1 ms-2"
                  alt="Delivery Address"
                />
              </div>
              <Button type='button' className="mb-5" variant="success" onClick={handleShow}>
                + Add E-way bill API account
              </Button>
              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                size="md"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Add E-way Bill API Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">GST Number</label>
                      <Form.Control
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">API Username</label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">API Password</label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
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
                    <th scope="col">GST no</th>
                    <th scope="col">API Userame</th>
                    <th scope="col">API Password</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {department.map((data, i) => (
                    <tr key={i}>
                      <th scope="row">{i + 1}</th>
                      <td>{data.gstNumber}</td>
                      <td>{data.username}</td>
                      <td>{data.password}</td>
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

export default EwayBill;
