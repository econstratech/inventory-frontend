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
// import { UserAuth } from "../../auth/Auth";
import Loader from "../../../environment/Loader";

import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";

import moment from "moment";
import {
  BrowserRouter as Router,
  useNavigate,
} from "react-router-dom";

// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the styles
import {
  Grid,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
// import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import SalesManagementPageTopBar from "./SalesManagementPageTopBar";
import ProductDetailsContent from "../../CommonComponent/ProductDetailsContent";
import ProductSelect from "../../filterComponents/ProductSelect";
import ProductVariantSelectionModal from "../../CommonComponent/ProductVariantSelectionModal";
import { calculateTotalWeight } from "../../../utils/weightConverter";



function PendingApprovalSales() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("auth_user")) || null);
  const [getGeneralSettingssymbol, setGetGeneralSettingssymbol] = useState(null);
  // const { id } = useParams();

  //for-data table
  const [editorContent, setEditorContent] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [ProductCompare, setProductCompare] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const [getPid, setPid] = useState(false);
  const [show, setShow] = useState(false);
  const [getshowRemarks, setShowremark] = useState(false);
  const [getRemarksdata, getremarkdata] = useState('');
  const [getRemarksRef, getremarksRef] = useState('');
  const [getReff, setReff] = useState('');
  const [editedProducts, setEditedProducts] = useState({}); // Store edited product data { productId: { qty, unit_price } }
  const [remarks, setRemarks] = useState(''); // Remarks textarea value
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentProductRowId, setCurrentProductRowId] = useState(null);
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState(null);
  const [variantModalBackup, setVariantModalBackup] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // Store the action to perform after confirmation
  const [pendingStatus, setPendingStatus] = useState(null); // Store the status for the confirmation message
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const RemarksClose = () => setShowremark(false);
  const RemarksShow = (value) => setShowremark(value);
  const [pageState, setPageState] = useState({ skip: 0, take: 15, searchKey: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);

  const [data, setData] = useState([]);


  useEffect(() => {
    if (user) {
      setGetGeneralSettingssymbol(user.company.generalSettings.symbol);
    }
  }, [user]);

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };
  const navigate = useNavigate();
  const getRef = (pid, ref) => {
    setReff(ref)
    setPid(pid)
  }
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
                variantData: product.variantData || product.productVariant || null,
                tax: product.tax,
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
        setPid(ida);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };

  // const handleCloseAfterReview = () => {
  //   if (areAllStatusesFive()) {
  //     setShowPrice(false);
  //     navigate('/sales/pending-approval');
  //   } else {
  //     alert("All statuses must be 5 to close the modal.");
  //   }
  // };
  // const areAllStatusesFive = () => {
  //   if (!ProductCompare || ProductCompare.length === 0) return false;
  //   return ProductCompare.every((productPriceCompare) => productPriceCompare.status >= 4);
  // };

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

  // Handle product field changes
  const handleProductFieldChange = (productId, field, value) => {
    setEditedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
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
    setEditedProducts((prev) => ({
      ...prev,
      [product.id]: {
        ...(prev[product.id] || {}),
        qty: prev[product.id]?.qty ?? product.qty,
        unit_price:
          selectedProductData?.regular_selling_price ??
          prev[product.id]?.unit_price ??
          product.unit_price,
        tax: selectedProductData?.tax ?? prev[product.id]?.tax ?? product.tax,
        product_id: selectedProductData?.id ?? product.product_id,
        productData: selectedProductData || product.productData || product.product || null,
        variant_id: variantId,
        variantData: selectedVariantData,
      },
    }));
  };

  const openVariantSelector = (product, selectedProductData) => {
    const existingEdited = editedProducts[product.id] || {};
    setVariantModalBackup({
      rowId: product.id,
      data: {
        qty: existingEdited.qty ?? product.qty,
        unit_price: existingEdited.unit_price ?? product.unit_price,
        tax: existingEdited.tax ?? product.tax,
        product_id: existingEdited.product_id ?? product.product_id,
        productData: existingEdited.productData || product.productData || product.product || null,
        variant_id:
          existingEdited.variant_id ||
          existingEdited.variantData?.id ||
          product.variant_id ||
          product.product_variant_id ||
          product.productVariant?.id ||
          null,
        variantData: existingEdited.variantData || product.variantData || product.productVariant || null,
      },
    });

    updateEditedProductWithSelection(product, selectedProductData, null, null);
    setCurrentProductRowId(product.id);
    setCurrentSelectedProductId(selectedProductData?.id || product.product_id);
    setShowVariantModal(true);
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
    setShowVariantModal(false);
    setCurrentProductRowId(null);
    setCurrentSelectedProductId(null);
  };

  const handleContinueWithoutVariant = () => {
    setVariantModalBackup(null);
    setShowVariantModal(false);
    setCurrentProductRowId(null);
    setCurrentSelectedProductId(null);
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

    // console.log("dataToSend", dataToSend);

    try {
      const response = await PrivateAxios.put(
        `/sales/approved-by-management/${salesQuotation.id}`,
        dataToSend
      );
      
      if (response.status === 200) {
        SuccessMessage("Sales quotation has been approved successfully");
        setShowPrice(false);
        TaskData();
        // Reset edited products
        setEditedProducts({});
        setRemarks('');
      }
    } catch (error) {
      ErrorMessage("Error approving sales quotation. Please try again.");
      console.error("Error approving sales quotation:", error);
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
        
        const transformedData = rows.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          creationDate: moment(item.created_at).format("DD/MM/YYYY"),
          deliveryDate: moment(item.expected_delivery_date).format("DD/MM/YYYY"),
          // creationDate: new Date(item.created_at).toLocaleString(),
          customer: item.customer && item.customer?.name,
          salesPerson: item.createdBy?.name,
          storeName: item.warehouse?.name,
          total: `${getGeneralSettingssymbol}${item.total_amount}`,
          status: item.status,
          is_parent: item.is_parent,
          status_return:
            item.status === 1
              ? `<label class="badge badge-outline-active"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Active</label>`
              : item.status === 2
                ? `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Quotation Created</label>`
                : item.status === 3
                  ? `<label class="badge badge-outline-yellowGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Pending Approval</label>`
                  : item.status === 4
                    ? `<label class="badge badge-outline-accent mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Sent to sales order</label>`
                    : item.status === 5
                      ? `<label class="badge badge-outline-green mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Order Confirmed</label>`
                      : item.status === 6
                        ? `<label class="badge badge-outline-meantGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Fully Billed</label>`
                        : item.status === 7
                          ? `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Done</label>`
                          : item.status === 8
                            ? `<label class="badge badge-outline-danger "><i class="fas fa-circle f-s-8 d-flex me-1"></i>Rejected</label>`
                            : "Unknown",
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
    setPageState({ ...pageState, skip: 0 }); // Reset to first page when filtering
    TaskData(null);
  };

  // Handle reset button click – use the same option object from statusOptions so react-select displays "All"
  const handleReset = () => {
    setPageState({ skip: 0, take: 15, searchKey: "" });
    setReferenceNumberFilter("");
    setDateRangeFilter([null, null]);
    TaskData(null);
  };

  const handlePageChange = (event) => {
    const newPageState = {
      skip: event.page.skip,
      take: event.page.take,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    // Fetch data with updated pagination and current filter
    TaskData(newPageState);
  };


  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span><a className="k_table_link" onClick={() => {
            setShowPrice(true);
            PriceCompare(dataItem.id);

          }}>{dataItem.reference}

            {dataItem.is_parent === 1 && "   "} {/* Add a space */}
            {dataItem.is_parent == 1 && <i
              className="fas fa-info-circle"
              style={{ fontSize: "15px", color: "#007bff", cursor: "pointer" }}
            ></i>}
          </a></span>

        </div>
      </td>
    );
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
    return (
      <td>
        <div className="d-flex gap-2">
          <Tooltip title="View Details">
            <span

              className="me-1 icon-btn"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowPrice(true);
                PriceCompare(dataItem.id);
              }}
            >

              <i class="fas fa-eye d-flex"></i>
            </span>
          </Tooltip>

          {dataItem.is_parent == 1 && dataItem.status == 4 && (
            <Tooltip title="Confirm Order">
              <Link
                to={{ pathname: `/purchase/${dataItem.id}` }}
                state={{ data: dataItem }}
                className="me-1 icon-btn"
              >
                <i className="glyphicon glyphicon-checkbi fas fa-external-link-alt"></i>
              </Link>
            </Tooltip>
          )}

        </div>
      </td>
    );
  };


  const CustomCell = (props) => {
    // const { dataItem, field } = props;

    // Access the field value directly
    // const value = dataItem[field];

    return (
      <td>

        <label className="badge badge-outline-yellowGreen mb-0"><i className="fas fa-circle f-s-8 d-flex me-1"></i>Pending Approval</label>
        {/* {value} */}
      </td>
    );
  };



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
          {/* <div className="d-flex ms-auto gap-3">
            <div className="line"></div>
            <div className="d-flex justify-content-center align-items-center gap-2">
            {MatchPermission(["Quotation Create Sales"]) ?
              <Link to="/sales/new" className="btn btn-exp-primary btn-sm">
                <i className="fas fa-plus"></i>
                <span className="ms-2">Create Sale Order</span>
              </Link>
              :""}
            </div>
          </div> */}
        </div>
      </div>

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                <div className="table-button-group mb-2 ms-auto">

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
                </div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <PDFExport data={data} ref={pdfExportRef}>
                  <ExcelExport data={data} ref={excelExportRef} >
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


                      {/* Column Definitions */}

                      <GridColumn field="slNo" title="sl No." filterable={false} width="100px" locked={true} />
                      <GridColumn field="reference" title="reference" filterable={false} filter="text" cell={ReferenceCell} width="100px" />
                      <GridColumn field="deliveryDate" title="Delivery Date" filterable={false} filter="text" width="200px" />
                      {/* <GridColumn field="vendor" title="vendor" filter="text" filterable={false} width="250px" /> */}
                      <GridColumn field="creationDate" title="Creation Date" filterable={false} filter="text" width="150px" />
                      <GridColumn field="customer" title="Customer" filterable={false} filter="text" width="150px" />
                      <GridColumn field="storeName" title="Store" filterable={false} filter="text" width="150px" />
                      <GridColumn field="salesPerson" title="Sales Person" filter="text" filterable={false} width="200" />
                      {/* <GridColumn field="sourceDocument" title="source DocumentT" filterable={false} filter="text" width="200px" /> */}
                      <GridColumn field="total" title="total" filter="text" filterable={false} width="150px" />
                      {/* <GridColumn field="customer" title="Customer" filterable={false} filter="text" width="200px" />
                      <GridColumn field="reference" title="reference" filterable={false} filter="text" cell={ReferenceCell} width="150px" />
                      <GridColumn field="buyer" title="buyer" filter="text" filterable={false} width="200" />
                      <GridColumn field="created" title="Created" filter="numeric" width="200px" />
                      <GridColumn field="total" title="total" filter="text" filterable={false} width="200px" /> */}
                      <GridColumn
                        field="status"
                        title="status"
                        filter="dropdown"
                        width="250px"
                        filterable={false}
                        // filterCell={CustomDropDownFilter}
                        cells={{
                          data: CustomCell
                        }}
                      />
                      <GridColumn title="action" filter="text" cell={ActionCell} filterable={false} width="150px" />
                    </Grid>
                  </ExcelExport>
                </PDFExport>



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
            Sales Quotation Details
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
                        <th>Weight Per Unit</th>
                        <th>Total Weight</th>
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
                                        openVariantSelector(product, selectedOption.productData);
                                      }
                                    }}
                                    queryParams={{
                                      type: "dropDown",
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
                            <td>
                              <div className="d-flex align-items-center gap-2" style={{ minWidth: "100px" }}>
                                <span>
                                  {row.variantData
                                    ? `${row.variantData.weight_per_unit || "N/A"} ${row.variantData.masterUOM?.label || ""}`.trim()
                                    : "N/A"}
                                </span>
                                {row.productId && (
                                  <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0"
                                    onClick={() => openVariantSelector(product, row.productData)}
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
                                    row.variantData?.masterUOM?.label
                                  ).display
                                : "N/A"}
                            </td>
                            <td>
                              {row.variantData?.masterUOM?.label ||
                                row.variantData?.masterUOM?.name ||
                                row.productData?.masterUOM?.label ||
                                row.productData?.masterUOM?.name ||
                                'N/A'}
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
                        <td colSpan={10} align="right">
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
        onHide={() => handleVariantModalClose(currentProductRowId)}
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
                <strong>Reject Sales Quotation</strong>
                <p className="mb-0 mt-2">
                  Are you sure you want to reject this sales quotation? This action cannot be undone.
                </p>
              </div>
            )}
            {pendingStatus === 5 && (
              <div>
                <strong>Send Back to Review</strong>
                <p className="mb-0 mt-2">
                  Are you sure you want to send back this sales quotation to review?
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
