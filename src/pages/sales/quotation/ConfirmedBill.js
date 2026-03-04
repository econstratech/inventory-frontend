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



function ConfirmedBill() {
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
    right: '0',
    top: '0',
    background: '#28a745',
    color: 'white',
    padding: '12px 50px',
    transform: 'rotate(45deg)',
    transformOrigin: 'right top'
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
           <div class="container mt-5">
           <div class="position-relative">
               <h3>Vendor Bill</h3>
               <h4>{bill.bill_number}</h4>
               <span style={styles}>PAID</span>
           </div>
           <div class="row">
               <div class="col-md-6">
                   <p><strong>Vendor:</strong>  {bill.vendorname.vendor_name}</p>
                   <p><strong>Location:</strong>  {bill.vendorname.country}</p>
               </div>
               <div class="col-md-6 text-right">
                   <p><strong>Bill Date:</strong> {bill.bill_date}</p>
                   <p><strong>Accounting Date:</strong> {formatDateTimeForMySQL(bill.accounting_date)}</p>
                   <p><strong>Payment Reference:</strong> {bill.paymentreference}</p>
                   <p><strong>Recipient Bank:</strong> {bill && bill.allBill && bill.allBill.recipientBankAccount} </p>
                   
               </div>
           </div>
           <div class="row">
               <div class="col-md-12">
                   <p><strong>Place of supply:</strong>  {bill.placeofsupply}</p>
                   <p><strong>GST Treatment:</strong> {bill.vendorname && bill.vendorname.gst_treatment}</p>
               </div>
           </div>
           
           <table className="table table-bordered mt-3 ">
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
                             <h4>Total: ₹ {bill && bill.total_amount}</h4>
                             <h4>Payment Made : ₹{Number((bill.advancePayment)) + Number((bill.allBill.amount))}</h4>
                             <h3>
                               Amount Due : ₹{" "}
                               {Number((bill && bill.total_amount)) - (Number((bill.advancePayment)) + Number((bill.allBill.amount)))}
                             </h3>
                           </div>
       
       </div>
        ) : (
          <p>Bill not found</p>
        )}
      </div>










     
    
    </React.Fragment>
  );
}

export default ConfirmedBill;
