import React, { useEffect, useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import {
  Modal,
  Button,
  Alert,
  OverlayTrigger,
  Popover,
  // Tooltip,
} from "react-bootstrap";

import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import Loader from "../../../environment/Loader";

import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";

import moment from "moment";
// import {
//   BrowserRouter as Router,
//   useNavigate,
// } from "react-router-dom";

// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the styles
import "jspdf-autotable";
import { Tooltip, Table } from "antd";
import { exportExcel, exportPDF } from "../../../environment/exportTable";
import SalesManagementPageTopBar from "./SalesManagementPageTopBar";
import ProductDetailsContent from "../../CommonComponent/ProductDetailsContent";
import ProductSelect from "../../filterComponents/ProductSelect";
import ProductVariantSelectionModal from "../../CommonComponent/ProductVariantSelectionModal";
import { calculateTotalWeight } from "../../../utils/weightConverter";



function PendingApprovalSales() {
  const { user, getGeneralSettingssymbol, isVariantBased } = UserAuth();

  const [showPrice, setShowPrice] = useState(false);
  const [ProductCompare, setProductCompare] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  // const [getPid, setPid] = useState(false);
  // const [show, setShow] = useState(false);
  const [getshowRemarks, setShowremark] = useState(false);
  const [getRemarksdata, getremarkdata] = useState('');
  const [getRemarksRef, getremarksRef] = useState('');
  // const [getReff, setReff] = useState('');
  const [editedProducts, setEditedProducts] = useState({}); // Store edited product data { productId: { qty, unit_price } }
  const [remarks, setRemarks] = useState(''); // Remarks textarea value
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentProductRowId, setCurrentProductRowId] = useState(null);
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState(null);
  const [variantModalBackup, setVariantModalBackup] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // Store the action to perform after confirmation
  const [pendingStatus, setPendingStatus] = useState(null); // Store the status for the confirmation message
  // const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);
  const RemarksClose = () => setShowremark(false);
  const RemarksShow = (value) => setShowremark(value);
  const [pageState, setPageState] = useState({ skip: 0, take: 15, searchKey: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);

  const [data, setData] = useState([]);


  const getRemarks = (rmks, refid) => {
    getremarkdata(rmks)
    getremarksRef(refid)
  }

  const PriceCompare = async (ida) => {
    try {
      const response = await PrivateAxios.get(
        `/sales/sales/${ida}`
      ); // Adjust the URL to your API endpoint
      if (response.status === 200) {
        const quotationData = response.data.data;
        if (quotationData) {
          // Ensure ProductCompare is always an array
          const dataArray = Array.isArray(quotationData) ? quotationData : [quotationData];
          setProductCompare(dataArray);
          
          // Initialize edited products state with current values
          const initialEditedProducts = {};
          if (dataArray.length > 0 && dataArray[0].products) {
            dataArray[0].products.forEach((product) => {
              const variantData = product.variantData || product.productVariant || null;
              const qpp = parseFloat(variantData?.quantity_per_pack);
              const qty = parseFloat(product.qty);
              const master_pack =
                Number.isFinite(qpp) && qpp > 0 && Number.isFinite(qty)
                  ? String(Number((qty / qpp).toFixed(2)))
                  : "";
              initialEditedProducts[product.id] = {
                qty: product.qty,
                unit_price: product.unit_price,
                product_id: product.product_id,
                productData: product.productData || product.product || null,
                variant_id:
                  product.variant_id ||
                  product.product_variant_id ||
                  product.productVariant?.id ||
                  null,
                variantData,
                tax: product.tax,
                master_pack,
              };
            });
          }
          setEditedProducts(initialEditedProducts);
          
          // Initialize remarks if available
          if (dataArray.length > 0 && dataArray[0].remarkdata) {
            setRemarks(dataArray[0].remarkdata.remarks || '');
          } else {
            setRemarks('');
          }
        }
        // setPid(ida);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };

  // Calculate totals based on edited products
  const calculateProductTotals = () => {
    if (!ProductCompare || ProductCompare.length === 0) return { grandTotal: 0 };
    
    const salesQuotation = ProductCompare[0];
    let grandTotal = 0;
    
    salesQuotation.products?.forEach((product) => {
      const editedProduct = editedProducts[product.id] || { qty: product.qty, unit_price: product.unit_price, tax: product.tax };
      const qty = parseFloat(editedProduct.qty) || 0;
      const unitPrice = parseFloat(editedProduct.unit_price) || 0;
      const tax = parseFloat(editedProduct.tax ?? product.tax) || 0;
      
      const priceExclTax = qty * unitPrice;
      const lineItemTotal = priceExclTax * (1 + tax / 100);
      grandTotal += lineItemTotal;
    });
    
    return { grandTotal };
  };

  const { grandTotal } = calculateProductTotals();
  const formattedTotalAmount = grandTotal.toFixed(2);

  // Derive master_pack string from qty + variant's quantity_per_pack. Shared
  // with handleProductFieldChange (qty edits) and updateEditedProductWithSelection
  // (variant/product changes) so the Master Pack input stays in sync.
  const computeMasterPackString = (qty, variantData) => {
    const qpp = parseFloat(variantData?.quantity_per_pack);
    const q = parseFloat(qty);
    if (!Number.isFinite(qpp) || qpp <= 0 || !Number.isFinite(q)) return "";
    return String(Number((q / qpp).toFixed(2)));
  };

  // Handle product field changes
  const handleProductFieldChange = (productId, field, value) => {
    setEditedProducts((prev) => {
      const current = prev[productId] || {};
      const next = { ...current, [field]: value };
      if (field === "qty") {
        // Fall back to the server-loaded productVariant so a previously-saved
        // variant still drives Master Pack even if editedProducts hasn't been
        // hydrated with it (e.g. fresh-open before other effects settle).
        const baseProduct = ProductCompare?.[0]?.products?.find(
          (p) => p.id === productId
        );
        const variantData =
          current.variantData ||
          baseProduct?.variantData ||
          baseProduct?.productVariant ||
          null;
        next.master_pack = computeMasterPackString(value, variantData);
      }
      return { ...prev, [productId]: next };
    });
  };

  // Master Pack drives qty: qty = master_pack × quantity_per_pack.
  // Total Weight is already derived from qty × weight_per_unit, so it updates
  // automatically as qty changes here.
  const handleMasterPackChange = (productId, rawValue) => {
    const numericValue = String(rawValue).replace(/[^0-9.]/g, "");
    setEditedProducts((prev) => {
      const current = prev[productId] || {};
      const variantData = current.variantData || null;
      const qpp = parseFloat(variantData?.quantity_per_pack);
      const mp = parseFloat(numericValue);
      const next = { ...current, master_pack: numericValue };
      if (Number.isFinite(mp) && Number.isFinite(qpp) && qpp > 0) {
        next.qty = Number((mp * qpp).toFixed(2));
      }
      return { ...prev, [productId]: next };
    });
  };

  // Get calculated values for a product
  const getProductCalculations = (product) => {
    const editedProduct = editedProducts[product.id] || { qty: product.qty, unit_price: product.unit_price, tax: product.tax };
    const qty = parseFloat(editedProduct.qty) || 0;
    const unitPrice = parseFloat(editedProduct.unit_price) || 0;
    const tax = parseFloat(editedProduct.tax ?? product.tax) || 0;
    
    const priceExclTax = qty * unitPrice;
    const lineItemTotal = priceExclTax * (1 + tax / 100);
    
    return {
      priceExclTax: priceExclTax.toFixed(2),
      lineItemTotal: lineItemTotal.toFixed(2),
    };
  };

  const getProductRowData = (product) => {
    const editedProduct = editedProducts[product.id] || {};
    return {
      productData: editedProduct.productData || product.productData || product.product || null,
      productId: editedProduct.product_id || product.product_id || null,
      variantData: editedProduct.variantData || product.variantData || product.productVariant || null,
      variantId:
        editedProduct.variant_id ||
        editedProduct.variantData?.id ||
        product.variant_id ||
        product.product_variant_id ||
        product.productVariant?.id ||
        null,
      qty: editedProduct.qty ?? product.qty,
      unitPrice: editedProduct.unit_price ?? product.unit_price,
      tax: editedProduct.tax ?? product.tax,
    };
  };

  const updateEditedProductWithSelection = (
    product,
    selectedProductData,
    variantId = null,
    selectedVariantData = null
  ) => {
    setEditedProducts((prev) => {
      const existing = prev[product.id] || {};
      const nextQty = existing.qty ?? product.qty;
      return {
        ...prev,
        [product.id]: {
          ...existing,
          qty: nextQty,
          unit_price:
            selectedProductData?.regular_selling_price ??
            existing.unit_price ??
            product.unit_price,
          tax: selectedProductData?.tax ?? existing.tax ?? product.tax,
          product_id: selectedProductData?.id ?? product.product_id,
          productData: selectedProductData || product.productData || product.product || null,
          variant_id: variantId,
          variantData: selectedVariantData,
          master_pack: computeMasterPackString(nextQty, selectedVariantData),
        },
      };
    });
  };

  const openVariantSelector = (product, selectedProductData, resetVariant = false) => {
    const existingEdited = editedProducts[product.id] || {};
    const existingVariantId =
      existingEdited.variant_id ||
      existingEdited.variantData?.id ||
      product.variant_id ||
      product.product_variant_id ||
      product.productVariant?.id ||
      null;
    const existingVariantData =
      existingEdited.variantData || product.variantData || product.productVariant || null;

    setVariantModalBackup({
      rowId: product.id,
      data: {
        qty: existingEdited.qty ?? product.qty,
        unit_price: existingEdited.unit_price ?? product.unit_price,
        tax: existingEdited.tax ?? product.tax,
        product_id: existingEdited.product_id ?? product.product_id,
        productData: existingEdited.productData || product.productData || product.product || null,
        variant_id: existingVariantId,
        variantData: existingVariantData,
      },
    });

    updateEditedProductWithSelection(
      product,
      selectedProductData,
      resetVariant ? null : existingVariantId,
      resetVariant ? null : existingVariantData
    );
    setCurrentProductRowId(product.id);
    setCurrentSelectedProductId(selectedProductData?.id || product.product_id);

    // Show variant modal only if the company is set with variant based
    if (isVariantBased) {
      setShowVariantModal(true);
    }
  };

  const handleVariantSelect = (variant, productRowId) => {
    const baseProduct = ProductCompare?.[0]?.products?.find((p) => p.id === productRowId);
    if (baseProduct) {
      const currentEdited = editedProducts[productRowId] || {};
      const selectedProductData =
        currentEdited.productData || baseProduct.productData || baseProduct.product || null;
      updateEditedProductWithSelection(
        baseProduct,
        selectedProductData,
        variant?.id || null,
        variant || null
      );
    }
    setVariantModalBackup(null);
    closeVariantModal();
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
    setCurrentProductRowId(null);
    setCurrentSelectedProductId(null);
  };

  const handleVariantModalClose = (productRowId) => {
    if (
      variantModalBackup &&
      variantModalBackup.rowId === productRowId &&
      variantModalBackup.data
    ) {
      setEditedProducts((prev) => ({
        ...prev,
        [productRowId]: variantModalBackup.data,
      }));
    }
    setVariantModalBackup(null);
    closeVariantModal();
  };

  const handleContinueWithoutVariant = () => {
    setVariantModalBackup(null);
    closeVariantModal();
  };

  // Handle approve by management
  const handleApproveByManagement = async () => {
    if (!ProductCompare || ProductCompare.length === 0) return;
    
    const salesQuotation = ProductCompare[0];
    const productsToUpdate = salesQuotation.products?.map((product) => {
      const editedProduct = editedProducts[product.id] || { qty: product.qty, unit_price: product.unit_price, tax: product.tax };
      return {
        id: product.id,
        product_id: editedProduct.product_id || product.product_id,
        product_variant_id: editedProduct.variant_id || null,
        qty: parseFloat(editedProduct.qty),
        unit_price: parseFloat(editedProduct.unit_price),
        tax: parseFloat(editedProduct.tax ?? product.tax),
      };
    });

    const dataToSend = {
      products: productsToUpdate,
      remarks: remarks,
    };

    try {
      const response = await PrivateAxios.put(
        `/sales/approved-by-management/${salesQuotation.id}`,
        dataToSend
      );
      
      if (response.status === 200) {
        SuccessMessage("Sales order has been approved successfully");
        setShowPrice(false);
        TaskData();
        // Reset edited products
        setEditedProducts({});
        setRemarks('');
      }
    } catch (error) {
      ErrorMessage("Error approving sales order. Please try again.");
      console.error("Error approving sales order:", error);
    }
  };

  // Handle reject changes - show confirmation modal first
  const handleRejectChanges = (status) => {
    setPendingStatus(status);
    setConfirmAction(() => () => performRejectAction(status));
    setShowConfirmModal(true);
  };

  // Perform the actual reject action after confirmation
  const performRejectAction = async (status) => {
    if (!ProductCompare || ProductCompare.length === 0) return;
    
    const salesQuotation = ProductCompare[0];
    
    // Prepare data to send
    const dataToSend = {
      remarks: remarks,
      status: status,
    };
    
    try {
      const response = await PrivateAxios.put(
        `/sales/rejected-by-management/${salesQuotation.id}`,
        dataToSend
      );
      
      if (response.status === 200) {
        const message = status === 8 
          ? "Sales quotation rejected successfully" 
          : "Sales quotation sent back to review successfully";
        SuccessMessage(message);
        setShowPrice(false);
        TaskData();
        // Reset edited products
        setEditedProducts({});
        setRemarks('');
      }
    } catch (error) {
      ErrorMessage("Error processing request. Please try again.");
      console.error("Error processing request:", error);
    }
  };

  // Handle confirmation modal confirm
  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setPendingStatus(null);
  };

  // Handle confirmation modal cancel
  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setPendingStatus(null);
  };

  const getStatusLabelText = (status) => {
    switch (status) {
      case 1:
        return "Active";
      case 2:
        return "Quotation Created";
      case 3:
        return "Pending Approval";
      case 4:
        return "Sent to sales order";
      case 5:
        return "Order Confirmed";
      case 6:
        return "Fully Billed";
      case 7:
        return "Done";
      case 8:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const TaskData = async (customPageState = null) => {
    setIsLoading(true);
    const currentPageState = customPageState || pageState;
    
    const urlParams = new URLSearchParams({
      page: currentPageState.skip / currentPageState.take + 1,
      limit: currentPageState.take,
      status: 3,
      ...(currentPageState.searchKey && { search: currentPageState.searchKey }),
      ...(referenceNumberFilter && { reference_number: referenceNumberFilter }),
      ...(dateRangeFilter[0] && { expected_delivery_date_start: moment(dateRangeFilter[0]).format("YYYY-MM-DD") }),
      ...(dateRangeFilter[1] && { expected_delivery_date_end: moment(dateRangeFilter[1]).format("YYYY-MM-DD") })
    });
    
    // reset the data
    setData([]);
    
    PrivateAxios.get(`sales/all-sale-quotation?${urlParams.toString()}`)
      .then((res) => {
        const salesquotations = res.data.data || {};
        const rows = salesquotations.rows || [];
        setTotalCount(salesquotations.pagination?.total_records || rows.length);
        const currentPage = salesquotations.pagination?.current_page || 1;
        const perPage = salesquotations.pagination?.per_page || currentPageState.take;
        const startingIndex = (currentPage - 1) * perPage;

        const transformedData = rows.map((item, index) => ({
          id: item.id,
          slNo: startingIndex + index + 1,
          reference: item.reference_number,
          creationDate: moment(item.created_at).format("DD/MM/YYYY"),
          deliveryDate: moment(item.expected_delivery_date).format("DD/MM/YYYY"),
          customer: item.customer && item.customer?.name,
          salesPerson: item.createdBy?.name,
          storeName: item.warehouse?.name,
          total: `${getGeneralSettingssymbol}${item.total_amount}`,
          status: item.status,
          is_parent: item.is_parent,
          statusLabel: getStatusLabelText(item.status),
        }));
        setData(transformedData);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("Error", err);
      });
  };
  useEffect(() => {
    TaskData();
  }, []);

  // Handle filter button click
  const handleFilter = () => {
    const newPageState = { ...pageState, skip: 0 };
    setPageState(newPageState);
    TaskData(newPageState);
  };

  // Handle reset button click – use the same option object from statusOptions so react-select displays "All"
  const handleReset = () => {
    const newPageState = { skip: 0, take: 15, searchKey: "" };
    setPageState(newPageState);
    setReferenceNumberFilter("");
    setDateRangeFilter([null, null]);
    TaskData(newPageState);
  };

  const handlePageChange = (page, pageSize) => {
    const newPageState = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    TaskData(newPageState);
  };

  const renderReference = (_, record) => (
    <span className="k_table_link">
      <a
        role="button"
        tabIndex={0}
        className="k_table_link"
        onClick={() => {
          setShowPrice(true);
          PriceCompare(record.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowPrice(true);
            PriceCompare(record.id);
          }
        }}
      >
        {record.reference}
      </a>
    </span>
  );

  const exportColumns = [
    { name: "Sl No.", selector: (item) => item.slNo },
    { name: "Reference", selector: (item) => item.reference },
    { name: "Delivery Date", selector: (item) => item.deliveryDate },
    { name: "Creation Date", selector: (item) => item.creationDate },
    { name: "Customer", selector: (item) => item.customer },
    { name: "Store", selector: (item) => item.storeName },
    { name: "Sales Person", selector: (item) => item.salesPerson },
    { name: "Total", selector: (item) => item.total },
    { name: "Status", selector: (item) => item.statusLabel },
  ];

  const handleExportPDF = () => {
    exportPDF(exportColumns, data, "Pending Approval Sales");
  };

  const handleExportExcel = () => {
    exportExcel(exportColumns, data, "pending-approval-sales");
  };

  const renderAction = (_, record) => (
    <div className="d-flex gap-2">
      <Tooltip title="Approve or Reject">
        <span
          className="me-1 icon-btn"
          style={{ cursor: "pointer" }}
          role="button"
          tabIndex={0}
          onClick={() => {
            setShowPrice(true);
            PriceCompare(record.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowPrice(true);
              PriceCompare(record.id);
            }
          }}
        >
          <i className="fas fa-edit d-flex"></i>
        </span>
      </Tooltip>

      {record.is_parent == 1 && record.status == 4 && (
        <Tooltip title="Confirm Order">
          <Link
            to={{ pathname: `/purchase/${record.id}` }}
            state={{ data: record }}
            className="me-1 icon-btn"
          >
            <i className="glyphicon glyphicon-checkbi fas fa-external-link-alt"></i>
          </Link>
        </Tooltip>
      )}
    </div>
  );

  const renderStatusColumn = () => (
    <label className="badge badge-outline-yellowGreen mb-0">
      <i className="fas fa-circle f-s-8 d-flex me-1"></i>Pending Approval
    </label>
  );

  const tableColumns = [
    { title: "Sl No.", dataIndex: "slNo", key: "slNo", width: 90 },
    { title: "Reference No.", dataIndex: "reference", key: "reference", width: 150, render: renderReference },
    { title: "Delivery Date", dataIndex: "deliveryDate", key: "deliveryDate", width: 130 },
    { title: "Creation Date", dataIndex: "creationDate", key: "creationDate", width: 130 },
    { title: "Customer", dataIndex: "customer", key: "customer", width: 160 },
    { title: "Store", dataIndex: "storeName", key: "storeName", width: 150 },
    { title: "Sales Person", dataIndex: "salesPerson", key: "salesPerson", width: 180 },
    { title: "Total", dataIndex: "total", key: "total", width: 130 },
    { title: "Status", key: "status", width: 200, render: renderStatusColumn },
    { title: "Action", key: "action", width: 160, render: renderAction },
  ];



  return (
    <React.Fragment>
      {isLoading && <Loader />}

      <SalesManagementPageTopBar />
      {/* <SalesManagementStatusBar /> */}

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
        </div>
      </div>

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                <div className="table-button-group mb-2 ms-auto d-flex gap-1">
                  <Tooltip title="Export to PDF">
                    <button type="button" className="table-export-btn" onClick={handleExportPDF}>
                      <i className="far fa-file-pdf d-flex f-s-20"></i>
                    </button>
                  </Tooltip>
                  <Tooltip title="Export to Excel">
                    <button type="button" className="table-export-btn" onClick={handleExportExcel}>
                      <i className="far fa-file-excel d-flex f-s-20"></i>
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <Table
                  rowKey="id"
                  dataSource={data}
                  columns={tableColumns}
                  loading={isLoading}
                  pagination={{
                    current: pageState.skip / pageState.take + 1,
                    pageSize: pageState.take,
                    total: totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "15", "25", "50"],
                    onChange: handlePageChange,
                    onShowSizeChange: handlePageChange,
                  }}
                  scroll={{ x: 1400 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      <Modal
        backdrop="static"
        centered
        size="xl"
        show={showPrice}
        onHide={() => {
          setShowPrice(false);
          setEditedProducts({});
          setRemarks('');
        }}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header>
          <Modal.Title id="example-custom-modal-styling-title">
            Sales Order Details
          </Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setShowPrice(false);
              setEditedProducts({});
              setRemarks('');
            }}
            aria-label="Close"
          ></button>
        </Modal.Header>
        <Modal.Body className="pb-0">
          {ProductCompare && ProductCompare.length > 0 && (
            <>
              {/* Fixed Sales Quotation Details Table */}
              <div className="mb-4">
                <h6 className="mb-3">Basic Details</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="20%">Customer Name</th>
                        <th width="20%">Reference No.</th>
                        <th width="20%">Store Name</th>
                        <th width="20%">Payment Terms (days)</th>
                        <th width="20%">Expected Delivery Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ProductCompare.map((productPriceCompare) => (
                        <tr
                          key={productPriceCompare.id}
                          className={
                            productPriceCompare.status === 4 ? "confirmorder-tr" :
                              productPriceCompare.status === 8 ? "rejected-tr" : ""
                          }
                        >
                          <td>{productPriceCompare.customer?.name || 'N/A'}</td>
                          <td className="k_table_link">
                            {productPriceCompare.reference_number}
                            {productPriceCompare.remarkdata && productPriceCompare.remarkdata.remarks != '' ? (
                              <i
                                style={{ cursor: 'pointer', marginLeft: '8px' }}
                                className="bi bi-eye-fill"
                                onClick={() => {
                                  RemarksShow(true);
                                  getRemarks(
                                    productPriceCompare.remarkdata.remarks,
                                    productPriceCompare.customer?.name + ' - ' + productPriceCompare.reference_number
                                  );
                                }}
                              ></i>
                            ) : ''}
                          </td>
                          <td>{productPriceCompare.warehouse?.name || 'N/A'}</td>
                          <td>{productPriceCompare.payment_terms || 'N/A'}</td>
                          <td>
                            {moment(productPriceCompare.expected_delivery_date).format("DD/MM/YYYY")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Editable Product Details Table */}
              <div className="mb-4">
                <h6 className="mb-3">Product Details</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Product Code</th>
                        <th>Quantity</th>
                        {isVariantBased && (
                          <>
                            <th>Weight Per Unit</th>
                            <th>Total Weight</th>
                          </>
                        )}
                        {ProductCompare[0].products?.some((p) => {
                          const ep = editedProducts[p.id];
                          const pd = ep?.productData || p?.productData || p?.product;
                          return Number(pd?.has_master_pack) === 1;
                        }) && <th>Master Pack</th>}
                        <th>Unit of Measure</th>
                        <th>Unit Price</th>
                        <th>Tax (%)</th>
                        <th>Price (Excl tax)</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ProductCompare[0].products?.map((product) => {
                        const editedProduct = editedProducts[product.id] || { qty: product.qty, unit_price: product.unit_price };
                        const row = getProductRowData(product);
                        const calculations = getProductCalculations(product);
                        
                        return (
                          <tr key={product.id}>
                            <td>
                              <div style={{ minWidth: "250px" }} className="d-flex align-items-start gap-2">
                                <div style={{ flex: 1 }}>
                                  <ProductSelect
                                    value={row.productId}
                                    selectedProductData={row.productData}
                                    onChange={(selectedOption) => {
                                      if (selectedOption?.productData) {
                                        openVariantSelector(product, selectedOption.productData, true);
                                      }
                                    }}
                                    styles={{
                                      control: (base) => ({
                                        ...base,
                                        minHeight: "34px",
                                        fontSize: "14px",
                                      }),
                                    }}
                                  />
                                  {row.variantData && (
                                    <div className="mt-1">
                                      <small className="text-muted">
                                        <i className="fas fa-tag me-1"></i>
                                        Variant: {row.variantData.masterUOM?.name || "N/A"}
                                        {row.variantData.masterUOM?.label && (
                                          <span className="ms-1">({row.variantData.masterUOM.label})</span>
                                        )}
                                        {row.variantData.weight_per_unit && (
                                          <span className="ms-2">• Weight: {row.variantData.weight_per_unit}</span>
                                        )}
                                      </small>
                                    </div>
                                  )}
                                </div>
                                {row.productId && row.productData && (
                                  <OverlayTrigger
                                    trigger="click"
                                    placement="right"
                                    rootClose
                                    container={typeof document !== "undefined" ? document.body : undefined}
                                    popperConfig={{
                                      modifiers: [
                                        {
                                          name: "flip",
                                          options: {
                                            fallbackPlacements: ["left", "right"],
                                          },
                                        },
                                        {
                                          name: "preventOverflow",
                                          options: {
                                            boundary: "viewport",
                                          },
                                        },
                                        {
                                          name: "offset",
                                          options: {
                                            offset: [0, 8],
                                          },
                                        },
                                      ],
                                    }}
                                    overlay={
                                      <Popover id={`product-details-${product.id}`} style={{ maxWidth: "450px", zIndex: 1060 }}>
                                        <Popover.Header as="h6" className="d-flex align-items-center">
                                          <i className="fas fa-info-circle text-primary me-2"></i>
                                          Product Details
                                        </Popover.Header>
                                        <Popover.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
                                          <ProductDetailsContent
                                            productData={row.productData}
                                          />
                                        </Popover.Body>
                                      </Popover>
                                    }
                                  >
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      className="text-primary"
                                      style={{ cursor: "pointer", flexShrink: 0, marginTop: "8px" }}
                                      title="View product details"
                                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
                                    >
                                      <i className="fas fa-info-circle fa-lg"></i>
                                    </span>
                                  </OverlayTrigger>
                                )}
                              </div>
                              
                            </td>
                            <td>{row.productData?.product_code || 'N/A'}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={editedProduct.qty}
                                onChange={(e) => handleProductFieldChange(product.id, 'qty', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </td>
                            {isVariantBased && (
                              <>
                                <td>
                                  <div className="d-flex align-items-center gap-2" style={{ minWidth: "100px" }}>
                                    <span>
                                      {row.variantData
                                        ? `${row.variantData.weight_per_unit || "N/A"} ${row.variantData.masterUOM?.label || row.variantData.master_uom?.label || ""}`.trim()
                                        : "N/A"}
                                    </span>
                                    {row.productId && (
                                      <button
                                        type="button"
                                        className="btn btn-link p-0"
                                        onClick={() => openVariantSelector(product, row.productData, false)}
                                        title="Change variant"
                                      >
                                        <i className="fas fa-edit text-primary"></i>
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  {row.variantData
                                    ? calculateTotalWeight(
                                        editedProduct.qty,
                                        row.variantData?.weight_per_unit,
                                        row.variantData?.masterUOM?.label ||
                                          row.variantData?.master_uom?.label
                                      ).display
                                    : "N/A"}
                                </td>
                              </>
                            )}
                            {ProductCompare[0].products?.some((p) => {
                              const ep = editedProducts[p.id];
                              const pd = ep?.productData || p?.productData || p?.product;
                              return Number(pd?.has_master_pack) === 1;
                            }) && (
                              <td>
                                <div style={{ minWidth: "140px" }} className="d-flex">
                                  {Number(row.productData?.has_master_pack) === 1 &&
                                  Number(row.variantData?.quantity_per_pack) > 0 ? (
                                    <div className="input-group">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        min="0"
                                        step="0.001"
                                        placeholder="0"
                                        style={{ marginRight: "10px", marginTop: "4px" }}
                                        value={editedProduct.master_pack}
                                        onChange={(e) =>
                                          handleMasterPackChange(product.id, e.target.value)
                                        }
                                      />
                                      <span className="input-group-text">unit</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted">—</span>
                                  )}
                                </div>
                              </td>
                            )}
                            <td>
                              <label>
                                {row.variantData?.masterUOM?.label ||
                                row.variantData?.master_uom?.label ||
                                row.variantData?.masterUOM?.name ||
                                row.variantData?.master_uom?.name ||
                                row.productData?.masterUOM?.label ||
                                row.productData?.masterUOM?.name ||
                                'N/A'}
                              </label>

                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={editedProduct.unit_price}
                                onChange={(e) => handleProductFieldChange(product.id, 'unit_price', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td>{row.tax}%</td>
                            <td>
                              {getGeneralSettingssymbol} {calculations.priceExclTax}
                            </td>
                            <td style={{ minWidth: "120px" }}>
                              {getGeneralSettingssymbol} {calculations.lineItemTotal}
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td
                          colSpan={
                            10 +
                            (ProductCompare[0].products?.some((p) => {
                              const ep = editedProducts[p.id];
                              const pd = ep?.productData || p?.productData || p?.product;
                              return Number(pd?.has_master_pack) === 1;
                            })
                              ? 1
                              : 0)
                          }
                          align="right"
                        >
                          <h6 className="mb-0 text-muted">
                            Grand Total: <span className="text-dark f-s-20">{getGeneralSettingssymbol} {formattedTotalAmount}</span>
                          </h6>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div className="mb-3">
                <label htmlFor="remarks" className="form-label">
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  className="form-control"
                  rows="4"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks here..."
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setShowPrice(false);
              setEditedProducts({});
              setRemarks('');
              setShowVariantModal(false);
              setCurrentProductRowId(null);
              setCurrentSelectedProductId(null);
              setVariantModalBackup(null);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleRejectChanges(5)}
          >
            Send back to review
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleRejectChanges(8)}
          >
            Reject
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleApproveByManagement}
          >
            Approve
          </button>
        </Modal.Footer>
      </Modal>

      <ProductVariantSelectionModal
        show={showVariantModal}
        onHide={closeVariantModal}
        productId={currentSelectedProductId}
        productIndex={currentProductRowId}
        currentVariantId={
          currentProductRowId != null
            ? (
                editedProducts[currentProductRowId]?.variant_id ||
                editedProducts[currentProductRowId]?.variantData?.id ||
                ProductCompare?.[0]?.products?.find((p) => p.id === currentProductRowId)?.variant_id ||
                ProductCompare?.[0]?.products?.find((p) => p.id === currentProductRowId)?.product_variant_id ||
                ProductCompare?.[0]?.products?.find((p) => p.id === currentProductRowId)?.productVariant?.id ||
                null
              )
            : null
        }
        onVariantSelect={handleVariantSelect}
        onClose={handleVariantModalClose}
        currencySymbol={getGeneralSettingssymbol}
        allowContinueWithoutVariant={true}
        onContinueWithoutVariant={handleContinueWithoutVariant}
      />

      {/* <Modal show={show} onHide={handleClose} closeButton backdrop="static"
        centered
        size="lg">
        <Modal.Header closeButton >
          <Modal.Title id="example-modal-sizes-title-lg">
            {getReff}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
          <div>
            <ReactQuill
              value={editorContent}
              onChange={handleEditorChange}
              modules={PendingApprovalSales.modules}
              formats={PendingApprovalSales.formats}
              theme="snow"
            />
          </div>
          <div class=" d-flex justify-content-end pt-4">
            <button class="btn btn-success" type="submit">
              Submit
            </button>
          </div>
        </form>
        </Modal.Body>

      </Modal> */}

      <Modal show={getshowRemarks} onHide={RemarksClose} closeButton backdrop="static"
        centered
        size="lg">
        <Modal.Header closeButton >
          <Modal.Title id="example-modal-sizes-title-lg">
            {getRemarksRef}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body dangerouslySetInnerHTML={{ __html: getRemarksdata !== '' ? getRemarksdata : '' }}
        ></Modal.Body>

      </Modal>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onHide={handleCancelConfirm}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-0">
            {pendingStatus === 8 && (
              <div>
                <strong>Reject Sales Order</strong>
                <p className="mb-0 mt-2">
                  Are you sure you want to reject this sales order? This action cannot be undone.
                </p>
              </div>
            )}
            {pendingStatus === 5 && (
              <div>
                <strong>Send Back to Review</strong>
                <p className="mb-0 mt-2">
                  Are you sure you want to send back this sales order to review?
                </p>
              </div>
            )}
            {!pendingStatus && (
              <p className="mb-0">
                Are you sure you want to proceed with this action?
              </p>
            )}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelConfirm}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmAction}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
// Optional: Customize the modules and formats of the editor
PendingApprovalSales.modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    // Toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

PendingApprovalSales.formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",

];

export default PendingApprovalSales;
