import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from '../../CommonComponent/AutoCompleteDropdown';
import Select from 'react-select';

import Filter from '../../CommonComponent/Filter';

const WorkStatusBar = () => {

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
                            <Link to='/production/work-orders' className={`listMenu status-activeBg ${location.pathname === "/production/work-orders" ? "active" : ""
                                } `}>All</Link>
                        </li>

                        {/* <li className="list_item">
                            <Link to='/production/work-orders-open' className={`listMenu status-accentBg ${location.pathname === "/production/work-orders-open" ? "active" : ""
                                } `}>Open</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/production/work-orders-planned' className={`listMenu status-pendingBg ${location.pathname === "/production/work-orders-planned" ? "active" : ""
                                } `}>Planned</Link>
                        </li>

                        <li className="list_item">
                            <Link to='/production/work-orders-pending' className={`listMenu status-yellowGreenBg ${location.pathname === "/production/work-orders-pending" ? "active" : ""
                                } `}>Pending</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/production/work-orders-wip' className={`listMenu status-wipBg ${location.pathname === "/production/work-orders-wip" ? "active" : ""
                                } `}>WIP</Link>
                        </li>

                        <li className="list_item">
                            <Link to='/production/work-orders-completed' className={`listMenu status-meantGreenBg ${location.pathname === "/production/work-orders-completed" ? "active" : ""
                                } `}>Completed</Link>
                        </li> */}



                    </ul>
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* <button className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
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

export default WorkStatusBar