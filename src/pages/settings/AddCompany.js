import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import { PrivateAxios } from '../../environment/AxiosInstance';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RadioCard = ({ name, id, value, checked, onChange, label, activeColor = "#1d4ed8", activeBg = "#eff6ff" }) => (
    <label
        htmlFor={id}
        className="mb-0"
        style={{
            cursor: "pointer",
            flex: 1,
            padding: "10px 14px",
            border: checked ? `2px solid ${activeColor}` : "1px solid #e2e8f0",
            borderRadius: 8,
            background: checked ? activeBg : "#fff",
            display: "flex",
            alignItems: "center",
            gap: 10,
            transition: "all .15s",
            userSelect: "none",
        }}
    >
        <input
            type="radio"
            className="form-check-input m-0"
            name={name}
            id={id}
            value={value}
            checked={checked}
            onChange={onChange}
            style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
        />
        <span className="fw-semibold" style={{ fontSize: 14, color: checked ? activeColor : "#475569" }}>
            {label}
        </span>
    </label>
)

const YesNoRadioGroup = ({ name, value, onChange, yesValue = "1", noValue = "0" }) => (
    <div className="d-flex align-items-stretch gap-2 mt-2">
        <RadioCard
            name={name}
            id={`${name}_yes`}
            value={yesValue}
            checked={String(value) === String(yesValue)}
            onChange={onChange}
            label="Yes"
            activeColor="#16a34a"
            activeBg="#f0fdf4"
        />
        <RadioCard
            name={name}
            id={`${name}_no`}
            value={noValue}
            checked={String(value) === String(noValue)}
            onChange={onChange}
            label="No"
            activeColor="#64748b"
            activeBg="#f1f5f9"
        />
    </div>
)

function AddCompany({ editUserShow, editUserModalClose, GetCompany }) {
    const [company, setCompany] = useState({
        "company_name": "",
        "company_email": "",
        "company_phone": "",
        "isd": "",
        "address": "",
        "is_variant_based": "",
        "is_gst_enabled": "1",
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
        "allowed_modules": [],
    })

    const [errors, setErrors] = useState({});
    const [availableModules, setAvailableModules] = useState([]);

    useEffect(() => {
        if (!editUserShow) return;
        PrivateAxios.get('/module/all-modules')
            .then((res) => {
                const list = res.data?.data ?? res.data ?? [];
                setAvailableModules(Array.isArray(list) ? list : []);
            })
            .catch(() => setAvailableModules([]));
    }, [editUserShow]);

    const toggleModule = (moduleId, checked) => {
        clearFieldError("allowed_modules");
        setCompany((prev) => {
            const current = Array.isArray(prev.allowed_modules) ? prev.allowed_modules : [];
            const next = checked
                ? Array.from(new Set([...current, Number(moduleId)]))
                : current.filter((id) => Number(id) !== Number(moduleId));
            return { ...prev, allowed_modules: next };
        });
    };

    const toggleAllModules = (checked) => {
        clearFieldError("allowed_modules");
        setCompany((prev) => ({
            ...prev,
            allowed_modules: checked ? availableModules.map((m) => Number(m.id)) : [],
        }));
    };

    const allModulesSelected =
        availableModules.length > 0 &&
        availableModules.every((m) =>
            (company.allowed_modules || []).map(Number).includes(Number(m.id))
        );

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
        if (!Array.isArray(company.allowed_modules) || company.allowed_modules.length === 0) {
            next.allowed_modules = "Please select at least one module.";
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

        const payload = {
            ...company,
            is_gst_enabled: String(company.is_gst_enabled) === "1" ? 1 : 0,
            allowed_modules: (company.allowed_modules || []).map((id) => Number(id)),
        }
        PrivateAxios.post('company/create-company', payload)
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
                    "is_gst_enabled": "1",
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
                    "allowed_modules": [],
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
            "is_gst_enabled": "1",
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
            "allowed_modules": [],
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
                                <YesNoRadioGroup
                                    name="add_is_variant_based"
                                    value={company.is_variant_based}
                                    onChange={(e) => { clearFieldError("is_variant_based"); setCompany({ ...company, is_variant_based: e.target.value }); }}
                                />
                                {errors.is_variant_based && <span className="error-message text-danger small d-block mt-1">{errors.is_variant_based}</span>}
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Is GST Enabled?</label>
                                <YesNoRadioGroup
                                    name="add_is_gst_enabled"
                                    value={company.is_gst_enabled}
                                    onChange={(e) => setCompany({ ...company, is_gst_enabled: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='col-12'>
                            <div className="form-group">
                                <label className="form-label">Modules <span className="text-exp-red">*</span></label>
                                {availableModules.length === 0 ? (
                                    <div className="text-muted small">No modules available.</div>
                                ) : (
                                    <div className="d-flex flex-wrap">
                                        <label className="custom-checkbox me-3 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={allModulesSelected}
                                                onChange={(e) => toggleAllModules(e.target.checked)}
                                            />
                                            <span className="checkmark" />
                                            <span className="text-">All</span>
                                        </label>
                                        {availableModules.map((m) => (
                                            <label key={m.id} className="custom-checkbox me-3 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={(company.allowed_modules || []).map(Number).includes(Number(m.id))}
                                                    onChange={(e) => toggleModule(m.id, e.target.checked)}
                                                />
                                                <span className="checkmark" />
                                                <span className="text-">{m.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {errors.allowed_modules && <span className="error-message text-danger small d-block mt-1">{errors.allowed_modules}</span>}
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