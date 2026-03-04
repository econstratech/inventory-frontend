import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from '../../CommonComponent/AutoCompleteDropdown';
import Select from 'react-select';

import Filter from '../../CommonComponent/Filter';

const BomStatusBar = () => {

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
                            <Link to='/production/bom' className={`listMenu status-activeBg ${location.pathname === "/production/bom" ? "active" : ""
                                } `}>All</Link>
                        </li>
{/* 
                        <li className="list_item">
                            <Link to='/production/bom-draft' className={`listMenu status-pendingBg ${location.pathname === "/production/bom-draft" ? "active" : ""
                                } `}>Draft</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/production/bom-published' className={`listMenu status-meantGreenBg ${location.pathname === "/production/bom-published" ? "active" : ""
                                } `}>Published</Link>
                        </li>
                        <li className="list_item">
                            <Link to='/production/bom-delete' className={`listMenu status-quotationBg ${location.pathname === "/production/bom-delete" ? "active" : ""
                                } `}>Delete</Link>
                        </li> */}
                      


                    </ul>
                    <div className='d-flex ms-auto gap-3'>
                        <div className='line'></div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                            <Link to="/production/bom/create-bom" className="btn btn-exp-primary btn-sm">
                                <i className="fas fa-plus"></i><span className="ms-2">Create BOM</span>
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

export default BomStatusBar