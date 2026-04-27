import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import StockTransferModal from "./StockTransferModal";

/**
 * Reusable Actions dropdown with embedded Stock Transfer modal and optional "Add Single Item" button.
 * Transfer actions (Stock Transfer, Add to CWHFD, PO Return, Sales Order Return, Scrap Items) open the built-in modal.
 * Update Product Stock and Add Multiple Items call parent handlers (modals stay in parent).
 *
 * @param {() => void} [props.onAddMultipleItems] - Called when "Add Multiple Items" is clicked
 * @param {() => void} [props.onSuccess] - Called after a successful stock transfer submit (e.g. parent refetch)
 * @param {string} [props.addSingleItemHref] - If set, "Add Single Item" is rendered as a Link
 * @param {() => void} [props.onAddSingleItem] - If set, "Add Single Item" button calls this (e.g. open modal)
 */
function StockMasterBulkActions({
  onAddMultipleItems,
  onExport,
  isExporting = false,
  onSuccess,
  addSingleItemHref,
  onAddSingleItem,
  toggleClassName = "btn btn-outline-primary btn-sm",
  menuClassName = "dropdown-min-width320",
  addSingleItemClassName = "btn btn-exp-purple-outline btn-sm",
  isBulkActions = false,
}) {
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState("");

  const showActionsDropdown = isBulkActions;
  const showAddSingleItem = addSingleItemHref || typeof onAddSingleItem === "function";

  const openTransferModal = (type) => {
    setTransferType(type);
    setShowTransferModal(true);
  };

  return (
    <div className="d-flex gap-2">
      {showActionsDropdown && (
    <Dropdown align="end">
      <Dropdown.Toggle className={toggleClassName} variant="unset">
        <i className="fas fa-cog me-2"></i> Actions
      </Dropdown.Toggle>
      <Dropdown.Menu className={menuClassName}>
        {/* <button type="button" className="dropdown-item" onClick={onStockUpdate}>
          <div className="d-flex align-items-start">
            <i className="fas fa-exchange-alt me-2 text-primary mt-1"></i>
            <div>
              <div className="fw-medium f-s-14">Update Product Stock</div>
              <span className="text-muted f-s-12">
                Add or reduce item quantity in bulk
              </span>
            </div>
          </div>
        </button> */}
        <button
          type="button"
          className="dropdown-item"
          onClick={() => openTransferModal("stock_transfer")}
        >
          <div className="d-flex align-items-start">
            <i className="fas fa-exchange-alt me-2 text-primary mt-1"></i>
            <div>
              <div className="fw-medium f-s-14">Stock Transfer</div>
              <span className="text-muted f-s-12">
                Transfer your items between stores
              </span>
            </div>
          </div>
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => openTransferModal("add_to_stock")}
        >
          <div className="d-flex align-items-start">
            <i className="fas fa-plus me-2 text-primary mt-1"></i>
            <div>
              <div className="fw-medium f-s-14">Add stock to CWHFD</div>
              <span className="text-muted f-s-12">Add stock to CWHFD</span>
            </div>
          </div>
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => openTransferModal("purchase_order_return")}
        >
          <div className="d-flex align-items-start">
            <i className="fas fa-arrows-alt-h me-2 text-primary mt-1"></i>
            <div>
              <div className="fw-medium f-s-14">PO Return</div>
              <span className="text-muted f-s-12">
                return products from PO
              </span>
            </div>
          </div>
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => openTransferModal("sales_order_return")}
        >
          <div className="d-flex align-items-start">
            <i className="fas fa-arrows-alt-h me-2 text-primary mt-1"></i>
            <div>
              <div className="fw-medium f-s-14">Sales Order Return</div>
              <span className="text-muted f-s-12">
                return products from Sales Order
              </span>
            </div>
          </div>
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => openTransferModal("scrap_items")}
        >
          <div className="d-flex align-items-start">
            <i className="fas fa-trash-alt me-2 text-danger mt-1"></i>
            <div>
              <div className="fw-medium f-s-14">Scrap Items</div>
              <span className="text-muted f-s-12">Scrap items</span>
            </div>
          </div>
        </button>
        {typeof onExport === "function" && (
        <button
          type="button"
          className="dropdown-item"
          onClick={onExport}
          disabled={isExporting}
        >
          <div className="d-flex align-items-start">
            <i className={`fas ${isExporting ? "fa-spinner fa-spin" : "fa-file-csv"} me-2 text-primary mt-1`}></i>
            <div>
              <div className="fw-medium f-s-14">{isExporting ? "Exporting..." : "Export"}</div>
              <span className="text-muted f-s-12">
                Download all stock entries as CSV (current filters applied)
              </span>
            </div>
          </div>
        </button>
        )}
        {typeof onAddMultipleItems === "function" && (
        <>
        <div className="dropdown-item d-flex align-items-center">
          <span className="pe-2 text-nowrap text-muted f-s-12">
            Master Actions
          </span>
          <div className="w-100">
            <Dropdown.Divider />
          </div>
        </div>
        <button
          type="button"
          className="dropdown-item"
          onClick={onAddMultipleItems}
        >
          <div className="d-flex align-items-start">
            <i className="fas fa-plus me-2 text-primary mt-1"></i>
            <div>
              <div className="fw-medium f-s-14">Add Multiple Items</div>
              <span className="text-muted f-s-12">
                Upload hundreds of items at once through excel
              </span>
            </div>
          </div>
        </button>
        </>
        )}
      </Dropdown.Menu>
    </Dropdown>
      )}
      <StockTransferModal
        show={showTransferModal}
        onHide={() => setShowTransferModal(false)}
        transferType={transferType}
        onSuccess={onSuccess}
      />
      {showAddSingleItem && (
        addSingleItemHref ? (
          <Link to={addSingleItemHref} className={addSingleItemClassName}>
            <i className="fas fa-plus"></i>
            <span className="ms-2">Add Single Item</span>
          </Link>
        ) : (
          <button
            type="button"
            className={addSingleItemClassName}
            onClick={onAddSingleItem}
          >
            <i className="fas fa-plus"></i>
            <span className="ms-2">Add Single Item</span>
          </button>
        )
      )}
    </div>
  );
}

export default StockMasterBulkActions;
