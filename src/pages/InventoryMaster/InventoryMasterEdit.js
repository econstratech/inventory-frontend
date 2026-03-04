import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip, Modal, Table } from "react-bootstrap";

import Select from "react-select";

import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile, url
} from "../../environment/AxiosInstance";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import InventoryMasterEditTopBar from "./InventoryMasterEdit/InventoryMasterEditTopBar";
function InventoryMasterEdit() {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditing1, setIsEditing1] = useState(false);
  const [isEditing2, setIsEditing2] = useState(false);
  const [isEditing3, setIsEditing3] = useState(false);
  const [isEditingO, setIsEditingO] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteShow, setDeleteShow] = useState(false);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const location = useLocation();
  const { Logout, getUomData, getGeneralSettingssymbol } = UserAuth();
  const navigate = useNavigate();
  const { data } = location.state || {};
  const { id } = useParams();
  const [catProduct, setcategory] = useState([
    { value: "select", label: "-Select-" },
  ]);


  // store name diplay
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await PrivateAxios.get('warehousesselect');
        setStores(response.data.data || []); // Ensure data exists
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    fetchStores();
  }, []);

  // Create a map of store_id to store name for easy lookup
  const storeMap = stores.reduce((map, store) => {
    map[store.id] = store.name;
    return map;
  }, {});
  // user name display
  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await PrivateAxios.get('user/all-user');
        setUsers(response.data.user); // Adjust this based on your actual API response structure
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };


    fetchUsers();
  }, []);

  const userMap = {};
  users.forEach(user => {
    userMap[user.id] = user.name; // Map user ID to user name
  });
  //end 

  const fetchData = async () => {
    try {
      const res = await PrivateAxios.get(`product/select_product/${id}`);

      setFormData(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        Logout();
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [formData, setFormData] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState({});
  useEffect(() => {
    const AllProducts = async () => {
      const newUserArray = await AllCategories();
      if (newUserArray == 401) {
        Logout();
      }
      const newUserList = newUserArray.cat.map((data) => ({
        value: data.id,
        label: data.title,
      }));
      setcategory(newUserList);
    };
    AllProducts();
  }, []);
  const getTaskData = (e, data) => {
    if (e.target) {
      const name = e.target.name;
      setFormData((prevData) => ({
        ...prevData,
        [name]: e.target.value,
      }));
    } else {
      setFormData((prevData) => {
        let updatedData = { ...prevData, [data.name]: e.value };

        // Handle product_category separately
        if (data.name === "product_category") {
          updatedData = {
            ...updatedData,
            product_category: e.value,
            product_category_label: e.label,
          };
        }

        // Handle product_uom separately
        if (data.name === "product_uom") {
          updatedData = {
            ...updatedData,
            unit: e.id,
          };
        }

        return updatedData;
      });
    }
  };

  const fileUpload = async (e) => {
    const file = e.target.files[0];
    let fileSize = file.size;
    if (Number(fileSize) >= 2097152) {
      setError({ file: "This image in getter than 2MB" });
    } else {
      setFormData({ ...formData, file: e.target.files[0] });
      setError("");
    }
  };
  const handleSectionUpdate = async (sectionName) => {
    let sectionData = {};
    let editdata = new FormData()
    switch (sectionName) {
      case "BasicDetails":
        sectionData = {
          product_code: formData.item_id,
          product_name: formData.product_name,
          type: formData.buy_sell_both,
          product_category: formData.product_category,
          unit: formData.unitvalue,
          tax: formData.tax,
          hsnCode: formData.hsnCode,
          sku_product: formData.sku_product,
         
        };
        break;
      case "PriceDetails":
        sectionData = {
          product_price: formData.product_price,
          regular_buying_price: formData.regular_buying_price,
          regular_selling_price: formData.regular_selling_price,
          dealer_price: formData.dealer_price,
          wholesale_buying_price: formData.wholesale_buying_price,
          mrp: formData.mrp,
          distributor_price: formData.distributor_price,
        };
        break;
      case "StockDetails":
        sectionData = {
          total_stock: formData.total_stock,
          minimum_stock_level: formData.minimum_stock_level,
          reject_stock: formData.reject_stock,
          maximum_stock_level: formData.maximum_stock_level,
        };
        break;
      case "OthersDetails":
        sectionData = {
          safety_stock: formData.safety_stock,
          sku_description: formData.sku_description,
          replenishment_time: formData.replenishment_time,
          replenishment_multiplications: formData.replenishment_multiplications,
          minimum_replenishment: formData.minimum_replenishment,
          buffer_size: formData.buffer_size,
        };
        break;
      case "Attachments":
        editdata.append("file", formData.file)
        break;
      default:
        console.error("Invalid section name");
        return;
    }

    try {

      const response = await PrivateAxiosFile.post(`product/update/${id}`, sectionName == 'Attachments' ? editdata : sectionData);
      if (response.status === 200) {
        setIsEditing(false);
        setIsEditing1(false);
        setIsEditing2(false);
        setIsEditing3(false);
        setIsEditingO(false);
        fetchData();
        SuccessMessage("Data saved successfully");
      } else {
        ErrorMessage("Failed to save data");
      }
    } catch (error) {
      console.error("Error updating section:", error);
    }
  };

  //delete
  const deleteModalClose = () => setDeleteShow(false);
  // const deleteModalShow = () => setDeleteShow(true);
  //delete
  const deleteModalShow = (id) => {
    setDeleteId(id);
    setDeleteShow(true);
  };
  const handleDelete = () => {
    PrivateAxios.delete(`product/${deleteId}`)
      .then((res) => {
        setDeleteShow(false);
        setDeleteId(null);
        SuccessMessage("Record deleted successfully");
        navigate('/inventory/inventory-master');
      })
      .catch((error) => {
        console.error('Error deleting data:', error);
        setDeleteShow(false);
        setDeleteId(null);
      });
  };
  const getAdjustmentDisplayName = (adjustmentType) => {
    switch (adjustmentType) {
      case 'adjustment':
        return 'Manual Adjustment';
      case 'Out':
        return 'Dispatched'; // Assuming you want 'Out' to display as 'Dispatched'
      case 'StockTransfer':
        return 'Stock Transfer';
      default:
        return adjustmentType; // Default to the original name
    }
  };
  return (
    <>
    <InventoryMasterEditTopBar/>
      <div className="p-4">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Item Details</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">
                        Basic Details
                      </h5>
                      <label className="mb-0 badge exp-badge-primary-light rounded-pill">
                        Product
                      </label>
                    </div>
                    <div className="ms-auto">
                      {!isEditing ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <button type='button' className="btn icon-btn w-fit-content" onClick={() => deleteModalShow(data.id)}>
                              <i className="fas fa-trash-alt text-danger"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditing(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditing(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("BasicDetails")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Item Id</label>
                          <input
                            type="text"
                            name="product_code"
                            placeholder="Enter Item Id"
                            className="form-control"
                            value={formData.product_code}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Item Name</label>
                          <input
                            type="text"
                            name="product_name"
                            placeholder="Enter Item Name"
                            className="form-control"
                            value={formData.product_name}
                            onChange={getTaskData}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Type</label>
                          <select
                            name="type"
                            className="form-select"
                            onChange={getTaskData}
                            value={formData.type}
                            disabled={!isEditing}
                          >
                            <option>Select</option>
                            <option value="Buy">Buy</option>
                            <option value="Sell">Sell</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Item Category</label>
                          <Select
                            name="product_category"
                            value={
                              formData.product_category
                                ? { value: formData.product_category, label: formData.product_category_label || formData.Categories?.title }
                                : null
                            }
                            options={catProduct}
                            onChange={getTaskData}
                            isDisabled={!isEditing}
                          />

                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Unit of Measurement (UoM)
                          </label>
                          <Select
                            name="product_uom"
                            value={getUomData.find((item) => item.id == formData.unit) || null}
                            options={getUomData}
                            getOptionLabel={(option) => option.unit_name}
                            getOptionValue={(option) => option.id}
                            onChange={getTaskData}
                            isDisabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Tax</label>
                          <input
                            type="text"
                            name="tax"
                            value={formData.tax}
                            placeholder="Enter TAX"
                            className="form-control"
                            onChange={getTaskData}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">HSN Code</label>
                          <input
                            type="text"
                            name="hsn_code"
                            value={formData.hsn_code}
                            placeholder="Enter HSN Code"
                            className="form-control"
                            onChange={getTaskData}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">SKU</label>
                          <input
                            type="text"
                            name="sku_product"
                            value={formData.sku_product}
                            placeholder="Enter SKU"
                            className="form-control"
                            onChange={getTaskData}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                 
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">
                        Price Details
                      </h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditing2 ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditing2(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditing2(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("PriceDetails")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Default Price</label>
                          <div className="d-flex">
                            <input
                              type="text"
                              placeholder="Enter Default Price"
                              onChange={getTaskData}
                              value={formData.product_price}
                              name="product_price"
                              className="form-control"
                              disabled={!isEditing2}
                            />
                            <button type='button' className="link-btn ps-2">
                              <i className="fas fa-long-arrow-alt-down text-primary"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <h6>Other Prices</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Regular Buying Price</label>
                          <input
                            type="text"
                            name="regular_buying_price"
                            placeholder="Enter Regular Buying Price"
                            onChange={getTaskData}
                            value={formData.regular_buying_price}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Wholesale Buying Price</label>
                          <input
                            type="text"
                            name="wholesale_buying_price"
                            placeholder="Enter Wholesale Buying Price"
                            onChange={getTaskData}
                            value={formData.wholesale_buying_price}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Regular Selling Price</label>
                          <input
                            type="text"
                            name="regular_selling_price"
                            placeholder="Enter Regular Selling Price"
                            onChange={getTaskData}
                            value={formData.regular_selling_price}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">MRP</label>
                          <input
                            type="text"
                            name="mrp"
                            placeholder="Enter MRP"
                            onChange={getTaskData}
                            value={formData.mrp}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Dealer Price</label>
                          <input
                            type="text"
                            name="dealer_price"
                            placeholder="Enter Dealer Price"
                            onChange={getTaskData}
                            className="form-control"
                            value={formData.dealer_price}
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Distributor Price</label>
                          <input
                            type="text"
                            name="distributor_price"
                            placeholder="Enter Distributor Price"
                            onChange={getTaskData}
                            value={formData.distributor_price}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}

              <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">
                        Stock Details
                      </h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditing1 ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditing1(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditing1(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("StockDetails")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Total Stock</label>
                          <input
                            type="text"
                            placeholder="Enter Total Stock "
                            name="total_stock"
                            onChange={getTaskData}
                            value={formData.total_stock}
                            className="form-control"
                            disabled={!isEditing1}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Reject Stock</label>
                          <input
                            type="text"
                            placeholder="Enter Reject Stock"
                            name="reject_stock"
                            onChange={getTaskData}
                            value={formData.reject_stock}
                            className="form-control"
                            disabled={!isEditing1}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Minimum Stock Level</label>
                          <input
                            type="text"
                            value={formData.maximum_stock_level}
                            name="maximum_stock_level"
                            onChange={getTaskData}
                            placeholder="Enter Minimum Stock Level"
                            className="form-control"
                            disabled={!isEditing1}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Maximum Stock Level</label>
                          <input
                            type="text"
                            value={formData.minimum_stock_level}
                            name="minimum_stock_level"
                            onChange={getTaskData}
                            placeholder="Enter Maximum Stock Level"
                            className="form-control"
                            disabled={!isEditing1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">
                        Others Details
                      </h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditingO ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditingO(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditingO(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("OthersDetails")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Safety Stock</label>
                          <input
                            type="text"
                            name="safety_stock"
                            onChange={getTaskData}
                            placeholder="Enter Safty Stock "
                            value={formData.safety_stock}
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">SKU Description</label>
                          <input
                            type="text"
                            name="sku_description"
                            onChange={getTaskData}
                            placeholder="Enter SKU Description"
                            value={formData.sku_description}
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Replenishment Time</label>
                          <input
                            type="text"
                            name="replenishment_time"
                            onChange={getTaskData}
                            value={formData.replenishment_time}
                            placeholder="Enter Replenishment Time"
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Replenishment Multiplications
                          </label>
                          <input
                            type="text"
                            name="replenishment_multiplications"
                            onChange={getTaskData}
                            value={formData.replenishment_multiplications}
                            placeholder="Enter Replenishment Multiplications"
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Minimum Replenishment</label>
                          <input
                            type="text"
                            name="minimum_replenishment"
                            onChange={getTaskData}
                            value={formData.minimum_replenishment}
                            placeholder="Enter Minimum Replenishment"
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Buffer Size</label>
                          <input
                            type="text"
                            name="buffer_size"
                            onChange={getTaskData}
                            value={formData.buffer_size}
                            placeholder="Enter Buffer Size"
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">Attachments</h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditing3 ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditing3(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditing3(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("Attachments")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Upload File</label>

                      <input
                        type="file"
                        className="form-control"
                        placeholder="Enter Task Name"
                        accept=".png, .jpg, .jpeg"
                        onChange={fileUpload}
                        disabled={!isEditing3}
                      />
                    </div>
                    <div className="gth-attachment-body">
                      <figure className="gth-attachment-tile-item">

                        <div className="attachment-image">
                          <div className="image-expand">
                            <img className="figure-img" src={formData.attachment_file != null ? url + '/' + formData.attachment_file : url + '/no-image.svg'} />
                          </div>
                        </div>

                      </figure>

                    </div>
                  </div>
                </div>
              </div> */}

            </div>

          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center border-bottom-0">
                <h5 className="my-1">Inventory History</h5>
                <div className="ms-auto d-flex flex-wrap align-items-center">
                  <select className="form-select w-200 m-1">
                    <option>Select UOM</option>
                  </select>
                  <select className="form-select w-200 m-1">
                    <option>Select Store</option>
                  </select>
                  <button type='button' className="btn btn-warning">
                    <i className="fas fa-download me-2"></i>Download
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered primary-table-head">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Changed Via</th>
                        <th>Reference</th>
                        <th>Previous Quantity</th>
                        <th>Change Quantity</th>
                        <th>New Quantity</th>
                        <th>Price</th>
                        <th>Comment</th>
                        <th>User</th>
                        <th>Store</th>
                      </tr>

                    </thead>
                    <tbody>
                      {formData.TrackProductStock &&
                        formData.TrackProductStock
                          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // Sort in ascending order (oldest first)
                          .reduce((acc, stock, index, array) => {
                            const changeQuantity = stock.status_in_out > 0 ? stock.quantity_changed : -stock.quantity_changed;
                            const previousQuantity = index === 0 ? 0 : acc.newQuantity;
                            const newQuantity = previousQuantity + changeQuantity;

                            // Fetch store name from storeMap based on stock.store_id
                            const storeName = storeMap[stock.store_id] || 'Unknown Store';

                            acc.rows.push(
                              <tr key={stock.id}>
                                {/* Date Column */}
                                <td>
                                  {new Date(stock.created_at).toLocaleDateString()},<br />
                                  {new Date(stock.created_at).toLocaleTimeString()}
                                </td>

                                {/* Adjustment Type */}
                                <td>
                                  <div className="d-flex">
                                    <a href={`/inventory/inventory-master-adjustment/${stock.reference_number}`} className="text-primary">
                                      {getAdjustmentDisplayName(stock.adjustmentType)} ({stock.reference_number})
                                    </a>
                                    <a href={`/inventory/inventory-master-adjustment/${stock.reference_number}/`} className="text-primary">
                                      {/* <i className="fas fa-external-link-alt ms-2"></i> */}
                                      <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="ms-2"><path d="M19.5,0H10.5c-.828,0-1.5,.671-1.5,1.5s.672,1.5,1.5,1.5h8.379L.439,21.439c-.586,.585-.586,1.536,0,2.121,.293,.293,.677,.439,1.061,.439s.768-.146,1.061-.439L21,5.121V13.5c0,.829,.672,1.5,1.5,1.5s1.5-.671,1.5-1.5V4.5c0-2.481-2.019-4.5-4.5-4.5Z" /></svg>
                                    </a>
                                  </div>
                                </td>

                                {/* Reference Number */}
                                <td>
                                  <div className="d-flex">
                                    <a href={`/inventory/view_document_approval/${stock.reference_number}/${stock.id}/${changeQuantity}/${newQuantity}`} className="text-primary">
                                      {stock.reference_number}
                                    </a>
                                    <a href={`/inventory/view_document_approval/${stock.reference_number}/${stock.id}/${changeQuantity}/${newQuantity}`} className="text-primary">
                                      {/* <i className="fas fa-external-link-alt ms-2"></i> */}
                                      <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="ms-2"><path d="M19.5,0H10.5c-.828,0-1.5,.671-1.5,1.5s.672,1.5,1.5,1.5h8.379L.439,21.439c-.586,.585-.586,1.536,0,2.121,.293,.293,.677,.439,1.061,.439s.768-.146,1.061-.439L21,5.121V13.5c0,.829,.672,1.5,1.5,1.5s1.5-.671,1.5-1.5V4.5c0-2.481-2.019-4.5-4.5-4.5Z" /></svg>
                                    </a>
                                  </div>
                                </td>

                                {/* Previous Quantity */}
                                <td>{previousQuantity}</td>

                                {/* Change Quantity */}
                                <td>{changeQuantity > 0 ? `+${changeQuantity}` : changeQuantity}</td>

                                {/* New Quantity */}
                                <td>{newQuantity}</td>

                                {/* Price */}
                                <td >
                                  <span className="d-flex">
                                    {getGeneralSettingssymbol}{stock.default_price}
                                  </span>
                                </td>

                                {/* Comment */}
                                <td>{stock.comment ? stock.comment : '-'}</td>

                                {/* User */}
                                <td>{userMap[stock.user_id] || 'Unknown User'}</td>

                                {/* Store Name */}
                                <td>{storeName}</td>
                              </tr>
                            );

                            // Update the newQuantity for the next iteration
                            acc.newQuantity = newQuantity;
                            return acc;
                          }, { rows: [], newQuantity: 0 }).rows.reverse() // Reverse rows to show the newest entry first
                      }
                    </tbody>





                  </table>

                </div>
                <div className="my-2 d-flex align-items-center justify-content-between px-3">
                  <div className="d-flex align-items-center">
                    <nav aria-label="Page navigation example">
                      <ul className="pagination mb-0">
                        <li className="page-item">
                          <a className="page-link" href="#" aria-label="Previous">
                            <span aria-hidden="true">«</span>
                          </a>
                        </li>
                        <li className="page-item">
                          <a className="page-link" href="#">
                            1
                          </a>
                        </li>
                        <li className="page-item">
                          <a className="page-link" href="#">
                            2
                          </a>
                        </li>
                        <li className="page-item">
                          <a className="page-link" href="#">
                            3
                          </a>
                        </li>
                        <li className="page-item">
                          <a className="page-link" href="#" aria-label="Next">
                            <span aria-hidden="true">»</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                    <select className="form-select mx-2 w-70px">
                      <option>5</option>
                      <option>10</option>
                      <option>20</option>
                      <option>30</option>
                      <option>50</option>
                    </select>
                    <span className="text-muted text-nowrap">Items per page</span>
                  </div>
                  <div className="text-muted">1 - 6 of 6 items</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Delete modal start */}
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
              Do you really want to delete these record? This process cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className='justify-content-center'>
          <button type='reset' className='btn btn-secondary' onClick={deleteModalClose}>
            Cancel
          </button>
          <button type='submit'className='btn btn-exp-red' onClick={handleDelete}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
      {/* Delete modal end */}
    </>

  );
}

export default InventoryMasterEdit;
