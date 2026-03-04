import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function InventoryMasterBarcodeHeader() {
    const location = useLocation();
  return (
    <>
      <div className="inventory-header">
        <div className="top-nav-wrap">
          <ul className="nav nav-tabs gth-tabs inventory-menu">
            <li className="nav-item">
            <a className={`nav-link ${location.pathname.split("/")[2] == 'inventory-master' ? 'active' : ''}`} href="/inventory/inventory-master">
                All 
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${location.pathname.split("/")[2] == 'inventory_approval' ? 'active' : ''}`}
                href="/inventory/inventory_approval"
              >
                Inventory Approvals 
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${location.pathname.split("/")[2] == 'stock_movement' ? 'active' : ''}`} href="/inventory/stock_movement">
              Stock Movement
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${location.pathname.split("/")[2] == 'barcode' ? 'active' : ''}`} href="/inventory/barcode">
              Barcode
              </a>
            </li>
          </ul>
        </div>
      </div>
      
     
    </>
  );
}

export default InventoryMasterBarcodeHeader;
