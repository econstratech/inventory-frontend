import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from '../../CommonComponent/AutoCompleteDropdown';
import Select from 'react-select';

import Filter from '../../CommonComponent/Filter';

const ItemMasterStatusBar = () => {

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
                            <Link to='/inventory/inventory-master' className={`listMenu status-activeBg ${location.pathname === "/inventory/inventory-master" ? "active" : ""
                                } `}>All</Link>
                        </li>
                        {/* <li className="list_item">
                            <Link to='/inventory/inventory_approval' className={`listMenu status-accentBg ${location.pathname === "/inventory/inventory_approval" ? "active" : ""
                                } `}>Inventory Approvals</Link>
                        </li> */}
                        <li className="list_item">
                            <Link to='/inventory/stock_movement' className={`listMenu status-greenBg ${location.pathname === "/inventory/stock_movement" ? "active" : ""
                                } `}>Stock Movement</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/inventory/barcode' className={`listMenu status-yellowGreenBg ${location.pathname === "/inventory/barcode" ? "active" : ""
                                } `}>Barcode</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/inventory/floor_manager' className={`listMenu status-quotationBg ${location.pathname === "/inventory/floor_manager" ? "active" : ""
                                } `}>Floor Manager</Link>
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

export default ItemMasterStatusBar