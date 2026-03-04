import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const LocationModal = ({
    show,
    onClose,
    selectedLocationIndex = 0, // Set default selected index to 0
    title,
}) => {
    const locations = [
        {
            locationPoint: "Main",
            address: "Main Address, Mumbai (Maharashtra)",
            pincode: "India - 400001"
        },
        {
            locationPoint: "Location 2",
            address: "Branch Office, Delhi",
            pincode: "India - 110001"
        },
        {
            locationPoint: "Location 3",
            address: "Regional Office, Bangalore",
            pincode: "India - 560001"
        },
        {
            locationPoint: "Location 4",
            address: "Warehouse, Chennai",
            pincode: "India - 600001"
        },
        {
            locationPoint: "Location 5",
            address: "Head Office, Kolkata",
            pincode: "India - 700001"
        },
        {
            locationPoint: "Location 6",
            address: "Remote Office, Hyderabad",
            pincode: "India - 500001"
        },
        {
            locationPoint: "Location 7",
            address: "Support Center, Pune",
            pincode: "India - 411001"
        },
    ];

    //GSTIN Type
    const GSTINType = [
        { value: 'Regular', label: 'Regular' },
        { value: 'Unregistered', label: 'Unregistered' },
        { value: 'Composition', label: 'Composition' },
        { value: 'Consumer', label: 'Consumer' },
        { value: 'Unknown', label: 'Unknown' }
    ];
    const handleChangeGSTINType = (selectedGSTINType) => {
        console.log('Selected ', selectedGSTINType);
    };

    //add new location
    const [showAddLocation, setShowAddLocation] = useState(false);

    const handleAddNewLocation = () => {
        setShowAddLocation(!showAddLocation);
    };

    const handleNewLocationCancel = () => {
        setShowAddLocation(false);
    };
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


    return (
        <form>
            <Modal
                id="BillingLocationModal"
                show={show}
                onHide={onClose}
                backdrop="static"
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">{title} Location Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="moday-body-overflow-none ">
                    <div className={`mb-3 text-end add_new_btn ${showAddLocation ? 'd-none' : ''}`}>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleAddNewLocation}
                        >
                            <i className="fas fa-map-pin me-2"></i>Add New Location
                        </button>
                    </div>
                    <div
                        className={`card shadow-none border add_new_wrap ${showAddLocation ? '' : 'd-none'}`}
                    >
                        <div className='card-header gth-bg-blue-light'>
                            <h5 className='card-title'>Add New Delivery Location Details</h5>
                        </div>
                        <div className='card-body'>
                            <div className='row'>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Company</label>
                                        <input type="text" placeholder="Company" className="form-control" disabled />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Location <span className='text-danger'>*</span></label>
                                        <input type="text" placeholder="Enter Location" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>GSTIN Type</label>
                                        <div className='custom-select-wrap'>
                                            <Select
                                                name="GSTINType"
                                                options={GSTINType}
                                                placeholder="Select..."
                                                onChange={handleChangeGSTINType}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>GSTIN</label>
                                        <input type="text" placeholder="Enter GSTIN " className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Address 1 <span className='text-danger'>*</span></label>
                                        <input type="text" placeholder="Enter Address 1" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Address 2 <span className='text-danger'>*</span></label>
                                        <input type="text" placeholder="Enter Address 2" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Pin</label>
                                        <input type="text" placeholder="Enter Pin" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>City</label>
                                        <input type="text" placeholder="Enter City" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>Country <span className='text-danger'>*</span></label>
                                        <div className='custom-select-wrap'>
                                            <Select
                                                name="Country"
                                                options={Country}
                                                placeholder="Select..."
                                                onChange={handleChangeCountry}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>State <span className='text-danger'>*</span></label>
                                        <input type="text" placeholder="Enter State" className="form-control" />
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='form-group'>
                                        <label className="custom-checkbox me-0 mb-0">
                                            <input
                                                type="checkbox"
                                            />
                                            <span className="checkmark" />
                                            <span className="text-">Also mark the address as Billing address</span>
                                        </label>
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Billing Address Name</label>
                                        <input type="text" placeholder="Enter Billing Address Name" className="form-control" />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-end gap-3'>
                                    <button
                                        type='submit'
                                        className='btn btn-secondary'
                                        onClick={handleNewLocationCancel}
                                    >Cancel</button>
                                    <button
                                        type='submit'
                                        className='btn btn-success'
                                    >Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="position-relative">
                        <input type="search" className="form-control pe-5" placeholder="Search..." />
                        <span className="search-icon">
                            <i class="fas fa-search text-primary"></i>
                        </span>
                    </div>
                    <div className="location_wrap">
                        {locations.map((location, index) => (
                            <div
                                className={`location_items ${index === selectedLocationIndex ? "selected" : ""
                                    }`}
                                key={index}
                            >
                                <div className="w-100">
                                    <p className="mb-0 f-s-12 gth-text-dark">
                                        <b>{location.locationPoint}</b>
                                    </p>
                                    <p className="mb-0 f-s-12 gth-text-dark">{location.address}</p>
                                    <p className="mb-0 f-s-12 gth-text-dark">{location.pincode}</p>
                                </div>
                                <button type="button" className="icon-btn" onClick={handleAddNewLocation}>
                                    <i className="fas fa-pen"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                </Modal.Body>
            </Modal>
        </form>
    );
};

export default LocationModal;