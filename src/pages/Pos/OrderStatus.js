import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Invoice from "./Invoice";
import { Modal } from "react-bootstrap";
import AutoHeightTextarea from "../CommonComponent/AutoHeightTextarea";
import { PrivateAxios, url } from "../../environment/AxiosInstance";
import { SuccessMessage } from "../../environment/ToastMessage";

// Tab → payment_status mapping. The backend filters orders.payment_status
// by `value`; `label` is what the user sees.
const TABS = [
  { value: "Pending", label: "Inprogress", bgClass: "status-pendingBg" },
  { value: "Paid", label: "Complete", bgClass: "status-meantGreenBg" },
  { value: "Cancelled", label: "Cancel", bgClass: "status-dangerBg" },
  // { value: "Failed", label: "Failed", bgClass: "status-dangerBg" },
];

const OrderStatus = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCancel, setIsOpenCancel] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const [activeTab, setActiveTab] = useState("Pending");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [pagination, setPagination] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(() => new Set());

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleTabChange = (tabValue) => {
    if (tabValue === activeTab) return;
    setActiveTab(tabValue);
    setPage(1);
    setExpandedOrders(new Set());
  };

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
    PrivateAxios.get("/pos/getAllOrdersWithItems", {
      params: { page, limit: pageSize, payment_status: activeTab },
    })
      .then((res) => {
        setOrders(res.data?.data?.rows || []);
        setPagination(res.data?.data?.pagination || null);
      })
      .catch((err) => console.error(err));
  }, [page, pageSize, activeTab]);

  // Group flat order_items rows by their parent order so the UI can render
  // one collapsible card per order. No item_status filter here — items are
  // shown regardless of cancel/deliver state; the per-item badges convey it.
  const groupedOrders = orders.reduce((acc, curr) => {
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

  const visibleOrders = Object.values(groupedOrders);

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

  const totalPages = pagination?.total_pages || 1;
  const totalRecords = pagination?.total_records || 0;
  const rangeStart = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRecords);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const paginationControls = (
    <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted">Rows per page:</span>
        <select
          className="form-select form-select-sm w-auto"
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-muted ms-2">
          {rangeStart}-{rangeEnd} of {totalRecords}
        </span>
      </div>
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </button>
          </li>
          <li className={`page-item ${!pagination?.has_prev_page ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination?.has_prev_page}
            >
              Prev
            </button>
          </li>
          <li className="page-item active" aria-current="page">
            <span className="page-link">
              {page} / {totalPages}
            </span>
          </li>
          <li className={`page-item ${!pagination?.has_next_page ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={!pagination?.has_next_page}
            >
              Next
            </button>
          </li>
          <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      <div className="bg-white border-bottom">
        <div className="d-flex gap-3 px-4 justify-content-between align-items-center">
          <ul className="top_listing nav nav-tabs border-bottom-0" id="myTab" role="tablist">
            {TABS.map((tab) => (
              <li className="list_item" role="presentation" key={tab.value}>
                <button
                  type="button"
                  className={`listMenu ${tab.bgClass} ${activeTab === tab.value ? 'active' : ''} border-0`}
                  role="tab"
                  aria-selected={activeTab === tab.value}
                  onClick={() => handleTabChange(tab.value)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-4">
        <div className="wrapper">
          <div className="row">
            <div className="col-md-12">
              <div className="mb-0">
                <div className="p-0">
                  {visibleOrders.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      No orders found for this status.
                    </div>
                  ) : (
                    visibleOrders.map((order) => (
                      <div className="card ibox" key={order.id}>
                        <div className="card-body">
                          <div
                            className={`ibox-title d-flex flex-wrap justify-content-between align-items-center ${expandedOrders.has(order.id) ? 'mb-3' : 'mb-0'}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleOrderExpansion(order.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleOrderExpansion(order.id);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                              <i className={`fas fa-chevron-${expandedOrders.has(order.id) ? 'down' : 'right'} text-muted`} />
                              <h5 className="mb-0">
                                Order #{order.custom_order_id}
                              </h5>
                              <span className="badge bg-light text-dark border">
                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div
                              className="d-flex align-items-center flex-wrap gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h5 className="m-0 fw-bold text-primary">
                                Total: ₹ {Number(order?.grand_total || 0).toFixed(2)}{" "}
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

                          {expandedOrders.has(order.id) && order.items.map((item, itemIndex) => (
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
                                            Product: {item.product_name}
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
                                              Number(item.price || 0) * Number(item.quantity || 0)
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
                    ))
                  )}
                  {paginationControls}
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
          <i className="fas fa-times f-s-16"></i>
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
