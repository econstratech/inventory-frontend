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
import LogisticsDetails from '../DocumentComponents/LogisticsDetails';
import TermsConditionDocument from '../DocumentComponents/TermsConditionDocument';
import BankDetails from '../DocumentComponents/BankDetails';
import CommentsDocument from '../DocumentComponents/Comments';
import Attachments from '../DocumentComponents/Attachments';
import AttachLinks from '../DocumentComponents/AttachLinks';
import EmailRecipients from '../DocumentComponents/EmailRecipients';
import ManageSignature from '../DocumentComponents/ManageSignature';



function GoodsReceiptNote() {
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
        if (location.pathname === '/document/grn/create/id') {
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
        { value: '001', label: 'CN001' },
        { value: '002', label: 'CN002' }
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
    //country
    const Country = [
        { value: 'afghanistan', label: 'Afghanistan' },
        { value: 'albania', label: 'Albania' },
        { value: 'algeria', label: 'Algeria' },
        { value: 'andorra', label: 'Andorra' },
        { value: 'angola', label: 'Angola' },
        { value: 'antigua_and_barbuda', label: 'Antigua and Barbuda' },
        { value: 'argentina', label: 'Argentina' },
        { value: 'armenia', label: 'Armenia' },
        { value: 'australia', label: 'Australia' },
        { value: 'austria', label: 'Austria' },
        { value: 'azerbaijan', label: 'Azerbaijan' },
        { value: 'bahamas', label: 'Bahamas' },
        { value: 'bahrain', label: 'Bahrain' },
        { value: 'bangladesh', label: 'Bangladesh' },
        { value: 'barbados', label: 'Barbados' },
        { value: 'belarus', label: 'Belarus' },
        { value: 'belgium', label: 'Belgium' },
        { value: 'belize', label: 'Belize' },
        { value: 'benin', label: 'Benin' },
        { value: 'bhutan', label: 'Bhutan' },
        { value: 'bolivia', label: 'Bolivia' },
        { value: 'bosnia_and_herzegovina', label: 'Bosnia and Herzegovina' },
        { value: 'botswana', label: 'Botswana' },
        { value: 'brazil', label: 'Brazil' },
        { value: 'brunei', label: 'Brunei' },
        { value: 'bulgaria', label: 'Bulgaria' },
        { value: 'burkina_faso', label: 'Burkina Faso' },
        { value: 'burundi', label: 'Burundi' },
        { value: 'cabo_verde', label: 'Cabo Verde' },
        { value: 'cambodia', label: 'Cambodia' },
        { value: 'cameroon', label: 'Cameroon' },
        { value: 'canada', label: 'Canada' },
        { value: 'central_african_republic', label: 'Central African Republic' },
        { value: 'chad', label: 'Chad' },
        { value: 'chile', label: 'Chile' },
        { value: 'china', label: 'China' },
        { value: 'colombia', label: 'Colombia' },
        { value: 'comoros', label: 'Comoros' },
        { value: 'congo', label: 'Congo (Congo-Brazzaville)' },
        { value: 'costa_rica', label: 'Costa Rica' },
        { value: 'croatia', label: 'Croatia' },
        { value: 'cuba', label: 'Cuba' },
        { value: 'cyprus', label: 'Cyprus' },
        { value: 'czechia', label: 'Czechia (Czech Republic)' },
        { value: 'denmark', label: 'Denmark' },
        { value: 'djibouti', label: 'Djibouti' },
        { value: 'dominica', label: 'Dominica' },
        { value: 'dominican_republic', label: 'Dominican Republic' },
        { value: 'ecuador', label: 'Ecuador' },
        { value: 'egypt', label: 'Egypt' },
        { value: 'el_salvador', label: 'El Salvador' },
        { value: 'equatorial_guinea', label: 'Equatorial Guinea' },
        { value: 'eritrea', label: 'Eritrea' },
        { value: 'estonia', label: 'Estonia' },
        { value: 'eswatini', label: 'Eswatini (fmr. "Swaziland")' },
        { value: 'ethiopia', label: 'Ethiopia' },
        { value: 'fiji', label: 'Fiji' },
        { value: 'finland', label: 'Finland' },
        { value: 'france', label: 'France' },
        { value: 'gabon', label: 'Gabon' },
        { value: 'gambia', label: 'Gambia' },
        { value: 'georgia', label: 'Georgia' },
        { value: 'germany', label: 'Germany' },
        { value: 'ghana', label: 'Ghana' },
        { value: 'greece', label: 'Greece' },
        { value: 'grenada', label: 'Grenada' },
        { value: 'guatemala', label: 'Guatemala' },
        { value: 'guinea', label: 'Guinea' },
        { value: 'guinea_bissau', label: 'Guinea-Bissau' },
        { value: 'guyana', label: 'Guyana' },
        { value: 'haiti', label: 'Haiti' },
        { value: 'honduras', label: 'Honduras' },
        { value: 'hungary', label: 'Hungary' },
        { value: 'iceland', label: 'Iceland' },
        { value: 'india', label: 'India' },
        { value: 'indonesia', label: 'Indonesia' },
        { value: 'iran', label: 'Iran' },
        { value: 'iraq', label: 'Iraq' },
        { value: 'ireland', label: 'Ireland' },
        { value: 'israel', label: 'Israel' },
        { value: 'italy', label: 'Italy' },
        { value: 'jamaica', label: 'Jamaica' },
        { value: 'japan', label: 'Japan' },
        { value: 'jordan', label: 'Jordan' },
        { value: 'kazakhstan', label: 'Kazakhstan' },
        { value: 'kenya', label: 'Kenya' },
        { value: 'kiribati', label: 'Kiribati' },
        { value: 'korea_north', label: 'Korea (North)' },
        { value: 'korea_south', label: 'Korea (South)' },
        { value: 'kosovo', label: 'Kosovo' },
        { value: 'kuwait', label: 'Kuwait' },
        { value: 'kyrgyzstan', label: 'Kyrgyzstan' },
        { value: 'laos', label: 'Laos' },
        { value: 'latvia', label: 'Latvia' },
        { value: 'lebanon', label: 'Lebanon' },
        { value: 'lesotho', label: 'Lesotho' },
        { value: 'liberia', label: 'Liberia' },
        { value: 'libya', label: 'Libya' },
        { value: 'liechtenstein', label: 'Liechtenstein' },
        { value: 'lithuania', label: 'Lithuania' },
        { value: 'luxembourg', label: 'Luxembourg' },
        { value: 'madagascar', label: 'Madagascar' },
        { value: 'malawi', label: 'Malawi' },
        { value: 'malaysia', label: 'Malaysia' },
        { value: 'maldives', label: 'Maldives' },
        { value: 'mali', label: 'Mali' },
        { value: 'malta', label: 'Malta' },
        { value: 'marshall_islands', label: 'Marshall Islands' },
        { value: 'mauritania', label: 'Mauritania' },
        { value: 'mauritius', label: 'Mauritius' },
        { value: 'mexico', label: 'Mexico' },
        { value: 'micronesia', label: 'Micronesia' },
        { value: 'moldova', label: 'Moldova' },
        { value: 'monaco', label: 'Monaco' },
        { value: 'mongolia', label: 'Mongolia' },
        { value: 'montenegro', label: 'Montenegro' },
        { value: 'morocco', label: 'Morocco' },
        { value: 'mozambique', label: 'Mozambique' },
        { value: 'myanmar', label: 'Myanmar (Burma)' },
        { value: 'namibia', label: 'Namibia' },
        { value: 'nauru', label: 'Nauru' },
        { value: 'nepal', label: 'Nepal' },
        { value: 'netherlands', label: 'Netherlands' },
        { value: 'new_zealand', label: 'New Zealand' },
        { value: 'nicaragua', label: 'Nicaragua' },
        { value: 'niger', label: 'Niger' },
        { value: 'nigeria', label: 'Nigeria' },
        { value: 'north_macedonia', label: 'North Macedonia' },
        { value: 'norway', label: 'Norway' },
        { value: 'oman', label: 'Oman' },
        { value: 'pakistan', label: 'Pakistan' },
        { value: 'palau', label: 'Palau' },
        { value: 'panama', label: 'Panama' },
        { value: 'papua_new_guinea', label: 'Papua New Guinea' },
        { value: 'paraguay', label: 'Paraguay' },
        { value: 'peru', label: 'Peru' },
        { value: 'philippines', label: 'Philippines' },
        { value: 'poland', label: 'Poland' },
        { value: 'portugal', label: 'Portugal' },
        { value: 'qatar', label: 'Qatar' },
        { value: 'romania', label: 'Romania' },
        { value: 'russia', label: 'Russia' },
        { value: 'rwanda', label: 'Rwanda' },
        { value: 'saint_kitts_and_nevis', label: 'Saint Kitts and Nevis' },
        { value: 'saint_lucia', label: 'Saint Lucia' },
        { value: 'saint_vincent_and_the_grenadines', label: 'Saint Vincent and the Grenadines' },
        { value: 'samoa', label: 'Samoa' },
        { value: 'san_marino', label: 'San Marino' },
        { value: 'sao_tome_and_principe', label: 'Sao Tome and Principe' },
        { value: 'saudi_arabia', label: 'Saudi Arabia' },
        { value: 'senegal', label: 'Senegal' },
        { value: 'serbia', label: 'Serbia' },
        { value: 'seychelles', label: 'Seychelles' },
        { value: 'sierra_leone', label: 'Sierra Leone' },
        { value: 'singapore', label: 'Singapore' },
        { value: 'slovakia', label: 'Slovakia' },
        { value: 'slovenia', label: 'Slovenia' },
        { value: 'solomon_islands', label: 'Solomon Islands' },
        { value: 'somalia', label: 'Somalia' },
        { value: 'south_africa', label: 'South Africa' },
        { value: 'south_sudan', label: 'South Sudan' },
        { value: 'spain', label: 'Spain' },
        { value: 'sri_lanka', label: 'Sri Lanka' },
        { value: 'sudan', label: 'Sudan' },
        { value: 'suriname', label: 'Suriname' },
        { value: 'sweden', label: 'Sweden' },
        { value: 'switzerland', label: 'Switzerland' },
        { value: 'syria', label: 'Syria' },
        { value: 'taiwan', label: 'Taiwan' },
        { value: 'tajikistan', label: 'Tajikistan' },
        { value: 'tanzania', label: 'Tanzania' },
        { value: 'thailand', label: 'Thailand' },
        { value: 'timor_leste', label: 'Timor-Leste' },
        { value: 'togo', label: 'Togo' },
        { value: 'tonga', label: 'Tonga' },
        { value: 'trinidad_and_tobago', label: 'Trinidad and Tobago' },
        { value: 'tunisia', label: 'Tunisia' },
        { value: 'turkey', label: 'Turkey' },
        { value: 'turkmenistan', label: 'Turkmenistan' },
        { value: 'tuvalu', label: 'Tuvalu' },
        { value: 'uganda', label: 'Uganda' },
        { value: 'ukraine', label: 'Ukraine' },
        { value: 'uae', label: 'United Arab Emirates' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'usa', label: 'United States' },
        { value: 'uruguay', label: 'Uruguay' },
        { value: 'uzbekistan', label: 'Uzbekistan' },
        { value: 'vanuatu', label: 'Vanuatu' },
        { value: 'vatican_city', label: 'Vatican City' },
        { value: 'venezuela', label: 'Venezuela' },
        { value: 'vietnam', label: 'Vietnam' },
        { value: 'yemen', label: 'Yemen' },
        { value: 'zambia', label: 'Zambia' },
        { value: 'zimbabwe', label: 'Zimbabwe' }
    ];

    const handleChangeCountry = (selectedOption) => {
        console.log("Selected Country:", selectedOption);
    };

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


    // Attachments file start
    const [selectedAttachmentFileImages, setSelectedAttachmentFileImages] = useState([]);
    const [errorMessageVideoUpload, setErrorMessageVideoUpload] = useState('');

    const handleAttachmentFileChange = (event) => {
        const files = Array.from(event.target.files);

        // Check if any file is a video
        const invalidFiles = files.filter((file) => file.type.includes('video'));

        if (invalidFiles.length > 0) {
            setErrorMessageVideoUpload('Video files are not allowed.');
            return;
        }

        // Check if the total number of files exceeds the limit
        if (selectedAttachmentFileImages.length + files.length > 6) {
            setErrorMessageVideoUpload('You can upload a maximum of 6 files.');
            return;
        }

        setErrorMessageVideoUpload(''); // Clear any previous error
        setSelectedAttachmentFileImages([...selectedAttachmentFileImages, ...files]);
    };

    const handleAttachmentFileRemove = (index) => {
        const updatedImages = [...selectedAttachmentFileImages];
        updatedImages.splice(index, 1);
        setSelectedAttachmentFileImages(updatedImages);
    };

    const getFileIconClass = (file) => {
        const fileType = file.type || file.name.split('.').pop().toLowerCase();
        if (fileType.includes('image')) return 'fas fa-image';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
        if (fileType.includes('text')) return 'fas fa-file-alt';
        return 'fas fa-file'; // Default icon for unknown file types
    };

    // Attachments file end

    // table row data
    const rowData = [
        {
            id: 1,
            materialCode: 'RM01',
            materialName: 'Raw Material 1',
            quantity: 10,
            unit: 'Kg',
            reserved: '-',
            available: 10,
            acceptedQty: '',
            rejected:'0',
            comment: '',
        },
        {
            id: 2,
            materialCode: 'RM02',
            materialName: 'Raw Material 2',
            quantity: 20,
            unit: 'Ltr',
            reserved: '-',
            available: 20,
            acceptedQty: '',
            rejected:'0',
            comment: '',
        },
    ];



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
                                    <path d="m13.27 7.48c-.813.813-1.27 1.915-1.27 3.065v.955c0 .276.224.5.5.5h.955c1.149 0 2.252-.457 3.064-1.269l6.715-6.715c.85-.85 1.013-2.236.252-3.167-.875-1.07-2.456-1.129-3.409-.176zm4.664 4.664c-1.195 1.196-2.786 1.855-4.479 1.855h-1.455c-1.104 0-2-.896-2-2v-1.455c0-1.692.659-3.282 1.855-4.479l5.468-5.466c-.697-.37-1.48-.599-2.323-.599h-10c-2.757 0-5 2.243-5 5v14c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5v-8.921l-2.066 2.066zm-9.767 4.522-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.993-.101-1.411.363-.417.994-.462 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0-5-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.419.994-.461 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0-4.96-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.418.994-.461 1.411-.101l.689.598c.103.094.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm7.833 11.293h-4c-.553 0-1-.447-1-1s.447-1 1-1h4c.553 0 1 .447 1 1s-.447 1-1 1z" />
                                </svg>

                                <span className="fs-5 fw-bold me-3">
                                    GRN Document
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
                                                    <input type="text" placeholder="Enter Amendment" className="form-control" disabled />
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
                                                    <label className='form-label'>Inward Number <span className='text-danger'>*</span></label>
                                                    <input type="text" placeholder="Enter Inward Number" className="form-control" disabled />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label date-label'>Inward Date <span className='text-danger'>*</span></label>
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
                                                    <label className='form-label'>Store <span className='text-danger'>*</span></label>
                                                    <div className='custom-select-wrap'>
                                                        <Select
                                                            name="DocumentNumber"
                                                            options={documentNumber}
                                                            placeholder="Select..."
                                                            onChange={handleChangeDocumentNumber}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='form-label date-label'>Testing Date <span className='text-danger'>*</span></label>
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
                                                    PO Quantity
                                                </th>
                                                <th className='min-width-150'>
                                                    Units
                                                </th>
                                                <th className='min-width-150 text-end'>
                                                    Alternate Unit
                                                </th>
                                                <th className='min-width-150 text-end'>
                                                    Delivered Now
                                                </th>
                                                <th className='min-width-150 text-end'>
                                                    <div>
                                                        Accepted
                                                    </div>
                                                </th>
                                                <th className='min-width-150 text-end'>
                                                    <div>
                                                        Rejected
                                                    </div>
                                                </th>
                                                <th className='min-width-200'>
                                                    Comments
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>                                            
                                            {rowData.map((row) => (
                                                <tr key={row.id}>
                                                    <td>
                                                        <button type="button" className="link-btn">
                                                            <i className="fas fa-minus-circle text-danger"></i>
                                                        </button>
                                                    </td>
                                                    <td className="min-width-150">
                                                        <Tooltip title={row.materialCode}>
                                                            <span>{row.materialCode}</span>
                                                        </Tooltip>
                                                    </td>
                                                    <td className="min-width-200">
                                                        <Tooltip title={row.materialName}>
                                                            <span>{row.materialName}</span>
                                                        </Tooltip>
                                                    </td>
                                                    <td className="min-width-150 text-end">
                                                        <span>{row.quantity}</span>
                                                    </td>
                                                    <td className="min-width-150">
                                                        <span>{row.unit}</span>
                                                    </td>
                                                    <td className="min-width-150 text-end">
                                                        <span>{row.reserved}</span>
                                                    </td>
                                                    <td className="min-width-150 text-end">
                                                        <span>{row.available}</span>
                                                    </td>
                                                    <td className="min-width-150 text-end">
                                                        <span>
                                                            <input
                                                                type="text"
                                                                className="cn_table_input text-end"
                                                                value={row.acceptedQty}
                                                                onChange={(e) =>
                                                                    console.log(`Input 1 for ${row.materialCode}:`, e.target.value)
                                                                }
                                                            />
                                                        </span>
                                                    </td>
                                                    <td className="min-width-150 text-end">
                                                        <span>{row.rejected}</span>
                                                    </td>
                                                    <td className="min-width-150 text-end">
                                                        <span>
                                                            <input
                                                                type="text"
                                                                className="cn_table_input"
                                                                value={row.comment}
                                                                onChange={(e) =>
                                                                    console.log(`Input 2 for ${row.materialCode}:`, e.target.value)
                                                                }
                                                            />
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
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

export default GoodsReceiptNote