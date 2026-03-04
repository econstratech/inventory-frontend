import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const GstApiTopBar = () => {
  const location = useLocation();

  return (
    <>
      <div className="gthh-controller-bar">
        <ul className="gth-controller-view-block">
          <li><Link className={`gth-controller-view-item ${location.pathname === "/settings/gst/eway-bill-api-account"


            ? "active" : ""
            } `} to="/settings/gst/eway-bill-api-account">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"
              width={14}
              height={14}
              fill="currentColor"
              className='me-1'>
              <path d="m7.5,10H2.5c-1.378,0-2.5,1.122-2.5,2.5v11.5h10v-11.5c0-1.378-1.122-2.5-2.5-2.5Zm-3.5,12h-2v-2h2v2Zm0-4h-2v-2h2v2Zm4,4h-2v-2h2v2Zm0-4h-2v-2h2v2Zm0-4H2v-2h6v2ZM21,0h-11.76c.48.716.76,1.576.76,2.5v1.5h14v-1c0-1.657-1.343-3-3-3Zm-13,2.5C8,1.034,6.739-.137,5.242.013c-1.301.13-2.242,1.322-2.242,2.63v5.357h5c2.209,0,4,1.791,4,4v12h5c2.209,0,4-1.791,4-4V6h-13v-3.5Z" />
            </svg>
            E-way bill API</Link></li>



          <li><Link className={`gth-controller-view-item ${location.pathname === "/settings/gst/einvoice-api-account"

            ? "active" : ""
            } `} to="/settings/gst/einvoice-api-account">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width={14}
              height={14}
              fill="currentColor"
              className='me-1'>
              <path d="m6,14.5c0,.496-.404.9-.9.9h-.5v-1.8h.5c.496,0,.9.404.9.9Zm3.612,2.501h1.261l-.638-3.295-.624,3.295Zm5.388-9.001h6.54c-.347-.913-.88-1.753-1.591-2.464l-3.484-3.486c-.712-.711-1.552-1.244-2.465-1.59v6.54c0,.551.448,1,1,1Zm7,2.485v8.515c0,2.757-2.243,5-5,5H7c-2.757,0-5-2.243-5-5V5C2,2.243,4.243,0,7,0h4.515c.163,0,.324.013.485.024v6.976c0,1.654,1.346,3,3,3h6.976c.011.161.024.322.024.485Zm-14.401,4.063c.026-1.401-1.154-2.548-2.556-2.548h-1.244c-.442,0-.8.358-.8.8v6.4c0,.442.358.8.8.8s.8-.358.8-.8v-2.2h.5c1.365,0,2.474-1.093,2.5-2.452Zm5.224,4.592l-1.221-5.947c-.12-.668-.589-1.192-1.346-1.192s-1.281.587-1.385,1.167l-1.2,5.976c-.089.443.25.857.702.857.345,0,.641-.246.704-.585l.166-.889h2.006l.157.883c.061.342.358.591.705.591h.01c.453,0,.793-.416.701-.86Zm2.577-6.34c0-.442-.358-.8-.8-.8s-.8.358-.8.8v6.4c0,.442.358.8.8.8s.8-.358.8-.8v-6.4Zm5.6,1.5c0-1.27-1.03-2.3-2.3-2.3h-1.5c-.442,0-.8.358-.8.8v6.4c0,.442.358.8.8.8h1.5c1.27,0,2.3-1.03,2.3-2.3v-3.4Zm-2.3-.7c-.386,0-.7,0-.7,0v4.802s.314,0,.7,0,.7-.314.7-.7v-3.4c0-.386-.314-.7-.7-.7Z" />
            </svg>
            E-invoice API </Link></li>



        </ul>
      </div >
    </>
  )
}

export default GstApiTopBar