import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from '../../CommonComponent/AutoCompleteDropdown';
import Select from 'react-select';

import Filter from '../../CommonComponent/Filter';
import { UserAuth } from '../../auth/Auth';

const CreateRfqStatusBar = () => {

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
                    <ul className="top_listing">

                        <li className="list_item">
                            <Link to='/operation/create-rfq-active' className={`listMenu status-activeBg ${location.pathname === "/operation/create-rfq-active" ? "active" : ""
                                } `}>Active</Link>
                        </li>

                        <li className="list_item">
                            <Link to='/operation/create-rfq-reviewing' className={`listMenu status-pendingBg ${location.pathname === "/operation/create-rfq-reviewing" ? "active" : ""
                                } `}>Reviewing</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/operation/approved-from-admin' className={`listMenu status-meantGreenBg ${location.pathname === "/operation/approved-from-admin" ? "active" : ""
                                } `}>Approved from Admin</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/operation/create-rfq-billed' className={`listMenu status-quotationBg ${location.pathname === "/operation/create-rfq-billed" ? "active" : ""
                                } `}>Bill Created</Link>
                        </li>
                        


                    </ul>
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                           {MatchPermission(["Create Purchase RFQ"]) ?
                            <Link to="/purchase/new" className="btn btn-exp-primary btn-sm">
                                <i className="fas fa-plus"></i><span className="ms-2">Create PO</span>
                            </Link>
                            :""}
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

export default CreateRfqStatusBar