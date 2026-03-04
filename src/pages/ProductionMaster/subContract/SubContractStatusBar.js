import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from '../../CommonComponent/AutoCompleteDropdown';
import Select from 'react-select';

import Filter from '../../CommonComponent/Filter';

const SubContractStatusBar = () => {

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
                            <Link to='/production/sub-contract' className={`listMenu status-activeBg ${location.pathname === "/production/sub-contract" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>All</Link>
                        </li>

                        <li className="list_item">
                            <Link to='/production/sub-contract-approve-pending' className={`listMenu status-pendingBg ${location.pathname === "/production/sub-contract-approve-pending" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Approved Pending</Link>
                        </li>

                        <li className="list_item">
                            <Link to='/production/sub-contract-approve' className={`listMenu status-meantGreenBg ${location.pathname === "/production/sub-contract-approve" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Approved</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/production/sub-contract-canceled' className={`listMenu status-quotationBg ${location.pathname === "/production/sub-contract-canceled" ? "active" : ""
                                } `}><i className="far fa-dot-circle me-1"></i>Canceled</Link>
                        </li>

                    </ul>
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                           
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

export default SubContractStatusBar