import React, { useState, useEffect,useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";

import { PrivateAxios } from "../../environment/AxiosInstance";
import { UserAuth } from "../auth/Auth";
function InventoryMasterAdjustment() {
  const navigate = useNavigate();
  const { refid } = useParams();
  const [storeID, setstoreID] = useState("");
  const [productSkus, setProductSkus] = useState({});
  const [producthsn, setProducthsn] = useState({});
  const [storeDetails, setStoreDetails] = useState({});
  const [unitDetails, setUnitDetails] = useState({});
  const [companyDetails, setCompanyDetails] = useState({});

  const [users, setUsers] = useState([]);
  const { getGeneralSettingssymbol, getGeneralSettingsSignature } = UserAuth();
  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page
  };
  const [manualAdjustmentData, setManualAdjustmentData] = useState([]);



  const sendManualAdjustmentData = async () => {
    try {
      const response = await PrivateAxios.get(
        `product/stockadjustment/${refid}`
      );
      const data = response.data.data;
     
      setManualAdjustmentData(data); // Store the fetched data in the state
      await fetchProductSkus(data);
      await fetchStoreDetails(data);
      await fetchUnitDetails(data);
      await fetchCompanyDetails(data);
    } catch (error) {
      console.error("Error sending manual adjustment data:", error);
    }
  };
  // get opp store id
  useEffect(() => {
    const refchar = refid.replace(/[^a-zA-Z]/g, "");
    let vref = "";
    if (refchar == "INV") {
      vref = "INVR";
    } else if (refchar == "INVR") {
      vref = "INV";
    }
    const gRefval = vref + refid.replace(/\D/g, "");

    const getRefwiseStoreDetails = async () => {
      try {
        const response = await PrivateAxios.get(
          `product/stockadjustment/${gRefval}`
        );
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

  const fetchProductSkus = async (data) => {
    const productIds = data.map((item) => item.product_id); // Extract product IDs

    const uniqueIds = [...new Set(productIds)]; // Get unique product IDs
    const skus = {};
    const hsn = {};

    // Fetch SKU for each product ID
    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const response = await PrivateAxios.get(
            `product/select_product/${id}`
          ); // Adjust the endpoint as needed
          skus[id] = response.data.data.product_code;
          hsn[id] = response.data.data.hsn_code;
        } catch (error) {
          console.error(`Error fetching SKU for product ID ${id}:`, error);
        }
      })
    );

    setProductSkus(skus);
    setProducthsn(hsn);
  };
  const fetchStoreDetails = async (data) => {
    const storeIds = data.map((item) => item.store_id); // Extract store IDs
    const uniqueStoreIds = [...new Set(storeIds)];
    const stores = {};

    await Promise.all(
      uniqueStoreIds.map(async (id) => {
        try {
          const response = await PrivateAxios.get(`warehousebyid/${id}`); // Adjust the endpoint as needed
          stores[id] = response.data.data; // Assuming store details are in data
        } catch (error) {
          console.error(`Error fetching details for store ID ${id}:`, error);
        }
      })
    );

    setStoreDetails(stores); // Store the store details
  };
  useEffect(() => {
    const getStoreDetailsForStoreID = async () => {
      if (!storeDetails[storeID]) {
        // Check if store details for this storeID are already fetched
        try {
          const response = await PrivateAxios.get(`warehousebyid/${storeID}`);
          const storeData = response.data.data;

          // Update the storeDetails with the new store data
          setStoreDetails((prevDetails) => ({
            ...prevDetails,
            [storeID]: storeData, // Add storeID as key and store data as value
          }));
        } catch (error) {
          console.error(
            `Error fetching store details for ID ${storeID}:`,
            error
          );
        }
      }
    };

    // Trigger fetching if storeID exists and is not yet in storeDetails
    if (storeID) {
      getStoreDetailsForStoreID();
    }
  }, [storeID, storeDetails]); // Add storeDetails and storeID to the dependency array
  const fetchUnitDetails = async (data) => {
    const storeIds = data.map((item) => item.item_unit); // Extract store IDs
    const uniqueStoreIds = [...new Set(storeIds)];
    const Unit = {};

    await Promise.all(
      uniqueStoreIds.map(async (id) => {
        try {
          const response = await PrivateAxios.get(`getuombyid/${id}`); // Adjust the endpoint as needed
          Unit[id] = response.data.data; // Assuming store details are in data
        } catch (error) {
          console.error(`Error fetching details for store ID ${id}:`, error);
        }
      })
    );

    setUnitDetails(Unit); // Store the store details
  };

  //select company name
  const fetchCompanyDetails = async (data) => {
    const storeIds = data.map((item) => item.company_id); // Extract store IDs
    const uniqueStoreIds = [...new Set(storeIds)];
    const Unit = {};

    await Promise.all(
      uniqueStoreIds.map(async (id) => {
        try {
          const response = await PrivateAxios.get(`getcompany_name/${id}`); // Adjust the endpoint as needed
          Unit[id] = response.data.data; // Assuming store details are in data
        } catch (error) {
          console.error(`Error fetching details for store ID ${id}:`, error);
        }
      })
    );

    setCompanyDetails(Unit); // Store the store details
  };

  // Call the API when the component is mounted
  useEffect(() => {
    sendManualAdjustmentData();
  }, [refid]);
  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await PrivateAxios.get("user/all-user");
        setUsers(response.data.user); // Adjust this based on your actual API response structure
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  const userMap = {};
  users.forEach((user) => {
    userMap[user.id] = user.name; // Map user ID to user name
  });

  let adjType = ""; // Declare adjType outside of the if-else statement

  if (
    manualAdjustmentData[0] &&
    manualAdjustmentData[0].adjustmentType === "StockTransfer"
  ) {
    adjType = "Stock Transfer Delivery Challan Details";
  } else if (
    manualAdjustmentData[0] &&
    manualAdjustmentData[0].adjustmentType === "Out"
  ) {
    adjType = "Dispatched Adjustment Details";
  } else if (
    manualAdjustmentData[0] &&
    manualAdjustmentData[0].adjustmentType === "adjustment"
  ) {
    adjType = "Manual Adjustment Details";
  } else if (
    manualAdjustmentData[0] &&
    manualAdjustmentData[0].adjustmentType !== ""
  ) {
    adjType = manualAdjustmentData[0].adjustmentType + " Adjustment Details";
  }

  const createdAt = new Date(
    manualAdjustmentData[0] && manualAdjustmentData[0].created_at
  );
  console.log("storeID:", storeID);
  console.log("storeDetails:", storeDetails);
  console.log("storeDetails[storeID]:", storeDetails[storeID]);
  // Format the date and time as needed
  const formattedDate = createdAt.toLocaleDateString(); // Example: 'MM/DD/YYYY'
  const formattedTime = createdAt.toLocaleTimeString(); // Example: 'HH:MM:SS AM/PM'


  const printRef = useRef();
  
    const handlePrint = () => {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
  
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // to re-bind events and reload page
    }
  return (
    <>
      <div className="p-4">
        <div className="row justify-content-center">
          <div className="col-lg-12 col-md-12 col-sm-12">
            {/* <div className="mb-3">
              {adjType} /
              {manualAdjustmentData[0] &&
                manualAdjustmentData[0].reference_number}
            </div> */}
            <div className="card shadow-sm">
              <div className="card-body">
                <Link onClick={handleGoBack} className="me-3">
                  <i className="fas fa-arrow-left"></i>
                </Link>
                <span className="fs-6 fw-bold me-3">
                  {adjType} :{" "}
                  <strong>
                    ({" "}
                    {manualAdjustmentData[0] &&
                      manualAdjustmentData[0]?.reference_number}{" "}
                    )
                  </strong>
                </span>
                <label className="mb-0 badge exp-badge-success-light rounded-pill">
                  APPROVED
                </label>
              </div>
            </div>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="card-title">{adjType} </h4>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Print</Tooltip>}
                  >
                    <button
                      type="button"
                      className="btn icon-btn w-fit-content"
                      onClick={handlePrint}
                    >
                      <i className="fas fa-print"></i>
                    </button>
                  </OverlayTrigger>
                </div>
                <div className="print-area"  ref={printRef} id="print-section">
                  <div className="table-responsive">
                    <table
                      cellPadding="0"
                      cellSpacing="0"
                      border="0"
                      width="100%"
                    >
                      <tr>
                        <td>
                          <table
                            cellPadding="10"
                            cellSpacing="0"
                            border="0"
                            width="100%"
                          >
                            <tr>
                              <td>
                                <h4 style={{ marginBottom: "0" }}>{adjType}</h4>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  version="1.1"
                                  xmlnsXlink="http://www.w3.org/1999/xlink"
                                  width={50}
                                  height={50}
                                  x={0}
                                  y={0}
                                  viewBox="0 0 32 32"
                                  style={{
                                    enableBackground: "new 0 0 512 512",
                                  }}
                                  xmlSpace="preserve"
                                  className=""
                                >
                                  <g>
                                    <path
                                      d="M4 10a1 1 0 0 0-1 1v16h5V10zm3 14H5v-2h2zm0-4H5v-2h2zm0-4H5v-2h2zm21-6h-4v17h5V11a1 1 0 0 0-1-1zm-1 14h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zM22 2H10a1 1 0 0 0-1 1v24h14V3a1 1 0 0 0-1-1zm-7 22h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zm0-4h-2V6h2zm4 16h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zm0-4h-2V6h2zm11 22H2v-2h28z"
                                      data-name="97 Office Building, Block Apartment, Buildings, Hotel, Offices"
                                      fill="#d4d4d4"
                                      opacity={1}
                                      data-original="#000000"
                                      className=""
                                    />
                                  </g>
                                </svg>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table
                            cellPadding="10"
                            cellSpacing="0"
                            border="0"
                            width="100%"
                          >
                            <tr>
                              <td
                                colSpan="5"
                                style={{
                                  backgroundColor: "#cecece",
                                  textAlign: "center",
                                }}
                              >
                                <h5 style={{ marginBottom: "0", fontSize: 18 }}>
                                  {adjType}
                                </h5>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ width: "100px" }}>
                                <span
                                  style={{ marginBottom: "0", fontSize: 14 }}
                                >
                                  Document Number
                                </span>
                              </td>
                              <td colSpan="2">
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {manualAdjustmentData[0] &&
                                    manualAdjustmentData[0].reference_number}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ marginBottom: "0", fontSize: 14 }}
                                >
                                  Date
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {formattedDate} {formattedTime}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="1">
                                <span
                                  style={{ marginBottom: "0", fontSize: 14 }}
                                >
                                  Created By
                                </span>
                              </td>
                              <td colSpan="2">
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {userMap[
                                    manualAdjustmentData[0] &&
                                      manualAdjustmentData[0].user_id
                                  ] || "Unknown User"}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ marginBottom: "0", fontSize: 14 }}
                                >
                                  &nbsp;
                                </span>
                              </td>
                              <td colSpan="1">
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  &nbsp;
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="1">
                                <span
                                  style={{ marginBottom: "0", fontSize: 14 }}
                                >
                                  {manualAdjustmentData[0] &&
                                    manualAdjustmentData[0].adjustmentType ===
                                      "StockTransfer" && (
                                      <>
                                        <div>To Store</div>
                                        <div>From Store</div>
                                      </>
                                    )}

                                  {manualAdjustmentData[0] &&
                                    manualAdjustmentData[0].adjustmentType !==
                                      "StockTransfer" && <div>Store</div>}
                                </span>
                              </td>
                              <td colSpan="2">
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  {" "}
                                  {manualAdjustmentData[0] &&
                                    manualAdjustmentData[0].adjustmentType ===
                                      "StockTransfer" && (
                                      <>
                                        {refid.replace(/[^a-zA-Z]/g, "") !=
                                        "INVR" ? (
                                          <>
                                            {storeDetails[
                                              manualAdjustmentData[0].store_id
                                            ] ? (
                                              <>
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].name
                                                }
                                                ,
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].address1
                                                }
                                                ,
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].address2
                                                }
                                                ,
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].city
                                                }
                                                ,
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].state
                                                }{" "}
                                                -
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].pin
                                                }
                                              </>
                                            ) : (
                                              "Loading..."
                                            )}
                                            <br />
                                          </>
                                        ) : null}

                                        {storeID && storeDetails[storeID] && (
                                          <>
                                            {storeDetails[storeID].name},
                                            {storeDetails[storeID].address1},
                                            {storeDetails[storeID].address2},
                                            {storeDetails[storeID].city},
                                            {storeDetails[storeID].state} -
                                            {storeDetails[storeID].pin}
                                          </>
                                        )}

                                        {refid.replace(/[^a-zA-Z]/g, "") ==
                                          "INVR" && (
                                          <>
                                            <br />
                                            {storeDetails[
                                              manualAdjustmentData[0].store_id
                                            ] ? (
                                              <>
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].name
                                                }
                                                ,
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].address1
                                                }
                                                ,
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].address2
                                                }
                                                ,
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].city
                                                }
                                                ,
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].state
                                                }{" "}
                                                -
                                                {
                                                  storeDetails[
                                                    manualAdjustmentData[0]
                                                      .store_id
                                                  ].pin
                                                }
                                              </>
                                            ) : (
                                              "Loading..."
                                            )}
                                          </>
                                        )}
                                      </>
                                    )}
                                  {manualAdjustmentData[0] &&
                                    manualAdjustmentData[0].adjustmentType !==
                                      "StockTransfer" && (
                                      <>
                                        {storeDetails[
                                          manualAdjustmentData[0] &&
                                            manualAdjustmentData[0].store_id
                                        ]
                                          ? storeDetails[
                                              manualAdjustmentData[0] &&
                                                manualAdjustmentData[0].store_id
                                            ].name
                                          : "Loading..."}
                                        ,
                                        {storeDetails[
                                          manualAdjustmentData[0] &&
                                            manualAdjustmentData[0].store_id
                                        ]
                                          ? storeDetails[
                                              manualAdjustmentData[0] &&
                                                manualAdjustmentData[0].store_id
                                            ].address1
                                          : "Loading..."}
                                        ,
                                        {storeDetails[
                                          manualAdjustmentData[0] &&
                                            manualAdjustmentData[0].store_id
                                        ]
                                          ? storeDetails[
                                              manualAdjustmentData[0] &&
                                                manualAdjustmentData[0].store_id
                                            ].address2
                                          : "Loading..."}
                                        ,
                                        {storeDetails[
                                          manualAdjustmentData[0] &&
                                            manualAdjustmentData[0].store_id
                                        ]
                                          ? storeDetails[
                                              manualAdjustmentData[0] &&
                                                manualAdjustmentData[0].store_id
                                            ].city
                                          : "Loading..."}
                                        ,
                                        {storeDetails[
                                          manualAdjustmentData[0] &&
                                            manualAdjustmentData[0].store_id
                                        ]
                                          ? storeDetails[
                                              manualAdjustmentData[0] &&
                                                manualAdjustmentData[0].store_id
                                            ].state
                                          : "Loading..."}{" "}
                                        -
                                        {storeDetails[
                                          manualAdjustmentData[0] &&
                                            manualAdjustmentData[0].store_id
                                        ]
                                          ? storeDetails[
                                              manualAdjustmentData[0] &&
                                                manualAdjustmentData[0].store_id
                                            ].pin
                                          : "Loading..."}
                                        {}
                                      </>
                                    )}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ marginBottom: "0", fontSize: 14 }}
                                >
                                  &nbsp;
                                </span>
                              </td>
                              <td colSpan="1">
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  &nbsp;
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  borderRight: "1px solid #dbdbdb",
                                  width: "150px",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
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
                                }}
                              >
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
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
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  HSN
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
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  Quantity
                                </span>
                              </td>
                              {manualAdjustmentData[0]?.adjustmentType !==
                              "Delivery to User" ? (
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    borderRight: "1px solid #dbdbdb",
                                    textAlign: "right",
                                  }}
                                >
                                  <span
                                    style={{
                                      marginBottom: "0",
                                      fontSize: 14,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Price/Unit
                                  </span>
                                </td>
                              ) : (
                                ""
                              )}
                              <td
                                style={{
                                  borderTop: "1px solid #dbdbdb",
                                  textAlign: "right",
                                }}
                              >
                                <span
                                  style={{
                                    marginBottom: "0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                  }}
                                >
                                  Total Cost
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
                                    <br />
                                    <b>SKU</b>:{" "}
                                    {productSkus[item.product_id] ||
                                      "Loading..."}
                                    <br />
                                    {item.comment || "No comment"}
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
                                    {producthsn[item.product_id] ||
                                      "Loading..."}
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
                                    {item.quantity_changed}{" "}
                                    {!isNaN(item.item_unit)
                                      ? unitDetails[item.item_unit]
                                          ?.unit_name || "N/A"
                                      : item.item_unit}
                                  </span>
                                </td>
                                {item.adjustmentType !== "Delivery to User" ? (
                                  <td
                                    style={{
                                      borderTop: "1px solid #dbdbdb",
                                      borderRight: "1px solid #dbdbdb",
                                      textAlign: "right",
                                    }}
                                  >
                                    <span
                                      style={{
                                        marginBottom: "0",
                                        fontSize: 13,
                                        fontWeight: 400,
                                      }}
                                    >
                                      {getGeneralSettingssymbol}{" "}
                                      {item.default_price}
                                    </span>
                                  </td>
                                ) : (
                                  ""
                                )}
                                <td
                                  style={{
                                    borderTop: "1px solid #dbdbdb",
                                    textAlign: "right",
                                  }}
                                >
                                  <span
                                    style={{
                                      marginBottom: "0",
                                      fontSize: 13,
                                      fontWeight: 400,
                                    }}
                                  >
                                    {getGeneralSettingssymbol}{" "}
                                    {item.adjustmentType !== "Delivery to User"
                                      ? (
                                          parseFloat(
                                            item.default_price.replace(
                                              /[^0-9.]/g,
                                              ""
                                            )
                                          ) * item.quantity_changed
                                        ).toFixed(2)
                                      : item.default_price}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            <tr>
                              <td
                                colSpan="5"
                                style={{
                                  textAlign: "center",
                                  borderTop: "1px solid #dbdbdb",
                                }}
                              >
                                <div
                                  style={{
                                    width: "240px",
                                    height: "150px",
                                    backgroundColor: "#dbdbdb",
                                    marginRight: 0,
                                    marginLeft: "auto",
                                  }}
                                >
                                  <span>
                                    {manualAdjustmentData[0]?.companyManagement
                                      ?.company_name || "N/A"}
                                  </span>
                                  <span
                                    style={{
                                      display: "block",
                                      width: "100%",
                                    }}
                                  >
                                    <img
                                      src={getGeneralSettingsSignature}
                                      style={{
                                        maxWidth: "170px",
                                        margin: "10px 0",
                                        maxHeight: "70px",
                                      }}
                                      alt=""
                                    />
                                  </span>
                                  <span>Authorised Signatory</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
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

export default InventoryMasterAdjustment;
