
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PrivateAxios } from '../../environment/AxiosInstance';
import { UserAuth } from '../auth/Auth';
  
function PosThankYouPage() {
    const { getGeneralSettingssymbol } = UserAuth;
    useEffect(() => {
        
        const thankYouElement = document.querySelector('.thank-you-wrapper');
        if (thankYouElement) {
            document.body.classList.add('thank-you-body');
        } else {
            document.body.classList.remove('thank-you-body');
        }

        // Optional cleanup to remove the class when the component unmounts
        return () => {
            document.body.classList.remove('thank-you-body');
        };
    }, []);


    const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await PrivateAxios.get(`/pos/order/${orderId}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error("Error fetching order", err);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);


  if (!order) return <p>Loading order details...</p>;

    return (
        <>
            <div className='thank-you-wrapper' style={{
                padding: 30
            }}>

                <div className='thank-you-page'>
                    <div className='row justify-content-center'>
                        <div className='col-xl-5 col-lg-7 col-md-6 col-12'>
                            <div className='card mb-0'>
                                <div className='card-body'>
                                    <h1 className='fs-3 text-center fw-bold mb-3 text-success'>Thank you, your order has been placed.</h1>
                                    <div className='thank-you-page-image mb-3'>
                                        <svg
                                            id="Layer_1"
                                            data-name="Layer 1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 123 94.09"
                                        >
                                            <defs>
                                                <style
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            "\n      .cls-1 {\n        fill: #2c51a3;\n      }\n\n      .cls-2 {\n        fill: #faaf4c;\n      }\n\n      .cls-3 {\n        fill: #f16279;\n      }\n\n      .cls-4 {\n        fill: #78c8aa;\n      }\n\n      .cls-5 {\n        fill: none;\n        stroke-width: 6px;\n      }\n\n      .cls-5, .cls-6 {\n        stroke: #000;\n        stroke-linecap: round;\n        stroke-miterlimit: 10;\n      }\n      \n      .mask {        \n        fill: black;\n        stroke: white;\n        stroke-width: 5px;\n      }\n      \n      #squiggle-mask-path {\n        stroke-dasharray: 80;\n        stroke-dashoffset: 80;\n        animation: animate-stroke 1s 1.1s forwards cubic-bezier(0,1,.53,1);\n      }\n      \n      #left-line-mask-path {\n        stroke-dasharray: 38;\n        stroke-dashoffset: -38;\n        animation: animate-stroke 1s 1.2s forwards cubic-bezier(0,1,.53,1);\n      }\n      \n      #right-line-mask-path {\n        stroke-dasharray: 38;\n        stroke-dashoffset: -38;\n        animation: animate-stroke 1s 1.2s forwards cubic-bezier(0,1,.53,1);\n      }\n      \n      @keyframes animate-stroke {\n        100% {\n          stroke-dashoffset: 0;\n        }\n      }\n      \n      \n      #mint-burst {\n        transform: translateY(70px);\n        animation: move-stars 1s 1s forwards cubic-bezier(0,1,.53,1);\n      }\n      \n      #yellow-burst {\n        transform: translate(40px, 10px);\n        animation: move-stars 1s 1s forwards cubic-bezier(0,1,.53,1);\n      }\n      \n      #red-burst {\n        transform: translate(-40px, 10px);\n        animation: move-stars 1s 1s forwards cubic-bezier(0,1,.53,1);\n      }\n            \n      #blue-star {\n        transform: translate(10px, 40px);\n        animation: move-stars 1s 1025ms forwards cubic-bezier(0,1,.53,1);\n        display: inherit;\n      }\n      \n      #yellow-star {\n        transform: translate(-10px, 45px);\n        animation: move-stars 1s 1050ms forwards cubic-bezier(0,1,.53,1);\n      }\n      \n      @keyframes move-stars {\n        100% {\n          transform: translateY(0);\n        }\n      }\n\n      .dot {\n        animation: reveal-dots 0.9s 1.2s both cubic-bezier(0,1,.53,1);\n        opacity: 0;\n        transform: translate(-5px, 10px);\n        \n      }\n      \n      .dot.left-side {\n        transform: translate(5px, 10px);\n      }\n      \n      @keyframes reveal-dots {\n        100% {\n          opacity: 1;\n          transform: translate(0, 0);\n        }\n      }\n    "
                                                    }}
                                                />
                                                <mask
                                                    id="squiggle-mask"
                                                    maskUnits="userSpaceOnUse"
                                                    maskContentUnits="userSpaceOnUse"
                                                >
                                                    <path
                                                        id="squiggle-mask-path"
                                                        className="cls-5 mask"
                                                        d="M56.26,90.4c-.7-3,10.21-7,10.4-11.46.63-3.89-11.14-7.69-9.57-11.62C59.22,62,67.43,60.8,66.86,55.4s-10-6.59-9.48-10.63c.3-2.59,5.8-5.38,9-8.33a5.79,5.79,0,0,0,1.91-3.54"
                                                        transform="translate(-2.7 -2.61)"
                                                    />
                                                </mask>
                                                <mask
                                                    id="left-line-mask"
                                                    maskUnits="userSpaceOnUse"
                                                    maskContentUnits="userSpaceOnUse"
                                                >
                                                    <path
                                                        id="left-line-mask-path"
                                                        className="cls-6 mask"
                                                        d="M25.78,62.5s18.38,14.73,15.9,30.91"
                                                        transform="translate(-2.7 -2.61)"
                                                    />
                                                </mask>
                                                <mask
                                                    id="right-line-mask"
                                                    maskUnits="userSpaceOnUse"
                                                    maskContentUnits="userSpaceOnUse"
                                                >
                                                    <path
                                                        id="right-line-mask-path"
                                                        className="cls-6 mask"
                                                        d="M95.12,64.5S78.32,73.83,76.8,94.2"
                                                        transform="translate(-2.7 -2.61)"
                                                    />
                                                </mask>
                                            </defs>
                                            <path
                                                id="blue-star"
                                                className="cls-1"
                                                d="M33.3,51.8a2,2,0,0,0,2-.7l3-3.9,4.9.3a2.38,2.38,0,0,0,1.2-.3,1.34,1.34,0,0,0,.6-.7,2,2,0,0,0-.1-2.1l-2.8-4,1.8-4.6a2,2,0,0,0-.4-2.1,1.92,1.92,0,0,0-2-.6l-4.7,1.4L33,31.3a2,2,0,0,0-2.1-.3,2.15,2.15,0,0,0-1.2,1.8l-.1,4.9-4.1,2.7h0a2,2,0,0,0-.9,1.9A2.1,2.1,0,0,0,25.9,44l4.6,1.6,1.3,4.7A2.07,2.07,0,0,0,33.3,51.8Z"
                                                transform="translate(-2.7 -2.61)"
                                            />
                                            <path
                                                id="yellow-star"
                                                className="cls-2"
                                                d="M91,32.9l-1.7-4.6A2.1,2.1,0,0,0,87.6,27a2,2,0,0,0-1.9.9L83.2,32l-4.9.2h0a2,2,0,0,0-1.7,1.2,2,2,0,0,0,.3,2.1L80,39.3,78.7,44a1.92,1.92,0,0,0,.6,2,2,2,0,0,0,2.1.4L86,44.6l4.1,2.7a1.8,1.8,0,0,0,1.2.3,1.61,1.61,0,0,0,.9-.3,1.89,1.89,0,0,0,1-1.9l-.3-4.9,3.9-3a1.91,1.91,0,0,0,.7-2A2.07,2.07,0,0,0,96,34Z"
                                                transform="translate(-2.7 -2.61)"
                                            />
                                            <path
                                                id="yellow-burst"
                                                className="cls-2"
                                                d="M16.1,83.8a2,2,0,0,0,2.5-1.4l.7-2.4,1.8,1.8A2,2,0,1,0,24,79.1l-1.8-1.8,2.5-.6a2,2,0,1,0-.9-3.9l-2.5.6L22,71a2,2,0,1,0-3.9-1.1l-.7,2.4-1.8-1.8a2,2,0,0,0-2.9,2.7L14.5,75l-2.5.6a2,2,0,0,0,.9,3.9l2.5-.6-.7,2.4A2,2,0,0,0,16.1,83.8Z"
                                                transform="translate(-2.7 -2.61)"
                                            />
                                            <path
                                                id="red-burst"
                                                className="cls-3"
                                                d="M108.8,67.4a2,2,0,0,0-2.5,1.4l-.7,2.4-1.8-1.8a2,2,0,1,0-2.9,2.7l1.8,1.8-2.5.6a2,2,0,0,0,.9,3.9l2.5-.6-.7,2.4a2,2,0,0,0,3.9,1.1l.7-2.4,1.8,1.8a2,2,0,1,0,2.9-2.7l-1.8-1.8,2.5-.6a2,2,0,1,0-.9-3.9l-2.5.6.7-2.4A2.17,2.17,0,0,0,108.8,67.4Z"
                                                transform="translate(-2.7 -2.61)"
                                            />
                                            <path
                                                id="mint-burst"
                                                className="cls-4"
                                                d="M69.5,7,67,7.6l.7-2.4a2,2,0,0,0-1.4-2.5A1.84,1.84,0,0,0,63.9,4l-.7,2.4L61.4,4.6a2,2,0,0,0-2.8-.1,2,2,0,0,0-.1,2.8l1.8,1.8-2.5.6a2,2,0,0,0-1.5,2.4,2,2,0,0,0,2.4,1.5l2.5-.6-.7,2.4a2,2,0,0,0,3.9,1.1l.7-2.4,1.8,1.8a2,2,0,1,0,2.9-2.7L68,11.5l2.5-.6A2,2,0,0,0,72,8.5,2.06,2.06,0,0,0,69.5,7Z"
                                                transform="translate(-2.7 -2.61)"
                                            />
                                            <g id="squiggle" mask="url(#squiggle-mask)">
                                                <path
                                                    className="cls-1"
                                                    d="M56.3,92.3a2.09,2.09,0,0,0,2.1-2c0-1.6,1.6-2.5,4.1-3.8a18.17,18.17,0,0,0,4.1-2.7,6.44,6.44,0,0,0,2.1-4.6c.1-4-3.2-6-5.8-7.6-2.4-1.5-3.9-2.4-3.9-4s1.6-2.5,4.1-3.8c2.7-1.5,6.1-3.3,6.2-7.3s-3.2-6-5.8-7.6c-2.4-1.5-3.9-2.4-3.9-4s1.6-2.5,4.1-3.8c2.7-1.5,6.1-3.3,6.2-7.3a2.05,2.05,0,0,0-4.1-.1c0,1.6-1.6,2.5-4.1,3.8-2.7,1.5-6.1,3.3-6.2,7.3s3.2,6,5.8,7.6c2.4,1.5,3.9,2.4,3.9,4s-1.6,2.5-4.1,3.8c-2.7,1.5-6.1,3.3-6.2,7.3s3.2,6,5.8,7.6c2.4,1.5,3.9,2.4,3.9,4s-1.6,2.5-4.1,3.8c-2.7,1.5-6.1,3.3-6.2,7.3A2,2,0,0,0,56.3,92.3Z"
                                                    transform="translate(-2.7 -2.61)"
                                                />
                                            </g>
                                            <g id="right-line" mask="url(#right-line-mask)">
                                                <path
                                                    className="cls-1"
                                                    d="M94.7,64.5a2,2,0,0,0-2.8-.4c-15.9,11.6-17,27.4-17,28a2,2,0,0,0,1.9,2.1,2.46,2.46,0,0,0,1.5-.5,1.61,1.61,0,0,0,.6-1.3c0-.1,1-14.6,15.4-25A2.07,2.07,0,0,0,94.7,64.5Z"
                                                    transform="translate(-2.7 -2.61)"
                                                />
                                            </g>
                                            <g id="left-line" mask="url(#left-line-mask)">
                                                <path
                                                    className="cls-1"
                                                    d="M35.8,73.3l.2-.2a2,2,0,0,0,.2-2.6A43.54,43.54,0,0,0,29.4,63a1.94,1.94,0,0,0-2.8.2,2,2,0,0,0,.2,2.8A44.29,44.29,0,0,1,33,72.8,2,2,0,0,0,35.8,73.3Z"
                                                    transform="translate(-2.7 -2.61)"
                                                />
                                                <path
                                                    className="cls-4"
                                                    d="M41.8,94.4a2.05,2.05,0,0,0,2-2,35.88,35.88,0,0,0-3.3-14.5,2,2,0,0,0-3.6,1.6,32.83,32.83,0,0,1,3,12.7A1.93,1.93,0,0,0,41.8,94.4Z"
                                                    transform="translate(-2.7 -2.61)"
                                                />
                                            </g>
                                            <circle
                                                id="blue-dot-3"
                                                className="cls-1 dot left-side"
                                                cx={2}
                                                cy="89.29"
                                                r={2}
                                            />
                                            <circle
                                                id="red-dot-4"
                                                className="cls-3 dot left-side"
                                                cx="24.6"
                                                cy="89.79"
                                                r={2}
                                            />
                                            <circle id="blue-dot-4" className="cls-1 dot" cx={121} cy="86.49" r={2} />
                                            <circle
                                                id="blue-dot-5"
                                                className="cls-1 dot left-side"
                                                cx="42.3"
                                                cy="61.89"
                                                r={2}
                                            />
                                            <circle
                                                id="yellow-dot"
                                                className="cls-2 dot left-side"
                                                cx="31.1"
                                                cy="55.99"
                                                r={2}
                                            />
                                            <circle id="red-dot-1" className="cls-3 dot" cx={63} cy="25.59" r={2} />
                                            <circle
                                                id="mint-dot-1"
                                                className="cls-4 dot left-side"
                                                cx="43.2"
                                                cy="22.29"
                                                r={2}
                                            />
                                            <circle id="mint-dot-2" className="cls-4 dot" cx="96.3" cy="54.69" r={2} />
                                            <circle id="blue-dot-1" className="cls-1 dot" cx="84.3" cy="82.79" r={2} />
                                            <circle
                                                id="red-dot-2"
                                                className="cls-3 dot left-side"
                                                cx={17}
                                                cy="52.79"
                                                r={2}
                                            />
                                            <circle id="red-dot-3" className="cls-3 dot" cx="70.3" cy="73.89" r={2} />
                                            <circle id="blue-dot-2" className="cls-1 dot" cx="79.3" cy="54.29" r={2} />
                                        </svg>
                                    </div>
                                    <h5 className='fs-6 fw-bold text-center text-primary'><span>An Email confirmation has been sent to you.</span></h5>
                                    <hr className=' my-3' />
                                    <h5 className='fs-6 fw-medium '>Order No: <span className='fw-bold'>{order.order.custom_order_id}</span></h5>
                                    <h5 className='fs-6 fw-medium '>Payment ID: <span className='fw-bold'>{order.order.payment_id}</span></h5>
                                    <p className='fs-6 fw-medium '>Status: <span className='fw-bold'>{order.order.payment_status}</span></p>
                                   
                                    <div className='d-flex align-items-center mb-3'>
                                        <img src='assets/images/demo-logo.png' alt='item' className='img-fluid rounded-circle' width="60px" />
                                        <h5 className='fs-6 fw-medium '><span className='fw-bold'>{order.order.customer_name}</span></h5>
                                    </div>
                                    <h5 className='fs-6 fw-medium '>Order Amount(Incluv Tax): <span className='fw-bold'>{getGeneralSettingssymbol} {order.order.grand_total}</span></h5>
                                    <h5 className='fs-6 fw-medium '>Payment Method: <span className='fw-bold'>{order.order.payment_type ==='BankTransfer'? "Bank Transfer" : order.order.payment_type}</span></h5>
                                    <hr className='my-3' />
                                    {/* <h4 className="mt-4">Products Ordered</h4> */}
                                    {/* <table className="table table-bordered mt-2">
        <thead>
          <tr>
            <th>Product</th>
            <th>Code</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((item) => (
            <tr key={item.product_id}>
              <td>{item.product_name}</td>
              <td>{item.product_code}</td>
              <td>{item.quantity}</td>
              <td>₹{item.ordered_price}</td>
              <td>{item.remarks || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
                                    <div>
                                        <p className='mb-1'>Shipping Address</p>
                                        <h5 className='fs-6 fw-medium'>
                                        {order.order.shipping_address}
                                        </h5>
                                    </div>
                                    <div className='text-start'>
                                        <button className='btn btn-primary mt-3 w-100' onClick={() => window.location.href = '/pos'}>Continue Shopping</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PosThankYouPage