import React, { useState, useEffect } from "react";
import {
  Alert,
  Dropdown,
  Modal,
  OverlayTrigger,
  Popover,
  Tooltip,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { width } from "@mui/system";
import InventoryMasterBarcodeHeader from "./inventoryHeader";
import { UserAuth } from "../auth/Auth";
import { PrivateAxios } from "../../environment/AxiosInstance";
import Loader from "../../environment/Loader";
import { formatDateManual } from "../../environment/DateFormat";
import ItemMasterStatusBar from "./itemMaster/ItemMasterStatusBar";
import InventoryMasterPageTopBar from "./itemMaster/InventoryMasterPageTopBar";
// Fetch data from API

function InventoryMaster() {
  const { isLoading, setIsLoading, Logout, User } = UserAuth();
  const [productsdata, setProducts] = useState([]);
  const [getSKU, setSKU] = useState([]);
  const [stores, setStores] = useState([]);
  const [units, setUnit] = useState([]);
  const [runningBalance, setRunningBalance] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get("product/getallactivity");
        setProducts(response.data.data); // Assuming response.data.data holds the product array
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create a map of store_id to store name for easy lookup
  // SKU name diplay
  useEffect(() => {
    const fetchSKU = async () => {
      try {
        const response = await PrivateAxios.get("product/list");
        setSKU(response.data.data || []); // Ensure data exists
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchSKU();
  }, []);

  const storeItem = getSKU.reduce((map, sku) => {
    map[sku.id] = sku.product_code;
    return map;
  }, {});

  // store name diplay
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await PrivateAxios.get("warehousesselect");
        setStores(response.data.data || []); // Ensure data exists
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  // Create a map of store_id to store name for easy lookup
  const storeMap = stores.reduce((map, store) => {
    map[store.id] = store.name;
    return map;
  }, {});

  // useEffect(() => {
  //   const fetchUnit = async () => {
  //     try {
  //       const response = await PrivateAxios.get("uom");
  //       setUnit(response.data.data || []); // Ensure dataexists
  //     } catch (error) {
  //       console.error("Error fetching stores:", error);
  //     }
  //   };

  //   fetchUnit();
  // }, []);

  // Create a map of store_id to store name for easy lookup
  const storeUnit = units.reduce((map, unit) => {
    map[unit.id] = unit.unit_name;
    return map;
  }, {});


  useEffect(() => {
    const fetchReferenceNumberCounts = async () => {
      setLoading(true);
      const updatedDataSource = await Promise.all(
        productsdata.map(async (item) => {
          const productId = item.product_id;
          if (!runningBalance[productId]) {
            runningBalance[productId] = 0;
          }

          try {
            const countResponse = await PrivateAxios.get(`/product/reference-number-count/${item.reference_number}`);
            const referenceCount = countResponse.data.count || 1;

            let adjType = "";
            if (item.adjustmentType === "StockTransfer") {
              adjType = "Stock Transfer";
            } else if (item.adjustmentType === "Out") {
              adjType = "Reduce from Store";
            } else if (item.adjustmentType === "adjustment") {
              adjType = "Manual Adjustment";
            } else if (item.adjustmentType !== "") {
              adjType = item.adjustmentType;
            }

            return {
              key: item.id, // Use a unique identifier here
              documentnumber: (
                <a
                  href={`/inventory/inventory-master-adjustment/${item.reference_number}`}
                  className="text-primary"
                >
                  {item.reference_number || "N/A"}
                </a>
              ),
              fromstore: item.status_in_out === 0 ? storeMap[item.store_id] : " - ",
              tostore: item.status_in_out === 1 ? storeMap[item.store_id] : " - ",
              numberofitem: referenceCount.toString(),
              date: formatDateManual(item.created_at) || "",
              user: User.find((data) => data.id === item.user_id)?.name || "",
              movement_type: adjType || "",
              status: item.status == 0 ? 'Approval Pending' : 'Approved',
            };
          } catch (error) {
            console.error(`Error fetching count for reference number ${item.reference_number}:`, error);
            return null;
          }
        })
      );

      console.log("Updated Data Source:", updatedDataSource); // Debugging line
      setDataSource(updatedDataSource.filter((item) => item !== null)); // Ensure no nulls
      setLoading(false);
    };

    fetchReferenceNumberCounts();
  }, [productsdata]);

  const columns = [
    {
      title: "Document Number",
      dataIndex: "documentnumber",
      key: "documentnumber",
      fixed: "left",
      width: 180,
      sorter: true,
    },
    {
      title: "From Store",
      dataIndex: "fromstore",
      key: "fromstore",
      width: 250,
      sorter: true,
    },
    {
      title: "To Store",
      dataIndex: "tostore",
      key: "tostore",
      width: 250,
      sorter: true,
    },
    {
      title: "Number of Items",
      dataIndex: "numberofitem",
      key: "numberofitem",
      width: 200,
      sorter: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 180,
      sorter: true,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 230,
      sorter: true,
    },
    {
      title: "Movement Type",
      dataIndex: "movement_type",
      key: "movement_type",
      width: 230,
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      sorter: true,
    },
  ];


  return (
    <React.Fragment>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* <InventoryMasterBarcodeHeader /> */}
          <InventoryMasterPageTopBar />
          <ItemMasterStatusBar />
          <div className="p-4">
            <div className="inventory-body">
              {/* <div className="inventory-body-wrap-header d-flex flex-wrap justify-content-between mb-3">
              <h5 className="d-flex align-items-center">
              Stock Movement
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      This page shows list of all the Stock Barcode.
                    </Tooltip>
                  }
                >
                  <span className="cursor-pointer ms-2 text-muted">
                    <i className="fas fa-info-circle f-s-16 line-height-1"></i>
                  </span>
                </OverlayTrigger>
              </h5>
            </div> */}
              <div className="inventory-body-wrap-body">
                <div className="table-wrap">
                  <div className="shadow rounded-10 bg-white">
                    <div className="d-flex justify-content-end p-3">
                      <div className="col-md-3">
                        <input
                          type="text"
                          placeholder="Search..."
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="p-0">
                      <Table
                        columns={columns}
                        dataSource={dataSource}
                        loading={loading}
                        scroll={{ x: 900 }}
                        pagination={{ pageSize: 10 }}
                        rowKey="key" // Ensure unique keys for rows
                        bordered
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </React.Fragment>
  );
}

export default InventoryMaster;
