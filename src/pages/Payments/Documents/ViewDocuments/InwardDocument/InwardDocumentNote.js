import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomizeDocumentNumberModal from '../../../../CommonComponent/CustomizeDocumentNumberModal';
import DocumentNumberFormatModal from '../../../../CommonComponent/DocumentNumberFormatModal';
import DeleteModal from '../../../../CommonComponent/DeleteModal';
import { Tooltip } from 'antd';
import { Modal } from 'react-bootstrap';
import LocationModal from '../../../../CommonComponent/LocationModal';
import { UserAuth } from '../../../../auth/Auth';
import LogisticsDetailsModal from '../../../../CommonComponent/LogisticsDetailsModal';
import TermsConditionModal from '../../../../CommonComponent/TermsConditionModal';
import BankDetailsModal from '../../../../CommonComponent/BankDetailsModal';
import AttachLinks from '../DocumentComponents/AttachLinks';
import ManageSignature from '../DocumentComponents/ManageSignature';
import EmailRecipients from '../DocumentComponents/EmailRecipients';
import Attachments from '../DocumentComponents/Attachments';
import CommentsDocument from '../DocumentComponents/Comments';
import BankDetails from '../DocumentComponents/BankDetails';
import TermsConditionDocument from '../DocumentComponents/TermsConditionDocument';
import LogisticsDetails from '../DocumentComponents/LogisticsDetails';


function InwardDocumentNote() {
    const navigate = useNavigate();

    const { getGeneralSettingssymbol } = UserAuth();

    //delete modal
    const [deleteShow, setDeleteShow] = useState(false);
    const deleteModalClose = () => setDeleteShow(false);
    const deleteModalShow = () => setDeleteShow(true);
    // Customize Document Number Modal start
    const [showCustomizeDocumentNumberModalModal, setShowCustomizeDocumentNumberModalModal] = useState(false);
    const handleCloseCustomizeDocumentNumberModalModal = () => setShowCustomizeDocumentNumberModalModal(false);
    const handleShowCustomizeDocumentNumberModalModal = () => setShowCustomizeDocumentNumberModalModal(true);
    // Document Number Format Modal start
    const [showDocumentNumberFormatModal, setShowDocumentNumberFormatModal] = useState(false);
    const handleCloseDocumentNumberFormatModal = () => setShowDocumentNumberFormatModal(false);
    const handleShowDocumentNumberFormatModal = () => setShowDocumentNumberFormatModal(true);
    // Billing Location Details Modal start
    const [showBillingLocationModal, setShowBillingLocationModal] = useState(false);
    const handleCloseBillingLocationModal = () => setShowBillingLocationModal(false);
    const handleShowBillingLocationModal = () => setShowBillingLocationModal(true);
    const [locationModel, setLocationModel] = useState('')
    // Billing Location Details Modal end
    // Logistics Details Modal start
    const [showLogisticsDetailsModal, setShowLogisticsDetailsModal] = useState(false);
    const handleCloseLogisticsDetailsModal = () => setShowLogisticsDetailsModal(false);
    const handleShowLogisticsDetailsModal = () => setShowLogisticsDetailsModal(true);
    // Terms Condition Modal start
    const [showTermsConditionModal, setShowTermsConditionModal] = useState(false);
    const handleCloseTermsConditionModal = () => setShowTermsConditionModal(false);
    const handleShowTermsConditionModal = () => setShowTermsConditionModal(true);
    // Bank Details Modal start
    const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
    const handleCloseBankDetailsModal = () => setShowBankDetailsModal(false);
    const handleShowBankDetailsModal = () => setShowBankDetailsModal(true);

    // page redirection side bar collapse
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/document/inward-document/create/id') {
            document.body.classList.add('sidebar-collapse');
        } else {
            document.body.classList.remove('sidebar-collapse');
        }
        return () => {
            document.body.classList.remove('sidebar-collapse');
        };
    }, [location.pathname]);
    // page redirection side bar collapse end

    //Document Number
    const documentNumber = [
        { value: '001', label: 'WR00001' },
        { value: '002', label: 'WR00002' }
    ];
    const handleChangeDocumentNumber = (selectedDocumentNumber) => {
        console.log('Selected ', selectedDocumentNumber);
    };
    // Date
    const [selectedDate, setSelectedDate] = useState(null);


    // textarea
    const textareaRef = useRef(null);
    const [letterCount, setLetterCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const MAX_LETTER_COUNT = 200;

    const handleInputTextarea = () => {
        const textarea = textareaRef.current;
        // Adjust height for auto-resizing
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;

        // Count letters (excluding spaces)
        const letters = textarea.value.replace(/\s+/g, '');
        const count = letters.length;
        setLetterCount(count);

        // Check if the count exceeds the limit
        if (count > MAX_LETTER_COUNT) {
            setErrorMessage('Message too long');
        } else {
            setErrorMessage('');
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, []);
    // textarea end


    // add additional charge
    const [rows, setRows] = useState([
        {
            id: 1,
            description: "",
            total: "",
            tax: "Tax:0%",
            totalTax: "",
        },
    ]);

    const handleAddAdditionalChargeRow = () => {
        const newRow = {
            id: rows.length + 1,
            description: "",
            total: "",
            tax: "Tax:0%",
            totalTax: "",
        };
        setRows([...rows, newRow]);
    };

    const handleRemoveChargeRowAdditionalCharge = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
    };

    const handleInputChangeChargeDescription = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };
    // add additional charge end

    //Input number field
    const [inputValueNumber, setInputValueNumber] = useState('');

    const handleNumberChange = (event) => {
        const value = event.target.value;
        // Allow only numbers and optionally a single decimal point
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value)) {
            setInputValueNumber(value);
        }
    };





    return (
        <>
            <div className='p-4'>
                <div className='mb-3'>
                    <button
                        type="button"
                        className="link-btn text-dark me-3"
                        onClick={() => navigate(-1)} // Navigate back in history
                    >
                        <i className="fas fa-arrow-left" />
                        <span className='ms-2'>Back</span>
                    </button>
                </div>
                <div className="card shadow-sm mb-0">
                    <div className="card-body">
                        <div className='d-flex align-items-center justify-content-between flex-wrap'>
                            <div className='d-flex align-items-center'>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    id="Layer_1"
                                    viewBox="0 0 24 24"
                                    data-name="Layer 1"
                                    width={20}
                                    height={20}
                                    fill="currentColor"
                                    className='me-2'
                                >
                                    <path d="m14 7v-6.54a6.977 6.977 0 0 1 2.465 1.59l3.484 3.486a6.954 6.954 0 0 1 1.591 2.464h-6.54a1 1 0 0 1 -1-1zm8 3.485v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515c.163 0 .324.013.485.024v6.976a3 3 0 0 0 3 3h6.976c.011.161.024.322.024.485zm-8 8.515a1 1 0 0 0 -1-1h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1zm3-4a1 1 0 0 0 -1-1h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 1-1z" />
                                </svg>

                                <span className="fs-5 fw-bold me-3">
                                    Inward Document
                                </span>
                            </div>
                            <div className='ms-auto'>
                            </div>
                        </div>
                        <hr className='mb-3' />
                        <div className='row'>
                            <div className='col-xl-5 col-lg-12'>
                                <div className='card shadow-none border'>
                                    <div className='card-header gth-bg-blue-light'>
                                        <h5 className='card-title f-s-16'>Primary Document Details</h5>
                                    </div>
                                    <div className='card-body pb-1'>
                                        <div className='row'>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <div className='w-100'>
                                                        <label className='form-label'>Document Number <span className='text-danger'>*</span></label>
                                                        <div className='custom-select-wrap'>
                                                            <Select
                                                                name="DocumentNumber"
                                                                options={documentNumber}
                                                                placeholder="Select..."
                                                                onChange={handleChangeDocumentNumber}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button type='button' className='btn btn-sm btn-outline-primary mt-1' onClick={handleShowCustomizeDocumentNumberModalModal}>Customise</button>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label date-label'>Document Date</label>
                                                    <div className="exp-datepicker-cont">
                                                        <span className="cal-icon"><i className="fas fa-calendar-alt"></i></span>
                                                        <DatePicker
                                                            selected={selectedDate}
                                                            onChange={(date) => setSelectedDate(date)}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select Date"
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label'>Amendment</label>
                                                    <input type="text" placeholder="" className="form-control" disabled />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label date-label'>Delivery Date</label>
                                                    <div className="exp-datepicker-cont">
                                                        <span className="cal-icon"><i className="fas fa-calendar-alt"></i></span>
                                                        <DatePicker
                                                            selected={selectedDate}
                                                            onChange={(date) => setSelectedDate(date)}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select Date"
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label'>PO Number <span className='text-danger'>*</span></label>
                                                    <input type="text" placeholder="Enter PO Number" className="form-control" disabled />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label date-label'>PO Date <span className='text-danger'>*</span></label>
                                                    <div className="exp-datepicker-cont">
                                                        <span className="cal-icon"><i className="fas fa-calendar-alt"></i></span>
                                                        <DatePicker
                                                            selected={selectedDate}
                                                            onChange={(date) => setSelectedDate(date)}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select Date"
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label'>Invoice Number</label>
                                                    <input type="text" placeholder="Enter Invoice Number" className="form-control" />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label date-label'>Invoice Date</label>
                                                    <div className="exp-datepicker-cont">
                                                        <span className="cal-icon"><i className="fas fa-calendar-alt"></i></span>
                                                        <DatePicker
                                                            selected={selectedDate}
                                                            onChange={(date) => setSelectedDate(date)}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select Date"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label'>Delivery Challan Number</label>
                                                    <input type="text" placeholder="Enter Delivery Challan Number" className="form-control" />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label date-label'>Delivery Challan Date</label>
                                                    <div className="exp-datepicker-cont">
                                                        <span className="cal-icon"><i className="fas fa-calendar-alt"></i></span>
                                                        <DatePicker
                                                            selected={selectedDate}
                                                            onChange={(date) => setSelectedDate(date)}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select Date"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label'>Store</label>
                                                    <div className='custom-select-wrap'>
                                                        <Select
                                                            name="Store"
                                                            //options={store}
                                                            placeholder="Select..."
                                                        //onChange={handleChangeStore}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label'>Transporter Name</label>
                                                    <input type="text" placeholder="Enter Transporter Name" className="form-control" />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label'>Transportation Document Number</label>
                                                    <input type="text" placeholder="Enter Transportation Document Number" className="form-control" />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label'>Vehicle Number</label>
                                                    <input type="text" placeholder="Enter Vehicle Number" className="form-control" />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label date-label'>Transportation Document Date <span className='text-danger'>*</span></label>
                                                    <div className="exp-datepicker-cont">
                                                        <span className="cal-icon"><i className="fas fa-calendar-alt"></i></span>
                                                        <DatePicker
                                                            selected={selectedDate}
                                                            onChange={(date) => setSelectedDate(date)}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select Date"

                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-xl-7 col-lg-12'>
                                <div className='row g-3'>
                                    <div className='col-lg-6'>
                                        <div className='card shadow-none border mb-0 h-100'>
                                            <div className='card-header gth-bg-blue-light'>
                                                <div className='d-flex flex-wrap gap-2 align-items-center'>
                                                    <h5 className='card-title f-s-16'>Goods Received By</h5>
                                                    <div className='ms-auto'>
                                                        <Tooltip title="Edit">
                                                            <button type='button' className='link-btn' onClick={() => { handleShowBillingLocationModal(); setLocationModel("Billing") }}><i className="fas fa-pen"></i></button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='card-body'>
                                                <p className='mb-0 f-s-12 gth-text-dark'><b>Weglot Manufacturing</b></p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>Main Address,</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>Mumbai (Maharashtra)</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>India - 400001</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'><b>GSTIN:</b></p>
                                                <div className='mt-2 text-end'>
                                                    <button className='btn btn-sm btn-light'>
                                                        <i class="fas fa-map-marker-alt me-2"></i>Place of Supply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='card shadow-none border mb-0 h-100'>
                                            <div className='card-header gth-bg-blue-light'>
                                                <div className='d-flex flex-wrap gap-2 align-items-center'>
                                                    <h5 className='card-title f-s-16'>Delivery Location</h5>
                                                    <div className='ms-auto'>
                                                        <Tooltip title="Edit">
                                                            <button type='button' className='link-btn' onClick={() => { handleShowBillingLocationModal(); setLocationModel("Delivery") }}><i className="fas fa-pen"></i></button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='card-body'>
                                                <p className='mb-0 f-s-12 gth-text-dark'><b></b></p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>Secondary Address, Delhi (UP)</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>Delhi (Delhi)</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>India - 100014</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'><b>GSTIN:</b></p>
                                                <div className='mt-2 text-end'>
                                                    <button className='btn btn-sm btn-light'>
                                                        <i class="fas fa-map-marker-alt me-2"></i>Place of Supply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='card shadow-none border mb-0 h-100'>
                                            <div className='card-header gth-bg-blue-light'>
                                                <div className='d-flex flex-wrap gap-2 align-items-center'>
                                                    <h5 className='card-title f-s-16'>Goods Sent By</h5>
                                                    <div className='ms-auto'>
                                                        <Tooltip title="Edit">
                                                            <button type='button' className='link-btn' onClick={() => { handleShowBillingLocationModal(); setLocationModel("Delivery") }}><i className="fas fa-pen"></i></button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='card-body'>
                                                <p className='mb-0 f-s-12 gth-text-dark'><b>Weglot Manufacturing</b></p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>Secondary Address, Delhi (UP)</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>Delhi (Delhi)</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'>India - 100014</p>
                                                <p className='mb-0 f-s-12 gth-text-dark'><b>GSTIN:</b></p>
                                                <div className='mt-2 text-end'>
                                                    <button className='btn btn-sm btn-light'>
                                                        <i class="fas fa-map-marker-alt me-2"></i>Place of Supply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 mt-3'>
                                <div className='table-responsive'>
                                    <table className='table table-striped primary-table-head'>
                                        <thead>
                                            <tr>
                                                <th>&nbsp;</th>
                                                <th className='min-width-150'>
                                                    Item ID
                                                </th>
                                                <th className='min-width-200'>
                                                    Item Description
                                                </th>
                                                <th className='min-width-150 text-end'>
                                                    Quantity
                                                </th>
                                                <th className='min-width-150'>
                                                    Units
                                                </th>
                                                <th className='min-width-150'>
                                                    Alternate Unit
                                                </th>
                                                <th className='min-width-150'>
                                                    Delivery Date
                                                </th>
                                                <th className='min-width-150 text-end'>
                                                    <div>
                                                        Delivered
                                                    </div>
                                                </th>
                                                <th className='min-width-150 text-end'>
                                                    Delivered Now
                                                </th>
                                                <th className='min-width-150 text-end'>
                                                    Balance
                                                </th>
                                                <th className='min-width-200'>
                                                    Comments
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <button type='button' className='link-btn'>
                                                        <i className="fas fa-minus-circle text-danger"></i>
                                                    </button>
                                                </td>
                                                <td className='min-width-150'>
                                                    <Tooltip title="RM01">
                                                        <span>RM01</span>
                                                    </Tooltip>
                                                </td>
                                                <td className='min-width-200'>
                                                    <Tooltip title="Raw Material 1">
                                                        <span>Raw Material 1</span>
                                                    </Tooltip>
                                                </td>
                                                <td className='min-width-150 text-end'>
                                                    <span>10</span>
                                                </td>
                                                <td className='min-width-150'>
                                                    <span>Kg</span>
                                                </td>
                                                <td className='min-width-150'>
                                                    <span>-</span>
                                                </td>
                                                <td className='min-width-150'>
                                                    <div className='d-flex'><span className='ps-2'><input type='date' className='cn_table_input text-end' /></span></div>
                                                </td>
                                                <td className='min-width-150 text-end'>
                                                    <span>10</span>
                                                </td>
                                                <td className='min-width-150 text-end'>
                                                    <div className='d-flex'>
                                                        <span className='ps-2'>
                                                            <input
                                                                type='text'
                                                                className='cn_table_input text-end'
                                                                value={inputValueNumber}
                                                                onChange={handleNumberChange}
                                                            />
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className='min-width-150 text-end'>
                                                    <span>0</span>
                                                </td>
                                                <td className='min-width-200'>
                                                    <div className='d-flex'><span className='ps-2'><input type='text' className='cn_table_input' /></span></div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div className='col-xl-7 col-lg-12'>
                                <div className='row g-3'>                                    
                                    <div className='col-lg-6'>
                                        <CommentsDocument />
                                    </div>
                                    <div className='col-lg-6'>
                                        <Attachments />
                                    </div>
                                    <div className='col-lg-6'>
                                        <AttachLinks />
                                    </div>
                                    <div className='col-lg-6'>
                                        <ManageSignature />
                                    </div>
                                </div>
                            </div>
                            <div className='col-xl-5 col-lg-12'>
                                
                            </div>
                            <div className='col-12'>
                                <div className='d-flex gap-3 flex-wrap justify-content-end mt-3 mb-3'>
                                    <button className='btn btn-primary'>
                                        Save Draft
                                    </button>
                                    <button className='btn btn-success'>
                                        Save and Send
                                    </button>
                                </div>
                                <div className="f-s-13 text-primary text-end">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 20"
                                        width={14}
                                        height={16}
                                        fill="currentColor"
                                        className="me-1"
                                    >
                                        <path d="M10.0833 10.4136L10.6083 12.6885C10.6917 13.0469 10.3 13.3302 9.98333 13.1386L8 11.9386L6.00833 13.1386C5.69167 13.3302 5.3 13.0469 5.38333 12.6885L5.91667 10.4219L4.16667 8.91355C3.88333 8.67188 4.03333 8.21355 4.4 8.18022L6.71667 7.98022L7.61667 5.84688C7.75833 5.50522 8.24167 5.50522 8.38333 5.84688L9.28333 7.97188L11.6 8.17188C11.9667 8.20522 12.1167 8.66355 11.8333 8.90522L10.0833 10.4136ZM1.49167 3.64688C0.891667 3.91355 0.5 4.51355 0.5 5.17189V9.08855C0.5 13.7136 3.7 18.0385 8 19.0886C12.3 18.0385 15.5 13.7136 15.5 9.08855V5.17189C15.5 4.51355 15.1083 3.91355 14.5083 3.64688L8.675 1.05522C8.24167 0.863552 7.75 0.863552 7.325 1.05522L1.49167 3.64688Z" />
                                    </svg>
                                    Encrypted Action
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>


            {/* Customize Document Number Modal */}
            <CustomizeDocumentNumberModal
                show={showCustomizeDocumentNumberModalModal}
                handleClose={handleCloseCustomizeDocumentNumberModalModal}
                documentNumberFormatModal={handleShowDocumentNumberFormatModal}
                documentNumberDelete={deleteModalShow}
            />

            {/* Customize Document Number Modal */}
            <DocumentNumberFormatModal
                show={showDocumentNumberFormatModal}
                handleClose={handleCloseDocumentNumberFormatModal} />

            {/* Delete Modal */}
            <DeleteModal
                show={deleteShow}
                handleClose={deleteModalClose} />

            {/* Billing Location Details Modal Start*/}
            <LocationModal
                show={showBillingLocationModal}
                onClose={handleCloseBillingLocationModal}
                title={locationModel}
            />
            {/* Billing Location Details Modal end*/}
            {/* Logistics Details Modal Start*/}
            <LogisticsDetailsModal
                show={showLogisticsDetailsModal}
                handleClose={handleCloseLogisticsDetailsModal}
            />
            {/* Logistics Details Modal end*/}
            {/* Terms Condition Modal Start*/}
            <TermsConditionModal
                show={showTermsConditionModal}
                handleClose={handleCloseTermsConditionModal}
            />
            {/* Terms Condition Modal end*/}

        </>
    )
}

export default InwardDocumentNote