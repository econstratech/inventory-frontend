import React, { useEffect, useState } from "react";
import {
  // BrowserRouter as Router,
  // Route,
  // Switch,
  // useHistory,
  Link,
  // Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import Select from "react-select";

import {
  // Button,
  Table,
  Alert,
  Modal,
  OverlayTrigger,
  Popover,
  // Tooltip,
} from "react-bootstrap";
import moment from "moment";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
// import { UserAuth } from "../auth/Auth";
// import {
//   AllUser,
//   AllCategories,
//   GetTaskRemainder,
// } from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  // PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import ProductDetailsContent from "../CommonComponent/ProductDetailsContent";
import VendorSelect from "../filterComponents/VendorSelect";
import ProductSelect from "../filterComponents/ProductSelect";
import { calculateTotalWeight } from "../../utils/weightConverter";
import { Tooltip } from "antd";

function PurchaseOrderRecv() {

  const { id } = useParams();
  const [user] = useState(JSON.parse(localStorage.getItem("auth_user")) || null);
  const getGeneralSettingssymbol = user?.company?.generalSettings?.symbol || "₹";
  // const [total, setTotal] = useState("");
  // const { vendor, userDetails } = UserAuth();
  // const [selectedOption, setSelectedOption] = useState("");
  // const [isCheckedReminder, setIsCheckedReminder] = useState(false);
  // const [isFileRequired, setIsFileRequired] = useState(false);
  const [error, setError] = useState({});
  const [alert, setAlert] = useState("");
  // const [show, setShow] = useState(false);
  // const [showPrice, setShowPrice] = useState(false);
  // const [catProduct, setCategory] = useState([
  //   { value: "select", label: "-Select-" },
  // ]);
  const [products, setProducts] = useState([]);
  const [expandedBatchIndex, setExpandedBatchIndex] = useState(null);
  const [existingBatchesModalIndex, setExistingBatchesModalIndex] = useState(null);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [editedProducts, setEditedProducts] = useState({}); // Store edited product data { productId: { product_id, variant_id, variantData, productData } }

  // const [setPaymentReference, PaymentReference] = useState("");

  const [vendor, setVendor] = useState({ vendor_id: "" });
  // const [orderDeadline, setOrderDeadline] = useState("");

  const [billReference, setBillReference] = useState("");
  // const [setAccountingDate, AccountingDate] = useState("");
  // const [buyer, setBuyer] = useState("");
  // const [sourceDocument, setSourceDocument] = useState("");
  const [setBillNumber, getBillNumber] = useState("");
  // const [advancePayment, setAdvancePayment] = useState("");
  const [purchaseData, setPurchaseData] = useState(null);
  const [receivedStatus, setReceivedStatus] = useState({ label: "Pending", value: "pending" });

  // const [setBillDate, BillDate] = useState("");
  // const [selectedState, setSelectedState] = useState("");
  // const fetchProducts = async (id, venid) => {
  //   try {
  //     const response = await PrivateAxios.get(
  //       `/purchase/get_addi/${id}/${venid}`
  //     ); // Adjust the URL to your API endpoint
  //     console.log(response);
  //     if (response.status === 200 && Array.isArray(response.data)) {
  //       console.log(response.data);
  //     }
  //   } catch (error) {
  //     console.error("There was an error fetching the product list!", error);
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get(`/purchase/purchase/${id}`);
        const purchaseData = response.data;
        // console.log(data.reference_number);
        setPurchaseData(purchaseData);
        setVendor(purchaseData.vendor);
        setBillReference(purchaseData.bill_reference);
        getBillNumber(purchaseData.reference_number + '/' + Math.floor(Math.random() * 1000));
        // setBuyer(purchaseData.buyer);
        // setSourceDocument(purchaseData.source_document);
        setProducts((purchaseData.products || []).map((p) => {
          const existingBatches = Array.isArray(p.batches) ? p.batches : [];
          // const allBatches = [];
          // const existingBatches = allBatches.filter((b) => b.id != null);
          // const newBatches = allBatches.filter((b) => b.id == null);
          return {
            ...p,
            qty: p.qty ?? 0,
            taxIncl: p.taxIncl ?? 0,
            received: p.received ?? 0,
            available_qty: (p.qty ?? 0) - (p.received ?? 0),
            received_now: 0,
            rejected: p.rejected ?? 0,
            existingBatches,
            batches: [],
            variant_id: p.variant_id || p.productVariant?.id || null,
            variantData: p.productVariant || null,
          };
        }));
        
        // Initialize editedProducts with current product data
        const initialEditedProducts = {};
        (purchaseData.products || []).forEach((product) => {
          initialEditedProducts[product.id] = {
            product_id: product.product_id,
            variant_id: product.variant_id || product.productVariant?.id || null,
            variantData: product.productVariant || null,
            productData: product.ProductsItem || null,
          };
        });
        setEditedProducts(initialEditedProducts);
        // setAdvancePayment(purchaseData.advance);
        // console.log("State updated with fetched data");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    // console.log(vendor);
  }, [id]);
  // console.log(orderDeadline);
  const calculateTotal = () => {
    let untaxedAmount = 0;
    products.forEach((product) => {
      untaxedAmount += product.qty * product.unit_price;
    });
    const taxAmount = (untaxedAmount * (products[0]?.tax / 100)) / 2;
    const totalAmount = untaxedAmount + taxAmount * 2; // CGST and SGST
    return { untaxedAmount, taxAmount, totalAmount };
  };

  const isProductBatchApplicable = (product) => {
    // Check edited product data first (if product was changed)
    const editedProduct = editedProducts[product.id];
    const productData = editedProduct?.productData || product.ProductsItem;
    
    // Explicitly check for 1 or true, and explicitly exclude 0, false, null, undefined
    const isBatchApplicable = productData?.is_batch_applicable;
    
    // Return true only if explicitly 1 or true, false otherwise
    return isBatchApplicable === 1 || isBatchApplicable === true;
  }

  const addBatch = (productIndex) => {
    const newProducts = [...products];
    if (!Array.isArray(newProducts[productIndex].batches)) {
      newProducts[productIndex].batches = [];
    }
    newProducts[productIndex].batches.push({
      batch_no: "",
      manufacture_date: "",
      expiry_date: "",
      qty: 0,
    });
    setProducts(newProducts);
  };

  const removeBatch = (productIndex, batchIndex) => {
    const newProducts = [...products];
    newProducts[productIndex].batches = newProducts[productIndex].batches.filter(
      (_, i) => i !== batchIndex
    );
    setProducts(newProducts);
  };

  const handleBatchChange = (productIndex, batchIndex, field, value) => {
    const newProducts = [...products];
    newProducts[productIndex].batches[batchIndex] = {
      ...newProducts[productIndex].batches[batchIndex],
      [field]: value,
    };
    setProducts(newProducts);
  };

  const handleProductQuantityChange = (productIndex, field, value) => {
    const newProducts = [...products];
    const product = newProducts[productIndex];
    
    // Parse the received_now value (handle empty string as 0)
    const receivedNow = value === "" || value === null || value === undefined ? 0 : parseFloat(value) || 0;
    
    // Update the field
    newProducts[productIndex][field] = value === "" ? "" : value;
    newProducts[productIndex].received_now = receivedNow;
    
    // Calculate available_qty from base values: qty - received (already received) - received_now (being received now)
    // This ensures available_qty always recovers correctly when received_now changes
    const qty = parseFloat(product.qty) || 0;
    const received = parseFloat(product.received) || 0;
    newProducts[productIndex].available_qty = qty - received - receivedNow;
    
    setProducts(newProducts);
  };

  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0"); // Adding 1 because getMonth() returns 0-11
  const billNumber = `BILL/${currentYear}/${currentMonth}/${setBillNumber}`;
  const validateForm = () => {
    const errors = {};
    const totalReceived = products.reduce(
      (sum, p) => sum + (parseFloat(p.received_now) || 0),
      0
    );
    const totalAvailableQty = products.reduce(
      (sum, p) => sum + (parseFloat(p.available_qty) || 0),
      0
    );
    if (totalReceived === 0 && totalAvailableQty > 0) {
      return { _general: "At least one product must have received quantity." };
    }

    if (totalAvailableQty > 0) {
      products.forEach((product, index) => {
        const received = parseFloat(product.received_now) || 0;

        const batchApplicable = isProductBatchApplicable(product);
        const batches = product.batches || [];

        if (received === 0) {
          errors[`received_${index}`] = "Received quantity is required.";
        } else if (batchApplicable && received > 0) {
          const hasValidBatch = batches.some(
            (b) => b.batch_no && b.manufacture_date && b.expiry_date
          );
          const batchQtySum = batches.reduce((sum, b) => sum + (parseFloat(b.qty) || 0), 0);
  
          if (!hasValidBatch) {
            errors[`batch_${index}`] = "At least one batch (Batch No., Manufacture Date, Expiry Date) is required.";
          } else if (Math.abs(batchQtySum - received) > 0.01) {
            errors[`batch_${index}`] = `Sum of batch quantities (${batchQtySum}) must equal received (${received}).`;
          }
        }
      });
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("products", products);
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      const firstError =
        validationErrors._general || Object.values(validationErrors)[0];
      ErrorMessage(firstError);
      return;
    }
    setError({});
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => {
        const editedProduct = editedProducts[product.id] || {};
        const newBatches = (product.batches || []).map((b) => ({
          batch_no: b.batch_no,
          manufacture_date: b.manufacture_date,
          expiry_date: b.expiry_date,
          quantity: parseFloat(b.qty) || 0,
        }));
        return {
          ...product,
          vendor_id: vendor.vendor_id,
          batches: [...newBatches],
          product_id: editedProduct.product_id || product.product_id,
          variant_id: editedProduct.variant_id || product.variant_id || null,
        };
      });
      // console.log("updatedProducts", updatedProducts);
      const data = {
        purchase_id: id,
        warehouse_id: purchaseData?.warehouse?.id,
        bill_number: billNumber,
        vendor_id: vendor.id ?? null,
        bill_date: new Date().toISOString().split('T')[0],
        bill_reference: billReference,
        // buyer,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        received_status: receivedStatus.value,
      };
      console.log("Vendor", vendor);
      console.log("payload data", data);
      // const response = await PrivateAxios.post(`purchase/recv/${id}`, data);
      // if (response.status === 200) {
      //   SuccessMessage(response.data.message || "Bill Created successfully");
      //   navigate(`/store/recv_update/request-quotation`);
      // } else {
      //   ErrorMessage(response.data.message || "Failed to save data");
      // }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleReceivedStatusChange = (e) => {
    setReceivedStatus({ label: e.label, value: e.value });
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
        } else {
          // Fallback to product data
          const product = products[productIndex];
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
  const getCurrentSelectedVariantId = (productIndex) => {
    if (productIndex === null || !products[productIndex]) return null;
    
    const product = products[productIndex];
    const editedProduct = editedProducts[product.id];
    
    // If variantData is stored in editedProducts (from selection), use it
    if (editedProduct?.variantData) {
      return editedProduct.variantData.id;
    }
    
    // Return original variant if no changes
    return product.variant_id || product.productVariant?.id || null;
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    if (selectedProductIndex === null) return;
    
    const product = products[selectedProductIndex];
    
    // Update editedProducts with the selected variant
    setEditedProducts((prev) => ({
      ...prev,
      [product.id]: {
        ...prev[product.id],
        variant_id: variant.id,
        variantData: variant, // Store variant data for immediate display
      },
    }));
    
    // Update products state to reflect variant change
    setProducts((prev) => {
      const updated = [...prev];
      updated[selectedProductIndex] = {
        ...updated[selectedProductIndex],
        variant_id: variant.id,
        variantData: variant,
      };
      return updated;
    });
    
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

  // Handle product change
  const handleProductChange = (productId, productIndex, selectedOption) => {
    if (!selectedOption) return;
    
    const selectedProduct = selectedOption.productData;
    if (!selectedProduct) return;
    
    const product = products[productIndex];
    
    // Update editedProducts with new product data
    setEditedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        product_id: selectedOption.value,
        variant_id: null, // Reset variant when product changes
        variantData: null, // Reset variant data
        productData: selectedProduct, // Store new product data for display
      },
    }));
    
    // Update products state
    setProducts((prev) => {
      const updated = [...prev];
      updated[productIndex] = {
        ...updated[productIndex],
        product_id: selectedOption.value,
        ProductsItem: selectedProduct, // Update ProductsItem for display
        variant_id: null,
        variantData: null,
      };
      return updated;
    });
    
    // Fetch variants for the new product
    if (selectedOption.value) {
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
    return product.variantData || product.productVariant || null;
  };

  // Show product details modal
  const showProductDetails = (product, productIndex) => {
    const editedProduct = editedProducts[product.id];
    const productDataToShow = editedProduct?.productData || product.ProductsItem;
    const currentVariant = getCurrentVariant(product);
    
    setSelectedProductForDetails({
      product: productDataToShow,
      productIndex,
      poQuantity: product.qty,
      weightPerUnit: currentVariant ? `${currentVariant.weight_per_unit} ${currentVariant.masterUOM?.label || ''}` : 'N/A',
      unitPrice: product.unit_price,
      tax: product.tax,
      variant: currentVariant,
    });
    setShowProductDetailsModal(true);
  };



  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          <Link to="/store/recv_update/request-quotation" className="text-dark ">
            <i className="fas fa-arrow-left me-1" />
            <span className="ms-2 f-s-16">Back</span>
          </Link>
          {/* <Link to="/purchase" className="text-dark ">
            <i className="fas fa-arrow-left me-1" />
            <span className="ms-2 f-s-16">Back</span>
          </Link> */}
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Receive Order</h3>
          </div>

          <form onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Bill Number</label>
                    <input
                      type="text"
                      value={billNumber}
                      placeholder="Bill Number"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                      <VendorSelect
                        value={vendor}
                        isDisabled={true}
                        name="vendor_name"
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                        onChange={(e) => { setVendor(e); }}
                        placeholder="Search and select vendor..."
                        error={error.vendor}
                        onErrorClear={() => setError({ ...error, vendor: "" })}
                      />
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Bill Date </label>
                    <input
                      type="text"
                      readOnly
                      value={moment().format("DD/MM/YYYY")}
                      // onChange={(e) => BillDate(e.target.value)}
                      required
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Bill Reference</label>
                    <input
                      type="text"
                      value={billReference ?? ""}
                      onChange={(e) => setBillReference(e.target.value)}
                      placeholder="Bill Reference"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Store</label>
                    <input
                      type="text"
                      value={purchaseData?.warehouse?.name ?? ""}
                      readOnly
                      placeholder="Store"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Expected Arrival Date</label>
                    <input
                      type="text"
                      value={moment(purchaseData?.expected_arrival).format("DD/MM/YYYY") ?? ""}
                      readOnly
                      placeholder="Expected Arrival Date"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">PO Received Status</label>
                    <Select
                      name="received_status"
                      value={receivedStatus}
                      options={[{ label: "Pending", value: "pending" }, { label: "Completed", value: "completed" }]}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      onChange={(e) => handleReceivedStatusChange(e)}
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary25: "#ddddff",
                          primary: "#6161ff",
                        },
                      })}
                    />
                  </div>
                </div>

              </div>

              {/* Previous received products */}
              {purchaseData?.recv && Array.isArray(purchaseData.recv) && purchaseData.recv.length > 0 && (
                <div className="col-12 mt-4 mb-3">
                  <h5 className="mb-3">Previous received</h5>
                  {purchaseData.recv.map((rec, idx) => (
                    <div key={rec.id || idx} className="card mb-3 shadow-sm">
                      <div className="card-header py-3 px-3 bg-light">
                        <div className="row g-3 align-items-center" style={{ fontSize: "15px" }}>
                          <div className="col-md-4 col-12">
                            <span className="text-muted d-block mb-0" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bill No.</span>
                            <span className="fw-medium">{rec.bill_number ?? "—"}</span>
                          </div>
                          <div className="col-md-4 col-12">
                            <span className="text-muted d-block mb-0" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Received By</span>
                            <span className="fw-medium">{rec.receivedBy?.name ?? "—"}</span>
                          </div>
                          <div className="col-md-4 col-12">
                            <span className="text-muted d-block mb-0" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Received On</span>
                            <span className="fw-medium">{rec.bill_date ? moment(rec.bill_date).format("DD/MM/YYYY") : "—"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <Table responsive bordered size="sm" className="mb-0 primary-table-head">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Product Code</th>
                              <th>Received Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(rec.receivedProducts) && rec.receivedProducts.length > 0 ? (
                              rec.receivedProducts.map((rp) => (
                                <tr key={rp.id}>
                                  <td>{rp.product?.product_name ?? "—"}</td>
                                  <td>{rp.product?.product_code ?? "—"}</td>
                                  <td>{rp.qty ?? 0}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="text-muted">No products</td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="col-12 mt-4">
                <div className="w-100">
                  <ul class="nav nav-tabs gth-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link active"
                        id="personal-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#personal"
                        type="button"
                        role="tab"
                        aria-controls="personal"
                        aria-selected="true"
                      >
                        Products
                      </button>
                    </li>
                  </ul>
                  <div class="tab-content" id="myTabContent">
                    <div
                      class="tab-pane fade show active pt-3"
                      id="personal"
                      role="tabpanel"
                      aria-labelledby="personal-tab"
                    >
                      {alert && <Alert variant="danger">{alert}</Alert>}
                      <div className="compare_price_view_table mb-3">
                        <Table responsive className="table-bordered primary-table-head">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>PO Quantity</th>
                              <th>Balance Quantity</th>
                              <th>Receive Quantity</th>
                              <th>Weight per unit</th>
                              <th>Unit Price</th>
                              <th>Tax (%)</th>
                              <th>Total</th>
                              <th style={{ width: "210px" }}>Batches</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product, index) => {
                              const editedProduct = editedProducts[product.id];
                              const productDataToShow = editedProduct?.productData || product.ProductsItem;
                              const isProductReceived = (product.received || 0) > 0;
                              
                              return (
                              <React.Fragment key={index}>
                              <tr>
                                <td>
                                  <div style={{ minWidth: "280px" }} className="d-flex align-items-center gap-2">
                                    <div style={{ flex: 1 }}>
                                      <ProductSelect
                                        value={product.product_id}
                                        onChange={(selectedOption) => handleProductChange(product.id, index, selectedOption)}
                                        placeholder="Search and select product..."
                                        isClearable={false}
                                        isDisabled={isProductReceived}
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
                                    {productDataToShow && (
                                      <Tooltip title="View Product Details">
                                        <span
                                          role="button"
                                          tabIndex={0}
                                          className="text-primary"
                                          style={{ cursor: "pointer", flexShrink: 0 }}
                                          title="View product details"
                                          onClick={() => showProductDetails(product, index)}
                                          onKeyDown={(e) => e.key === "Enter" && showProductDetails(product, index)}
                                        >
                                          <i className="fas fa-info-circle fa-lg"></i>
                                        </span>
                                      </Tooltip>
                                    )}
                                  </div>
                                </td>

                                <td>
                                  <div className="min-width-100">
                                    <input
                                      type="number"
                                      name="qty"
                                      disabled
                                      value={product.qty || 0}
                                      // onChange={(e) =>
                                      //   handleProductChange(
                                      //     index,
                                      //     "qty",
                                      //     e.target.value
                                      //   )
                                      // }
                                      className="form-control"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="min-width-100">
                                    <input
                                      type="number"
                                      name="available_qty"
                                      disabled
                                      value={product.available_qty || 0}
                                      // onChange={(e) =>
                                      //   handleProductChange(
                                      //     index,
                                      //     "available_qty",
                                      //     e.target.value
                                      //   )
                                      // }
                                      className="form-control"
                                    />
                                  </div>

                                </td>
                                <td>
                                  <div className="min-width-100">
                                    <input
                                      type="number"
                                      name="received_now"
                                      min="0"
                                      value={product.received_now || 0}
                                      onChange={(e) =>
                                        handleProductQuantityChange(
                                          index,
                                          "received_now",
                                          e.target.value
                                        )
                                      }
                                      className={`form-control ${error[`received_${index}`] ? "is-invalid" : ""}`}
                                    />
                                    {error[`received_${index}`] && (
                                      <div className="invalid-feedback d-block small">
                                        {error[`received_${index}`]}
                                      </div>
                                    )}
                                  </div>
                                </td>
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
                                    {!isProductReceived && (
                                      <div 
                                        className="btn-sm cursor-pointer"
                                        onClick={() => {
                                          const editedProduct = editedProducts[product.id];
                                          const productIdToUse = editedProduct?.product_id || product.product_id;
                                          fetchProductVariants(productIdToUse, index);
                                        }}
                                        title="Click to change variant"
                                      >
                                        <i className="fas fa-edit" style={{ color: "#007bff" }}></i>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>{product.unit_price || 0}</td>
                                <td>{product.tax || 0}%</td>
                                <td>{product.taxIncl || 0}</td>
                                <td className="align-middle" style={{ whiteSpace: "nowrap" }}>
                                  {isProductBatchApplicable(product) ? (
                                  <div className="d-flex align-items-center gap-1 flex-wrap">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() =>
                                        setExpandedBatchIndex(
                                          expandedBatchIndex === index ? null : index
                                        )
                                      }
                                      style={{ fontSize: "0.875rem", padding: "0.25rem 0.5rem" }}
                                    >
                                      <i className={`fas fa-chevron-${expandedBatchIndex === index ? "up" : "down"} me-1`}></i>
                                      Manage Batches
                                      {(product.batches || []).length > 0 && (
                                        <span className="badge bg-primary ms-1" style={{ fontSize: "0.7rem", padding: "0.15rem 0.35rem" }}>
                                          {(product.batches || []).length}
                                        </span>
                                      )}
                                    </button>
                                    {(product.existingBatches || []).length > 0 && (
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        className="text-primary d-inline-flex align-items-center"
                                        style={{ cursor: "pointer", fontSize: "0.875rem" }}
                                        title="View existing batches"
                                        onClick={() => setExistingBatchesModalIndex(index)}
                                        onKeyDown={(e) => e.key === "Enter" && setExistingBatchesModalIndex(index)}
                                      >
                                        <i className="fas fa-list-alt me-1"></i>
                                        <span className="badge bg-secondary" style={{ fontSize: "0.7rem", padding: "0.15rem 0.35rem", minWidth: "auto" }}>
                                          {(product.existingBatches || []).length}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                  ) : (
                                    <span className="badge bg-secondary" style={{ fontSize: "0.7rem", padding: "0.15rem 0.35rem", minWidth: "auto" }}>
                                      N/A
                                    </span>
                                  )}
                                </td>
                             
                              </tr>
                              {expandedBatchIndex === index && (
                                <tr key={`batch-${index}`}>
                                  <td 
                                  colSpan="9" 
                                  className="p-0 bg-light"
                                  >
                                    <div className="p-3">
                                      <p className="small text-muted mb-2">
                                        Add new batch entries. Sum of batch quantities must equal Receive Quantity ({product.received ?? 0}). Existing batches are read-only (view via icon above).
                                      </p>
                                      {(product.batches || []).length === 0 ? (
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-primary"
                                          onClick={() => addBatch(index)}
                                        >
                                          <i className="fas fa-plus me-1"></i>Add Batch
                                        </button>
                                      ) : (
                                        <>
                                          <div className="table-responsive mb-2">
                                            <table className="table table-sm table-bordered">
                                              <thead>
                                                <tr>
                                                  <th>Batch No.</th>
                                                  <th>Manufacture Date</th>
                                                  <th>Expiry Date</th>
                                                  <th style={{ width: "200px" }}>Qty</th>
                                                  <th style={{ width: "50px" }}></th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {(product.batches || []).map((batch, batchIdx) => (
                                                  <tr key={batchIdx}>
                                                    <td>
                                                      <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={batch.batch_no || ""}
                                                        onChange={(e) =>
                                                          handleBatchChange(
                                                            index,
                                                            batchIdx,
                                                            "batch_no",
                                                            e.target.value
                                                          )
                                                        }
                                                        placeholder="Batch No."
                                                      />
                                                    </td>
                                                    <td>
                                                      <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={batch.manufacture_date || ""}
                                                        onChange={(e) =>
                                                          handleBatchChange(
                                                            index,
                                                            batchIdx,
                                                            "manufacture_date",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </td>
                                                    <td>
                                                      <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={batch.expiry_date || ""}
                                                        onChange={(e) =>
                                                          handleBatchChange(
                                                            index,
                                                            batchIdx,
                                                            "expiry_date",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </td>
                                                    <td>
                                                      <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        min="0"
                                                        value={batch.qty || ""}
                                                        onChange={(e) =>
                                                          handleBatchChange(
                                                            index,
                                                            batchIdx,
                                                            "qty",
                                                            e.target.value
                                                          )
                                                        }
                                                        placeholder="0"
                                                      />
                                                    </td>
                                                    <td>
                                                      <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeBatch(index, batchIdx)}
                                                      >
                                                        <i className="fas fa-times"></i>
                                                      </button>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                          <div className="d-flex gap-2">
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-primary"
                                              onClick={() => addBatch(index)}
                                            >
                                              <i className="fas fa-plus me-1"></i>Add Batch
                                            </button>
                                            <span className="align-self-center small text-muted">
                                              Sum: {(product.batches || []).reduce(
                                                (s, b) => s + (parseFloat(b.qty) || 0),
                                                0
                                              )} / {product.received_now || 0}
                                            </span>
                                            {error[`batch_${index}`] && (
                                              <span className="text-danger small align-self-center">
                                                {error[`batch_${index}`]}
                                              </span>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                              </React.Fragment>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      <div className="col-12 text-right">
                        {/* <p>
                        Untaxed Amount: ₹
                        {calculateTotal().untaxedAmount.toFixed(2)}
                      </p>
                      <p>SGST: ₹{calculateTotal().taxAmount.toFixed(2)}</p>
                      <p>CGST: ₹{calculateTotal().taxAmount.toFixed(2)}</p>
                      <h5 className="mb-4">Total: ₹{calculateTotal().totalAmount.toFixed(2)}</h5> */}

                        {/* <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">Sub Total : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1">₹
                            {calculateTotal().untaxedAmount.toFixed(2)}</span></p>
                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">SGST : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1">  ₹{calculateTotal().taxAmount.toFixed(2)}</span></p>
                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">CGST : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1"> ₹{calculateTotal().taxAmount.toFixed(2)}</span></p>

                        <hr />

                        <h5 className="fw-bold f-s-20 text-primary-grey-1">
                          Total: ₹{calculateTotal().totalAmount.toFixed(2)}
                        </h5> */}

                        {/* <h5>
                        Advance Payment : ₹{" "}
                        {advancePayment != null
                          ? advancePayment.amount
                          : "0.00"}
                      </h5> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="card-footer text-end">
              <button className="btn btn-success" type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Existing Batches Modal (read-only) */}
      <Modal
        show={existingBatchesModalIndex != null}
        onHide={() => setExistingBatchesModalIndex(null)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-list-alt me-2"></i>
            Received Batches
            {existingBatchesModalIndex != null && products[existingBatchesModalIndex] && (
              <span className="text-muted fw-normal fs-6 ms-2">
                — {products[existingBatchesModalIndex].ProductsItem?.product_name ?? ""} ({products[existingBatchesModalIndex].ProductsItem?.product_code ?? ""})
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {existingBatchesModalIndex != null && products[existingBatchesModalIndex] && (
            <p className="ms-3 text-muted mb-3">
              Previously received batches for this PO.
            </p>
          )}
          {existingBatchesModalIndex != null && products[existingBatchesModalIndex] && (
            <Table responsive bordered size="md">
              <thead>
                <tr>
                  <th>Batch No.</th>
                  <th>Manufacture Date</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {((products[existingBatchesModalIndex]?.existingBatches) || []).map((batch, idx) => (
                  <tr key={batch.id ?? idx}>
                    <td>{batch.batch_no ?? "—"}</td>
                    <td>{batch.manufacture_date ? moment(batch.manufacture_date).format("DD/MM/YYYY") : "—"}</td>
                    <td>{batch.expiry_date ? moment(batch.expiry_date).format("DD/MM/YYYY") : "—"}</td>
                    <td>{batch.quantity ?? batch.qty ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setExistingBatchesModalIndex(null)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        show={showProductDetailsModal}
        onHide={() => setShowProductDetailsModal(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-info-circle text-primary me-2"></i>
            Product Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProductForDetails && (
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Product Code</label>
                    <p className="fw-medium mb-0">{selectedProductForDetails.product?.product_code || 'N/A'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Product Name</label>
                    <p className="fw-medium mb-0">{selectedProductForDetails.product?.product_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">PO Quantity</label>
                    <p className="fw-medium mb-0">{selectedProductForDetails.poQuantity || 0}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Weight per Unit</label>
                    <p className="fw-medium mb-0">{selectedProductForDetails.weightPerUnit}</p>
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Unit Price</label>
                    <p className="fw-medium mb-0">{selectedProductForDetails.unitPrice || 0}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Tax (%)</label>
                    <p className="fw-medium mb-0">{selectedProductForDetails.tax || 0}%</p>
                  </div>
                </div>
              </div>
              {selectedProductForDetails.product && (
                <div className="mt-3 pt-3 border-top">
                  <ProductDetailsContent productData={selectedProductForDetails.product} />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowProductDetailsModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
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
                      const currentSelectedVariantId = getCurrentSelectedVariantId(selectedProductIndex);
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

export default PurchaseOrderRecv;
