import React, { useEffect, useState } from "react";
import {
  // BrowserRouter as Router,
  // Route,
  // Switch,
  // useHistory,
  // Link,
  // Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
// import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tooltip } from "antd";
import moment from "moment";

import {
  // Button,
  // Table,
  Alert,
  Modal,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import {
  ErrorMessage,
  SuccessMessage,
} from "../../../environment/ToastMessage";
import { UserAuth } from "../../auth/Auth";
import {
  // AllUser,
  // AllCategories,
  // GetTaskRemainder,
  formatDateTimeForMySQL,
} from "../../../environment/GlobalApi";
import "../../global.css";
import {
  PrivateAxios,
} from "../../../environment/AxiosInstance";


import StoreSelect from "../../filterComponents/StoreSelect";
import ProductSelect from "../../filterComponents/ProductSelect";
import CustomerSelect from "../../filterComponents/CustomerSelect";
import ProductDetailsContent from "../../CommonComponent/ProductDetailsContent";
import ProductVariantSelectionModal from "../../CommonComponent/ProductVariantSelectionModal";
import { calculateTotalWeight } from "../../../utils/weightConverter";



function EditMyPurchase() {
  const { id } = useParams();

  // const [user, setUser] = useState(JSON.parse(localStorage.getItem("auth_user")) || null);
  // const [getGeneralSettingssymbol, setGetGeneralSettingssymbol] = useState(null);
  const { user, getGeneralSettingssymbol, isVariantBased } = UserAuth();

  const [selectedOption, setSelectedOption] = useState("");

  const [error, setError] = useState({});
  const [alert, setAlert] = useState("");
  const [show, setShow] = useState(false);

  const [products, setProducts] = useState([]);
  const [vendorId, setVendor] = useState({});
  const [orderDeadline, setOrderDeadline] = useState("");
  const [vendorReference, setVendorReference] = useState("");

  const [buyer, setBuyer] = useState(null);
  const [sourceDocument, setSourceDocument] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [productsaddi, setProductsaddi] = useState([]);
  const [StatusData, setStatus] = useState("");
  const [productData, setProductData] = useState([]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(null);
  const [store, setStore] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [variantModalBackup, setVariantModalBackup] = useState(null);

  // useEffect(() => {
  //   if (user) {
  //     setGetGeneralSettingssymbol(user.company.generalSettings.symbol);
  //   }
  // }, [user]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get(`/sales/sales/${id}`);
        const data = response.data.data;

        setVendor({ customer_id: data.customer.id });
        if (data.customer_id) {
          setSelectedCustomer(
            data.customer
              ? { id: data.customer.id, name: data.customer.name || "" }
              : { id: data.customer_id, name: "" }
          );
        }
        setOrderDeadline(data.expiration);
        setVendorReference(data.reference_number);

        setBuyer(data.buyer);
        setSourceDocument(data.source_document);
        setPaymentTerms(data.payment_terms);
        // console.log("Products", data.products);
        const mappedProducts = (data.products || []).map((product) => {
          const variantData = product.variantData || product.productVariant || null;
          const variant_id = product.variant_id || product.product_variant_id || variantData?.id || null;
          const productData = product.productData || product.ProductsItem || product.product || null;
          const qpp = parseFloat(variantData?.quantity_per_pack);
          const qty = parseFloat(product.qty);
          const master_pack =
            Number.isFinite(qpp) && qpp > 0 && Number.isFinite(qty)
              ? String(Number((qty / qpp).toFixed(3)))
              : "";
          return {
            ...product,
            productData,
            variant_id,
            variantData,
            master_pack,
          };
        });
        setProducts(mappedProducts);
        setStatus(data.status);
        // setExpectedDeliveryDate(moment(data.expected_delivery_date).format("DD/MM/YYYY"));
        setExpectedDeliveryDate(
          data.expected_delivery_date
            ? new Date(data.expected_delivery_date)
            : null
        );
        // setExpectedDeliveryDate(moment(data.expected_delivery_date).toDate());
        // Transform warehouse data to match StoreSelect format
        if (data.warehouse) {
          setStore({
            value: data.warehouse.id,
            label: `${data.warehouse.name || "N/A"} (${data.warehouse.city || "N/A"})`,
            storeData: data.warehouse,
          });
        }
        setProductsaddi(data.products);
        // fetchProducts(data.id, data.customer_id);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    //console.log(vendorId);
  }, [id]);
  // console.log(orderDeadline);
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
    const cgst = totalTaxAmount / 2;
    const totalAmount = untaxedAmount + totalTaxAmount;
  
    return {
      untaxedAmount,
      taxAmount: sgst, 
      totalAmount,
    };
  };

  // Recompute the row's master_pack string from its current qty + variant's
  // quantity_per_pack. Keeps the Master Pack input in sync when qty changes
  // through other edits (direct qty edit, variant selection, hydration).
  const computeMasterPackString = (row) => {
    const qpp = parseFloat(row?.variantData?.quantity_per_pack);
    const qty = parseFloat(row?.qty);
    if (!Number.isFinite(qpp) || qpp <= 0 || !Number.isFinite(qty)) return "";
    return String(Number((qty / qpp).toFixed(3)));
  };

  const handleMasterPackChange = (index, rawValue) => {
    const numericValue = String(rawValue).replace(/[^0-9.]/g, "");
    setProducts((prev) => {
      const next = [...prev];
      const current = { ...next[index], master_pack: numericValue };
      const mp = parseFloat(numericValue);
      const qpp = parseFloat(current?.variantData?.quantity_per_pack);

      if (Number.isFinite(mp) && Number.isFinite(qpp) && qpp > 0) {
        current.qty = Number((mp * qpp).toFixed(3));
      }

      const qty = parseFloat(current.qty) || 0;
      const unitPrice = parseFloat(current.unit_price) || 0;
      const taxRate = parseFloat(current.tax) || 0;
      const taxExcl = qty * unitPrice;
      const taxAmount = (taxExcl * taxRate) / 100;
      current.taxExcl = taxExcl;
      current.taxAmount = taxAmount;
      current.taxIncl = taxExcl + taxAmount;
      current.vendor_id = vendorId.customer_id;

      next[index] = current;
      return next;
    });
  };

 const handleProductChange = (index, field, value) => {
    const newProducts = [...products];

    if (field === "product_id") {
      const selectedProduct = productData.find((p) => p.id === value);
      if (selectedProduct) {
        newProducts[index] = {
          ...newProducts[index],
          product_id: value,
          unit_price: selectedProduct.regular_selling_price || 0,
          tax: selectedProduct.tax || 0,

        };
      }
    } else {
      newProducts[index][field] = value;
    }

    if (field === "qty") {
      newProducts[index].master_pack = computeMasterPackString(newProducts[index]);
    }

    const qty = parseFloat(newProducts[index].qty) || 0;
    const unitPrice = parseFloat(newProducts[index].unit_price) || 0;
    const taxRate = parseFloat(newProducts[index].tax) || 0;

    const taxExcl = qty * unitPrice;
    const taxAmount = (taxExcl * taxRate) / 100;
    const taxIncl = taxExcl + taxAmount;

    newProducts[index].taxExcl = taxExcl;
    newProducts[index].taxAmount = taxAmount;
    newProducts[index].taxIncl = taxIncl;
    newProducts[index].vendor_id = vendorId.customer_id;

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
        vendor_id: vendorId.customer_id,
        tax: 18,
        productData: null,
        variant_id: null,
        variantData: null,
        taxExcl: 0, // Initialize taxExcl as a number
        master_pack: "",
      },
    ]);
  };

  const updateProductWithData = (
    productIndex,
    productId,
    selectedProductData,
    variantId = null,
    selectedVariantData = null
  ) => {
    setProducts((prevProducts) => {
      const newProducts = [...prevProducts];
      newProducts[productIndex] = {
        ...newProducts[productIndex],
        product_id: productId,
        description: selectedProductData?.product_name || "",
        unit_price: selectedProductData?.regular_selling_price || 0,
        tax: selectedProductData?.tax || 18,
        productData: selectedProductData || null,
        variant_id: variantId,
        variantData: selectedVariantData,
      };

      newProducts[productIndex].master_pack = computeMasterPackString(newProducts[productIndex]);

      const qty = parseFloat(newProducts[productIndex].qty) || 0;
      const unitPrice = parseFloat(newProducts[productIndex].unit_price) || 0;
      const taxRate = parseFloat(newProducts[productIndex].tax) || 0;
      const taxExcl = qty * unitPrice;
      const taxAmount = (taxExcl * taxRate) / 100;
      const taxIncl = taxExcl + taxAmount;

      newProducts[productIndex].taxExcl = taxExcl;
      newProducts[productIndex].taxAmount = taxAmount;
      newProducts[productIndex].taxIncl = taxIncl;
      newProducts[productIndex].vendor_id = vendorId.customer_id;

      return newProducts;
    });
  };

  const fetchProductVariants = (productId, productIndex, selectedProductData) => {
    const existingRow = products[productIndex];
    setVariantModalBackup({
      productIndex,
      rowData: existingRow ? { ...existingRow } : null,
    });

    const existingVariantId =
      existingRow?.variant_id ||
      existingRow?.product_variant_id ||
      existingRow?.variantData?.id ||
      existingRow?.productVariant?.id ||
      null;
    updateProductWithData(productIndex, productId, selectedProductData, null, null);
    if (existingVariantId) {
      setProducts((prevProducts) => {
        const next = [...prevProducts];
        if (!next[productIndex]) return prevProducts;
        next[productIndex] = {
          ...next[productIndex],
          variant_id: existingVariantId,
        };
        return next;
      });
    }
    setCurrentProductIndex(productIndex);
    setCurrentProductId(productId);
    // Show variant modal only if the company is set with variant based
    if (isVariantBased) {
      setShowVariantModal(true);
    }
  };

  const handleVariantSelect = (variant, productIndex) => {
    if (productIndex !== null && products[productIndex]) {
      const rowProductData = products[productIndex].productData;
      updateProductWithData(
        productIndex,
        rowProductData?.id || products[productIndex].product_id,
        rowProductData,
        variant.id,
        variant
      );
    }
    setVariantModalBackup(null);
    setShowVariantModal(false);
    setCurrentProductIndex(null);
    setCurrentProductId(null);
  };

  const handleVariantModalClose = (productIndex) => {
    if (
      variantModalBackup &&
      variantModalBackup.productIndex === productIndex &&
      variantModalBackup.rowData
    ) {
      setProducts((prevProducts) => {
        const next = [...prevProducts];
        next[productIndex] = variantModalBackup.rowData;
        return next;
      });
    }
    setVariantModalBackup(null);
    setShowVariantModal(false);
    setCurrentProductIndex(null);
    setCurrentProductId(null);
  };

  const handleContinueWithoutVariant = () => {
    setVariantModalBackup(null);
    setShowVariantModal(false);
    setCurrentProductIndex(null);
    setCurrentProductId(null);
  };

  const getCurrentVariant = (product) => {
    if (product?.variantData) return product.variantData;
    return null;
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

  const validateForm = () => {
    const errors = {};
    
    // Validate Customer
    if (!vendorId.customer_id || vendorId.customer_id === "") {
      errors.customer = "Customer is required.";
    }
    
    // Validate Expected Delivery Date
    if (!expectedDeliveryDate) {
      errors.expectedDeliveryDate = "Expected Delivery Date is required.";
    }
    
    // Validate Store
    if (!store || !store.value) {
      errors.store = "Store is required.";
    }
    
    // Validate Products
    products.forEach((product, index) => {
      const qty = parseFloat(product.qty);
      const unitPrice = parseFloat(product.unit_price);
      
      if (!product.qty || product.qty === "" || isNaN(qty) || qty <= 0) {
        errors[`product_qty_${index}`] = "Quantity must be greater than 0.";
      }
      
      if (!product.unit_price || product.unit_price === "" || isNaN(unitPrice) || unitPrice <= 0) {
        errors[`product_unit_price_${index}`] = "Unit Price must be greater than 0.";
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      ErrorMessage(firstError);
      return;
    }
    
    setError({});
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => ({
        ...product,
        customer_id: vendorId.customer_id,
        product_variant_id: product.variant_id || null,
      }));
      const data = {
        customer_id: vendorId.customer_id,
        expected_delivery_date: expectedDeliveryDate
          ? moment(expectedDeliveryDate).format("YYYY-MM-DD")
          : null,
        // expected_delivery_date: expectedDeliveryDate,
        warehouse_id: store.value,
        // customer_reference: vendorReference,
        // expiration: formatDateTimeForMySQL(orderDeadline),
        // buyer,
        // source_document: sourceDocument,
        payment_terms: paymentTerms,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };

      const response = await PrivateAxios.put(`sales/update/${id}`, data);

      if (response.status === 200) {
        SuccessMessage("Sales order has been updated successfully.");
        navigate("/sales/quotation");
      } else {
        console.log(response.status);
        ErrorMessage("Failed to update sales order");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => ({
        ...product,
        customer_id: selectedOption.vendor_id_add,
      }));
      const data = {
        customer_id: selectedOption.vendor_id_add,
        customer_reference: vendorReference,
        expiration: formatDateTimeForMySQL(orderDeadline),

        is_parent_id: vendorId.vendor_id,
        is_parent: "0",
        parent_recd_id: id,
        buyer,
        source_document: sourceDocument,
        payment_terms: paymentTerms,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };

      const response = await PrivateAxios.post(`sales/add_addi`, data);

      if (response.status === 201) {
        SuccessMessage("Sales Quotation is successfully updated.");
        setShow(false);
        // fetchProducts(id, vendorId.vendor_id);
      } else {
        ErrorMessage("Failed to update Sales Quotation");
        console.error("Failed to update Sales Quotation");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          {/* <Link to="/sales/quotation/reviewing" className="text-dark">
            <i class="fas fa-arrow-left me-1"></i>
            <span class="ms-2 f-s-16">Back</span>
          </Link> */}
          <button
            type="button"
            className="link-btn text-dark "
            onClick={() => navigate(-1)} // Navigate back in history
          >
            <i className="fas fa-arrow-left me-1" />
            <span className="ms-2 f-s-16">Back</span>
          </button>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Sales Order Update 
              (<span className="text-primary">{vendorReference}</span>)
            </h3>
          </div>

          <form onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Customer <span className="text-danger">*</span></label>
                    <div className="custom-select-wrap">
                      <CustomerSelect
                        value={selectedCustomer ? selectedCustomer.id : (vendorId.customer_id ?? null)}
                        onChange={(e) => {
                          setSelectedCustomer(e || null);
                          setVendor((prev) => ({ ...prev, customer_id: e ? e.id : "" }));
                          setError((prev) => ({ ...prev, customer: "" }));
                        }}
                        error={error.customer}
                        onErrorClear={() => setError((prev) => ({ ...prev, customer: "" }))}
                        placeholder="Search and select customer..."
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            borderColor: error.customer ? "#ff4d4f" : base.borderColor,
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
                    </div>
                    {error?.customer && <div className="text-danger f-s-14 mt-1">{error.customer}</div>}
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Expected Delivery Date <span className="text-danger">*</span></label>
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={
                          expectedDeliveryDate
                            ? typeof expectedDeliveryDate === "string"
                              ? new Date(expectedDeliveryDate + "T00:00:00") // Add time to avoid timezone shift
                              : expectedDeliveryDate
                            : null
                        }
                        onChange={(date) => {
                          if (date) {
                            // Format date to YYYY-MM-DD to avoid timezone issues
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const day = String(date.getDate()).padStart(2, "0");
                            const dateString = `${year}-${month}-${day}`;
                            setExpectedDeliveryDate(dateString);
                          } else {
                            setExpectedDeliveryDate(null);
                          }
                          setError((prev) => ({ ...prev, expectedDeliveryDate: "" }));
                        }}
                        // value={expectedDeliveryDate}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select Date"
                      />
                    </div>
                    {error?.expectedDeliveryDate && <div className="text-danger f-s-14">{error.expectedDeliveryDate}</div>}

                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Store <span className="text-danger">*</span></label>
                    <div className="custom-select-wrap">
                      {/* <span className="cal-icon"><i className="fas fa-calendar-alt" /></span> */}
                      <StoreSelect
                        value={store}
                        onChange={(selectedOption) => {
                          setStore(selectedOption);
                          setError((prev) => ({ ...prev, store: "" }));
                        }}
                        error={error.store}
                        onErrorClear={() => setError((prev) => ({ ...prev, store: "" }))}
                        placeholder="Select Store"
                      />
                    </div>
                    {error?.store && <div className="text-danger f-s-14 mt-1">{error.store}</div>}

                  </div>
                </div>


                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Payment Terms</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Payment Terms"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

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
                      <div className="table-responsive">
                        <table className="table text-nowrap table-bordered primary-table-head table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Description</th>
                              <th>Quantity</th>

                              {isVariantBased && (
                                <>
                                  <th>Weight Per Unit</th>
                                  <th>Total Weight</th>
                                </>
                              )}
                              {products.some(
                                (p) => Number(p?.productData?.has_master_pack) === 1
                              ) && <th>Master Pack</th>}
                              <th>Unit Price</th>
                              <th>Taxes (%)</th>
                              <th>Tax Excl.</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product, index) => (
                              <tr key={index}>
                                <td>
                                  <div style={{ minWidth: "350px" }} className="d-flex align-items-start gap-2">
                                    <div style={{ flex: 1 }}>
                                      <ProductSelect
                                        value={product.product_id}
                                        onChange={(selectedOption) => {
                                          if (selectedOption) {
                                            const selectedProduct = selectedOption.productData;
                                            if (selectedProduct) {
                                              fetchProductVariants(selectedOption.value, index, selectedProduct);
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
                                              master_pack: "",
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
                                        placement="left"
                                        rootClose
                                        overlay={
                                          <Popover id={`product-details-${index}`} style={{ maxWidth: "450px" }}>
                                            <Popover.Header as="h6" className="d-flex align-items-center">
                                              <i className="fas fa-info-circle text-primary me-2"></i>
                                              Product Details
                                            </Popover.Header>
                                            <Popover.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
                                              <ProductDetailsContent
                                                productData={product.productData}
                                                isVariantBased={isVariantBased}
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
                                <td>
                                  <div style={{ minWidth: "200px" }}>
                                    <input
                                      type="text"
                                      name="description"
                                      value={product.description}
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "120px" }}>
                                    <input
                                      type="number"
                                      name="qty"
                                      value={product.qty}
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "qty",
                                          e.target.value
                                        )
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                </td>
                                {isVariantBased && (
                                  <>
                                    <td>
                                      <div style={{ minWidth: "120px" }} className="d-flex align-items-center gap-2">
                                        <span>
                                          {(() => {
                                            const currentVariant = getCurrentVariant(product);
                                            return currentVariant
                                              ? `${currentVariant.weight_per_unit} ${currentVariant.masterUOM?.label || ""}`
                                              : "N/A";
                                          })()}
                                        </span>
                                        {product.product_id && (
                                          <div
                                            className="btn-sm cursor-pointer"
                                            onClick={() => fetchProductVariants(product.product_id, index, product.productData)}
                                            title="Click to change variant"
                                          >
                                            <i className="fas fa-edit" style={{ color: "#007bff" }}></i>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ minWidth: "120px" }}>
                                        {(() => {
                                          const currentVariant = getCurrentVariant(product);
                                          if (currentVariant && currentVariant.weight_per_unit && currentVariant.masterUOM?.label) {
                                            const totalWeightResult = calculateTotalWeight(
                                              product.qty,
                                              currentVariant.weight_per_unit,
                                              currentVariant.masterUOM.label
                                            );
                                            return totalWeightResult.display || "N/A";
                                          }
                                          return "N/A";
                                        })()}
                                      </div>
                                    </td>
                                  </>
                                )}
                                {products.some(
                                  (p) => Number(p?.productData?.has_master_pack) === 1
                                ) && (
                                  <td>
                                    <div style={{ minWidth: "180px" }} className="d-flex">
                                      {Number(product?.productData?.has_master_pack) === 1 &&
                                      Number(product?.variantData?.quantity_per_pack) > 0 ? (
                                        <div className="input-group">
                                          <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            step="0.001"
                                            placeholder="0"
                                            style={{ marginRight: "10px" }}
                                            value={product.master_pack ?? ""}
                                            onChange={(e) =>
                                              handleMasterPackChange(index, e.target.value)
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
                                  <div style={{ minWidth: "120px" }}>
                                    <input
                                      type="number"
                                      name="unit_price"
                                      value={product.unit_price}
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "unit_price",
                                          e.target.value
                                        )
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "120px" }}>
                                    <input
                                      type="number"
                                      name="tax"
                                      value={product.tax}
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "tax",
                                          e.target.value
                                        )
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "100px" }}>
                                    {Number(product.taxExcl).toFixed(2) || 0}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "100px" }}>
                                    <Tooltip title="Remove">
                                      <button
                                        type="button"
                                        className="icon-btn"
                                        onClick={() => removeProduct(index)}
                                      >
                                        <i className="fas fa-trash-alt text-danger"></i>
                                      </button>
                                    </Tooltip>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={addProduct}
                      >
                        <i class="fas fa-plus"></i>
                        <span class="ms-2"> Add Product</span>
                      </button>
                      <div className="col-12 text-right">
                        <p className="mb-1">
                          <span className="f-s-16 fw-medium text-primary-grey-2">
                            Untaxed Amount :{" "}
                          </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1">
                            {" "}
                            {getGeneralSettingssymbol}
                            {calculateTotal().untaxedAmount.toFixed(2)}
                          </span>
                        </p>
                        <p className="mb-1">
                          <span className="f-s-16 fw-medium text-primary-grey-2">
                            Bill DateSGST :{" "}
                          </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1">
                            {" "}
                            {getGeneralSettingssymbol}{" "}
                            {calculateTotal().taxAmount.toFixed(2)}
                          </span>
                        </p>
                        <p className="mb-1">
                          <span className="f-s-16 fw-medium text-primary-grey-2">
                            CGST :{" "}
                          </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1">
                            {" "}
                            {getGeneralSettingssymbol}{" "}
                            {calculateTotal().taxAmount.toFixed(2)}
                          </span>
                        </p>
                        <p className="border-top pt-2">
                          <span className="f-s-20 fw-bold text-primary-grey-2">
                            Total :{" "}
                          </span>
                          <span className="fw-bold f-s-20 text-primary-grey-1">
                            {" "}
                            {getGeneralSettingssymbol}{" "}
                            {calculateTotal().totalAmount.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-success ms-auto" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        backdrop="static"
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
      >
        <form onSubmit={handleClick}>
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title">
              Add New Alternative Customer
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="moday-body-overflow-none">
            <div className="row">
              <div className="12">
                {/* <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <div className="custom-select-wrap">
                    <Select
                      name="vendor_name"
                      required
                      options={getCustomer}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary25: "#ddddff",
                          primary: "#6161ff",
                        },
                      })}
                      onChange={(e) =>
                        setSelectedOption({ vendor_id_add: e.id })
                      }
                    />
                  </div>
                </div> */}
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <button type="submit" class="btn btn-exp-green ">
              Save
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      <ProductVariantSelectionModal
        show={showVariantModal}
        onHide={() => setShowVariantModal(false)}
        productId={currentProductId}
        productIndex={currentProductIndex}
        currentVariantId={
          currentProductIndex !== null && products[currentProductIndex]
            ? (
                products[currentProductIndex].variant_id ||
                products[currentProductIndex].product_variant_id ||
                products[currentProductIndex].variantData?.id ||
                products[currentProductIndex].productVariant?.id ||
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
    </React.Fragment>
  );
}

export default EditMyPurchase;
