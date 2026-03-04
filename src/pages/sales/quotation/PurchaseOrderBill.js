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

import {
  Button,
  Table,
  Alert,
  Modal,
  OverlayTrigger,
  Popover,
  Tooltip,
} from "react-bootstrap";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";

function PurchaseOrderBill() {
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
    "Delhi",
    "Puducherry",
    "Ladakh",
    "Jammu and Kashmir",
  ];
  const { id } = useParams();
  const [total, setTotal] = useState("");
  const { vendor, userDetails, productData } = UserAuth();
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

  const [setPaymentReference, PaymentReference] = useState("");

  const [vendorId, setVendor] = useState("");
  const [orderDeadline, setOrderDeadline] = useState("");
  const [billReference, setBillReference] = useState("");
  const [setAccountingDate, AccountingDate] = useState("");
  const [buyer, setBuyer] = useState(userDetails.name);
  const [sourceDocument, setSourceDocument] = useState("");
  const [setBillNumber, getBillNumber] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [setBillDate, BillDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const fetchProducts = async (id, venid) => {
    try {
      const response = await PrivateAxios.get(
        `/purchase/get_addi/${id}/${venid}`
      ); // Adjust the URL to your API endpoint
      //console.log(response);
      if (response.status === 200 && Array.isArray(response.data)) {
        //console.log(response.data);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };

  //   const PriceCompare = async () => {
  //     try {
  //       const response = await PrivateAxios.get(
  //         `/purchase/getPurchasecompare/${id}`
  //       ); // Adjust the URL to your API endpoint
  //       console.log(response.data);
  //       if (response.status === 200 ) {
  //         setProductCompare(response.data);

  //       }
  //     } catch (error) {
  //       console.error("There was an error fetching the product list!", error);
  //     }
  //   };

  //   const handleStatusChange = async (id,sid) => {
  //     const response = await PrivateAxios.put(`purchase/statuschange/${id}/${sid}`);
  //     const jsonData = response.data;
  //     if(response.status == 200)
  //         {
  //             SuccessMessage('Order Confirm Successfully.!');
  //             setShowPrice(true);
  //             PriceCompare();
  //         }

  // }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get(`/purchase/purchase/${id}`);
        const data = response.data;
        //console.log(data.reference_number);
        setVendor({ vendor_id: data.vendor_id });

        setBillReference(data.bill_reference);

        getBillNumber(data.reference_number);
        setBuyer(data.buyer);
        setSourceDocument(data.source_document);

        setProducts(data.products);
        setAdvancePayment(data.advance);
        fetchProducts(data.id, data.vendor_id);
        //console.log("State updated with fetched data");
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

  const navigate = useNavigate();
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0"); // Adding 1 because getMonth() returns 0-11
  const billNumber = `BILL/${currentYear}/${currentMonth}/${setBillNumber}`;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => ({
        ...product,
        vendor_id: vendorId.vendor_id,
      }));
      const data = {
        purchase_id: id,
        bill_number: billNumber,
        vendor_id: vendorId.vendor_id,
        bill_date: setBillDate,
        bill_reference: billReference,
        accounting_date: setAccountingDate,
        placeofsupply: selectedState,
        buyer,
        paymentreference: setPaymentReference,

        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        advancePayment: advancePayment != null ? advancePayment.amount : "0.00",
      };

      //console.log(data);
      const response = await PrivateAxios.post(`purchase/bill/new/${id}`, data);

      if (response.status === 200) {
        SuccessMessage("Bill Created successfully");
        navigate(`/bill/confirm-order/${id}`);
        //console.log("Data saved successfully", response.data);
      } else {
        //console.log(response.status);
        ErrorMessage("Failed to save data");
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

 // console.log(setBillNumber);

  return (
    <React.Fragment>
      <div className="mb-4">
        <Link to="/purchase" className="text-dark back-btn">
          <i className="bi bi-arrow-left-short me-1" />
          Back
        </Link>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Create Bill</h3>
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
                  <Select
                    name="vendor_name"
                    isDisabled={true}
                    value={vendor.find((v) => v.id === vendorId.vendor_id)}
                    options={vendor}
                    getOptionLabel={(option) => option.vendor_name}
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

              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Bill Date </label>
                  <input
                    type="datetime-local"
                    readOnly
                    value={new Date().toJSON().slice(0, 16)}
                    onChange={(e) => BillDate(e.target.value)}
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
                    value={billReference}
                    onChange={(e) => setBillReference(e.target.value)}
                    placeholder="Bill Reference"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Accounting Date</label>
                  <input
                    type="datetime-local"
                    value={
                      setAccountingDate != ""
                        ? new Date(setAccountingDate).toJSON().slice(0, 16)
                        : ""
                    }
                    onChange={(e) => AccountingDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Place Of Supply</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="form-control"
                  >
                    <option value="">--Select a state--</option>
                    {indianStates.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Payment Reference</label>
                  <input
                    value={setPaymentReference}
                    onChange={(e) => PaymentReference(e.target.value)}
                    placeholder="Payment Reference"
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="col-12">
              <div style={{ width: "100%" }}>
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
                    class="tab-pane fade show active"
                    id="personal"
                    role="tabpanel"
                    aria-labelledby="personal-tab"
                  >
                    {alert && <Alert variant="danger">{alert}</Alert>}
                    <table className="table ">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Description</th>
                          <th>Quantity</th>
                          <th>Received</th>
                          <th>Billed</th>
                          <th>Unit Price</th>
                          <th>Taxes (%)</th>
                          <th>Tax Excl.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => (
                          <tr key={index}>
                            <td>
                              <div style={{ minWidth: "200px" }}>
                                <Select
                                  name="product_id"
                                  isDisabled={true}
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
                                />
                              </div>
                            </td>
                            <td>
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
                            </td>
                            <td>
                              <input
                                type="number"
                                name="qty"
                                disabled
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
                            </td>
                            <td>
                              <input
                                type="number"
                                name="received"
                                value={product.received}
                                onChange={(e) =>
                                  handleProductChange(
                                    index,
                                    "received",
                                    e.target.value
                                  )
                                }
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                name="billed"
                                readOnly="true"
                                value={product.billed}
                                onChange={(e) =>
                                  handleProductChange(
                                    index,
                                    "billed",
                                    e.target.value
                                  )
                                }
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                name="unit_price"
                                readOnly="true"
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
                            </td>
                            <td>
                              <input
                                type="number"
                                name="tax"
                                readOnly="true"
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
                            </td>
                            <td>{Number(product.taxExcl).toFixed(2) || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="col-12 text-right">
                      <p>
                        Untaxed Amount: ₹
                        {calculateTotal().untaxedAmount.toFixed(2)}
                      </p>
                      <p>SGST: ₹{calculateTotal().taxAmount.toFixed(2)}</p>
                      <p>CGST: ₹{calculateTotal().taxAmount.toFixed(2)}</p>
                      <h5>Total: ₹{calculateTotal().totalAmount.toFixed(2)}</h5>
                      <h5>
                        Advance Payment : ₹{" "}
                        {advancePayment != null
                          ? advancePayment.amount
                          : "0.00"}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer text-end">
              <Button variant="primary" type="submit">
                Create Bill
              </Button>
            </div>
          </div>
        </form>
      </div>
    </React.Fragment>
  );
}

export default PurchaseOrderBill;
