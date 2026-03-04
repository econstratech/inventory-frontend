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
import { useRef } from "react";
const formattedDate = new Date().toLocaleDateString("en-GB");



function ConfirmedBill() {
  const { id } = useParams();

  const [error, setError] = useState({});
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
  const styles = {
    position: 'absolute',
    left: '22px',
    bottom: '0',
    transform: 'rotate(-14deg)',
    maxWidth: '150px',
    width: '100%',
  };

  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const WinPrint = window.open('', '', 'width=900,height=650');
    WinPrint.document.write(`
    <html>
      <head>
        <title>Print Bill</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .border { border: 1px solid #ccc; }
          .p-4 { padding: 1.5rem; }
          .rounded-lg { border-radius: 0.5rem; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };
  return (
    <React.Fragment>
      <div className="p-4">
        <div className="card mb-0">
          <div className="card-header">
            <h3 className="card-title">
              Confirm Order{" "}

            </h3>
          </div>
          {bill ? (
            <div className="card-body">
              <div className="mb-3">
                <Tooltip title="Print">
                  <button type="button" className="icon-btn ms-auto" onClick={handlePrint}>
                    <i class="fas fa-print"></i>
                  </button>
                </Tooltip>
              </div>
              <div class="">
                <div class="border p-4 rounded-lg" ref={printRef} id="print-section" >
                  <div class="">
                    <h3>Vendor Bill</h3>
                    <h4>{bill.bill_number}</h4>

                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <p className="mb-1"> <span className="f-s-16 fw-medium text-primary-grey-4">Vendor : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.vendorname.vendor_name}</span>
                      </p>
                      <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-4">Location : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.vendorname.country}</span></p>
                    </div>
                    <div class="col-md-6 text-right">
                      <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-4">Bill Date : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.bill_date}</span></p>
                      <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-4">Accounting Date : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{formatDateTimeForMySQL(bill.accounting_date)}</span></p>
                      <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-4">Payment Reference : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.paymentreference}</span></p>
                      <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-4">Recipient Bank : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill && bill.allBill && bill.allBill.recipientBankAccount}</span></p>

                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-4">Place of supply : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.placeofsupply}</span></p>
                      <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-4">GST Treatment : </span>
                        <span className="fw-semibold f-s-16 text-primary-grey-2">{bill.vendorname && bill.vendorname.gst_treatment}</span></p>
                    </div>
                  </div>
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
                            <td><div style={{ minWidth: "150px" }}>{product.qty}</div></td>
                            <td><div style={{ minWidth: "150px" }}>{product.received}</div></td>
                            <td><div style={{ minWidth: "150px" }}>{product.unit_price}</div></td>
                            <td><div style={{ minWidth: "150px" }}>{product.tax}</div></td>
                            <td><div style={{ minWidth: "150px" }}>{product.taxExcl}</div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="col-12 text-right mt-3 position-relative">
                    <div style={styles}>
                      <img
                        src={process.env.PUBLIC_URL + "/assets/images/paid.png"}
                        alt="placeholder"
                        className="img-fluid"
                      />
                    </div>
                    <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-3">Sub Total : </span>
                      <span className="fw-semibold f-s-16 text-primary-grey-1">₹ {bill.untaxed_amount}</span></p>
                    <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-3">SGST : </span>
                      <span className="fw-semibold f-s-16 text-primary-grey-1">₹ {bill.sgst}</span></p>
                    <p className="mb-3"><span className="f-s-16 fw-medium text-primary-grey-3">CGST : </span>
                      <span className="fw-semibold f-s-16 text-primary-grey-1">₹ {bill.cgst}</span></p>
                    <p className="mb-1"><span className="f-s-20 fw-semibold text-primary-grey-2">Total : </span>
                      <span className="fw-semibold f-s-20 text-primary-grey-1">₹ {bill && bill.total_amount}</span></p>
                    <p><span className="f-s-20 fw-semibold text-primary-grey-2">Payment Made : </span>
                      <span className="fw-semibold f-s-20 text-primary-grey-1">₹ {Number((bill.advancePayment)) + Number((bill.allBill.amount))}</span></p>
                    <p className="border-top pt-3 mb-0"><span className="fs-4 fw-semibold text-primary-grey-2">Amount Due : </span>
                      <span className="fw-semibold fs-4 text-primary-grey-1">₹ {Number((bill && bill.total_amount)) - (Number((bill.advancePayment)) + Number((bill.allBill.amount)))}</span>

                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Bill not found</p>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default ConfirmedBill;
