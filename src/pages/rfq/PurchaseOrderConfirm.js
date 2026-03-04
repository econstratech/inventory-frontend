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
} from "react-bootstrap";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,
  formatDateTimeForMySQL,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import { Tooltip } from "antd";
const formattedDate = new Date().toLocaleDateString("en-GB");
function PurchaseOrderConfirm() {
  const { id } = useParams();

  const [error, setError] = useState({});
  const [alert, setAlert] = useState("");
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //console.log(vendorId.vendor_id);

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchBill = async () => {
    try {
      const billId = id;
      const response = await PrivateAxios.get(`/purchase/bill/${billId}`);

      setBill(response.data);
      setFormData({
        ...formData,
        amount: response.data.total_amount - response.data.advancePayment,
        memo: response.data.bill_number,
        bill_id: response.data.id,
      });
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, []);

  // const remAmount = bill && bill.total_amount - bill.advancePayment;

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    journal: "Bank",
    amount: "",
    paymentMethod: "NEFT",
    recipientBankAccount: "",
    memo: '',
    bill_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await PrivateAxios.post(`/purchase/payment/${id}`, formData);

      SuccessMessage("Record Updated Successfully.");
      navigate(`/confirmedbill/${id}`);
    } catch (error) {
      console.log('Error registering payment: ' + error);

    }
  };



  return (
    <React.Fragment>
      <div className="p-4">
        <div className="card mb-0">
          <div className="card-header d-flex jusfity-content-between align-items-center">
            <h3 className="card-title me-4">
              Confirm Order
            </h3>
            
          </div>
          {bill ? (
            <>
              <div className="card-body pb-1">
                <div className="product_table p-3 mb-3">
                  <div className="row">
                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="mb-1">
                        <span className="f-s-16 fw-medium text-primary-grey-4">Vendor Bill : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.bill_number}</span>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="mb-1">
                        <span className="f-s-16 fw-medium text-primary-grey-4">Vendor : </span>{" "}
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.vendorname.vendor_name}</span>

                      </div>
                    </div>

                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="mb-1">
                        <span className="f-s-16 fw-medium text-primary-grey-4">Bill Date : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2"> {bill.bill_date}</span>

                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="mb-1">
                        <span className="f-s-16 fw-medium text-primary-grey-4">Bill Reference : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.bill_reference}</span>

                      </div>
                    </div>

                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="mb-1">
                        <span className="f-s-16 fw-medium text-primary-grey-4">Accounting Date : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{formatDateTimeForMySQL(bill.accounting_date)}</span>

                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="mb-1">
                        <span className="f-s-16 fw-medium text-primary-grey-4">Place Of Supply : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.placeofsupply}</span>

                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="mb-1">
                        <span className="f-s-16 fw-medium text-primary-grey-4">Payment Reference : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.paymentreference}</span>

                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 pt-4">
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
                          <table className="table text-nowrap table-bordered primary-table-head">
                            <thead>
                              <tr>
                                <th>Product</th>

                                <th>Quantity (Demand)</th>
                                <th>Received (Quantity)</th>
                                <th>Price</th>

                                <th>Taxes (%)</th>
                                <th>Tax Excl.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bill.products.map((product) => (
                                <tr>
                                  {" "}
                                  <td>
                                    <div style={{ minWidth: "200px" }}>
                                      {product &&
                                        product.ProductsItem &&
                                        product.ProductsItem.product_name}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "200px" }}>
                                      {product.qty}
                                    </div>
                                  </td>
                                  <td><div style={{ minWidth: "200px" }}>{product.received}</div></td>
                                  <td><div style={{ minWidth: "100px" }}>{product.unit_price}</div></td>
                                  <td><div style={{ minWidth: "100px" }}>{product.tax}</div></td>
                                  <td><div style={{ minWidth: "100px" }}>{product.taxExcl}</div></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="col-12 text-right">

                          <div className="mb-2">
                            <span className="f-s-16 fw-medium text-primary-grey-4">Untaxed Amount : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-2">₹ {bill.untaxed_amount}</span>
                          </div>
                          <div className="mb-2">
                            <span className="f-s-16 fw-medium text-primary-grey-4">SGST : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-2">₹ {bill.sgst}</span>
                          </div>
                          <div className="mb-2">
                            <span className="f-s-16 fw-medium text-primary-grey-4">CGST : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-2">₹ {bill.cgst}</span>
                          </div>
                          <div className="mb-2">
                            <span className="f-s-16 fw-medium text-primary-grey-4">Total : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-2">₹ {bill && bill.total_amount}</span>
                          </div>
                          <div className="mb-2">
                            <span className="f-s-16 fw-medium text-primary-grey-4">Advance Payment : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-2">₹ {bill.advancePayment}</span>
                          </div>
                          <div className="mb-2">
                            <span className="f-s-16 fw-medium text-primary-grey-4"> Amount Due : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-2">₹ {(bill && bill.total_amount - bill.advancePayment).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div className="card-footer d-flex justify-content-end">
                <button type='button' className="btn btn-exp-green" onClick={handleShow}>
                  Register Payment{" "}
                </button>
              </div>
            </>
          ) : (
            <p>Bill not found</p>
          )}
        </div>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        animation={true}
        backdrop="static"
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Register Payment
          </Modal.Title>
        </Modal.Header>{" "}
        <form onSubmit={handleSubmit}>
          <Modal.Body className="pb-1">
            <div class="form-group ">
              <label for="journal" class=" form-label">
                Journal
              </label>
              {/* <div class=""> */}
              <input
                type="text"
                class="form-control"
                required
                name="journal"
                id="journal"
                value={formData.journal}
                onChange={handleChange}
                readonly
              />
              {/* </div> */}
            </div>
            <div class="form-group ">
              <label for="amount" class="form-label">
                Amount
              </label>
              {/* <div class="col-sm-8"> */}
              <input
                type="text"
                class="form-control"
                required
                name="amount"
                id="amount"
                value={formData.amount}
                onChange={handleChange}
                readOnly
              />
              {/* </div> */}
            </div>
            <div class="form-group ">
              <label for="paymentMethod" class=" form-label">
                Payment Method
              </label>
              {/* <div class="col-sm-8"> */}
              <input
                type="text"
                class="form-control"
                required
                name="paymentMethod"
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                readonly
              />
              {/* </div> */}
            </div>

            <div class="form-group ">
              <label for="recipientBankAccount" class="form-label">
                Recipient Bank Account
              </label>
              {/* <div class="col-sm-8"> */}
              <input
                type="text"
                class="form-control"
                required
                name="recipientBankAccount"
                id="recipientBankAccount"
                value={formData.recipientBankAccount}
                onChange={handleChange}
                readonly
              />
              {/* </div> */}
            </div>
            <div class="form-group ">
              <label for="memo" class="form-label">
                Memo
              </label>
              {/* <div class="col-sm-8"> */}
              <input
                type="text"
                class="form-control"
                required
                name="memo"
                id="memo"
                value={formData.memo} onChange={handleChange} readOnly />
              {/* </div> */}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-exp-green">
              Save Changes
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </React.Fragment>
  );
}

export default PurchaseOrderConfirm;
