import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table, Alert, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import {
  // AllUser,
  // AllCategories,
  // GetTaskRemainder,
  formatDateTimeForMySQL,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
} from "../../environment/AxiosInstance";
import AdvancedProductSelector from "./AdvancedProductSelector";
import StoreSelect from "../filterComponents/StoreSelect";
import VendorSelect from "../filterComponents/VendorSelect";
import ProductSelect from "../filterComponents/ProductSelect";
import ProductDetailsContent from "../CommonComponent/ProductDetailsContent";
import SalesQuotationSelect from "../filterComponents/SalesQuotationSelect";
// import { DropDownList } from "@progress/kendo-react-dropdowns";

function MyNewpurchase() {

  const calculateTotal = () => {
    let untaxedAmount = 0;
    let totalTaxAmount = 0;

    products.forEach((product) => {
      const qty = parseFloat(product.qty) || 0;
      const unitPrice = parseFloat(product.unit_price) || 0;
      const taxRate = parseFloat(product.tax) || 0;

      const lineSubtotal = qty * unitPrice;
      const lineTax = (lineSubtotal * taxRate) / 100;

      untaxedAmount += lineSubtotal;
      totalTaxAmount += lineTax;
    });

    const sgst = totalTaxAmount / 2;
    // const cgst = totalTaxAmount / 2;
    const totalAmount = untaxedAmount + totalTaxAmount;

    return {
      untaxedAmount,
      taxAmount: sgst,
      totalAmount,
    };
  };

  const handleClick = () => {
    ErrorMessage("Please add primary vendor data first.");
  };
  // Set reminder
  const { getGeneralSettingssymbol } = UserAuth();
  // const [isCheckedReminder, setIsCheckedReminder] = useState(false);
  // const [isFileRequired, setIsFileRequired] = useState(false);
  // const [error, setError] = useState({});

  const [show, setShow] = useState(false);

  // const [catProduct, setcategory] = useState([
  //   { value: "select", label: "-Select-" },
  // ]);
  const [products, setProducts] = useState([
    {
      product_id: "",
      description: "",
      qty: 1,
      unit_price: 0,
      tax: 18,
      taxExcl: 0,
      vendor_id: "",
      productData: null,
      variant_id: null,
    },
  ]);

  // const [purchaseName, setPurchaseName] = useState("");
  const [vendorId, setVendorId] = useState({
    vendor_id: "",
  });

  const navigate = useNavigate();
  const [expectedArrival, setExpectedArrival] = useState("");
  // const [buyer, setBuyer] = useState(userDetails.name);
  const [alert, setAlert] = useState("");
  const [error, setError] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  
  // Variant selection state
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Handle product selection from Advanced Product Selector
  const handleProductSelectFromAdvanced = (selectedProduct) => {
    if (selectedProduct && selectedProduct.productData) {
      const productData = selectedProduct.productData;
      const productIndex = products.length === 1 && products[0].product_id === "" ? 0 : products.length;
      
      // Fetch variants for the selected product
      fetchProductVariants(selectedProduct.value, productIndex, productData);
      setShowProductSelector(false);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];

    // if (field === "product_id") {
    //   const selectedProduct = productData.find((p) => p.id === value);
    //   if (selectedProduct) {
    //     newProducts[index] = {
    //       ...newProducts[index],
    //       product_id: value,
    //       unit_price: selectedProduct.regular_buying_price || 0,
    //       tax: selectedProduct.tax || 0,
        
    //     };
    //   }
    // } else {
      newProducts[index][field] = value;
    // }

    const qty = parseFloat(newProducts[index].qty) || 0;
    const unitPrice = parseFloat(newProducts[index].unit_price) || 0;
    const taxRate = parseFloat(newProducts[index].tax) || 0;

    const taxExcl = qty * unitPrice;
    const taxAmount = (taxExcl * taxRate) / 100;
    const taxIncl = taxExcl + taxAmount;

    newProducts[index].taxExcl = taxExcl;
    newProducts[index].taxAmount = taxAmount;
    newProducts[index].taxIncl = taxIncl;
    newProducts[index].vendor_id = vendorId.vendor_id;

    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        product_id: "",
        description: "",
        qty: 1,
        unit_price: 0,
        tax: 18,
        productData: null,
        variant_id: null,
      },
    ]);
  };

  // Fetch product variants
  const fetchProductVariants = async (productId, productIndex, productData) => {
    try {
      setLoadingVariants(true);
      const response = await PrivateAxios.get(`product/variants/${productId}`);
      
      if (response.data && response.data.status && response.data.data) {
        const variants = response.data.data.variants || [];
        
        if (variants.length > 0) {
          // Variants found - show modal for selection
          setProductVariants(variants);
          setSelectedProductInfo(response.data.data.product);
          setCurrentProductIndex(productIndex);
          
          // Temporarily set product data (will be finalized after variant selection)
          const newProducts = [...products];
          newProducts[productIndex] = {
            ...newProducts[productIndex],
            product_id: productId,
            description: productData?.product_name || "",
            unit_price: productData?.regular_buying_price || 0,
            tax: productData?.tax || 18,
            productData: productData,
            variant_id: null, // Will be set after selection
          };
          
          // Calculate initial tax amounts
          const qty = parseFloat(newProducts[productIndex].qty) || 0;
          const unitPrice = parseFloat(newProducts[productIndex].unit_price) || 0;
          const taxRate = parseFloat(newProducts[productIndex].tax) || 0;
          
          const taxExcl = qty * unitPrice;
          const taxAmount = (taxExcl * taxRate) / 100;
          const taxIncl = taxExcl + taxAmount;
          
          newProducts[productIndex].taxExcl = taxExcl;
          newProducts[productIndex].taxAmount = taxAmount;
          newProducts[productIndex].taxIncl = taxIncl;
          newProducts[productIndex].vendor_id = vendorId.vendor_id;
          
          setProducts(newProducts);
          setShowVariantModal(true);
        } else {
          // No variants found - proceed without variant selection
          const newProducts = [...products];
          newProducts[productIndex] = {
            ...newProducts[productIndex],
            product_id: productId,
            description: productData?.product_name || "",
            unit_price: productData?.regular_buying_price || 0,
            tax: productData?.tax || 18,
            productData: productData,
            variant_id: null,
          };
          
          // Calculate tax amounts
          const qty = parseFloat(newProducts[productIndex].qty) || 0;
          const unitPrice = parseFloat(newProducts[productIndex].unit_price) || 0;
          const taxRate = parseFloat(newProducts[productIndex].tax) || 0;
          
          const taxExcl = qty * unitPrice;
          const taxAmount = (taxExcl * taxRate) / 100;
          const taxIncl = taxExcl + taxAmount;
          
          newProducts[productIndex].taxExcl = taxExcl;
          newProducts[productIndex].taxAmount = taxAmount;
          newProducts[productIndex].taxIncl = taxIncl;
          newProducts[productIndex].vendor_id = vendorId.vendor_id;
          
          setProducts(newProducts);
        }
      } else {
        // Invalid response - proceed without variant selection
        const newProducts = [...products];
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          product_id: productId,
          description: productData?.product_name || "",
          unit_price: productData?.regular_buying_price || 0,
          tax: productData?.tax || 18,
          productData: productData,
          variant_id: null,
        };
        
        // Calculate tax amounts
        const qty = parseFloat(newProducts[productIndex].qty) || 0;
        const unitPrice = parseFloat(newProducts[productIndex].unit_price) || 0;
        const taxRate = parseFloat(newProducts[productIndex].tax) || 0;
        
        const taxExcl = qty * unitPrice;
        const taxAmount = (taxExcl * taxRate) / 100;
        const taxIncl = taxExcl + taxAmount;
        
        newProducts[productIndex].taxExcl = taxExcl;
        newProducts[productIndex].taxAmount = taxAmount;
        newProducts[productIndex].taxIncl = taxIncl;
        newProducts[productIndex].vendor_id = vendorId.vendor_id;
        
        setProducts(newProducts);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      ErrorMessage("Failed to fetch product variants");
      // Proceed without variant selection on error
      const newProducts = [...products];
      newProducts[productIndex] = {
        ...newProducts[productIndex],
        product_id: productId,
        description: productData?.product_name || "",
        unit_price: productData?.regular_buying_price || 0,
        tax: productData?.tax || 18,
        productData: productData,
        variant_id: null,
      };
      
      // Calculate tax amounts
      const qty = parseFloat(newProducts[productIndex].qty) || 0;
      const unitPrice = parseFloat(newProducts[productIndex].unit_price) || 0;
      const taxRate = parseFloat(newProducts[productIndex].tax) || 0;
      
      const taxExcl = qty * unitPrice;
      const taxAmount = (taxExcl * taxRate) / 100;
      const taxIncl = taxExcl + taxAmount;
      
      newProducts[productIndex].taxExcl = taxExcl;
      newProducts[productIndex].taxAmount = taxAmount;
      newProducts[productIndex].taxIncl = taxIncl;
      newProducts[productIndex].vendor_id = vendorId.vendor_id;
      
      setProducts(newProducts);
    } finally {
      setLoadingVariants(false);
    }
  };

  // Get current selected variant ID for highlighting
  const getCurrentSelectedVariantId = () => {
    if (currentProductIndex === null || !products || products.length === 0) return null;
    
    const product = products[currentProductIndex];
    return product?.variant_id || null;
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    if (currentProductIndex !== null) {
      const newProducts = [...products];
      const productData = newProducts[currentProductIndex].productData;
      
      // Update product with variant information
      newProducts[currentProductIndex] = {
        ...newProducts[currentProductIndex],
        product_id: productData?.id || newProducts[currentProductIndex].product_id,
        description: productData?.product_name || newProducts[currentProductIndex].description,
        unit_price: productData?.regular_buying_price || newProducts[currentProductIndex].unit_price,
        tax: productData?.tax || newProducts[currentProductIndex].tax,
        variant_id: variant.id,
        variantData: variant,
        vendor_id: vendorId.vendor_id,
      };
      
      // Recalculate tax amounts
      const qty = parseFloat(newProducts[currentProductIndex].qty) || 0;
      const unitPrice = parseFloat(newProducts[currentProductIndex].unit_price) || 0;
      const taxRate = parseFloat(newProducts[currentProductIndex].tax) || 0;
      
      const taxExcl = qty * unitPrice;
      const taxAmount = (taxExcl * taxRate) / 100;
      const taxIncl = taxExcl + taxAmount;
      
      newProducts[currentProductIndex].taxExcl = taxExcl;
      newProducts[currentProductIndex].taxAmount = taxAmount;
      newProducts[currentProductIndex].taxIncl = taxIncl;
      
      setProducts(newProducts);
    }
    setShowVariantModal(false);
    setProductVariants([]);
    setSelectedProductInfo(null);
    setCurrentProductIndex(null);
  };

  // Handle variant modal close without selection
  const handleVariantModalClose = () => {
    // If user closes without selecting, clear the product selection
    if (currentProductIndex !== null) {
      const newProducts = [...products];
      newProducts[currentProductIndex] = {
        ...newProducts[currentProductIndex],
        product_id: "",
        productData: null,
        variant_id: null,
      };
      setProducts(newProducts);
    }
    setShowVariantModal(false);
    setProductVariants([]);
    setSelectedProductInfo(null);
    setCurrentProductIndex(null);
  };

  const removeProduct = (index) => {
    if (products.length === 1) {
      setAlert("You cannot delete the last item.");
      return;
    }
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handlePurchaseOrderChange = (selectedOption) => {
    setError({ ...error, deliveryLocation: "" });
    setDeliveryLocation(selectedOption);
  };

  // validate form
  const validateForm = () => {
    // reset error
    setError({});

    // validate vendor
    if (vendorId.vendor_id === "") {
      setError({ ...error, vendor: "Please select a vendor." });
      return false;
    }

    // Validate delivery location
    if (!deliveryLocation || deliveryLocation.value === "") {
      setError({ ...error, deliveryLocation: "Please select a delivery location." });
      return false;
    }

    // validate expected arrival
    if (expectedArrival === "") {
      setError({ ...error, expectedArrival: "Please select a expected arrival date and time." });
      return false;
    }

    // validate products
    const validProducts = products.filter(p => p.product_id);
    if (validProducts.length === 0) {
      setError({ ...error, products: "Please add at least one product to the request for quotation." });
      return false;
    }
    
    // Note: Variant selection is handled in the modal flow
    // If a product has variants available, the user must select one before proceeding
    // If no variants are available, the product can proceed without a variant
    
    return true;
  };
  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        return;
      }
      const { untaxedAmount, totalAmount } = calculateTotal();

      const productsData = [];
      products.forEach(product => {
        productsData.push({
          product_id: product.product_id,
          product_variant_id: product.variantData.id,
          description: product.description,
          qty: product.qty,
          unit_price: product.unit_price,
          tax: product.tax,
        });
      });

      const data = {
        // purchase_name: purchaseName,
        vendor_id: vendorId.vendor_id,
        is_parent_id: '0',
        is_parent: '1',
        expected_arrival: formatDateTimeForMySQL(expectedArrival),
        products: productsData,
        untaxed_amount: untaxedAmount.toFixed(2),
        warehouse_id: deliveryLocation.value,
        ...(selectedQuotation && { sales_quotation_id: selectedQuotation.id }),
        // sgst: taxAmount.toFixed(2),
        // cgst: taxAmount.toFixed(2),
        // TaxAmt: (taxAmount * 2).toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };

      const response = await PrivateAxios.post("purchase/add", data);

      if (response.status === 201) {
        SuccessMessage("Data saved successfully");
        navigate("/operation/create-rfq-active");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          {/* <Link to="/operation/create-rfq-active" className="text-dark">
            <i class="fas fa-arrow-left me-1" />
            <span class="ms-2 f-s-16">Back</span>
          </Link> */}
          <button
            type="button"
            className="link-btn text-dark"
            onClick={() => navigate(-1)} // Navigate back in history
          >
            <i className="fas fa-arrow-left me-1" />
            <span className="ms-2 f-s-16">Back</span>
          </button>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Create New Purchase Order</h3>
          </div>

          <form onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <div className="custom-select-wrap">
                      <VendorSelect
                        value={selectedVendor}
                        onChange={(e) => {
                          setVendorId({ ...vendorId, vendor_id: e?.id ?? "" });
                          setError({ ...error, vendor: "" });
                          setSelectedVendor(e);
                        }}
                        placeholder="Search and select vendor..."
                        error={error.vendor}
                        onErrorClear={() => setError({ ...error, vendor: "" })}
                      />
                      {error?.vendor && <div className="text-danger f-s-14">{error.vendor}</div>}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Delivery Location</label>
                    <div className="custom-select-wrap">
                      <StoreSelect
                        value={deliveryLocation}
                        onChange={(selectedOption) => {
                          handlePurchaseOrderChange(selectedOption);
                        }}
                        error={error.purchaseOrder}
                        onErrorClear={() => setError({ ...error, purchaseOrder: "" })}
                        placeholder="Select Store"
                      />
                      {error?.deliveryLocation && <div className="text-danger f-s-14">{error.deliveryLocation}</div>}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Expected Arrival</label>
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={expectedArrival}
                        onChange={(date) => {
                          setExpectedArrival(date);
                          setError({ ...error, expectedArrival: "" });
                        }}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select Date"
                      />
                    </div>
                    {error?.expectedArrival && <div className="text-danger f-s-14">{error.expectedArrival}</div>}

                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Sell Order No.</label>
                    <div className="custom-select-wrap">
                      <SalesQuotationSelect
                        value={selectedQuotation}
                        onChange={(selectedOption) => {
                          setSelectedQuotation(selectedOption);
                          setError({ ...error, sellOrderNo: "" });
                        }}
                        placeholder="Search and select sales quotation..."
                        error={error.sellOrderNo}
                        onErrorClear={() => setError({ ...error, sellOrderNo: "" })}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "38px",
                            borderColor: error.sellOrderNo ? "#ff4d4f" : base.borderColor,
                          }),
                        }}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                      />
                      {error?.sellOrderNo && <div className="text-danger f-s-14">{error.sellOrderNo}</div>}
                    </div>
                  </div>
                </div>

                {/* Vendor Details Display */}
                {selectedVendor && (
                  <div className="col-12 mt-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Selected Vendor Details</h6>
                        <div className="row">
                          <div className="col-lg-3 col-md-3 col-sm-3 col-12">
                            <p className="mb-1"><strong>Name:</strong> {selectedVendor.vendor_name || "N/A"}</p>
                          </div>
                          <div className="col-lg-3 col-md-3 col-sm-3 col-12">
                            <p className="mb-1"><strong>Email:</strong> {selectedVendor.email || "N/A"}</p>
                          </div>
                          <div className="col-lg-3 col-md-3 col-sm-3 col-12">
                            <p className="mb-1"><strong>Phone:</strong> {selectedVendor.mobile || "N/A"}</p>
                          </div>
                          <div className="col-lg-3 col-md-3 col-sm-3 col-12">
                            <p className="mb-1"><strong>Address:</strong> {selectedVendor.address || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
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
                      {/* <li class="nav-item" role="presentation">
                        <button
                          class="nav-link"
                          id="employment-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#employment"
                          type="button"
                          role="tab"
                          aria-controls="employment"
                          aria-selected="false"
                        >
                          Alternative
                        </button>
                      </li> */}
                    </ul>
                    <div class="tab-content" id="myTabContent">
                      <div
                        class="tab-pane fade show active pt-3"
                        id="personal"
                        role="tabpanel"
                        aria-labelledby="personal-tab">
                        {/* <div className="product_table"> */}
                        {alert && <Alert variant="danger">{alert}</Alert>}
                        <div className="">
                          <Table responsive className="table text-nowrap table-bordered primary-table-head">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Taxes (%)</th>
                                <th>Tax Excl.</th>
                                <th>Tax Amt.</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.map((product, index) => (
                                <tr key={index}>
                                  <td>
                                    <div style={{ minWidth: "350px" }} className="d-flex align-items-center gap-2">
                                      <div style={{ flex: 1 }}>
                                        <ProductSelect
                                          value={product.product_id}
                                          onChange={(selectedOption) => {
                                            if (selectedOption) {
                                              const selectedProduct = selectedOption.productData;
                                              // Fetch variants for the selected product
                                              fetchProductVariants(selectedOption.value, index, selectedProduct);
                                            } else {
                                              // Handle clear selection
                                              const newProducts = [...products];
                                              newProducts[index] = {
                                                ...newProducts[index],
                                                product_id: "",
                                                unit_price: 0,
                                                tax: 18,
                                                productData: null,
                                                variant_id: null,
                                                variantData: null,
                                              };
                                              setProducts(newProducts);
                                            }
                                          }}
                                          styles={{
                                            control: (base, state) => ({
                                              ...base,
                                              minHeight: "38px",
                                            }),
                                          }}
                                        />
                                        {product.variant_id && product.variantData && (
                                          <div className="mt-1">
                                            <small className="text-muted">
                                              <i className="fas fa-tag me-1"></i>
                                              Variant: {product.variantData.masterUOM?.name || "N/A"}
                                              {product.variantData.masterUOM?.label && (
                                                <span className="ms-1">({product.variantData.masterUOM.label})</span>
                                              )}
                                              {product.variantData.weight_per_unit && (
                                                <span className="ms-2">
                                                  • Weight: {product.variantData.weight_per_unit}
                                                </span>
                                              )}
                                            </small>
                                          </div>
                                        )}
                                      </div>
                                      {product.product_id && product.productData && (
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
                                            <Popover id={`product-details-${index}`} style={{ maxWidth: "450px", zIndex: 1050 }}>
                                              <Popover.Header as="h6" className="d-flex align-items-center">
                                                <i className="fas fa-info-circle text-primary me-2"></i>
                                                Product Details
                                              </Popover.Header>
                                              <Popover.Body style={{ maxHeight: "500px", overflowY: "auto", padding: "12px" }}>
                                                <ProductDetailsContent
                                                  productData={product.productData}
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
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "200px" }}>
                                      <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Description"
                                        value={product.description}
                                        onChange={(e) =>
                                          handleProductChange(
                                            index,
                                            "description",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "100px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.qty}
                                        onChange={(e) =>
                                          handleProductChange(
                                            index,
                                            "qty",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "100px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.unit_price}
                                        onChange={(e) =>
                                          handleProductChange(
                                            index,
                                            "unit_price",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "100px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.tax}
                                        onChange={(e) =>
                                          handleProductChange(
                                            index,
                                            "tax",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "100px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.unit_price * product.qty}
                                        disabled
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "100px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.taxAmount?.toFixed(2) || 0}
                                        disabled
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "80px" }}>
                                      <i
                                        class="fas fa-trash-alt text-danger"
                                        onClick={() => removeProduct(index)}
                                        style={{ cursor: "pointer" }}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        {/* </div> */}

                        <div className="d-flex gap-2 mt-2">
                          <button type='button' className="btn btn-outline-primary btn-sm" onClick={addProduct}>
                            <i class="fas fa-plus"></i>
                            <span class="ms-2"> Add Product</span>
                          </button>
                          <button 
                            type='button' 
                            className="btn btn-outline-info btn-sm" 
                            onClick={() => setShowProductSelector(true)}
                            title="Try new multi-select product selector"
                          >
                            <i class="fas fa-filter"></i>
                            <span class="ms-2"> Advanced Product Selector</span>
                          </button>
                        </div>
                        <div className="col-12 text-right">
                          <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">Subtotal : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-1">{getGeneralSettingssymbol}
                              {calculateTotal().untaxedAmount.toFixed(2)}</span></p>
                          <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">SGST : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().taxAmount.toFixed(2)}</span></p>
                          <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">CGST : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().taxAmount.toFixed(2)}</span></p>
                          <p className="border-top pt-2"><span className="f-s-20 fw-bold text-primary-grey-2">Total : </span>
                            <span className="fw-bold f-s-20 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().totalAmount.toFixed(2)}</span>
                          </p>


                          {/* <p>
                          Untaxed Amount: {getGeneralSettingssymbol}
                          {calculateTotal().untaxedAmount.toFixed(2)}
                        </p>
                        <p>SGST: {getGeneralSettingssymbol}{calculateTotal().taxAmount.toFixed(2)}</p>
                        <p>CGST: {getGeneralSettingssymbol}{calculateTotal().taxAmount.toFixed(2)}</p>
                        <h5 className="mb-4">
                          Total: {getGeneralSettingssymbol}{calculateTotal().totalAmount.toFixed(2)}
                        </h5> */}
                        </div>
                      </div>

                      <div
                        class="tab-pane fade"
                        id="employment"
                        role="tabpanel"
                        aria-labelledby="employment-tab"
                      >
                        <div className="row p-3">
                          <div className="col-12">
                            Create a call for tender by adding alternative requests for
                            quotation to different vendors. Make your choice by
                            selecting the best combination of lead time, OTD and/or
                            total amount. By comparing product lines you can also decide
                            to order some products from one vendor and others from
                            another vendor.
                          </div>
                          <div className="col-12 my-4">
                            <button type="button" class="btn btn-outline-primary btn-sm" onClick={() => setShow(true)}>
                              <i class="fas fa-plus"></i>
                              <span class="ms-2"> Create Alternative</span>

                            </button>

                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                  {/* <div
                    class="tab-pane fade"
                    id="employment"
                    role="tabpanel"
                    aria-labelledby="employment-tab"
                  >
                    <div className="row p-3">
                      <div className="col-6">
                        Create a call for tender by adding alternative requests for
                        quotation to different vendors. Make your choice by
                        selecting the best combination of lead time, OTD and/or
                        total amount. By comparing product lines you can also decide
                        to order some products from one vendor and others from
                        another vendor.
                      </div>
                      <div className="col-6">
                        <button type="button" class="btn btn-exp-green" onClick={() => setShow(true)}>
                          Create Alternative
                        </button>

                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-end">
            {error?.products && <div className="text-danger f-s-14" style={{ marginTop: "7px",
    marginRight: "7px" }}>{error.products}</div>}

              <button type="reset" class="btn btn-exp-light me-2">
                Reset
              </button>
              <button type="submit" class="btn btn-success">
                Create
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Alternative Vendor Modal */}
      <Modal
        backdrop="static"
        show={show}
        size="md"
        centered
        onHide={() => setShow(false)}
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Add New Alternative Vendor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="moday-body-overflow-none">
          <div className="row">
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">Vendor</label>
                <div className="custom-select-wrap">
                  <VendorSelect
                    value={vendorId.vendor_id ? { id: vendorId.vendor_id } : null}
                    onChange={(e) => setVendorId({ ...vendorId, vendor_id: e?.id ?? "" })}
                    placeholder="Search and select vendor..."
                  />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div class=" d-flex justify-content-end pt-3">
                <button type="submit" class="btn btn-success" onClick={handleClick}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Advanced Product Selector Modal */}
      <AdvancedProductSelector
        show={showProductSelector}
        onHide={() => setShowProductSelector(false)}
        onProductSelect={handleProductSelectFromAdvanced}
      />

      {/* Variant Selection Modal */}
      <Modal
        backdrop="static"
        show={showVariantModal}
        size="lg"
        centered
        onHide={handleVariantModalClose}
        aria-labelledby="variant-selection-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="variant-selection-modal-title">
            <i className="fas fa-box me-2 text-primary"></i>
            Select Product Variant
          </Modal.Title>
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
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      // Proceed without variant selection
                      if (currentProductIndex !== null) {
                        const newProducts = [...products];
                        newProducts[currentProductIndex] = {
                          ...newProducts[currentProductIndex],
                          variant_id: null,
                        };
                        setProducts(newProducts);
                      }
                      handleVariantModalClose();
                    }}
                  >
                    Continue Without Variant
                  </button>
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

export default MyNewpurchase;
