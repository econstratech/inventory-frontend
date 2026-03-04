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
function InventoryMasterEditItemHistory() {
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
          <button type='button' className='btn btn-secondary' onClick={deleteModalClose}>
            Cancel
          </button>
          <button type='submit' className='btn btn-exp-red' onClick={handleDelete}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
      {/* Delete modal end */}
    </>

  );
}

export default InventoryMasterEditItemHistory;
