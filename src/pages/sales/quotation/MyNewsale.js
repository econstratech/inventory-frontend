import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal, Alert, OverlayTrigger, Popover } from "react-bootstrap";
import {
  ErrorMessage,
  SuccessMessage,
} from "../../../environment/ToastMessage";
import { UserAuth } from "../../auth/Auth";
import {
  formatDateTimeForMySQL,
} from "../../../environment/GlobalApi";
import "../../global.css";
import {
  PrivateAxios,
} from "../../../environment/AxiosInstance";
import { Tooltip } from "antd";
import StoreSelect from "../../filterComponents/StoreSelect";
import ProductSelect from "../../filterComponents/ProductSelect";
import CustomerSelect from "../../filterComponents/CustomerSelect";
import ProductDetailsContent from "../../CommonComponent/ProductDetailsContent";

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
    const cgst = totalTaxAmount / 2;
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
  const { userDetails, getGeneralSettingssymbol } = UserAuth();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(null);
  const [store, setStore] = useState(null);
  const [error, setError] = useState({});

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
      customer_id: "",
    },
  ]);

  // const [purchaseName, setPurchaseName] = useState("");
  const [vendorId, setVendor] = useState({
    customer_id: "",
  });
  // const getCurrentDateTime = () => {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = String(now.getMonth() + 1).padStart(2, "0");
  //   const day = String(now.getDate()).padStart(2, "0");
  //   const hours = String(now.getHours()).padStart(2, "0");
  //   const minutes = String(now.getMinutes()).padStart(2, "0");
  //   const seconds = String(now.getSeconds()).padStart(2, "0");
  //   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  // };
  const navigate = useNavigate();
  // const [orderDeadline, setOrderDeadline] = useState(getCurrentDateTime());
  // const [vendorReference, setVendorReference] = useState("");

  // const [expectedArrival, setExpectedArrival] = useState("");
  // const [buyer, setBuyer] = useState(userDetails.name);
  // const [sourceDocument, setSourceDocument] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [productData, setProductData] = useState([]);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    // const fetchProductData = async () => {
    //   const response = await PrivateAxios.get("products");
    //   setProductData(response.data);
    // };
    // fetchProductData();
    setProductData([]);
  }, []);

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
      },
    ]);
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

      const data = {
        customer_id: vendorId.customer_id,
        expected_delivery_date: expectedDeliveryDate, // Already in YYYY-MM-DD format
        warehouse_id: store.value,
        // customer_reference: vendorReference,
        // expiration: formatDateTimeForMySQL(orderDeadline),
        is_parent_id: "0",
        is_parent: "1",
        // buyer,
        // source_document: sourceDocument,
        payment_terms: paymentTerms,
        products,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };
      // console.log("Sale quotation data", data);

      const response = await PrivateAxios.post("sales/add", data);

      if (response.status === 201) {
        SuccessMessage("Data saved successfully");
        navigate("/sales/quotation");
      } else {
        console.error("Failed to save data");
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
            <h3 className="card-title">Requests for New Sale Order</h3>
          </div>

          <form onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Customer <span className="text-danger">*</span></label>
                    <div className="custom-select-wrap">
                      <CustomerSelect
                        value={selectedCustomer || (vendorId.customer_id ? vendorId.customer_id : null)}
                        onChange={(e) => {
                          setSelectedCustomer(e || null);
                          setVendor({ ...vendorId, customer_id: e ? e.id : "" });
                          setError({ ...error, customer: "" });
                        }}
                        error={error.customer}
                        onErrorClear={() => setError({ ...error, customer: "" })}
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
                          setError({ ...error, expectedDeliveryDate: "" });
                        }}
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
                          setError({ ...error, store: "" });
                        }}
                        error={error.store}
                        onErrorClear={() => setError({ ...error, store: "" })}
                        placeholder="Select Store"
                      />
                    </div>
                    {error?.store && <div className="text-danger f-s-14 mt-1">{error.store}</div>}

                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Payment Terms (Days)</label>
                    <input
                      type="number"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Payment Terms (Days)"
                      className="form-control"
                    />
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
                                    <div style={{ minWidth: "350px" }} className="d-flex align-items-center gap-2">
                                      <div style={{ flex: 1 }}>
                                        <ProductSelect
                                          value={product.product_id}
                                          onChange={(selectedOption) => {
                                            if (selectedOption) {
                                              const selectedProduct = selectedOption.productData;
                                              // console.log("Selected Product", selectedProduct);
                                              handleProductChange(index, "product_id", selectedOption.value);
                                              // Update unit_price and tax from selected product
                                              if (selectedProduct) {
                                                const newProducts = [...products];
                                                newProducts[index] = {
                                                  ...newProducts[index],
                                                  product_id: selectedOption.value,
                                                  unit_price: selectedProduct.regular_buying_price || 0,
                                                  tax: selectedProduct.tax || 18,
                                                  description: selectedProduct.product_name || "",
                                                  productData: selectedProduct,
                                                };
                                                
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
                                    <div style={{ minWidth: "150px" }}>
                                      <input
                                        type="number"
                                        className={`form-control ${error[`product_qty_${index}`] ? "is-invalid" : ""}`}
                                        value={product.qty}
                                        min="0"
                                        onChange={(e) => {
                                          handleProductChange(index, "qty", e.target.value);
                                          setError({ ...error, [`product_qty_${index}`]: "" });
                                        }}
                                      />
                                      {error[`product_qty_${index}`] && (
                                        <div className="invalid-feedback d-block small">
                                          {error[`product_qty_${index}`]}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "200px" }}>
                                      <input
                                        type="number"
                                        className={`form-control ${error[`product_unit_price_${index}`] ? "is-invalid" : ""}`}
                                        value={product.unit_price}
                                        min="0"
                                        onChange={(e) => {
                                          handleProductChange(index, "unit_price", e.target.value);
                                          setError({ ...error, [`product_unit_price_${index}`]: "" });
                                        }}
                                      />
                                      {error[`product_unit_price_${index}`] && (
                                        <div className="invalid-feedback d-block small">
                                          {error[`product_unit_price_${index}`]}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "150px" }}>
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
                                    <div style={{ minWidth: "150px" }}>
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
                          onClick={addProduct}
                          className="btn btn-outline-primary mt-0 btn-sm"
                          type="button"
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
                              {getGeneralSettingssymbol}
                              {calculateTotal().untaxedAmount.toFixed(2)}
                            </span>
                          </p>
                          <p className="mb-1">
                            <span className="f-s-16 fw-medium text-primary-grey-2">
                              SGST :{" "}
                            </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-1">
                              {" "}
                              {getGeneralSettingssymbol}
                              {calculateTotal().taxAmount.toFixed(2)}
                            </span>
                          </p>
                          <p className="mb-1">
                            <span className="f-s-16 fw-medium text-primary-grey-2">
                              CGST :{" "}
                            </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-1">
                              {" "}
                              {getGeneralSettingssymbol}
                              {calculateTotal().taxAmount.toFixed(2)}
                            </span>
                          </p>
                          <p className="border-top pt-2">
                            <span className="f-s-20 fw-bold text-primary-grey-2">
                              Total :{" "}
                            </span>
                            <span className="fw-bold f-s-20 text-primary-grey-1">
                              {" "}
                              {getGeneralSettingssymbol}
                              {calculateTotal().totalAmount.toFixed(2)}
                            </span>
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
                            Create a call for tender by adding alternative
                            requests for quotation to different vendors. Make
                            your choice by selecting the best combination of
                            lead time, OTD and/or total amount. By comparing
                            product lines you can also decide to order some
                            products from one vendor and others from another
                            vendor.
                          </div>
                          <div className="col-12">
                            <button
                              type="button"
                              class="btn btn-outline-primary mt-3 btn-sm"
                              onClick={() => setShow(true)}
                            >
                              <i class="fas fa-plus"></i>
                              <span class="ms-2">Create Alternative</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-end">
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

      <Modal
        backdrop="static"
        show={show}
        onHide={() => setShow(false)}
        aria-labelledby="example-custom-modal-styling-title"
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Add New Alternative Customer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="moday-body-overflow-none pb-1">
          <div className="row">
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">Customer</label>
                <div className="custom-select-wrap">
                  <CustomerSelect
                    value={selectedCustomer || (vendorId.customer_id ? vendorId.customer_id : null)}
                    onChange={(e) => {
                      setSelectedCustomer(e || null);
                      setVendor({ ...vendorId, customer_id: e ? e.id : "" });
                    }}
                    placeholder="Search and select customer..."
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
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="submit"
            class="btn btn-exp-green "
            onClick={handleClick}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

export default MyNewpurchase;
