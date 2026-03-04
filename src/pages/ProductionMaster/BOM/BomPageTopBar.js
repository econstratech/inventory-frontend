import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const BomPageTopBar = () => {
  const location = useLocation();

  return (
    <>
      <div className="gthh-controller-bar">
        <ul className="gth-controller-view-block">
          <li><Link className={`gth-controller-view-item ${location.pathname === "/production/bom" ||
            location.pathname === "/production/bom-draft" ||
            location.pathname === "/production/bom-published" ||
            location.pathname === "/production/bom-delete"
            // location.pathname === "/operation/create-rfq-management" 

            ? "active" : ""
            } `} to="/production/bom">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              width={14}
              height={14}
              className="me-2"
              id="Layer_1"
              data-name="Layer 1"
              viewBox="0 0 24 24"
            >
              <path d="m7,10H3c-1.657,0-3,1.343-3,3v8c0,1.657,1.343,3,3,3h4c1.657,0,3-1.343,3-3v-8c0-1.657-1.343-3-3-3Zm-3.5,11h-.5c-.552,0-1-.448-1-1s.448-1,1-1h.5c.552,0,1,.448,1,1s-.448,1-1,1Zm0-3h-.5c-.552,0-1-.448-1-1s.448-1,1-1h.5c.552,0,1,.448,1,1s-.448,1-1,1Zm3.5,3h-.5c-.552,0-1-.448-1-1s.448-1,1-1h.5c.552,0,1,.448,1,1s-.448,1-1,1Zm0-3h-.5c-.552,0-1-.448-1-1s.448-1,1-1h.5c.552,0,1,.448,1,1s-.448,1-1,1Zm0-3H3c-.552,0-1-.448-1-1s.448-1,1-1h4c.552,0,1,.448,1,1s-.448,1-1,1ZM24,3c0,.552-.448,1-1,1h-12c-.552,0-1-.448-1-1v-.5c0-.924-.28-1.784-.76-2.5h11.76c1.657,0,3,1.343,3,3Zm-3,3v14c0,2.209-1.791,4-4,4h-6.003c.629-.836,1.003-1.875,1.003-3v-8c0-2.757-2.243-5-5-5H3V2.643C3,1.335,3.941.143,5.242.013c1.496-.15,2.758,1.021,2.758,2.487v.5c0,1.657,1.343,3,3,3h10Z" />
            </svg>

            Bill of Materials</Link></li>


          <li><Link className={`gth-controller-view-item ${
            location.pathname === "/production/all-production-process" ||
            location.pathname === "/production/production-process-pending-list" ||
            location.pathname === "/production/production-approved-list" ||
            location.pathname === "/production/production-test-pending-list" ||
            location.pathname === "/production/production-canceled-list" ||
            location.pathname === "/production/production-repair-pending-list"
              ? "active" : ""
            } `} to="/production/all-production-process">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              width={14}
              height={14}
              className="me-2"
              id="Layer_1"
              data-name="Layer 1"
              viewBox="0 0 24 24"
            >
              <path d="M21,15H10.26c-.8,0-1.55-.31-2.12-.88l-1.42-1.41c-.19-.19-.29-.44-.29-.71s.11-.52,.29-.71l1.42-1.41c.57-.57,1.32-.88,2.12-.88h10.74c1.65,0,3,1.35,3,3s-1.35,3-3,3Zm-12.15-4.41h0Zm9.15-4.59h-7.74c-.8,0-1.55-.31-2.12-.88l-1.42-1.41c-.19-.19-.29-.44-.29-.71s.11-.52,.29-.71l1.42-1.41c.57-.57,1.32-.88,2.12-.88h7.74c1.65,0,3,1.35,3,3s-1.35,3-3,3ZM8.85,1.59h0Zm7.15,22.41h-5.74c-.8,0-1.55-.31-2.12-.88l-1.42-1.41c-.19-.19-.29-.44-.29-.71s.11-.52,.29-.71l1.42-1.41c.57-.57,1.32-.88,2.12-.88h5.74c1.65,0,3,1.35,3,3s-1.35,3-3,3Zm-7.15-4.41h0Zm-6.85-.59c-1.1,0-2,.9-2,2s.9,2,2,2,2-.9,2-2-.9-2-2-2Zm0-9c-1.1,0-2,.9-2,2s.9,2,2,2,2-.9,2-2-.9-2-2-2ZM2,1C.9,1,0,1.9,0,3s.9,2,2,2,2-.9,2-2S3.1,1,2,1Z" />
            </svg>

            All Production Process</Link></li>


          <li><Link className={`gth-controller-view-item ${            
            location.pathname === "/production/work-orders" ||
            location.pathname === "/production/work-orders-open" ||
            location.pathname === "/production/work-orders-planned" || 
            location.pathname === "/production/work-orders-pending" || 
            location.pathname === "/production/work-orders-wip" || 
            location.pathname === "/production/work-orders-completed"
              ? "active" : ""
            } `} to="/production/work-orders">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              data-name="Layer 1"
              viewBox="0 0 24 24"
              fill="currentColor"
              width={14}
              height={14}
              className="me-2"
            >
              <path d="M14,7V.46c.913,.346,1.753,.879,2.465,1.59l3.484,3.486c.712,.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm1.5,8h-7c-.276,0-.5,.224-.5,.5v2c0,.276,.224,.5,.5,.5h7c.276,0,.5-.224,.5-.5v-2c0-.276-.224-.5-.5-.5Zm6.5-4.515v8.515c0,2.757-2.243,5-5,5H7c-2.757,0-5-2.243-5-5V5C2,2.243,4.243,0,7,0h4.515c.163,0,.324,.013,.485,.024V7c0,1.654,1.346,3,3,3h6.976c.011,.161,.024,.322,.024,.485ZM6,6c0,.552,.448,1,1,1h2c.552,0,1-.448,1-1s-.448-1-1-1h-2c-.552,0-1,.448-1,1Zm0,4c0,.552,.448,1,1,1h2c.552,0,1-.448,1-1s-.448-1-1-1h-2c-.552,0-1,.448-1,1Zm12,5.5c0-1.378-1.122-2.5-2.5-2.5h-7c-1.378,0-2.5,1.122-2.5,2.5v2c0,1.378,1.122,2.5,2.5,2.5h7c1.378,0,2.5-1.122,2.5-2.5v-2Z" />
            </svg>

            Work Orders</Link></li>

          {/* <li><Link className={`gth-controller-view-item ${location.pathname === "/production/sub-contract" ||
             location.pathname === "/production/sub-contract-approve-pending" || 
             location.pathname === "/production/sub-contract-approve" ||
             location.pathname === "/production/sub-contract-canceled" 
            ? "active" : ""
            } `} to="/production/sub-contract">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              data-name="Layer 1"
              viewBox="0 0 24 24"
              fill='currentColor' 
              width="14" 
              height="14" 
              className='me-2'
            >
              <path d="m15,24c0,.009,0,.017,0,.026h-6.001c0-.009,0-.017,0-.026,0-1.654,1.346-3,3-3s3,1.346,3,3Zm-.077-15.974h6.54c-.347-.913-.88-1.753-1.591-2.464l-3.484-3.486c-.712-.711-1.552-1.244-2.465-1.59v6.54c0,.551.448,1,1,1Zm7,2.485v8.515c0,2.731-2.202,4.958-4.924,4.999,0-.008,0-.016,0-.025,0-2.757-2.243-5-5-5s-5,2.243-5,5c0,.009,0,.017,0,.026h-.078c-2.757,0-5-2.243-5-5V5.026C1.923,2.269,4.166.026,6.923.026h4.515c.163,0,.324.013.485.024v6.976c0,1.654,1.346,3,3,3h6.976c.011.161.024.322.024.485Zm-6.423,3.989c0-1.93-1.57-3.5-3.5-3.5s-3.5,1.57-3.5,3.5,1.57,3.5,3.5,3.5,3.5-1.57,3.5-3.5Zm-3.5-1.5c-.827,0-1.5.673-1.5,1.5s.673,1.5,1.5,1.5,1.5-.673,1.5-1.5-.673-1.5-1.5-1.5Z" />
            </svg>

            Sub Contract</Link></li> */}
        </ul>
      </div>
    </>
  )
}

export default BomPageTopBar