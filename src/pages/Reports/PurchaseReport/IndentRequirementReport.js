import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, Button } from "antd";
import Select from "react-select";
// import { Link } from "react-router-dom";
// import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import moment from "moment";

// import { UserAuth } from "../auth/Auth";
// import { SuccessMessage, ErrorMessage } from "../../environment/ToastMessage";

import "../../global.css";
import {
  PrivateAxios,
} from "../../../environment/AxiosInstance";


function IndentRequirementReport() {

  const [productsCount, setProductsCount] = useState(0);
  const [productController, setProductController] = useState({
    page: 1,
    rowsPerPage: 15,
    searchKey: "",
    warehouseId: null,
    productTypeId: null
  });

  const [filteredData, setFilteredData] = useState([]);
  const [storeOptions, setStoreOptions] = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [searchKeyInput, setSearchKeyInput] = useState("");
  
  // Update modal state
//   const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
//   const [updateFormData, setUpdateFormData] = useState({
//     id: null,
//     product: null,
//     store: null,
//     quantity: "",
//   });
//   const [productOptions, setProductOptions] = useState([]);
//   const [isLoadingProducts, setIsLoadingProducts] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [updateErrors, setUpdateErrors] = useState({});

  // Fetch warehouses for dropdown
  const fetchStores = async () => {
    try {
      const response = await PrivateAxios.get("/warehouse");
      const storeData = response.data?.data;

      if (storeData && storeData.length > 0) {
        const options = storeData.map((item) => ({
          value: item.id,
          label: `${item.name || "N/A"} (${item.city || "N/A"})`,
        }));
        setStoreOptions(options);
      } else {
        setStoreOptions([]);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStoreOptions([]);
    }
  };

  // Fetch product types for dropdown
  const fetchProductTypes = async () => {
    try {
      const response = await PrivateAxios.get("/master/product-type/list");
      const productTypeData = response.data?.data;
      const options = productTypeData.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setProductTypeOptions(options);
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchProductTypes();
  }, []);

  // Calculate quantity colour based on percentage
  const quantityColour = (buffer_size, inventory_at_transit) => {
    const safety_factor = buffer_size * (0.5 /100);
    const percentage = ((buffer_size + safety_factor - inventory_at_transit) / buffer_size) * 100;
    if (percentage >= 99) {
      return "black";
    } else if (percentage >= 66 && percentage < 99) {
      return "red";
    } else if (percentage >= 33 && percentage < 66) {
      return "yellow";
    } else if (percentage >= 5 && percentage < 33) {
      return "green";
    } else if (percentage < 5) {
      return "cyan";
    }
  };

  // Fetch products data
  const fetchData = useCallback(async () => {
    // setIsLoading(true);
    try {
      const { page, rowsPerPage, searchKey, warehouseId, productTypeId } = productController;
      // Set query params
      const queryParams = new URLSearchParams({
        page,
        limit: rowsPerPage,
        ...(searchKey && { searchkey: searchKey }),
        ...(warehouseId && { warehouse_id: warehouseId }),
        ...(productTypeId && { product_type_id: productTypeId })
      }).toString();

      const res = await PrivateAxios.get(`product/indent-required-products?${queryParams}`);
      const stockMasterResponse = res.data.data;

      setProductsCount(stockMasterResponse.pagination.total_records);
      const mappedData = stockMasterResponse.rows.map((item, index) => {
        const safety_factor = item.product.buffer_size * (0.5 /100);
        const inventory_needed = (item.product.buffer_size + safety_factor + item.sale_order_recieved)
                       - (item.quantity + item.inventory_at_transit);

        return {
          key: index + 1,
          id: item.id || "",
          product: {
            id: item.product.id || "",
            product_code: item.product.product_code || "",
            product_name: item.product.product_name || "",
            sku_product: item.product.sku_product || "",
            buffer_size: item.product.buffer_size || "",
            productType: item.product?.masterProductType?.name || "",
            is_batch_applicable: item.product.is_batch_applicable || 0,
          },
          warehouse: {
            id: item.warehouse.id || "",
            name: item.warehouse.name || "",
          },
          productCategory: item.product.productCategory || "",
          quantity: item.quantity || "",
          quantityColour: quantityColour(item.product.buffer_size || 0, item.inventory_at_transit || 0),
          inventory_at_transit: item.inventory_at_transit || 0,
          inventory_needed: inventory_needed,
          sale_order_recieved: item.sale_order_recieved || 0,
          safety_factor: safety_factor,
          inventory_at_production: item.inventory_at_production || 0,
        };
      });

      setFilteredData(mappedData);
    } catch (err) {
      if (err.response?.status === 401) {
        // Logout(); // Ensure Logout function is correctly imported and used
      }
    }
  }, [productController]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle search button click
  const handleSearch = () => {
    setProductController(prev => ({
      ...prev,
      page: 1,
      searchKey: searchKeyInput.trim(),
      warehouseId: selectedStore ? selectedStore.value : null,
      productTypeId: selectedProductType ? selectedProductType.value : null
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedStore(null);
    setSelectedProductType(null);
    setSearchKeyInput("");
    setProductController({
      page: 1,
      rowsPerPage: 15,
      searchKey: "",
      warehouseId: null,
      productTypeId: null
    });
  };

  // Load products for update modal
//   const loadProducts = useCallback(async (searchKey = "") => {
//     setIsLoadingProducts(true);
//     try {
//       const queryParams = new URLSearchParams({
//         page: 1,
//         limit: 100,
//         ...(searchKey && searchKey.trim() !== "" && { searchkey: searchKey.trim() }),
//       }).toString();

//       const response = await PrivateAxios.get(`/product/list?${queryParams}`);
//       const productData = response.data?.data;

//       if (productData && productData.rows) {
//         const options = productData.rows.map((item) => ({
//           value: item.id,
//           label: `${item.product_name || "N/A"} (${item.product_code || "N/A"})`,
//           productData: item,
//         }));
//         setProductOptions(options);
//         return options;
//       } else {
//         setProductOptions([]);
//         return [];
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       setProductOptions([]);
//       return [];
//     } finally {
//       setIsLoadingProducts(false);
//     }
//   }, []);

  // Fetch stock entry by ID
//   const fetchStockEntryById = async (id) => {
//     try {
//       const response = await PrivateAxios.get(`/product/stock-entries/${id}`);
//       const data = response.data?.data;

//       if (data) {
//         // Ensure products are loaded before finding match
//         let currentProductOptions = productOptions;
//         if (currentProductOptions.length === 0) {
//           currentProductOptions = await loadProducts();
//         }

//         // Find matching product option
//         const productOption = currentProductOptions.find(
//           (opt) => opt.value === data.product_id
//         ) || {
//           value: data.product_id,
//           label: `Product ID: ${data.product_id}`,
//         };

//         // Find matching store option
//         const storeOption = storeOptions.find(
//           (opt) => opt.value === data.warehouse_id
//         ) || {
//           value: data.warehouse_id,
//           label: `Store ID: ${data.warehouse_id}`,
//         };

//         setUpdateFormData({
//           id: data.id,
//           product: productOption,
//           store: storeOption,
//           quantity: data.quantity.toString(),
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching stock entry:", error);
//       ErrorMessage("Failed to load stock entry data");
//     }
//   };

  // Handle update button click
//   const handleUpdateClick = async (record) => {
//     setIsUpdateModalVisible(true);
//     setUpdateErrors({});
    
//     // Load products first, then fetch stock entry data
//     await loadProducts();

//     await fetchStockEntryById(record.id);
//   };

  // Handle update modal close
//   const handleUpdateModalClose = () => {
//     setIsUpdateModalVisible(false);
//     setUpdateFormData({
//       id: null,
//       product: null,
//       store: null,
//       quantity: "",
//     });
//     setUpdateErrors({});
//   };

  // Validate update form
//   const validateUpdateForm = () => {
//     const errors = {};

//     if (!updateFormData.product || !updateFormData.product.value) {
//       errors.product = "Product is required";
//     }

//     if (!updateFormData.store || !updateFormData.store.value) {
//       errors.store = "Store is required";
//     }

//     if (!updateFormData.quantity || updateFormData.quantity.trim() === "") {
//       errors.quantity = "Quantity is required";
//     } else {
//       const quantity = parseFloat(updateFormData.quantity);
//       if (isNaN(quantity) || quantity < 0) {
//         errors.quantity = "Quantity must be a positive number";
//       }
//     }

//     setUpdateErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   // Handle update submit
//   const handleUpdateSubmit = async () => {
//     if (!validateUpdateForm()) {
//       ErrorMessage("Please fill all required fields correctly");
//       return;
//     }

//     setIsUpdating(true);

//     try {
//       const payload = {
//         product_id: updateFormData.product.value,
//         warehouse_id: updateFormData.store.value,
//         quantity: parseFloat(updateFormData.quantity),
//       };

//       const response = await PrivateAxios.put(
//         `/product/stock-entries/${updateFormData.id}`,
//         payload
//       );

//       if (response.status === 200) {
//         SuccessMessage(response.data?.message || "Stock entry updated successfully!");
//         handleUpdateModalClose();
//         fetchData(); // Refresh the table
//       }
//     } catch (error) {
//       console.error("Error updating stock entry:", error);
//       const errorMessage =
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         "Failed to update stock entry. Please try again.";
//       ErrorMessage(errorMessage);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Handle delete
//   const handleDelete = async (id) => {
//     try {
//       const response = await PrivateAxios.delete(`/product/stock-entries/${id}`);
      
//       if (response.status === 200) {
//         SuccessMessage(response.data?.message || "Stock entry deleted successfully!");
//         fetchData(); // Refresh the table
//       }
//     } catch (error) {
//       console.error("Error deleting stock entry:", error);
//       const errorMessage =
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         "Failed to delete stock entry. Please try again.";
//       ErrorMessage(errorMessage);
//     }
//   };

//   // Handle delete button click with confirmation
//   const handleDeleteClick = (record) => {
//     Modal.confirm({
//       title: "Delete Stock Entry",
//       icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
//       content: (
//         <div>
//           <p>Are you sure you want to delete this stock entry?</p>
//           <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
//             Warning: Once deleted, this record and all associated data cannot be recovered.
//           </p>
//           <p>
//             <strong>Product:</strong> {record.product.product_name} ({record.product.product_code})<br />
//             <strong>Store:</strong> {record.warehouse.name}<br />
//             <strong>Quantity:</strong> {record.quantity}
//           </p>
//         </div>
//       ),
//       okText: "Yes, Delete",
//       okType: "danger",
//       cancelText: "Cancel",
//       onOk() {
//         handleDelete(record.id);
//       },
//       width: 500,
//     });
//   };

  const handleProductsListPageChange = (page, pageSize) => {
    setProductController(prev => ({
      ...prev,
      page,
      rowsPerPage: pageSize
    }));
  };

  // Table columns configuration
  const columns = [
    {
      title: "Item Code",
      dataIndex: ["product", "product_code"],
      key: "product_code",
      width: 100,
      sorter: (a, b) => a.product.product_code.localeCompare(b.product.product_code),
    },
    {
      title: "Item Name",
      dataIndex: ["product", "product_name"],
      key: "product_name",
      // fixed: "left",
      width: 140,
      sorter: (a, b) => a.product.product_name.localeCompare(b.product.product_name),
    },
    {
        title: "Category",
        dataIndex: ["productCategory", "title"],
        key: "product_category",
        width: 150,
        sorter: (a, b) => a.quantity - b.quantity,
    },
    // {
    //   title: "SKU",
    //   dataIndex: ["product", "sku_product"],
    //   key: "sku_product",
    //   width: 100,
    // },
    {
      title: "Product Type",
      dataIndex: ["product", "productType"],
      key: "productType",
      width: 150,
      render: (_, record) => {
        return record?.product.productType || "N/A";
      },
    },
    {
      title: "Store",
      dataIndex: ["warehouse", "name"],
      key: "warehouse_name",
      width: 150,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    // {
    //   title: "Inventory at Transit",
    //   dataIndex: ["inventory_at_transit"],
    //   key: "inventory_at_transit",
    //   width: 150,
    //   render: (_, record) => {
    //     return record?.inventory_at_transit || "0";
    //   },
    // },
    {
      title: "Available Quantity",
      dataIndex: ["quantity"],
      key: "quantity",
      width: 120,
      render: (_, record) => {
        const quantity = record?.quantity || 0;
        const quantityValue = parseFloat(quantity) || 0;
        const bgColor = record?.quantityColour;
        
        // Determine text color based on background color
        // Yellow and cyan need dark text for readability
        const textColor = bgColor === "yellow" || bgColor === "cyan" ? "#333" : "#fff";
        
        // Handle zero or missing quantity with gray styling
        if (quantityValue === 0 || !bgColor) {
          return (
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "12px",
                backgroundColor: "#f5f5f5",
                color: "#666",
                fontWeight: 500,
                fontSize: "13px",
                minWidth: "50px",
                textAlign: "center",
                border: "1px solid #e0e0e0",
              }}
            >
              {quantityValue}
            </span>
          );
        }
        
        // Styled badge for non-zero quantities
        return (
          <span
            style={{
              display: "inline-block",
              padding: "5px 12px",
              borderRadius: "12px",
              backgroundColor: bgColor,
              color: textColor,
              fontWeight: 600,
              fontSize: "13px",
              minWidth: "50px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
              border: bgColor === "yellow" || bgColor === "cyan" ? "1px solid rgba(0, 0, 0, 0.1)" : "none",
            }}
          >
            {quantityValue}
          </span>
        );
      },
    },
    // {
    //   title: "Sale Order Recieved",
    //   dataIndex: ["sale_order_recieved"],
    //   key: "sale_order_recieved",
    //   width: 150,
    //   render: (_, record) => {
    //     return record?.sale_order_recieved || "0";
    //   },
    // },
    {
      title: "Inventory Needed",
      dataIndex: ["inventory_needed"],
      key: "inventory_needed",
      width: 150,
      render: (_, record) => {
        return record?.inventory_needed || "0";
      },
    },
    // {
    //   title: "Safety Factor",
    //   dataIndex: ["product", "safety_factor"],
    //   key: "safety_factor",
    //   render: (_, record) => {
    //     return record?.safety_factor || "0";
    //     // return record?.product.safety_factor || "0";
    //   },
    //   width: 100,
    // },
    {
      title: "Buffer Qty",
      dataIndex: ["product", "buffer_size"],
      key: "buffer_size",
      width: 150,
      render: (_, record) => {
        return record?.product.buffer_size || "0";
      },
    },
    {
        title: "Batch Product",
        dataIndex: ["product", "is_batch_applicable"],
        key: "is_batch_applicable",
        width: 150,
        render: (_, record) => {
          return record?.product.is_batch_applicable === 1 ? "Yes" : "No";
        },
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 120,
    //   // fixed: "right",
    //   render: (_, record) => (
    //     <div style={{ display: "flex", gap: "8px" }}>
    //       <Button
    //         type="link"
    //         icon={<EditOutlined />}
    //         onClick={() => handleUpdateClick(record)}
    //         title="Update"
    //       />
    //       <Button
    //         type="link"
    //         danger
    //         icon={<DeleteOutlined />}
    //         onClick={() => handleDeleteClick(record)}
    //         title="Delete"
    //       />
    //     </div>
    //   ),
    // },
  ];

  return (
    <>
      <div className="p-4">
        <div className="row">
          <div className="col-12 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">Indent Requirement Report</h3>
                <p className="text-muted mb-0">View and manage indent requirement report</p>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card mb-2">
              <div className="card-body">
          
                <div className="inventory-body pt-2">

                  <div className="inventory-body-wrap-body">
              
                    <div className="table-wrap" style={{ overflow: "visible" }}>
                      <div className="border rounded-10 bg-white" style={{ overflow: "visible" }}>
                        {/* Filter Section */}
                        <div className="p-3 border-bottom" style={{ position: "relative", zIndex: 1 }}>
                          <div className="row g-3 align-items-end">

                            <div className="col-md-4">
                              <label className="form-label mb-2">Search</label>
                              <Input
                                placeholder="Enter search key..."
                                value={searchKeyInput}
                                onChange={(e) => setSearchKeyInput(e.target.value)}
                                onPressEnter={handleSearch}
                                style={{ height: "38px" }}
                              />
                            </div>


                            <div className="col-md-4" style={{ position: "relative", zIndex: 1000 }}>
                              <label className="form-label mb-2">Filter by Store</label>
                              <Select
                                placeholder="Select Store"
                                value={selectedStore}
                                onChange={(selectedOption) => {
                                  setSelectedStore(selectedOption);
                                }}
                                options={storeOptions}
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    minHeight: "38px",
                                  }),
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                              />
                            </div>

                            <div className="col-md-4" style={{ position: "relative", zIndex: 1000 }}>
                              <label className="form-label mb-2">Filter by Product Type</label>
                              <Select
                                placeholder="Select Product Type"
                                value={selectedProductType}
                                onChange={(selectedOption) => {
                                  setSelectedProductType(selectedOption);
                                }}
                                options={productTypeOptions}
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    minHeight: "38px",
                                  }),
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                              />
                            </div>

                        

                            <div className="col-md-3">
                              <div className="d-flex gap-2">
                                <Button
                                  type="primary"
                                  onClick={handleSearch}
                                  style={{ height: "38px" }}
                                >
                                  Search
                                </Button>
                                <Button
                                  onClick={handleClearFilters}
                                  style={{ height: "38px" }}
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-0">
                          <div className="table-responsive mb-0">
                            <Table
                              columns={columns}
                              dataSource={filteredData}
                              pagination={{
                                current: productController.page,
                                pageSize: productController.rowsPerPage,
                                total: productsCount,
                                onChange: handleProductsListPageChange
                              }}
                              scroll={{ x: 1000 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default IndentRequirementReport;
