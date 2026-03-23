import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { Link } from "react-router-dom";
import {
  Modal,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";

import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios } from "../../../environment/AxiosInstance";

import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";

import moment from "moment";
// import { useNavigate } from "react-router-dom";

// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the styles

import { Tooltip, Table } from "antd";
// import { backdropClasses } from "@mui/material";
// import TopLayout from "./ManagementStatusBar";
// import ManagementPageTopBar from "../ManagementPageTopBar";
import { UserAuth } from "../../auth/Auth";
import ManagementStatusBar from "./ManagementStatusBar";
import ProductDetailsContent from "../../CommonComponent/ProductDetailsContent";
import { calculateTotalWeight } from "../../../utils/weightConverter";
import ProductSelect from "../../filterComponents/ProductSelect";
import DeleteModal from "../../CommonComponent/DeleteModal";


function SendToManagement() {
  const { getGeneralSettingssymbol, isVariantsAvailable, user } = UserAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({ current: 1, pageSize: 15 });
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);


  const [showPrice, setShowPrice] = useState(false);
  const [ProductCompare, setProductCompare] = useState([]);


  const [getPid, setPid] = useState(false);
  const [show, setShow] = useState(false);
  const [getshowRemarks, setShowremark] = useState(false);
  const [getRemarksdata, getremarkdata] = useState('');
  const [getRemarksRef, getremarksRef] = useState('');
  // const [getReff, setReff] = useState('');
  const [editedProducts, setEditedProducts] = useState({}); // Store edited product data { productId: { qty, unit_price, variant_id } }
  const [remarks, setRemarks] = useState(''); // Remarks textarea value
  const [sendToVendor, setSendToVendor] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [productVariants, setProductVariants] = useState([]);
  // const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);
  const RemarksClose = () => setShowremark(false);
  const RemarksShow = () => setShowremark(true);
  const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);

  // const handleEditorChange = (content) => {
  //   setEditorContent(content);
  // };

  // const navigate = useNavigate();
  // const getRef = (pid, ref) => {
  //   setReff(ref)
  //   setPid(pid)
  // }
  const getRemarks = (rmks, refid) => {
    getremarkdata(rmks)
    getremarksRef(refid)
  }
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const dataToSend = {
  //     getPid,
  //     editorContent,
  //   };

  //   PrivateAxios.post("purchase/addremarks", dataToSend)
  //     .then((res) => {
  //       if (res.status === 201) {
  //         setEditorContent('');
  //         handleClose(true)
  //         SuccessMessage("Remarks added successfully");
  //         TaskData()
  //         setShowPrice(true);
  //       }
  //     })
  //     .catch((err) => {
  //       ErrorMessage(
  //         "Error: Server busy please try again after some time later"
  //       );
  //     });
  // };

  const PriceCompare = async (ida) => {
    try {
      const response = await PrivateAxios.get(
        `/purchase/getPurchasecompareManagment/${ida}`
      ); // Adjust the URL to your API endpoint
      // console.log(response.data);
      if (response.status === 200) {
        // console.log("PriceCompare", response.data);
        setProductCompare(response.data);
        setPid(ida);
        // Initialize edited products state with current values
        const initialEditedProducts = {};
        if (response.data && response.data.length > 0) {
          response.data[0].products?.forEach((product) => {
            initialEditedProducts[product.id] = {
              qty: product.qty,
              unit_price: product.unit_price,
              variant_id: product.variant_id || product.productVariant?.id || null,
            };
          });
        }
        setEditedProducts(initialEditedProducts);
        // Initialize remarks if available
        if (response.data && response.data.length > 0 && response.data[0].remarkdata) {
          setRemarks(response.data[0].remarkdata.remarks || '');
        } else {
          setRemarks('');
        }
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };

  // Fetch product variants
  const fetchProductVariants = async (productId, productIndex) => {
    setLoadingVariants(true);
    try {
      const response = await PrivateAxios.get(`/product/variants/${productId}`);
      if (response.data && response.data.status && response.data.data?.variants?.length > 0) {
        setProductVariants(response.data.data.variants);
        setSelectedProductIndex(productIndex);
        // Store product info from response
        if (response.data.data?.product) {
          setSelectedProductInfo(response.data.data.product);
        } else if (ProductCompare && ProductCompare.length > 0) {
          // Fallback to ProductCompare data
          const product = ProductCompare[0].products?.[productIndex];
          if (product?.ProductsItem) {
            setSelectedProductInfo({
              product_name: product.ProductsItem.product_name,
              product_code: product.ProductsItem.product_code,
            });
          }
        }
        setShowVariantModal(true);
      } else {
        ErrorMessage("No variants available for this product");
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      ErrorMessage("Failed to fetch product variants");
    } finally {
      setLoadingVariants(false);
    }
  };

  // Get current selected variant ID for highlighting
  const getCurrentSelectedVariantId = () => {
    if (!ProductCompare || ProductCompare.length === 0 || selectedProductIndex === null) return null;
    
    const purchaseOrder = ProductCompare[0];
    const product = purchaseOrder.products[selectedProductIndex];
    const currentVariant = getCurrentVariant(product);
    
    return currentVariant?.id || null;
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    if (!ProductCompare || ProductCompare.length === 0 || selectedProductIndex === null) return;
    
    const purchaseOrder = ProductCompare[0];
    const product = purchaseOrder.products[selectedProductIndex];
    
    // Update editedProducts with the selected variant (store variant data for display)
    setEditedProducts((prev) => ({
      ...prev,
      [product.id]: {
        ...prev[product.id],
        variant_id: variant.id,
        variantData: variant, // Store variant data for immediate display
      },
    }));
    
    // Close modal
    setShowVariantModal(false);
    setProductVariants([]);
    setSelectedProductIndex(null);
    setSelectedProductInfo(null);
  };

  // Handle variant modal close
  const handleVariantModalClose = () => {
    setShowVariantModal(false);
    setProductVariants([]);
    setSelectedProductIndex(null);
    setSelectedProductInfo(null);
  };

  const TaskData = async (customPageState = null) => {
    setLoading(true);
    const currentPageState = customPageState || pageState;
    const urlParams = new URLSearchParams({
      page: currentPageState.current,
      limit: currentPageState.pageSize,
      ...(referenceNumberFilter && { reference_number: referenceNumberFilter }),
      ...(dateRangeFilter[0] && { expected_arrival_start: moment(dateRangeFilter[0]).format("YYYY-MM-DD") }),
      ...(dateRangeFilter[1] && { expected_arrival_end: moment(dateRangeFilter[1]).format("YYYY-MM-DD") }),
    });
    PrivateAxios.get(`purchase/pending-approval?${urlParams.toString()}`)
      .then((res) => {
        const responseData = res.data?.data || {};
        const rows = responseData.rows || [];
        const pagination = responseData.pagination || {};
        setTotalCount(pagination.total_records || 0);
        const slNoBase = ((pagination.current_page || 1) - 1) * (pagination.per_page || currentPageState.pageSize);
        const transformedData = rows.map((item, index) => ({
          id: item.id,
          slNo: slNoBase + index + 1,
          reference: item.reference_number,
          vendor: item.vendor?.vendor_name || "N/A",
          store: item.warehouse?.name || "N/A",
          buyer: item.createdBy?.name || "N/A",
          expectedArrival: moment(item.expected_arrival).format("DD/MM/YYYY"),
          expected_arrival_raw: item.expected_arrival,
          total: `${getGeneralSettingssymbol} ${item.total_amount}`,
          is_parent: item.is_parent,
          status: item.status,
        }));
        setData(transformedData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };
  useEffect(() => {
    TaskData();
  }, []);

  const handleFilter = () => {
    setPageState((prev) => ({ ...prev, current: 1 }));
    TaskData({ current: 1, pageSize: pageState.pageSize });
  };

  const handleReset = () => {
    setReferenceNumberFilter("");
    setDateRangeFilter([null, null]);
    const newPageState = { current: 1, pageSize: pageState.pageSize };
    setPageState(newPageState);
    TaskData(newPageState);
  };

  const handlePageChange = (page, pageSize) => {
    const newPageState = {
      current: page,
      pageSize: pageSize || pageState.pageSize,
    };
    setPageState(newPageState);
    TaskData(newPageState);
  };

  // Calculate totals based on edited products
  const calculateProductTotals = () => {
    if (!ProductCompare || ProductCompare.length === 0) return { grandTotal: 0 };
    
    const purchaseOrder = ProductCompare[0];
    let grandTotal = 0;
    
    purchaseOrder.products?.forEach((product) => {
      const editedProduct = editedProducts[product.id] || { qty: product.qty, unit_price: product.unit_price };
      const qty = parseFloat(editedProduct.qty) || 0;
      const unitPrice = parseFloat(editedProduct.unit_price) || 0;
      const tax = parseFloat(product.tax) || 0;
      
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

  // Handle product change
  const handleProductChange = (productId, productIndex, selectedOption) => {
    if (!selectedOption || !ProductCompare || ProductCompare.length === 0) return;
    
    const selectedProduct = selectedOption.productData;
    if (!selectedProduct) return;
    
    const purchaseOrder = ProductCompare[0];
    const product = purchaseOrder.products[productIndex];
    
    // Update editedProducts with new product data
    setEditedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        product_id: selectedOption.value,
        unit_price: selectedProduct.regular_buying_price || prev[productId]?.unit_price || product.unit_price,
        tax: selectedProduct.tax || product.tax,
        variant_id: null, // Reset variant when product changes
        variantData: null, // Reset variant data
        productData: selectedProduct, // Store new product data for display
      },
    }));
    
    // Update ProductCompare to reflect the new product in the UI
    const updatedProductCompare = [...ProductCompare];
    if (updatedProductCompare[0] && updatedProductCompare[0].products) {
      updatedProductCompare[0].products[productIndex] = {
        ...updatedProductCompare[0].products[productIndex],
        product_id: selectedOption.value,
        ProductsItem: selectedProduct, // Update ProductsItem for display
      };
      setProductCompare(updatedProductCompare);
    }
    
    // Fetch variants for the new product
    if (selectedOption.value && isVariantsAvailable) {
      fetchProductVariants(selectedOption.value, productIndex);
    }
  };

  // Get current variant for a product
  const getCurrentVariant = (product) => {
    const editedProduct = editedProducts[product.id];
    
    // If variantData is stored in editedProducts (from selection), use it
    if (editedProduct?.variantData) {
      return editedProduct.variantData;
    }
    
    // Return original variant if no changes
    return product.productVariant;
  };

  // Get calculated values for a product
  const getProductCalculations = (product) => {
    const editedProduct = editedProducts[product.id] || { qty: product.qty, unit_price: product.unit_price };
    const qty = parseFloat(editedProduct.qty) || 0;
    const unitPrice = parseFloat(editedProduct.unit_price) || 0;
    const tax = parseFloat(editedProduct.tax || product.tax) || 0;
    
    const priceExclTax = qty * unitPrice;
    const lineItemTotal = priceExclTax * (1 + tax / 100);
    
    return {
      priceExclTax: priceExclTax.toFixed(2),
      lineItemTotal: lineItemTotal.toFixed(2),
    };
  };

  // Handle save changes
  const handleApproveByManagement = async () => {
    if (!ProductCompare || ProductCompare.length === 0) return;
    
    const purchaseOrder = ProductCompare[0];
    const productsToUpdate = purchaseOrder.products?.map((product) => {
      const editedProduct = editedProducts[product.id] || { 
        qty: product.qty, 
        unit_price: product.unit_price,
        variant_id: product.variant_id || product.productVariant?.id || null,
        product_id: product.product_id
      };
      return {
        id: product.id,
        product_id: editedProduct.product_id || product.product_id, // Use edited product_id if changed
        qty: parseInt(editedProduct.qty),
        unit_price: parseFloat(editedProduct.unit_price),
        tax: parseInt(editedProduct.tax || product.tax),
        variant_id: editedProduct.variant_id || null,
      };
    });

    const dataToSend = {
      products: productsToUpdate,
      remarks: remarks,
      send_to_vendor: sendToVendor,
    };

    try {
      const response = await PrivateAxios.put(
        `/purchase/approved-by-management/${purchaseOrder.id}`,
        dataToSend
      );
      
      if (response.status === 200) {
        SuccessMessage("Changes saved successfully");
        setShowPrice(false);
        TaskData();
        // Reset edited products
        setEditedProducts({});
        setRemarks('');
        setSendToVendor(false);
      }
    } catch (error) {
      ErrorMessage("Error!! Unable to approve by management");
      console.error("Error approving by management:", error);
    }
  };

  const handleRejectClick = () => {
    if (!ProductCompare || ProductCompare.length === 0) return;
    setShowRejectConfirmModal(true);
  };

  const executeRejectChanges = async () => {
    if (!ProductCompare || ProductCompare.length === 0) {
      setShowRejectConfirmModal(false);
      return;
    }

    const purchaseOrder = ProductCompare[0];
    const dataToSend = {
      remarks: remarks,
    };

    try {
      const response = await PrivateAxios.put(
        `/purchase/rejected-by-management/${purchaseOrder.id}`,
        dataToSend
      );

      if (response.status === 200) {
        SuccessMessage("Purchase order rejected successfully");
        setShowRejectConfirmModal(false);
        setShowPrice(false);
        TaskData();
        setEditedProducts({});
        setRemarks("");
        setSendToVendor(false);
      }
    } catch (error) {
      ErrorMessage("Error rejecting changes. Please try again.");
      console.error("Error rejecting changes:", error);
    }
  };


  const renderReference = (_, record) => (
    <div>
      <span className="k_table_link" style={{ fontSize: "15px", color: "#007bff", fontWeight: "bold" }}>{record.reference}</span>
      {/* <a
        onClick={() => {
          setShowPrice(true);
          PriceCompare(record.id);
        }}
        style={{ marginLeft: "8px" }}
        title="View & Approve PO"
      >
        <i
          className="fas fa-check"
          style={{ fontSize: "15px", color: "#007bff", cursor: "pointer" }}
        />
      </a> */}
    </div>
  );

  const renderStatus = () => (
    <label className="badge badge-outline-yellowGreen">
      <i className="fas fa-circle f-s-8 d-flex me-1" />
      Pending Approval
    </label>
  );

  const renderAction = (_, record) => (
    <div className="d-flex gap-2">
      <Tooltip title="View & Approve PO">
        <span
          className="me-1 icon-btn"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setShowPrice(true);
            PriceCompare(record.id);
          }}
        >
          <i className="fas fa-check" style={{ fontSize: "15px", color: "#007bff", cursor: "pointer" }} />
        </span>
      </Tooltip>

      {record.is_parent === 1 && record.status === 4 && (
        <Tooltip title="Confirm Order">
          <Link
            to={{ pathname: `/purchase/${record.id}` }}
            state={{ data: record }}
            className="me-1 icon-btn"
          >
            <i className="fas fa-external-link-alt" />
          </Link>
        </Tooltip>
      )}
    </div>
  );

  const columns = [
    { title: "Sl No.", dataIndex: "slNo", key: "slNo", width: 80 },
    { title: "Reference No.", dataIndex: "reference", key: "reference", width: 150, render: renderReference },
    { title: "Vendor", dataIndex: "vendor", key: "vendor", width: 200 },
    { title: "Store", dataIndex: "store", key: "store", width: 200 },
    { title: "Created By", dataIndex: "buyer", key: "buyer", width: 200 },
    { title: "Expected Arrival", dataIndex: "expectedArrival", key: "expectedArrival", width: 150 },
    { title: "Total", dataIndex: "total", key: "total", width: 150 },
    { title: "Status", key: "status", width: 250, render: renderStatus },
    { title: "Action", key: "action", width: 150, render: renderAction },
  ];

  const deletePurchaseProduct = async (purchaseId, productId) => {
    try {
      const response = await PrivateAxios.delete(`/purchase/${purchaseId}/item/${productId}`);
      if (response.status === 200) {
        SuccessMessage("Product deleted successfully");
        TaskData();
      }
    } catch (error) {
      ErrorMessage("Error deleting product. Please try again.");
      console.error("Error deleting product:", error);
    }
  };



  return (
    <React.Fragment>
      <ManagementStatusBar />

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">

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
                    <div style={{ minWidth: "250px", display: "flex", flexDirection: "column" }}>
                      <label className="form-label mb-1 f-s-14 fw-medium">Filter by Expected Arrival</label>
                      <DatePicker
                        selected={dateRangeFilter[0]}
                        onChange={(update) => setDateRangeFilter(update)}
                        startDate={dateRangeFilter[0]}
                        endDate={dateRangeFilter[1]}
                        selectsRange
                        isClearable
                        placeholderText="Select date range"
                        className="form-control"
                        dateFormat="dd-MM-yyyy"
                        name="expected_arrival"
                        style={{ display: "block", width: "100%" }}
                      />
                    </div>
                    <div className="d-flex gap-2 align-items-end">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleFilter}
                        style={{ height: "38px", marginTop: "20px" }}
                      >
                        <i className="fas fa-filter me-2" />
                        Filter
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleReset}
                        style={{ height: "38px", marginTop: "20px" }}
                      >
                        <i className="fas fa-redo me-2" />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg_succes_table_head rounded_table">
                <Table
                  columns={columns}
                  dataSource={data}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    current: pageState.current,
                    pageSize: pageState.pageSize,
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









      {/* ========================================================= modal start here */}

      <Modal
        backdrop="static"
        centered
        size="xl"
        show={showPrice}
        onHide={() => {
          setShowPrice(false);
          setEditedProducts({});
          setRemarks('');
          setSendToVendor(false);
        }}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header>
          <Modal.Title id="example-custom-modal-styling-title">
            Purchase Order Details
          </Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setShowPrice(false);
              setEditedProducts({});
              setRemarks('');
              setSendToVendor(false);
            }}
            aria-label="Close"
          ></button>
        </Modal.Header>
        <Modal.Body className="pb-0">
          {ProductCompare && ProductCompare.length > 0 && (
            <>
              {/* Fixed Purchase Order Details Table */}
              <div className="mb-4">
                <h6 className="mb-3">Basic Details</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="30%">Vendor</th>
                        <th width="20%">Reference</th>
                        <th width="30%">Store</th>
                        <th width="20%">Expected Date</th>
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
                          <td>{productPriceCompare.vendor?.vendor_name || 'N/A'}</td>
                          <td className="k_table_link">
                            {productPriceCompare.reference_number}
                            {productPriceCompare.remarkdata && productPriceCompare.remarkdata.remarks !== '' ? (
                              <i
                                style={{ cursor: 'pointer', marginLeft: '8px' }}
                                className="bi bi-eye-fill"
                                onClick={() => {
                                  RemarksShow(true);
                                  getRemarks(
                                    productPriceCompare.remarkdata.remarks,
                                    productPriceCompare.vendor.vendor_name + ' - ' + productPriceCompare.reference_number
                                  );
                                }}
                              ></i>
                            ) : ''}
                          </td>
                          <td>{productPriceCompare.warehouse?.name || 'N/A'}</td>
                          <td>
                            {moment(productPriceCompare.expected_arrival).format("DD-MM-YYYY")}
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
                        {isVariantsAvailable && (
                          <>
                            <th>Weight per unit</th>
                            <th>Total weight</th>
                          </>
                        )}
                        <th>Unit Price</th>
                        <th>Tax (%)</th>
                        <th>Price (Excl tax)</th>
                        <th>Total Amount</th>
                    
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ProductCompare[0].products?.map((product, productIndex) => {
                        const editedProduct = editedProducts[product.id] || { qty: product.qty, unit_price: product.unit_price };
                        const calculations = getProductCalculations(product);
                        
                        return (
                          <tr key={product.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2" style={{ minWidth: "300px" }}>
                                <div style={{ flex: 1 }}>
                                  <ProductSelect
                                    value={product.product_id}
                                    onChange={(selectedOption) => handleProductChange(product.id, productIndex, selectedOption)}
                                    placeholder="Search and select product..."
                                    isClearable={false}
                                    limit={5}
                                    styles={{
                                      control: (base) => ({
                                        ...base,
                                        minHeight: "32px",
                                        fontSize: "14px",
                                      }),
                                    }}
                                  />
                                </div>
                                {(() => {
                                  const editedProduct = editedProducts[product.id];
                                  const productDataToShow = editedProduct?.productData || product.ProductsItem;
                                  return productDataToShow && (
                                    <OverlayTrigger
                                      trigger="click"
                                      placement="auto"
                                      rootClose
                                      popperConfig={{
                                        modifiers: [
                                          {
                                            name: "offset",
                                            options: {
                                              offset: [0, 8],
                                            },
                                          },
                                          {
                                            name: "preventOverflow",
                                            options: {
                                              boundary: "viewport",
                                            },
                                          },
                                        ],
                                      }}
                                      overlay={
                                        <Popover 
                                          id={`product-details-${product.id}`} 
                                          style={{ 
                                            maxWidth: "450px",
                                            zIndex: 1050
                                          }}
                                        >
                                          <Popover.Header as="h6" className="d-flex align-items-center">
                                            <i className="fas fa-info-circle text-primary me-2"></i>
                                            Product Details
                                          </Popover.Header>
                                          <Popover.Body style={{ 
                                            maxHeight: "500px", 
                                            overflowY: "auto",
                                            padding: "12px"
                                          }}>
                                            <ProductDetailsContent
                                              productData={productDataToShow}
                                            />
                                          </Popover.Body>
                                        </Popover>
                                      }
                                    >
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      className="text-primary"
                                      style={{ cursor: "pointer", flexShrink: 0 }}
                                      title="View product details"
                                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
                                    >
                                      <i className="fas fa-info-circle fa-lg"></i>
                                    </span>
                                  </OverlayTrigger>
                                  );
                                })()}
                              </div>
                            </td>
                            <td>
                              {(() => {
                                const editedProduct = editedProducts[product.id];
                                if (editedProduct?.productData) {
                                  return editedProduct.productData.product_code || 'N/A';
                                }
                                return product.ProductsItem?.product_code || 'N/A';
                              })()}
                            </td>
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
                            {isVariantsAvailable && (
                              <>
                                <td>
                                  
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {(() => {
                                          const currentVariant = getCurrentVariant(product);
                                          return currentVariant 
                                            ? `${currentVariant.weight_per_unit} ${currentVariant.masterUOM?.label || ''}`
                                            : 'N/A';
                                        })()}
                                      </span>
                                      <div className="btn-sm cursor-pointer"
                                      onClick={() => {
                                        const editedProduct = editedProducts[product.id];
                                        const productIdToUse = editedProduct?.product_id || product.product_id;
                                        fetchProductVariants(productIdToUse, productIndex);
                                      }}
                                      title="Click to change variant"
                                      >
                                        <i className="fas fa-edit" style={{ color: "#007bff" }}></i>
                                      </div>
                                    </div>
                                </td>

                                <td>
                                  {(() => {
                                    const currentVariant = getCurrentVariant(product);
                                    if (currentVariant && currentVariant.weight_per_unit && currentVariant.masterUOM?.label) {
                                      const totalWeightResult = calculateTotalWeight(
                                        editedProduct.qty,
                                        currentVariant.weight_per_unit,
                                        currentVariant.masterUOM.label
                                      );
                                      return totalWeightResult.display || 'N/A';
                                    }
                                    return 'N/A';
                                  })()}
                                </td>
                              </>
                            )}
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
                            <td>
                              {(() => {
                                const editedProduct = editedProducts[product.id];
                                return editedProduct?.tax !== undefined ? `${editedProduct.tax}%` : `${product.tax}%`;
                              })()}
                            </td>
                            <td>
                              {getGeneralSettingssymbol} {calculations.priceExclTax}
                            </td>
                            <td>
                              {getGeneralSettingssymbol} {calculations.lineItemTotal}
                            </td>
             
                            <td>
                              <div className="d-flex gap-2">
                                <Tooltip title="Delete Item">
                                  <span
                                    onClick={() => {
                                      deletePurchaseProduct(
                                        ProductCompare[0].id,
                                        product.id
                                      );
                                    }}
                                    className="icon-btn"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i className="fas fa-times f-s-20 d-flex text-danger"></i>
                                  </span>
                                </Tooltip>
                                {/* <Tooltip title="Create Note">
                                  <span
                                    onClick={() => {
                                      handleShow(true);
                                      getRef(
                                        ProductCompare[0].id,
                                        ProductCompare[0].vendor.vendor_name + ' - ' + ProductCompare[0].reference_number
                                      );
                                    }}
                                    className="icon-btn"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i className="fas fa-pen d-flex"></i>
                                  </span>
                                </Tooltip> */}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td colSpan={9} align="right">
                          <h6 className="mb-0 text-muted">
                            Grand Total: <span className="text-dark f-s-20">{getGeneralSettingssymbol} {formattedTotalAmount}</span>
                          </h6>
                        </td>
                        <td></td>
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
              <div className="mb-3">
                <label className="custom-checkbox form-label" style={{ fontSize: "14px" }}>
                Send to vendor
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="sendToVendor"
                    checked={sendToVendor}
                    onChange={(e) => setSendToVendor(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                </label>
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
              setSendToVendor(false);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleRejectClick}
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

      <DeleteModal
        show={showRejectConfirmModal}
        handleClose={() => setShowRejectConfirmModal(false)}
        onDelete={executeRejectChanges}
        title="Reject Purchase Order"
        message="Are you sure you want to reject this purchase order?"
      />

      {/* <Modal show={show} onHide={handleClose} closeButton backdrop="static"
        centered
        size="lg">
        <Modal.Header closeButton >
          <Modal.Title id="example-modal-sizes-title-lg">
            {getReff}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body><form onSubmit={handleSubmit}>
          <div
          // style={{ minHeight: "200px" }}
          >
            <ReactQuill
              value={editorContent}
              onChange={handleEditorChange}
              modules={SendToManagement.modules}
              formats={SendToManagement.formats}
              theme="snow"
            // style={{ minHeight: "200px" }}
            />
          </div>
          <div class=" d-flex justify-content-end pt-4">
            <button class="btn btn-success" type="submit">
              Submit
            </button>
          </div>
        </form></Modal.Body>

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

      {/* Variant Selection Modal */}
      <Modal
        show={showVariantModal}
        onHide={handleVariantModalClose}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="variant-selection-modal-title">
            <i className="fas fa-box me-2 text-primary"></i>
            Select Product Variant
          </Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={handleVariantModalClose}
            aria-label="Close"
          ></button>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          {loadingVariants ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading variants...</span>
              </div>
              <p className="mt-2">Loading variants...</p>
            </div>
          ) : (
            <>
              {selectedProductInfo && (
                <div className="mb-3 p-3 bg-light rounded">
                  <h6 className="mb-2">
                    <i className="fas fa-cube me-2 text-primary"></i>
                    Product: {selectedProductInfo.product_name || selectedProductInfo.product_code}
                  </h6>
                  <p className="mb-0 text-muted">
                    <small>Code: {selectedProductInfo.product_code}</small>
                  </p>
                </div>
              )}
              
              {productVariants.length > 0 ? (
                <div>
                  <h6 className="mb-3">Available Variants:</h6>
                  <div className="row">
                    {productVariants.map((variant, index) => {
                      const currentSelectedVariantId = getCurrentSelectedVariantId();
                      const isSelected = currentSelectedVariantId === variant.id;
                      
                      return (
                      <div key={variant.id} className="col-md-6 mb-3">
                        <div
                          className="card h-100 cursor-pointer position-relative"
                          style={{
                            border: isSelected ? "3px solid #28a745" : "2px solid #dee2e6",
                            backgroundColor: isSelected ? "#f0f9f4" : "#fff",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            boxShadow: isSelected ? "0 4px 12px rgba(40, 167, 69, 0.3)" : "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#6161ff";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(97, 97, 255, 0.2)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#dee2e6";
                              e.currentTarget.style.boxShadow = "none";
                            } else {
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(40, 167, 69, 0.3)";
                            }
                          }}
                          onClick={() => handleVariantSelect(variant)}
                        >
                          {isSelected && (
                            <div
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                borderRadius: "50%",
                                width: "28px",
                                height: "28px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 10,
                              }}
                            >
                              <i className="fas fa-check" style={{ fontSize: "12px" }}></i>
                            </div>
                          )}
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0">
                                <i className="fas fa-tag me-2 text-primary"></i>
                                Variant {index + 1}
                                {isSelected && (
                                  <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>
                                    Selected
                                  </span>
                                )}
                              </h6>
                              {variant.status === 1 && (
                                <span className="badge bg-success">Active</span>
                              )}
                            </div>
                            <div className="mt-2">
                              <div className="d-flex justify-content-between py-1">
                                <span className="text-muted">Unit of Measurement:</span>
                                <span className="fw-medium">
                                  {variant.masterUOM?.name || "N/A"}
                                  {variant.masterUOM?.label && (
                                    <span className="text-muted ms-1">({variant.masterUOM.label})</span>
                                  )}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between py-1">
                                <span className="text-muted">Weight per Unit:</span>
                                <span className="fw-medium">{variant.weight_per_unit || "N/A"}</span>
                              </div>
                              {variant.price_per_unit && parseFloat(variant.price_per_unit) > 0 && (
                                <div className="d-flex justify-content-between py-1">
                                  <span className="text-muted">Price per Unit:</span>
                                  <span className="fw-medium text-success">
                                    {getGeneralSettingssymbol}{parseFloat(variant.price_per_unit).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No variants available for this product.</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleVariantModalClose}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
// Optional: Customize the modules and formats of the editor
SendToManagement.modules = {
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

SendToManagement.formats = [
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

export default SendToManagement;
