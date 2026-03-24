import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import { PrivateAxios } from '../../environment/AxiosInstance';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AddCompany({ editUserShow, editUserModalClose, GetCompany }) {
    const [company, setCompany] = useState({
        "company_name": "",
        "company_email": "",
        "company_phone": "",
        "isd": "",
        "address": "",
        "is_variant_based": "",
        // "whatsapp_no": "",
        "w_isd": "91",
        "renew_date": "",
        "contact_name": "",
        "contact_email": "",
        "contact_phone": "",
        "contact_isd": "",
        "contact_wid": "",
        "whatsapp_number": "",
        // "name": "",
        // "email": "",
        "password": "",
        "owner_name": "",
        "owner_email": "",
    })

    const [errors, setErrors] = useState({});

    const clearFieldError = (field) => {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validateCompanyForm = () => {
        const next = {};
        if (!company.company_name?.trim()) {
            next.company_name = "Company name is required.";
        }
        if (!company.company_email?.trim()) {
            next.company_email = "Company email is required.";
        } else if (!emailRegex.test(company.company_email.trim())) {
            next.company_email = "Please enter a valid company email address.";
        }
        if (!company.company_phone?.trim()) {
            next.company_phone = "Company phone number is required.";
        }
        if (company.is_variant_based !== "0" && company.is_variant_based !== "1") {
            next.is_variant_based = "Please select whether the company is variant based (Yes or No).";
        }
        if (!company.owner_name?.trim()) {
            next.owner_name = "Owner name is required.";
        }
        if (!company.owner_email?.trim()) {
            next.owner_email = "Owner email is required.";
        } else if (!emailRegex.test(company.owner_email.trim())) {
            next.owner_email = "Please enter a valid owner email address.";
        }
        if (!company.password?.trim()) {
            next.password = "Password is required.";
        }
        if (!company.renew_date) {
            next.renew_date = "Renew date is required.";
        }
        if (!company.address?.trim()) {
            next.address = "Address is required.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const submitCreateComany = (e) => {
        e.preventDefault();
        if (!validateCompanyForm()) {
            return;
        }
        if (company.tasktracker == 0 && company.helpticket == 0 && company.checksheet == 0 && company.helpticket == 0) {
            ErrorMessage("Please select any one permission !");
            return;
        }

        // console.log("company", company);
        // return;

        PrivateAxios.post('company/create-company', company)
            .then((res) => {
                SuccessMessage(res.data.message)
                GetCompany();
                setCompany({
                    "company_name": "",
                    "company_email": "",
                    "company_phone": "",
                    "isd": "",
                    "address": "",
                    "is_variant_based": "",
                    "whatsapp_number": "",
                    "w_isd": "",
                    "renew_date": "",
                    "contact_name": "",
                    "contact_email": "",
                    "contact_phone": "",
                    "contact_isd": "",
                    "contact_wid": "",
                    "password": "",
                    "owner_name": "",
                    "owner_email": "",
                })
                setErrors({});
                editUserModalClose();
            }).catch((err) => {
                ErrorMessage(err.response.data.msg);
            })

    }

    const clearAll = () => {
        setErrors({});
        setCompany({
            "company_name": "",
            "company_email": "",
            "company_phone": "",
            "isd": "",
            "address": "",
            "is_variant_based": "",
            "whatsapp_no": "",
            "w_isd": "",
            "contact_name": "",
            "contact_email": "",
            "contact_phone": "",
            "contact_person_contact_no": "",
            "contact_person_isd": "",
            "contact_person_wid": "",
            "password": "",
            "renew_date": '',
            "owner_name": "",
            "owner_email": "",
        })
    }

    return (
        <Modal id="editUserModal" show={editUserShow} onHide={() => { editUserModalClose(); clearAll() }} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton className="gth-blue-light-bg">
                <Modal.Title className="gth-modal-title"> Add New Company</Modal.Title>
            </Modal.Header>
            <form onSubmit={submitCreateComany}>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Name <span className="text-exp-red">*</span></label>
                                <input type="text" value={company.company_name} className="form-control" onChange={(e) => { clearFieldError("company_name"); setCompany({ ...company, company_name: e.target.value }); }} />
                                {errors.company_name && <span className="error-message text-danger small d-block mt-1">{errors.company_name}</span>}
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Email <span className="text-exp-red">*</span></label>
                                <input type="email" className="form-control" onChange={(e) => { clearFieldError("company_email"); setCompany({ ...company, company_email: e.target.value }); }} value={company.company_email} />
                                {errors.company_email && <span className="error-message text-danger small d-block mt-1">{errors.company_email}</span>}
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Phone <span className="text-exp-red">*</span></label>
                                <PhoneInput
                                    country={'in'}
                                    value={`${company.isd}${company.company_phone}`}
                                    onChange={(value, country) => {
                                        clearFieldError("company_phone");
                                        const code = `${country.dialCode}`;
                                        const number = value.replace(code, '');
                                        setCompany({ ...company, company_phone: number, isd: code })
                                    }}
                                />
                                {errors.company_phone && <span className="error-message text-danger small d-block mt-1">{errors.company_phone}</span>}
                            </div>
                        </div>
                        {/* <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">WhatsApp</label>
                                <PhoneInput
                                    required
                                    country={'in'}
                                    value={`${company.w_isd}${company.whatsapp_no}`}
                                    onChange={(value, country) => {
                                        const code = `${country.dialCode}`;
                                        const number = value.replace(code, '');
                                        setCompany({ ...company, whatsapp_no: number, w_isd: code })
                                    }}
                                />
                            </div>
                        </div> */}

                  
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Is Variant Based? <span className="text-exp-red">*</span></label>
                                <div className="d-flex align-items-center gap-4 mt-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="is_variant_based"
                                            id="is_variant_based_yes"
                                            value="1"
                                            checked={String(company.is_variant_based) === "1"}
                                            onChange={(e) => { clearFieldError("is_variant_based"); setCompany({ ...company, is_variant_based: e.target.value }); }}
                                        />
                                        <label className="form-check-label" htmlFor="is_variant_based_yes">
                                            Yes
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="is_variant_based"
                                            id="is_variant_based_no"
                                            value="0"
                                            checked={String(company.is_variant_based) === "0"}
                                            onChange={(e) => { clearFieldError("is_variant_based"); setCompany({ ...company, is_variant_based: e.target.value }); }}
                                        />
                                        <label className="form-check-label" htmlFor="is_variant_based_no">
                                            No
                                        </label>
                                    </div>
                                </div>
                                {errors.is_variant_based && <span className="error-message text-danger small d-block mt-1">{errors.is_variant_based}</span>}
                            </div>
                        </div>
                        
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Whatsapp Number</label>
                                <input type="number" className="form-control" onChange={(e) => setCompany({ ...company, whatsapp_number: e.target.value })} value={company.whatsapp_number} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Person Name </label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, contact_name: e.target.value })} value={company.contact_name} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Person Email </label>
                                <input type="email" className="form-control" onChange={(e) => setCompany({ ...company, contact_email: e.target.value })} value={company.contact_email} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                                <div className="form-group">
                                    <label className="form-label">Contact Person Phone No </label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, contact_phone: e.target.value })} value={company.contact_phone} />
                            </div>
                        </div>
                        {/* <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Person WhatsApp Number </label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, whatsapp_number: e.target.value })} value={company.whatsapp_number} />
                            </div>
                        </div> */}
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Owner Name <span className="text-exp-red">*</span></label>
                                <input type="text" className="form-control" onChange={(e) => { clearFieldError("owner_name"); setCompany({ ...company, owner_name: e.target.value }); }} value={company.owner_name} />
                                {errors.owner_name && <span className="error-message text-danger small d-block mt-1">{errors.owner_name}</span>}
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Owner Email <span className="text-exp-red">*</span></label>
                                <input type="email" className="form-control" onChange={(e) => { clearFieldError("owner_email"); setCompany({ ...company, owner_email: e.target.value }); }} value={company.owner_email} />
                                {errors.owner_email && <span className="error-message text-danger small d-block mt-1">{errors.owner_email}</span>}
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Password <span className="text-exp-red">*</span></label>
                                <input type="text" className="form-control" onChange={(e) => { clearFieldError("password"); setCompany({ ...company, password: e.target.value }); }} value={company.password} />
                                {errors.password && <span className="error-message text-danger small d-block mt-1">{errors.password}</span>}
                            </div>
                        </div>
                        
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Renew Date <span className="text-exp-red">*</span></label>
                                <input type="date" className="form-control" onChange={(e) => { clearFieldError("renew_date"); setCompany({ ...company, renew_date: e.target.value }); }} value={company.renew_date} />
                                {errors.renew_date && <span className="error-message text-danger small d-block mt-1">{errors.renew_date}</span>}
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Address <span className="text-exp-red">*</span></label>
                                <textarea className="form-control" value={company.address} onChange={(e) => { clearFieldError("address"); setCompany({ ...company, address: e.target.value }); }} />
                                {errors.address && <span className="error-message text-danger small d-block mt-1">{errors.address}</span>}
                            </div>
                        </div>


                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-exp-green'>
                        Create
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

export default AddCompany