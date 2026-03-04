import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'

import Select from 'react-select';
import Filter from '../CommonComponent/Filter';


const PaymentDocumentStatusBar = () => {

    const location = useLocation();

    //filter modal
    const [filterShow, setFilterShow] = useState(false);
    const filterModalClose = () => setFilterShow(false);
    const filterModalShow = () => setFilterShow(true);




    return (
        <>

            <div className="bg-white border-bottom">
                <div className="d-flex gap-3 px-4 justify-content-between align-items-center">
                    <ul className="top_listing">

                        <li className="list_item">
                            <Link to='/payment/document/receivable' className={`listMenu status-greenBg ${location.pathname === "/payment/document/receivable" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Receivable</Link>
                        </li>

                        <li className="list_item">
                            <Link to='/payment/document/payable' className={`listMenu status-purpleBg ${location.pathname === "/payment/document/payable" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Payable</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/payment/document/receive' className={`listMenu status-meantGreenBg ${location.pathname === "/payment/document/receive" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Received</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/payment/document/paid' className={`listMenu status-quotationBg ${location.pathname === "/payment/document/paid" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Paid</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/payment/document/overdue-receivable' className={`listMenu status-repairBg ${location.pathname === "/payment/document/overdue-receivable" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Overdue Receivable</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/payment/document/overdue-payable' className={`listMenu status-yellowGreenBg ${location.pathname === "/payment/document/overdue-payable" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Overdue Payable</Link>
                        </li>


                    </ul>
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}>
                                <i className="fas fa-filter me-2" ></i>Filter
                            </button>

                        </div>

                    </div>


                </div>


            </div>

            {/* <ManagementFilter /> */}
            {['end'].map((placement, idx) => (
                <Filter show={filterShow}
                    handleClose={filterModalClose}
                    key={idx} placement={placement.end} name={placement} />
            ))}

        </>
    )
}

export default PaymentDocumentStatusBar