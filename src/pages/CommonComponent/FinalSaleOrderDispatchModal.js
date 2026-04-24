import React, { useState, useEffect } from "react";
import { Modal, Table, Form, OverlayTrigger, Popover } from "react-bootstrap";
import moment from "moment";

import { PrivateAxios } from "../../environment/AxiosInstance";
import { ErrorMessage } from "../../environment/ToastMessage";
import ProductDetailsContent from "./ProductDetailsContent";
import { calculateTotalWeight } from "../../utils/weightConverter";

/**
 * Reusable Sale Order Details Modal Component
 *
 * @param {Object} props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onHide - Callback to hide the modal
 * @param {Array} props.productCompare - Array of purchase/order objects with products
 * @param {Function} props.onSubmit - Callback on submit: (selectedItems, batchPayload) => void. selectedItems = [{ salesOrder, product, rowKey, deliveryNote }], batchPayload = [{ batch_id, quantity }] from Manage batches section.
 */
const FinalSaleOrderDispatchModal = ({
  show,
  onHide,
  productCompare = [],
  currencySymbol = "₹",
  onSubmit,
  isVariantBased = false,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState(new Set());
  const [deliveryNoteMap, setDeliveryNoteMap] = useState({});

  // Manage batches section
  const [availableBatches, setAvailableBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchRows, setBatchRows] = useState([]);
  const isProductCompleted = (product) => Number(product?.status) === 11;

  const createBatchRow = () => ({
    key: `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    batchId: null,
    qty: 0,
  });

  // Initialize receivedNowMap when modal opens or productCompare changes
  useEffect(() => {
    if (show && productCompare?.length > 0) {
      const initial = {};
      productCompare.forEach((salesOrder) => {

        salesOrder.products.forEach((product) => {
          const key = `${salesOrder.id}-${product.id}`;
          let availableQty = Number(product.qty) || 0;

          initial[key] = Number(product.received_now) || 0;
          initial[`store_${key}`] = product?.warehouse || null;
          product.sales_product_received.forEach((received) => {
            availableQty -= Number(received.received_quantity) || 0;
          });
          initial[`available_qty_${key}`] = availableQty;
          initial[`is_dispatched_fully_${key}`] = availableQty === 0;
        });
      });
    }
  }, [show, productCompare]);

  // Fetch available batches when modal opens
  useEffect(() => {
    if (!show || !productCompare?.length) {
      setAvailableBatches([]);
      setBatchRows([]);
      return;
    }
    const saleId = productCompare[0]?.id;
    if (!saleId) return;

    setBatchesLoading(true);
    PrivateAxios.get(`sales/available-batches/${saleId}`)
      .then((res) => {
        const saleProducts = res.data?.data?.sale?.products || [];
        const batches = [];
        saleProducts.forEach((p) => {
          p.productData.forEach((product) => {
            const productBatches = Array.isArray(product.batches) ? product.batches : [];
            batches.push(...productBatches);
          });
        });
        setAvailableBatches(batches);
        if (batches.length > 0) {
          setBatchRows([createBatchRow()]);
        }
      })
      .catch(() => {
        setAvailableBatches([]);
        setBatchRows([]);
      })
      .finally(() => setBatchesLoading(false));
  }, [show, productCompare?.length, productCompare?.[0]?.id]);

  const toggleRowSelection = (rowKey) => {
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  const toggleSelectAll = (checked) => {
    if (!productCompare?.length) return;
    if (checked) {
      const all = new Set();
      productCompare.forEach((purchase) =>
        purchase.products.forEach((product) => {
          if (!isProductCompleted(product)) {
            all.add(`${purchase.id}-${product.id}`);
          }
        })
      );
      setSelectedRowKeys(all);
    } else {
      setSelectedRowKeys(new Set());
    }
  };

  const handleDeliveryNoteChange = (rowKey, value) => {
    setDeliveryNoteMap((prev) => ({ ...prev, [rowKey]: value }));
  };

  // Batch helpers
  const getBatchById = (batchId) =>
    availableBatches.find((b) => String(b.id) === String(batchId));

  const sumQtyForBatch = (batchId, excludeKey) =>
    batchRows
      .filter(
        (r) =>
          r.batchId != null &&
          String(r.batchId) === String(batchId) &&
          r.key !== excludeKey
      )
      .reduce((s, r) => s + (Number(r.qty) || 0), 0);

  const availableForBatchRow = (row) => {
    if (!row.batchId) return 0;
    const batch = getBatchById(row.batchId);
    if (!batch) return 0;
    const total = Number(batch.available_quantity) || 0;
    const usedByOthers = sumQtyForBatch(row.batchId, row.key);
    return Math.max(total - usedByOthers, 0);
  };

  const updateBatchRow = (key, patch) => {
    setBatchRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  };

  const addBatchRow = () => {
    setBatchRows((prev) => [...prev, createBatchRow()]);
  };

  const removeBatchRow = (key) => {
    setBatchRows((prev) => {
      const next = prev.filter((r) => r.key !== key);
      return next.length ? next : [createBatchRow()];
    });
  };

  const handleSubmit = () => {
    const selectedItems = [];
    productCompare.forEach((salesOrder) => {
      salesOrder.products.forEach((product) => {
        const rowKey = `${salesOrder.id}-${product.id}`;
        if (!isProductCompleted(product) && selectedRowKeys.has(rowKey)) {
          selectedItems.push({ salesOrder, product, rowKey, deliveryNote: '' });
        }
      });
    });
    selectedItems.forEach((item) => {
      const { rowKey } = item;
      if (deliveryNoteMap[rowKey]?.trim()) {
        selectedItems.forEach((i) => {
          if (i.rowKey === rowKey) {
            i.deliveryNote = deliveryNoteMap[rowKey].trim();
          }
        });
      }
    });

    // Build batch payload from Manage batches rows (batchId + qty, aggregated by batch_id)
    const batchPayload = [];
    const batchMap = new Map();
    batchRows
      .filter((r) => r.batchId != null && (Number(r.qty) || 0) > 0)
      .forEach((r) => {
        const id = Number(r.batchId) || r.batchId;
        const qty = Number(r.qty) || 0;
        batchMap.set(String(id), (batchMap.get(String(id)) || 0) + qty);
      });
    batchMap.forEach((quantity, batchIdStr) => {
      batchPayload.push({
        batch_id: Number(batchIdStr) || batchIdStr,
        quantity,
      });
    });

    if (selectedItems.length === 0) {
      ErrorMessage("Please select at least one product to submit");
      return;
    }
    if (onSubmit) {
      onSubmit(selectedItems, batchPayload);
    }
    onHide();
  };

  if (!productCompare || productCompare.length === 0) {
    return null;
  }

  const hasAnyMasterPack = productCompare.some((purchase) =>
    (purchase.products || []).some((p) => {
      const pd = p?.productData || p?.product;
      return Number(pd?.has_master_pack) === 1;
    })
  );

  const computeMasterPackDisplay = (qty, variantData) => {
    const qpp = parseFloat(variantData?.quantity_per_pack);
    const q = parseFloat(qty);
    if (!Number.isFinite(qpp) || qpp <= 0 || !Number.isFinite(q)) return null;
    return String(Number((q / qpp).toFixed(2)));
  };

  return (
    <Modal
      backdrop="static"
      centered
      size="xl"
      show={show}
      onHide={onHide}
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Products view of sale order{" "}
          <span className="text-primary">
            {productCompare[0]?.reference_number || ""}
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 p-3 rounded border bg-light">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <label className="text-muted">Reference No.</label>
              <p className="mb-0 fw-medium">{productCompare[0]?.reference_number || ""}</p>
            </div>
            <div className="col-md-3 col-6">
              <label className="text-muted">Customer</label>
              <p className="mb-0 fw-medium">{productCompare[0]?.customer?.name || ""}</p>
            </div>
            <div className="col-md-3 col-6">
              <label className="text-muted">Expected Delivery Date</label>
              <p className="mb-0 fw-medium">{moment(productCompare[0]?.expected_delivery_date).format("DD/MM/YYYY") || ""}</p>
            </div>
            <div className="col-md-3 col-6">
              <label className="text-muted">Payment Terms</label>
              <p className="mb-0 fw-medium">{`${productCompare[0]?.payment_terms || ""} days`}</p>
            </div>
          </div>
        </div>

        {/* Manage batches section */}
        {batchRows.length > 0 ? (
        <div className="mt-4">
          <h6 className="mb-2 text-muted">Manage batches</h6>
          {batchesLoading ? (
            <p className="text-muted small mb-0">Loading batches…</p>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted">
                  Select batch, enter quantity. Available quantity updates from batch stock minus already entered.
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addBatchRow}
                >
                  <i className="fas fa-plus me-1"></i>Add row
                </button>
              </div>
              <Table size="sm" bordered className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "30%" }}>Batch No.</th>
                    <th style={{ width: "22%" }}>Available Qty</th>
                    <th style={{ width: "22%" }}>Enter Qty</th>
                    <th style={{ width: "16%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batchRows.map((row) => {
                    const available = availableForBatchRow(row);
                    const maxQty = available;
                    const currentQty = Math.min(Number(row.qty) || 0, maxQty);
                    return (
                      <tr key={row.key}>
                        <td>
                          <Form.Select
                            size="sm"
                            value={row.batchId ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateBatchRow(row.key, {
                                batchId: val ? Number(val) : null,
                                qty: 0,
                              });
                            }}
                          >
                            <option value="">Select batch</option>
                            {availableBatches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.batch_no} (Avail: {b.available_quantity ?? 0})
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            readOnly
                            value={row.batchId ? available : "—"}
                            className="bg-light"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            min={0}
                            max={maxQty}
                            value={currentQty}
                            onChange={(e) => {
                              const v = e.target.value;
                              const n = Math.max(0, Number(v) || 0);
                              const clamped = Math.min(n, maxQty);
                              updateBatchRow(row.key, { qty: clamped });
                            }}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeBatchRow(row.key)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </>
          )}
        </div>
        ) : null}


        <div className="mt-4">
        <Table responsive bordered className="primary-table-head">
          <thead>
            <tr>
              <th style={{ width: 56, verticalAlign: "middle" }}>
                <div className="d-flex align-items-center justify-content-center">
                  {(() => {
                    const selectableRows = [];
                    productCompare.forEach((p) => {
                      p.products.forEach((prod) => {
                        if (!isProductCompleted(prod)) {
                          selectableRows.push(`${p.id}-${prod.id}`);
                        }
                      });
                    });
                    if (selectableRows.length === 0) return null;

                    return (
                      <input
                        type="checkbox"
                        className="form-check-input"
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                          minWidth: "1.25rem",
                          minHeight: "1.25rem",
                          cursor: "pointer",
                          flexShrink: 0,
                          border: "1px solid #495057",
                        }}
                        checked={selectableRows.every((rk) => selectedRowKeys.has(rk))}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                      />
                    );
                  })()}
                </div>
              </th>
              <th>Customer</th>
              <th>Reference</th>
              <th>Product Name</th>
              <th>Quantity</th>
              {isVariantBased && (
                <>
                  <th>Weight Per Unit</th>
                  <th>Total Weight</th>
                </>
              )}
              {hasAnyMasterPack && <th>Master Pack</th>}
              <th>Unit Price</th>
              <th>Tax (%)</th>
              <th>Tax Amount</th>
              <th>Total (Incl. Tax)</th>
              <th>Status</th>
              <th>Delivery Note</th>
            </tr>
          </thead>
          <tbody>
            {productCompare.flatMap((purchase, index) =>
              purchase.products.map((product, productIndex) => {
                const unitPrice = Number(product.unit_price || 0);
                const taxRate = Number(product.tax || 0);
                const quantity = Number(product.qty || 1);
                const rowKey = `${purchase.id}-${product.id}`;

                const taxAmount = (unitPrice * taxRate * quantity) / 100;
                const totalWithTax = unitPrice * quantity + taxAmount;

                return (
                  <tr key={rowKey}>
                    <td style={{ verticalAlign: "middle" }}>
                      <div className="d-flex align-items-center justify-content-center">
                        {!isProductCompleted(product) ? (
                        <input
                          type="checkbox"
                          className="form-check-input"
                          style={{
                            width: "1.25rem",
                            height: "1.25rem",
                            minWidth: "1.25rem",
                            minHeight: "1.25rem",
                            cursor: "pointer",
                            flexShrink: 0,
                            border: "1px solid #495057",
                          }}
                          checked={selectedRowKeys.has(rowKey)}
                          onChange={() => toggleRowSelection(rowKey)}
                        />
                        ) : ""}
                      </div>
                    </td>
                    <td>
                      {purchase.customer?.name || "N/A"}
                    </td>
                    <td>
                      {purchase.reference_number}
                    </td>

                    <td>
                      {product.productData?.product_name || "N/A"}
                      { " " }
                      {product.productData && (
                          <OverlayTrigger
                            trigger="click"
                            placement="right"
                            rootClose
                            container={typeof document !== "undefined" ? document.body : undefined}
                            popperConfig={{
                              modifiers: [
                                { name: "flip", options: { fallbackPlacements: ["left", "right"] } },
                                { name: "preventOverflow", options: { boundary: "viewport" } },
                                { name: "offset", options: { offset: [0, 8] } },
                              ],
                            }}
                            overlay={
                              <Popover id={`product-details-${product.id}`} style={{ maxWidth: "450px", zIndex: 1060 }}>
                                <Popover.Header as="h6" className="d-flex align-items-center">
                                  <i className="fas fa-info-circle text-primary me-2"></i>
                                  Product Details
                                </Popover.Header>
                                <Popover.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
                                  <ProductDetailsContent productData={product.productData} />
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <span
                              role="button"
                              tabIndex={0}
                              className="text-primary"
                              style={{ cursor: "pointer", flexShrink: 0, marginTop: "8px" }}
                              title="View product details"
                              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
                            >
                              <i className="fas fa-info-circle fa-lg"></i>
                            </span>
                          </OverlayTrigger>
                        )}
                      
                    </td>
                    <td>{quantity}</td>

                    {isVariantBased && (
                      <>
                        <td>{product?.productVariant.weight_per_unit || "N/A"} {product?.productVariant.masterUOM?.label || ""}</td>
                        <td>
                          {product.productVariant
                            ? calculateTotalWeight(
                                quantity,
                                product.productVariant?.weight_per_unit,
                                product.productVariant?.masterUOM?.label ||
                                  product.productVariant?.master_uom?.label
                              ).display
                            : "N/A"}
                        </td>
                      </>
                    )}
                    {hasAnyMasterPack && (
                      <td>
                        {(() => {
                          const pd = product?.productData || product?.product;
                          const variantData = product?.productVariant || product?.variantData;
                          if (
                            Number(pd?.has_master_pack) === 1 &&
                            Number(variantData?.quantity_per_pack) > 0
                          ) {
                            const mp = computeMasterPackDisplay(quantity, variantData);
                            return mp != null ? `${mp} unit` : <span className="text-muted">—</span>;
                          }
                          return <span className="text-muted">—</span>;
                        })()}
                      </td>
                    )}
                    <td>
                      {currencySymbol} {unitPrice.toFixed(2)}
                    </td>
                    <td>{taxRate.toFixed(2)}%</td>
                    <td>
                      {currencySymbol} {taxAmount.toFixed(2)}
                    </td>
                    <td>
                      {currencySymbol} {totalWithTax.toFixed(2)}
                    </td>
                    <td>
                      {!isProductCompleted(product) ? (
                      <span className="badge bg-success text-white">Dispatched</span>
                      ) : (
                        <span className="badge bg-info text-white">Completed</span>
                      )}
                    </td>
                    <td>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Delivery note (optional)"
                        value={deliveryNoteMap[rowKey] ?? product.delivery_note ?? ""}
                        onChange={(e) => handleDeliveryNoteChange(rowKey, e.target.value)}
                        disabled={product.delivery_note !== null}
                      />
                    </td>
                  </tr>
                );
              })
            )}

            {/* Grand Total Row */}
            <tr>
              <td
                colSpan={10 + (hasAnyMasterPack ? 1 : 0)}
                className="text-end fw-bold"
              >
                Grand Total:
              </td>
              <td className="fw-bold">
                {currencySymbol}{" "}
                {productCompare.reduce(
                  (acc, purchase) =>
                    acc +
                    purchase.products.reduce((sum, product) => {
                      const unitPrice = Number(product.unit_price || 0);
                      const taxRate = Number(product.tax || 0);
                      const quantity = Number(product.qty || 1);
                      const taxAmount = (unitPrice * taxRate * quantity) / 100;
                      return sum + unitPrice * quantity + taxAmount;
                    }, 0),
                  0
                ).toFixed(2)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </Table>
        </div>

        {/* Received items per product */}
        {productCompare.some((purchase) =>
          purchase.products?.some((product) => Array.isArray(product.sales_product_received) && product.sales_product_received.length > 0)
        ) ? (
          <div className="mt-4">
            <h6 className="mb-3 text-muted">Dispatched items</h6>
            {productCompare.flatMap((purchase) =>
              (purchase.products || []).map((product) => {
                const receivedList = Array.isArray(product.sales_product_received) ? product.sales_product_received : [];
                if (receivedList.length === 0) return null;

                const productName = product.productData?.product_name || "N/A";
                const productCode = product.productData?.product_code || "";
                const orderQty = Number(product.qty) || 0;
                const totalReceived = receivedList.reduce((sum, r) => sum + Number(r.received_quantity || 0), 0);
                const totalRejected = receivedList.reduce((sum, r) => sum + Number(r.rejected_quantity || 0), 0);

                return (
                  <div key={`${purchase.id}-${product.id}-received`} className="card mb-3">
                    <div className="card-header py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <span className="fw-medium">
                        {productName}
                        {productCode ? ` (${productCode})` : ""}
                      </span>
                      <span className="me-2 text-primary">
                        Ordered: {orderQty} · Dispatched: {totalReceived}
                        {totalRejected > 0 ? ` · Rejected: ${totalRejected}` : ""}
                      </span>
                    </div>
                    <div className="card-body p-0">
                      <Table size="sm" bordered className="mb-0 rounded">
                        <thead className="table-light">
                          <tr>
                            <th width="2%">#</th>
                            {isVariantBased && (
                              <th width="15%">Variant</th>
                            )}
                            <th width="10%">Dispatched Qty</th>
                            {/* <th>Rejected Qty</th> */}
                            <th width="25%">Dispatched by</th>
                            <th width="10%">Dispatched Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivedList.map((rec, idx) => (
                            <tr key={rec.id}>
                              <td>{idx + 1}</td>
                              {isVariantBased && (
                                <td>{rec?.productVariant?.weight_per_unit || "N/A"} {rec?.productVariant?.masterUOM?.label || ""}</td>
                              )}
                              <td>{Number(rec.received_quantity || 0)}</td>
                              {/* <td>{Number(rec.rejected_quantity || 0)}</td> */}
                              <td>{rec.user?.name ?? "—"}</td>
                              <td>{moment(rec.created_at).format("DD/MM/YYYY")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                );
              })
            ).filter(Boolean)}
          </div>
        ) : null}


        {onSubmit ? (
        <div className="d-flex justify-content-end mt-3">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
        ) : ""}
      </Modal.Body>
    </Modal>
  );
};

export default FinalSaleOrderDispatchModal;
