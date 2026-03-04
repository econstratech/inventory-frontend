import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import { PrivateAxios } from '../../environment/AxiosInstance';

function AddCompany({ editUserShow, editUserModalClose, GetCompany }) {
    const [company, setCompany] = useState({
        "name": "",
        "email": "",
        "phone": "",
        "isd": "",
        "address": "",
        // "whatsapp_no": "",
        "w_isd": "",
        "password": "",
        "contact_person_name": "",
        "contact_person_email": "",
        "contact_person_contact_no": "",
        "contact_person_isd": "",
        // "contact_person_whats_app_number": "",
        "contact_person_wid": "",
        "owner_name": "",
        "amount": "",
        "tasktracker": 0,
        "checksheet": 0,
        "workflow": 0,
        "renew_date": ""
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
                    "name": "",
                    "email": "",
                    "phone": "",
                    "isd": "",
                    "address": "",
                    // "whatsapp_no": "",
                    "w_isd": "",
                    "password": "",
                    "contact_person_name": "",
                    "contact_person_email": "",
                    "contact_person_contact_no": "",
                    "contact_person_isd": "",
                    // "contact_person_whats_app_number": "",
                    "contact_person_wid": "",
                    "owner_name": "",
                    "amount": "",
                    "tasktracker": 0,
                    "checksheet": 0,
                    "workflow": 0,
                    "renew_date": ""
                })
                editUserModalClose();
            }).catch((err) => {
                ErrorMessage(err.response.data.msg);
            })

    }

    const clearAll = () => {
        setCompany({
            "name": "",
            "email": "",
            "phone": "",
            "isd": "",
            "address": "",
            // "whatsapp_no": "",
            "w_isd": "",
            "password": "",
            "contact_person_name": "",
            "contact_person_email": "",
            "contact_person_contact_no": "",
            "contact_person_isd": "",
            // "contact_person_whats_app_number": "",
            "contact_person_wid": "",
            "owner_name": "",
            "amount": "",
            "tasktracker": 0,
            "checksheet": 0,
            "workflow": 0,
            "renew_date": ''
        })
    }

    // const [permission, setPermission] = useState({

    // })
    return (
        <Modal id="editUserModal" show={editUserShow} onHide={() => { editUserModalClose(); clearAll() }} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton className="gth-blue-light-bg">
                <Modal.Title className="gth-modal-title">Add Company</Modal.Title>
            </Modal.Header>
            <form onSubmit={submitUser}>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Name <span className="text-exp-red">*</span></label>
                                <input type="text" value={company.name} required className="form-control" onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Email <span className="text-exp-red">*</span></label>
                                <input type="email" required className="form-control" onChange={(e) => setCompany({ ...company, email: e.target.value })} value={company.email} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Phone <span className="text-exp-red">*</span></label>
                                <PhoneInput
                                    country={'in'}
                                    value={`${company.isd}${company.phone}`}
                                    onChange={(value, country) => {
                                        const code = `${country.dialCode}`;
                                        const number = value.replace(code, '');
                                        setCompany({ ...company, phone: number, isd: code })
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
                                <label className="form-label">Password <span className="text-exp-red">*</span></label>
                                <input type="text" required className="form-control" onChange={(e) => setCompany({ ...company, password: e.target.value })} value={company.password} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Address <span className="text-exp-red">*</span></label>
                                <textarea type="email" required className="form-control" onChange={(e) => setCompany({ ...company, address: e.target.value })} >{company.address}</textarea>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Amount <span className="text-exp-red">*</span></label>
                                <input type="number" required className="form-control" onChange={(e) => setCompany({ ...company, amount: e.target.value })} value={company.amount} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Person Name </label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, contact_person_name: e.target.value })} value={company.contact_person_name} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Person Email </label>
                                <input type="email" className="form-control" onChange={(e) => setCompany({ ...company, contact_person_email: e.target.value })} value={company.contact_person_email} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Person Contact No </label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, contact_person_contact_no: e.target.value })} value={company.contact_person_contact_no} />
                            </div>
                        </div>
                        {/* <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Person WhatsApp Number </label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, contact_person_whats_app_number: e.target.value })} value={company.contact_person_whats_app_number} />
                            </div>
                        </div> */}
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Owner Name </label>
                                <input type="text" className="form-control" onChange={(e) => setCompany({ ...company, owner_name: e.target.value })} value={company.owner_name} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Renew Date <span className="text-exp-red">*</span></label>
                                <input type="date" required className="form-control" onChange={(e) => setCompany({ ...company, renew_date: e.target.value })} value={company.renew_date} />
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