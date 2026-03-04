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

function MyNewpurchaseOrderAdvance() {
  const { id } = useParams();
  const [total, setTotal] = useState("");
  const { vendor, userDetails, productData, getGeneralSettingssymbol } =
    UserAuth();

  const [error, setError] = useState({});
  const [alert, setAlert] = useState("");
  const [show, setShow] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [catProduct, setCategory] = useState([
    { value: "select", label: "-Select-" },
  ]);
  const [products, setProducts] = useState([]);

  const [vendorId, setVendor] = useState("");
  const [orderDeadline, setOrderDeadline] = useState("");
  const [vendorReference, setVendorReference] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [buyer, setBuyer] = useState(userDetails.name);
  const [sourceDocument, setSourceDocument] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [productsaddi, setProductsaddi] = useState([]);

  const [advancerecv, setAdvancepayment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      amount: advancerecv,
      purchase_id: id,
    };
    //console.log(data);
    PrivateAxios.post("purchase/insertadvancepayment", data)
      .then((res) => {
        if (res.status === 201) {
          setShowPrice(false);
          SuccessMessage("Advance payment added successfully");
          navigate("/operation/purchase-orders/received-done");
        }
      })
      .catch((err) => {
        ErrorMessage(
          "Error: Server busy please try again after some time later"
        );
      });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching data for purchase ID: ${id}`);
        const response = await PrivateAxios.get(`/purchase/purchase/${id}`);
        const data = response.data;

        console.log("Fetched data:", data);
        setVendor({ vendor_id: data.vendor_id });
        setOrderDeadline(data.order_dateline);
        setVendorReference(data.vendor_reference);
        setExpectedArrival(data.expected_arrival);
        setBuyer(data.buyer);
        setSourceDocument(data.source_document);
        setPaymentTerms(data.payment_terms);
        setProducts(data.products);
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

  const navigate = useNavigate();

  return (
    <React.Fragment>
    <div className="p-4">
      <div className="mb-4">
        {/* <Link to="/operation/purchase-orders/received-done" className="text-dark ">
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
          <h3 className="card-title">Advance Payment</h3>
        </div>

        <form onSubmit={handleSubmit} method="post">
          <div className="card-body pb-1">
            <div className="row">
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
                  <label className="form-label">Order Deadline </label>
                  <input
                    type="datetime-local"
                    readOnly
                    value={
                      orderDeadline != ""
                        ? new Date(orderDeadline).toJSON().slice(0, 16)
                        : ""
                    }
                    onChange={(e) => setOrderDeadline(e.target.value)}
                    required
                    className="form-control"
                  />
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
                  <label className="form-label">Expected Arrival</label>
                  <input
                    type="datetime-local"
                    value={
                      expectedArrival != ""
                        ? new Date(expectedArrival).toJSON().slice(0, 16)
                        : ""
                    }
                    onChange={(e) => setExpectedArrival(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Buyer</label>
                  <input
                    readOnly
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                    placeholder="Buyer"
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

            <div className="row">
              <div className="col-12 mt-4">
                <div className="w-100">
                  <ul className="nav nav-tabs gth-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link active"
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
                  <div className="tab-content" id="myTabContent">
                    <div
                      className="tab-pane fade show active pt-3"
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
                              <th>Description</th>
                              <th>Quantity</th>
                              <th>Received</th>
                              <th>Billed</th>
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
                                    <Select
                                      name="product_id"
                                      isDisabled={true}
                                      value={productData?.length > 0 ? productData.find(
                                        (p) => p.id === product.product_id
                                      ) : null}
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
                                    disabled
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
                                    disabled
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
                                <td>
                                  {Number(product.taxExcl).toFixed(2) || 0}
                                </td>
                                <td>
                                  <i
                                className="fas fa-trash-alt text-danger"
                                // onClick={() => removeProduct(index)}
                                style={{ cursor: "pointer" }}
                              ></i>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      {/* <Button variant="primary" onClick={addProduct}>
                      Add Product
                    </Button> */}
                      <div className="row align-items-center">
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

                        <div className="col-12 mb-4 mt-3">
                          <div className="row align-items-center">
                            <div className="col-10 text-right">
                              <p className="exp-primary-grey-4 fw-semibold mb-0 f-s-16">
                                Advance Payment
                              </p>
                            </div>
                            <div className="col-2">
                              <input
                                type="number"
                                name="advancepaymentreceived"
                                onChange={(e) =>
                                  setAdvancepayment(e.target.value)
                                }
                                value={advancerecv}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="employment"
                  role="tabpanel"
                  aria-labelledby="employment-tab"
                ></div>
              </div>
            </div>
          </div>
          <div className="card-footer text-end ">
            <button className="btn btn-success" type="submit">
              Save
            </button>
          </div>
        </form>
      </div>
      </div>
    </React.Fragment>
  );
}

export default MyNewpurchaseOrderAdvance;
