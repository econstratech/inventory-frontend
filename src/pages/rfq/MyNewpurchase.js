import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table, Alert, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { UserAuth } from "../auth/Auth";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import {
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
import ProductVariantSelectionModal from "../CommonComponent/ProductVariantSelectionModal";
import SalesQuotationSelect from "../filterComponents/SalesQuotationSelect";

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
  const { MatchPermission, user } = UserAuth();
  const [getGeneralSettingssymbol, setGetGeneralSettingssymbol] = useState(null);
  const [isVariantBased, setIsVariantBased] = useState(false);

  useEffect(() => {
    if (user) {
      setGetGeneralSettingssymbol(user.company.generalSettings.symbol);
      setIsVariantBased(user.company.generalSettings.is_variant_based === 1);
      if (!MatchPermission(["Create PO"])) {
        ErrorMessage("You are not authorized to create a purchase order.");
        navigate("/");
      }
    }
  }, [user]);

  const [show, setShow] = useState(false);

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

  const [vendorId, setVendorId] = useState({
    vendor_id: "",
  });

  const navigate = useNavigate();
  const [expectedArrival, setExpectedArrival] = useState("");
  const [alert, setAlert] = useState("");
  const [error, setError] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  
  // Variant selection state
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(null);

  // Handle product selection from Advanced Product Selector
  const handleProductSelectFromAdvanced = (selectedProduct) => {
    if (selectedProduct && selectedProduct.productData) {
      const productData = selectedProduct.productData;
      const productIndex = products.length === 1 && products[0].product_id === "" ? 0 : products.length;

      if (isVariantBased) {
        fetchProductVariants(selectedProduct.value, productIndex, productData);
      } else {
        updateProductWithData(productIndex, selectedProduct.value, productData, null, null);
      }
      setShowProductSelector(false);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];

    newProducts[index][field] = value;

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

  // Helper function to update product with productData and calculate tax
  const updateProductWithData = (
    productIndex,
    productId,
    productData,
    variantId = null,
    variantData = null
  ) => {  
    setProducts((prevProducts) => {
  
      const newProducts = [...prevProducts];
  
      newProducts[productIndex] = {
        ...newProducts[productIndex],
        product_id: productId,
        description: productData?.product_name || "",
        unit_price: productData?.regular_buying_price || 0,
        tax: productData?.tax || 18,
        productData: productData,
        variant_id: variantId,
        variantData: variantData,
        vendor_id: vendorId?.vendor_id || "",
      };
  
      // Calculate tax
      const qty = parseFloat(newProducts[productIndex].qty) || 0;
      const unitPrice = parseFloat(newProducts[productIndex].unit_price) || 0;
      const taxRate = parseFloat(newProducts[productIndex].tax) || 0;
  
      const taxExcl = qty * unitPrice;
      const taxAmount = (taxExcl * taxRate) / 100;
      const taxIncl = taxExcl + taxAmount;
  
      newProducts[productIndex] = {
        ...newProducts[productIndex],
        taxExcl,
        taxAmount,
        taxIncl
      };
  
      return newProducts;
    });
  
  };

  // Show variant selection modal - component will handle fetching variants
  const fetchProductVariants = (productId, productIndex, productData) => {
    // Temporarily set product data (will be finalized after variant selection)
    updateProductWithData(productIndex, productId, productData, null, null);
    
    // Show modal - component will fetch variants
    setCurrentProductIndex(productIndex);
    setCurrentProductId(productId);
    setShowVariantModal(true);
  };

  // Handle variant selection from modal
  const handleVariantSelect = (variant, productIndex) => {
    if (productIndex !== null && products[productIndex]) {
      const productData = products[productIndex].productData;
      updateProductWithData(productIndex, productData?.id || products[productIndex].product_id, productData, variant.id, variant);
    }
    setShowVariantModal(false);
    setCurrentProductIndex(null);
    setCurrentProductId(null);
  };

  // Handle variant modal close without selection
  const handleVariantModalClose = (productIndex) => {
    // If user closes without selecting, clear the product selection
    if (productIndex !== null) {
      const newProducts = [...products];
      newProducts[productIndex] = {
        ...newProducts[productIndex],
        product_id: "",
        productData: null,
        variant_id: null,
        variantData: null,
      };
      setProducts(newProducts);
    }
    setShowVariantModal(false);
    setCurrentProductIndex(null);
    setCurrentProductId(null);
  };

  // Handle continue without variant
  const handleContinueWithoutVariant = (productIndex) => {
    // Product already has data set, just close modal
    setShowVariantModal(false);
    setCurrentProductIndex(null);
    setCurrentProductId(null);
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
          product_variant_id: isVariantBased && product.variantData ? product.variantData.id : null,
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
                                          value={product.product_id || (product.productData ? product.productData.id : null)}
                                          selectedProductData={product.productData}
                                          onChange={(selectedOption) => {
                                            if (selectedOption) {
                                              const selectedProduct = selectedOption.productData;
                                              if (isVariantBased) {
                                                fetchProductVariants(selectedOption.value, index, selectedProduct);
                                              } else {
                                                updateProductWithData(index, selectedOption.value, selectedProduct, null, null);
                                              }
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
                                        {isVariantBased && product.variant_id && product.variantData && (
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
      <ProductVariantSelectionModal
        show={showVariantModal}
        onHide={() => setShowVariantModal(false)}
        productId={currentProductId}
        productIndex={currentProductIndex}
        currentVariantId={currentProductIndex !== null && products[currentProductIndex] ? products[currentProductIndex].variant_id : null}
        onVariantSelect={handleVariantSelect}
        onClose={handleVariantModalClose}
        currencySymbol={getGeneralSettingssymbol}
        allowContinueWithoutVariant={true}
        onContinueWithoutVariant={handleContinueWithoutVariant}
      />

    </React.Fragment>
  );
}

export default MyNewpurchase;
