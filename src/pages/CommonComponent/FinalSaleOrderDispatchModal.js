import React, { useState, useEffect } from "react";
import { Modal, Table, Form } from "react-bootstrap";
import moment from "moment";

import { PrivateAxios } from "../../environment/AxiosInstance";
import { ErrorMessage } from "../../environment/ToastMessage";

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
}) => {
  // const [productStores, setProductStores] = useState({});
  // const [loadingStores, setLoadingStores] = useState({});
  // const fetchedProductIdsRef = useRef(new Set());
  // const [error, setError] = useState({});
  // const [receivedNowMap, setReceivedNowMap] = useState({});
  // const [dispatchedProductIds, setDispatchedProductIds] = useState(new Set());
  // Selected rows: Set of rowKey (`${purchaseId}-${productId}`)
  const [selectedRowKeys, setSelectedRowKeys] = useState(new Set());
  // Delivery note per row: { [rowKey]: string }
  const [deliveryNoteMap, setDeliveryNoteMap] = useState({});

  // Manage batches section
  const [availableBatches, setAvailableBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchRows, setBatchRows] = useState([]);

  const createBatchRow = () => ({
    key: `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    batchId: null,
    qty: 0,
  });

  // Fetch store-wise stock for a product
  // const fetchProductStores = useCallback(async (productId) => {
  //   if (!productId) {
  //     return;
  //   }

  //   // Check if we've already initiated fetching for this product
  //   if (fetchedProductIdsRef.current.has(productId)) {
  //     return; // Already initiated, don't fetch again
  //   }

  //   // Mark as fetched
  //   fetchedProductIdsRef.current.add(productId);

  //   setLoadingStores((prev) => ({ ...prev, [productId]: true }));
  //   try {
  //     const response = await PrivateAxios.get(
  //       `/product/store-wise-stock/${productId}`
  //     );
  //     if (response.status === 200 && response.data.status) {
  //       const stores = response.data.data.stores || [];
  //       const storeOptions = stores.map((store) => ({
  //         value: store.warehouse.id,
  //         label: `${store.warehouse.name} (Stock: ${store.available_stock})`,
  //         warehouse: store.warehouse,
  //         available_stock: store.available_stock,
  //       }));
  //       setProductStores((prev) => ({
  //         ...prev,
  //         [productId]: storeOptions,
  //       }));
  //     }
  //   } catch (error) {
  //     console.error(`Error fetching stores for product ${productId}:`, error);
  //     setProductStores((prev) => ({
  //       ...prev,
  //       [productId]: [],
  //     }));
  //   } finally {
  //     setLoadingStores((prev) => ({ ...prev, [productId]: false }));
  //   }
  // }, []);

  // Fetch stores for all products when modal opens and productCompare changes
  // useEffect(() => {
  //   // if (show && productCompare.length > 0) {
  //   //   productCompare.forEach((purchase) => {
  //   //     purchase.products.forEach((product) => {
  //   //       // Try product_id first, then productData?.id
  //   //       const productId = product.product_id || product.productData?.id;
  //   //       if (productId) {
  //   //         fetchProductStores(productId);
  //   //       }
  //   //     });
  //   //   });
  //   // }
  //   // Reset fetched IDs when modal closes to allow refetching when reopened
  //   if (!show) {
  //     fetchedProductIdsRef.current.clear();
  //     setDispatchedProductIds(new Set());
  //     setSelectedRowKeys(new Set());
  //     setDeliveryNoteMap({});
  //   }
  // }, [show, productCompare]);

  // Initialize receivedNowMap when modal opens or productCompare changes
  useEffect(() => {
    if (show && productCompare?.length > 0) {
      const initial = {};
      productCompare.forEach((purchase) => {
        purchase.products.forEach((product) => {
          const key = `${purchase.id}-${product.id}`;
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
      // setReceivedNowMap(initial);
      // console.log("productCompare", productCompare);
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
            // batches.forEach((b) => {
            //   batches.push({
            //     ...b,
            //     // purchase_id: p.id,
            //     // purchase_reference_number: p.reference_number,
            //   });
            // });
          });
          // batches.forEach((b) => {
          //   flattened.push({
          //     ...b,
          //     // purchase_id: p.id,
          //     // purchase_reference_number: p.reference_number,
          //   });
          // });
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

  // Handler to update warehouse when store is changed
  // const handleStoreChange = (purchaseId, productId, selectedStore) => {
  //   if (onStoreChange) {
  //     onStoreChange(purchaseId, productId, selectedStore);
  //     setReceivedNowMap((prev) => ({ ...prev, [`store_${purchaseId}-${productId}`]: selectedStore.value }));
  //   }
  // };

  // Handler for quantity (received_now) change; available_qty = quantity - received_now
  // const handleProductQuantityChange = (purchaseId, productId, field, value) => {
  //   if (field !== "received_now") return;
  //   const key = `${purchaseId}-${productId}`;
  //   const num = Math.max(0, Number(value) || 0);
  //   setReceivedNowMap((prev) => ({ ...prev, [key]: num }));
  //   setError((prev) => {
  //     const next = { ...prev };
  //     delete next[`received_${key}`];
  //     return next;
  //   });
  // };

  // Validate received_now for a product before dispatching: 0 <= received_now <= quantity
  // const validateProductReceived = (purchaseId, productId, quantity, receivedNow, currentStoreId) => {
  //   const key = `received_${purchaseId}-${productId}`;
  //   if (!currentStoreId || currentStoreId === null) {
  //     setError((prev) => ({ ...prev, [`store_${purchaseId}-${productId}`]: "Please select a store." }));
  //     return false;
  //   }
  //   if (receivedNow <= 0) {
  //     setError((prev) => ({ ...prev, [key]: "Dispatch quantity cannot be zero or negative." }));
  //     return false;
  //   }
  //   if (receivedNow > quantity) {
  //     setError((prev) => ({ ...prev, [key]: "Dispatch quantity cannot exceed order quantity." }));
  //     return false;
  //   }
  //   return true;
  // };

  // Handler for status change: validate before calling parent
  // const handleReceiveProduct = (salesid, spid, sid) => {
  //   const purchase = productCompare.find((p) => p.id === salesid);
  //   const product = purchase?.products.find((p) => p.id === spid);
  //   if (!purchase || !product) return;

  //   const quantity = Number(product.qty || 1);
  //   const key = `${salesid}-${spid}`;
  //   const receivedNow = receivedNowMap[key] ?? Number(product.received_now) ?? 0;
  //   const currentStore = receivedNowMap[`store_${salesid}-${spid}`] ?? null;

  //   if (!validateProductReceived(salesid, spid, quantity, receivedNow, currentStore.id)) {
  //     return;
  //   }

  //   setError((prev) => {
  //     const next = { ...prev };
  //     delete next[`received_${key}`];
  //     delete next[`store_${salesid}-${spid}`];
  //     return next;
  //   });


  //   if (onProductReceive) {
  //     onProductReceive(salesid, spid, sid, receivedNow, currentStore.id);
  //     // Optimistic UI: show as Dispatched and toast (parent will also update productCompare on API success)
  //     setDispatchedProductIds((prev) => new Set([...prev, spid]));
  //     setReceivedNowMap((prev) => ({ ...prev, [`is_dispatched_fully_${key}`]: prev[`available_qty_${key}`] === 0 }));
  //   }
  // };

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
          all.add(`${purchase.id}-${product.id}`);
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
        if (selectedRowKeys.has(rowKey)) {
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
                    checked={
                      productCompare.length > 0 &&
                      productCompare.every((p) =>
                        p.products.every((prod) =>
                          selectedRowKeys.has(`${p.id}-${prod.id}`)
                        )
                      )
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </div>
              </th>
              <th>Customer</th>
              <th>Reference</th>
              <th>Product Name</th>
              <th>Quantity</th>
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
                // const receivedNow = receivedNowMap[rowKey] ?? Number(product.received_now) ?? 0;
                // const previousAvailableQty = receivedNowMap[`available_qty_${rowKey}`] ?? Number(product.available_qty) ?? 0;
                // const availableQty = Math.max(0, previousAvailableQty - receivedNow);

                const taxAmount = (unitPrice * taxRate * quantity) / 100;
                const totalWithTax = unitPrice * quantity + taxAmount;

                return (
                  <tr key={rowKey}>
                    <td style={{ verticalAlign: "middle" }}>
                      <div className="d-flex align-items-center justify-content-center">
                        {purchase.status !== 11 ? (
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

                    <td>{product.productData?.product_name || "N/A"}</td>
                    <td>{quantity}</td>
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
                      {product.status !== 11 ? (
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
              <td colSpan={8} className="text-end fw-bold">
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
                      <span className="small text-muted">
                        Ordered: {orderQty} · Dispatched: {totalReceived}
                        {totalRejected > 0 ? ` · Rejected: ${totalRejected}` : ""}
                      </span>
                    </div>
                    <div className="card-body p-0">
                      <Table size="sm" bordered className="mb-0 rounded">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: 60 }}>#</th>
                            <th>Dispatched Qty</th>
                            {/* <th>Rejected Qty</th> */}
                            <th>Dispatched by</th>
                            <th>Dispatched Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivedList.map((rec, idx) => (
                            <tr key={rec.id}>
                              <td>{idx + 1}</td>
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
