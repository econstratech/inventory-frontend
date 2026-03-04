import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from '../../CommonComponent/AutoCompleteDropdown';
import Select from 'react-select';

import Filter from '../../CommonComponent/Filter';
import { UserAuth } from '../../auth/Auth';

const CompletedOrdersStatusBar = () => {

    const location = useLocation();

    //filter modal
    const [filterShow, setFilterShow] = useState(false);
    const filterModalClose = () => setFilterShow(false);
    const filterModalShow = () => setFilterShow(true);
const { Logout, userDetails, MatchPermission } = UserAuth();



    return (
        <>

            <div className="bg-white border-bottom">
                <div className="d-flex gap-3 px-4 justify-content-between align-items-center">
                    {/* <ul className="top_listing">

                        <li className="list_item">
                            <Link to='/operation/complete-orders/received-done' className={`listMenu status-greenBg ${location.pathname === "/operation/complete-orders/received-done" ? "active" : ""
                                } `}>Items Received Done</Link>
                        </li>
                    
                    </ul> */}
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                            {MatchPermission(["Create Purchase RFQ"]) ?
                            <Link to="/purchase/new" className="btn btn-exp-primary btn-sm">
                                <i className="fas fa-plus"></i><span className="ms-2">Create PO</span>
                            </Link>
                            : null}
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

export default CompletedOrdersStatusBar