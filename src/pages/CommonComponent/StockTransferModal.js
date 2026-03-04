import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { Table, Input, Button, Form } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import moment from "moment";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { PrivateAxios } from "../../environment/AxiosInstance";

const initialTransferItem = {
  key: 1,
  itemId: null,
  itemName: "",
  defaultPrice: 0,
  currentQuantity: "",
  finalQuantity: "",
  changeQuantity: 1,
  comment: "",
  itemID: "",
  product: null,
  availableQuantity: "",
  transferQuantity: "",
  itemUnit: "",
  disableTransferQuantity: true,
  batchesLoading: false,
  availableBatches: [],
  batchQuantities: {},
};

/**
 * Self-contained Stock Transfer modal: Store-to-Store, Add to CWHFG, PO Return, Sales Order Return, Scrap Items.
 * @param {boolean} show - Whether the modal is visible
 * @param {() => void} onHide - Close handler
 * @param {string} transferType - One of 'stock_transfer' | 'add_to_stock' | 'purchase_order_return' | 'sales_order_return' | 'scrap_items'
 * @param {() => void} [onSuccess] - Called after successful submit (e.g. parent refetch)
 */
function StockTransferModal({ show, onHide, transferType, onSuccess }) {
  const [fromStore, setFromStore] = useState(null);
  const [toStore, setToStore] = useState(null);
  const [transferItems, setTransferItems] = useState([{ ...initialTransferItem, key: Date.now() }]);
  const [rowErrors, setRowErrors] = useState([]);
  const [comment, setComment] = useState("");
  const [poReferenceNumber, setPoReferenceNumber] = useState("");
  const [poSearchLoading, setPoSearchLoading] = useState(false);
  const [salesOrderReferenceNumber, setSalesOrderReferenceNumber] = useState("");
  const [salesOrderSearchLoading, setSalesOrderSearchLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const fgStore = useMemo(
    () => stores.find((s) => Number(s.is_fg_store) === 1 || String(s.is_fg_store) === "1"),
    [stores]
  );

  const handleClose = () => {
    setFromStore(null);
    setToStore(null);
    setTransferItems([{ ...initialTransferItem, key: Date.now() }]);
    setRowErrors([]);
    setComment("");
    setPoReferenceNumber("");
    setSalesOrderReferenceNumber("");
    onHide();
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("inventory-modal-open");
      return () => {
        document.body.style.overflow = "";
        document.body.classList.remove("inventory-modal-open");
      };
    }
  }, [show]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const result = await PrivateAxios.get("/warehouse");
        setStores(result.data?.data ?? []);
      } catch (e) {
        setStores([]);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    if (show && transferType === "add_to_stock" && fgStore) {
      setToStore(fgStore);
    }
  }, [show, transferType, fgStore]);

  const FetchProduct = (fromStoreId = null, page = 1, limit = 25) => {
    if (!fromStoreId) {
      setProducts([]);
      return;
    }
    const params = { page, limit };
    const queryParams = new URLSearchParams(params).toString();
    PrivateAxios.get(`/product/storewise-all-products/${fromStoreId}?${queryParams}`)
      .then((response) => setProducts(response.data?.data?.rows ?? []))
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    const storeId =
      transferType === "add_to_stock"
        ? toStore?.id ?? toStore?.value ?? toStore
        : fromStore?.id ?? fromStore?.value ?? fromStore;
    if (storeId) FetchProduct(storeId);
    else setProducts([]);
  }, [fromStore, toStore, transferType]);

  useEffect(() => {
    if (transferType === "stock_transfer" || transferType === "scrap_items") {
      setTransferItems([{ ...initialTransferItem, key: Date.now() }]);
      setRowErrors([]);
    }
  }, [fromStore?.id, fromStore?.value]);

  const handleAddItem = () => {
    const newKey = Date.now();
    setTransferItems((prev) => [
      ...prev,
      {
        ...initialTransferItem,
        key: newKey,
        transferQuantity: 0,
      },
    ]);
    setRowErrors((prev) => [...prev, false]);
  };

  const handleSearchPurchaseOrder = async () => {
    const ref = String(poReferenceNumber || "").trim();
    if (!ref) {
      ErrorMessage("Please enter a Purchase Order reference number.");
      return;
    }
    setPoSearchLoading(true);
    try {
      const res = await PrivateAxios.get(
        `/purchase/fetch-details?reference_number=${encodeURIComponent(ref)}`
      );
      const data = res.data?.data;
      const receivedProducts = Array.isArray(data?.receivedProducts) ? data.receivedProducts : [];
      const withQty = receivedProducts.filter((p) => Number(p?.available_quantity) > 0);
      if (withQty.length === 0) {
        ErrorMessage(
          receivedProducts.length === 0
            ? "No received products found for this purchase order."
            : "No products with available quantity found for this purchase order."
        );
        setPoSearchLoading(false);
        return;
      }
      const baseKey = Date.now();
      const mappedItems = withQty.map((rp, i) => {
        const product = rp.product || {};
        const isBatchApplicable = Number(product?.is_batch_applicable) === 1;
        const batches = Array.isArray(rp.batches) ? rp.batches : [];
        const availableBatches = batches.map((b) => ({
          id: b.id,
          batch_no: b.batch_no,
          expiry_date: b.expiry_date,
          available_quantity: Number(b.available_quantity) ?? 0,
        }));
        const batchQuantities = batches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {});
        const availableQty = Number(rp.available_quantity) || 0;
        return {
          key: baseKey + i,
          itemId: product.id,
          itemName: product.product_name || "",
          product: { ...product, is_batch_applicable: product.is_batch_applicable },
          availableQuantity: availableQty,
          transferQuantity: isBatchApplicable ? "0" : "",
          batchesLoading: false,
          availableBatches,
          batchQuantities,
          disableTransferQuantity: isBatchApplicable || availableQty <= 0,
          itemID: product.id,
          defaultPrice: Number(rp.unit_price) || 0,
          itemUnit: "",
          currentQuantity: String(availableQty),
          finalQuantity: "",
          changeQuantity: 1,
          comment: "",
          storeId: null,
        };
      });
      setTransferItems(mappedItems);
      setRowErrors(mappedItems.map(() => false));
      SuccessMessage(`${mappedItems.length} product(s) loaded from purchase order.`);
    } catch (err) {
      ErrorMessage(err?.response?.data?.message || "Failed to fetch purchase order details.");
    } finally {
      setPoSearchLoading(false);
    }
  };

  const handleSearchSalesOrder = async () => {
    const ref = String(salesOrderReferenceNumber || "").trim();
    if (!ref) {
      ErrorMessage("Please enter a Sales Order reference number.");
      return;
    }
    setSalesOrderSearchLoading(true);
    try {
      const res = await PrivateAxios.get(
        `/sales/fetch-details?reference_number=${encodeURIComponent(ref)}`
      );
      const data = res.data?.data;
      const productsList = Array.isArray(data?.products) ? data.products : [];
      if (productsList.length === 0) {
        ErrorMessage("No products found for this sales order.");
        setSalesOrderSearchLoading(false);
        return;
      }
      const baseKey = Date.now();
      const mappedItems = productsList.map((sp, i) => {
        const productData = sp.productData || {};
        const productId = productData.id ?? sp.id;
        const batches = Array.isArray(productData.batches) ? productData.batches : [];
        const isBatchApplicable = batches.length > 0;
        const availableBatches = batches.map((b) => ({
          id: b.id,
          batch_no: b.batch_no,
          expiry_date: b.expiry_date,
          available_quantity: Number(b.available_quantity) ?? Number(b.quantity) ?? 0,
        }));
        const batchQuantities = batches.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {});
        const qty = Number(sp.qty) || 0;
        const product = {
          id: productId,
          product_name: productData.product_name ?? sp.description,
          product_code: productData.product_code,
          is_batch_applicable: isBatchApplicable ? 1 : 0,
          warehouse_id: sp.warehouse_id ?? null,
        };
        return {
          key: baseKey + i,
          itemId: productId,
          itemName: product.product_name || sp.description || "",
          product,
          availableQuantity: qty,
          transferQuantity: isBatchApplicable ? "0" : "",
          batchesLoading: false,
          availableBatches,
          batchQuantities,
          disableTransferQuantity: isBatchApplicable || qty <= 0,
          itemID: productId,
          defaultPrice: Number(sp.unit_price) || 0,
          itemUnit: "",
          currentQuantity: String(qty),
          finalQuantity: "",
          changeQuantity: 1,
          comment: "",
          storeId: sp.warehouse_id ?? null,
        };
      });
      setTransferItems(mappedItems);
      setRowErrors(mappedItems.map(() => false));
      SuccessMessage(`${mappedItems.length} product(s) loaded from sales order.`);
    } catch (err) {
      ErrorMessage(err?.response?.data?.message || "Failed to fetch sales order details.");
    } finally {
      setSalesOrderSearchLoading(false);
    }
  };

  const fetchAvailableBatchesForItem = async (productId, itemKey) => {
    if (!productId || !itemKey) return;
    setTransferItems((prev) =>
      prev.map((it) =>
        it.key === itemKey
          ? {
              ...it,
              batchesLoading: true,
              availableBatches: [],
              batchQuantities: {},
              transferQuantity: "0",
              disableTransferQuantity: true,
            }
          : it
      )
    );
    try {
      const res = await PrivateAxios.get(`/product/product-available-batches/${productId}`);
      const batches = res.data?.data?.batches || [];
      const initialQtyMap = {};
      (Array.isArray(batches) ? batches : []).forEach((b) => {
        if (b?.id != null) initialQtyMap[b.id] = 0;
      });
      setTransferItems((prev) =>
        prev.map((it) =>
          it.key === itemKey
            ? {
                ...it,
                batchesLoading: false,
                availableBatches: Array.isArray(batches) ? batches : [],
                batchQuantities: initialQtyMap,
                transferQuantity: "0",
                disableTransferQuantity: true,
              }
            : it
        )
      );
    } catch (error) {
      setTransferItems((prev) =>
        prev.map((it) =>
          it.key === itemKey
            ? {
                ...it,
                batchesLoading: false,
                availableBatches: [],
                batchQuantities: {},
                transferQuantity: "0",
                disableTransferQuantity: true,
              }
            : it
        )
      );
    }
  };

  const handleProductChangeUpdate = (selectedProductId, key) => {
    if (selectedProductId == null) return;
    const storeId =
      transferType === "add_to_stock"
        ? toStore?.id ?? toStore?.value
        : fromStore?.id ?? fromStore?.value;
    let batchFetchProductId = null;
    const updatedItems = transferItems.map((item) => {
      if (item.key !== key) return item;
      const selectedProduct = products.find(
        (ps) => parseInt(ps.product?.id) === parseInt(selectedProductId.value)
      );

      if (!selectedProduct || storeId == null) return item;
      let availableQty = Number(selectedProduct.quantity);
      if (
        !Number.isFinite(availableQty) &&
        Array.isArray(selectedProduct.TrackProductStock)
      ) {
        const inQty = selectedProduct.TrackProductStock
          .filter(
            (s) =>
              Number(s.store_id) === Number(storeId) &&
              String(s.status_in_out) === "1"
          )
          .reduce((sum, s) => sum + (Number(s.quantity_changed) || 0), 0);
        const outQty = selectedProduct.TrackProductStock
          .filter(
            (s) =>
              Number(s.store_id) === Number(storeId) &&
              String(s.status_in_out) === "0"
          )
          .reduce((sum, s) => sum + (Number(s.quantity_changed) || 0), 0);
        availableQty = Math.max(0, inQty - outQty);
      }
      availableQty = Number.isFinite(availableQty) ? availableQty : 0;
      const product = selectedProduct.product || selectedProduct;
      const itemUnit =
        selectedProduct.Masteruom?.unit_name ||
        selectedProduct.product?.Masteruom?.unit_name ||
        "";
      const isBatchApplicable = Number(product?.is_batch_applicable) === 1;
      if (transferType === "scrap_items" && isBatchApplicable) {
        batchFetchProductId = product.id;
      }
      return {
        ...item,
        itemId: product.id,
        itemName: product.product_name || "",
        product,
        availableQuantity: availableQty,
        transferQuantity:
          isBatchApplicable && transferType === "scrap_items" ? "0" : "",
        currentQuantity: String(availableQty),
        finalQuantity: "",
        itemUnit,
        defaultPrice: selectedProduct.product_price ?? 0,
        storeId,
        itemID: product.id,
        disableTransferQuantity:
          (isBatchApplicable && transferType === "scrap_items") || availableQty <= 0,
        batchesLoading: false,
        availableBatches: [],
        batchQuantities: {},
      };
    });
    setTransferItems(updatedItems);
    if (batchFetchProductId != null) {
      fetchAvailableBatchesForItem(batchFetchProductId, key);
    }
    const keyIndex = transferItems.findIndex((i) => i.key === key);
    if (keyIndex >= 0) {
      setRowErrors((prev) => {
        const next = [...prev];
        next[keyIndex] = false;
        return next;
      });
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedItems = [...transferItems];
    const itemToUpdate = updatedItems[index];
    const updatedRowErrors = [...rowErrors];
    while (updatedRowErrors.length <= index) updatedRowErrors.push(false);

    if (field === "transferQuantity" && transferType === "stock_transfer") {
      const numValue = value === "" ? "" : Number(value);
      itemToUpdate.transferQuantity = value;
      const transferQty =
        typeof numValue === "number" && !Number.isNaN(numValue) ? numValue : NaN;
      const availableQty = Number(itemToUpdate.availableQuantity) || 0;
      if (value === "" || value === null) {
        updatedRowErrors[index] = false;
      } else if (Number.isNaN(transferQty) || transferQty <= 0) {
        updatedRowErrors[index] = "positive";
      } else if (transferQty > availableQty) {
        updatedRowErrors[index] = "exceed";
      } else {
        updatedRowErrors[index] = false;
      }
    } else {
      itemToUpdate[field] = value;
      if (field === "changeQuantity") {
        const currentQuantity = parseFloat(itemToUpdate.currentQuantity) || 0;
        const changeQuantity = parseFloat(value) || 0;
        itemToUpdate.finalQuantity = currentQuantity + changeQuantity;
      }
    }
    setTransferItems(updatedItems);
    setRowErrors(updatedRowErrors);
  };

  const handleBatchQtyChange = (itemKey, batchId, value, maxQty) => {
    setTransferItems((prev) =>
      prev.map((it) => {
        if (it.key !== itemKey) return it;
        const max = Number(maxQty) || 0;
        const n = Math.max(0, Number(value) || 0);
        const clamped = Math.min(n, max);
        const nextMap = { ...(it.batchQuantities || {}) };
        nextMap[batchId] = clamped;
        const sum = Object.values(nextMap).reduce(
          (s, q) => s + (Number(q) || 0),
          0
        );
        return {
          ...it,
          batchQuantities: nextMap,
          transferQuantity: String(sum),
          disableTransferQuantity: true,
        };
      })
    );
  };

  const handleRemoveItem = (index) => {
    const updatedItems = transferItems.filter((_, i) => i !== index);
    setRowErrors((prev) => prev.filter((_, i) => i !== index));
    setTransferItems(
      updatedItems.length
        ? updatedItems
        : [{ ...initialTransferItem, key: Date.now() }]
    );
  };

  const handleSubmitStockUpdate = async (e) => {
    e.preventDefault();
    const isAddToStock = transferType === "add_to_stock";
    const isScrapItems = transferType === "scrap_items";
    const isPurchaseOrderReturn = transferType === "purchase_order_return";
    const isSalesOrderReturn = transferType === "sales_order_return";

    if (
      !isAddToStock &&
      !isPurchaseOrderReturn &&
      !isSalesOrderReturn &&
      !fromStore?.id &&
      fromStore?.value == null
    ) {
      ErrorMessage("Please select From Store.");
      return;
    }
    if (
      !isScrapItems &&
      !isPurchaseOrderReturn &&
      !isSalesOrderReturn &&
      !toStore?.id &&
      toStore?.value == null
    ) {
      ErrorMessage(
        isAddToStock ? "Finished goods store is not configured." : "Please select To Store."
      );
      return;
    }

    const fromStoreId = fromStore?.id ?? fromStore?.value ?? null;
    const toStoreId = toStore?.id ?? toStore?.value ?? null;

    if (
      !isAddToStock &&
      !isPurchaseOrderReturn &&
      !isSalesOrderReturn &&
      fromStoreId === toStoreId
    ) {
      ErrorMessage("From Store and To Store must be different.");
      return;
    }

    const validItems = transferItems.filter(
      (item) => item.itemID != null && item.itemID !== "" && item.product != null
    );
    if (validItems.length === 0) {
      ErrorMessage("Please select at least one product.");
      return;
    }

    if (transferType === "stock_transfer" || transferType === "sales_order_return") {
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        const transferQty = Number(item.transferQuantity) || 0;
        const availableQty = Number(item.availableQuantity) || 0;
        if (
          (!Number.isFinite(transferQty) || transferQty <= 0) &&
          transferType === "stock_transfer"
        ) {
          ErrorMessage(
            `Enter a positive transfer quantity for ${item.itemName || "item"}.`
          );
          return;
        }
        if (transferQty > availableQty) {
          ErrorMessage(
            `Transfer quantity cannot exceed available stock for ${item.itemName || "item"}.`
          );
          return;
        }
      }
    } else if (transferType === "add_to_stock") {
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        const transferQty = Number(item.transferQuantity);
        if (!Number.isFinite(transferQty) || transferQty <= 0) {
          ErrorMessage(
            `Enter a positive transfer quantity for ${item.itemName || "item"}.`
          );
          return;
        }
      }
    } else if (transferType === "scrap_items") {
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        const isBatchApplicable = Number(item?.product?.is_batch_applicable) === 1;
        if (isBatchApplicable) {
          const batches = Array.isArray(item.availableBatches) ? item.availableBatches : [];
          if (batches.length === 0) {
            ErrorMessage(`No batches available for ${item.itemName || "item"}.`);
            return;
          }
          const qtyMap = item.batchQuantities || {};
          const entries = Object.entries(qtyMap).filter(([, q]) => Number(q) > 0);
          if (entries.length === 0) {
            ErrorMessage(`Enter batch quantity for ${item.itemName || "item"}.`);
            return;
          }
          for (const [batchId, qty] of entries) {
            const batch = batches.find((b) => String(b.id) === String(batchId));
            const max = Number(batch?.available_quantity) || 0;
            const n = Number(qty) || 0;
            if (n <= 0) {
              ErrorMessage(
                `Enter a positive batch quantity for ${item.itemName || "item"}.`
              );
              return;
            }
            if (n > max) {
              ErrorMessage(
                `Batch quantity cannot exceed available quantity for batch ${batch?.batch_no || batchId}.`
              );
              return;
            }
          }
        } else {
          const transferQty = Number(item.transferQuantity);
          const availableQty = Number(item.availableQuantity) || 0;
          if (!Number.isFinite(transferQty) || transferQty <= 0) {
            ErrorMessage(
              `Enter a positive transfer quantity for ${item.itemName || "item"}.`
            );
            return;
          }
          if (transferQty > availableQty) {
            ErrorMessage(
              `Transfer quantity cannot exceed available stock for ${item.itemName || "item"}.`
            );
            return;
          }
        }
      }
    }

    const stockTransferPayload = {
      from_store: isAddToStock ? null : fromStoreId,
      to_store: toStoreId ? (isScrapItems ? null : toStoreId) : null,
      purchase_reference_number: isPurchaseOrderReturn ? poReferenceNumber : null,
      sales_order_reference_number: isSalesOrderReturn ? salesOrderReferenceNumber : null,
      comment,
      transfer_type: transferType,
      products: validItems.map((item) => ({
        id: item.itemID ?? item.product?.id,
        warehouse_id: item?.product?.warehouse_id ?? null,
        transferred_quantity: Number(item.transferQuantity) || 0,
        is_batch_applicable: Number(item?.product?.is_batch_applicable) === 1,
        ...(["scrap_items", "purchase_order_return", "sales_order_return"].includes(
          transferType
        ) &&
          Number(item?.product?.is_batch_applicable) === 1 && {
            batches: (() => {
              const batches = Array.isArray(item.availableBatches)
                ? item.availableBatches
                : [];
              return Object.entries(item.batchQuantities || {})
                .filter(([, q]) => Number(q) > 0)
                .map(([batchId, q]) => {
                  const batch = batches.find(
                    (b) => String(b.id) === String(batchId)
                  );
                  return {
                    id: Number(batchId),
                    available_quantity: Number(batch?.available_quantity) ?? 0,
                    quantity: Number(q) || 0,
                  };
                });
            })(),
          }),
      })),
    };

    try {
      const response = await PrivateAxios.post(
        "/product/update-stocktransfer",
        stockTransferPayload
      );
      if (response.status === 200) {
        SuccessMessage(response.data.message);
        handleClose();
        typeof onSuccess === "function" && onSuccess();
      } else {
        ErrorMessage("Error !! Please check again.");
      }
    } catch (error) {
      ErrorMessage("Error !! Please check again.");
    }
  };

  const renderBatchSectionBelow = (record) => {
    const isBatchRow =
      (transferType === "scrap_items" ||
        transferType === "purchase_order_return" ||
        transferType === "sales_order_return") &&
      Number(record?.product?.is_batch_applicable) === 1;
    if (!isBatchRow) return null;
    if (record.batchesLoading) {
      return (
        <div className="p-3 text-muted small">
          Loading batches…
        </div>
      );
    }
    const batches = Array.isArray(record.availableBatches) ? record.availableBatches : [];
    if (!batches.length) {
      return (
        <div className="p-3 text-muted small">
          No batches available for this product.
        </div>
      );
    }
    return (
      <div className="p-3 bg-light border-top">
        <div className="fw-semibold mb-2 small text-muted">Manage batches</div>
        <div className="table-responsive">
          <table
            className="table table-bordered table-sm mb-0"
            style={{ maxWidth: 520 }}
          >
            <thead className="table-light">
              <tr>
                <th style={{ width: 140 }}>Batch No.</th>
                <th style={{ width: 120 }}>Expiry Date</th>
                <th style={{ width: 120 }}>Available Qty</th>
                <th style={{ width: 120 }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const max = Number(b.available_quantity) || 0;
                const val = Number(record.batchQuantities?.[b.id]) || 0;
                return (
                  <tr key={b.id}>
                    <td>{b.batch_no}</td>
                    <td>
                      {b.expiry_date
                        ? moment(b.expiry_date).format("DD/MM/YYYY")
                        : "—"}
                    </td>
                    <td>
                      <Input
                        value={max}
                        disabled
                        size="small"
                        className="form-control"
                        style={{ width: 90 }}
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        min={0}
                        max={max}
                        value={val}
                        size="small"
                        className="form-control"
                        style={{ width: 90 }}
                        onChange={(e) =>
                          handleBatchQtyChange(
                            record.key,
                            b.id,
                            e.target.value,
                            max
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="small text-muted mt-2">
          Enter batch quantities (each ≤ available). Transfer qty is auto-calculated above.
        </div>
      </div>
    );
  };

  const columnspop = [
      {
        title: "No.",
        dataIndex: "no",
        key: "no",
        render: (_, __, index) => index + 1,
      },
      {
        title: "Item ID",
        dataIndex: "itemId",
        key: "itemId",
        width: 300,
        render: (_, record) => (
          <div className="custom-select-wrap">
            <DropDownList
              className="custom_keno_dropdown"
              value={
                record.itemId && record.product
                  ? {
                      value: record.itemId,
                      label: `${record.product.product_name || ""} (${record.product.product_code || ""})`,
                    }
                  : null
              }
              onChange={(e) => handleProductChangeUpdate(e.value, record.key)}
              data={products.map((stockEntry) => ({
                value: stockEntry.product.id,
                label: `${stockEntry.product.product_name} (${stockEntry.product.product_code})`,
              }))}
              textField="label"
              valueField="value"
            />
          </div>
        ),
      },
      {
        title: "Item Name",
        dataIndex: "itemName",
        key: "itemName",
        width: 280,
        render: (_, record) => (
          <Input
            value={record.itemName}
            disabled
            className="form-control"
            style={{ minWidth: 200 }}
            title={record.itemName}
          />
        ),
      },
      {
        title: "Available Quantity",
        dataIndex: "availableQuantity",
        key: "availableQuantity",
        width: 150,
        render: (_, record) => (
          <Input
            value={record.availableQuantity}
            disabled
            className="form-control"
            style={{ width: 100 }}
          />
        ),
      },
      {
        title: "Transfer Quantity",
        dataIndex: "transferQuantity",
        key: "transferQuantity",
        width: 150,
        render: (_, record, index) => (
          <div>
            <Input
              type="number"
              value={record.transferQuantity}
              onChange={(e) =>
                handleInputChange(index, "transferQuantity", e.target.value)
              }
              style={{
                width: "100px",
                marginRight: "2px",
                whiteSpace: "nowrap",
              }}
              disabled={record.disableTransferQuantity}
            />
            <span>{record.itemUnit}</span>
            <br />
            {rowErrors[index] === "exceed" && (
              <div style={{ color: "red", marginTop: "5px" }}>
                Transfer quantity exceeds available stock
              </div>
            )}
            {rowErrors[index] === "positive" && (
              <div style={{ color: "red", marginTop: "5px" }}>
                Enter a positive value
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, __, index) => (
          <Button
            icon={<MinusCircleOutlined />}
            onClick={() => handleRemoveItem(index)}
            disabled={transferItems.length === 1}
          />
        ),
      },
    ];

  const transferTableExpandable =
    transferType === "scrap_items" ||
    transferType === "purchase_order_return" ||
    transferType === "sales_order_return"
      ? {
          rowExpandable: (record) =>
            Number(record?.product?.is_batch_applicable) === 1,
          expandedRowRender: (record) => renderBatchSectionBelow(record),
          defaultExpandedRowKeys: transferItems
            .map((item, idx) =>
              Number(item?.product?.is_batch_applicable) === 1 ? idx : null
            )
            .filter((v) => v !== null),
        }
      : undefined;

  const titleLabel =
    transferType === "stock_transfer"
      ? "Store to Store"
      : transferType === "add_to_stock"
        ? "Add to CWHFG"
        : transferType === "sales_order_return"
          ? "Sales Order Return"
          : transferType === "purchase_order_return"
            ? "Purchase Order Return"
            : "Scrap Items";

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title>Stock Transfer: {titleLabel}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <Form layout="vertical">
            <div className="row">
              {["stock_transfer", "scrap_items", "store_to_store"].includes(
                transferType
              ) && (
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="form-label">From Store</label>
                    <div className="custom-select-wrap">
                      <select
                        className="form-select"
                        value={
                          fromStore?.id ?? fromStore?.value ?? ""
                        }
                        onChange={(e) => {
                          const id = e.target.value ? Number(e.target.value) : null;
                          const store = stores.find(
                            (s) => Number(s.id) === id
                          );
                          setFromStore(store || null);
                        }}
                      >
                        <option value="">Select...</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!["scrap_items", "purchase_order_return", "sales_order_return"].includes(
                transferType
              ) && (
                <div
                  className={
                    transferType === "add_to_stock" ? "col-lg-12" : "col-lg-6"
                  }
                >
                  <div className="form-group">
                    <label className="form-label">
                      {transferType === "add_to_stock" ? "Store" : "To Store"}
                    </label>
                    <div className="custom-select-wrap">
                      <select
                        className="form-select"
                        value={
                          (transferType === "add_to_stock"
                            ? fgStore
                            : toStore
                          )?.id ??
                          (transferType === "add_to_stock"
                            ? fgStore
                            : toStore
                          )?.value ??
                          ""
                        }
                        onChange={(e) => {
                          const id = e.target.value ? Number(e.target.value) : null;
                          const store = (
                            transferType === "add_to_stock" && fgStore
                              ? [fgStore]
                              : stores
                          ).find((s) => Number(s.id) === id);
                          setToStore(store || null);
                        }}
                        disabled={transferType === "add_to_stock"}
                      >
                        <option value="">Select...</option>
                        {(transferType === "add_to_stock" && fgStore
                          ? [fgStore]
                          : stores
                        ).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {transferType === "add_to_stock" && (
                      <small className="text-muted">
                        Finished goods store (only one per company). Products are added to this store.
                      </small>
                    )}
                  </div>
                </div>
              )}
            </div>

            {transferType === "purchase_order_return" && (
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="form-label">Purchase Order</label>
                    <div className="custom-select-wrap d-flex gap-2 align-items-center">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter PO reference number"
                        value={poReferenceNumber}
                        onChange={(e) => setPoReferenceNumber(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchPurchaseOrder();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSearchPurchaseOrder}
                        disabled={poSearchLoading}
                      >
                        {poSearchLoading ? (
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          <i className="fas fa-search me-2" />
                        )}
                        Search
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setPoReferenceNumber("");
                          setTransferItems([
                            { ...initialTransferItem, key: Date.now() },
                          ]);
                          setRowErrors([]);
                        }}
                      >
                        <i className="fas fa-redo me-2" />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {transferType === "sales_order_return" && (
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="form-label">Sales Order</label>
                    <div className="custom-select-wrap d-flex gap-2 align-items-center">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter SO reference number"
                        value={salesOrderReferenceNumber}
                        onChange={(e) =>
                          setSalesOrderReferenceNumber(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchSalesOrder();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSearchSalesOrder}
                        disabled={salesOrderSearchLoading}
                      >
                        {salesOrderSearchLoading ? (
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          <i className="fas fa-search me-2" />
                        )}
                        Search
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setSalesOrderReferenceNumber("");
                          setTransferItems([
                            { ...initialTransferItem, key: Date.now() },
                          ]);
                          setRowErrors([]);
                        }}
                      >
                        <i className="fas fa-redo me-2" />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="table-responsive">
              <Table
                columns={columnspop}
                dataSource={transferItems}
                rowKey={(record, index) => record.key ?? index}
                pagination={{ pageSize: 10, current: 1 }}
                expandable={transferTableExpandable}
                onChange={(pagination) => {
                  const storeId =
                    transferType === "add_to_stock"
                      ? toStore?.id ?? toStore?.value
                      : fromStore?.id ?? fromStore?.value;
                  if (storeId && pagination)
                    FetchProduct(
                      storeId,
                      pagination.current ?? 1,
                      pagination.pageSize ?? 10
                    );
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-sm btn-outline-primary"
            >
              <i className="fas fa-plus me-2"></i>Add Item
            </button>

            <Form.Item label="Add a Comment Here" className="mt-3">
              <Input.TextArea
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Item>

            <button
              type="button"
              onClick={handleSubmitStockUpdate}
              className="btn btn-success"
              disabled={rowErrors.some((error) => !!error)}
            >
              Submit
            </button>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default StockTransferModal;
