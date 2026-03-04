import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Filter from '../../../CommonComponent/Filter';

// import Filter from '../../CommonComponent/Filter';

const PoUpdateStatusBar = () => {

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
                            <Link to='/sales-orders/dispatch/order-dispatch' className={`listMenu status-accentBg ${location.pathname === "/sales-orders/dispatch/order-dispatch" ? "active" : ""
                                } `}>Dispatch Order</Link>
                        </li> 
                        <li className="list_item"><Link to='/sales-orders/dispatch/order-dispatch-done' className={`listMenu status-successBg ${location.pathname === "/sales-orders/dispatch/order-dispatch-done" ? "active" : ""
                                } `}>Dispatch Order Done</Link>
                        </li> 
                       
                    </ul>
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                            <Link to="/sales/new" className="btn btn-exp-primary btn-sm">
                                <i className="fas fa-plus"></i><span className="ms-2">Sales Orders</span>
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

export default PoUpdateStatusBar