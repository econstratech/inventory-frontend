import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import { PrivateAxios } from '../../environment/AxiosInstance';

function AddCompany({ editUserShow, editUserModalClose, GetCompany }) {
    const [company, setCompany] = useState({
        "company_name": "",
        "company_email": "",
        "company_phone": "",
        "isd": "",
        "address": "",
        "is_variant_based": "",
        // "whatsapp_no": "",
        "w_isd": "",
        "renew_date": "",
        "contact_name": "",
        "contact_email": "",
        "contact_phone": "",
        "contact_isd": "",
        "contact_wid": "",
        "contact_whatsapp_no": "",
        "name": "",
        "email": "",
        "password": "",
    })

    const submitUser = (e) => {
        e.preventDefault();
        if (company.tasktracker == 0 && company.helpticket == 0 && company.checksheet == 0 && company.helpticket == 0) {
            ErrorMessage("Please select any one permission !");
            return;
        }

        PrivateAxios.post('company/create-company', company)
            .then((res) => {
                SuccessMessage(res.data.msg)
                GetCompany();
                setCompany({
                    "company_name": "",
                    "company_email": "",
                    "company_phone": "",
                    "isd": "",
                    "address": "",
                    "is_variant_based": "",
                    "whatsapp_no": "",
                    "w_isd": "",
                    "renew_date": "",
                    "contact_name": "",
                    "contact_email": "",
                    "contact_phone": "",
                    "contact_isd": "",
                    "contact_whatsapp_no": "",
                    "contact_wid": "",
                    "name": "",
                    "email": "",
                    "password": ""

                })
                editUserModalClose();
            }).catch((err) => {
                ErrorMessage(err.response.data.msg);
            })

    }

    const clearAll = () => {
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
            "name": "",
            "email": "",
            "password": "",
            "renew_date": ''
        })
    }

    return (
        <Modal id="editUserModal" show={editUserShow} onHide={() => { editUserModalClose(); clearAll() }} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton className="gth-blue-light-bg">
                <Modal.Title className="gth-modal-title"> Add New Company</Modal.Title>
            </Modal.Header>
            <form onSubmit={submitUser}>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Name <span className="text-exp-red">*</span></label>
                                <input type="text" value={company.company_name} required className="form-control" onChange={(e) => setCompany({ ...company, company_name: e.target.value })} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Email <span className="text-exp-red">*</span></label>
                                <input type="email" required className="form-control" onChange={(e) => setCompany({ ...company, company_email: e.target.value })} value={company.company_email} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Phone <span className="text-exp-red">*</span></label>
                                <PhoneInput
                                    country={'in'}
                                    value={`${company.isd}${company.company_phone}`}
                                    onChange={(value, country) => {
                                        const code = `${country.dialCode}`;
                                        const number = value.replace(code, '');
                                        setCompany({ ...company, company_phone: number, isd: code })
                                    }}
                                />
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
                                            onChange={(e) => setCompany({ ...company, is_variant_based: e.target.value })}
                                            required
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
                                            onChange={(e) => setCompany({ ...company, is_variant_based: e.target.value })}
                                            required
                                        />
                                        <label className="form-check-label" htmlFor="is_variant_based_no">
                                            No
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Whatsapp Number</label>
                                <input type="number" required className="form-control" onChange={(e) => setCompany({ ...company, whatsapp_no: e.target.value })} value={company.whatsapp_no} />
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
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Person WhatsApp Number </label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, contact_whatsapp_no: e.target.value })} value={company.contact_whatsapp_no} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Owner Name <span className="text-exp-red">*</span></label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, owner_name: e.target.value })} value={company.owner_name} />
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Owner Email <span className="text-exp-red">*</span></label>
                                <input type="email" className="form-control" onChange={(e) => setCompany({ ...company, owner_email: e.target.value })} value={company.owner_email} />
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Password <span className="text-exp-red">*</span></label>
                                <input type="text" required className="form-control" onChange={(e) => setCompany({ ...company, password: e.target.value })} value={company.password} />
                            </div>
                        </div>
                        
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Renew Date <span className="text-exp-red">*</span></label>
                                <input type="date" required className="form-control" onChange={(e) => setCompany({ ...company, renew_date: e.target.value })} value={company.renew_date} />
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Address <span className="text-exp-red">*</span></label>
                                <textarea type="email" required className="form-control" onChange={(e) => setCompany({ ...company, address: e.target.value })} >{company.address}</textarea>
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