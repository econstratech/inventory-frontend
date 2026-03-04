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

import { Button, Table, Alert, Modal,OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,formatDateTimeForMySQL
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";

function EditMyPurchase() {
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
  const [purchaseName, setPurchaseName] = useState("");
  const [vendorId, setVendor] = useState("");
  const [orderDeadline, setOrderDeadline] = useState("");
  const [vendorReference, setVendorReference] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [buyer, setBuyer] = useState(userDetails.name);
  const [sourceDocument, setSourceDocument] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [productsaddi, setProductsaddi] = useState([]);
  const [ProductCompare, setProductCompare] = useState([]);
  const fetchProducts = async (id, venid) => {
    try {
      const response = await PrivateAxios.get(
        `/purchase/get_addi/${id}/${venid}`
      ); // Adjust the URL to your API endpoint
      
      if (response.status === 200 && Array.isArray(response.data)) {
        setProductsaddi(response.data);
        
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };
  const PriceCompare = async () => {
    try {
      const response = await PrivateAxios.get(
        `/purchase/getPurchasecompare/${id}`
      ); // Adjust the URL to your API endpoint
      
      if (response.status === 200 ) {
        setProductCompare(response.data);
      
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };


  const handleStatusChange = async (id,sid) => {
    const response = await PrivateAxios.put(`purchase/statuschange/${id}/${sid}`);
    const jsonData = response.data;
    if(response.status == 200)
        {
            SuccessMessage('Order Confirm Successfully.!');  
            setShowPrice(true);
            PriceCompare();
        }
    
}   
  useEffect(() => {
    PriceCompare()
    const fetchData = async () => {
      try {
        
        const response = await PrivateAxios.get(`/purchase/purchase/${id}`);
        const data = response.data;

       
        setVendor({ vendor_id: data.vendor_id });
        setOrderDeadline(data.order_dateline);
        setVendorReference(data.vendor_reference);
        setExpectedArrival(data.expected_arrival);
        setBuyer(data.buyer);
        setSourceDocument(data.source_document);
        setPaymentTerms(data.payment_terms);
        setProducts(data.products);

        fetchProducts(data.id, data.vendor_id);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
   
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => ({
        ...product,
        vendor_id: vendorId.vendor_id,
      }));
      const data = {
        vendor_id: vendorId.vendor_id,
        vendor_reference: vendorReference,
        order_dateline: formatDateTimeForMySQL(orderDeadline),

        expected_arrival: formatDateTimeForMySQL(expectedArrival),
        buyer,
        source_document: sourceDocument,
        payment_terms: paymentTerms,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };

      
      const response = await PrivateAxios.put(`purchase/update/${id}`, data);

      if (response.status === 200) {
        SuccessMessage("Data Updated.");
        
      } else {
       
        ErrorMessage("Failed to save data");
        console.error("Failed to save data");
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
        vendor_id: selectedOption.vendor_id_add,
      }));
      const data = {
        vendor_id: selectedOption.vendor_id_add,
        vendor_reference: vendorReference,
        is_parent_id: vendorId.vendor_id,
        is_parent: "0",
        parent_recd_id: id,
        order_dateline: formatDateTimeForMySQL(orderDeadline),
        expected_arrival: formatDateTimeForMySQL(expectedArrival),
        buyer,
        source_document: sourceDocument,
        payment_terms: paymentTerms,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };

      
      const response = await PrivateAxios.post(`purchase/add_addi`, data);

      if (response.status === 201) {
        SuccessMessage("Data Updated.");
        setShow(false);
        fetchProducts(id, vendorId.vendor_id);
      } else {
       
        ErrorMessage("Failed to save data");
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const getStatus = (status) => {
    if (status === 1) {
      return 'Active';
    } else if (status === 2) {
      return 'RFQ';
    } else if (status === 3) {
      return 'Send to management';
    } else if (status === 4) {
      return 'Review Confirmed';
    } else if (status === 5) { 
      return 'Order Confirm';
    }
  };
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
          <h3 className="card-title">Purchase Order</h3>
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
                            <td>
                              <i
                                class="bi bi-trash fa-lg"
                                onClick={() => removeProduct(index)}
                                style={{ cursor: "pointer" }}
                              ></i>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Button type='button' variant="primary" onClick={addProduct}>
                      Add Product
                    </Button>
                    <div className="col-12 text-right">
                      <p>
                        Untaxed Amount: ₹
                        {calculateTotal().untaxedAmount.toFixed(2)}
                      </p>
                      <p>SGST: ₹{calculateTotal().taxAmount.toFixed(2)}</p>
                      <p>CGST: ₹{calculateTotal().taxAmount.toFixed(2)}</p>
                      <h5>Total: ₹{calculateTotal().totalAmount.toFixed(2)}</h5>
                    </div>
                  </div>
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
                        <button
                          type="button"
                          class="btn btn-exp-green btn-sm me-2 text-nowrap"
                          onClick={() => setShow(true)}
                        >
                          Create Alternative
                        </button>
                        {productsaddi.length > 0 ? (
                          <button
                            type="button"
                            class="btn btn-exp-red btn-sm text-nowrap"
                            onClick={() => {
                              setShowPrice(true);
                              PriceCompare();
                            }}
                          >
                            Compare Price
                          </button>
                        ) : (
                          <p></p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    {productsaddi.length > 0 ? (
                      <table className="table ">
                        <thead>
                          <tr>
                            <th>Reference Number</th>
                            <th>Vendor</th>
                            <th>Expected Arrival</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productsaddi.map((product) => (
                            <tr key={product.id}>
                              <td>
                                {" "}
                                <Link to={`/purchase/${product.id}`}>
                                  {product.reference_number}
                                </Link>
                              </td>
                              <td>
                                {" "}
                                <Link to={`/purchase/${product.id}`}>
                                  {product.vendor.vendor_name}
                                </Link>
                              </td>
                              <td>
                                {" "}
                                <Link to={`/purchase/${product.id}`}>
                                  {new Date(product.expected_arrival)
                                    .toJSON()
                                    .slice(0, 10)}
                                </Link>
                              </td>
                              <td>
                                {" "}
                                <Link to={`/purchase/${product.id}`}>
                                  ₹ {product.total_amount}
                                </Link>
                              </td>
                              <td>{getStatus(product.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="ml-3">
                        <b>No additional products found.</b>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer text-end">
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>

      <Modal
        backdrop="static"
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Add New Alternative Vendor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleClick}>
            <div className="row">
              <div className="col-lg-8 col-md-8 col-sm-8 col-8">
                <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <Select
                    name="vendor_name"
                    required
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
                    onChange={(e) => setSelectedOption({ vendor_id_add: e.id })}
                  />
                </div>
              </div>
              <div className="col-4">
                <div class=" d-flex justify-content-end pt-3">
                  <button type="submit" class="btn btn-exp-green ">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        backdrop="static"
        centered
        size="xl"
        show={showPrice}
        onHide={() => setShowPrice(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Compare Price
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="table-bordered primary-table-head">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Reference</th>
                <th>Status</th>

                <th>Expected Date</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit of Measure</th>
                <th>Unit Price</th>
                <th> Price (Incl tax)</th>
                <th>Total</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ProductCompare.map((productPriceCompare) => (
                 
                 <tr className={productPriceCompare.status >= 5 ? 'confirmorder-tr':''}>
                  <td>{productPriceCompare.vendor.vendor_name} </td>
                  <td>{productPriceCompare.reference_number}</td>
                  <td>{getStatus(productPriceCompare.status)} </td>
                  <td> 
                    {new Date(productPriceCompare.expected_arrival)
                      .toJSON()
                      .slice(0, 10)}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.ProductsItem.product_name}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.qty}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.ProductsItem.unit}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.unit_price}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.taxIncl}</div>
                      </div>
                    ))}
                  </td>
                  <td>{productPriceCompare.total_amount}</td>
                  <td>
                    <div className="d-flex">
                    {productPriceCompare.status >=4 ? (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Choose</Tooltip>}
                      >
                        <button type='button' className="icon-btn me-2" style={{ cursor: 'pointer' }} onClick={() => handleStatusChange(productPriceCompare.id,5)}>
                       
                        {productPriceCompare.status == 5 ? (
                        <i class="bi bi-heart-fill 2x text-danger"></i>
                      ) : (
                        <i class="bi bi-heart-fill 2x "> </i>
                      )}
                        </button>
                      </OverlayTrigger> 
                    ):(
                      <p></p>
                    )
}
                      {/* <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Clear</Tooltip>}
                      >
                        <button type='button' className="icon-btn me-2">
                          <i class="bi bi-x-circle-fill"></i>
                        </button>
                      </OverlayTrigger> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

export default EditMyPurchase;
