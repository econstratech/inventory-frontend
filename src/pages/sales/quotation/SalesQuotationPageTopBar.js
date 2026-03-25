import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { UserAuth } from '../../auth/Auth';

const SalesQuotationPageTopBar = () => {
  const location = useLocation();
  const { MatchPermission } = UserAuth();

  return (
    <>
      <div className="gthh-controller-bar">
        <ul className="gth-controller-view-block">
          {MatchPermission(["Quotations"]) ?
          <li>
            <Link className={`gth-controller-view-item ${location.pathname === "/sales/quotation" ||
              location.pathname === "/sales/quotation/rejected"
              ? "active" : ""
              } `} to="/sales/quotation">
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
                <path d="m14 7v-6.54a6.977 6.977 0 0 1 2.465 1.59l3.484 3.486a6.954 6.954 0 0 1 1.591 2.464h-6.54a1 1 0 0 1 -1-1zm8 3.485v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515c.163 0 .324.013.485.024v6.976a3 3 0 0 0 3 3h6.976c.011.161.024.322.024.485zm-8 8.515a1 1 0 0 0 -1-1h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1zm3-4a1 1 0 0 0 -1-1h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 1-1z" />
              </svg>

              Active Orders
            </Link>
          </li>
          : ""}
          {MatchPermission(["Sales Orders"]) ?
          <li>
            <Link className={`gth-controller-view-item ${location.pathname === "/completed-sales-orders"
              ? "active" : ""
              } `} to="/completed-sales-orders">
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
                <path d="M24,19c0,1.654-1.346,3-3,3v1c0,.552-.447,1-1,1s-1-.448-1-1v-1h-.268c-1.067,0-2.063-.574-2.598-1.499-.277-.478-.113-1.089,.364-1.366,.48-.277,1.091-.113,1.366,.365,.179,.308,.511,.5,.867,.5h2.268c.552,0,1-.449,1-1,0-.378-.271-.698-.644-.76l-3.041-.507c-1.342-.223-2.315-1.373-2.315-2.733,0-1.654,1.346-3,3-3v-1c0-.552,.447-1,1-1s1,.448,1,1v1h.268c1.067,0,2.063,.575,2.598,1.5,.277,.478,.113,1.089-.364,1.366-.481,.276-1.091,.112-1.366-.365-.179-.309-.511-.5-.867-.5h-2.268c-.552,0-1,.449-1,1,0,.378,.271,.698,.644,.76l3.041,.507c1.342,.223,2.315,1.373,2.315,2.733ZM13,8h6.54c-.347-.913-.88-1.753-1.591-2.464l-3.484-3.486c-.712-.711-1.552-1.244-2.465-1.59V7c0,.551,.448,1,1,1Zm3.869,15.637c-.578,.234-1.208,.363-1.869,.363H5c-2.757,0-5-2.243-5-5V5C0,2.243,2.243,0,5,0h4.515c.163,0,.324,.013,.485,.024V7c0,1.654,1.346,3,3,3h4.172c-.045,.127-.082,.257-.11,.391-1.23,.519-2.211,1.518-2.708,2.76-.267-.097-.555-.151-.855-.151H6.5c-1.378,0-2.5,1.122-2.5,2.5v2c0,1.378,1.122,2.5,2.5,2.5h7c.171,0,.338-.017,.499-.05-.01,.54,.127,1.074,.404,1.552,.566,.98,1.444,1.724,2.466,2.136ZM4,6c0,.552,.448,1,1,1h2c.552,0,1-.448,1-1s-.448-1-1-1h-2c-.552,0-1,.448-1,1Zm0,4c0,.552,.448,1,1,1h2c.552,0,1-.448,1-1s-.448-1-1-1h-2c-.552,0-1,.448-1,1Zm2.5,5c-.276,0-.5,.224-.5,.5v2c0,.276,.224,.5,.5,.5h7c.276,0,.5-.224,.5-.5v-2c0-.276-.224-.5-.5-.5H6.5Z" />
              </svg>

              Completed Orders
            </Link>
          </li>
          : null }
          {MatchPermission(["Dispatch"]) ?
          <li><Link className={`gth-controller-view-item ${location.pathname === "/sales-orders/dispatch/order-dispatch" ||
            location.pathname === "/sales-orders/dispatch/order-dispatch"
            ? "active" : ""
            } `} to="/sales-orders/dispatch/order-dispatch">            
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"
              width={14}
              height={14}
              fill="currentColor"
              className='me-1'
            >
              <path d="m4.5,11H1c-.553,0-1-.448-1-1s.447-1,1-1h3.5c.553,0,1,.448,1,1s-.447,1-1,1ZM10.154,2c0-.552-.447-1-1-1H1c-.553,0-1,.448-1,1s.447,1,1,1h8.154c.553,0,1-.448,1-1Zm-2,4c0-.552-.447-1-1-1H1c-.553,0-1,.448-1,1s.447,1,1,1h6.154c.553,0,1-.448,1-1Zm6.903,14c-.034.162-.058.328-.058.5,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.172-.024-.338-.058-.5h-4.885Zm-.058-2V6c0-2.009-1.185-3.741-2.895-4.536.032.174.049.353.049.536,0,1.382-.939,2.547-2.212,2.894.136.342.212.715.212,1.106,0,1.597-1.254,2.905-2.828,2.995.112.314.174.653.174,1.005,0,1.654-1.346,3-3,3H1c-.351,0-.687-.061-1-.172v1.172c0,2.209,1.791,4,4,4h11Zm-10.942,2c-.034.162-.058.328-.058.5,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.172-.024-.338-.058-.5h-4.885Zm12.942-2h3c2.209,0,4-1.791,4-4v-1h-7v5Zm2-13h-2v6h7v-1c0-2.761-2.239-5-5-5Z" />
            </svg>

            Dispatch </Link></li>
            : ""}
        </ul>
      </div>
    </>
  )
}

export default SalesQuotationPageTopBar