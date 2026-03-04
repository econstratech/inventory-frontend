import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "jspdf-autotable";

// import { Link } from "react-router-dom";
// import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./mysalesorderdispatch.css";
import "handsontable/dist/handsontable.full.min.css";
import {
  PrivateAxios,
  // PrivateAxiosFile,
  // url,
} from "../../../../environment/AxiosInstance";
import { UserAuth } from "../../../auth/Auth";
// import { Button, Table } from "react-bootstrap";

import moment from "moment";
import {
  // ErrorMessage,
  SuccessMessage,
} from "../../../../environment/ToastMessage";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
// import { process } from "@progress/kendo-data-query";
// import { ExcelExport } from "@progress/kendo-react-excel-export";
// import { PDFExport } from "@progress/kendo-react-pdf";
import {
  Tooltip,
  Modal,
  Table as AntTable,
  Select as AntSelect,
  InputNumber,
  Button,
  Divider,
  Alert,
  Typography,
  Space,
} from "antd";
import SalesQuotationPageTopBar from "../SalesQuotationPageTopBar";
// import PoUpdateStatusBar from "../poUpdate/PoUpdateStatusBar";
// import CustomerDispatchModal from "./CustomerDispatchModal";
import Loader from "../../../../environment/Loader";
import FinalSaleOrderDispatchModal from "../../../CommonComponent/FinalSaleOrderDispatchModal";
// import SaleOrderDetailsModal from "../../../CommonComponent/SaleOrderDetailsModal";

function MysalesOrderDispatchList() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } =
    UserAuth();
  //for-data table
  // const [showConfirmModal, setShowConfirmModal] = useState(false);
  // const [selectedDispatchItem, setSelectedDispatchItem] = useState(null);
  // const [dispatchType, setDispatchType] = useState(""); // "stock" or "customer"
  // const [lgShow, setLgShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [showStatusModal, setShowStatusModal] = useState(false);
  // const [statusModalData, setStatusModalData] = useState([]);
  const [showPrice, setShowPrice] = useState(false);
  const [ProductCompare, setProductCompare] = useState([]);
  const [showFinalSaleOrderDispatchModal, setShowFinalSaleOrderDispatchModal] = useState(false);

  // Available batches modal
  const [batchesModalOpen, setBatchesModalOpen] = useState(false);
  const [batchesModalSaleId, setBatchesModalSaleId] = useState(null);
  const [availableBatchesLoading, setAvailableBatchesLoading] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [receiveRows, setReceiveRows] = useState([]);
  const [receiveError, setReceiveError] = useState("");
  const [receiveSubmitting, setReceiveSubmitting] = useState(false);

  const createReceiveRow = () => ({
    key: `${Date.now()}-${Math.random()}`,
    batchId: null,
    qty: 0,
  });


  const [pageState, setPageState] = useState({ skip: 0, take: 15, searchKey: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);

  const fetchWorkOrders = async (customPageState = null, customReferenceFilter = null, customDateRangeFilter = null) => {
    setIsLoading(true);
    setLoading(true);

    const currentPageState = customPageState || pageState;
    const currentReferenceFilter = customReferenceFilter !== null ? customReferenceFilter : referenceNumberFilter;
    const currentDateRangeFilter = customDateRangeFilter !== null ? customDateRangeFilter : dateRangeFilter;

    try {
      const urlParams = new URLSearchParams({
        page: currentPageState.skip / currentPageState.take + 1,
        limit: currentPageState.take,
        type: 'orderForDispatch',
        ...(currentPageState.searchKey && { search: currentPageState.searchKey }),
        ...(currentReferenceFilter && { reference_number: currentReferenceFilter }),
        ...(currentDateRangeFilter[0] && { expected_delivery_date_start: moment(currentDateRangeFilter[0]).format("YYYY-MM-DD") }),
        ...(currentDateRangeFilter[1] && { expected_delivery_date_end: moment(currentDateRangeFilter[1]).format("YYYY-MM-DD") })
      });

      const response = await PrivateAxios.get(`sales/all-sale-quotation?${urlParams.toString()}`);

      const responseData = response.data.data || [];
      const currentPage = responseData.pagination?.current_page || 1;
      const perPage = responseData.pagination?.per_page || currentPageState.take;
      const startingIndex = (currentPage - 1) * perPage;

      // Transform the data - flatten products from each sale quotation
      // const transformedData = [];
      // let itemCounter = startingIndex;
      // responseData.rows.forEach((saleQuotation) => {
      //   if (saleQuotation.products && Array.isArray(saleQuotation.products)) {
      //     saleQuotation.products.forEach((product, productIndex) => {
      //       // Only include products that match the work order criteria
      //       if (
      //         product.status === 10 && // Dispatched status
      //         (!product.is_dispatched || product.is_dispatched === 0) &&
      //         (!product.is_invoice || product.is_invoice === 0)
      //       ) {
      //         itemCounter++;
      //         transformedData.push({
      //           id: product.id || `${saleQuotation.id}-${productIndex}`,
      //           slNo: itemCounter,
      //           production_number: product.production_number || "N/A",
      //           reference: saleQuotation.reference_number || "-",
      //           customer: saleQuotation.customer?.name || "N/A",
      //           createdBy: saleQuotation.createdBy?.name || "N/A",
      //           product_name: product.productData?.product_name || product.ProductsItem?.product_name || "N/A",
      //           product_code: product.productData?.product_code || product.ProductsItem?.product_code || "-",
      //           product_id: product.product_id || product.productData?.id || "N/A",
      //           qty: product.qty || 0,
      //           unit_price: getGeneralSettingssymbol + Number(product.unit_price || 0).toFixed(2),
      //           total_tax_incl: getGeneralSettingssymbol + Number(product.taxIncl || (product.unit_price * product.qty * (1 + (product.tax || 0) / 100))).toFixed(2),
      //           unit: product.productData?.masterUOM?.name || product.ProductsItem?.Masteruom?.unit_name || "-",
      //           created_at: moment(saleQuotation.created_at || product.created_at).format("DD-MM-YYYY"),
      //           has_mixed_status: product.has_mixed_status || false,
      //           purchase_id: saleQuotation.id,
      //         });
      //       }
      //     });
      //   }
      // });

      // const avgProductsPerQuotation = responseData.rows.length > 0 
      //   ? transformedData.length / responseData.rows.length 
      //   : 0;
      // const estimatedTotal = avgProductsPerQuotation > 0 
      //   ? Math.ceil(responseData.pagination?.total_records * avgProductsPerQuotation)
      //   : transformedData.length;

      const transformedData = responseData.rows.map((item, index) => ({
        id: item.id,
        slNo: startingIndex + index + 1,
        reference: item.reference_number,
        creation: moment(item.created_at).format("DD-MM-YYYY H:mm"),
        expectedDeliveryDate: moment(item.expected_delivery_date || item.expiration).format("DD/MM/YYYY"),
        paymentTerms: item.payment_terms,
        customer: item.customer && item.customer.name,
        salesPerson: item.createdBy?.name,
        storeName: item.warehouse?.name,
        // buyer: item.buyer,
        total: `${getGeneralSettingssymbol}${item.total_amount}`,
        status: item.status,
        is_parent: item.is_parent,
        is_parent_id: item.is_parent_id,
        mailsend_status: item.mailsend_status,
        parent_recd_id: item.parent_recd_id,
        payment_terms: item.payment_terms,
        products: item.products,
        productsreprodut: item.productsreprodut,
        untaxed_amount: item.untaxed_amount,
        user_id: item.user_id,
      }));

      setData(transformedData);
      
      setTotalCount(responseData.pagination?.total_records || 0);
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      if (error.response?.status === 401) {
        Logout();
      }
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handlePageChange = (event) => {
    const newPageState = {
      skip: event.page.skip,
      take: event.page.take,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    // Fetch data with updated pagination and current filter
    fetchWorkOrders(newPageState, null, null); // Pass null to use current filter values from state
  };

  // Handle filter button click
  const handleFilter = () => {
    const newPageState = { ...pageState, skip: 0 }; // Reset to first page when filtering
    setPageState(newPageState);
    fetchWorkOrders(newPageState, null, null); // Pass null to use current filter values from state
  };

  // Handle reset button click
  const handleReset = () => {
    const resetPageState = { skip: 0, take: 15, searchKey: "" };
    const resetReferenceFilter = "";
    const resetDateRangeFilter = [null, null];
    
    // Update state
    setPageState(resetPageState);
    setReferenceNumberFilter(resetReferenceFilter);
    setDateRangeFilter(resetDateRangeFilter);
    
    // Call fetchWorkOrders with reset values directly to avoid async state update issue
    fetchWorkOrders(resetPageState, resetReferenceFilter, resetDateRangeFilter);
  };

  const handleSubmitFinalSaleOrderDispatch = async (selectedItems, batchPayload = []) => {
    const payload = { products: [] };
    let salesOrderId = null;
    selectedItems.forEach((item) => {
      salesOrderId = item.salesOrder.id;
      payload.products.push({
        sales_product_id: item.product.id,
        delivery_note: item.deliveryNote,
      });
    });
    if (batchPayload && batchPayload.length > 0) {
      payload.batches = batchPayload;
    }
    // console.log("payload", payload);
    try {
      const response = await PrivateAxios.put(`sales/final-dispatch/${salesOrderId}`, payload);
      if (response.status === 200) {
        SuccessMessage("Sale order dispatched successfully");
        setShowFinalSaleOrderDispatchModal(false);
      }
    } catch (error) {
      console.error("Error submitting sale order:", error);
    }
  };

  const closeBatchesModal = () => {
    setBatchesModalOpen(false);
    setBatchesModalSaleId(null);
    setAvailableBatches([]);
    setReceiveRows([]);
    setReceiveError("");
    setReceiveSubmitting(false);
  };


  const getBatchById = (batchId) =>
    availableBatches.find((b) => String(b.id) === String(batchId));

  const sumEnteredForBatch = (batchId, excludeKey) =>
    receiveRows
      .filter((r) => r.batchId != null && String(r.batchId) === String(batchId) && r.key !== excludeKey)
      .reduce((s, r) => s + (Number(r.qty) || 0), 0);

  const remainingBeforeRow = (row) => {
    if (!row.batchId) return 0;
    const batch = getBatchById(row.batchId);
    if (!batch) return 0;
    const availableQty = Number(batch.quantity) || 0;
    const usedByOthers = sumEnteredForBatch(row.batchId, row.key);
    return Math.max(availableQty - usedByOthers, 0);
  };

  const balanceAfterRow = (row) => {
    const remaining = remainingBeforeRow(row);
    const q = Number(row.qty) || 0;
    return Math.max(remaining - q, 0);
  };

  const updateReceiveRow = (key, patch) => {
    setReceiveRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  };

  const addReceiveRow = () => {
    setReceiveRows((prev) => [...prev, createReceiveRow()]);
  };

  const removeReceiveRow = (key) => {
    setReceiveRows((prev) => {
      const next = prev.filter((r) => r.key !== key);
      return next.length ? next : [createReceiveRow()];
    });
  };

  const handleReceiveSubmit = async () => {
    setReceiveError("");
    const validRows = receiveRows
      .filter((r) => r.batchId && (Number(r.qty) || 0) > 0)
      .map((r) => ({ batchId: r.batchId, qty: Number(r.qty) || 0 }));

    if (!validRows.length) {
      setReceiveError("Please select at least one batch and enter quantity.");
      return;
    }

    // Aggregate quantities by batchId
    const batchMap = new Map();
    validRows.forEach((r) => {
      const key = String(r.batchId);
      batchMap.set(key, (batchMap.get(key) || 0) + r.qty);
    });

    // Validate against available quantities
    for (const [batchIdStr, qty] of batchMap.entries()) {
      const batch = getBatchById(batchIdStr);
      const availableQty = Number(batch?.quantity) || 0;
      if (qty > availableQty) {
        setReceiveError(
          `Quantity for batch ${batch?.batch_no || batchIdStr} cannot exceed available quantity (${availableQty}).`
        );
        return;
      }
    }

    const payload = {
      batches: Array.from(batchMap.entries()).map(([batchIdStr, qty]) => ({
        batch_id: Number.isNaN(Number(batchIdStr)) ? batchIdStr : Number(batchIdStr),
        quantity: qty,
      })),
    };

    if (!batchesModalSaleId) {
      setReceiveError("Missing sale id for receiving batches.");
      return;
    }

    // setReceiveSubmitting(true);
    // try {
    //   const res = await PrivateAxios.post(
    //     `sales/receive-from-batches/${batchesModalSaleId}`,
    //     payload
    //   );
    //   if (res.status === 200 || res.status === 201) {
    //     SuccessMessage(res.data?.message || "Received successfully.");
    //     closeBatchesModal();
    //     fetchWorkOrders();
    //   }
    // } catch (error) {
    //   console.error("Receive from batches error:", error);
    //   setReceiveError(
    //     error.response?.data?.message ||
    //       error.response?.data?.error ||
    //       "Failed to receive from batches."
    //   );
    // } finally {
    //   setReceiveSubmitting(false);
    // }
  };




  const pdfExportRef = React.createRef();
  const excelExportRef = React.createRef();

  const handleExportPDF = () => {
    if (pdfExportRef.current) {
      pdfExportRef.current.save();
    }
  };

  const handleExportExcel = () => {
    if (excelExportRef.current) {
      excelExportRef.current.save();
    }
  };

  const ActionCell = (props) => {
    const { dataItem } = props;



    // const handleOpenStatusModal = async (salesId) => {
    //   try {
    //     const res = await PrivateAxios.get(`/sales/getproductsbypurchase/${salesId}`);

    //     if (res.status === 200) {
    //       setStatusModalData(res.data); // Set the product list
    //       setShowStatusModal(true);     // Show the modal
    //     }
    //   } catch (error) {
    //     console.error("Failed to fetch product status list", error);
    //   }
    // };


    return (
      <td>

        <div className="d-flex gap-2">
          {/* <Tooltip title="Dispatch to Stock">
            <button
              onClick={() => handleOpenFinalDispatchModal(dataItem, "stock")}
              className="me-1 icon-btn"

            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={18}
                height={18}
                fill="currentColor"
              >
                <path d="m1,2.5C1,1.119,2.119,0,3.5,0s2.5,1.119,2.5,2.5-1.119,2.5-2.5,2.5S1,3.881,1,2.5Zm.5,16c-.829,0-1.5.672-1.5,1.5v2.5c0,.828.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-2.5c0-.828-.671-1.5-1.5-1.5Zm22.461-.457c-.187-.808-.992-1.311-1.8-1.122l-6.813,1.579-2.86-12.339c-.187-.808-.993-1.311-1.8-1.122-.807.187-1.31.993-1.123,1.8l.733,3.161h-1.966l-1.325-2.121c-.736-1.177-2.004-1.879-3.392-1.879h-.614c-1.654,0-3,1.346-3,3v4.085c0,1.396.744,2.71,1.942,3.43l3.058,1.835v4.15c0,.828.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-4.434c0-.873-.465-1.695-1.213-2.144l-1.787-1.072v-4.52l.935,1.497c.461.734,1.253,1.173,2.119,1.173h2.939l1.446,6.236c-.85.399-1.439,1.262-1.439,2.264,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.024-.001-.048-.002-.072l6.841-1.586c.807-.187,1.31-.992,1.123-1.8Zm-7.531-3.408c.201.859,1.062,1.391,1.92,1.187l2.907-.691c.854-.203,1.383-1.059,1.183-1.914l-.7-2.986c-.201-.859-1.062-1.391-1.92-1.187l-2.907.691c-.854.203-1.383,1.059-1.183,1.914l.7,2.986Z" />
              </svg>
            </button>
          </Tooltip> */}

          {/* <Tooltip title="Dispatch to Customer">
            <button
              onClick={() => handleOpenFinalDispatchModal(dataItem)}
              className="me-1 icon-btn"

            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={18}
                height={18}
                fill="currentColor"
              >
                <path d="m8,0H2C.895,0,0,.895,0,2v8h10V2c0-1.105-.895-2-2-2Zm-1.5,5h-3v-2h3v2Zm-3.442,16c-.034.162-.058.328-.058.5,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.172-.024-.338-.058-.5H3.058ZM12,2v10H0v7h15V5c0-1.654-1.346-3-3-3Zm5.058,19c-.034.162-.058.328-.058.5,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.172-.024-.338-.058-.5h-4.885Zm-.058-2h7v-5h-7v5Zm2-13h-2v6h7v-1c0-2.757-2.243-5-5-5Z" />
              </svg>
            </button>
          </Tooltip>
          {dataItem.has_mixed_status && (
            <Tooltip title="Multiple product statuses">
              <button className="me-1 icon-btn" onClick={() => handleOpenStatusModal(dataItem.reference)}>
                <i
                  className="fas fa-exclamation-circle text-danger blink-icon"
                  title=""
                ></i>
              </button>
            </Tooltip>
          )} */}
          <Tooltip title="Show sale order details">
            <button
              className="me-1 icon-btn"
              onClick={() => {
                setShowPrice(true);
                PriceCompare(dataItem.id);
              }}
            >
               <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={18}
                height={18}
                fill="currentColor"
              >
                <path d="m8,0H2C.895,0,0,.895,0,2v8h10V2c0-1.105-.895-2-2-2Zm-1.5,5h-3v-2h3v2Zm-3.442,16c-.034.162-.058.328-.058.5,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.172-.024-.338-.058-.5H3.058ZM12,2v10H0v7h15V5c0-1.654-1.346-3-3-3Zm5.058,19c-.034.162-.058.328-.058.5,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.172-.024-.338-.058-.5h-4.885Zm-.058-2h7v-5h-7v5Zm2-13h-2v6h7v-1c0-2.757-2.243-5-5-5Z" />
              </svg>
            </button>
          </Tooltip>

        </div>
      </td>
    );
  };


  // const handleConfirmDispatch = async (item, type) => {
  //   try {
  //     console.log(type);

  //     if (type !== 'customer') {
  //       setIsLoading(true);
  //       const res = await PrivateAxios.post("sales/production/dispatch", {
  //         id: item.id,
  //         dispatch_type: type,
  //         production_id: item.production_number,
  //       });

  //       SuccessMessage(`Product dispatched to ${type}`);
  //       handleCloseConfirmModal();
  //       setIsLoading(false);
  //       fetchWorkOrders(); // Refresh the data
  //     } else {
  //       handleCloseConfirmModal();
  //       setLgShow(true)

  //     }
  //   } catch (error) {
  //     ErrorMessage("Dispatch failed. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Fetch product details for the modal
  const PriceCompare = async (id) => {
    try {
      const response = await PrivateAxios.get(
        `/sales/sales/${id}?type=dispatch`
      );
      if (response.status === 200) {
        const quotationData = response.data.data;
        // Ensure ProductCompare is always an array
        const dataArray = Array.isArray(quotationData) ? quotationData : [quotationData];
        setProductCompare(dataArray);
        setShowFinalSaleOrderDispatchModal(true);
      }
    } catch (error) {
      console.error("Error fetching product comparison data:", error);
    }
  };

  // Get status label
  // const getStatusLabel = (status) => {
  //   const statusLabel = {
  //     9: "Pending",
  //     10: "Dispatched",
  //     11: "Production",
  //   };
  //   return statusLabel[status] || "Pending";
  // };

  // Handler to update warehouse when store is changed
  // const handleStoreChange = (purchaseId, productId, selectedStore) => {
  //   setProductCompare((prev) =>
  //     prev.map((purchase) => {
  //       if (purchase.id !== purchaseId) return purchase;

  //       return {
  //         ...purchase,
  //         warehouse: selectedStore ? selectedStore.warehouse : purchase.warehouse,
  //       };
  //     })
  //   );
  // };

  // // Handler for product-wise status change
  // const handleStatusChangeproductwise = async (salesid, sid, spid) => {
  //   const response = await PrivateAxios.put(`/sales/dispatch-product/${salesid}/${sid}/${spid}`);
  //   if (response.status === 200) {
  //     SuccessMessage("Product is dispatched Successfully.!");

  //     const responseData = response.data.data;
  //     if (responseData.allDispatched) {
  //       // close the modal & hide the current product row
  //       setShowPrice(false);
  //       setProductCompare((prev) =>
  //         prev.filter((purchase) => purchase.id !== salesid)
  //       );
  //       fetchWorkOrders();
  //     } else {
  //       // Update local ProductCompare state
  //       setProductCompare((prev) =>
  //         prev.map((purchase) => {
  //           if (purchase.id !== salesid) return purchase;

  //           return {
  //             ...purchase,
  //             products: purchase.products.map((product) =>
  //               product.id === spid ? { ...product, status: sid } : product
  //             ),
  //           };
  //         })
  //       );
  //     }
  //   }
  // };

  const CustomCell = (props) => {
    const { dataItem, field } = props;

    // Access the field value directly
    // const value = dataItem[field];

    return (
      <td>
        {dataItem.status === 9 ? (
          <label className="badge badge-outline-yellowGreen mb-0">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Partially Dispatched by Floor Manager
          </label>
        ) : (
          <label className="badge badge-outline-success mb-0">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Fully Dispatched by Floor Manager
          </label>
        )}
      </td>
    );
  };
  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <span className="text-primary">{dataItem.reference}</span>
      </td>
    );
  };

  return (
    <React.Fragment>
      {isLoading && <Loader />}

      <SalesQuotationPageTopBar />
      {/* <PoUpdateStatusBar /> */}

      <div className="bg-white border-bottom">
        <div className="d-flex gap-3 px-4 justify-content-between align-items-center py-3">
          <div className="d-flex gap-3 align-items-center">
            <div style={{ minWidth: "200px" }}>
              <label className="form-label mb-1 f-s-14 fw-medium">Filter by Reference Number</label>
              <input
                type="text"
                name="reference_number"
                className="form-control"
                placeholder="Reference number"
                value={referenceNumberFilter}
                onChange={(e) => setReferenceNumberFilter(e.target.value)}
                style={{ height: "38px" }}
              />
            </div>
            <div style={{ minWidth: "200px" }}>
              <label className="form-label mb-1 f-s-14 fw-medium">Filter by Delivery Date</label>
              <style>
                {`
                  .delivery-date-picker-wrapper .react-datepicker-wrapper,
                  .delivery-date-picker-wrapper .react-datepicker__input-container {
                    width: 100%;
                    height: 38px;
                  }
                  .delivery-date-picker-wrapper .react-datepicker__input-container input {
                    height: 38px !important;
                  }
                `}
              </style>
              <div className="delivery-date-picker-wrapper">
                <DatePicker
                  selected={dateRangeFilter[0]}
                  onChange={(update) => {
                    setDateRangeFilter(update);
                  }}
                  startDate={dateRangeFilter[0]}
                  endDate={dateRangeFilter[1]}
                  selectsRange
                  isClearable
                  placeholderText="Select date range"
                  className="form-control"
                  dateFormat="dd-MM-yyyy"
                  name="expected_delivery_date"
                />
              </div>
            </div>
            <div className="d-flex gap-2 align-items-end">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleFilter}
                style={{ height: "38px", marginTop: "20px" }}
              >
                <i className="fas fa-filter me-2"></i>
                Filter
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleReset}
                style={{ height: "38px" }}
              >
                <i className="fas fa-redo me-2"></i>
                Reset
              </button>
            </div>
          </div>

          <div className="d-flex ms-auto gap-3">
            <div className="line"></div>
            <div className="d-flex justify-content-center align-items-center gap-2">
            {/* {MatchPermission(["Quotation Create Sales"]) ? */}
              <Link to="/sales/new" className="btn btn-exp-primary btn-sm">
                <i className="fas fa-plus"></i>
                <span className="ms-2">Create Sale Order</span>
              </Link>
              {/* :""} */}
            </div>
          </div>

        </div>
      </div>

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                {/* <div className="table-button-group mb-2 ms-auto">

                  <GridToolbar className="border-0 gap-0">
                    <Tooltip title="Export to PDF">
                      <button type='button' className=" table-export-btn" onClick={handleExportPDF}>
                        <i class="far fa-file-pdf d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                    <Tooltip title=" Export to Excel">
                      <button type='button' className=" table-export-btn" onClick={handleExportExcel}>
                        <i class="far fa-file-excel d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                  </GridToolbar>
                </div> */}
              </div>
              <div className="bg_succes_table_head rounded_table">

                    <Grid
                      data={data}
                      skip={pageState.skip}
                      take={pageState.take}
                      total={totalCount}
                      onPageChange={handlePageChange}
                      filterable={false}
                      sortable
                      scrollable="scrollable"
                      reorderable
                      resizable
                      loading={isLoading}
                      pageable={{ buttonCount: 3, pageSizes: true }}
                    >

                      <GridColumn field="slNo" title="sl No." filterable={false} width="100px" locked={true} />

                      <GridColumn
                        field="reference"
                        title="reference"
                        filterable={false}
                        filter="text"
                        width="150px"
                        cell={ReferenceCell}
                      />
                      <GridColumn 
                      field="expectedDeliveryDate" 
                      title="Delivery Date" 
                      filterable={false} 
                      filter="text" 
                      width="200px" 
                      />
                      <GridColumn
                        field="creation"
                        title="Creation"
                        filterable={false}
                        filter="numeric"
                        width="200px"
                      />
                      <GridColumn
                        field="customer"
                        title="Customer"
                        filterable={false}
                        filter="text"
                        width="200px"
                      />
                      {/* <GridColumn 
                      field="storeName" 
                      title="Store" 
                      filterable={false} 
                      filter="text" 
                      width="150px" 
                      /> */}
                      <GridColumn 
                      field="salesPerson" 
                      title="Sales Person" 
                      filter="text" 
                      filterable={false} 
                      width="200" 
                      />
                      <GridColumn 
                      field="paymentTerms" 
                      title="Payment Terms (Days)" 
                      filterable={false} 
                      filter="text" 
                      width="200px" 
                      />
                      <GridColumn
                        field="total"
                        title="total"
                        filter="text"
                        filterable={false}
                        width="150px"
                      />
                      <GridColumn
                        field="status_return"
                        title="Status"
                        filter="dropdown"
                        width="300px"
                        filterable={false}
                        cells={{
                          data: CustomCell,
                        }}
                      />
                      <GridColumn
                        title="action"
                        filter="text"
                        cell={ActionCell}
                        filterable={false}
                        width="250px"
                      />
                    </Grid>




              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Dispatch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {dispatchType === "stock" ? "dispatch" : "create an invoice"} {" "}
          <strong>{selectedDispatchItem?.product_name}</strong> to{" "}
          <strong>{dispatchType === "stock" ? "Stock" : "Customer"}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleConfirmDispatch(selectedDispatchItem, dispatchType)}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Product Status List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered responsive className="primary-table-head">
            <thead>
              <tr>
                <th>Product Name</th>
                 <th>SKU</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {statusModalData.map((item, index) => (
                <tr key={index}>
                  <td>{item.ProductsItem?.product_name || "N/A"}</td>
                  <td>{item.ProductsItem?.product_code || "N/A"}</td>
                  <td>{item.qty}</td>
                  <td>{item.ProductsItem?.Masteruom?.unit_name || "-"}</td>
                  <td>
                    {item.status === 10
                      ? "Dispatch"
                      : item.status === 11
                      ? "Production"
                      : item.status === 12
                      ? "Completed"
                      : "Other"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal> */}

      {/* <CustomerDispatchModal
        show={lgShow}
        onHide={() => setLgShow(false)}
        lgShow={lgShow}
        setLgShow={setLgShow}
        data={data}
        type="customer"
      /> */}

      <FinalSaleOrderDispatchModal
        show={showFinalSaleOrderDispatchModal}
        onHide={() => setShowFinalSaleOrderDispatchModal(false)}
        productCompare={ProductCompare}
        onSubmit={handleSubmitFinalSaleOrderDispatch}
      />

      <Modal
        title="Available Batches"
        open={batchesModalOpen}
        onCancel={closeBatchesModal}
        footer={null}
        width={950}
        zIndex={20000}
        maskStyle={{ zIndex: 19999 }}
        destroyOnClose
      >
        {availableBatchesLoading ? (
          <div className="py-4 d-flex justify-content-center">
            <Loader />
          </div>
        ) : (
          <>
            {receiveError ? (
              <Alert
                type="error"
                showIcon
                message={receiveError}
                className="mb-3"
              />
            ) : null}


            <Typography.Text strong>Available batch details</Typography.Text>
            <div className="mt-2">
              <AntTable
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={availableBatches}
                locale={{ emptyText: "No batches available." }}
                columns={[
                  {
                    title: "Batch No.",
                    dataIndex: "batch_no",
                    key: "batch_no",
                    width: 140,
                  },
                  {
                    title: "Product",
                    dataIndex: ["product", "product_name"],
                    key: "product",
                    width: 200,
                    render: (value, record) =>
                      record.product
                        ? `${record.product.product_name} (${record.product.product_code})`
                        : "—",
                  },
                  {
                    title: "Manufacture Date",
                    dataIndex: "manufacture_date",
                    key: "manufacture_date",
                    width: 160,
                    render: (v) => (v ? moment(v).format("DD/MM/YYYY") : "—"),
                  },
                  {
                    title: "Expiry Date",
                    dataIndex: "expiry_date",
                    key: "expiry_date",
                    width: 140,
                    render: (v) => (v ? moment(v).format("DD/MM/YYYY") : "—"),
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                    width: 100,
                    render: (v) => v ?? 0,
                  },
                ]}
              />
            </div>

            <Divider className="my-3" />

            <div className="d-flex justify-content-between align-items-center">
              <Typography.Text strong>Receive from batches</Typography.Text>
              <Button type="dashed" onClick={addReceiveRow}>
                Add row
              </Button>
            </div>

            <div className="mt-2">
              <AntTable
                size="small"
                rowKey="key"
                pagination={false}
                dataSource={receiveRows}
                columns={[
                  {
                    title: "Batch No.",
                    key: "batchId",
                    width: 260,
                    render: (_, row) => (
                      <AntSelect
                        style={{ width: "100%" }}
                        placeholder="Select batch"
                        value={row.batchId}
                        options={availableBatches.map((b) => ({
                          value: b.id,
                          label: `${b.batch_no} (Avail: ${b.quantity ?? 0})`,
                        }))}
                        showSearch
                        optionFilterProp="label"
                        onChange={(val) => {
                          updateReceiveRow(row.key, { batchId: val, qty: 0 });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Balance Qty",
                    key: "balance",
                    width: 140,
                    render: (_, row) => (
                      <InputNumber
                        style={{ width: "100%" }}
                        value={row.batchId ? balanceAfterRow(row) : 0}
                        disabled
                      />
                    ),
                  },
                  {
                    title: "Enter Qty",
                    key: "qty",
                    width: 140,
                    render: (_, row) => {
                      const max = row.batchId ? remainingBeforeRow(row) : 0;
                      return (
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={max}
                          value={row.qty}
                          onChange={(val) => {
                            const n = Number(val) || 0;
                            const clamped = Math.min(Math.max(n, 0), max);
                            updateReceiveRow(row.key, { qty: clamped });
                          }}
                        />
                      );
                    },
                  },
                  {
                    title: "Action",
                    key: "action",
                    width: 90,
                    render: (_, row) => (
                      <Button danger type="text" onClick={() => removeReceiveRow(row.key)}>
                        Remove
                      </Button>
                    ),
                  },
                ]}
              />
            </div>

            <div className="d-flex justify-content-end mt-3">
              <Space>
                <Button onClick={closeBatchesModal}>Cancel</Button>
                <Button
                  type="primary"
                  loading={receiveSubmitting}
                  onClick={handleReceiveSubmit}
                  disabled={!availableBatches.length}
                >
                  Receive
                </Button>
              </Space>
            </div>
          </>
        )}
      </Modal>

      {/* <SaleOrderDetailsModal
        show={showPrice}
        onHide={() => setShowPrice(false)}
        productCompare={ProductCompare}
        onStoreChange={handleStoreChange}
        onStatusChange={handleStatusChangeproductwise}
        currencySymbol={getGeneralSettingssymbol}
        getStatusLabel={getStatusLabel}
      /> */}

    </React.Fragment >
  );
}

export default MysalesOrderDispatchList;
