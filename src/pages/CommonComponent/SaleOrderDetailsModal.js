import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Table } from "react-bootstrap";
import Select from "react-select";
import { Tooltip } from "antd";
import moment from "moment";
import { PrivateAxios } from "../../environment/AxiosInstance";

/**
 * Reusable Sale Order Details Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onHide - Callback to hide the modal
 * @param {Array} props.productCompare - Array of purchase/order objects with products
 * @param {Function} props.onStoreChange - Callback when store is changed: (purchaseId, productId, selectedStore) => void
 * @param {Function} props.onProductReceive - Callback when status is changed: (salesid, statusId, productId) => void
 * @param {string} props.currencySymbol - Currency symbol to display (e.g., "₹", "$")
 * @param {Function} props.getStatusLabel - Function to get status label: (status) => string
 */
const SaleOrderDetailsModal = ({
  show,
  onHide,
  productCompare = [],
  onStoreChange,
  onProductReceive,
  currencySymbol = "₹",
  getStatusLabel = (status) => {
    const statusLabel = {
      10: "Dispatched",
      11: "Production",
    };
    return statusLabel[status] || "Pending";
  },
}) => {
  const [productStores, setProductStores] = useState({}); // Store options for each product: { productId: [{ value, label, available_stock }] }
  const [loadingStores, setLoadingStores] = useState({}); // Loading state per product: { productId: true/false }
  const fetchedProductIdsRef = useRef(new Set()); // Track which product IDs we've already initiated fetching for
  const [error, setError] = useState({});
  // Local received_now per product: key = `${purchaseId}-${productId}`
  const [receivedNowMap, setReceivedNowMap] = useState({});
  // Product IDs marked as dispatched in this session (optimistic UI + after parent success)
  const [dispatchedProductIds, setDispatchedProductIds] = useState(new Set());

  // Fetch store-wise stock for a product
  const fetchProductStores = useCallback(async (productId) => {
    if (!productId) {
      return;
    }

    // Check if we've already initiated fetching for this product
    if (fetchedProductIdsRef.current.has(productId)) {
      return; // Already initiated, don't fetch again
    }

    // Mark as fetched
    fetchedProductIdsRef.current.add(productId);

    setLoadingStores((prev) => ({ ...prev, [productId]: true }));
    try {
      const response = await PrivateAxios.get(
        `/product/store-wise-stock/${productId}`
      );
      if (response.status === 200 && response.data.status) {
        const stores = response.data.data.stores || [];
        const storeOptions = stores.map((store) => ({
          value: store.warehouse.id,
          label: `${store.warehouse.name} (Stock: ${store.available_stock})`,
          warehouse: store.warehouse,
          available_stock: store.available_stock,
        }));
        setProductStores((prev) => ({
          ...prev,
          [productId]: storeOptions,
        }));
      }
    } catch (error) {
      console.error(`Error fetching stores for product ${productId}:`, error);
      setProductStores((prev) => ({
        ...prev,
        [productId]: [],
      }));
    } finally {
      setLoadingStores((prev) => ({ ...prev, [productId]: false }));
    }
  }, []);

  // Fetch stores for all products when modal opens and productCompare changes
  useEffect(() => {
    if (show && productCompare.length > 0) {
      productCompare.forEach((purchase) => {
        purchase.products.forEach((product) => {
          // Try product_id first, then productData?.id
          const productId = product.product_id || product.productData?.id;
          if (productId) {
            fetchProductStores(productId);
          }
        });
      });
    }
    // Reset fetched IDs when modal closes to allow refetching when reopened
    if (!show) {
      fetchedProductIdsRef.current.clear();
      setDispatchedProductIds(new Set());
    }
  }, [show, productCompare, fetchProductStores]);

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
          initial[`is_dispatched_partially_${key}`] =
            availableQty > 0 && Array.isArray(product.sales_product_received) && product.sales_product_received.length > 0;
        });
      });
      setReceivedNowMap(initial);
      setError({});
    }
  }, [show]);

  // Handler to update warehouse when store is changed
  const handleStoreChange = (purchaseId, productId, selectedStore) => {
    // Store full option so Select can resolve value (was storing only selectedStore.value, so UI didn't update)
    setReceivedNowMap((prev) => ({ ...prev, [`store_${purchaseId}-${productId}`]: selectedStore }));
    if (onStoreChange) {
      // console.log("selectedStore", selectedStore);
      onStoreChange(purchaseId, selectedStore);
    }
  };

  // Handler for quantity (received_now) change; available_qty = quantity - received_now
  const handleProductQuantityChange = (purchaseId, productId, field, value) => {
    if (field !== "received_now") return;
    const key = `${purchaseId}-${productId}`;
    const num = Math.max(0, Number(value) || 0);
    setReceivedNowMap((prev) => ({ ...prev, [key]: num }));
    setError((prev) => {
      const next = { ...prev };
      delete next[`received_${key}`];
      return next;
    });
  };

  // Validate received_now for a product before dispatching: 0 <= received_now <= quantity
  const validateProductReceived = (purchaseId, productId, quantity, receivedNow, currentStoreId) => {
    const key = `received_${purchaseId}-${productId}`;
    if (!currentStoreId || currentStoreId === null) {
      setError((prev) => ({ ...prev, [`store_${purchaseId}-${productId}`]: "Please select a store." }));
      return false;
    }
    if (receivedNow <= 0) {
      setError((prev) => ({ ...prev, [key]: "Dispatch quantity cannot be zero or negative." }));
      return false;
    }
    if (receivedNow > quantity) {
      setError((prev) => ({ ...prev, [key]: "Dispatch quantity cannot exceed order quantity." }));
      return false;
    }
    return true;
  };

  // Handler for status change: validate before calling parent
  const handleReceiveProduct = (salesid, spid, sid) => {
    const purchase = productCompare.find((p) => p.id === salesid);
    const product = purchase?.products.find((p) => p.id === spid);
    if (!purchase || !product) return;

    const quantity = Number(product.qty || 1);
    const key = `${salesid}-${spid}`;
    const receivedNow = receivedNowMap[key] ?? Number(product.received_now) ?? 0;
    const currentStore = receivedNowMap[`store_${salesid}-${spid}`] ?? null;
    const currentStoreId = currentStore?.value ?? currentStore?.warehouse?.id ?? currentStore?.id;

    if (!validateProductReceived(salesid, spid, quantity, receivedNow, currentStoreId)) {
      return;
    }

    setError((prev) => {
      const next = { ...prev };
      delete next[`received_${key}`];
      delete next[`store_${salesid}-${spid}`];
      return next;
    });


    if (onProductReceive) {
      onProductReceive(salesid, spid, sid, receivedNow, currentStoreId);
      setDispatchedProductIds((prev) => new Set([...prev, spid]));
      // Update local state: new balance = current available - dispatched qty; then show Fully or Partially Dispatched
      const prevAvailable = receivedNowMap[`available_qty_${key}`] ?? quantity;
      const newBalance = Math.max(0, prevAvailable - receivedNow);
      setReceivedNowMap((prev) => ({
        ...prev,
        [key]: 0,
        [`available_qty_${key}`]: newBalance,
        [`is_dispatched_fully_${key}`]: newBalance === 0,
        [`is_dispatched_partially_${key}`]: newBalance > 0 && receivedNow > 0,
      }));
    }
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
        <Table responsive bordered className="primary-table-head">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Reference</th>
              <th>Product Name</th>
              <th>Store</th>
              <th>Sell Order Quantity</th>
              <th>Balance Quantity</th>
              <th>Dispatch Quantity</th>
              {/* <th>Unit Price</th>
              <th>Tax (%)</th>
              <th>Tax Amount</th>
              <th>Total (Incl. Tax)</th> */}
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {productCompare.flatMap((purchase, index) =>
              purchase.products.map((product, productIndex) => {
                // const unitPrice = Number(product.unit_price || 0);
                // const taxRate = Number(product.tax || 0);
                const quantity = Number(product.qty || 1);
                const rowKey = `${purchase.id}-${product.id}`;
                const receivedNow = receivedNowMap[rowKey] ?? Number(product.received_now) ?? 0;
                const previousAvailableQty = receivedNowMap[`available_qty_${rowKey}`] ?? Number(product.available_qty) ?? 0;
                const availableQty = Math.max(0, previousAvailableQty - receivedNow);
                // const isDispatched = isDispatchedFully ||
                //   product.status === 10 ||
                //   product.localStatus === "Dispatched" ||
                //   dispatchedProductIds.has(product.id);
                // const taxAmount = (unitPrice * taxRate * quantity) / 100;
                // const totalWithTax = unitPrice * quantity + taxAmount;

                return (
                  <tr key={rowKey}>
                    {/* Merge Customer Name & Reference Number: Show only for the first product in each purchase */}
                    {productIndex === 0 && (
                      <>
                        <td rowSpan={purchase.products.length}>
                          {purchase.customer?.name || "N/A"}
                        </td>
                        <td rowSpan={purchase.products.length}>
                          {purchase.reference_number}
                        </td>
                      </>
                    )}

                    <td>{product.productData?.product_name || "N/A"}</td>
                    <td style={{ overflow: "visible", position: "relative" }}>
                      <div style={{ position: "relative", zIndex: 1 }}>
                        {(() => {
                          const productId =
                            product.product_id || product.productData?.id;
                          const baseStoreOptions = productId
                            ? productStores[productId] || []
                            : [];

                          // currentSelectedStore can be: (1) from init product.warehouse = { id, name }, (2) from state = full option { value, label, warehouse }
                          let storeOptions = [...baseStoreOptions];
                          let currentStore = null;
                          const currentSelectedStore = receivedNowMap[`store_${rowKey}`] ?? product?.warehouse ?? null;
                          const selectedId = currentSelectedStore?.value ?? currentSelectedStore?.id ?? currentSelectedStore?.warehouse?.id;

                          if (currentSelectedStore && selectedId != null) {
                            currentStore = baseStoreOptions.find((opt) => opt.value === selectedId);
                            if (!currentStore) {
                              const label = currentSelectedStore.label ?? currentSelectedStore.warehouse?.name ?? currentSelectedStore.name;
                              if (label != null) {
                                const syntheticOption = {
                                  value: selectedId,
                                  label,
                                  warehouse: currentSelectedStore.warehouse ?? currentSelectedStore,
                                  available_stock: currentSelectedStore.available_stock ?? null,
                                };
                                storeOptions = [syntheticOption, ...baseStoreOptions];
                                currentStore = syntheticOption;
                              }
                            }
                          }

                          const isLoading = productId
                            ? loadingStores[productId]
                            : false;

                          return (
                            <Select
                              value={currentStore}
                              onChange={(selectedOption) =>
                                handleStoreChange(
                                  purchase.id,
                                  product.id,
                                  selectedOption
                                )
                              }
                              options={storeOptions}
                              isLoading={isLoading}
                              isClearable={false}
                              isSearchable={true}
                              placeholder={
                                isLoading ? "Loading stores..." : "Select store"
                              }
                              menuShouldScrollIntoView={true}
                              openMenuOnClick={true}
                              openMenuOnFocus={false}
                              disabled={receivedNowMap[`is_dispatched_fully_${rowKey}`]}
                              styles={{
                                control: (base, state) => ({
                                  ...base,
                                  minHeight: "32px",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                }),
                                menu: (base) => ({
                                  ...base,
                                  zIndex: 10000,
                                }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 10000,
                                }),
                                menuList: (base) => ({
                                  ...base,
                                  maxHeight: "200px",
                                  padding: "4px 0",
                                }),
                                option: (base, state) => ({
                                  ...base,
                                  cursor: "pointer",
                                  backgroundColor: state.isSelected
                                    ? "#6161ff"
                                    : state.isFocused
                                    ? "#ddddff"
                                    : base.backgroundColor,
                                  color: state.isSelected ? "#fff" : base.color,
                                }),
                              }}
                              menuPortalTarget={
                                typeof document !== "undefined"
                                  ? document.body
                                  : null
                              }
                              menuPosition="fixed"
                              noOptionsMessage={() => "No stores available"}
                            />
                          );
                        })()}
                        {error?.[`store_${rowKey}`] && (
                          <div className="invalid-feedback d-block small">
                            {error[`store_${rowKey}`]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{quantity}</td>
                    <td>
                      <div className="min-width-100">
                        <input
                          type="number"
                          name="available_qty"
                          value={availableQty}
                          readOnly
                          className="form-control bg-light"
                        />
                      </div>
                    </td>
                    <td>
                      <div className="min-width-100">
                        <input
                          type="number"
                          name="received_now"
                          min="0"
                          max={quantity}
                          value={receivedNow}
                          onChange={(e) =>
                            handleProductQuantityChange(
                              purchase.id,
                              product.id,
                              "received_now",
                              e.target.value
                            )
                          }
                          className={`form-control ${error?.[`received_${rowKey}`] ? "is-invalid" : ""}`}
                        />
                        {error?.[`received_${rowKey}`] && (
                          <div className="invalid-feedback d-block small">
                            {error[`received_${rowKey}`]}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* <td>
                      {currencySymbol} {unitPrice.toFixed(2)}
                    </td>
                    <td>{taxRate.toFixed(2)}%</td>
                    <td>
                      {currencySymbol} {taxAmount.toFixed(2)}
                    </td>
                    <td>
                      {currencySymbol} {totalWithTax.toFixed(2)}
                    </td> */}
                    <td>
                      {receivedNowMap[`is_dispatched_fully_${rowKey}`] ? (
                        <span className="badge bg-success text-white">Fully Dispatched</span>
                      ) : receivedNowMap[`is_dispatched_partially_${rowKey}`] || ((product.status === 9 || product.status === 10) && Array.isArray(product.sales_product_received) && product.sales_product_received.length > 0) ? (
                        <span className="badge bg-warning text-dark">Partially Dispatched</span>
                      ) : (
                        <span className="badge bg-info text-white">Pending</span>
                      )}
                    </td>
                    <td>
                      {!receivedNowMap[`is_dispatched_fully_${rowKey}`] && (
                        <>
                          <div className="d-flex gap-2">
                            <Tooltip title="Dispatch Product">
                              <button
                                className="me-1 icon-btn"
                                onClick={() =>
                                  handleReceiveProduct(
                                    purchase.id,
                                    product?.id,
                                    10
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  id="Layer_1"
                                  data-name="Layer 1"
                                  viewBox="0 0 24 24"
                                  width={18}
                                  height={18}
                                  fill="currentColor"
                                >
                                  <path d="m1,2.5C1,1.119,2.119,0,3.5,0s2.5,1.119,2.5,2.5-1.119,2.5-2.5,2.5S1,3.881,1,2.5Zm.5,16c-.829,0-1.5.672-1.5,1.5v2.5c0,.828.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-2.5c0-.828-.671-1.5-1.5-1.5Zm22.461-.457c-.187-.808-.992-1.311-1.8-1.122l-6.813,1.579-2.86-12.339c-.187-.808-.993-1.311-1.8-1.122-.807.187-1.31.993-1.123,1.8l.733,3.161h-1.966l-1.325-2.121c-.736-1.177-2.004-1.879-3.392-1.879h-.614c-1.654,0-3,1.346-3,3v4.085c0,1.396.744,2.71,1.942,3.43l3.058,1.835v4.15c0,.828.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-4.434c0-.873-.465-1.695-1.213-2.144l-1.787-1.072v-4.52l.935,1.497c.461.734,1.253,1.173,2.119,1.173h2.939l1.446,6.236c-.85.399-1.439,1.262-1.439,2.264,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.024-.001-.048-.002-.072l6.841-1.586c.807-.187,1.31-.992,1.123-1.8Zm-7.531-3.408c.201.859,1.062,1.391,1.92,1.187l2.907-.691c.854-.203,1.383-1.059,1.183-1.914l-.7-2.986c-.201-.859-1.062-1.391-1.92-1.187l-2.907.691c-.854.203-1.383,1.059-1.183,1.914l.7,2.986Z" />
                                </svg>
                              </button>
                            </Tooltip>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}

            {/* Grand Total Row */}
            {/* <tr>
              <td colSpan={7} className="text-end fw-bold">
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
            </tr> */}
          </tbody>
        </Table>

        {/* Dispatched items per product */}
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
                            <th>Dispatched by</th>
                            <th>Dispatch Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivedList.map((rec, idx) => (
                            <tr key={rec.id}>
                              <td>{idx + 1}</td>
                              <td>{Number(rec.received_quantity || 0)}</td>
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
      </Modal.Body>
    </Modal>
  );
};

export default SaleOrderDetailsModal;
