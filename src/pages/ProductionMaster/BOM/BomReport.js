import React, { useState, useEffect } from "react";
import { Table, Input, Button } from "antd";
// import { Link } from "react-router-dom";
// import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

// import { UserAuth } from "../../auth/Auth";
// import { SuccessMessage, ErrorMessage } from "../../../environment/ToastMessage";
import ProductSelect from "../../filterComponents/ProductSelect";

import "../../global.css";
import {
  PrivateAxios,
} from "../../../environment/AxiosInstance";


function BomReport() {

  const [bomReportCount, setBomReportCount] = useState(0);
  const [bomReportController, setBomReportController] = useState({
    page: 1,
    rowsPerPage: 15,
    bom_no: "",
    fg_product_id: null
  });

  // const { Logout } = UserAuth();

  const [filteredData, setFilteredData] = useState([]);
  const [searchByBomNoInput, setSearchByBomNoInput] = useState("");
  const [selectedFgProductId, setSelectedFgProductId] = useState(null);

  // Fetch products data
  const fetchData = async () => {
    // setIsLoading(true);
    try {
      const { page, rowsPerPage, bom_no, fg_product_id } = bomReportController;
      // Set query params
      const queryParams = new URLSearchParams({
        page,
        limit: rowsPerPage,
        ...(bom_no && { bom_no: bom_no }),
        ...(fg_product_id && { fg_product_id: fg_product_id })
      }).toString();

      const res = await PrivateAxios.get(`bom/report?${queryParams}`);
      const bomMasterResponse = res.data.data;

      setBomReportCount(bomMasterResponse.pagination.total_records);

      const total_required_quantity_array = [];

      const rawMaterialProductIdSet = new Set();
      
      const mappedData = bomMasterResponse.rows.map((item, index) => {
        rawMaterialProductIdSet.add(item.rawMaterialProduct?.id);
        // const buffer_size = item.finalProduct?.buffer_size || 0;
        // const safety_factor = buffer_size * (0.5 /100);
        const inventory_needed = item.productStockEntry?.inventory_needed || 0;

        const required_quantity = item.quantity * inventory_needed;

        //check if the rawMaterialProductId is already exist then sum the required quantity
        const quantityIndex = total_required_quantity_array.findIndex(item => item.rawMaterialProductId === item.rawMaterialProduct?.id);
        if (quantityIndex !== -1) {
            total_required_quantity_array[quantityIndex].requiredQuantity += required_quantity;
        } else {
            total_required_quantity_array.push({
                rawMaterialProductId: item.rawMaterialProduct?.id,
                requiredQuantity: required_quantity
            });
        }

        // const total_required_quantity = total_required_quantity_array.reduce((acc, item) => acc + item.requiredQuantity, 0);
        // const difference = total_required_quantity - item.rawMaterialProduct?.quantity || 0;

        return {
          key: index + 1,
          id: item.id || "",
          bom_no: item.bom_no || "",
          FGProduct: item.finalProduct ? `${item.finalProduct?.product_name} (${item.finalProduct?.product_code})` : "",
          RMProduct: item.rawMaterialProduct ? `${item.rawMaterialProduct?.product_name} (${item.rawMaterialProduct?.product_code})` : "",
          quantity: item.quantity || "",
          // rm_quantity: item.rawMaterialProduct?.quantity || 0,
          product_type: item.finalProduct ? item.finalProduct?.masterProductType?.name : "",
          warehouse: item.productStockEntry ? item.productStockEntry?.warehouse?.name : "",
          inventory_needed: inventory_needed,
          required_quantity: item.quantity * inventory_needed,
          available_quantity: item.rawMaterialProduct?.quantity || 0,
          total_required_quantity: 0,
          difference: 0,
          rawMaterialProductId: item.rawMaterialProduct?.id,
        };
      });

      const rawMaterialProductIdArray = Array.from(rawMaterialProductIdSet);
      // Get inventory needed for all raw material products
      const rawMaterialProductInventoryNeeded = await PrivateAxios.get(`bom/inventory-needed?rm_product_ids=${rawMaterialProductIdArray.join(",")}`);
      const rawMaterialProductInventoryNeededData = rawMaterialProductInventoryNeeded.data.data;

      rawMaterialProductInventoryNeededData.forEach(item => {
        mappedData.forEach(mappedItem => {
          if (mappedItem.rawMaterialProductId === item.product_id) {
            const total_required_quantity = item.total_required_quantity || 0;
            const difference = mappedItem.available_quantity - total_required_quantity;

            mappedItem.total_required_quantity = total_required_quantity;
            mappedItem.difference = difference;

          }
        });
      });

      setFilteredData(mappedData);
    } catch (err) {
      if (err.response?.status === 401) {
        // Logout(); // Ensure Logout function is correctly imported and used
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [bomReportController]);

  // Handle search button click
  const handleSearch = () => {
    setBomReportController(prev => ({
      ...prev,
      page: 1,
      bom_no: searchByBomNoInput.trim(),
      fg_product_id: selectedFgProductId || null
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchByBomNoInput("");
    setSelectedFgProductId(null);
    setBomReportController({
      page: 1,
      rowsPerPage: 15,
      bom_no: "",
      fg_product_id: null
    });
  };

  const handleBomReportPageChange = (page, pageSize) => {
    setBomReportController(prev => ({
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
      title: "RM Product",
      dataIndex: ["RMProduct"],
      key: "RMProduct",
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
        title: "Product Type",
        dataIndex: ["product_type"],
        key: "product_type",
        width: 150,
        render: (_, record) => {
          return record?.product_type || "N/A";
        },
    },
    {
        title: "Store",
        dataIndex: ["warehouse"],
        key: "warehouse",
        width: 150,
        render: (_, record) => {
          return record?.warehouse || "N/A";
        },
    },
    {
        title: "Inventory Needed",
        dataIndex: ["inventory_needed"],
        key: "inventory_needed",
        width: 150,
        render: (_, record) => {
          return record?.inventory_needed || "0";
        },
    },
    {
        title: "Required Qty",
        dataIndex: ["required_quantity"],
        key: "required_quantity",
        width: 150,
        render: (_, record) => {
          return record?.required_quantity || "0";
        },
    },
    {
        title: "Total Required Qty",
        dataIndex: ["total_required_quantity"],
        key: "total_required_quantity",
        width: 150,
        render: (_, record) => {
          return record?.total_required_quantity || "0";
        },
    },
    {
        title: "Available Qty",
        dataIndex: ["available_quantity"],
        key: "available_quantity",
        width: 150,
        render: (_, record) => {
          return record?.available_quantity || "0";
        },
    },
    {
        title: "Difference",
        dataIndex: ["difference"],
        key: "difference",
        width: 150,
        render: (_, record) => {
          return record?.difference || "0";
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
                <h3 className="mb-0">BOM Report</h3>
                <p className="text-muted mb-0">View BOM Report</p>
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
                              <label className="form-label mb-2">Search By BOM No</label>
                              <Input
                                placeholder="Enter BOM No..."
                                value={searchByBomNoInput}
                                onChange={(e) => setSearchByBomNoInput(e.target.value)}
                                onPressEnter={handleSearch}
                                style={{ height: "38px" }}
                                className="form-control"
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label mb-2">Search By FG Product</label>
                              <ProductSelect
                                placeholder="Search and select FG Product..."
                                value={selectedFgProductId}
                                onChange={(option) => setSelectedFgProductId(option ? option.value : null)}
                                styles={{ control: (base) => ({ ...base, minHeight: "38px" }) }}
                                queryParams={{
                                  type: "dropDown"
                                }}
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
                                current: bomReportController.page,
                                pageSize: bomReportController.rowsPerPage,
                                total: bomReportCount,
                                onChange: handleBomReportPageChange
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

export default BomReport;
