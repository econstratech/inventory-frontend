import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const PaymentTopBar = () => {
    const location = useLocation();

    return (
        <>
            <div className="gthh-controller-bar">
                <ul className="gth-controller-view-block">
                    <li>
                        <Link className={`gth-controller-view-item ${
                            location.pathname === "/payment/document/receivable" ||
                            location.pathname === "/payment/document/payable" ||
                            location.pathname === "/payment/document/receive" ||
                            location.pathname === "/payment/document/paid" ||
                            location.pathname === "/payment/document/overdue-receivable" ||
                            location.pathname === "/payment/document/overdue-payable"

                            ? "active" : ""
                            } `} to="/payment/document/receivable">
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
                            Documents
                        </Link>
                    </li>


                    <li>
                        <Link
                            className={`gth-controller-view-item ${location.pathname === "/payment/company-ledger/all"

                                ? "active" : ""
                                } `} to="/payment/company-ledger/all">
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
                                <path d="m17,0H7C4.243,0,2,2.243,2,5v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5ZM7.5,4.5c.828,0,1.5.672,1.5,1.5s-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5.672-1.5,1.5-1.5Zm0,15c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5,1.5.672,1.5,1.5-.672,1.5-1.5,1.5Zm1.365-5.979c-.319.319-.741.479-1.165.479-.427,0-.855-.162-1.182-.487l-.681-.655c-.398-.382-.411-1.016-.028-1.414.383-.399,1.017-.41,1.414-.028l.472.454,1.866-1.815c.396-.385,1.029-.377,1.414.02.385.396.376,1.029-.02,1.414l-2.091,2.034Zm8.135,5.479h-5c-.552,0-1-.448-1-1s.448-1,1-1h5c.552,0,1,.448,1,1s-.448,1-1,1Zm0-6h-3c-.552,0-1-.448-1-1s.448-1,1-1h3c.552,0,1,.448,1,1s-.448,1-1,1Zm0-6h-5c-.552,0-1-.448-1-1s.448-1,1-1h5c.552,0,1,.448,1,1s-.448,1-1,1Z" />
                            </svg>
                            Company Ledger
                        </Link>
                    </li>

                    <li>
                        <Link className={`gth-controller-view-item ${
                            location.pathname === "/payment/payments/paid"
                            ? "active" : ""
                            } `} to="/payment/payments/paid">
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
                                <path d="m13,4.016c0-.552.447-1,1-1h4.076l-1.29-1.316c-.387-.395-.381-1.028.014-1.415.393-.385,1.028-.381,1.414.014l2.177,2.221c.391.39.609.917.609,1.479s-.219,1.09-.616,1.487l-2.17,2.213c-.195.2-.455.3-.714.3-.253,0-.506-.095-.7-.286-.395-.387-.4-1.02-.014-1.415l1.258-1.284h-4.044c-.553,0-1-.448-1-1Zm10.148,4.665c-.515-.469-1.186-.712-1.878-.678-.697.032-1.339.334-1.794.835l-3.541,3.737c.032.21.065.42.065.638,0,2.083-1.555,3.876-3.617,4.17l-4.252.596c-.547.078-1.053-.302-1.131-.848-.078-.547.302-1.053.848-1.131l4.162-.583c.936-.134,1.748-.806,1.94-1.732.296-1.425-.79-2.685-2.164-2.685h-2.787v-1h.376c1.447,0,2.624-1.177,2.624-2.624,0-1.288-.923-2.377-2.193-2.588l-3.285-.548c-.302-.05-.521-.309-.521-.616,0-.344.28-.624.624-.624h2.644c.356,0,.688.192.867.5.275.478.885.642,1.366.365.478-.277.642-.888.364-1.366-.534-.925-1.53-1.5-2.598-1.5h-.268c0-.552-.447-1-1-1s-1,.448-1,1h-.376c-1.447,0-2.624,1.177-2.624,2.624,0,1.288.923,2.377,2.193,2.588l3.285.548c.302.05.521.309.521.616,0,.344-.28.624-.624.624h-2.644c-.356,0-.688-.192-.867-.5-.275-.479-.886-.643-1.366-.365-.478.277-.642.888-.364,1.366.534.925,1.53,1.499,2.598,1.499h.268v1h-3c-2.209,0-4,1.791-4,4v5c0,2.209,1.791,4,4,4h4.262c2.805,0,5.48-1.178,7.374-3.246l7.702-8.409c.948-1.062.862-2.707-.189-3.665Z" />
                            </svg>
                            Payments
                        </Link>
                    </li>

                    <li>
                        <Link className={`gth-controller-view-item ${location.pathname === "/payment/receipts/received"
                            ? "active" : ""
                            } `} to="/payment/receipts/received">
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
                                <path d="M15.297,7.211c-.393-.388-.396-1.021-.009-1.414,.39-.394,1.021-.396,1.415-.009l1.297,1.281V1c0-.552,.447-1,1-1s1,.448,1,1V7.052l1.303-1.268c.395-.386,1.027-.377,1.414,.019,.385,.396,.377,1.029-.02,1.414l-2.236,2.177c-.815,.814-2.148,.806-2.964-.009l-2.2-2.173Zm8.703,3.789v10c0,1.654-1.346,3-3,3H5c-2.757,0-5-2.243-5-5V9C-.011,6.285,2.222,3.995,5,4h7c.553,0,1,.448,1,1s-.447,1-1,1H5c-.887,0-1.686,.387-2.235,1.001,.563,.627,1.376,.999,2.235,.999H13.416c.131,.226,.281,.442,.475,.634l2.192,2.166c1.504,1.578,4.271,1.589,5.772,.027l1.592-1.55c.345,.489,.552,1.081,.552,1.723Zm-4,5c0-.828-.672-1.5-1.5-1.5s-1.5,.672-1.5,1.5,.672,1.5,1.5,1.5,1.5-.672,1.5-1.5Z" />
                            </svg>
                            Receipts
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default PaymentTopBar