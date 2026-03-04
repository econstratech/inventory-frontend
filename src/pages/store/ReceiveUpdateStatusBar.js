import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Filter from '../CommonComponent/Filter';

// import Filter from '../../CommonComponent/Filter';

const ReceiveUpdateStatusBar = () => {

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
                            <Link to='/store/recv_update/request-quotation' className={`listMenu status-purpleBg ${location.pathname === "/store/recv_update/request-quotation" ? "active" : ""
                                } `}>Request For Quotation</Link>
                        </li>


                    </ul>
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
 
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

export default ReceiveUpdateStatusBar