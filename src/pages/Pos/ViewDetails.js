import React, { useEffect, useState } from "react";
import { Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import Invoice from "./Invoice";
import { useNavigate } from "react-router-dom"; // Required if using navigate

import AutoHeightTextarea from "../CommonComponent/AutoHeightTextarea";
import { Upload } from "@progress/kendo-react-upload";
import { Tooltip } from "antd";
import { UserAuth } from "../auth/Auth";
import { PrivateAxios, PrivateAxiosFile, url } from "../../environment/AxiosInstance";
import Select from "react-select";
import { SuccessMessage, ErrorMessage } from "../../environment/ToastMessage";

const ViewDetails = () => {
  const { isLoading, setIsLoading, Logout } = UserAuth();
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const { getGeneralSettingssymbol } = UserAuth();
  const [remarksMap, setRemarksMap] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [formData, setFormData] = useState({
    companyInformation: "",
    state: "",
    city: "",
    country: "",
  });
  const navigate = useNavigate();
  // count start
  const [count, setCount] = useState(1);
  const [datacustomer, setData] = useState([]);


  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await PrivateAxios.get("customer/all-customers");
      const customerList = res.data.data.rows.map((item) => ({
        ...item,
      }));

      setData(customerList);
    } catch (err) {
      if (err.response?.status === 401) {
        Logout();
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setCount(value);
    } else {
      setCount(0);
    }
  };
  // count end
  const [vendorId, setVendor] = useState({
    customer_id: "",
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceClose = () => setShowInvoice(false);
  const invoiceShow = () => setShowInvoice(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const paymentClose = () => setShowPayment(false);
  const paymentShow = () => setShowPayment(true);

  const getTaskData = async (e, data) => {
    if (e.target) {
      var name = e.target.name;
      setFormData({ ...formData, [name]: e.target.value });
    } else {
      setFormData({ ...formData, [data.name]: e.id });
    }
  };

  const [cart, setCart] = useState({});
  const [cartProducts, setCartProducts] = useState([]);

  useEffect(() => {
    const storedCart = sessionStorage.getItem("cart");
    const storedProducts = sessionStorage.getItem("cartProducts");
    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedProducts) setCartProducts(JSON.parse(storedProducts));
  }, []);

  const updateQuantity = (productId, delta) => {
    const updatedCart = { ...cart };
    const currentItem = updatedCart[productId];

    if (!currentItem) return;

    const newQty = (currentItem.quantity || 0) + delta;

    if (newQty <= 0) {
      delete updatedCart[productId];
    } else {
      updatedCart[productId] = {
        ...currentItem,
        quantity: newQty,
      };
    }

    const updatedProducts = cartProducts.filter(
      (product) => updatedCart[product.id]
    );

    setCart(updatedCart);
    setCartProducts(updatedProducts);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    sessionStorage.setItem("cartProducts", JSON.stringify(updatedProducts));
  };

  // Handles product removal
  const removeProduct = (productId) => {
    const updatedCart = { ...cart };
    delete updatedCart[productId];

    const updatedProducts = cartProducts.filter((p) => p.id !== productId);

    setCart(updatedCart);
    setCartProducts(updatedProducts);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    sessionStorage.setItem("cartProducts", JSON.stringify(updatedProducts));
  };

  const calculateTotals = () => {
    let subtotal = 0, sgst = 0, cgst = 0, igst = 0;
    cartProducts.forEach((product) => {
      const qty = cart[product.id]?.quantity || 0;
      const price = parseFloat(product.product_price || 0);
      const tax = parseFloat(product.tax || 0);
      const productSubtotal = qty * price;
      subtotal += productSubtotal;
      const taxPerSide = (productSubtotal * tax) / 100 / 2;
      sgst += taxPerSide;
      cgst += taxPerSide;
    });
    return { subtotal, sgst, cgst, igst };
  };
  const { subtotal, sgst, cgst, igst } = calculateTotals();
  const grandTotal = subtotal + sgst + cgst + igst + shipping - discount;

  const getTotalItemCount = () => {
    return Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const handlePlaceOrder = async (paymentType) => {
    const orderPayload = {
      customer_id: vendorId.customer_id,
      products: cartProducts.map((product) => ({
        product_id: product.id,
        quantity: cart[product.id]?.quantity || 0,
        price: product.product_price,
        store_id: cart[product.id]?.store_id || null,
        remarks: remarksMap[product.id] || "",
      })),
      shipping,
      discount,
      subtotal,
      taxes: { sgst, cgst, igst },
      grandTotal,
      shipping_address: shippingAddress,
      payment_type: paymentType,
    };

    try {
      const response = await PrivateAxios.post("/pos/place-order", orderPayload);

      if (paymentType === "online") {
        const { key_id, razorpayOrderId, orderId } = response.data;

        const options = {
          key: key_id,
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          name: selectedCustomer?.name || "Your Company Name",
          description: "Payment for Order",
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              await PrivateAxios.post("/pos/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                custom_order_id: orderId,
              });
              SuccessMessage("Payment successful!");
              sessionStorage.removeItem("cart");
              sessionStorage.removeItem("cartProducts");
              navigate(`/pos/thank-you?order_id=${orderId}`);
            } catch {
              sessionStorage.clear();
              navigate("/pos/thank-you");
            }
          },
          prefill: {
            name: selectedCustomer?.name,
            email: selectedCustomer?.email || "",
          },
          theme: { color: "#3399cc" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const { orderId, redirectUrl } = response.data;
        SuccessMessage(`Order #${orderId} placed successfully!`);
        sessionStorage.removeItem("cart");
        sessionStorage.removeItem("cartProducts");
        navigate(redirectUrl || "/pos/thank-you");
      }

      paymentClose();
    } catch (err) {
      console.error("Order placement failed", err);
      ErrorMessage("Order placement failed. Please try again.");
    }
  };

  //customer details add button
  const [showAddCustomerDetails, setShowAddCustomerDetails] = useState(false);
  const [addCustomerForm, setAddCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();

    const { name, phone, email, address, city,
      state,
      zip,
      country, } = addCustomerForm;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("zip", zip);
    formData.append("country", country);

    try {
      const res = await PrivateAxiosFile.post("customer/add", formData);
      if (res.status === 200) {
        SuccessMessage("Customer added successfully!");
        setShowAddCustomerDetails(false);
        fetchCustomers();
      }
    } catch (error) {
      ErrorMessage(error.response?.data?.message || "Customer creation failed!");
      console.error(error);
    }
  };

  return (
    <>
      <div class="px-4 pt-4 pb-2">
        <div class="wrapper wrapper-content animated fadeInRight">
          <div class="row flex-row-reverse">
            <div class="col-xl-5 col-lg-12">
              <div class="card stickyBox">
                <div class="card-body">
                  <div class="ibox-title border-bottom d-flex justify-content-between align-items-center gap-2 pb-3">
                    <h5 className="fw-semibold text mb-0">Order Summary</h5>
                  </div>
                  <div className=" d-flex justify-content-between gap-2 flex-wrap align-items-end mt-3">
                    {/* <div className='col-xl-10 col-lg-8'> */}
                    <div className="form-group mb-0 flex-fill">
                      <label className="form-label">
                        Company/Customer Information{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="vendor_name"
                        options={datacustomer}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onChange={(selected) => {
                          setVendor({ ...vendorId, customer_id: selected.id });
                          setSelectedCustomer(selected);

                          // If "Same as above" is checked, update shipping too
                          if (sameAsBilling) {
                            const fullAddress = `${selected.address}, ${selected.city} - ${selected.zip}, ${selected.state}, ${selected.country}`;
                            setShippingAddress(fullAddress);
                          }
                        }}
                      />
                    </div>
                    {/* </div> */}
                    <div className="d-flex align-items-center gap-2">

                      <Tooltip title="Add Customer Details">
                        <button
                          type="button"
                          className="btn fit-btn btn-primary"
                          style={{ height: "38px" }}
                          onClick={() => setShowAddCustomerDetails((prev) => !prev)}
                        >
                          <i className="fas fa-user-plus"></i>
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* <div class="btn-exp-purple-outline discount_box p-2 rounded-3 d-flex align-items-center justify-content-between bg-purple-transparent mt-3  gap-2 mb-3 ">
                    <div class="d-flex align-items-center">
                      <span class="discount_icon gth-bg-primary flex-shrink-0 me-2">
                        <i class="fas fa-tag"></i>
                      </span>
                      <div>
                        <h6 class="fs-14 fw-bold text-purple mb-1">
                          Discount 5%
                        </h6>
                        <p class="mb-0 text-primary-grey-4">
                          For ₹20 Minimum Purchase, all Items
                        </p>
                      </div>
                    </div>
                    <button class=" bg-transparent fw-semibold border-0 text-end text-primary-grey-5 f-s-12 text-exp-red ">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div> */}

                  <div>
                    <div className="d-flex align-items-center p-2 gap-2 mb-3 mt-3">
                      <h6 className="fw-semibold text mb-0">Short Item</h6>
                      <label class="badge badge-outline-active mb-0 fw-bold">
                        Items: {getTotalItemCount()}
                      </label>
                    </div>

                    <div className="table_borderless">
                      <Table responsive class="table ">
                        <thead>
                          <tr>
                            <th class="fw-bold bg-light">Item</th>
                            <th class="fw-bold bg-light text-center">QTY</th>
                            <th class="fw-bold bg-light text-end">Cost</th>
                            <th class="fw-bold bg-light text-end"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartProducts.map((product) => (
                            <tr>
                              <td>
                                <div class="d-flex align-items-center min-width-150 max-width-150">
                                  <h6 class="f-s-12 mb-0 fw-bold">
                                    {product.product_name}
                                  </h6>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center justify-content-center">
                                  <div className="count_btn">
                                    {cart[product.id]?.quantity || 0}
                                    {/* <button onClick={decrease} className="table-btn">
                                                                        <i className="fas fa-minus f-s-10"></i>
                                                                    </button>

                                                                    <input
                                                                        type="text"
                                                                        value={count}
                                                                        onChange={handleChange}
                                                                        className="f-s-12 mb-0 text-center fw-bold rounded-1 count_number border-0"
                                                                        style={{ width: "50px" }}
                                                                        min={0}
                                                                    />

                                                                    <button onClick={increase} className="table-btn">
                                                                        <i className="fas fa-plus f-s-10"></i>
                                                                    </button> */}
                                  </div>
                                </div>
                              </td>
                              <td class="f-s-16 mb-0 fw-bold text-gray-9 text-end text-nowrap">
                                {getGeneralSettingssymbol}
                                {(
                                  (cart[product.id]?.quantity || 0) * product.product_price
                                ).toFixed(2)}
                              </td>
                              <td className="text-end">
                                <button
                                  onClick={() => removeProduct(product.id)}
                                  class=" bg-transparent fw-semibold border-0 text-end text-nowrap text-primary-grey-5 f-s-12 text-exp-red "
                                >
                                  <i class="fas fa-trash-alt  me-2"></i> REMOVE
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                  <ul className="ps-0 border-top pt-3 mb-0">
                    <li className="d-flex justify-content-between align-content-center gap-1 fw-semibold f-s-16 mb-1">
                      <span className=" text-primary-grey-4">Shipping </span>
                      <div className="d-flex align-items-center gap-1">
                        {" "}
                        <span className="text-primary-grey-5">
                          {getGeneralSettingssymbol}
                        </span>
                        <input
                          type="number"
                          className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0 text-end"
                          id="exampleFormControlInput1"
                          placeholder="0"
                          value={shipping}
                          onChange={(e) =>
                            setShipping(Number(e.target.value) || 0)
                          }
                          style={{ width: "120px" }}
                        />
                      </div>
                      {/* </span> */}
                    </li>
                    <li className="d-flex justify-content-between align-content-center gap-1 fw-semibold f-s-16 mb-1">
                      <span className=" text-primary-grey-4">SGST </span>
                      <div className="d-flex align-items-center gap-1">
                        {" "}
                        <span className="text-primary-grey-5">
                          {getGeneralSettingssymbol}
                        </span>
                        <input
                          type="number"
                          className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0 text-end"
                          id="exampleFormControlInput1"
                          placeholder={sgst.toFixed(2)}
                          value={sgst.toFixed(2)}
                          readOnly
                          style={{ width: "120px" }}
                        />
                      </div>
                    </li>
                    <li className="d-flex justify-content-between align-content-center gap-1 fw-semibold f-s-16 mb-1">
                      <span className=" text-primary-grey-4">CGST</span>
                      <div className="d-flex align-items-center gap-1">
                        <span className="text-primary-grey-5">
                          {getGeneralSettingssymbol}
                        </span>
                        <input
                          type="number"
                          className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0 text-end"
                          id="exampleFormControlInput1"
                          placeholder={cgst.toFixed(2)}
                          value={cgst.toFixed(2)}
                          readOnly
                          style={{ width: "120px" }}
                        />
                      </div>
                    </li>

                    <li className="d-flex justify-content-between align-content-center gap-1 fw-semibold f-s-16 mb-1">
                      <span className=" text-primary-grey-4">Discount </span>
                      <div className="d-flex align-items-center gap-1">
                        <span className="text-primary-grey-5">
                          {getGeneralSettingssymbol}
                        </span>
                        <input
                          type="number"
                          className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0 text-end"
                          id="exampleFormControlInput1"
                          placeholder="0"
                          value={discount}
                          onChange={(e) =>
                            setDiscount(Number(e.target.value) || 0)
                          }
                          style={{ width: "120px" }}
                        />
                      </div>
                    </li>
                    <li className="d-flex justify-content-between align-content-center gap-1 fw-semibold f-s-16 mb-1 mt-3">
                      <span className=" text-primary-grey-4 ">Sub Total </span>
                      <span className="text-primary-grey-1 fw-bolder">
                        {getGeneralSettingssymbol}
                        {subtotal.toFixed(2)}
                      </span>
                      {/* <input type="number" className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0 text-end" id="exampleFormControlInput1" placeholder='₹4,635' /> */}
                    </li>
                    <li className="d-flex justify-content-between align-content-center gap-1 fw-bold f-s-20 mb-1 mt-3 border-top border-bottom py-2">
                      <span className=" text-primary-grey-4 ">
                        {" "}
                        Grand Total
                      </span>{" "}
                      <span className="text-primary-grey-1">
                        {getGeneralSettingssymbol}
                        {grandTotal.toFixed(2)}
                      </span>
                    </li>
                  </ul>
                  <div className="delivery_address">
                    <h6 className="fw-bold f-s-16 mb-1 mt-3">
                      Billing Address
                    </h6>
                    {selectedCustomer ? (
                      <p className="mb-0">
                        {selectedCustomer.address}, {selectedCustomer.city} -{" "}
                        {selectedCustomer.zip}, {selectedCustomer.state},{" "}
                        {selectedCustomer.country}
                      </p>
                    ) : (
                      <p className="mb-0 text-muted">
                        Select a customer to show billing address
                      </p>
                    )}
                    <div className="shipping_address d-flex align-items-center gap-2 flex-wrap">
                      <div className="w-100">
                        <h6 className="fw-bold f-s-16 mb-1 mt-3">
                          Shipping Address
                        </h6>
                        <textarea
                          type="text"
                          className="form-control"
                          rows={3}
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                        ></textarea>
                      </div>
                      <label class="custom-checkbox ">
                        <span className="text-nowrap">Same as above</span>
                        <input
                          type="checkbox"
                          checked={sameAsBilling}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSameAsBilling(isChecked);
                            if (isChecked && selectedCustomer) {
                              const fullAddress = `${selectedCustomer.address}, ${selectedCustomer.city} - ${selectedCustomer.zip}, ${selectedCustomer.state}, ${selectedCustomer.country}`;
                              setShippingAddress(fullAddress);
                            }
                          }}
                        />
                        <span class="checkmark"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="d-flex gap-2 justify-content-end align-items-center">
                    {/* <button className="btn btn-exp-purple btn-sm " onClick={invoiceShow}><i className="fas fa-file-invoice me-2"></i>Generate Invoice</button> */}

                    <Tooltip title={!selectedCustomer ? "Please select a customer first" : ""}>
                      <span>
                        <button
                          className="btn btn-exp-primary btn-sm"
                          onClick={paymentShow}
                          disabled={!selectedCustomer}
                        >
                          <i className="fas fa-shopping-cart me-2"></i>Place Order
                        </button>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-7 col-lg-12">
              <div class="card ibox">
                <div class="card-body">
                  <div class="ibox-title">
                    <h5 className="mb-2">View Order Details</h5>
                  </div>
                  {cartProducts.map((product) => (
                    <div class="ibox-content" key={product.id}>
                      <div className="card shadow-none border rounded-3 position-relative">
                        <div className="card-body">
                          <div className=" d-flex gap-2 wrapCard">
                            <div className="card_img me-3">
                              <img
                                className="prof-img"
                                src={
                                  product.attachment_file
                                    ? `${product.attachment_file}`
                                    : 'https://growthh.s3.ap-south-1.amazonaws.com/ERP/sample/picture.png'

                                }
                                alt="logo"
                              />
                            </div>
                            <div className=" d-flex align-items-start gap-2 flex-wrap justify-content-between w-100">
                              <div className="card_content flex-full mt-3">
                                <h5 className="fw-semibold">
                                  {product.product_name} ({" "}
                                  <strong className="fw-bold">
                                    {product.product_code}
                                  </strong>{" "}
                                  )
                                </h5>
                                <p className="fw-semibold f-s-14 text-primary-grey-5 mb-1 ">
                                  {product.sku_description ||
                                    "No description available."}
                                </p>
                                <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1">
                                  <span className="text-primary-grey-5">
                                    Date
                                  </span>
                                  :{" "}
                                  <span>{new Date().toLocaleDateString()}</span>
                                </p>
                                <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                  <span className="text-primary-grey-5">
                                    Product Rate / Per Uint
                                  </span>
                                  :{" "}
                                  <span>
                                    {getGeneralSettingssymbol}
                                    {(cart[product.id]?.quantity || 0) * product.product_price}
                                  </span>
                                </p>
                              </div>
                              <div className="card_item_cart">
                                <button
                                  onClick={() => removeProduct(product.id)}
                                  className=" bg-transparent fw-semibold border-0 text-end text-primary-grey-5 f-s-12 text-exp-red remove_btn"
                                >
                                  <i class="fas fa-trash-alt  me-2"></i> REMOVE
                                </button>
                                <p className="f-s-25 fw-bold mt-3 product_price">
                                  {getGeneralSettingssymbol}
                                  {(
                                    (cart[product.id]?.quantity || 0) * product.product_price
                                  ).toFixed(2)}
                                </p>
                                <div className="d-flex align-items-center justify-content-end">
                                  <div className="count_btn">
                                    <button
                                      onClick={() =>
                                        updateQuantity(product.id, -1)
                                      }
                                      className="table-btn"
                                    >
                                      <i className="fas fa-minus f-s-10"></i>
                                    </button>

                                    <input
                                      type="text"
                                      value={cart[product.id]?.quantity || 0}
                                      onChange={handleChange}
                                      className="f-s-12 mb-0 text-center fw-bold rounded-1 count_number border-0"
                                      style={{ width: "50px" }}
                                      min={0}
                                    />

                                    <button
                                      onClick={() =>
                                        updateQuantity(product.id, 1)
                                      }
                                      className="table-btn"
                                    >
                                      <i className="fas fa-plus f-s-10"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="form-group mb-0 mt-2">
                            <label className="form-label">Remarks</label>
                            {/* <textarea type="text" name="remark" rows="3" required="" className="form-control form_control rounded-2" spellcheck="false"></textarea> */}

                            <AutoHeightTextarea
                              placeholder="Remarks ..."
                              className="form-control"
                              rows={2}
                              value={remarksMap[product.id] || ""}
                              onChange={(e) => {
                                setRemarksMap({
                                  ...remarksMap,
                                  [product.id]: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal
        show={showInvoice}
        onHide={invoiceClose}
        backdrop="static"
        keyboard={false}
        centered
        size="xl"
        className="model_80"
      >
        <button onClick={invoiceClose} className="border-0 close_btn">
          <i class="fas fa-times f-s-16" close_btn></i>
        </button>
        <Modal.Body>
          <Invoice paymentShow={paymentShow} />
        </Modal.Body>
      </Modal>

      {/* Payment method modal start  */}
      <Modal
        show={showPayment}
        onHide={paymentClose}
        backdrop="static"
        keyboard={false}
        centered
        size="md"
        className="payment_modal"
      >
        <Modal.Header>
          <Modal.Title>Select Payment Method</Modal.Title>
        </Modal.Header>
        <button onClick={paymentClose} className="border-0 close_btn">
          <i class="fas fa-times f-s-16" close_btn></i>
        </button>
        <Modal.Body>
          <div className="d-flex flex-wrap align-content-center gap-2 mb-3 justify-content-xl-between justify-content-lg-between justify-content-md-between justify-content-sm-between">
            <label className="custom-radio payment_radio ">
              <input
                type="radio"
                name="template"
                value="template2"
                checked={selectedTemplate === "template2"}
                onChange={() => setSelectedTemplate("template2")}
              />
              <img
                className="prof-img  ms-2 me-2"
                src={process.env.PUBLIC_URL + "/assets/images/card.png"}
                alt="logo"
              />
              <span>Online</span>
              <span className="checkmark" />
            </label>
            <label className="custom-radio payment_radio">
              <input
                type="radio"
                name="template"
                value="template3"
                checked={selectedTemplate === "template3"}
                onChange={() => setSelectedTemplate("template3")}
              />
              <img
                className="prof-img ms-2 me-2 "
                src={process.env.PUBLIC_URL + "/assets/images/rupee.png"}
                alt="logo"
              />
              <span>Cash on Delivery</span>
              <span className="checkmark" />
            </label>
            <label className="custom-radio payment_radio">
              <input
                type="radio"
                name="template"
                value="template4"
                checked={selectedTemplate === "template4"}
                onChange={() => setSelectedTemplate("template4")}
              />
              <img
                className="prof-img bankImg ms-2 me-2 "
                src={process.env.PUBLIC_URL + "/assets/images/bank-transfer.png"}
                alt="logo"
              />
              <span>Bank Transfer</span>
              <span className="checkmark" />
            </label>
            <label className="custom-radio payment_radio">
              <input
                type="radio"
                name="template"
                value="template5"
                checked={selectedTemplate === "template5"}
                onChange={() => setSelectedTemplate("template5")}
              />
              <img
                className="prof-img bankImg ms-2 me-2 "
                src={process.env.PUBLIC_URL + "/assets/images/upi-payment.png"}
                alt="logo"
              />
              <span>UPI</span>
              <span className="checkmark" />
            </label>
          </div>

          {/* Net Banking */}
          <div>
            {selectedTemplate === "template2" && (
              <div className="form-group">
                <button
                  class="w-100 total btn btn-info f-s-20"
                  onClick={() => handlePlaceOrder("online")}
                >
                  <span class="amount">Place Order</span>
                </button>
              </div>
            )}
          </div>

          {/* Cash on Delivery */}
          <div>
            {selectedTemplate === "template3" && (
              <div className="form-group ">
                <button
                  class="w-100 total btn btn-info f-s-20"
                  onClick={() => handlePlaceOrder("offline")}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
          {/* bank transfer */}
          <div>
            {selectedTemplate === "template4" && (
              <div className="form-group ">
                <button
                  class="w-100 total btn btn-info f-s-20"
                  onClick={() => handlePlaceOrder("BankTransfer")}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
          {/* Cash on Delivery */}
          <div>
            {selectedTemplate === "template5" && (
              <div className="form-group ">
                <button
                  class="w-100 total btn btn-info f-s-20"
                  onClick={() => handlePlaceOrder("UPI")}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showAddCustomerDetails}
        onHide={() => setShowAddCustomerDetails(false)}
        backdrop="static"
        keyboard={false}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="add-customer-form" onSubmit={handleAddCustomerSubmit}>
            <div className="form-group mb-2">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                required
                value={addCustomerForm.name}
                onChange={(e) =>
                  setAddCustomerForm({ ...addCustomerForm, name: e.target.value })
                }
              />
            </div>
            <div className="form-group mb-2">
              <label className="form-label">Phone No.</label>
              <input
                type="tel"
                className="form-control"
                value={addCustomerForm.phone}
                onChange={(e) =>
                  setAddCustomerForm({ ...addCustomerForm, phone: e.target.value })
                }
              />
            </div>
            <div className="form-group mb-2">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={addCustomerForm.email}
                onChange={(e) =>
                  setAddCustomerForm({ ...addCustomerForm, email: e.target.value })
                }
              />
            </div>
            <div className="form-group mb-2">
              <label className="form-label">
                Address <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                required
                value={addCustomerForm.address}
                onChange={(e) =>
                  setAddCustomerForm({ ...addCustomerForm, address: e.target.value })
                }
              />
            </div>
            <div className="form-group mb-2">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                value={addCustomerForm.city}
                onChange={(e) => setAddCustomerForm({ ...addCustomerForm, city: e.target.value })}
              />
            </div>

            <div className="form-group mb-2">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                value={addCustomerForm.state}
                onChange={(e) => setAddCustomerForm({ ...addCustomerForm, state: e.target.value })}
              />
            </div>

            <div className="form-group mb-2">
              <label className="form-label">Zip</label>
              <input
                type="text"
                className="form-control"
                value={addCustomerForm.zip}
                onChange={(e) => setAddCustomerForm({ ...addCustomerForm, zip: e.target.value })}
              />
            </div>

            <div className="form-group mb-2">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-control"
                value={addCustomerForm.country}
                onChange={(e) => setAddCustomerForm({ ...addCustomerForm, country: e.target.value })}
              />
            </div>

          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowAddCustomerDetails(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
            form="add-customer-form" // ✅ Binds to form above
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default ViewDetails;
