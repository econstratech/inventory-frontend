import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from '../../CommonComponent/AutoCompleteDropdown';
import Select from 'react-select';
import Filter from '../../CommonComponent/Filter';

const ManagementStatusBar = () => {

    const location = useLocation();

    //filter modal
    const [filterShow, setFilterShow] = useState(false);
    const filterModalClose = () => setFilterShow(false);
    const filterModalShow = () => setFilterShow(true);



    return (
        <>

            <div className="gthh-controller-bar" style={{ display: "block" }}>
                <div className="gth-controller-view-block">
                    <ul className="top_listing">
                    <li className="list_item">
                            <Link to='/pending-approval/send-to-management' className={`listMenu status-yellowGreenBg ${location.pathname === "/pending-approval/send-to-management" ? "active" : ""
                                } `}>Send to management</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/pending-approval/rejected-from-admin' className={`listMenu status-dangerBg ${location.pathname === "/pending-approval/rejected-from-admin" ? "active" : ""
                                } `}>Rejected from Admin</Link>
                        </li>


                    </ul>


                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center">
                            {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                        </div>

                    </div>
                </div>


            </div>

            {/* <ManagementFilter /> */}
            {['end'].map((placement, idx) => (
                <Filter show={filterShow}
                    handleClose={filterModalClose} key={idx} placement={placement.end} name={placement} />
            ))}

        </>
    )
}

export default ManagementStatusBar