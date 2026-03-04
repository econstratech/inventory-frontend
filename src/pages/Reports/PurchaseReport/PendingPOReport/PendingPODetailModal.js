import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const PendingPODetailModal = ({ show, onHide, orderId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productInfoRow, setProductInfoRow] = useState(null);

  useEffect(() => {
    if (!show || !orderId) {
      setDetail(null);
      setProductInfoRow(null);
      return;
    }
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await PrivateAxios.get(`/purchase/purchase/${orderId}`);
        setDetail(response.data ?? null);
      } catch (err) {
        console.error('Failed to fetch PO detail:', err);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [show, orderId]);

  const product = productInfoRow?.product;
  const item = product?.ProductsItem;

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        backdrop="static"
        centered
        size="xl"
        className="pending-po-detail-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Purchase Order Details {detail?.reference_number ? `#${detail.reference_number}` : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : !detail ? (
            <div className="text-center py-5 text-muted">No details available.</div>
          ) : (
            <div className="mb-4">
              {/* Previous received */}
              {detail.recv && detail.recv.length > 0 && (
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold">Previous received</h6>
                  {detail.recv.map((rec) => (
                    <div key={rec.id} className="border rounded p-3 mb-3 bg-light">
                      <div className="mb-2">
                        <strong>Bill No.:</strong> {rec.bill_number || 'N/A'} &nbsp;|&nbsp;
                        <strong>Received By:</strong> {rec.receivedBy?.name ?? 'N/A'} &nbsp;|&nbsp;
                        <strong>Received On:</strong> {formatDate(rec.bill_date)}
                      </div>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Product Code</th>
                              <th>Received Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(rec.receivedProducts || []).map((rp) => (
                              <tr key={rp.id}>
                                <td>{rp.product?.product_name ?? 'N/A'}</td>
                                <td>{rp.product?.product_code ?? 'N/A'}</td>
                                <td>{rp.qty ?? 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Products */}
              <h6 className="mb-3 fw-semibold">Products</h6>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Product Code</th>
                      <th>PO Quantity</th>
                      <th>Balance Quantity</th>
                      <th>Receive Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.products || []).map((prod) => {
                      const itemInfo = prod.ProductsItem || {};
                      const name = itemInfo.product_name || 'N/A';
                      const code = itemInfo.product_code || '';
                      const balance = prod.available_quantity != null ? prod.available_quantity : (Number(prod.qty) - Number(prod.received || 0));
                      const isOpen = productInfoRow?.id === prod.id;
                      return (
                        <tr key={prod.id}>
                          <td>{code}</td>
                          <td>
                            <span>{name} ({code})</span>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 ms-1 text-primary"
                              title="Product details"
                              onClick={() => setProductInfoRow(isOpen ? null : { id: prod.id, product: prod })}
                            >
                              <i className="fas fa-info-circle" />
                            </button>
                          </td>
                          <td>{prod.qty ?? 0}</td>
                          <td>{balance}</td>
                          <td>{prod.received ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Product info popover */}
              {productInfoRow && product && (
                <div className="border rounded p-3 mt-3 bg-light">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-2">Product details</h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setProductInfoRow(null)}
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>
                  {item && (
                    <ul className="mb-0 small">
                      <li><strong>Name:</strong> {item.product_name}</li>
                      <li><strong>Code:</strong> {item.product_code}</li>
                      <li><strong>Category:</strong> {item?.productCategory?.title ?? 'N/A'}</li>
                      <li><strong>UOM:</strong> {item?.masterUOM?.label ?? item.masterUOM?.name ?? 'N/A'}</li>
                      <li><strong>Type:</strong> {item?.masterProductType?.name ?? 'N/A'}</li>
                      {(product.batches || []).length > 0 && (
                        <li>
                          <strong>Batches:</strong>
                          <ul className="mt-1">
                            {product.batches.map((b) => (
                              <li key={b.id}>
                                {b.batch_no} – Qty: {b.quantity}
                                {b.manufacture_date && `, Mfg: ${formatDate(b.manufacture_date)}`}
                                {b.expiry_date && `, Exp: ${formatDate(b.expiry_date)}`}
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PendingPODetailModal;
