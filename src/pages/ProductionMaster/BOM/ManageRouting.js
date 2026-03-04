import { Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { Collapse, Modal } from "react-bootstrap";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { SuccessMessage } from "../../../environment/ToastMessage";

const ManageRouting = ({ show, handleClose,routes,setRoutes,GetRoute,GetSequenceProductComment}) => {
  const [openNewRoute, setOpenNewRoute] = useState(false);

  //=========Get All Routes=========//
  
  const [activeCollapseId, setActiveCollapseId] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Handle Edit Click
  const handleEditClick = (route) => {
    setSelectedRoute(route);
    // Toggle the collapse for the selected route
    setActiveCollapseId((prevId) => (prevId === route.id ? null : route.id));
  };

  // Handle Update Click
  const handleUpdateClick = (id) => {
    setActiveCollapseId(null);
    setSelectedRoute(null);
    const data = routes.find(item => item.id == id);
    PrivateAxios.put(`production/update-production-route/${data.id}`,data)
      .then((res) => {
        SuccessMessage(res.data.message);
        GetSequenceProductComment();
      }).catch((err) => {
        console.log(err);

      })
  };

  //==========Create Route & Api connect==========//
  const [data, setData] = useState({
    "bom_id": "2",
    "name": "",
    "route_id": "",
    "description": ""
  })
  const submitRoute = (e) => {
    e.preventDefault();
    if (!data.bom_id || !data.description || !data.name) {
      return;
    }
    PrivateAxios.post("production/create-production-route", data)
      .then((res) => {
        setData({
          "route_id": "",
          "name": "",
          "description": ""
        })
        SuccessMessage(res.data.message)
        GetRoute();

      }).catch((err) => {
        console.log(err);

      })
  }

  return (
    <>
      <Modal
        id="ManageRoutingModal"
        show={show}
        onHide={handleClose}
        backdrop="static"
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title className="gth-modal-title">Manage Routing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-end mb-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setOpenNewRoute(!openNewRoute)}
              aria-expanded={openNewRoute}
            >
              <i className="fas fa-plus me-2"></i>Create New
            </button>
          </div>
          <Collapse in={openNewRoute}>
            <div className="card shadow-none gth-bg-success-light border border-success">
              <form className="card-body" onSubmit={submitRoute}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="form-label">
                        Routing ID <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={data.route_id}
                        onChange={(e) => setData({ ...data, route_id: e.target.value })}
                        className="form-control"
                        placeholder="Enter Routing ID"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="form-label">
                        Routing Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="form-control"
                        placeholder="Enter Routing Name"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        required
                        value={data.description}
                        onChange={(e) => setData({ ...data, description: e.target.value })}
                        className="form-control"
                        placeholder="Enter Description"
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-lg-12 d-flex justify-content-end">
                    <button type='submit' className="btn btn-exp-green">Create</button>
                  </div>
                </div>
              </form>
            </div>
          </Collapse>
          <div className="table-responsive">
            <table className="table table-borderless mb-0">
              <tbody>
                {routes.map((route) => (
                  <React.Fragment key={route.id}>
                    <tr>
                      <td>
                        <div className="f-s-15 fw-medium">{route.route_id} :{route.route_name}</div>
                        <div className="text-muted">{route.description}</div>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-end">
                          <Tooltip title="Edit">
                            <button
                              className="icon-btn"
                              onClick={() => handleEditClick(route)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <button type='button' className="icon-btn">
                              <i className="fas fa-trash-alt text-danger"></i>
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2">
                        <Collapse in={activeCollapseId === route.id}>
                          <div className="card shadow-none gth-bg-info-light border border-primary mb-0">
                            <div className="card-body">
                              <div className="row">
                                <div className="col-lg-6">
                                  <div className="form-group">
                                    <label className="form-label">
                                      Routing ID <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={route.route_id}
                                      onChange={(e) => setRoutes(prevSteps =>
                                        prevSteps.map(step =>
                                          step.id === route.id ? { ...step, route_id: e.target.value } : step
                                        )
                                      )}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-6">
                                  <div className="form-group">
                                    <label className="form-label">
                                      Routing Name{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={route.route_name}
                                      onChange={(e) => setRoutes(prevSteps =>
                                        prevSteps.map(step =>
                                          step.id === route.id ? { ...step, route_name: e.target.value } : step
                                        )
                                      )}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-12">
                                  <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                      value={route.description}
                                      onChange={(e) => setRoutes(prevSteps =>
                                        prevSteps.map(step =>
                                          step.id === route.id ? { ...step, description: e.target.value } : step
                                        )
                                      )}
                                      className="form-control"
                                      placeholder="Enter Description"
                                    ></textarea>
                                  </div>
                                </div>
                                <div className="col-lg-12 d-flex justify-content-end">
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => handleUpdateClick(route.id)}
                                  >
                                    Update
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ManageRouting;
