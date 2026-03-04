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
  formatDateTimeForMySQL,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
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
    memo:  '',
    bill_id:"",
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
      <div className="mb-4"></div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Confirm Order{" "}
           
          </h3>
        </div>
        {bill ? (
          <div className="card-body pb-1">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                <div className="form-group">
                  <label className="form-label">Vendor Bill</label>
                  <h3>{bill.bill_number}</h3>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Vendor</label>{" "}
                  {bill.vendorname.vendor_name}
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Bill Date </label>
                  {bill.bill_date}
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Bill Reference</label>
                  {bill.bill_reference}
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Accounting Date</label>
                  {formatDateTimeForMySQL(bill.accounting_date)}
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Place Of Supply</label>
                  {bill.placeofsupply}
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Payment Reference</label>
                  {bill.paymentreference}
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

                          <th>Quantity</th>
                          <th>Received</th>
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
                            <td>{product.qty}</td>
                            <td>{product.received}</td>
                            <td>{product.unit_price}</td>
                            <td>{product.tax}</td>
                            <td>{product.taxExcl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="col-12 text-right">
                      <p>Untaxed Amount: ₹{bill.untaxed_amount}</p>
                      <p>SGST: ₹ {bill.sgst}</p>
                      <p>CGST: ₹ {bill.cgst}</p>
                      <h3>Total: ₹ {bill && bill.total_amount}</h3>
                      <h3>Advance Payment : ₹ {bill.advancePayment}</h3>
                      <h3>
                        Amount Due : ₹{" "}
                        {(bill && bill.total_amount - bill.advancePayment).toFixed(2)}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer text-end">
              <Button type='button' variant="primary" onClick={handleShow}>
                Register Payment{" "}
              </Button>
            </div>
          </div>
        ) : (
          <p>Bill not found</p>
        )}
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        animation={true}
        backdrop="static"
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Register Payment
          </Modal.Title>
        </Modal.Header>{" "}
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div class="form-group row">
              <label for="journal" class="col-sm-4 col-form-label">
                Journal
              </label>
              <div class="col-sm-8">
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
              </div>
            </div>
            <div class="form-group row">
              <label for="amount" class="col-sm-4 col-form-label">
                Amount
              </label>
              <div class="col-sm-8">
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
              </div>
            </div>
            <div class="form-group row">
              <label for="paymentMethod" class="col-sm-4 col-form-label">
                Payment Method
              </label>
              <div class="col-sm-8">
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
              </div>
            </div>
           
            <div class="form-group row">
              <label for="recipientBankAccount" class="col-sm-4 col-form-label">
                Recipient Bank Account
              </label>
              <div class="col-sm-8">
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
              </div>
            </div>
            <div class="form-group row">
              <label for="memo" class="col-sm-4 col-form-label">
                Memo
              </label>
              <div class="col-sm-8">
                <input
                  type="text"
                  class="form-control"
                  required
                  name="memo"
                  id="memo"
                  value={formData.memo} onChange={handleChange} readOnly />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </React.Fragment>
  );
}

export default PurchaseOrderConfirm;
