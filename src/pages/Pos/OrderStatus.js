import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Upload } from "@progress/kendo-react-upload";

import Invoice from "./Invoice";
import { Modal } from "react-bootstrap";
import AutoHeightTextarea from "../CommonComponent/AutoHeightTextarea";
import { PrivateAxios, url } from "../../environment/AxiosInstance";
import { SuccessMessage } from "../../environment/ToastMessage";

const OrderStatus = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCancel, setIsOpenCancel] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showInvoiceNext, setShowInvoiceNext] = useState(false);
  const invoiceCloseNext = () => setShowInvoiceNext(false);
  const invoiceShowNext = () => setShowInvoiceNext(true);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [orders, setOrders] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    itemId: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const handleDeliverClick = (orderId, orderItemId) => {
    setConfirmModal({ show: true, orderId, itemId: orderItemId });
  };

  const confirmDelivery = () => {
    PrivateAxios.put("/pos/mark-delivered", {
      order_item_id: confirmModal.itemId,
      order_id: confirmModal.orderId,
    })
      .then(() => {
        SuccessMessage("Order item marked as delivered");
        setConfirmModal({ show: false, itemId: null, orderId: null });
        window.location.reload(); // or use query invalidation/refetch if using SWR/React Query
      })
      .catch((err) => console.error("Delivery failed", err));
  };
  const handleCancelClick = (orderItemId) => {
    PrivateAxios.post("/pos/cancel-item", { order_item_id: orderItemId })
      .then(() => {
        SuccessMessage("Order item cancelled successfully");
        window.location.reload(); // or update state instead
      })
      .catch((err) => console.error("Cancellation failed", err));
  };
  useEffect(() => {
    PrivateAxios.get("/pos/getAllOrdersWithItems")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Group by order ID
  const groupedOrders = orders.reduce((acc, curr) => {
    if (curr.item_status === 2) return acc;
    const key = curr.id;
    if (!acc[key]) {
      acc[key] = {
        ...curr,
        items: [],
      };
    }


    acc[key].items.push({
      product_name: curr.product_name,
      product_code: curr.product_code,
      quantity: curr.quantity,
      price: curr.price,
      item_total: curr.item_total,
      grand_total: curr.grand_total,
      remarks: curr.remarks,
      product_image: curr.product_image,
      item_status: curr.item_status,
      payment_type: curr.payment_type,
      payment_status: curr.payment_status,
      order_id: curr.id,
      order_item_id: curr.order_item_id,
    });
    return acc;
  }, {});

      const inprogressOrders = Object.values(groupedOrders).filter(order =>
  order.items.some(item => item.item_status === 0)
);

const completedOrders = Object.values(groupedOrders).filter(order =>
  order.items.every(item => item.item_status === 1)
);
  const token = localStorage.getItem("token");
  const handleInvoiceDownload = async (orderId, orderItemId) => {
    try {
      setDownloadingId(orderItemId);

      const response = await PrivateAxios.post(
        "/pos/download-invoice",
        { order_id: orderId, order_item_id: orderItemId },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}-${orderItemId}.pdf`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Invoice download failed");
    } finally {
      setDownloadingId(null); // Reset loader
    }
  };

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  const fetchCancelledOrders = async () => {
    try {
      setLoading(true);
      const response = await PrivateAxios.get("/pos/cancelled-orders");
      setCancelledOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch cancelled orders", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="bg-white border-bottom">
        <div className="d-flex gap-3 px-4 justify-content-between align-items-center">
          <ul className="top_listing nav nav-tabs border-bottom-0" id="myTab" role="tablist">
            <li className="list_item " role="presentation">
              <button
                class=" listMenu status-pendingBg active border-0 "
                id="tab01"
                data-bs-toggle="tab"
                data-bs-target="#tab01-pane"
                type="button"
                role="tab"
                aria-controls="tab01-pane"
                aria-selected="true"
              >
                Inprogress
              </button>
            </li>
            <li className="list_item " role="presentation">
              <button
                class=" listMenu status-meantGreenBg border-0 "
                id="tab02"
                data-bs-toggle="tab"
                data-bs-target="#tab02-pane"
                type="button"
                role="tab"
                aria-controls="tab02-pane"
                aria-selected="true"
              >
                Complete
              </button>
            </li>
            <li className="list_item ">
              <button
                class=" listMenu status-dangerBg border-0"
                id="tab03"
                data-bs-toggle="tab"
                data-bs-target="#tab03-pane"
                type="button"
                role="tab"
                aria-controls="tab03-pane"
                aria-selected="false"
              >
                Cancel
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="tab-content" id="myTabContent">
        <div
          class="tab-pane fade show active"
          id="tab01-pane"
          role="tabpanel"
          aria-labelledby="tab01"
          tabindex="0"
        >
          <div class="p-4">
            <div class="wrapper">
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-0">
                    <div className="p-0">
                    
                     {inprogressOrders.map((order) => (
                        
                          <div className="card ibox" key={order.id}>
                            <div className="card-body">
                              <div className="ibox-title d-flex flex-wrap justify-content-between align-items-center mb-3">
                                <h5 className="mb-2">
                                  Order #{order.custom_order_id}
                                </h5>
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                  <h5 className="m-0 fw-bold text-primary">
                                    Total: ₹ {order.grand_total?.toFixed(2)}{" "}
                                    <span className="small">
                                      (Included tax)
                                    </span>
                                  </h5>
                                  <button
                                    className="btn btn-exp-purple btn-sm position-relative z-3"
                                    onClick={() =>
                                      handleInvoiceDownload(
                                        order.id,
                                        order.order_item_id
                                      )
                                    }
                                    disabled={
                                      downloadingId === order.order_item_id
                                    }
                                  >
                                    {downloadingId === order.order_item_id ? (
                                      <span>
                                        <i className="fas fa-spinner fa-spin me-2" />{" "}
                                        Generating...
                                      </span>
                                    ) : (
                                      <span>
                                        <i className="fas fa-file-invoice me-2" />{" "}
                                        Download Invoice
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {order.items.map((item, itemIndex) => (
                                <div className="ibox-content" key={itemIndex}>
                                  <div
                                    className={`card shadow-none border rounded-3 ${item.payment_status === "Paid"
                                      ? "paid"
                                      : "unpaid"
                                      }`}
                                  >
                                    <div className="card-body">
                                      <div className="d-flex gap-2 wrapCard">
                                        <div className="card_img me-3 flex-shrink-0">
                                          <img
                                            className="prof-img"
                                            src={
                                              item.product_image
                                                ? `${url}/${item.product_image}`
                                                : `${process.env.PUBLIC_URL}/assets/images/demo-logo.png`
                                            }
                                            alt={item.product_name}
                                            style={{ objectFit: "cover" }}
                                          />
                                        </div>
                                        <div className="row w-100 g-0">
                                          <div className="col-lg-8 col-md-6 col-sm-12">
                                            <div className="card_content">
                                              <h5 className="fw-semibold">
                                                {order.customer_name} (
                                                <strong>
                                                  {order.custom_order_id}
                                                </strong>
                                                )
                                              </h5>
                                              <p className="fw-semibold f-s-14 text-primary-grey-5 mb-1">
                                                Product: {item.product_name}{" "}
                                                {item.id}
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1">
                                                <span className="text-primary-grey-5">
                                                  Date
                                                </span>
                                                :
                                                <span>
                                                  {new Date(
                                                    order.created_at
                                                  ).toLocaleDateString()}
                                                </span>
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                                <span className="text-primary-grey-5">
                                                  Rate
                                                </span>
                                                : ₹{item.price}
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                                <span className="text-primary-grey-5">
                                                  Qty
                                                </span>
                                                : {item.quantity}
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                                <span className="text-primary-grey-5">
                                                  Payment Type
                                                </span>
                                                :{" "}
                                                {item.payment_type ===
                                                  "BankTransfer"
                                                  ? "Bank Transfer"
                                                  : item.payment_type}
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                                <span className="text-primary-grey-5">
                                                  Remarks
                                                </span>
                                                : {item.remarks || "NA"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="col-lg-4 col-md-6 col-sm-12 text-end">
                                            <div className="d-flex align-items-end justify-content-end flex-column">

                                              {item.item_status === 0 &&
                                                <label className="badge badge-outline-primary">
                                                  <i className="fas fa-circle f-s-8 d-flex me-1"></i>Inprogress
                                                </label>}
                                              {item.item_status === 1 &&
                                                <label className="badge badge-outline-success">
                                                  <i className="fas fa-circle f-s-8 d-flex me-1"></i>Delivered
                                                </label>
                                              }
                                              {item.item_status === 2 &&
                                                <label className="badge badge-outline-danger">
                                                  <i className="fas fa-circle f-s-8 d-flex me-1"></i>Cancelled
                                                </label>
                                              }

                                              <p className="fs-5 fw-bold text-end mt-3">
                                                ₹
                                                {(
                                                  item.price * item.quantity
                                                ).toFixed(2)}
                                              </p>
                                              {item.item_status === 0 && (
                                                <div className="d-flex align-items-center gap-2 justify-content-end flex-wrap">
                                                  <div className="position-relative">
                                                    <button
                                                      className="btn btn-exp-red btn-sm text-center mx-auto mt-2"
                                                      onClick={() =>
                                                        handleCancelClick(
                                                          item.order_item_id
                                                        )
                                                      }
                                                    >
                                                      <i className="fas fa-times-circle text-white"></i>
                                                      <span className="ms-2">
                                                        Cancel
                                                      </span>
                                                    </button>
                                                  </div>
                                                  <div className="position-relative">
                                                    <button
                                                      className="btn btn-exp-green btn-sm text-center mx-auto mt-2"
                                                      onClick={() =>
                                                        handleDeliverClick(
                                                          item.order_id,
                                                          item.order_item_id
                                                        )
                                                      }
                                                    >
                                                      <i className="fas fa-check-circle text-white"></i>
                                                      <span className="ms-2">
                                                        Delivered
                                                      </span>
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="tab02-pane"
          role="tabpanel"
          aria-labelledby="tab02"
          tabindex="0"
        >
          <div class="p-4">
            <div class="wrapper">
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-0">
                    <div className="p-0">
                     {completedOrders.map((order) => (
                          <div className="card ibox" key={order.id}>
                            <div className="card-body">
                              <div className="ibox-title d-flex flex-wrap justify-content-between align-items-center mb-3">
                                <h5 className="mb-2">
                                  Order #{order.custom_order_id}
                                </h5>
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                  <h5 className="m-0 fw-bold text-primary">
                                    Total: ₹ {order.grand_total?.toFixed(2)}{" "}
                                    <span className="small">
                                      (Included tax)
                                    </span>
                                  </h5>
                                  <button
                                    className="btn btn-exp-purple btn-sm position-relative z-3"
                                    onClick={() =>
                                      handleInvoiceDownload(
                                        order.id,
                                        order.order_item_id
                                      )
                                    }
                                    disabled={
                                      downloadingId === order.order_item_id
                                    }
                                  >
                                    {downloadingId === order.order_item_id ? (
                                      <span>
                                        <i className="fas fa-spinner fa-spin me-2" />{" "}
                                        Generating...
                                      </span>
                                    ) : (
                                      <span>
                                        <i className="fas fa-file-invoice me-2" />{" "}
                                        Download Invoice
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {order.items.map((item, itemIndex) => (
                                <div className="ibox-content" key={itemIndex}>
                                  <div
                                    className={`card shadow-none border rounded-3 ${item.payment_status === "Paid"
                                      ? "paid"
                                      : "unpaid"
                                      }`}
                                  >
                                    <div className="card-body">
                                      <div className="d-flex gap-2 wrapCard">
                                        <div className="card_img me-3 flex-shrink-0">
                                          <img
                                            className="prof-img"
                                            src={
                                              item.product_image
                                                ? `${url}/${item.product_image}`
                                                : `${process.env.PUBLIC_URL}/assets/images/demo-logo.png`
                                            }
                                            alt={item.product_name}
                                            style={{ objectFit: "cover" }}
                                          />
                                        </div>
                                        <div className="row w-100 g-0">
                                          <div className="col-lg-8 col-md-6 col-sm-12">
                                            <div className="card_content">
                                              <h5 className="fw-semibold">
                                                {order.customer_name} (
                                                <strong>
                                                  {order.custom_order_id}
                                                </strong>
                                                )
                                              </h5>
                                              <p className="fw-semibold f-s-14 text-primary-grey-5 mb-1">
                                                Product: {item.product_name}{" "}
                                                {item.id}
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1">
                                                <span className="text-primary-grey-5">
                                                  Date
                                                </span>
                                                :
                                                <span>
                                                  {new Date(
                                                    order.created_at
                                                  ).toLocaleDateString()}
                                                </span>
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                                <span className="text-primary-grey-5">
                                                  Rate
                                                </span>
                                                : ₹{item.price}
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                                <span className="text-primary-grey-5">
                                                  Qty
                                                </span>
                                                : {item.quantity}
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                                <span className="text-primary-grey-5">
                                                  Payment Type
                                                </span>
                                                :{" "}
                                                {item.payment_type ===
                                                  "BankTransfer"
                                                  ? "Bank Transfer"
                                                  : item.payment_type}
                                              </p>
                                              <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                                <span className="text-primary-grey-5">
                                                  Remarks
                                                </span>
                                                : {item.remarks || "NA"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="col-lg-4 col-md-6 col-sm-12 text-end">
                                            <div className="d-flex align-items-end justify-content-end flex-column">

                                              {item.item_status === 0 &&
                                                <label className="badge badge-outline-primary">
                                                  <i className="fas fa-circle f-s-8 d-flex me-1"></i>Inprogress
                                                </label>}
                                              {item.item_status === 1 &&
                                                <label className="badge badge-outline-success">
                                                  <i className="fas fa-circle f-s-8 d-flex me-1"></i>Delivered
                                                </label>
                                              }
                                              {item.item_status === 2 &&
                                                <label className="badge badge-outline-danger">
                                                  <i className="fas fa-circle f-s-8 d-flex me-1"></i>Cancelled
                                                </label>
                                              }

                                              <p className="fs-5 fw-bold text-end mt-3">
                                                ₹
                                                {(
                                                  item.price * item.quantity
                                                ).toFixed(2)}
                                              </p>
                                              {item.item_status === 0 && (
                                                <div className="d-flex align-items-center gap-2 justify-content-end flex-wrap">
                                                  <div className="position-relative">
                                                    <button
                                                      className="btn btn-exp-red btn-sm text-center mx-auto mt-2"
                                                      onClick={() =>
                                                        handleCancelClick(
                                                          item.order_item_id
                                                        )
                                                      }
                                                    >
                                                      <i className="fas fa-times-circle text-white"></i>
                                                      <span className="ms-2">
                                                        Cancel
                                                      </span>
                                                    </button>
                                                  </div>
                                                  <div className="position-relative">
                                                    <button
                                                      className="btn btn-exp-green btn-sm text-center mx-auto mt-2"
                                                      onClick={() =>
                                                        handleDeliverClick(
                                                          item.order_id,
                                                          item.order_item_id
                                                        )
                                                      }
                                                    >
                                                      <i className="fas fa-check-circle text-white"></i>
                                                      <span className="ms-2">
                                                        Delivered
                                                      </span>
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="tab-pane fade "
          id="tab03-pane"
          role="tabpanel"
          aria-labelledby="tab03"
          tabindex="0"
        >
          <div class="p-4">
            <div class="wrapper ">
              <div class="row">
                <div class="col-md-12">
                  <div class="card ibox mb-0">
                    <div class="card-body">
                      <div class="ibox-title">
                        <h5 className="mb-2">All Orders </h5>
                      </div>
                      {cancelledOrders.map((item, index) => (
                        <div
                          className="ibox-content"
                          key={item.order_item_id || index}
                        >
                          <div className="card shadow-none border rounded-3">
                            <div className="card-body">
                              <div className="d-flex gap-2 wrapCard">
                                <div className="card_img me-3 flex-shrink-0">
                                  <img
                                    className="prof-img"
                                    src={
                                      item.product?.attachment_file
                                        ? `${url}/${item.product.attachment_file}`
                                        : process.env.PUBLIC_URL +
                                        "/assets/images/demo-logo.png"
                                    }
                                    alt={
                                      item.product?.product_name || "Product"
                                    }
                                  />
                                </div>
                                <div className="row w-100 g-0">
                                  <div className="col-lg-8 col-md-6 col-sm-12">
                                    <div className="card_content">
                                      <h5 className="fw-semibold">
                                        {item.order?.customer?.name} (
                                        <strong>
                                          {item.order?.custom_order_id}
                                        </strong>
                                        )
                                      </h5>
                                      <p className="fw-semibold f-s-14 text-primary-grey-5 mb-1">
                                        {item.product?.product_name ||
                                          "No remarks"}
                                      </p>
                                      <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1">
                                        <span className="text-primary-grey-5">
                                          Order Date
                                        </span>
                                        :
                                        <span>
                                          {item.order?.created_at
                                            ? new Date(
                                              item.order.created_at
                                            ).toLocaleDateString()
                                            : "N/A"}
                                        </span>
                                      </p>
                                      <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                        <span className="text-primary-grey-5">
                                          Qty
                                        </span>
                                        :<span>{item.quantity}</span>
                                      </p>
                                      <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                        <span className="text-primary-grey-5">
                                          Payment Type
                                        </span>
                                        :
                                        <span>
                                          {item.order?.payment_type || "N/A"}
                                        </span>
                                      </p>
                                      <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                        <span className="text-primary-grey-5">
                                          Product Rate / Per Unit
                                        </span>
                                        : <span>₹{item.price?.toFixed(2)}</span>
                                      </p>
                                      <p className="fw-semibold f-s-14 d-flex align-items-center gap-2 mb-0">
                                        <span className="text-primary-grey-5">
                                          Remarks
                                        </span>
                                        :<span>{item.remarks || "NA"}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="col-lg-4 col-md-6 col-sm-12 text-end">
                                    <div className="d-flex align-items-end justify-content-end flex-column">
                                      <label className="badge badge-outline-danger">
                                        <i className="fas fa-circle f-s-8 d-flex me-1"></i>
                                        Cancel
                                      </label>
                                      <p className="f-s-25 fw-bold text-end mt-3">
                                        ₹
                                        {(
                                          item.price?.toFixed(2) * item.quantity
                                        ).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
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
        </div>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
        size="xl"
        className="model_80 "
      >
        <button onClick={handleClose} className="border-0 close_btn">
          <i class="fas fa-times f-s-16" close_btn></i>
        </button>
        <Modal.Body>
          {" "}
          <Invoice showContinueButton={false} />
        </Modal.Body>
      </Modal>

      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, itemId: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delivery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to mark this item as <strong>Delivered</strong>?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setConfirmModal({ show: false, itemId: null })}
          >
            Cancel
          </button>
          <button className="btn btn-success" onClick={confirmDelivery}>
            Yes, Confirm
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderStatus;
