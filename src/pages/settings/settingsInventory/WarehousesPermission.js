import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Modal,
  // OverlayTrigger,
  // Tooltip,
} from "react-bootstrap";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import Loader from "../../landing/loder/Loader";
import { SuccessMessage, ErrorMessage } from "../../../environment/ToastMessage";
import SettingsInventoryTopBar from "./SettingsInventoryTopBar";

function WarehousesPermission() {
  const [key, setKey] = useState("Finished Goods");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [update, setUpdate] = useState(false);
  const [create, setCreate] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  // const [isChecked, setIsChecked] = useState(false);
  const [selectedStoreData, setSelectedStoreData] = useState("");
  const [createStoreData, setCreateStoreData] = useState({
    name: "",
    location: "",
    // gstn_type: "",
    // gstn_no: "",
    // address1: "",
    // address2: "",
    city: "",
    // country: "",
    // state: "",
    pin: "",
    store_type: "",
    is_fg_store: 0,
    is_rm_store: 0,
    // is_default: "",
  });
  // const [countries, setCountries] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");


  // useEffect(() => {
  //   const fetchCountries = async () => {
  //     const response = await fetch("https://countriesnow.space/api/v0.1/countries");
  //     const data = await response.json();
  //     setCountries(data.data);
  //   };
  //   fetchCountries();
  // }, []);

  const fetchData = async (storeType = key) => {
    setLoading(true);
    try {
      const response = await PrivateAxios.get(
        `warehouse?store_type=${encodeURIComponent(storeType)}`
      );
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(key);
    setCreateStoreData((prev) => ({ ...prev, store_type: key }));
  }, [key]);

  const storeUpdateModalClose = () => {
    setUpdate(false);
    setSelectedStoreData("");
  };
  const storeCreateModal = () => {
    setCreate(false);
    setErrorMessage(null);
    setCreateStoreData({
      name: "",
      location: "",
      city: "",
      pin: "",
      store_type: "",
      is_fg_store: 0,
      is_rm_store: 0,
    })
  };
  const deleteModalClose = () => {
    setDeleteShow(false);
    setDeleteId("");
  };

  // Add item form validation
  const validateCreateStoreForm = () => {
    const newErrors = {};

    if (!createStoreData.name || createStoreData.name.trim() === "") {
      newErrors.store_name = "Store name is required";
    }

    if (!createStoreData.store_type || createStoreData.store_type.trim() === "") {
      newErrors.store_type = "Please select store type";
    }

    if (!createStoreData.city || createStoreData.city.trim() === "") {
      newErrors.city = "City is required";
    }

    if (!createStoreData.pin || createStoreData.pin.trim() === "") {
      newErrors.pin = "Pincode is required";
    }

    // Set error message if any
    setErrorMessage(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // update warehouse form validation
  const validateUpdateStoreForm = () => {
    const newErrors = {};
    // console.log("selectedStoreData", selectedStoreData);

    if (!selectedStoreData.name || selectedStoreData.name.trim() === "") {
      newErrors.update_store_name = "Store name is required";
    }

    if (!selectedStoreData.store_type || selectedStoreData.store_type.trim() === "") {
      newErrors.update_store_type = "Please select store type";
    }

    if (!selectedStoreData.city || selectedStoreData.city.trim() === "") {
      newErrors.update_city = "City is required";
    }

    if (!selectedStoreData.pin || selectedStoreData.pin.trim() === "") {
      newErrors.update_pin = "Pincode is required";
    }

    // Set error message if any
    setErrorMessage(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createStore = () => {
    setErrorMessage(null);
    // Check validation before submit data
    if (!validateCreateStoreForm()) return;

    setLoading(true);

    PrivateAxios.post("warehouse", createStoreData)
      .then((res) => {
        setLoading(false);
        SuccessMessage(res.data.data);
        storeCreateModal();
        fetchData();
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };
  const updateStore = () => {
    setErrorMessage(null);
    // Check validation before submit data
    if (!validateUpdateStoreForm()) return;

    setLoading(true);
    PrivateAxios.put(`warehouse/${selectedStoreData.id}`, selectedStoreData)
      .then((res) => {
        setLoading(false);
        SuccessMessage(res.data.message);
        storeUpdateModalClose();
        fetchData();
      })
      .catch((res) => {
        setLoading(false);
      });
  };
  const deleteStore = async () => {
    setLoading(true);
    try {
      const response = await PrivateAxios.delete(
        `warehouse/${deleteId}`
      );

      if (response.status === 200) {
        const updatedData = data.filter((item) => item.id !== deleteId);
        setData(updatedData);
        SuccessMessage(response.data.data);
        deleteModalClose();
      } else if (response.status === 400) {
        deleteModalClose();
        ErrorMessage(
          response.data.error || "Default warehouse cannot be deleted."
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
          <div className="p-4">
            <div className="card">
              <div className="card-body ">
                <div className="row">
                  <div className="col-md-6 col-sm-6 col-12">
                  <h3 className="card-title">Stores</h3>
                  <p>You can create multiple stores/ warehouses here</p>
                  </div>
                  <div className="col-md-6 col-sm-6 col-12 mb-2">
                  <button
                    onClick={() => setCreate(true)}
                    className="me-2 btn btn-exp-primary btn-sm ms-auto"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add New Store
                  </button>
                  </div>
                </div>

                {/* <div className="card-body"> */}
                <ul
                  className="nav nav-tabs gth-tabs"
                  id="systemControllerFilterTab"
                  role="tablist"
                >
                  {[
                    "Finished Goods",
                    "Raw Material",
                    "Reject/Scrap Store",
                  ].map((tab) => (
                    <li className="nav-item" role="presentation" key={tab}>
                      <button
                        className={`nav-link ${key === tab ? "active" : ""}`}
                        onClick={() => setKey(tab)}
                        data-bs-toggle="tab"
                        data-bs-target={`#tab-${tab}`}
                        type="button"
                        role="tab"
                        aria-controls={`tab-${tab}`}
                        aria-selected={key === tab}
                      >
                        <span className="btn-todo">{tab}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="tab-content pt-0">
                  <div className="tab-pane active" role="tabpanel">
                    <div className="px-0 pt-3">
                      <div className="row">
                        {Array.isArray(data) &&
                          data.map((item) => (
                            <div
                              key={item.id}
                              className="col-lg-4 col-md-6 col-12"
                            >
                              <div
                                className={`rounded-10 border ${item.is_default === 1
                                  ? "gth-bg-success-light"
                                  : ""
                                  } mb-3`}
                              >
                                <div className="p-3">
                                  <div className="d-flex align-items-center">
                                    <h5 className="my-1 fs-6">{item.name}</h5>
                                    <Dropdown align="end" className="ms-auto">
                                      <Dropdown.Toggle
                                        className="scal-threedot-dropdown"
                                        variant="unset"
                                      >
                                        <i className="fas fa-ellipsis-v"></i>
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu className="">
                                        <Dropdown.Item
                                          onClick={() => {
                                            setSelectedStoreData(item);
                                            setUpdate(true);
                                          }}
                                        >
                                          {" "}
                                          Edit
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                          onClick={() => {
                                            setDeleteShow(true);
                                            setDeleteId(item.id);
                                          }}
                                        >
                                          {" "}
                                          Delete{" "}
                                        </Dropdown.Item>
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  </div>
                                  <div className="store-address">
                                    <div className="px-2 f-s-14 text-muted">
                                      {item.location}
                                    </div>
                                    <div className="px-2 f-s-14 text-muted">
                                      {item.address2}
                                    </div>
                                    <div className="px-2 f-s-14 text-muted">
                                      {item.city}
                                    </div>
                                    {/* <div className="px-2 f-s-14 text-muted">
                                      {item.country}
                                    </div>
                                    <div className="px-2 f-s-14 text-muted">
                                      {item.state}
                                    </div> */}
                                    <div className="px-2 f-s-14 text-muted">
                                      {item.pin}
                                    </div>
                                    {/* <div className="p-2 f-s-14 text-muted">
                                      <b>GSTIN</b> - {item.gstn_no}
                                    </div> */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* </div> */}
              </div>
            </div>
          </div>
        </>
      )}
      {/* create Department */}
      <Modal
        backdrop="static"
        show={create}
        onHide={storeCreateModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Store</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label"> Store Name <span className="text-danger">*</span></label>
              <input
                type="text"
                id="store_name"
                name="name"
                placeholder="Enter Store Name"
                className="form-control"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    name: e.target.value.trim(),
                  })
                }
              />
              {errorMessage?.store_name && (
                <span className="error-message">{errorMessage.store_name}</span>
              )}
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">
                Select Store Type <span className="text-danger">*</span>
              </label>
              <Form.Select
                required
                aria-label="Default select example"
                name="store_type"
                value={createStoreData.store_type}
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    store_type: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Reject/Scrap Store"> Reject/Scrap Store</option>
              </Form.Select>
              {errorMessage?.store_type && (
                <span className="error-message">{errorMessage.store_type}</span>
              )}
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label"> Store Location </label>
              <input
                type="text"
                id="store_location"
                name="location"
                placeholder="Enter Store Location"
                className="form-control"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    location: e.target.value.trim(),
                  })
                }
              />
              {errorMessage?.store_location && (
                <span className="error-message">{errorMessage.store_location}</span>
              )}
            </div>
          </div>
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">GSTIN Type</label>
              <Form.Select
                required
                aria-label="Default select example"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    gstn_type: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="Regular">Regular</option>
                <option value="Unregistered">Unregistered</option>
                <option value="Composition">Composition</option>
                <option value="Consumer">Consumer</option>
                <option value="Unknown">Unknown</option>
              </Form.Select>
            </div>
          </div> */}
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter GSTIN"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    gstn_no: e.target.value,
                  })
                }
              />
            </div>
          </div> */}
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">Address 1</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Address 1"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    address1: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Address 2</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Address 2"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    address2: e.target.value,
                  })
                }
              />
            </div>
          </div> */}
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">City <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter City"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    city: e.target.value.trim(),
                  })
                }
              />
              {errorMessage?.city && (
                <span className="error-message">{errorMessage.city}</span>
              )}
            </div>
          </div>
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">Country </label>
              <select
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    country: e.target.value,
                  })
                }
                className="form-control"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.country} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
            </div>
          </div> */}
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">State </label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter State"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    state: e.target.value,
                  })
                }
              />
            </div>
          </div> */}
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Pin <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Pin"
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    pin: e.target.value.trim(),
                  })
                }
              />
              {errorMessage?.pin && (
                <span className="error-message">{errorMessage.pin}</span>
              )}
            </div>
          </div>
          <div className="col-12">
          <label class="custom-checkbox form-label" htmlFor="is_fg_store">
            Set as CWHFG store?
            <input
                type="checkbox"
                id="is_fg_store"
                checked={createStoreData.is_fg_store === 1}
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    is_fg_store: e.target.checked ? 1 : 0,
                  })
                }
              />
            <span class="checkmark"></span>
          </label>
          </div>
          <div className="col-12">
          <label class="custom-checkbox form-label" htmlFor="is_rm_store">
            Set RMHFG store?
              <input
                type="checkbox"
                id="is_rm_store"
                checked={createStoreData.is_rm_store === 1}
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    is_rm_store: e.target.checked ? 1 : 0,
                  })
                }
              />
            <span class="checkmark"></span>
          </label>
          </div>
          {/* <div className="col-12">
            <div className="form-group">
              <input
                type="checkbox"
                value={1}
                onChange={(e) =>
                  setCreateStoreData({
                    ...createStoreData,
                    is_default: e.target.value,
                  })
                }
              />{" "}
              <label className="form-label">Mark As Default</label>
            </div>
          </div> */}
        </Modal.Body>
        <Modal.Footer>
          <Button type='reset'
            variant="secondary"
            className="btn-sm"
            onClick={storeCreateModal}
          >
            Close
          </Button>
          <Button type='submit' variant="primary" className="btn-sm" onClick={createStore}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update department */}
      <Modal show={update} onHide={storeUpdateModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Store</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-12">
            <div className="form-group">
            <label className="form-label"> Store Name <span className="text-danger">*</span></label>
              <input
                type="text"
                id="update_store_name"
                name="name"
                placeholder="Enter Store Name"
                className="form-control"
                value={selectedStoreData.name}
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    name: e.target.value.trim(),
                  })
                }
              />
              {errorMessage?.update_store_name && (
                <span className="error-message">{errorMessage.update_store_name}</span>
              )}
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">
                Select Store Type <span className="text-danger">*</span>
              </label>
              <Form.Select
                id="update_store_type"
                name="update_store_type"
                value={selectedStoreData.store_type}
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    store_type: e.target.value,
                  })
                }
              >
                <option value="">Select Store Type</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Reject/Scrap Store"> Reject/Scrap Store</option>
              </Form.Select>
              {errorMessage?.update_store_type && (
                <span className="error-message">{errorMessage.update_store_type}</span>
              )}
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label"> Store Location </label>
              <input
                type="text"
                id="update_store_location"
                name="location"
                placeholder="Enter Store Location"
                className="form-control"
                value={selectedStoreData.location || ''}
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    location: e.target.value.trim(),
                  })
                }
              />
              {errorMessage?.update_store_location && (
                <span className="error-message">{errorMessage.update_store_location}</span>
              )}
            </div>
          </div>
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                value={selectedStoreData.gstn_no}
                className={`form-control`}
                placeholder="Enter GSTIN"
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    gstn_no: e.target.value,
                  })
                }
              />
            </div>
          </div> */}
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">Address 1</label>
              <input
                type="text"
                value={selectedStoreData.address1}
                className={`form-control`}
                placeholder="Enter Address 1"
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    address1: e.target.value,
                  })
                }
              />
            </div>
          </div> */}
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">Address 2</label>
              <input
                type="text"
                className={`form-control`}
                value={selectedStoreData.address2}
                placeholder="Enter Address 2"
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    address2: e.target.value,
                  })
                }
              />
            </div>
          </div> */}
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">City <span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="update_city"
                  className={`form-control`}
                  placeholder="Enter City"
                  value={selectedStoreData.city}
                  onChange={(e) =>
                    setSelectedStoreData({
                      ...selectedStoreData,
                      city: e.target.value.trim(),
                    })
                  }
                />
                {errorMessage?.update_city && (
                  <span className="error-message">{errorMessage.update_city}</span>
                )}
            </div>
          </div>

          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">Country </label>
              <select
                value={selectedStoreData.country}
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    country: e.target.value,
                  })
                }
                className="form-control"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.country} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
            </div>
          </div> */}
          {/* <div className="col-12">
            <div className="form-group">
              <label className="form-label">State </label>
              <input
                type="text"
                value={selectedStoreData.state}
                className={`form-control`}
                placeholder="Enter State"
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    state: e.target.value,
                  })
                }
              />
            </div>
          </div> */}
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Pin <span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="update_pin"
                  className={`form-control`}
                  placeholder="Enter Pin"
                  value={selectedStoreData.pin}
                  onChange={(e) =>
                    setSelectedStoreData({
                      ...selectedStoreData,
                      pin: e.target.value.trim(),
                    })
                  }
                />
                {errorMessage?.update_pin && (
                  <span className="error-message">{errorMessage.update_pin}</span>
                )}
            </div>
          </div>
          <div className="col-12">
          <label class="custom-checkbox form-label" htmlFor="update_is_fg_store">
            Set as CWHFG store?
              <input
                type="checkbox"
                id="update_is_fg_store"
                checked={Number(selectedStoreData.is_fg_store) === 1}
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    is_fg_store: e.target.checked ? 1 : 0,
                  })
                }
              />
            <span class="checkmark"></span>
          </label>
          </div>
          <div className="col-12">
          <label class="custom-checkbox form-label" htmlFor="update_is_rm_store">
            Set RMHFG store?
              <input
                type="checkbox"
                id="update_is_rm_store"
                checked={Number(selectedStoreData.is_rm_store) === 1}
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    is_rm_store: e.target.checked ? 1 : 0,
                  })
                }
              />
            <span class="checkmark"></span>
          </label>
          </div>
          {/* <div className="col-12">
            <div className="form-group">
              <input
                type="checkbox"
                checked={selectedStoreData.is_default === 1}
                value={1}
                onChange={(e) =>
                  setSelectedStoreData({
                    ...selectedStoreData,
                    is_default: e.target.value,
                  })
                }
              />{" "}
              <label className="form-label">Mark As Default</label>
            </div>
          </div> */}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="btn-sm"
            onClick={storeUpdateModalClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            className="btn-sm"
            onClick={updateStore}
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
          <div className="delete-confirm-wrap text-center">
            <div className="delete-confirm-icon mb-3 mt-2">
              <img
                src={
                  process.env.PUBLIC_URL + "/assets/images/delete-warning.svg"
                }
                alt="Warning"
                className="img-fluid"
              />
            </div>
            <h4 className="text-muted">Are you sure?</h4>
            <p className="text-muted">
              Do you really want to delete these record?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type='reset'
            className="btn btn-secondary btn-sm"
            onClick={deleteModalClose}
          >
            Cancel
          </button>
          <button type='submit' className="btn btn-exp-red btn-sm" onClick={deleteStore}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default WarehousesPermission;
