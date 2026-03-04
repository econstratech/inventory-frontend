import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from '../../CommonComponent/AutoCompleteDropdown';
import Select from 'react-select';

import Filter from '../../CommonComponent/Filter';

const ProductionStatusBar = () => {

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
                            <Link to='/production/all-production-process' className={`listMenu status-activeBg ${location.pathname === "/production/all-production-process" ? "active" : ""
                                } `}>All</Link>
                        </li>

                        {/* <li className="list_item">
                            <Link to='/production/production-process-pending-list' className={`listMenu status-pendingBg ${location.pathname === "/production/production-process-pending-list" ? "active" : ""
                                } `}>Approved Pending</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/production/production-repair-pending-list' className={`listMenu status-repairBg ${location.pathname === "/production/production-repair-pending-list" ? "active" : ""
                                } `}>Repair Pending</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/production/production-test-pending-list' className={`listMenu status-yellowGreenBg ${location.pathname === "/production/production-test-pending-list" ? "active" : ""
                                } `}>Testing Pending</Link>
                        </li>
                        

                        <li className="list_item">
                            <Link to='/production/production-approved-list' className={`listMenu status-meantGreenBg ${location.pathname === "/production/production-approved-list" ? "active" : ""
                                } `}>Approved</Link>
                        </li>
                        
                        <li className="list_item">
                            <Link to='/production/production-canceled-list' className={`listMenu status-quotationBg ${location.pathname === "/production/production-canceled-list" ? "active" : ""
                                } `}>Canceled</Link>
                        </li> */}
                        



                    </ul>
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */} 
                            <Link to="/sales/quotation" className="btn btn-exp-primary btn-sm">
                                <i className="fas fa-plus"></i><span className="ms-2">Create New Sales Order</span>
                            </Link>
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

export default ProductionStatusBar