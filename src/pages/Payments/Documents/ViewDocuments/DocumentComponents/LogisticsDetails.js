import { Tooltip } from 'antd';
import React, { useState } from 'react'
import LogisticsDetailsModal from '../../../../CommonComponent/LogisticsDetailsModal';

function LogisticsDetails() {

    // Logistics Details Modal start
    const [showLogisticsDetailsModal, setShowLogisticsDetailsModal] = useState(false);
    const handleCloseLogisticsDetailsModal = () => setShowLogisticsDetailsModal(false);
    const handleShowLogisticsDetailsModal = () => setShowLogisticsDetailsModal(true);

    return (
        <>
            <div className='card shadow-none border mb-0'>
                <div className='card-header gth-bg-blue-light'>
                    <div className='d-flex flex-wrap gap-2 align-items-center'>
                        <h5 className='card-title f-s-16'>Logistic Details</h5>
                        <div className='ms-auto'>
                            <Tooltip title="Edit">
                                <button type='button' className='link-btn' onClick={handleShowLogisticsDetailsModal}>
                                    <i className="fas fa-pen"></i>
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <div className='card-body doc_body_height_155'>
                    <div>
                        <p className='mb-0 f-s-12 gth-text-dark'><b>Air</b></p>
                        <Tooltip title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ligula diam, accumsan sed elementum nec, dapibus at tellus. Nullam sed neque et tellus aliquet congue. In id est id tortor vestibulum sagittis quis ac libero. Proin a vehicula est. Curabitur faucibus, ante sed elementum molestie, leo lectus lacinia nulla, non volutpat risus metus at erat. Nam in gravida mi, a tristique sem. Proin a sem mattis, lobortis velit non, imperdiet libero. Nulla facilisi. Etiam in dapibus ipsum. Aliquam at nisl eleifend, mollis elit eu, ornare purus.">
                            <p className='mb-0 f-s-12 gth-text-dark two-line-clamp'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ligula diam, accumsan sed elementum nec, dapibus at tellus. Nullam sed neque et tellus aliquet congue. In id est id tortor vestibulum sagittis quis ac libero. Proin a vehicula est. Curabitur faucibus, ante sed elementum molestie, leo lectus lacinia nulla, non volutpat risus metus at erat. Nam in gravida mi, a tristique sem. Proin a sem mattis, lobortis velit non, imperdiet libero. Nulla facilisi. Etiam in dapibus ipsum. Aliquam at nisl eleifend, mollis elit eu, ornare purus.</p>
                        </Tooltip>
                    </div>
                    <div className='nodata_button_wrap text-center'>
                        <button className='btn btn-sm btn-light' onClick={handleShowLogisticsDetailsModal}>
                            <i class="fas fa-plus me-2"></i> No logistic details selected
                        </button>
                    </div>
                </div>
            </div>
            {/* Logistics Details Modal Start*/}
            <LogisticsDetailsModal
                show={showLogisticsDetailsModal}
                handleClose={handleCloseLogisticsDetailsModal}
            />
            {/* Logistics Details Modal end*/}
        </>
    )
}

export default LogisticsDetails