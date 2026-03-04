import { Tooltip } from 'antd';
import React, { useState } from 'react'
import BankDetailsModal from '../../../../CommonComponent/BankDetailsModal';


function BankDetails() {
    // Bank Details Modal start
    const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
    const handleCloseBankDetailsModal = () => setShowBankDetailsModal(false);
    const handleShowBankDetailsModal = () => setShowBankDetailsModal(true);
    return (
        <>
            <div className='card shadow-none border mb-0'>
                <div className='card-header gth-bg-blue-light'>
                    <div className='d-flex flex-wrap gap-2 align-items-center'>
                        <h5 className='card-title f-s-16'>Bank Details</h5>
                        <div className='ms-auto'>
                            <Tooltip title="Edit">
                                <button type='button' className='link-btn' onClick={handleShowBankDetailsModal}>
                                    <i className="fas fa-pen"></i>
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <div className='card-body doc_body_height_155'>
                    <div>
                        <p className='mb-0 f-s-12 gth-text-dark'><b>Bank Name:</b> XYZ Bank</p>
                        <p className='mb-0 f-s-12 gth-text-dark two-line-clamp'><b>A/C Name:</b> Weglot</p>
                        <p className='mb-0 f-s-12 gth-text-dark two-line-clamp'><b>Branch:</b> KBC</p>
                    </div>
                    <div className='nodata_button_wrap text-center'>
                        <button className='btn btn-sm btn-light' onClick={handleShowBankDetailsModal}>
                            <i class="fas fa-plus me-2"></i> No bank details selected
                        </button>
                    </div>
                </div>
            </div>
            {/* Bank Details Modal Start*/}
            <BankDetailsModal
                show={showBankDetailsModal}
                handleClose={handleCloseBankDetailsModal}
            />
            {/* Bank Details Modal end*/}
        </>
    )
}

export default BankDetails