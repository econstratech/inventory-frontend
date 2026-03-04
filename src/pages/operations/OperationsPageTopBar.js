import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { hasPermission } from '../../utils/permission';

const OperationsPageTopBar = () => {
  const location = useLocation();
  return (
    <>
      <div className="gthh-controller-bar">
        <ul className="gth-controller-view-block">
          {hasPermission("Create RFQ") ?
          <li><Link className={`gth-controller-view-item ${location.pathname === "/operation/create-rfq-active" ||
            location.pathname === "/operation/create-rfq-reviewing" ||
            location.pathname === "/operation/approved-from-admin" ||
            location.pathname === "/operation/create-rfq-billed" ||
            location.pathname === "/operation/create-rfq-management"

            ? "active" : ""
            } `} to="/operation/create-rfq-active">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              viewBox="0 0 24 24"
              data-name="Layer 1"
              width={14}
              height={14}
              fill="currentColor"
              className='me-1'
            >
              <path d="m14 7v-6.54a6.977 6.977 0 0 1 2.465 1.59l3.484 3.486a6.954 6.954 0 0 1 1.591 2.464h-6.54a1 1 0 0 1 -1-1zm8 3.485v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515c.163 0 .324.013.485.024v6.976a3 3 0 0 0 3 3h6.976c.011.161.024.322.024.485zm-6 6.515a1 1 0 0 0 -1-1h-2v-2a1 1 0 0 0 -2 0v2h-2a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0v-2h2a1 1 0 0 0 1-1z" />
            </svg>

            Active PO</Link></li>
            : null }
          {/* {MatchPermission(["Purchase Order"]) ?
          <li>
            <Link className={`gth-controller-view-item ${location.pathname === "/operation/purchase-orders/received-done" ||
            location.pathname === "/operation/purchase-orders/done" ||
            location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
            location.pathname === "/operation/purchase-orders/sales-orders"
            ? "active" : ""
            } `} to="/operation/purchase-orders/received-done">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Filled"
              viewBox="0 0 24 24"
              width={14}
              height={14}
              fill="currentColor"
              className='me-1'
            >
              <path d="M21,6H18A6,6,0,0,0,6,6H3A3,3,0,0,0,0,9V19a5.006,5.006,0,0,0,5,5H16.686A6,6,0,1,1,24,14.537V9A3,3,0,0,0,21,6ZM8,6a4,4,0,0,1,8,0Z" />
              <path d="M23,18H21V16a1,1,0,0,0-2,0v2H17a1,1,0,0,0,0,2h2v2a1,1,0,0,0,2,0V20h2a1,1,0,0,0,0-2Z" />
            </svg>


            Pending Approval</Link>
            </li>
            : null } */}
            {hasPermission("Completed Orders") ?
          <li>
            <Link className={`gth-controller-view-item ${location.pathname === "/operation/complete-orders/received-done" ||
            location.pathname === "/operation/complete-orders/nothing-to-bill"
            ? "active" : ""
            } `} to="/operation/complete-orders/received-done">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              data-name="Layer 1"
              viewBox="0 0 24 24"
              width={14}
              height={14}
              fill="currentColor"
              className='me-1'
            >
              <path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm6.2,10.512l-4.426,4.345c-.783.768-1.791,1.151-2.8,1.151-.998,0-1.996-.376-2.776-1.129l-1.899-1.867c-.394-.387-.399-1.02-.012-1.414.386-.395,1.021-.4,1.414-.012l1.893,1.861c.776.75,2.001.746,2.781-.018l4.425-4.344c.393-.388,1.024-.381,1.414.013.387.394.381,1.027-.014,1.414Z" />
            </svg>

            Completed Orders</Link></li>
            : null }
            {hasPermission("Rejected Orders") ?
          <li><Link className={`gth-controller-view-item ${location.pathname === "/operation/rejected-orders/rejected"
            // location.pathname === "/approve-po/approval-Active"
            ? "active" : ""
            } `} to="/operation/rejected-orders/rejected">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              version="1.1"
              id="Capa_1"
              x="0px"
              y="0px"
              viewBox="0 0 512 512"
              style={{ enableBackground: "new 0 0 512 512" }}
              xmlSpace="preserve"
              width={14}
              height={14}
              fill="currentColor"
              className='me-1'
            >
              <g>
                <path d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256C511.847,114.678,397.322,0.153,256,0z    M341.333,311.189c8.669,7.979,9.229,21.475,1.25,30.144c-7.979,8.669-21.475,9.229-30.144,1.25c-0.434-0.399-0.85-0.816-1.25-1.25   L256,286.165l-55.168,55.168c-8.475,8.185-21.98,7.95-30.165-0.525c-7.984-8.267-7.984-21.373,0-29.64L225.835,256l-55.168-55.168   c-8.185-8.475-7.95-21.98,0.525-30.165c8.267-7.984,21.373-7.984,29.64,0L256,225.835l55.189-55.168   c7.979-8.669,21.475-9.229,30.144-1.25c8.669,7.979,9.229,21.475,1.25,30.144c-0.399,0.434-0.816,0.85-1.25,1.25L286.165,256   L341.333,311.189z" />
              </g>
            </svg>

            Rejected Orders</Link></li>
            : null }
        </ul>
      </div>
    </>
  )
}

export default OperationsPageTopBar