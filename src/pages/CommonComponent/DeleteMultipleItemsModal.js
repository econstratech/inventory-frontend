import React, { useState, useEffect } from "react";
import { Modal, Table } from 'react-bootstrap';
import {
  Axios,
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";


const DeleteMultipleItemsModal = ({ show, onClose, removeItem }) => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsRestore, setSelectedItemsRestore] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Items per page
  const [deleteData, setdeletedProducts] = useState([]);
 // Fetch active products
 const fetchActiveData = async () => {
  try {
    const response = await PrivateAxios.get("product/list");
    setProducts(response.data.data || []);
  } catch (error) {
    console.error("Error fetching active products:", error);
  }
};

// Fetch deleted products
const fetchDeleteData = async () => {
  try {
    const response = await PrivateAxios.get("product/all-deleted-products");
    setdeletedProducts(response.data.data || []);
  } catch (error) {
    console.error("Error fetching deleted products:", error);
  }
};

useEffect(() => {
  fetchActiveData();
  fetchDeleteData();
}, []);

// Handle checkbox toggle
const handleCheckboxChange = (id) => {
  setSelectedItems((prevSelected) =>
    prevSelected.includes(id)
      ? prevSelected.filter((itemId) => itemId !== id)
      : [...prevSelected, id]
  );
};
console.log(selectedItemsRestore,'ccc');

// Handle checkbox toggle
const handleCheckboxChangeRestore = (id) => {
  setSelectedItemsRestore((prevSelectedRestore) =>
    prevSelectedRestore.includes(id)
      ? prevSelectedRestore.filter((itemId) => itemId !== id)
      : [...prevSelectedRestore, id]
  );
};

// Soft remove items
const handleMultipleDelete = async () => {
  if (selectedItems.length === 0) {
    ErrorMessage("No items selected for deletion");
    return;
  }

  try {
    const response = await PrivateAxios.delete("product/delete-multiple", {
      data: { productIds: selectedItems },
    });

    if (response.data.message) {
      SuccessMessage(response.data.message);

      // Update active products
      setProducts((prevProducts) =>
        prevProducts.filter((product) => !selectedItems.includes(product.id))
      );

      setSelectedItems([]);

      // Fetch updated deleted products
      fetchDeleteData();
    }
  } catch (error) {
    console.error("Error deleting products:", error.response?.data || error);
    ErrorMessage("Failed to delete selected products. Please try again.");
  }
};


//remove item restore
const handleMultipleDeleteRestore = async () => {
  if (selectedItemsRestore.length === 0) {
    ErrorMessage("No items selected for deletion");
    return;
  }

  try {
    const response = await PrivateAxios.delete("product/delete-multiple-restore", {
      data: { productIdsRestore: selectedItemsRestore },
    });

    if (response.data.message) {
      SuccessMessage(response.data.message);

      // Update active products
      setdeletedProducts((prevProducts) =>
        prevProducts.filter((product) => !selectedItemsRestore.includes(product.id))
      );

      setSelectedItemsRestore([]);

      // Fetch updated deleted products
      fetchActiveData();
    }
  } catch (error) {
    console.error("Error deleting products:", error.response?.data || error);
    ErrorMessage("Failed to delete selected products. Please try again.");
  }
};

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <Modal
      id="DeleteMultipleItemModal"
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
      size="xxl"
    >
      <Modal.Header closeButton>
        <Modal.Title>Delete Items (Multiple)</Modal.Title>
      </Modal.Header>
      <Modal.Body className="moday-body-overflow-none">
        <div className="w-100">
          <ul className="nav nav-tabs gth-tabs gth-tabs" id="myTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="delete-file-tab"
                data-bs-toggle="tab"
                data-bs-target="#delete-file"
                type="button"
                role="tab"
                aria-controls="delete-file"
                aria-selected="true"
              >
                Delete File
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="verify-file-tab"
                data-bs-toggle="tab"
                data-bs-target="#verify-file"
                type="button"
                role="tab"
                aria-controls="verify-file"
                aria-selected="false"
              >
                Verify File
              </button>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className="tab-pane fade show active py-3"
              id="delete-file"
              role="tabpanel"
              aria-labelledby="delete-file-tab"
            >
              <div className="fixed-table-wrapper fixed_first_col">
                <table className="table table-striped fixedTable-head">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Item ID *</th>
                      <th>Item Name</th>
                      <th>Product/Service</th>
                      <th>Item Type (Buy/Sell/Both)</th>
                      <th>Unit of Measurement</th>
                      <th>HSN Code</th>
                      <th>Default Price</th>
                      <th>Regular Buying Price</th>
                      <th>Wholesale Buying Price</th>
                      <th>Regular Selling Price</th>
                      <th>MRP</th>
                      <th>Dealer Price</th>
                      <th>Distributor Price</th>
                      <th>Min Stock Level</th>
                      <th>Max Stock Level</th>
                      <th>Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <label className="custom-checkbox me-0 mb-0">
                              <input
                                type="checkbox"
                                onChange={() => handleCheckboxChange(product.id)}
                                checked={selectedItems.includes(product.id)}
                              />
                              <span className="checkmark"></span>
                            </label>
                          </td>
                          <td><div style={{ width: '150px' }}>{product.product_code}</div></td>
                          <td><div style={{ width: '150px' }}>{product.product_name}</div></td>
                          <td><div style={{ width: '150px' }}>{product.product_type}</div></td>
                          <td><div style={{ width: '200px' }}>{product.type}</div></td>
                          <td><div style={{ width: '150px' }}>{product.Masteruom?.unit_name || "N/A"}</div></td>
                          <td><div style={{ width: '150px' }}>{product.hsn_code}</div></td>
                          <td><div style={{ width: '150px' }}>{product.product_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.regular_buying_price}</div></td>
                          <td><div style={{ width: '200px' }}>{product.wholesale_buying_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.regular_selling_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.mrp}</div></td>
                          <td><div style={{ width: '150px' }}>{product.dealer_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.distributor_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.minimum_stock_level}</div></td>
                          <td><div style={{ width: '150px' }}>{product.maximum_stock_level}</div></td>
                          <td><div style={{ width: '150px' }}>{product.tax} %</div></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              <div className="d-flex flex-wrap justify-content-between gap-3 align-items-center mt-3">
                <div className="d-flex gap-3">
                  <button
                    className="link-btn"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <i class="fas fa-angle-double-left me-1"></i> Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="link-btn"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next <i class="fas fa-angle-double-right ms-1"></i>
                  </button>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleMultipleDelete}
                    disabled={selectedItems.length === 0}
                  >
                    Remove Selected
                  </button>
                </div>
              </div>

            </div>

            <div
              className="tab-pane fade py-3"
              id="verify-file"
              role="tabpanel"
              aria-labelledby="verify-file-tab"
            >
              <div className="fixed-table-wrapper fixed_first_col">
              <table className="table table-striped fixedTable-head">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Item ID *</th>
                      <th>Item Name</th>
                      <th>Product/Service</th>
                      <th>Item Type (Buy/Sell/Both)</th>
                      <th>Unit of Measurement</th>
                      <th>HSN Code</th>
                      <th>Default Price</th>
                      <th>Regular Buying Price</th>
                      <th>Wholesale Buying Price</th>
                      <th>Regular Selling Price</th>
                      <th>MRP</th>
                      <th>Dealer Price</th>
                      <th>Distributor Price</th>
                      <th>Min Stock Level</th>
                      <th>Max Stock Level</th>
                      <th>Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deleteData.length > 0 ? (
                      deleteData.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <label className="custom-checkbox me-0 mb-0">
                              <input
                                type="checkbox"
                                onChange={() => handleCheckboxChangeRestore(product.id)}
                                checked={selectedItemsRestore.includes(product.id)}
                              />
                              <span className="checkmark"></span>
                            </label>
                          </td>
                          <td><div style={{ width: '150px' }}>{product.product_code}</div></td>
                          <td><div style={{ width: '150px' }}>{product.product_name}</div></td>
                          <td><div style={{ width: '150px' }}>{product.product_type}</div></td>
                          <td><div style={{ width: '200px' }}>{product.type}</div></td>
                          <td><div style={{ width: '150px' }}>{product.Masteruom?.unit_name || "N/A"}</div></td>
                          <td><div style={{ width: '150px' }}>{product.hsn_code}</div></td>
                          <td><div style={{ width: '150px' }}>{product.product_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.regular_buying_price}</div></td>
                          <td><div style={{ width: '200px' }}>{product.wholesale_buying_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.regular_selling_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.mrp}</div></td>
                          <td><div style={{ width: '150px' }}>{product.dealer_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.distributor_price}</div></td>
                          <td><div style={{ width: '150px' }}>{product.minimum_stock_level}</div></td>
                          <td><div style={{ width: '150px' }}>{product.maximum_stock_level}</div></td>
                          <td><div style={{ width: '150px' }}>{product.tax} %</div></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 d-flex justify-content-end gap-2 ">
                <button type='button' className="btn btn-teal" onClick={handleMultipleDeleteRestore}
                    disabled={selectedItemsRestore.length === 0} ><i className="fas fa-undo me-2"></i>Restore</button>
                
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteMultipleItemsModal;
