import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const InventoryMasterPageTopBar = () => {
  const location = useLocation();

  return (
    <>
      <div className="gthh-controller-bar">
        <ul className="gth-controller-view-block">
          <li><Link className={`gth-controller-view-item ${location.pathname === "/inventory/inventory-master" ||
            location.pathname === "/inventory/barcode" ||
            location.pathname === "/inventory/stock_movement" ||
            location.pathname === "/inventory/inventory_approval" ||
            location.pathname === "/inventory/floor_manager"

            ? "active" : ""
            } `} to="/inventory/inventory-master">
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
              <path d="M22,18.184V16a3,3,0,0,0-3-3H13V9.9a5,5,0,1,0-2,0V13H5a3,3,0,0,0-3,3v2.184a3,3,0,1,0,2,0V16a1,1,0,0,1,1-1h6v3.184a3,3,0,1,0,2,0V15h6a1,1,0,0,1,1,1v2.184a3,3,0,1,0,2,0Z" />
            </svg>

            Item Master</Link></li>

          {/* <li><Link className={`gth-controller-view-item ${location.pathname === "/products"

            ? "active" : ""
            } `} to="/products">
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
              <path d="M11,13H3c-1.657,0-3,1.343-3,3v5c0,1.657,1.343,3,3,3H11V13Zm-7.5,4h0c0-.552,.448-1,1-1h2c.552,0,1,.448,1,1h0c0,.552-.448,1-1,1h-2c-.552,0-1-.448-1-1Zm17.5-4H13v11h8c1.657,0,3-1.343,3-3v-5c0-1.657-1.343-3-3-3Zm-1.5,5h-2c-.552,0-1-.448-1-1h0c0-.552,.448-1,1-1h2c.552,0,1,.448,1,1h0c0,.552-.448,1-1,1ZM15,0h-6c-1.657,0-3,1.343-3,3V11h12V3c0-1.657-1.343-3-3-3Zm-2,5h-2c-.552,0-1-.448-1-1h0c0-.552,.448-1,1-1h2c.552,0,1,.448,1,1h0c0,.552-.448,1-1,1Z" />
            </svg>


            Products</Link></li> */}

          <li><Link className={`gth-controller-view-item ${location.pathname === "/category"

            ? "active" : ""
            } `} to="/category"><i className="fas fa-shapes "></i>category</Link></li>



        </ul>
      </div>
    </>
  )
}

export default InventoryMasterPageTopBar