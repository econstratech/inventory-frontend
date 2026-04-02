import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form } from "antd";
import { Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { UserAuth } from "../../auth/Auth";
import { SuccessMessage, ErrorMessage } from "../../../environment/ToastMessage";
import ProductSelect from "../../filterComponents/ProductSelect";

import "../../global.css";
import {
  PrivateAxios,
} from "../../../environment/AxiosInstance";


function BomMaster() {

  const [bomCount, setBOMCount] = useState(0);
  const [bomController, setBomController] = useState({
    page: 1,
    rowsPerPage: 15,
    searchKey: ""
  });

  const { setIsLoading, Logout } = UserAuth();

  const [filteredData, setFilteredData] = useState([]);
  const [searchKeyInput, setSearchKeyInput] = useState("");
  const [selectedFgProductId, setSelectedFgProductId] = useState(null);
  
  // Update modal state
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateErrors, setUpdateErrors] = useState({});
  const [updateBomFormData, setUpdateBomFormData] = useState(null);

  // Fetch products data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { page, rowsPerPage, searchKey, fg_product_id } = bomController;
      // Set query params
      const queryParams = new URLSearchParams({
        page,
        limit: rowsPerPage,
        ...(searchKey && { bom_no: searchKey }),
        ...(fg_product_id && { fg_product_id: fg_product_id })
      }).toString();

      const res = await PrivateAxios.get(`bom/list?${queryParams}`);
      const bomMasterResponse = res.data.data;

      setBOMCount(bomMasterResponse.pagination.total_records);
      const mappedData = bomMasterResponse.rows.map((item, index) => {

        return {
          key: index + 1,
          id: item.id || "",
          bom_no: item.bom_no || "",
          FGProduct: item.finalProduct ? `${item.finalProduct?.product_name} (${item.finalProduct?.product_code})` : "",
          FGVariant: item.finalProductVariant ? `${item.finalProductVariant?.weight_per_unit} ${item.finalProductVariant?.masterUOM.label}` : "",
          RMProduct: item.rawMaterialProduct ? `${item.rawMaterialProduct?.product_name} (${item.rawMaterialProduct?.product_code})` : "",
          RMVariant: item.rawMaterialProductVariant ? `${item.rawMaterialProductVariant?.weight_per_unit} ${item.rawMaterialProductVariant?.masterUOM.label}` : "",
          quantity: item.quantity || "",
        };
      });

      setFilteredData(mappedData);
    } catch (err) {
      if (err.response?.status === 401) {
        Logout(); // Ensure Logout function is correctly imported and used
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bomController]);

  // Handle search button click
  const handleSearch = () => {
    setBomController(prev => ({
      ...prev,
      page: 1,
      searchKey: searchKeyInput.trim(),
      fg_product_id: selectedFgProductId || null
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchKeyInput("");
    setSelectedFgProductId(null);
    setBomController({
      page: 1,
      rowsPerPage: 15,
      searchKey: "",
      fg_product_id: null
    });
  };

  // Handle update button click
  const handleUpdateClick = async (record) => {
    setUpdateBomFormData(record);
    setIsUpdateModalVisible(true);
    setUpdateErrors({});
  };

  // Handle update modal close
  const handleUpdateModalClose = () => {
    setIsUpdateModalVisible(false);
    setUpdateBomFormData(null);
    setUpdateErrors({});
  };

  // Validate update form
  const validateUpdateForm = () => {
    const errors = {};

    if (!updateBomFormData?.quantity || updateBomFormData?.quantity?.trim() === "") {
      errors.quantity = "Quantity is required";
    } else {
      const quantity = parseFloat(updateBomFormData.quantity);
      if (isNaN(quantity) || quantity < 0) {
        errors.quantity = "Quantity must be a positive number";
      }
    }

    setUpdateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle update submit
  const handleUpdateSubmit = async () => {
    if (!validateUpdateForm()) {
    //   ErrorMessage("Please fill all required fields correctly");
      return;
    }
    setIsUpdating(true);

    try {
      const payload = {
        quantity: parseFloat(updateBomFormData.quantity),
      };

      const response = await PrivateAxios.put(
        `/bom/${updateBomFormData.id}`,
        payload
      );

      if (response.status === 200) {
        SuccessMessage(response.data?.message || "BOM is updated successfully.");
        handleUpdateModalClose();
        fetchData(); // Refresh the table
      }
    } catch (error) {
      console.error("Error updating BOM:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update BOM. Please try again.";
      ErrorMessage(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await PrivateAxios.delete(`/bom/${id}`);
      
      if (response.status === 200) {
        setUpdateBomFormData(null);
        SuccessMessage(response.data?.message || "BOM is deleted successfully.");
        setFilteredData(filteredData.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting BOM:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete BOM. Please try again.";
      ErrorMessage(errorMessage);
    }
  };

  // Handle delete button click with confirmation
  const handleDeleteClick = (record) => {
    Modal.confirm({
      title: "Delete BOM",
      icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
      content: (
        <div>
          <p>Are you sure you want to delete this BOM?</p>
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            Warning: Once deleted, this record and all associated data cannot be recovered.
          </p>
          <p>
            <strong>BOM No:</strong> {record.bom_no}<br />
            <strong>FG Product:</strong> {record.FGProduct}<br />
            <strong>RM Product:</strong> {record.RMProduct}<br />
            <strong>Quantity:</strong> {record.quantity}
          </p>
        </div>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        handleDelete(record.id);
      },
      width: 500,
    });
  };

  const handleProductsListPageChange = (page, pageSize) => {
    setBomController(prev => ({
      ...prev,
      page,
      rowsPerPage: pageSize
    }));
  };

  // Table columns configuration
  const columns = [
    {
        title: "SL No",
        dataIndex: ["key"],
        key: "key",
        width: 100,
    },
    {
      title: "BOM No",
      dataIndex: ["bom_no"],
      key: "bom_no",
      width: 100,
    },
    {
      title: "FG Product",
      dataIndex: ["FGProduct"],
      key: "FGProduct",
      width: 150,
    },
    {
      title: "FG Variant",
      dataIndex: ["FGVariant"],
      key: "FGVariant",
      width: 150,
    },
    {
      title: "RM Product",
      dataIndex: ["RMProduct"],
      key: "RMProduct",
      width: 150,
    },
    {
      title: "RM Variant",
      dataIndex: ["RMVariant"],
      key: "RMVariant",
      width: 150,
    },
    {
      title: "Quantity",
      dataIndex: ["quantity"],
      key: "quantity",
      width: 150,
      render: (_, record) => {
        return record?.quantity || "0";
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      // fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleUpdateClick(record)}
            title="Update"
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
            title="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="p-4">
        <div className="row">
          <div className="col-12 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">BOM Master</h3>
                <p className="text-muted mb-0">View and manage BOMs</p>
              </div>
              <Link to="/inventory/bom-master/create">
                <button className="btn btn-exp-primary btn-sm">
                  <i className="fas fa-plus me-2"></i>
                  Add BOM Master
                </button>
              </Link>
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
                              <label className="form-label mb-2">Search By BOM No</label>
                              <Input
                                placeholder="Enter BOM No..."
                                value={searchKeyInput}
                                onChange={(e) => setSearchKeyInput(e.target.value)}
                                onPressEnter={handleSearch}
                                style={{ height: "38px" }}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label mb-2">Filter by FG Product</label>
                              <ProductSelect
                                placeholder="Search and select FG Product..."
                                value={selectedFgProductId}
                                onChange={(option) => setSelectedFgProductId(option ? option.value : null)}
                                
                              />
                            </div>
                            <div className="col-md-4">
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
                                current: bomController.page,
                                pageSize: bomController.rowsPerPage,
                                total: bomCount,
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

      {/* Update Modal */}
      <Modal
        title={<>Update BOM: <span style={{ color: "blue" }}>{updateBomFormData?.bom_no}</span></>}
        open={isUpdateModalVisible}
        onCancel={handleUpdateModalClose}
        footer={[
          <Button key="cancel" onClick={handleUpdateModalClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isUpdating}
            onClick={handleUpdateSubmit}
          >
            Update
          </Button>,
        ]}
        width={600}
      >
        <Form layout="vertical">

          <Form.Item
            label={
              <span>
                FG Product
              </span>
            }
            validateStatus={updateErrors.FGProduct ? "error" : ""}
            help={updateErrors.FGProduct}
          >
            <div className="ant-form-item-control-input" style={{ padding: '4px 0', color: 'rgba(0, 0, 0, 0.88)', fontSize: 14 }}>
              {updateBomFormData?.FGProduct ?? '—'}
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span>
                FG Variant
              </span>
            }
          >
            <div className="ant-form-item-control-input" style={{ padding: '4px 0', color: 'rgba(0, 0, 0, 0.88)', fontSize: 14 }}>
              {updateBomFormData?.FGVariant ?? "—"}
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span>
                RM Product
              </span>
            }
            validateStatus={updateErrors.RMProduct ? "error" : ""}
            help={updateErrors.RMProduct}
          >
            <div className="ant-form-item-control-input" style={{ padding: '4px 0', color: 'rgba(0, 0, 0, 0.88)', fontSize: 14 }}>
              {updateBomFormData?.RMProduct ?? '—'}
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span>
                RM Variant
              </span>
            }
          >
            <div className="ant-form-item-control-input" style={{ padding: '4px 0', color: 'rgba(0, 0, 0, 0.88)', fontSize: 14 }}>
              {updateBomFormData?.RMVariant ?? "—"}
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span>
                Enter Quantity <span style={{ color: "red" }}>*</span>
              </span>
            }
            validateStatus={updateErrors.quantity ? "error" : ""}
            help={updateErrors.quantity}
          >
            <Input
              type="number"
              placeholder="Enter Quantity"
              value={updateBomFormData?.quantity}
              onChange={(e) => {
                setUpdateBomFormData((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                }));
                if (updateErrors.quantity) {
                  setUpdateErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.quantity;
                    return newErrors;
                  });
                }
              }}
              min="0"
              step="0.01"
              style={{ height: "38px" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default BomMaster;
