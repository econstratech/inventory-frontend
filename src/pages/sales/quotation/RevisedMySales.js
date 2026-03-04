import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import Select from "react-select";

import { Button, Alert, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
import { UserAuth } from "../../auth/Auth";
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,
  formatDateTimeForMySQL,
} from "../../../environment/GlobalApi";
import "../../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../../environment/AxiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Tooltip } from "antd";


function EditMyPurchase() {
  const { id } = useParams();
  const [total, setTotal] = useState("");
  const { getCustomer, vendor, userDetails, productData, getGeneralSettingssymbol } = UserAuth();
  const [selectedOption, setSelectedOption] = useState("");
  const [isCheckedReminder, setIsCheckedReminder] = useState(false);
  const [isFileRequired, setIsFileRequired] = useState(false);
  const [error, setError] = useState({});
  const [alert, setAlert] = useState("");
  const [show, setShow] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [catProduct, setCategory] = useState([
    { value: "select", label: "-Select-" },
  ]);
  const [products, setProducts] = useState([]);
  const [purchaseName, setPurchaseName] = useState("");
  const [vendorId, setVendor] = useState("");
  const [orderDeadline, setOrderDeadline] = useState("");
  const [vendorReference, setVendorReference] = useState("");

  const [buyer, setBuyer] = useState(userDetails.name);
  const [sourceDocument, setSourceDocument] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [productsaddi, setProductsaddi] = useState([]);
  const [ProductCompare, setProductCompare] = useState([]);
  const [StatusData, setStatus] = useState("");


  useEffect(() => {

    const fetchData = async () => {
      try {

        const response = await PrivateAxios.get(`/sales/sales/${id}`);
        const data = response.data;


        setVendor({ vendor_id: data.customer_id });
        setOrderDeadline(data.expiration);
        setVendorReference(data.customer_reference);

        setBuyer(data.buyer);
        setSourceDocument(data.source_document);
        setPaymentTerms(data.payment_terms);
        setProducts(data.products);
        setStatus(data.status);


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
    products.forEach((product) => {
      untaxedAmount += product.qty * product.unit_price;
    });
    const taxAmount = (untaxedAmount * (products[0]?.tax / 100)) / 2;
    const totalAmount = untaxedAmount + taxAmount * 2; // CGST and SGST
    return { untaxedAmount, taxAmount, totalAmount };
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;

    if (field === "qty" || field === "unit_price") {
      const qty = field === "qty" ? parseFloat(value) : newProducts[index].qty;
      const unitPrice =
        field === "unit_price"
          ? parseFloat(value)
          : newProducts[index].unit_price;
      const taxRate = parseFloat(newProducts[index].tax);
      newProducts[index].taxExcl = qty * unitPrice || 0; // Ensure taxExcl is a number

      const taxAmount = (newProducts[index].taxExcl * taxRate) / 100;
      newProducts[index].taxIncl = newProducts[index].taxExcl + taxAmount;
    }
    newProducts[index].vendor_id = vendorId.vendor_id;
    setProducts(newProducts);
  };
  //console.log(vendorId.vendor_id);

  const addProduct = () => {
    setProducts([
      ...products,
      {
        product_id: "",
        description: "",
        qty: 1,
        unit_price: 0,
        vendor_id: vendorId.vendor_id,
        tax: 18,

        taxExcl: 0, // Initialize taxExcl as a number
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

  const salesid = useParams();
  const handleSubmit = async (e) => {


    e.preventDefault();
    console.log(salesid, 'balta');
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => ({
        ...product,
        customer_id: vendorId.vendor_id,
      }));
      const data = {
        customer_id: vendorId.vendor_id,
        customer_reference: vendorReference,
        expiration: formatDateTimeForMySQL(orderDeadline),

        buyer,
        source_document: sourceDocument,
        payment_terms: paymentTerms,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };


      const response = await PrivateAxios.post(`sales/revised/${id}`, data);

      if (response.status === 200) {
        SuccessMessage("Data Updated.");
        navigate("/sales-orders/follow-done");
      } else {
        console.log(response.status);
        ErrorMessage("Failed to save data");

      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const navigate = useNavigate();

  const getStatus = (status) => {
    if (status === 1) {
      return 'Active';
    } else if (status === 2) {
      return 'Quotation';
    } else if (status === 3) {
      return 'Send to management';
    } else if (status === 4) {
      return 'Review Confirmed';
    } else if (status === 5) {
      return 'Order Confirm';
    } else if (status === 6) {
      return 'Fully Billed';
    } else if (status === 7) {
      return 'Payment Done';
    }
  };



  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          {/* <Link to="/sales-orders/follow-done" className="text-dark">
          <i className="fas fa-arrow-left me-1" />
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
            <h3 className="card-title">Revised Quotations</h3>
          </div>

          <form onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Customer Name </label>
                    <div className="custom-select-wrap">
                      <Select
                        name="vendor_name"
                        value={getCustomer.find((v) => v.id == vendorId.vendor_id)}
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
                        onChange={(e) => setVendor({ vendor_id: e.id })}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Expiration</label>
                    {/* <input
                      type="datetime-local"
                      value={
                        orderDeadline != ""
                          ? new Date(orderDeadline).toJSON().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => setOrderDeadline(e.target.value)}
                      required
                      className="form-control"
                    /> */}
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={orderDeadline}
                        onChange={(date) => setOrderDeadline(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy , hh:mm aa"
                        placeholderText="Select a date and time"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor Reference</label>
                    <input
                      type="text"
                      value={vendorReference}
                      onChange={(e) => setVendorReference(e.target.value)}
                      placeholder="Vendor Reference"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Source Document</label>
                    <input
                      type="text"
                      value={sourceDocument}
                      onChange={(e) => setSourceDocument(e.target.value)}
                      placeholder="Source Document"
                      className="form-control"
                    />
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
                    <li class="nav-item" role="presentation">
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
                        <table responsive className="table text-nowrap table-bordered primary-table-head table">
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
                                  <div style={{ minWidth: "200px" }}>
                                    {/* <Select
                                      name="product_id"
                                      value={productData.find(
                                        (p) => p.id === product.product_id
                                      )}
                                      options={productData}
                                      getOptionLabel={(option) =>
                                        option.product_name
                                      }
                                      getOptionValue={(option) => option.id}
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "product_id",
                                          e.id
                                        )
                                      }
                                    /> */}
                                    <DropDownList
                                      className="custom_keno_dropdown"
                                      name="product_id"
                                      data={productData} // Data for the dropdown
                                      value={productData.find((p) => p.id === product.product_id)} // Selected value
                                      textField="product_name" // Field to display in the dropdown
                                      dataItemKey="id" // Field used as the unique key
                                      onChange={(e) =>
                                        handleProductChange(index, "product_id", e.value.id) // Handle the selected change
                                      }
                                    />
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
                                  <div style={{ minWidth: "200px" }}>
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
                                <td>
                                  <div style={{ minWidth: "200px" }}>
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
                                <td><div style={{ minWidth: "100px" }}>{Number(product.taxExcl).toFixed(2) || 0}</div></td>
                                <td>
                                  <div style={{ minWidth: "100px" }}>
                                    <Tooltip title="Remove">
                                      <button type='button' className="icon-btn" onClick={() => removeProduct(index)}>
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
                      <button type='button' className="btn btn-outline-primary btn-sm" onClick={addProduct}>
                        <i class="fas fa-plus"></i>
                        <span class="ms-2"> Add Product</span>
                      </button>
                      <div className="col-12 text-right">

                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">Untaxed Amount : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol}
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
                      <div className="row">
                        <div className="col-12">
                          <div className="d-flex p-3 align-items-start">
                            <div className="alternative-text-area">
                              Create a call for tender by adding alternative requests
                              for quotation to different vendors. Make your choice by
                              selecting the best combination of lead time, OTD and/or
                              total amount. By comparing product lines you can also
                              decide to order some products from one vendor and others
                              from another vendor.
                            </div>

                            <div className="d-flex justify-content-end">
                              {StatusData < 3 ?
                                <button
                                  type="button"
                                  class="btn btn-outline-success me-2 btn-sm"
                                  onClick={() => setShow(true)}
                                >
                                  <i class="fas fa-plus"></i>
                                  <span class="ms-2"> Create Alternative</span>
                                </button>
                                : <></>
                              }
                              {/* {productsaddi.length > 0 ? ( */}
                              {/* <button
                            type="button"
                            class="btn btn-exp-red btn-sm text-nowrap"
                            onClick={() => {
                              setShowPrice(true);
                              PriceCompare();
                            }}
                          >
                            Compare Price
                          </button> */}
                              {/* ) : (
                          <p></p>
                        )} */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          {productsaddi.length > 0 ? (
                            <div className="table-responsive">
                              <table responsive className="table text-nowrap table-bordered primary-table-head table">
                                <thead>
                                  <tr>
                                    <th>Reference Number</th>
                                    <th>Customer</th>
                                    <th>Creation</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productsaddi.map((product) => (
                                    <tr key={product.id}>
                                      <td>
                                        <div style={{ minWidth: "200px" }}>
                                          {" "}

                                          {product.reference_number}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "200px" }}>
                                          {" "}

                                          {product.customer.name}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "200px" }}>
                                          {" "}

                                          {new Date(product.created_at).toLocaleString()}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "200px" }}>
                                          {" "}

                                          {getGeneralSettingssymbol} {product.total_amount}
                                        </div>
                                      </td>
                                      <td><div style={{ minWidth: "200px" }}>{getStatus(product.status)}</div></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="ml-3">
                              <b>No additional vendor found.</b>
                            </p>
                          )}
                        </div>
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
    </React.Fragment>
  );
}

export default EditMyPurchase;
