import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Modal, Table, OverlayTrigger, Popover } from "react-bootstrap";
import Select from "react-select";
import { Tooltip } from "antd";
import moment from "moment";
import { PrivateAxios } from "../../environment/AxiosInstance";
import ProductSelect from "../filterComponents/ProductSelect";
import ProductVariantSelectionModal from "./ProductVariantSelectionModal";
import ProductDetailsContent from "./ProductDetailsContent";
import { calculateTotalWeight } from "../../utils/weightConverter";

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
  const [productStores, setProductStores] = useState({}); // Store options key: `${productId}_${variantId || "no_variant"}`
  const [loadingStores, setLoadingStores] = useState({}); // Loading key: `${productId}_${variantId || "no_variant"}`
  const fetchedProductIdsRef = useRef(new Set()); // Track fetched keys to avoid duplicate fetches
  const [error, setError] = useState({});
  const [editedProducts, setEditedProducts] = useState({});
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentProductRow, setCurrentProductRow] = useState(null);
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState(null);
  const [variantModalBackup, setVariantModalBackup] = useState(null);
  const productSelectQueryParams = useMemo(() => ({ type: "dropDown" }), []);
  // Local received_now per product: key = `${purchaseId}-${productId}`
  const [receivedNowMap, setReceivedNowMap] = useState({});
  // Product IDs marked as dispatched in this session (optimistic UI + after parent success)
  const [dispatchedProductIds, setDispatchedProductIds] = useState(new Set());

  // Fetch store-wise stock for a product
  const getStoreFetchKey = (productId, variantId = null) =>
    `${productId}_${variantId ?? "no_variant"}`;

  const fetchProductStores = useCallback(async (productId, variantId = null) => {
    if (!productId) {
      return;
    }
    const fetchKey = getStoreFetchKey(productId, variantId);

    // Check if we've already initiated fetching for this key
    if (fetchedProductIdsRef.current.has(fetchKey)) {
      return; // Already initiated, don't fetch again
    }

    // Mark as fetched
    fetchedProductIdsRef.current.add(fetchKey);

    setLoadingStores((prev) => ({ ...prev, [fetchKey]: true }));
    try {
      const params = new URLSearchParams();
      if (variantId) {
        params.append("product_variant_id", variantId);
      }
      const response = await PrivateAxios.get(
        `/product/store-wise-stock/${productId}${params.toString() ? `?${params.toString()}` : ""}`
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
          [fetchKey]: storeOptions,
        }));
      }
    } catch (error) {
      console.error(
        `Error fetching stores for product ${productId} and variant ${variantId}:`,
        error
      );
      setProductStores((prev) => ({
        ...prev,
        [fetchKey]: [],
      }));
    } finally {
      setLoadingStores((prev) => ({ ...prev, [fetchKey]: false }));
    }
  }, []);

  // Fetch stores for existing product/variant rows when modal opens.
  // Do not depend on editedProducts to avoid repeated fetches during local edits.
  useEffect(() => {
    if (show && productCompare.length > 0) {
      productCompare.forEach((purchase) => {
        purchase.products.forEach((product) => {
          const productId =
            product.product_id ||
            product.productData?.id;
          const variantId =
            product.variant_id ||
            product.product_variant_id ||
            product.productVariant?.id ||
            null;
          if (productId) {
            fetchProductStores(productId, variantId);
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

  // Initialize row state when modal opens.
  // Preserve user store selections when productCompare changes (e.g. from onStoreChange
  // or refresh), otherwise the selection would disappear.
  useEffect(() => {
    if (show && productCompare?.length > 0) {
      const initial = {};
      productCompare.forEach((purchase) => {
        purchase.products.forEach((product) => {
          const key = `${purchase.id}-${product.id}`;
          const receivedHistory = Array.isArray(product.sales_product_received)
            ? product.sales_product_received
            : [];
          const historicalReceivedQty = receivedHistory.reduce(
            (sum, r) => sum + (Number(r.received_quantity) || 0),
            0
          );
          let availableQty = Math.max((Number(product.qty) || 0) - historicalReceivedQty, 0);

          initial[key] = Number(product.received_now) || 0;
          initial[`store_${key}`] = product?.warehouse || purchase?.warehouse || null;
          initial[`available_qty_${key}`] = availableQty;
          initial[`is_dispatched_fully_${key}`] = availableQty === 0;
          initial[`is_dispatched_partially_${key}`] =
            availableQty > 0 && receivedHistory.length > 0;
        });
      });
      setReceivedNowMap((prev) => {
        const next = { ...initial };
        // Preserve user's store selections - don't overwrite when productCompare
        // changes due to onStoreChange or other parent updates
        productCompare.forEach((purchase) => {
          purchase.products.forEach((product) => {
            const key = `${purchase.id}-${product.id}`;
            const storeKey = `store_${key}`;
            if (Object.prototype.hasOwnProperty.call(prev, storeKey) && prev[storeKey] != null) {
              next[storeKey] = prev[storeKey];
            }
          });
        });
        return next;
      });
      setError({});
    }
  }, [show, productCompare]);

  // Keep editable row fields in sync with refreshed order details from API.
  // This updates product/variant/qty/unit_price/tax while preserving store map state.
  useEffect(() => {
    if (show && productCompare?.length > 0) {
      const nextEditedProducts = {};
      productCompare.forEach((purchase) => {
        purchase.products.forEach((product) => {
          nextEditedProducts[product.id] = {
            qty: product.qty,
            unit_price: product.unit_price,
            tax: product.tax,
            product_id: product.product_id || product.productData?.id || null,
            productData: product.productData || null,
            variant_id:
              product.variant_id ||
              product.product_variant_id ||
              product.productVariant?.id ||
              null,
            variantData: product.variantData || product.productVariant || null,
          };
        });
      });
      setEditedProducts(nextEditedProducts);
    }
  }, [show, productCompare]);

  const handleProductFieldChange = (purchaseId, product, field, value) => {
    setEditedProducts((prev) => ({
      ...prev,
      [product.id]: {
        ...prev[product.id],
        [field]: value,
      },
    }));

    if (field === "qty") {
      const key = `${purchaseId}-${product.id}`;
      const nextQty = Math.max(0, Number(value) || 0);
      const receivedHistory = Array.isArray(product.sales_product_received)
        ? product.sales_product_received
        : [];
      const historicalReceivedQty = receivedHistory.reduce(
        (sum, r) => sum + (Number(r.received_quantity) || 0),
        0
      );
      const receivedNow = Number(receivedNowMap[key] || 0);
      const baseAvailable = Math.max(nextQty - historicalReceivedQty, 0);
      setReceivedNowMap((prev) => ({
        ...prev,
        [`available_qty_${key}`]: Math.max(baseAvailable - receivedNow, 0),
      }));
    }
  };

  const getProductRowData = (product) => {
    const editedProduct = editedProducts[product.id] || {};
    return {
      productData: editedProduct.productData || product.productData || null,
      productId: editedProduct.product_id || product.product_id || product.productData?.id || null,
      variantData:
        editedProduct.variantData ||
        product.variantData ||
        product.productVariant ||
        null,
      variantId:
        editedProduct.variant_id ||
        editedProduct.variantData?.id ||
        product.variant_id ||
        product.product_variant_id ||
        product.productVariant?.id ||
        null,
      qty: editedProduct.qty ?? product.qty,
      unitPrice: editedProduct.unit_price ?? product.unit_price,
      tax: editedProduct.tax ?? product.tax,
    };
  };

  const getProductCalculations = (product) => {
    const row = getProductRowData(product);
    const qty = parseFloat(row.qty) || 0;
    const unitPrice = parseFloat(row.unitPrice) || 0;
    const tax = parseFloat(row.tax) || 0;
    const priceExclTax = qty * unitPrice;
    const lineItemTotal = priceExclTax * (1 + tax / 100);
    return {
      priceExclTax: priceExclTax.toFixed(2),
      lineItemTotal: lineItemTotal.toFixed(2),
    };
  };

  const updateEditedProductWithSelection = (
    product,
    selectedProductData,
    variantId = null,
    selectedVariantData = null
  ) => {
    setEditedProducts((prev) => ({
      ...prev,
      [product.id]: {
        ...(prev[product.id] || {}),
        qty: prev[product.id]?.qty ?? product.qty,
        unit_price:
          selectedProductData?.regular_selling_price ??
          prev[product.id]?.unit_price ??
          product.unit_price,
        tax: selectedProductData?.tax ?? prev[product.id]?.tax ?? product.tax,
        product_id: selectedProductData?.id ?? product.product_id,
        productData: selectedProductData || product.productData || null,
        variant_id: variantId,
        variantData: selectedVariantData,
      },
    }));
  };

  const openVariantSelector = (purchaseId, product, selectedProductData, resetVariant = false) => {
    const existingEdited = editedProducts[product.id] || {};
    const existingVariantId =
      existingEdited.variant_id ||
      existingEdited.variantData?.id ||
      product.variant_id ||
      product.product_variant_id ||
      product.productVariant?.id ||
      null;
    const existingVariantData =
      existingEdited.variantData || product.variantData || product.productVariant || null;

    setVariantModalBackup({
      purchaseId,
      rowId: product.id,
      data: {
        ...existingEdited,
        qty: existingEdited.qty ?? product.qty,
        unit_price: existingEdited.unit_price ?? product.unit_price,
        tax: existingEdited.tax ?? product.tax,
        product_id: existingEdited.product_id ?? product.product_id,
        productData: existingEdited.productData || product.productData || null,
        variant_id: existingVariantId,
        variantData: existingVariantData,
      },
    });

    updateEditedProductWithSelection(
      product,
      selectedProductData,
      resetVariant ? null : existingVariantId,
      resetVariant ? null : existingVariantData
    );
    if (resetVariant) {
      const rowKey = `${purchaseId}-${product.id}`;
      setReceivedNowMap((prev) => ({
        ...prev,
        [`store_${rowKey}`]: null,
      }));
      setError((prev) => {
        const next = { ...prev };
        delete next[`store_${rowKey}`];
        return next;
      });
    }
    setCurrentProductRow({ purchaseId, productId: product.id });
    setCurrentSelectedProductId(selectedProductData?.id || product.product_id);
    setShowVariantModal(true);
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
    setCurrentProductRow(null);
    setCurrentSelectedProductId(null);
  };

  const handleVariantSelect = (variant, productRowId) => {
    const purchaseId = currentProductRow?.purchaseId;
    const purchase = productCompare.find((p) => p.id === purchaseId);
    const baseProduct = purchase?.products?.find((p) => p.id === productRowId);
    if (baseProduct) {
      const currentEdited = editedProducts[productRowId] || {};
      const selectedProductData =
        currentEdited.productData || baseProduct.productData || null;
      updateEditedProductWithSelection(
        baseProduct,
        selectedProductData,
        variant?.id || null,
        variant || null
      );
      const selectedProductId = selectedProductData?.id || baseProduct.product_id;
      if (selectedProductId) {
        fetchProductStores(selectedProductId, variant?.id || null);
      }
      const rowKey = `${purchaseId}-${productRowId}`;
      setReceivedNowMap((prev) => ({
        ...prev,
        [`store_${rowKey}`]: null,
      }));
      setError((prev) => {
        const next = { ...prev };
        delete next[`store_${rowKey}`];
        return next;
      });
    }
    setVariantModalBackup(null);
    closeVariantModal();
  };

  const handleVariantModalClose = (productRowId) => {
    if (
      variantModalBackup &&
      variantModalBackup.rowId === productRowId &&
      variantModalBackup.data
    ) {
      setEditedProducts((prev) => ({
        ...prev,
        [productRowId]: variantModalBackup.data,
      }));
    }
    setVariantModalBackup(null);
    closeVariantModal();
  };

  const handleContinueWithoutVariant = () => {
    setVariantModalBackup(null);
    closeVariantModal();
  };

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
    const purchase = productCompare.find((p) => p.id === purchaseId);
    const product = purchase?.products?.find((p) => p.id === productId);
    const editedQty = editedProducts[productId]?.qty;
    const effectiveQty = Number(editedQty ?? product?.qty ?? 0);
    const historicalReceivedQty = (Array.isArray(product?.sales_product_received)
      ? product.sales_product_received
      : []
    ).reduce((sum, r) => sum + (Number(r.received_quantity) || 0), 0);
    const baseAvailable = Math.max(effectiveQty - historicalReceivedQty, 0);

    setReceivedNowMap((prev) => ({
      ...prev,
      [key]: num,
      [`available_qty_${key}`]: Math.max(baseAvailable - num, 0),
    }));
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
  const handleReceiveProduct = async (salesid, spid, sid) => {
    const purchase = productCompare.find((p) => p.id === salesid);
    const product = purchase?.products.find((p) => p.id === spid);
    if (!purchase || !product) return;

    const row = getProductRowData(product);
    const quantity = Number(row.qty || product.qty || 1);
    const key = `${salesid}-${spid}`;
    const receivedNow = receivedNowMap[key] ?? Number(product.received_now) ?? 0;
    const currentStore = receivedNowMap[`store_${salesid}-${spid}`] ?? null;
    const currentStoreId = currentStore?.value ?? currentStore?.warehouse?.id ?? currentStore?.id;
    const currentProductId = row.productId ?? product.product_id ?? product.productData?.id ?? null;
    const currentOrderQuantity = Number(row.qty ?? product.qty ?? 0);
    const currentUnitPrice = row.unitPrice ?? product.unit_price ?? 0;
    const currentVariantId =
      row.variantId ??
      product.variant_id ??
      product.product_variant_id ??
      product.productVariant?.id ??
      null;

    // console.log("currentStoreId", currentStoreId);

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
      const success = await Promise.resolve(
        onProductReceive(
        salesid,
        spid,
        sid,
        receivedNow,
        currentStoreId,
        currentVariantId,
        currentProductId,
        currentOrderQuantity,
        currentUnitPrice
        )
      );

      if (!success) {
        return;
      }

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

  const grandTotal = productCompare.reduce((acc, purchase) => {
    const productsTotal = (purchase.products || []).reduce((sum, product) => {
      const calculations = getProductCalculations(product);
      return sum + (parseFloat(calculations.lineItemTotal) || 0);
    }, 0);
    return acc + productsTotal;
  }, 0);

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
        <Modal.Title>Sales Order Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-0">
        <div className="mb-4">
          <h6 className="mb-3">Basic Details</h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th width="20%">Customer Name</th>
                  <th width="20%">Reference No.</th>
                  <th width="20%">Store Name</th>
                  <th width="20%">Payment Terms (days)</th>
                  <th width="20%">Expected Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {productCompare.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{purchase.customer?.name || "N/A"}</td>
                    <td className="k_table_link">{purchase.reference_number || "N/A"}</td>
                    <td>{purchase.warehouse?.name || "N/A"}</td>
                    <td>{purchase.payment_terms || "N/A"}</td>
                    <td>
                      {purchase.expected_delivery_date
                        ? moment(purchase.expected_delivery_date).format("DD/MM/YYYY")
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="mb-3">Product Details</h6>
          <div className="table-responsive">
            <table className="table table-bordered" style={{ minWidth: "1900px" }}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Product Code</th>
                  <th>Quantity</th>
                  <th>Weight Per Unit</th>
                  <th>Total Weight</th>
                  <th>Unit of Measure</th>
                  <th>Unit Price</th>
                  <th>Tax (%)</th>
                  <th>Price (Excl tax)</th>
                  <th>Total</th>
                  <th>Store</th>
                  <th>Balance Quantity</th>
                  <th>Dispatch Quantity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {productCompare.flatMap((purchase) =>
                  purchase.products.map((product) => {
                    const row = getProductRowData(product);
                    const calculations = getProductCalculations(product);
                    const rowKey = `${purchase.id}-${product.id}`;
   
                    const receivedNow = receivedNowMap[rowKey] ?? Number(product.received_now) ?? 0;

                    const receivedQty = (Array.isArray(product.sales_product_received)
                      ? product.sales_product_received
                      : []
                    ).reduce((sum, r) => sum + (Number(r.received_quantity) || 0), 0);
                    const fallbackAvailableQty = Math.max(
                      (Number(row.qty) || Number(product.qty) || 0) - receivedQty,
                      0
                    );
                    const mappedAvailableQty = Number(
                      receivedNowMap[`available_qty_${rowKey}`]
                    );
                    const availableQty = Number.isFinite(mappedAvailableQty)
                      ? mappedAvailableQty
                      : fallbackAvailableQty;
                    const quantity = Number(row.qty || product.qty || 0);
                    const hasDispatchHistory =
                      Array.isArray(product.sales_product_received) &&
                      product.sales_product_received.length > 0;
                    const isFullyDispatched =
                      !!receivedNowMap[`is_dispatched_fully_${rowKey}`] ||
                      (quantity > 0 && receivedQty >= quantity);
                    const isPartiallyDispatched =
                      !isFullyDispatched &&
                      ((
                        !!receivedNowMap[`is_dispatched_partially_${rowKey}`] ||
                        (hasDispatchHistory && receivedQty > 0 && receivedQty < quantity)
                      ));
                    const disableEditableFields =
                      isFullyDispatched || isPartiallyDispatched;

                    return (
                      <tr key={rowKey}>
                        <td style={{ minWidth: "330px" }}>
                          <div style={{ minWidth: "300px" }} className="d-flex align-items-start gap-2">
                            <div style={{ flex: 1 }}>
                              <ProductSelect
                                value={row.productId}
                                selectedProductData={row.productData}
                                isDisabled={disableEditableFields}
                                onChange={(selectedOption) => {
                                  if (selectedOption?.productData) {
                                    openVariantSelector(
                                      purchase.id,
                                      product,
                                      selectedOption.productData,
                                      true
                                    );
                                  }
                                }}
                                queryParams={productSelectQueryParams}
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    minHeight: "34px",
                                    fontSize: "14px",
                                  }),
                                }}
                              />
                              {row.variantData && (
                                <div className="mt-1">
                                  <small className="text-muted">
                                    <i className="fas fa-tag me-1"></i>
                                    Variant: {row.variantData.masterUOM?.name || row.variantData.master_uom?.name || "N/A"}
                                    {(row.variantData.masterUOM?.label || row.variantData.master_uom?.label) && (
                                      <span className="ms-1">
                                        ({row.variantData.masterUOM?.label || row.variantData.master_uom?.label})
                                      </span>
                                    )}
                                    {row.variantData.weight_per_unit && (
                                      <span className="ms-2">• Weight: {row.variantData.weight_per_unit}</span>
                                    )}
                                  </small>
                                </div>
                              )}
                            </div>
                            {row.productId && row.productData && (
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
                                      <ProductDetailsContent productData={row.productData} />
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
                          </div>
                        </td>
                        <td>{row.productData?.product_code || "N/A"}</td>
                        <td style={{ minWidth: "120px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={row.qty}
                            disabled={disableEditableFields}
                            onChange={(e) =>
                              handleProductFieldChange(
                                purchase.id,
                                product,
                                "qty",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td style={{ minWidth: "130px" }}>
                          <div className="d-flex align-items-center gap-2">
                            <span>
                              {row.variantData
                                ? `${row.variantData.weight_per_unit || "N/A"} ${row.variantData.masterUOM?.label || row.variantData.master_uom?.label || ""}`.trim()
                                : "N/A"}
                            </span>
                            {row.productId && !disableEditableFields && (
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0"
                                onClick={() => openVariantSelector(purchase.id, product, row.productData, false)}
                                title="Change variant"
                              >
                                <i className="fas fa-edit text-primary"></i>
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          {row.variantData
                            ? calculateTotalWeight(
                                row.qty,
                                row.variantData?.weight_per_unit,
                                row.variantData?.masterUOM?.label ||
                                  row.variantData?.master_uom?.label
                              ).display
                            : "N/A"}
                        </td>
                        <td>
                          {row.variantData?.masterUOM?.label ||
                            row.variantData?.master_uom?.label ||
                            row.variantData?.masterUOM?.name ||
                            row.variantData?.master_uom?.name ||
                            row.productData?.masterUOM?.label ||
                            row.productData?.masterUOM?.name ||
                            "N/A"}
                        </td>
                        <td style={{ minWidth: "120px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={row.unitPrice}
                            disabled={disableEditableFields}
                            onChange={(e) =>
                              handleProductFieldChange(
                                purchase.id,
                                product,
                                "unit_price",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>{row.tax}%</td>
                        <td>
                          {currencySymbol} {calculations.priceExclTax}
                        </td>
                        <td style={{ minWidth: "120px" }}>
                          {currencySymbol} {calculations.lineItemTotal}
                        </td>
                        <td style={{ overflow: "visible", position: "relative", minWidth: "250px" }}>
                          <div style={{ position: "relative", zIndex: 1 }}>
                            {(() => {
                              const productId = row.productId;
                              const variantId =
                                row.variantId ||
                                row.variantData?.id ||
                                null;
                              const storeKey = productId
                                ? getStoreFetchKey(productId, variantId)
                                : null;
                              const baseStoreOptions = storeKey
                                ? productStores[storeKey] || []
                                : [];
                              let storeOptions = [...baseStoreOptions];
                              let currentStore = null;
                              const storeStateKey = `store_${rowKey}`;
                              const hasExplicitStoreSelection = Object.prototype.hasOwnProperty.call(
                                receivedNowMap,
                                storeStateKey
                              );
                              const currentSelectedStore = hasExplicitStoreSelection
                                ? receivedNowMap[storeStateKey]
                                : product?.warehouse ?? purchase?.warehouse ?? null;
                              const selectedId =
                                currentSelectedStore?.value ??
                                currentSelectedStore?.id ??
                                currentSelectedStore?.warehouse?.id;

                              if (currentSelectedStore && selectedId != null) {
                                currentStore = baseStoreOptions.find(
                                  (opt) => opt.value === selectedId
                                );
                                if (!currentStore) {
                                  const label =
                                    currentSelectedStore.label ??
                                    currentSelectedStore.warehouse?.name ??
                                    currentSelectedStore.name;
                                  if (label != null) {
                                    const syntheticOption = {
                                      value: selectedId,
                                      label,
                                      warehouse:
                                        currentSelectedStore.warehouse ??
                                        currentSelectedStore,
                                      available_stock:
                                        currentSelectedStore.available_stock ?? null,
                                    };
                                    storeOptions = [syntheticOption, ...baseStoreOptions];
                                    currentStore = syntheticOption;
                                  }
                                }
                              }

                              const isLoading = storeKey
                                ? loadingStores[storeKey]
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
                                  isDisabled={disableEditableFields}
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      minHeight: "32px",
                                      fontSize: "14px",
                                      cursor: "pointer",
                                    }),
                                    menu: (base) => ({ ...base, zIndex: 10000 }),
                                    menuPortal: (base) => ({ ...base, zIndex: 10000 }),
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
                                    typeof document !== "undefined" ? document.body : null
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
                        <td style={{ minWidth: "120px" }}>
                          <input
                            type="number"
                            name="available_qty"
                            value={availableQty}
                            readOnly
                            className="form-control bg-light form-control-sm"
                          />
                        </td>
                        <td style={{ minWidth: "130px" }}>
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
                            className={`form-control form-control-sm ${error?.[`received_${rowKey}`] ? "is-invalid" : ""}`}
                          />
                          {error?.[`received_${rowKey}`] && (
                            <div className="invalid-feedback d-block small">
                              {error[`received_${rowKey}`]}
                            </div>
                          )}
                        </td>
                        <td>
                          {isFullyDispatched ? (
                            <span className="badge bg-success text-white">Fully Dispatched</span>
                          ) : isPartiallyDispatched ? (
                            <span className="badge bg-warning text-dark">Partially Dispatched</span>
                          ) : (
                            <span className="badge bg-info text-white">Pending</span>
                          )}
                        </td>
                        <td>
                          {!isFullyDispatched && (
                            <div className="d-flex gap-2">
                              <Tooltip title="Dispatch Product">
                                <button
                                  className="me-1 icon-btn"
                                  onClick={() => handleReceiveProduct(purchase.id, product?.id, 10)}
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
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
                <tr>
                  <td colSpan={15} align="right">
                    <h6 className="mb-0 text-muted">
                      Grand Total:{" "}
                      <span className="text-dark f-s-20">
                        {currencySymbol} {grandTotal.toFixed(2)}
                      </span>
                    </h6>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
                const productVariant = product.productVariant ? `${product.productVariant.weight_per_unit} ${product.productVariant.masterUOM.label}` : "";
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
                            <th>Variant</th>
                            <th>Dispatched Qty</th>
                            <th>Dispatched by</th>
                            <th>Dispatch Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivedList.map((rec, idx) => (
                            <tr key={rec.id}>
                              <td>{idx + 1}</td>
                              <td>{productVariant}</td>
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

      <ProductVariantSelectionModal
        show={showVariantModal}
        onHide={closeVariantModal}
        productId={currentSelectedProductId}
        productIndex={currentProductRow?.productId}
        currentVariantId={
          currentProductRow?.productId != null
            ? (
                editedProducts[currentProductRow.productId]?.variant_id ||
                editedProducts[currentProductRow.productId]?.variantData?.id ||
                productCompare
                  ?.find((p) => p.id === currentProductRow.purchaseId)
                  ?.products?.find((p) => p.id === currentProductRow.productId)
                  ?.variant_id ||
                productCompare
                  ?.find((p) => p.id === currentProductRow.purchaseId)
                  ?.products?.find((p) => p.id === currentProductRow.productId)
                  ?.product_variant_id ||
                productCompare
                  ?.find((p) => p.id === currentProductRow.purchaseId)
                  ?.products?.find((p) => p.id === currentProductRow.productId)
                  ?.productVariant?.id ||
                null
              )
            : null
        }
        onVariantSelect={handleVariantSelect}
        onClose={handleVariantModalClose}
        currencySymbol={currencySymbol}
        allowContinueWithoutVariant={true}
        onContinueWithoutVariant={handleContinueWithoutVariant}
      />
    </Modal>
  );
};

export default SaleOrderDetailsModal;
