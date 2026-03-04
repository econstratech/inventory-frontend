import React from "react";
import { Modal } from "react-bootstrap";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const showTransferType = (type) => {
  switch (type) {
    case "stock_transfer":
      return "Store to Store Transfer";
    case "add_to_stock":
      return "Add to Stock";
    case "sales_order_return":
      return "Sales Order Return";
    case "purchase_order_return":
      return "Purchase Order Return";
    case "scrap_items":
      return "Scrap Items";
  }
};

const StockTransferDetailModal = ({ show, onHide, record }) => {
  const products = record?.stockTransferProducts ?? [];

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          Stock Transfer – {record?.reference_number ? record.reference_number : "Details"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!record ? (
          <div className="text-center py-5 text-muted">No details available.</div>
        ) : (
          <div>
            <div className="mb-3 small text-muted">
              <span className="me-3"><strong>Type:</strong> {showTransferType(record.transfer_type) || "—"}</span>
              {record.fromWarehouse && (
                <span className="me-3"><strong>From:</strong> {record.fromWarehouse?.name ?? "—"}</span>
              )}
              {record.toWarehouse && (
                <span className="me-3"><strong>To:</strong> {record.toWarehouse?.name ?? "—"}</span>
              )}
              <span><strong>Date:</strong> {formatDate(record.created_at)}</span>
            </div>
            <h6 className="mb-2 fw-semibold">Products</h6>
            <div className="table-responsive">
              <table className="table table-bordered table-sm mb-0">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Transferred Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">No products</td>
                    </tr>
                  ) : (
                    products.map((sp) => (
                      <React.Fragment key={sp.id}>
                        <tr>
                          <td>{sp.product?.product_code ?? "—"}</td>
                          <td>{sp.product?.product_name ?? "—"}</td>
                          <td>{sp.transferred_quantity ?? 0}</td>
                        </tr>
                        {sp.stockTransferBatches && sp.stockTransferBatches.length > 0 && (
                          <tr>
                            <td colSpan="3" className="p-0 bg-light">
                              <div className="px-3 py-2">
                                <span className="small fw-semibold">Batches</span>
                                <table className="table table-sm table-bordered mb-0 mt-1 small">
                                  <thead>
                                    <tr>
                                      <th>Batch No</th>
                                      <th>Expiry Date</th>
                                      <th>Transferred Quantity</th>
                                      <th>Available Quantity</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sp.stockTransferBatches.map((b) => {
                                      const rb = b.receiveProductBatch || {};
                                      return (
                                        <tr key={b.id}>
                                          <td>{rb.batch_no ?? "—"}</td>
                                          <td>{formatDate(rb.expiry_date)}</td>
                                          <td>{rb.quantity ?? b.quantity ?? "—"}</td>
                                          <td>{rb.available_quantity ?? "—"}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default StockTransferDetailModal;
