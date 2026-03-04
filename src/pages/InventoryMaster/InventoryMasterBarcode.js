import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import InventoryMasterBarcodeHeader from './inventoryHeader';
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { PrivateAxios } from "../../environment/AxiosInstance";
import { Row, Col, Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { UserAuth } from "../auth/Auth";
import { formatDateManual } from "../../environment/DateFormat";
import Barcode from 'react-barcode';
import { SuccessMessage, ErrorMessage } from "../../environment/ToastMessage";
import JsBarcode from 'jsbarcode';
import ItemMasterStatusBar from "./itemMaster/ItemMasterStatusBar";
import { Tooltip } from "antd";
function InventoryMasterBarcode() {
  const navigate = useNavigate();
  const [lgShow, setLgShow] = useState(false);
  const { refid, chqty, ntqty } = useParams();
  const [users, setUsers] = useState([]);
  const [storeID, setstoreID] = useState('');
  const [productSkus, setProductSkus] = useState({});
  const [producthsn, setProducthsn] = useState({});
  const [storeDetails, setStoreDetails] = useState({});
  const [unitDetails, setUnitDetails] = useState({});
  const [companyDetails, setCompanyDetails] = useState({});
  const [manualAdjustmentData, setManualAdjustmentData] = useState([]);
  const [show, setShow] = useState(false);
  const barcodeRef = React.createRef(); // Reference for barcode section
  const [numberOfCopies, setNumberOfCopies] = useState({});
  const [barcodeData, setBarcodeData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);


  const handleShowModal = () => {
    const dataForModal = manualAdjustmentData.map((item) => {
      const copies = numberOfCopies[item.product_id] || 1;
      return Array.from({ length: copies }).map(() => ({
        barcode_number: item.barcode_number,
        barcode_sku: productSkus[item.product_id],
      }));
    }).flat();

    setBarcodeData(dataForModal);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Generate barcodes using JsBarcode library
  useEffect(() => {
    if (barcodeData.length > 0) {
      barcodeData.forEach((item, index) => {
        // Generate the barcode and append the number below it
        JsBarcode(`#barcode${index}`, item.barcode_number, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: true, // Show the barcode number in the barcode
          fontSize: 17, // Set font size for barcode number
        });
      });
    }
  }, [barcodeData]);

  // Handle number of copies change
  const handleCopiesChange = (productId, e) => {
    setNumberOfCopies({ ...numberOfCopies, [productId]: e.target.value });
  }

  const [formData, setFormData] = useState({
    companyName: '',
    barcodeNumber: '',
    itemId: '',
    anotherCompanyName: '',
  });
  const { getGeneralSettingssymbol } = UserAuth();
  useEffect(() => {
    PrivateAxios.get('/getbarcode')
      .then(response => {
        setFormData(response.data.data);
      })
      .catch(error => {
        ErrorMessage('There was an error fetching the data!');
      });
  }, []);



  const handlePrint = () => {
    window.print();
  };
  const sendManualAdjustmentData = async () => {
    try {
      const response = await PrivateAxios.get(
        `product/stockadjustment/${refid}`
      );
      const data = response.data.data;
      console.log(data);
      setManualAdjustmentData(data); // Store the fetched data in the state
      await fetchProductSkus(data);
      await fetchStoreDetails(data);
      await fetchUnitDetails(data);
      await fetchCompanyDetails(data);
    } catch (error) {
      console.error("Error sending manual adjustment data:", error);
    }
  };
  useEffect(() => {
    sendManualAdjustmentData();
  }, [refid]);

  const fetchProductSkus = async (data) => {
    const productIds = data.map(item => item.product_id); // Extract product IDs

    const uniqueIds = [...new Set(productIds)]; // Get unique product IDs
    const skus = {};
    const hsn = {};

    // Fetch SKU for each product ID
    await Promise.all(uniqueIds.map(async (id) => {
      try {
        const response = await PrivateAxios.get(`product/select_product/${id}`); // Adjust the endpoint as needed
        skus[id] = response.data.data.product_code;
        hsn[id] = response.data.data.hsn_code;
      } catch (error) {
        console.error(`Error fetching SKU for product ID ${id}:`, error);
      }
    }));

    setProductSkus(skus);
    setProducthsn(hsn);

  };
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
  const fetchStoreDetails = async (data) => {
    const storeIds = data.map(item => item.store_id); // Extract store IDs
    const uniqueStoreIds = [...new Set(storeIds)];
    const stores = {};

    await Promise.all(uniqueStoreIds.map(async (id) => {
      try {
        const response = await PrivateAxios.get(`warehousebyid/${id}`); // Adjust the endpoint as needed
        stores[id] = response.data.data; // Assuming store details are in data
      } catch (error) {
        console.error(`Error fetching details for store ID ${id}:`, error);
      }
    }));

    setStoreDetails(stores); // Store the store details
  };
  const styles = {
    labelContainer: {
      width: '50%',
      border: '1px solid #ccc',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },
    barcodeimage: {
      maxHeight: '100px',
    },
    labelHeader: {

      padding: '5px',
      fontWeight: 'bold',
      fontSize: '12px',
    },
    sku: {
      fontWeight: 'bold',
      margin: '5px 0',
    },
    barcode: {
      margin: '5px 0',
    },
    productCode: {
      margin: '5px 0',
      fontWeight: 'bold',
      fontSize: '12px',
    },
    barcodeText: {
      fontFamily: 'monospace', // Using a monospaced font to match
      fontSize: '12px',
      fontWeight: 'bold',
      marginTop: '5px',
    },
  };

  const fetchUnitDetails = async (data) => {
    const storeIds = data.map(item => item.item_unit); // Extract store IDs
    const uniqueStoreIds = [...new Set(storeIds)];
    const Unit = {};

    await Promise.all(uniqueStoreIds.map(async (id) => {
      try {
        const response = await PrivateAxios.get(`getuombyid/${id}`); // Adjust the endpoint as needed
        Unit[id] = response.data.data; // Assuming store details are in data
      } catch (error) {
        console.error(`Error fetching details for store ID ${id}:`, error);
      }
    }));

    setUnitDetails(Unit); // Store the store details
  };
  useEffect(() => {
    const getStoreDetailsForStoreID = async () => {
      if (!storeDetails[storeID]) {  // Check if store details for this storeID are already fetched
        try {
          const response = await PrivateAxios.get(`warehousebyid/${storeID}`);
          const storeData = response.data.data;

          // Update the storeDetails with the new store data
          setStoreDetails(prevDetails => ({
            ...prevDetails,
            [storeID]: storeData,  // Add storeID as key and store data as value
          }));
        } catch (error) {
          console.error(`Error fetching store details for ID ${storeID}:`, error);
        }
      }
    };

    // Trigger fetching if storeID exists and is not yet in storeDetails
    if (storeID) {
      getStoreDetailsForStoreID();
    }
  }, [storeID, storeDetails]);
  const fetchCompanyDetails = async (data) => {
    const storeIds = data.map(item => item.company_id); // Extract store IDs
    const uniqueStoreIds = [...new Set(storeIds)];
    const Unit = {};

    await Promise.all(uniqueStoreIds.map(async (id) => {
      try {
        const response = await PrivateAxios.get(`getcompany_name/${id}`); // Adjust the endpoint as needed
        Unit[id] = response.data.data; // Assuming store details are in data
      } catch (error) {
        console.error(`Error fetching details for store ID ${id}:`, error);
      }
    }));

    setCompanyDetails(Unit); // Store the store details
  };
  useEffect(() => {
    const refchar = refid.replace(/[^a-zA-Z]/g, "");
    let vref = '';
    if (refchar == "INV") {
      vref = 'INVR';
    } else if (refchar == "INVR") {
      vref = 'INV';
    }
    const gRefval = vref + refid.replace(/\D/g, "");

    const getRefwiseStoreDetails = async () => {
      try {
        const response = await PrivateAxios.get(`product/stockadjustment/${gRefval}`);
        const data = response.data.data;

        setstoreID(data[0].store_id); // Store the fetched data in the state
      } catch (error) {
        console.error("Error sending manual adjustment data:", error);
      }
    };

    // Check conditions and trigger the API call if necessary
    if (
      (refchar == "INV" || refchar == "INVR") &&
      manualAdjustmentData[0] &&
      manualAdjustmentData[0].adjustmentType === "StockTransfer"
    ) {
      getRefwiseStoreDetails();
    }
  }, [manualAdjustmentData]); // Dependency array

  let adjType = ""; // Declare adjType outside of the if-else statement

  if (manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType === "StockTransfer") {
    adjType = "Stock Transfer";
  } else if (manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType === "Out") {
    adjType = "Reduce from Store";
  } else if (manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType === "adjustment") {
    adjType = "Manual Adjustment";
  } else if (manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType !== "") {
    adjType = manualAdjustmentData[0].adjustmentType;
  }

  const handlePrintofBarcode = () => {
    const printContent = document.getElementById('barcode-print-section').innerHTML;
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
    <html>
      <head>
        <title>Print Barcodes</title>
        <style>
          @media print {
            body {
              margin: 0;
              padding: 0;
              font-size: 12px;
            }
          }
          .barcode-container {
            display: inline-block; /* Use inline-block for two in a row */
            width: 48%; /* Adjust width to fit two barcodes per row */
            text-align: center; /* Center-align content */
            margin-bottom: 10px; /* Spacing between rows */
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
  };
  return (
    <>
      {/* <InventoryMasterBarcodeHeader />  */}
      <ItemMasterStatusBar />
      <div className="p-4">
        <div className="inventory-body pt-4">
          <div className="row justify-content-center">
            <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="card shadow-sm position-relative">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="ribbon">Approved</span>
                    <h4 className="card-title fw-medium">
                      Store Entry/Issue Approval ({refid})
                    </h4>
                    <div className="d-flex gap-2">
                      <Tooltip title="Print">
                        <button type='button' className="btn icon-btn w-fit-content" onClick={handlePrint}>
                          <i className="fas fa-print"></i>
                        </button>
                      </Tooltip>
                      <Tooltip title="Print Barcode">
                        <button type='button' className="btn icon-btn w-fit-content" onClick={() => setLgShow(true)}>
                          <i class="fas fa-barcode"></i>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="print-area ">
                    <Table
                      cellPadding="0"
                      cellSpacing="0"
                      responsive
                      border="0"
                      width="100%"
                    >
                      <tr>
                        <td className="printFirst_td p-0 border-0">
                          <Table
                            cellPadding="8"
                            cellSpacing="0"
                            border="0"
                            width="100%"
                            className="p-0 border rounded"
                          // responsive
                          >
                            <tr>
                              <td colSpan="3">
                                <span className="text-nowrap p-0" style={{ marginBottom: "0", fontSize: 14 }}>
                                  Document Type
                                </span>
                              </td>
                              <td colSpan="4">
                                <span
                                  className="p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {adjType}
                                </span>
                              </td>
                              <td colSpan="2">
                                <span className="text-nowrap p-0" style={{ marginBottom: "0", fontSize: 14 }}>
                                  Document Number
                                </span>
                              </td>
                              <td colSpan="5">
                                <span
                                  className=" p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {refid}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="3">
                                <span className="text-nowrap p-0" style={{ marginBottom: "0", fontSize: 14 }}>
                                  Created By
                                </span>
                              </td>
                              <td colSpan="4">
                                <span
                                  className="p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {userMap[manualAdjustmentData[0] && manualAdjustmentData[0].user_id] || 'Unknown User'}
                                </span>
                              </td>
                              <td colSpan="2">
                                <span className="text-nowrap p-0" style={{ marginBottom: "0", fontSize: 14 }}>
                                  No of Items
                                </span>
                              </td>
                              <td colSpan="5">
                                <span
                                  className=" p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {manualAdjustmentData.length}

                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="3">
                                <span className="text-nowrap p-0" style={{ marginBottom: "0", fontSize: 14 }}>
                                  {manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType === "StockTransfer" && (
                                    <>

                                      <div>To Store</div>
                                      <div>From Store</div>
                                    </>
                                  )}

                                  {manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType !== "StockTransfer" && (
                                    <div>Store</div>
                                  )}
                                </span>
                              </td>
                              <td colSpan="4">
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType === "StockTransfer" && (
                                    <>

                                      {refid.replace(/[^a-zA-Z]/g, "") != "INVR" ? (
                                        <>
                                          {storeDetails[manualAdjustmentData[0].store_id] ? (
                                            <>
                                              {storeDetails[manualAdjustmentData[0].store_id].name}
                                            </>
                                          ) : (
                                            'Loading...'
                                          )}
                                          <br />
                                        </>
                                      ) : null}

                                      {storeID && storeDetails[storeID] && (
                                        <>
                                          {storeDetails[storeID].name}
                                        </>
                                      )}

                                      {refid.replace(/[^a-zA-Z]/g, "") == "INVR" && (
                                        <>
                                          <br />
                                          {storeDetails[manualAdjustmentData[0].store_id] ? (
                                            <>
                                              {storeDetails[manualAdjustmentData[0].store_id].name}
                                            </>
                                          ) : (
                                            'Loading...'
                                          )}
                                        </>
                                      )}
                                    </>
                                  )}
                                  {manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType !== "StockTransfer" && (
                                    <>
                                      {storeDetails[manualAdjustmentData[0] && manualAdjustmentData[0].store_id] ? storeDetails[manualAdjustmentData[0] && manualAdjustmentData[0].store_id].name : 'Loading...'}
                                      { }
                                    </>

                                  )}
                                </span>
                              </td>
                              <td colSpan="2">
                                <span className="text-nowrap p-0" style={{ marginBottom: "0", fontSize: 14 }}>
                                  Creation Date
                                </span>
                              </td>
                              <td colSpan="5">
                                <span
                                  className=" p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {formatDateManual(manualAdjustmentData[0] && manualAdjustmentData[0].created_at)}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  width: "80px",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Sl. No.
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Item Id
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Description
                                </span>
                              </td>

                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Action
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  From Store
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  To Store
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Document Quantity
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Approved Quantity
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Unit
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Base Quantity
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Base Unit
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Current Stock
                                </span>
                              </td>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  textAlign: "right",
                                }}
                              >
                                <span
                                  className="text-nowrap p-0"
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Comment
                                </span>
                              </td>
                            </tr>
                            {manualAdjustmentData.map((item, index) => (
                              <tr key={item.id}>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    width: "80px",
                                    textAlign: "center",
                                  }}
                                >
                                  <span
                                    className="text-nowrap p-0"
                                    style={{
                                      marginBottom: "0",
                                      fontSize: 13,
                                      fontWeight: 400,
                                    }}
                                  >
                                    {index + 1}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "center",
                                  }}
                                >
                                  <span
                                    
                                    style={{
                                      marginBottom: "0",
                                      fontSize: 13,
                                      fontWeight: 400,
                                    }}
                                  >
                                    <a href={`/inventory/inventory-master-edit/${item.product_id}`}>{productSkus[item.product_id] || 'Loading...'}</a>
                                  </span>
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                  }}
                                >
                                  <span
                                    
                                    style={{
                                      marginBottom: "0",
                                      fontSize: 13,
                                      fontWeight: 400,
                                    }}
                                  >
                                    {item.item_name}
                                  </span>
                                </td>

                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                  }}
                                >
                                  <span
                                    style={{
                                      marginBottom: "0",
                                      fontSize: 13,
                                      fontWeight: 400,
                                    }}
                                  >
                                    {adjType}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      paddingBottom: 5,
                                      // borderBottom: "1px dashed #545454",
                                    }}
                                  >
                                    {refid.replace(/[^a-zA-Z]/g, "") == "INVR" && (
                                      <>

                                        {storeDetails[manualAdjustmentData[0].store_id] ? (
                                          <>
                                            {storeDetails[manualAdjustmentData[0].store_id].name}

                                          </>
                                        ) : (
                                          'Loading...'
                                        )}
                                      </>
                                    )}

                                    {manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType === "StockTransfer" && (
                                      <>
                                        {storeID && storeDetails[storeID] && (
                                          <>
                                            {storeDetails[storeID].name}
                                          </>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <div style={{ width: "100%", paddingTop: 5 }}>
                                    {manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType !== "StockTransfer" && (
                                      <>
                                        {storeDetails[manualAdjustmentData[0] && manualAdjustmentData[0].store_id] ? storeDetails[manualAdjustmentData[0] && manualAdjustmentData[0].store_id].name : 'Loading...'}                        </>

                                    )}
                                  </div>
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "left",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      paddingBottom: 5,
                                      //borderBottom: "1px dashed #545454",
                                    }}
                                  >
                                    {manualAdjustmentData[0] && manualAdjustmentData[0].adjustmentType === "StockTransfer" && (
                                      <>

                                        {refid.replace(/[^a-zA-Z]/g, "") != "INVR" ? (
                                          <>
                                            {storeDetails[manualAdjustmentData[0].store_id] ? (
                                              <>
                                                {storeDetails[manualAdjustmentData[0].store_id].name}
                                              </>
                                            ) : (
                                              'Loading...'
                                            )}

                                          </>
                                        ) : null}

                                        {storeID && storeDetails[storeID] && (
                                          <>
                                            {storeDetails[storeID].name}
                                          </>
                                        )}
                                      </>
                                    )}
                                  </div>

                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "left",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      paddingBottom: 5,
                                      borderBottom: "1px dashed #545454",
                                    }}
                                  >
                                    {Math.abs(chqty)}
                                  </div>

                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "left",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      paddingBottom: 5,
                                      borderBottom: "1px dashed #545454",
                                    }}
                                  >
                                    {Math.abs(chqty)}
                                  </div>

                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "left",
                                  }}
                                >
                                  <span
                                    style={{
                                      marginBottom: "0",
                                      fontSize: 13,
                                      fontWeight: 400,
                                    }}
                                  >
                                    {!isNaN(item.item_unit)
                                      ? (unitDetails[item.item_unit]?.unit_name || 'N/A')
                                      : item.item_unit}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "left",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      paddingBottom: 5,
                                      borderBottom: "1px dashed #545454",
                                    }}
                                  >
                                    {Math.abs(chqty)}
                                  </div>

                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "left",
                                  }}
                                >
                                  <span
                                    style={{
                                      marginBottom: "0",
                                      fontSize: 13,
                                      fontWeight: 400,
                                    }}
                                  >
                                    {!isNaN(item.item_unit)
                                      ? (unitDetails[item.item_unit]?.unit_name || 'N/A')
                                      : item.item_unit}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "left",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      paddingBottom: 5,
                                      borderBottom: "1px dashed #545454",
                                    }}
                                  >
                                    {ntqty}
                                  </div>
                                  <div style={{ width: "100%", paddingTop: 5 }}>
                                    &nbsp;
                                  </div>
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    textAlign: "right",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      paddingBottom: 5,

                                    }}
                                  >
                                    {item.comment}
                                  </div>

                                </td>
                              </tr>
                            ))}
                          </Table>
                        </td>
                      </tr>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        size="lg"
        className="model_80"
        show={lgShow}
        backdrop="static"
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Print Preferences
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="container mt-4">
            <div class="table-responsive p-0">
              <table class="table table-bordered">
                <thead class="thead-light">
                  <tr>
                    <th className="text-nowrap">#</th>
                    <th className="text-nowrap">Item Id</th>
                    <th className="text-nowrap">Item Name</th>
                    <th className="text-nowrap">Quantity</th>
                    <th className="text-nowrap">Barcode Number</th>
                    <th className="text-nowrap">Number Of Copies</th>
                  </tr>
                </thead>
                <tbody>
                  {manualAdjustmentData.map((item, index) => (
                    <tr>
                      <td> {index + 1}</td>
                      <td>{productSkus[item.product_id] || 'Loading...'}</td>
                      <td><div className="min-width-200">{item.item_name}</div></td>
                      <td>{Math.abs(chqty)}</td>
                      <td><div className="min-width-200">{item.barcode_number}</div></td>
                      <td><div className="min-width-150"><Form.Control
                        type="number"
                        min="1"
                        value={numberOfCopies[item.product_id] || 1}
                        onChange={(e) => handleCopiesChange(item.product_id, e)}
                      /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            <div class="row">
              <div class="col-md-6">

                <div class="card">
                  <div class="card-body">
                    <div class="text-center">
                      <h5>{formData.comapny_name_display === 0 ? '' : formData.company_name}</h5>
                      <p class="mb-0">{formData.item_id === 0 ? '' : 'SKU00324'}</p>
                      <img src={process.env.PUBLIC_URL + '/assets/images/barcode.png'} style={styles.barcodeimage} className=" img-fluid mt-1 ms-2" />
                      <p class="mb-0">{formData.barcode_number === 0 ? "" : '3454354523464566'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-6">

                <div class="card">
                  <div class="card-body">
                    <h5>Steps To Print Barcode:</h5>
                    <ol className="f-s-14">
                      <li>Click on "Print Now".</li>
                      <li>When the print dialogue box opens up, select the barcode printer connected to your system.</li>
                      <li>Open More Settings of the browser and select "Print using System Dialogue".</li>
                      <li>In the System Dialogue, select the Barcode Printer.</li>
                      <li>Select the Paper Size. Add your Custom Paper Size if not already added.</li>
                      <li>Click on Print.</li>
                    </ol>
                    <p class="text-muted">Note: Please reach out to us on chat if you need any help.</p>
                  </div>
                </div>
              </div>
            </div>


            <div class="d-flex justify-content-between mt-3">
              <a href="/settings/inventory/barcode" class="btn btn-outline-secondary" role="button"><i className="fas fa-pen me-2"></i>Edit Barcode Settings</a>

              <button type='button' class="btn btn-success" onClick={handleShowModal}><i className="fas fa-print me-2"></i>Print Now</button>
            </div>
          </div>


        </Modal.Body>
      </Modal>
      {/* Modal to display the barcode previews */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" size="">
        <Modal.Header closeButton>

          <Modal.Title>Barcode Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body id="barcode-print-section" style={{ maxHeight: '500px', overflowY: 'scroll' }}>
          <div className="row">
            {barcodeData.map((item, index) => (
              <div className="col-md-6 text-center mb-4 barcode-container" key={index}>
                <p style={{ marginBottom: '-2px', fontWeight: "bold" }}>{formData.comapny_name_display === 0 ? '' : formData.company_name}</p>
                <p style={{ marginBottom: '-4px' }}>{formData.item_id === 0 ? '' : item.barcode_sku}</p>
                <svg id={`barcode${index}`}></svg>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type='button' onClick={handlePrintofBarcode}>
            Print
          </Button>
        </Modal.Footer>
      </Modal>
    </>

  );
}

export default InventoryMasterBarcode;
