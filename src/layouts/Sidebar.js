import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserAuth } from "../pages/auth/Auth";
import "./profile-info.min.css"

function Sidebar() {
  const { MatchPermission, user } = UserAuth();
  const location = useLocation();

  const companySettings = user?.company?.generalSettings || null;

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-1 exp-main-nav header-3">
      <div className="brand-link d-flex justify-content-center">
        <a href="/welcome" style={{ display: "none" }}>
        <img
          src={process.env.PUBLIC_URL + "/assets/images/web-logo-new.png"}
          alt="Logo"
          className="brand-image img-fluid"
        />
        <span className="brand-text" style={{ display: "none" }}>
          <img
            src={process.env.PUBLIC_URL + "/assets/images/logo-navy.png"}
            alt="Logo"
            className="img-fluid brand-name"
          />
        </span>
        </a>

      </div>

      <div className="sidebar">
        <div className='side_menu'>
          {/* <div className='text-center my-2'>
            <img src={`${process.env.PUBLIC_URL}/assets/images/ERP-log.png`} alt="ERP" className="img-fluid" />
          </div> */}
          <nav className="nav-customSidebar">
            <div className="accordion menu-accordian" id="menuAccordian">
              {/* new add */}
              {MatchPermission(["Purchase"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${
                        location.pathname === "/purchase/dashboard" ||
                        location.pathname === "/operation/create-rfq-active" ||
                        location.pathname === "/operation/complete-orders/received-done" ||
                        location.pathname === "/operation/rejected-orders/rejected" ||
                        location.pathname === "/purchase" ||
                        location.pathname === "/purchase/new" ||
                        location.pathname === "/operation/purchase_ledger" ||
                        location.pathname === "/report/indent-requirement-report" || 
                        location.pathname === "/store/recv_update/request-quotation" ||
                        location.pathname === "/purchase-orders/recvorder/:id"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#purchase"
                      aria-expanded="false"
                      aria-controls="purchase"
                    >
                      <i className="sidebar-nav-icon fas fa-cart-plus" />
                      <p>Purchase</p>
                    </button>
                  </div>
                  <div
                    id="purchase"
                    className={`accordion-collapse collapse ${
                      location.pathname === "/my-workflow-task" ||
                      location.pathname.split("/")[1] === "my-task-done" ||
                      location.pathname === "/my-workflow-task-details" ||
                      location.pathname === "/my-checklist-task" ||
                      location.pathname === "/my-task-tracker" ||
                      location.pathname === "/purchase/dashboard" ||
                      location.pathname === "/management" ||
                      location.pathname === "/pending-approval/final-approval-pending" ||
                      location.pathname === "/pending-approval/active" ||
                      location.pathname === "/pending-approval/request-for-quotation" ||
                      location.pathname === "/pending-approval/send-to-management" ||
                      location.pathname === "/pending-approval/sales-order" ||
                      location.pathname === "/pending-approval/rejected-from-admin" ||
                      location.pathname === "/pending-approval/fully-billed" ||
                      location.pathname === "/pending-approval/done" ||
                      location.pathname === "/pending-approval/nothing-to-bill" ||
                      location.pathname === "/pending-approval/items-received-done" ||

                      location.pathname === "/approve-po/final-approval-pending" ||
                      location.pathname === "/approve-po/approval-Active" ||
                      location.pathname === "/operation/create-rfq-active" ||
                      location.pathname === "/operation/create-rfq-pending" ||
                      location.pathname === "/operation/create-rfq-billed" ||
                      location.pathname === "/operation/create-rfq-quotation" ||
                      location.pathname === "/operation/create-rfq-management" ||
                      location.pathname === "/operation/purchase-orders/received-done" ||
                      location.pathname === "/operation/purchase-orders/sales-orders" ||
                      location.pathname === "/operation/purchase-orders/done" ||
                      location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
                      location.pathname === "/operation/complete-orders/received-done" ||
                      location.pathname === "/operation/complete-orders/nothing-to-bill" ||
                      location.pathname === "/operation/rejected-orders/rejected" ||
                      location.pathname === "/followup/order-followup/nothing-bill" ||
                      location.pathname === "/bill/purchase-orders-recved/items-received-done" ||
                      location.pathname === "/purchase" ||
                      location.pathname === "/rejected-purchase" ||
                      location.pathname === "/purchase-orders" ||
                      location.pathname === "/purchase-orders-done" ||
                      location.pathname === "/followup" ||
                      location.pathname === "/purchase-orders-recved" ||
                      location.pathname === "/purchase/new" ||
                      location.pathname === "/operation/purchase_ledger" ||
                      location.pathname === "/store/recv_update/request-quotation" ||
                      location.pathname === "/purchase-orders/recvorder/:id"
                      ? "show"
                      : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <div className="sidebar-item">
                        <Link
                          to="/purchase/dashboard"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/purchase/dashboard" ? "active" : ""
                            } `}
                        >
                          <p>Dashboard</p>
                        </Link>
                      </div>

                      <div
                        className="accordion menu-accordian"
                        id="submenuAccordian"
                      >

                        {/* operation */}
                        <div className="accordion-header sidebar-item ">
                          <button
                            className={`accordion-button submenu ${
                              location.pathname === "/operation/create-rfq-active" ||
                              location.pathname === "/operation/create-rfq-pending" ||
                              location.pathname === "/operation/create-rfq-billed" ||
                              location.pathname === "/operation/create-rfq-quotation" ||
                              location.pathname === "/operation/create-rfq-management" ||
                              location.pathname === "/operation/purchase-orders/received-done" ||
                              location.pathname === "/operation/purchase-orders/sales-orders" ||
                              location.pathname === "/operation/purchase-orders/done" ||
                              location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
                              location.pathname === "/operation/complete-orders/received-done" ||
                              location.pathname === "/operation/complete-orders/nothing-to-bill" ||
                              location.pathname === "/operation/rejected-orders/rejected" ||
                              location.pathname === "/purchase-orders" ||
                              location.pathname === "/purchase-orders-done" ||
                              location.pathname === "/purchase/new" ||
                              location.pathname === "/operation/purchase_ledger"
                              ? ""
                              : "collapsed"
                              } sidebar-nav-link`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#Operation"
                            aria-expanded="false"
                            aria-controls="Operation"
                          >
                            <p>Operations</p>
                          </button>
                        </div>

                        <div
                          id="Operation"
                          className={`accordion-collapse collapse ${
                            location.pathname === "/operation/create-rfq-active" ||
                            location.pathname === "/operation/create-rfq-pending" ||
                            location.pathname === "/operation/create-rfq-billed" ||
                            location.pathname === "/operation/create-rfq-quotation" ||
                            location.pathname === "/operation/create-rfq-management" ||
                            location.pathname === "/operation/purchase-orders/received-done" ||
                            location.pathname === "/operation/purchase-orders/sales-orders" ||
                            location.pathname === "/operation/purchase-orders/done" ||
                            location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
                            location.pathname === "/operation/complete-orders/received-done" ||
                            location.pathname === "/operation/complete-orders/nothing-to-bill" ||
                            location.pathname === "/operation/rejected-orders/rejected" ||
                            location.pathname === "/rejected-purchase" ||
                            location.pathname === "/purchase-orders" ||
                            location.pathname === "/purchase-orders-done" ||
                            location.pathname === "/purchase/new" ||
                            location.pathname === "/operation/purchase_ledger"
                            ? "show"
                            : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              {MatchPermission(["Create PO"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/purchase/new"
                                    className={`sidebar-nav-link ${location.pathname === "/purchase/new" ? "active" : "" }`}
                                  >
                                    <p>Create PO</p>
                                  </Link>
                                </li>
                                : ""}

                              {MatchPermission(["Create PO", "Update PO", "Delete PO", "approve PO"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/create-rfq-active"
                                    className={`sidebar-nav-link ${location.pathname === "/operation/create-rfq-active" ||
                                      location.pathname === "/operation/create-rfq-pending" ||
                                      location.pathname === "/operation/create-rfq-billed" ||
                                      location.pathname === "/operation/create-rfq-quotation" ||
                                      location.pathname === "/operation/create-rfq-management"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>PO Status</p>
                                  </Link>
                                </li>
                              : ""}

                              {MatchPermission(["Completed PO"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/complete-orders/received-done"
                                    className={`sidebar-nav-link ${location.pathname === "/operation/complete-orders/received-done" ||
                                      location.pathname === "/operation/complete-orders/nothing-to-bill"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Completed Orders</p>
                                  </Link>
                                </li>
                                : ""}
                              {MatchPermission(["Rejected PO"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/rejected-orders/rejected"
                                    className={`sidebar-nav-link ${location.pathname === "/operation/rejected-orders/rejected"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Rejected Orders</p>
                                  </Link>
                                </li>
                                : ""}
                            </ul>
                          </div>
                        </div>
                        {/* operation end*/}
                        {MatchPermission(["approve PO"]) ?
                        <div className={`sidebar-item sidebar-item-no-child ${location.pathname === "/pending-approval/send-to-management" ? "active" : ""}`}>
                          <Link
                              to="/pending-approval/send-to-management"
                              className={`sidebar-nav-link subMenu_item ${location.pathname === "/pending-approval/send-to-management" ? "active" : ""}`}
                            >
                            <p>Approve PO</p>
                          </Link>
                        </div>
                        : ''}

                        {/* <div
                          id="Follow"
                          className={`accordion-collapse collapse ${location.pathname === "/followup/order-followup/nothing-bill" ? "show" : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              {MatchPermission(["Order Followup"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/followup/order-followup/nothing-bill"
                                    className={`sidebar-nav-link ${location.pathname === "/followup/order-followup/nothing-bill"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Order Followup</p>
                                  </Link>
                                </li>
                                : ''}
                            </ul>
                          </div>
                        </div> */}
                        {/* follow-up end*/}

                        {MatchPermission(["Pending GRN"]) ?
                          <div className={`sidebar-item sidebar-item-no-child 
                            ${location.pathname === "/store/recv_update/request-quotation" ||
                            location.pathname === "/purchase-orders/recvorder/:id"
                            ? "active" : ""}`}>
                              <Link
                                to="/store/recv_update/request-quotation"
                                className={`sidebar-nav-link subMenu_item ${location.pathname === "/store/recv_update/request-quotation" ||
                                  location.pathname === "/purchase-orders/recvorder/:id"
                                  ? "active" : ""}`}
                              >
                                <p>Pending GRN</p>
                              </Link>
                          </div>
                        : ''}

                        {/* {MatchPermission(["PO Reports"]) ?
                        <div className="accordion-header sidebar-item ">
                            <button
                              className={`accordion-button submenu ${
                                  location.pathname === "/purchase-reports"
                                ? "active"
                                : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#PurchaseReports"
                              aria-expanded="false"
                              aria-controls="PurchaseReports"
                            >
                              <p>Reports</p>
                            </button>
                        </div>
                        : ''} */}


                        {/* {MatchPermission(["Purchase Reports"]) ?
                        <div
                          id="PurchaseReports"
                          className={`accordion-collapse collapse 
                            ${location.pathname === "/report/indent-requirement-report" ? "show" : ""} `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              {MatchPermission(["Purchase Reports"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/report/indent-requirement-report"
                                    className={`sidebar-nav-link ${location.pathname === "/report/indent-requirement-report"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Indent Requirment Report</p>
                                  </Link>
                                </li>
                                : ''}
                            </ul>
                          </div>
                        </div>
                        : ''} */}


                        {/* <div
                          id="bill"
                          className={`accordion-collapse collapse ${location.pathname === "/bill/purchase-orders-recved/items-received-done" ||
                            location.pathname === "/bill/purchase-orders-recved/items-received-done"
                            ? "show"
                            : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              <li className="sidebar-item">
                                <Link
                                  to="/bill/purchase-orders-recved/items-received-done"
                                  className={`sidebar-nav-link ${location.pathname === "/bill/purchase-orders-recved/items-received-done" ||
                                    location.pathname === "/bill/purchase-orders-recved/nothing-to-bill"
                                    ? "active"
                                    : ""
                                    }`}
                                >
                                  <p>Create Bill</p>
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div> */}
                        {/* PO recved  end*/}
                      </div>
                    </div>
                  </div>
                </div>
                : ""}
              {MatchPermission(["Sales"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button 
                        ${location.pathname.split("/")[1] === "my-task-done2" ||
                        location.pathname === "/sales-orders" ||
                        location.pathname === "/sales-orders-done" ||
                        location.pathname === "/sales-orders/dispatch/order-dispatch" ||
                        location.pathname === "/sales-orders/received-product" ||
                        location.pathname === "/rejected-sales" ||
                        location.pathname === "/sales/quotation/reviewing" ||
                        location.pathname === "/sales/quotation/rejected" ||
                        location.pathname === "/sales/quotation" ||
                        location.pathname === "/sales/pending-approval/reviewing" ||
                        location.pathname === "/sales/new" ||
                        (location.pathname.startsWith("/sales/") && location.pathname.split("/").length === 3) ||
                        location.pathname === "/sales-dashboard" ||
                        location.pathname === "/operation/sales_ledger"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Sales"
                      aria-expanded="false"
                      aria-controls="Sales"
                    >
                      <i className="sidebar-nav-icon fas fa-chart-line" />
                      <p>Sales</p>
                    </button>
                  </div>
                  <div
                    id="Sales"
                    className={`accordion-collapse collapse 
                      ${location.pathname.split("/")[1] === "my-task-done" ||
                      location.pathname === "/sales-orders" ||
                      location.pathname === "/sales-dashboard" ||
                      location.pathname === "/my-checklist-task" ||
                      location.pathname === "/sales-orders-done" ||
                      location.pathname === "/sales/quotation/reviewing" ||
                      location.pathname === "/sales/quotation/rejected" ||
                      location.pathname === "/sales/quotation" ||
                      location.pathname === "/sales/followup" ||
                      location.pathname === "/sales-orders/dispatch/order-dispatch" ||
                      location.pathname === "/sales-orders/received-product" ||
                      location.pathname === "/sales/pending-approval/reviewing" ||
                      location.pathname === "/sales/new" ||
                      location.pathname === "/operation/sales_ledger" ||
                      location.pathname === "/completed-sales-orders"
                      ? "show"
                      : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <div className="sidebar-item">
                        <Link
                          to="sales-dashboard"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/sales-dashboard" ? "active" : ""
                            } `}
                        >
                          <p>Dashboard</p>
                        </Link>
                      </div>

                      <div
                        className="accordion menu-accordian"
                        id="submenuAccordian"
                      >
                        {/* operation */}
                        <div className="accordion-header sidebar-item ">
                          <button
                            className={`accordion-button submenu ${location.pathname === "/sales/quotation/reviewing" ||
                              location.pathname === "/sales/quotation/rejected" ||
                              location.pathname === "/sales/quotation" ||
                              location.pathname === "/rejected-sales" ||
                              location.pathname === "/sales-sales" ||
                              location.pathname === "/sales-orders-done" ||
                              location.pathname === "/sales-orders/received-product" ||
                              location.pathname === "/sales/new" ||
                              (location.pathname.startsWith("/sales/") && location.pathname.split("/").length === 3) ||
                              location.pathname === "/operation/sales_ledger" ||
                              location.pathname === "/completed-sales-orders"
                              ? ""
                              : "collapsed"
                              } sidebar-nav-link`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#Operation"
                            aria-expanded="false"
                            aria-controls="Operation"
                          >
                            <p>Sales Operation</p>
                          </button>
                        </div>

                        <div
                          id="Operation"
                          className={`accordion-collapse collapse ${location.pathname === "/purchase" ||
                            location.pathname === "/rejected-sales" ||
                            location.pathname === "/sales-orders" ||
                            location.pathname === "/sales-orders-done" ||
                            location.pathname === "/sales/new" ||
                            (location.pathname.startsWith("/sales/") && location.pathname.split("/").length === 3) ||
                            location.pathname === "/sales/quotation/reviewing" ||
                            location.pathname === "/sales/quotation/rejected" ||
                            location.pathname === "/sales-orders/dispatch/order-dispatch" ||
                            location.pathname === "/sales-orders/received-product" ||
                            location.pathname === "/sales/quotation" ||
                            location.pathname === "/operation/sales_ledger" ||
                            location.pathname === "/completed-sales-orders"
                            ? "show"
                            : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              {/* {MatchPermission(["Sales Ledger"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/sales_ledger"
                                    className={`sidebar-nav-link ${
                                      location.pathname === "/operation/sales_ledger"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Sales Ledger</p>
                                  </Link>
                                </li>
                                : ""} */}

                              {MatchPermission(["Create SO"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/sales/new"
                                    className={`sidebar-nav-link 
                                      ${location.pathname === "/sales/new"
                                      ? "active" : ""
                                      }`}
                                  >
                                    <p>Create Sale Order</p>
                                  </Link>
                                </li>
                              : ""}

                              {MatchPermission(["Create SO", "Update SO", "Delete SO", "approve SO"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/sales/quotation"
                                    className={`sidebar-nav-link 
                                      ${location.pathname === "/sales/quotation" ||
                                      location.pathname === "/sales/quotation/rejected" ||
                                      (location.pathname.startsWith("/sales/") && location.pathname.split("/").length === 3) ||
                                      location.pathname === "/sales/quotation"
                                      ? "active" : ""

                                      }`}
                                  >
                                    <p>Active Orders</p>
                                  </Link>
                                </li>
                                : ""}
                              {MatchPermission(["Completed SO"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/completed-sales-orders"
                                    className={`sidebar-nav-link ${location.pathname === "/completed-sales-orders"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Completed Orders</p>
                                  </Link>
                                </li>
                                : ""}
                              {MatchPermission(["Dispatch SO"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/sales-orders/dispatch/order-dispatch"
                                    className={`sidebar-nav-link ${location.pathname === "/sales-orders/dispatch/order-dispatch" ||
                                      location.pathname === "/sales-orders/dispatch/order-dispatch"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Dispatch</p>
                                  </Link>
                                </li>
                                : ""}
                            </ul>
                          </div>
                        </div>
                        {/* operation end*/}
                        {/* management */}
                        {MatchPermission(["Approve SO"]) ?
                          <div className={`sidebar-item`}>
                            <Link
                              to="/sales/pending-approval/reviewing"
                              className={`sidebar-nav-link subMenu_item ${location.pathname === "/sales/pending-approval/reviewing" 
                                // || (location.pathname.startsWith("/sales/") && location.pathname.split("/").length === 3 && location.pathname !== "sales/quotation")
                                ? "active" : ""
                                }`}
                            >
                              <p>Approve SO</p>
                            </Link>
                          </div>
                          : ""}
                     
                        {/* management end*/}

                        {/* <div
                          id="Followsales"
                          className={`accordion-collapse collapse ${location.pathname === "/sales/followup" ? "show" : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              <li className="sidebar-item">
                                <Link
                                  to="/sales/followup"
                                  className={`sidebar-nav-link ${location.pathname === "/sales/followup"
                                    ? "active"
                                    : ""
                                    }`}
                                >
                                  <p>Sales Followup</p>
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div> */}
                        {/* follow-up end*/}
                      </div>
                    </div>
                  </div>
                </div>

                : ""}
              {/* inventory start */}
              {MatchPermission(["Inventory"]) ?

                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${
                        location.pathname.split("/")[1] === "/inventory-master-editx" ||
                        location.pathname === "/inventory/inventory-master"
                        || location.pathname === "/products"
                        || location.pathname === "/category"
                        || location.pathname === "/inventory/barcode"
                        || location.pathname === "/inventory/stock_movement"
                        || location.pathname === "/inventory/inventory_approval"
                        || location.pathname === "/inventory-master-edit"
                        || location.pathname === "/products"
                        || location.pathname === "/category"
                        || location.pathname === "/add-new-product"
                        || location.pathname === "/add-new-category"
                        || location.pathname.startsWith("/inventory/inventory-master-edit/")
                        || location.pathname === "/inventory/inventory-master"
                        || location.pathname === "/inventory/stock-master/add-stock"
                        ? "" : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Inventory"
                      aria-expanded="false"
                      aria-controls="Inventory"
                    >
                      <i className="sidebar-nav-icon fas fa-cubes" />
                      <p>Inventory</p>
                    </button>
                  </div>
                  <div
                    id="Inventory"
                    className={`accordion-collapse collapse 
                      ${location.pathname === "/inventory/dashboard"
                      || location.pathname === "/inventory-master-edit"
                      || location.pathname === "/inventory/stock-master"
                      || location.pathname === "/inventory/stock-master/add-stock"
                      || location.pathname === "/inventory/inventory-master"
                      || location.pathname === "/inventory/barcode"
                      || location.pathname === "/inventory/stock_movement"
                      || location.pathname === "/inventory/inventory_approval"
                      || location.pathname === "/products"
                      || location.pathname === "/add-new-product"
                      || location.pathname === "/add-new-category"
                      || location.pathname === "/category"
                      || location.pathname.startsWith("/inventory/inventory-master-edit/")
                      || location.pathname === "/inventory/floor_manager"
                      ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body ">
                      <div className="sidebar-item">
                        <Link
                          to="/inventory/dashboard"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/inventory/dashboard" ? "active" : ""
                            } `}
                        >
                          <p>Dashboard</p>
                        </Link>
                      </div>
                      {MatchPermission(["Inventory Item Master"]) ?
                        <div className="sidebar-item">
                          <Link to="/inventory/inventory-master"
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/inventory/inventory-master"
                              || location.pathname === "/inventory/barcode"
                              || location.pathname === "/inventory/stock_movement"
                              || location.pathname === "/inventory/inventory_approval"
                              || location.pathname.startsWith("/inventory/inventory-master-edit/")

                              ? "active" : ""
                              } `}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>Item Master</p>
                          </Link>
                        </div>
                        : ""}
                        {MatchPermission(["Inventory Item Master"]) ?
                        <div className="sidebar-item">
                          <Link to="/inventory/stock-master"
                            className={`sidebar-nav-link subMenu_item 
                              ${
                                location.pathname === "/inventory/stock-master"
                                || location.pathname === "/inventory/stock-master/add-stock"
                              ? "active" : ""
                              } `}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>Stock Master</p>
                          </Link>
                        </div>
                        : ""}
                      {MatchPermission(["Floor Manager"]) ?
                        <div className="sidebar-item">
                          <Link
                            to="/inventory/floor_manager"
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/inventory/floor_manager"
                              ? "active" : ""
                              } `}
                          >

                            <p>Floor Manager</p>
                          </Link>
                        </div>
                        : ""}
                      {MatchPermission(["Inventory Category"]) ?
                        <div className="sidebar-item">
                          <Link to={'/category'}
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/add-new-category" ||
                              location.pathname === "/category"
                              ? "active" : ""
                              } `}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>Category</p>
                          </Link>
                        </div>
                        : ""}
                    </div>
                  </div>
                </div>
              : ""}
              {/* inventory end */}

              {/* Production start */}
              {MatchPermission(["Production", "Work Orders"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/production/work-orders" ||
                        location.pathname === "/production/work-order-materials" ||
                        location.pathname === "/settings/manage-production-flow" ||
                        location.pathname === "/production/dispatch" ||
                        location.pathname === "/production/dashboard" ||
                        location.pathname === "/production/planning-list"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#ProductionMenu"
                      aria-expanded="false"
                      aria-controls="ProductionMenu"
                    >
                      <i className="sidebar-nav-icon fas fa-sitemap" />
                      <p>Production</p>
                    </button>
                  </div>
                  <div
                    id="ProductionMenu"
                    className={`accordion-collapse collapse ${location.pathname === "/production/work-orders" ||
                      location.pathname === "/production/work-order-materials" ||
                      location.pathname === "/settings/manage-production-flow" ||
                      location.pathname === "/production/dispatch" ||
                      location.pathname === "/production/dashboard" ||
                      location.pathname === "/production/planning-list"
                      ? "show"
                      : ""
                      }`}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <div className="sidebar-item">
                        <Link
                          to="/production/dashboard"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/production/dashboard"
                            ? "active"
                            : ""
                            }`}
                        >
                          <p>Dashboard</p>
                        </Link>
                      </div>
                      <div className="sidebar-item">
                        <Link
                          to="/production/work-orders"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/production/work-orders"
                            ? "active"
                            : ""
                            }`}
                        >
                          <p>Work Orders</p>
                        </Link>
                      </div>
                      {companySettings.production_without_bom === 1 && (
                        <div className="sidebar-item">
                          <Link
                            to="/production/work-order-materials"
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/production/work-order-materials"
                              ? "active"
                              : ""
                              }`}
                          >
                            <p>Raw Materials</p>
                          </Link>
                        </div>
                      )}
                      {companySettings.is_production_planning === 1 && (
                        <div className="sidebar-item">
                        <Link
                          to="/production/planning-list"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/production/planning-list"
                            ? "active"
                            : ""
                            }`}
                        >
                          <p>Production Planning</p>
                        </Link>
                      </div>
                      )}
                      <div className="sidebar-item">
                        <Link
                          to="/settings/manage-production-flow"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/settings/manage-production-flow"
                            ? "active"
                            : ""
                            }`}
                        >
                          <p>Manage Production Flow</p>
                        </Link>
                      </div>
                      <div className="sidebar-item">
                        <Link
                          to="/production/dispatch"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/production/dispatch"
                            ? "active"
                            : ""
                            }`}
                        >
                          <p>Dispatch & Delivery</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                : ""}
              {/* Production end */}

         
              {/* inventory end */}
              {/* Buyers & Suppliers start */}
              {MatchPermission(["Manage Buyers", "Manage Suppliers"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/suppliers" ||
                        location.pathname === "/add-new-vendor" ||
                        location.pathname === "/customers" ||
                        location.pathname === "/edit-vendor/:id"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Buyers&Suppliers"
                      aria-expanded="false"
                      aria-controls="Buyers&Suppliers"
                    >
                      <i className="sidebar-nav-icon fas fa-hands-helping" />
                      <p>Buyers & Suppliers</p>
                    </button>
                  </div>
                  <div
                    id="Buyers&Suppliers"
                    className={`accordion-collapse collapse ${location.pathname === "/customers" ||
                      location.pathname === "/add-new-vendor" ||
                      location.pathname === "/suppliers" ||
                      location.pathname === "/edit-vendor/:id"
                      ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        {MatchPermission(["Manage Suppliers"]) ?
                        <li className="sidebar-item">
                          <Link
                            to="/suppliers"
                            className={`sidebar-nav-link ${
                              location.pathname === "/suppliers" || location.pathname === "/edit-vendor/:id" ? "active" : ""
                              }`}
                          >
                            <p>Suppliers</p>
                          </Link>
                        </li>
                        : ''}
                        {MatchPermission(["Manage Buyers"]) ?
                        <li className="sidebar-item">
                          <Link
                            to="/customers"
                            className={`sidebar-nav-link ${location.pathname === "/customers"
                              ? "active"
                              : ""
                              }`}
                          >
                            <p>Buyers</p>
                          </Link>
                        </li>
                        : ''}
                        {/* <li className="sidebar-item">
                      <Link
                        to="/add-new-vendor"
                        className={`sidebar-nav-link ${location.pathname === "/add-new-vendor"
                          ? "active"
                          : ""
                          }`}
                      >
                        <p>Add Single Buyers</p>
                      </Link>
                    </li> */}
                        {/* <li className="sidebar-item">
                      <Link
                        to="/add-new-customer"
                        className={`sidebar-nav-link ${location.pathname === "/add-new-customer"
                          ? "active"
                          : ""
                          }`}
                      >
                        <p>Add Single Supplier</p>
                      </Link>
                    </li> */}
                      </ul>


                    </div>
                  </div>
                </div>
                : ""}
              {/*  Buyers & Suppliers end  */}

              {/* BOM start */}
              {MatchPermission(["Create BOM Master", "View BOM Master", "BOM Report"]) && 
              companySettings.production_without_bom !== 1 ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "inventory/bom-master" ||
                        location.pathname === "/inventory/bom-master/create"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#BOM"
                      aria-expanded="false"
                      aria-controls="BOM"
                    >
                      <i className="sidebar-nav-icon fas fa-cubes" />
                      <p>BOM</p>
                    </button>
                  </div>
                  <div
                    id="BOM"
                    className={`accordion-collapse collapse 
                      ${location.pathname === "/inventory/bom-master" ||
                      location.pathname === "/inventory/bom-master/create" ||
                      location.pathname === "/inventory/bom-report"
                      ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        {MatchPermission(["Create BOM Master", "View BOM Master"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/inventory/bom-master"
                              className={`sidebar-nav-link ${location.pathname === "/inventory/bom-master" ? "active" : ""
                                }`}
                            >
                              <p>BOM Master</p>
                            </Link>
                          </li>
                        : ''}
                        {MatchPermission(["BOM Report"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/inventory/bom-report"
                              className={`sidebar-nav-link ${location.pathname === "/inventory/bom-report"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>BOM Report</p>
                            </Link>
                          </li>
                        : ''}
                      </ul>

                    </div>
                  </div>
                </div>
                : ""}
              {/*  BOM end  */}

              {/* Payments start */}
              {/* <div className="accordion-item">
              <div className="accordion-header sidebar-item">
                <button
                  className={`accordion-button ${
                    location.pathname === "/payment/document/receivable" ||
                    location.pathname === "/payment/document/payable" ||
                    location.pathname === "/payment/document/receive" ||
                    location.pathname === "/payment/document/paid" ||
                    location.pathname === "/payment/document/overdue-receivable" ||
                    location.pathname === "/payment/document/overdue-payable" ||
                    location.pathname === "/payment/company-ledger/all" ||
                    location.pathname === "/payment/receipts/received" ||
                    location.pathname === "/payment/payments/paid" ||
                    location.pathname === "/payment/document/tax-invoice/id" ||
                    location.pathname === "/document/grn/create/id" ||
                    location.pathname === "/document/inward-document/create/id" ||
                    location.pathname === "/document/tax-invoice-document/create/id" ||
                    location.pathname === "/document/proforma-invoice-document/create/id" ||
                    location.pathname === "/document/receipt-voucher-document/create/id" ||
                    location.pathname === "/document/purchase-return-challan-document/create/id" ||
                    location.pathname === "/transaction/transaction-details/id" ||
                    location.pathname === "/payment/document/purchase-order/id" ||
                    location.pathname === "/opening-balance" ||
                    location.pathname === "/payment/document/log-details" ||
                    location.pathname === "/document/cn/create" ||
                    location.pathname === "/document/dn/create" ||
                    location.pathname === "/payment/document/inward-document/id"
                    ? ""
                    : "collapsed"
                    } sidebar-nav-link`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#Payments"
                  aria-expanded="false"
                  aria-controls="Payments"
                >
                  <i className="sidebar-nav-icon fas fa-wallet" />
                  <p>Payments</p>
                </button>
              </div>
              <div
                id="Payments"
                className={`accordion-collapse collapse ${                
                location.pathname === "/payment/document/receivable" ||
                location.pathname === "/payment/document/payable" ||
                location.pathname === "/payment/document/receive" ||
                location.pathname === "/payment/document/paid" ||
                location.pathname === "/payment/document/overdue-receivable" ||
                location.pathname === "/payment/document/overdue-payable" ||
                location.pathname === "/payment/company-ledger/all" ||
                location.pathname === "/payment/receipts/received" ||
                location.pathname === "/payment/payments/paid" ||
                location.pathname === "/payment/document/tax-invoice/id" ||
                location.pathname === "/document/grn/create/id" ||
                location.pathname === "/document/inward-document/create/id" ||
                location.pathname === "/document/tax-invoice-document/create/id" ||
                location.pathname === "/document/proforma-invoice-document/create/id" ||
                location.pathname === "/document/receipt-voucher-document/create/id" ||
                location.pathname === "/document/purchase-return-challan-document/create/id" ||
                location.pathname === "/transaction/transaction-details/id" ||
                location.pathname === "/payment/document/purchase-order/id" ||
                location.pathname === "/opening-balance" ||
                location.pathname === "/payment/document/log-details" ||
                location.pathname === "/document/cn/create" ||
                location.pathname === "/document/dn/create" ||
                location.pathname === "/payment/document/inward-document/id"
                 ? "show" : ""
                  } `}
                data-bs-parent="#menuAccordian"
              >
                <div className="accordion-body">

                  <div
                    className="accordion menu-accordian"
                    id="submenuAccordian"
                  >
                    
                    <div className="accordion-header sidebar-item">
                      <button
                        className={`accordion-button submenu ${
                        location.pathname === "/payment/document/receivable" ||
                        location.pathname === "/payment/document/payable" ||
                        location.pathname === "/payment/document/receive" ||
                        location.pathname === "/payment/document/paid" ||
                        location.pathname === "/payment/document/overdue-receivable" ||
                        location.pathname === "/payment/document/overdue-payable" ||
                        location.pathname === "/payment/document/tax-invoice/id" ||
                        location.pathname === "/document/grn/create/id" ||
                        location.pathname === "/document/inward-document/create/id" ||
                        location.pathname === "/document/tax-invoice-document/create/id" ||
                        location.pathname === "/document/proforma-invoice-document/create/id" ||
                        location.pathname === "/document/receipt-voucher-document/create/id" ||
                        location.pathname === "/document/purchase-return-challan-document/create/id" ||
                        location.pathname === "/transaction/transaction-details/id" ||
                        location.pathname === "/payment/document/purchase-order/id" ||
                        location.pathname === "/payment/document/log-details" ||
                        location.pathname === "/document/cn/create" ||
                        location.pathname === "/document/dn/create" ||
                        location.pathname === "/payment/document/inward-document/id"
                        ? "" : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#PaymentDocuments"
                        aria-expanded="false"
                        aria-controls="PaymentDocuments"
                      >                        
                        <p>Documents</p>
                      </button>
                    </div>
                    <div
                      id="PaymentDocuments"
                      className={`accordion-collapse collapse ${
                        location.pathname === "/payment/document/receivable" ||
                        location.pathname === "/payment/document/payable" ||
                        location.pathname === "/payment/document/receive" ||
                        location.pathname === "/payment/document/paid" ||
                        location.pathname === "/payment/document/overdue-receivable" ||
                        location.pathname === "/payment/document/overdue-payable" ||
                        location.pathname === "/payment/document/tax-invoice/id" ||
                        location.pathname === "/document/grn/create/id" ||
                        location.pathname === "/document/inward-document/create/id" ||
                        location.pathname === "/document/tax-invoice-document/create/id" ||
                        location.pathname === "/document/proforma-invoice-document/create/id" ||
                        location.pathname === "/document/receipt-voucher-document/create/id" ||
                        location.pathname === "/document/purchase-return-challan-document/create/id" ||
                        location.pathname === "/transaction/transaction-details/id" ||
                        location.pathname === "/payment/document/purchase-order/id" ||
                        location.pathname === "/payment/document/log-details" ||
                        location.pathname === "/document/cn/create" ||
                        location.pathname === "/document/dn/create" ||
                        location.pathname === "/payment/document/inward-document/id"

                      ? "show" : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/receivable"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/receivable"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Receivable</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/payable"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/payable"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Payable</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/receive"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/receive"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Received</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/paid"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/paid"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Paid</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/overdue-receivable"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/overdue-receivable"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Overdue Receivable</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/overdue-payable"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/overdue-payable"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Overdue Payable</p>
                            </Link>
                          </li>

                        </ul>
                      </div>
                    </div>
                   
                    <div className="accordion-header sidebar-item">
                      <button
                        className={`accordion-button submenu ${
                        location.pathname === "/payment/company-ledger/all" 
                        ? "" : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#CompanyLedger"
                        aria-expanded="false"
                        aria-controls="CompanyLedger"
                      >                        
                        <p>Company Ledger</p>
                      </button>
                    </div>
                    <div
                      id="CompanyLedger"
                      className={`accordion-collapse collapse ${
                        location.pathname === "/payment/company-ledger/all" 
                         ? "show" : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">
                          <li className="sidebar-item">
                            <Link
                              to="/payment/company-ledger/all"
                              className={`sidebar-nav-link ${location.pathname === "/payment/company-ledger/all"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>All</p>
                            </Link>
                          </li>

                        </ul>
                      </div>
                    </div>
                   
                    <div className="accordion-header sidebar-item">
                      <button
                        className={`accordion-button submenu ${
                        location.pathname === "/payment/payments/paid" 
                        ? "" : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#PaymentPayments"
                        aria-expanded="false"
                        aria-controls="PaymentPayments"
                      >                        
                        <p>Payments</p>
                      </button>
                    </div>
                    <div
                      id="PaymentPayments"
                      className={`accordion-collapse collapse ${
                        location.pathname === "/payment/payments/paid" 
                         ? "show" : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">                          
                          <li className="sidebar-item">
                            <Link
                              to="/payment/payments/paid"
                              className={`sidebar-nav-link ${location.pathname === "/payment/payments/paid"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Paid</p>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="accordion-header sidebar-item">
                      <button
                        className={`accordion-button submenu ${
                        location.pathname === "/payment/receipts/received"
                        ? "" : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#PaymentReceipt"
                        aria-expanded="false"
                        aria-controls="PaymentReceipt"
                      >                        
                        <p>Receipts</p>
                      </button>
                    </div>
                    <div
                      id="PaymentReceipt"
                      className={`accordion-collapse collapse ${
                        location.pathname === "/payment/receipts/received"
                         ? "show" : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">
                          <li className="sidebar-item">
                            <Link
                              to="/payment/receipts/received"
                              className={`sidebar-nav-link ${location.pathname === "/payment/receipts/received"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Received</p>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div> */}
              {/* Payments end  */}

              {/* pos start */}
              {/* {MatchPermission(["POS"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/pos" || location.pathname === "/pos/order-status"
                        || location.pathname === "/pos/view-details" || location.pathname === "/pos/sales-data" || location.pathname === "/pos/company-creation" ? "" : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#pos"
                      aria-expanded="false"
                      aria-controls="pos"
                    >
                      <i className="sidebar-nav-icon fas fa-cart-arrow-down" />
                      <p>POS</p>
                    </button>
                  </div>
                  <div
                    id="pos"
                    className={`accordion-collapse collapse ${location.pathname === "/pos" || location.pathname === "/pos/order-status" || location.pathname === "/pos/view-details" || location.pathname === "/pos/sales-data" || location.pathname === "/pos/company-creation" ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        <li className="sidebar-item">
                          <Link
                            to="/reports/pos-dashboard"
                            className={`sidebar-nav-link ${location.pathname === "/reports/pos-dashboard" ? "active" : ""
                              }`}
                          >
                            <p>Dashboard</p>
                          </Link>
                        </li>
                        <li className="sidebar-item">
                          <Link
                            to="/pos"
                            className={`sidebar-nav-link ${location.pathname === "/pos" || location.pathname === "/pos/view-details" ? "active" : ""
                              }`}
                          >
                            <p>POS</p>
                          </Link>
                        </li>
                        <li className="sidebar-item">
                          <Link
                            to="/pos/order-status"
                            className={`sidebar-nav-link ${location.pathname === "/pos/order-status" ? "active" : ""
                              }`}
                          >
                            <p>Order Status</p>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                : ""} */}
              {/* pos end  */}

              {/* Reports start */}
              {MatchPermission(["PO Reports", "SO Reports", "Inventory Reports"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <Link
                      to="/reports"
                      className={`sidebar-nav-link ${
                        location.pathname === "/reports" ||
                        location.pathname === "/report/pending-po-report" || 
                        location.pathname === "/report/month-wise-purchase-value" || 
                        location.pathname === "/report/stock-transfer-report" ||
                        location.pathname === "/report/item-wise-purchase-report" ||
                        location.pathname === "/report/customer-wise-sales-report" ||
                        location.pathname === "/report/item-wise-sales-report" ||
                        location.pathname === "/report/indent-requirement-report" ||
                        location.pathname === "/report/batch-expiry-report" || 
                        location.pathname === "/report/production/material-issue-report" ||
                        location.pathname === "/report/production/dispatch-report" ||
                        location.pathname === "/report/production/production-planning-vs-actual-report"
                         ? "active" : ""
                        }`}
                    >
                      <i className="sidebar-nav-icon fas fa-chart-area" />
                      <p>Reports</p>
                    </Link>
                  </div>
                  {/* <div
                    id="reports"
                    className={`accordion-collapse collapse ${location.pathname === "/reports"
                      ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        {MatchPermission(["Inventory Master Reports"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/reports"
                              className={`sidebar-nav-link ${location.pathname === "/reports" ? "active" : ""
                                }`}
                            >
                              <p>Inventory Master Reports</p>
                            </Link>
                          </li>
                          : ""}
                        {MatchPermission(["Purchase Reports"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/reports"
                              className={`sidebar-nav-link ${location.pathname === "/reports"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Purchase Reports</p>
                            </Link>
                          </li>
                          : ""}
                        {MatchPermission(["Sales Reports"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/reports"
                              className={`sidebar-nav-link ${location.pathname === "/reports"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Sales Reports</p>
                            </Link>
                          </li>
                          : ""}
                        {MatchPermission(["Combined Reports"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/reports"
                              className={`sidebar-nav-link ${location.pathname === "/reports"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Combined Reports</p>
                            </Link>
                          </li>
                          : ""}
                      </ul>


                    </div>
                  </div> */}
                </div>
                : ""}
              {/*  Reports end  */}
              {/* Settings start */}
              {MatchPermission(["Settings"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/department" ||
                        location.pathname === "/notification-setting" ||
                        location.pathname === "/company-info" ||
                        location.pathname === "/office-timing" ||
                        location.pathname === "/settings/inventory/warehouses" ||
                        location.pathname === "/settings/inventory/barcode" ||
                        location.pathname === "/settings/gst/eway-bill-api-account" ||
                        location.pathname === "/settings/inventory/warehouses" ||
                        location.pathname === "/settings/inventory/barcode" ||
                        location.pathname === "/settings/inventory/master-uom" ||
                        location.pathname === "//settings/inventory/entry-into-store" ||
                        location.pathname === "/settings/inventory/default-approval" ||
                        location.pathname === "/settings/gst/eway-bill-api-account" ||
                        location.pathname === "/settings/gst/einvoice-api-account" ||
                        location.pathname === "settings/gst/einvoice-api-account" ||
                        location.pathname === "/settings/product-attributes"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Settings"
                      aria-expanded="false"
                      aria-controls="Settings"
                    >
                      <i className="sidebar-nav-icon fas fa-cog" />
                      <p>Settings</p>
                    </button>
                  </div>
                  <div
                    id="Settings"
                    className={`accordion-collapse collapse ${
                        location.pathname === "/notification-setting" ||
                        location.pathname === "/department" ||
                        location.pathname === "/office-timing" ||
                        location.pathname === "/modules" ||
                        location.pathname === "/role" ||
                        location.pathname === "/permission" ||
                        location.pathname === "/settings/inventory/warehouses" ||
                        location.pathname === "/settings/inventory/barcode" ||
                        location.pathname === "/settings/inventory/master-uom" ||
                        location.pathname === "/settings/inventory/default-approval" ||
                        location.pathname === "/settings/inventory/entry-into-store" ||
                        location.pathname === "/settings/gst/eway-bill-api-account" ||
                        location.pathname === "/settings/gst/einvoice-api-account" ||
                        location.pathname === "/company-info" ||
                        location.pathname === "/settings/user" ||
                        location.pathname === "/settings/product-attributes" ||
                        location.pathname === "/settings/brands"

                        ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        {MatchPermission(["General Settings"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/company-info"
                              className={`sidebar-nav-link ${location.pathname === "/company-info" ? "active" : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>General Settings</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["User List"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/settings/user"
                              className={`sidebar-nav-link ${location.pathname === "/settings/user"
                                ? "active"
                                : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>User List</p>
                            </Link>
                          </li>
                          : null}
                        {/* {MatchPermission(["Whatsapp Setting"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/whatsapp-setting"
                              className={`sidebar-nav-link ${location.pathname === "/whatsapp-setting"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Whatsapp Setting</p>
                            </Link>
                          </li>
                          : null} */}
                        {/* {MatchPermission(["Notification Setting"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/notification-setting"
                              className={`sidebar-nav-link ${location.pathname === "/notification-setting"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Notification Setting</p>
                            </Link>
                          </li>
                          : null} */}
                        {MatchPermission(["Department"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/department"
                              className={`sidebar-nav-link ${location.pathname === "/department" ? "active" : ""
                                }`}
                            >
                              <p>Department</p>
                            </Link>
                          </li>
                          : null}
                        {/* {MatchPermission(["Office Timing"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/office-timing"
                              className={`sidebar-nav-link ${location.pathname === "/office-timing" ? "active" : ""
                                }`}
                            >
                              <p>Office Timing</p>
                            </Link>
                          </li>
                          : null} */}
                        {MatchPermission(["Modules"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/modules"
                              className={`sidebar-nav-link ${location.pathname === "/modules" ? "active" : ""
                                }`}
                            >
                              <p>Modules</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Role"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/role"
                              className={`sidebar-nav-link ${location.pathname === "/role" ? "active" : ""
                                }`}
                            >
                              <p>Role</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Permission"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/permission"
                              className={`sidebar-nav-link ${location.pathname === "/permission" ? "active" : ""
                                }`}
                            >
                              <p>Permission</p>
                            </Link>
                          </li>
                          : null}
                        <li className="sidebar-item">
                          <Link
                            to="/settings/product-attributes"
                            className={`sidebar-nav-link ${location.pathname === "/settings/product-attributes" ? "active" : ""}`}
                          >
                            <p>Product Attributes</p>
                          </Link>
                        </li>
                      </ul>

                      <div
                        className="accordion menu-accordian"
                        id="submenuAccordian"
                      >
                        {/* management */}
                        {MatchPermission(["Inventory Settings"]) ?
                          <div className="accordion-header sidebar-item">
                            <button
                              className={`accordion-button submenu ${location.pathname === "/settings/inventory/barcode" ||
                                location.pathname === "/settings/inventory/master-uom" ||
                                location.pathname === "/settings/inventory/entry-into-store" ||
                                location.pathname === "/settings/inventory/default-approval" ||
                                location.pathname === "/settings/inventory/warehouses" ||
                                location.pathname === "/settings/brands"
                                ? "" : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#Inventorysettings"
                              aria-expanded="false"
                              aria-controls="Inventorysettings"
                            >
                              <p>Inventory</p>
                            </button>
                          </div>
                          : ""}
                        {MatchPermission(["Inventory Settings"]) ?
                          <div
                            id="Inventorysettings"
                            className={`accordion-collapse collapse ${
                              location.pathname === "/settings/inventory/master-uom" ||
                              location.pathname === "/settings/inventory/entry-into-store" ||
                              location.pathname === "/settings/inventory/default-approval" ||
                              location.pathname === "/settings/inventory/warehouses" ||
                              location.pathname === "/settings/brands"
                              ? "show" : ""
                              } `}
                            data-bs-parent="#submenuAccordian"
                          >
                            <div className="accordion-body">
                              <ul className="sidebar-submenu">
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/warehouses"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/warehouses"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Stores</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/barcode"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/barcode"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Barcode</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/master-uom"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/master-uom"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Unit of Measurement</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/brands"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/brands"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Brands</p>
                                  </Link>
                                </li>
                                {/* <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/entry-into-store"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/entry-into-store"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Document Setting</p>
                                  </Link>
                                </li> */}

                                {/* <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/default-approval"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/default-approval"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Default Approval</p>
                                  </Link>
                                </li> */}

                              </ul>
                            </div>
                          </div>
                          : ""}
                        {/* management end*/}
                        {/* GST API */}
                        {/* {MatchPermission(["GST API Settings"]) ?
                          <div className="accordion-header sidebar-item">
                            <button
                              className={`accordion-button submenu ${location.pathname === "/settings/gst/einvoice-api-account" ||
                                location.pathname === "/settings/gst/eway-bill-api-account" ||
                                location.pathname === "/gst"
                                ? "" : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#GST"
                              aria-expanded="false"
                              aria-controls="GST"
                            >
                              <p>GST API</p>
                            </button>
                          </div>
                          : ""} */}
                        {MatchPermission(["GST API Settings"]) ?
                          <div
                            id="GST"
                            className={`accordion-collapse collapse ${location.pathname === "/settings/gst/eway-bill-api-account" ||
                              location.pathname === "/settings/gst/eway-bill-api-account" ||
                              location.pathname === "/settings/gst/einvoice-api-account" ||
                              location.pathname === "/settings/gst/einvoice-api-account"
                              ? "show" : ""
                              } `}
                            data-bs-parent="#submenuAccordian"
                          >
                            <div className="accordion-body">
                              <ul className="sidebar-submenu">
                                {/* <li className="sidebar-item">
                                  <Link
                                    to="/settings/gst/eway-bill-api-account"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/gst/eway-bill-api-account"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>E-Way Bill API</p>
                                  </Link>
                                </li> */}
                                {/* <li className="sidebar-item">
                                  <Link
                                    to="/settings/gst/einvoice-api-account"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/gst/einvoice-api-account"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>E Invoice API</p>
                                  </Link>
                                </li> */}


                              </ul>
                            </div>
                          </div>
                          : ""}
                        {/* GST API end*/}
                        {/* POS */}
                        {/* {MatchPermission(["POS Settings"]) ?
                          <div className="accordion-header sidebar-item">
                            <button
                              className={`accordion-button submenu ${location.pathname === "/settings/pos/gateway" || location.pathname === "/settings/pos/order"
                                ? "" : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#POS"
                              aria-expanded="false"
                              aria-controls="POS"
                            >
                              <p>POS</p>
                            </button>
                          </div>
                          : ""}
                        {MatchPermission(["POS Settings"]) ?
                          <div
                            id="POS"
                            className={`accordion-collapse collapse ${location.pathname === "/settings/pos/gateway" || location.pathname === "/settings/pos/order"
                              ? "show" : ""
                              } `}
                            data-bs-parent="#submenuAccordian"
                          >
                            <div className="accordion-body">
                              <ul className="sidebar-submenu">

                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/pos/gateway"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/pos/gateway"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Payment Gateway</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/pos/order"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/pos/order"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Order Settings</p>
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                          : ""} */}
                        
                          
                        {user.position === "Owner" && user.email === 'sumit.econstra@gmail.com' ?
                        <ul className="sidebar-submenu">
                          <li className="sidebar-item">
                            <Link
                              to="/company-management"
                              className={`sidebar-nav-link ${location.pathname === "/company-management" ? "active" : ""}`}
                            >
                              <p>Company Management</p>
                            </Link>
                          </li>
                        </ul>
                        :""}

                        {/* POS end*/}
                      </div>

                    </div>
                  </div>
                </div>
              : ""}
              {/* Settings end  */}
              {/* <div className="accordion-item">
              <div className="accordion-header sidebar-item">
                <button
                  className={`accordion-button ${location.pathname === "/users" ? "" : "collapsed"
                    } sidebar-nav-link`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#menuuser"
                  aria-expanded="false"
                  aria-controls="menuuser"
                >
                  <i className="sidebar-nav-icon fas fa-user" />
                  <p>User</p>
                </button>
              </div>
              <div
                id="menuuser"
                className={`accordion-collapse collapse ${location.pathname === "/users" ? "show" : ""
                  } `}
                data-bs-parent="#menuAccordian"
              >
                <div className="accordion-body">
                  <ul className="sidebar-submenu">
                    <li className="sidebar-item">
                      <Link
                        to="/users"
                        className={`sidebar-nav-link ${location.pathname === "/users" ? "active" : ""
                          }`}
                      >                        
                        <p>All Users</p>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div> */}
            </div>
          </nav>
        </div>
        {/* /.sidebar-menu */}
        {/* profile info */}
        <div className="side_pro_info_wrap_2">
          <div className="side_pro_info">
            <div className="side_pro_info_logo">
              <img
                src="/assets/images/logo-econstra.png"
                alt="Logo"
                className="img-fluid"
              />
            </div>
            <div className="ps-2">
              <h5 className="comp_name_">EconStra Business Consultants LLP (Expand)</h5>
              <div className="plan_name__">
                <label>Current Plan</label>
                <div>Basic Plans</div>
              </div>
            </div>
          </div>
        </div>

        {/* profile info end*/}
      </div>
      {/* /.sidebar */}
    </aside>
  );
}

export default Sidebar;
