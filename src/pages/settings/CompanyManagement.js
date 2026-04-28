import React, { useEffect, useState, useRef } from 'react'
import DataTable from 'react-data-table-component'
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import PhoneInput from 'react-phone-input-2'
import moment from 'moment'

import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage'
import { PrivateAxios } from '../../environment/AxiosInstance'
import AddCompany from './AddCompany'
import AddUser from './AddUser'

const initialEditData = {
    id: "",
    name: "",
    company_name: "",
    company_email: "",
    company_phone: "",
    c_p_isd: "91",
    whatsapp_number: "",
    w_isd: "91",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    p_isd: "91",
    owner_name: "",
    owner_email: "",
    address: "",
    renew_date: "",
    is_variant_based: "",
    min_purchase_amount: "",
    min_sale_amount: "",
    is_production_planning: "",
    production_without_bom: "",
    allowed_modules: [],
}

const parseAllowedModules = (raw) => {
    if (Array.isArray(raw)) return raw.map(Number).filter((n) => !Number.isNaN(n))
    if (typeof raw === "string" && raw.trim()) {
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => !Number.isNaN(n))
        } catch {
            // ignore — fall through to empty
        }
    }
    return []
}

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


function CompanyManagement() {

    // const [data, setData] = useState([])
    const [companies, setCompanies] = useState([])
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalRows, setTotalRows] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchKey, setSearchKey] = useState('')
    const [searchKeyDebounced, setSearchKeyDebounced] = useState('')
    const searchDebounceRef = useRef(null)

    const GetCompany = (pageNum = page, pageSize = limit, searchParam = searchKeyDebounced) => {
        setLoading(true)
        const params = { page: pageNum, limit: pageSize }
        if (searchParam && String(searchParam).trim()) {
            params.searchkey = String(searchParam).trim()
        }
        PrivateAxios.get('company/active-company', { params })
            .then((res) => {
                const data = res.data?.data ?? res.data
                const rows = data?.rows ?? data?.data ?? []
                const total = data?.pagination?.total_records ?? data?.total ?? rows.length
                setCompanies(Array.isArray(rows) ? rows : [])
                setTotalRows(Number(total) || 0)
            })
            .catch((err) => {
                console.error('Error fetching company data:', err)
                setCompanies([])
                setTotalRows(0)
            })
            .finally(() => setLoading(false))
    }



    const StatusChange = (id, status) => {
        // setData(prevent => prevent.map(step =>
        //     step.id === id ? { ...step, status: status ? 1 : 0 } : step 
        // ))
        PrivateAxios.post('update-status', { id: id, status: status })
            .then((res) => {
                SuccessMessage(res.data.msg)
            }).catch((err) => {

            })
    }

    //==========Edit Company Permission==============//
    const [permissionEditId, serPermissionEditId] = useState("")
    const [companyEditData, setCompanyEditData] = useState(initialEditData)
    const [availableModules, setAvailableModules] = useState([])
    const [editLoading, setEditLoading] = useState(false)
    const [editSaving, setEditSaving] = useState(false)
    const [editErrors, setEditErrors] = useState({})

    const clearEditFieldError = (field) => {
        setEditErrors((prev) => {
            if (!prev[field]) return prev
            const next = { ...prev }
            delete next[field]
            return next
        })
    }

    const getCompanyData = (id, rowData) => {
        setEditLoading(true)
        PrivateAxios.get(`company/company-info/${id}`)
            .then((res) => {
                const data = res.data?.data || {}
                const cd = data.companyDetails || {}
                const gs = cd.generalSettings || {}
                const mods = Array.isArray(data.modules) ? data.modules : []
                setAvailableModules(mods)
                setCompanyEditData({
                    id: cd.id || id,
                    name: cd.company_name || rowData?.company_name || "",
                    company_name: cd.company_name || "",
                    company_email: cd.company_email || "",
                    company_phone: cd.company_phone || "",
                    c_p_isd: cd.c_p_isd || "91",
                    whatsapp_number: cd.whatsapp_number || "",
                    w_isd: cd.w_isd || "91",
                    contact_name: cd.contact_name || "",
                    contact_email: cd.contact_email || "",
                    contact_phone: cd.contact_phone || "",
                    p_isd: cd.p_isd || "91",
                    owner_name: rowData?.users?.[0]?.name || "",
                    owner_email: rowData?.users?.[0]?.email || "",
                    address: cd.address || "",
                    renew_date: cd.renew_date ? String(cd.renew_date).slice(0, 10) : "",
                    is_variant_based:
                        gs.is_variant_based != null ? String(gs.is_variant_based) : "",
                    min_purchase_amount:
                        gs.min_purchase_amount != null ? String(gs.min_purchase_amount) : "",
                    min_sale_amount:
                        gs.min_sale_amount != null ? String(gs.min_sale_amount) : "",
                    is_production_planning:
                        gs.is_production_planning != null ? String(gs.is_production_planning) : "",
                    production_without_bom:
                        gs.production_without_bom != null ? String(gs.production_without_bom) : "",
                    allowed_modules: parseAllowedModules(cd.allowed_modules),
                })
            })
            .catch((err) => {
                ErrorMessage(err?.response?.data?.message || "Failed to fetch company details.")
            })
            .finally(() => setEditLoading(false))
    }

    const validateEditForm = () => {
        const next = {}
        if (!companyEditData.company_name?.trim()) next.company_name = "Company name is required."
        if (!companyEditData.company_email?.trim()) next.company_email = "Company email is required."
        if (!companyEditData.company_phone?.trim()) next.company_phone = "Company phone is required."
        if (companyEditData.is_variant_based !== "0" && companyEditData.is_variant_based !== "1") {
            next.is_variant_based = "Please select whether the company is variant based."
        }
        if (!companyEditData.renew_date) next.renew_date = "Renew date is required."
        if (!companyEditData.address?.trim()) next.address = "Address is required."
        if (!Array.isArray(companyEditData.allowed_modules) || companyEditData.allowed_modules.length === 0) {
            next.allowed_modules = "Please select at least one module."
        }
        setEditErrors(next)
        return Object.keys(next).length === 0
    }

    const UpdateSubmit = (e) => {
        e.preventDefault();
        if (!validateEditForm()) return
        setEditSaving(true)
        // console.log("companyEditData", companyEditData);
        // return;
        PrivateAxios.put(`company/update/${permissionEditId}`, companyEditData)
            .then((res) => {
                SuccessMessage(res.data.message);
                EditpermissionHide();
                GetCompany(page, limit);
            })
            .catch((err) => {
                ErrorMessage(err?.response?.data?.message || err?.response?.data?.msg || "Failed to update company.")
            })
            .finally(() => setEditSaving(false))
    }

    const [permissionEditModel, setEditpermissionModel] = useState(false);

    const EditpermissionShow = (data) => {
        setEditpermissionModel(true);
        serPermissionEditId(data.id);
        setEditErrors({})
        setCompanyEditData({ ...initialEditData, id: data.id, name: data.company_name })
        getCompanyData(data.id, data)
    }
    const EditpermissionHide = () => {
        setEditpermissionModel(false);
        serPermissionEditId("");
        setCompanyEditData(initialEditData)
        setAvailableModules([])
        setEditErrors({})
    }

    const toggleModule = (moduleId, checked) => {
        clearEditFieldError("allowed_modules")
        setCompanyEditData((prev) => {
            const current = Array.isArray(prev.allowed_modules) ? prev.allowed_modules : []
            const next = checked
                ? Array.from(new Set([...current, Number(moduleId)]))
                : current.filter((id) => Number(id) !== Number(moduleId))
            return { ...prev, allowed_modules: next }
        })
    }

    const toggleAllModules = (checked) => {
        clearEditFieldError("allowed_modules")
        setCompanyEditData((prev) => ({
            ...prev,
            allowed_modules: checked ? availableModules.map((m) => Number(m.id)) : [],
        }))
    }

    const allModulesSelected =
        availableModules.length > 0 &&
        availableModules.every((m) =>
            (companyEditData.allowed_modules || []).map(Number).includes(Number(m.id))
        )

    const selectedColumns = [
        {
            name: 'Sl No.',
            selector: (row, index) => (page - 1) * limit + index + 1,
            width: "80px",
        },
        {
            name: "Name",
            selector: (row) => row.company_name,
            sortable: true,
            width: "250px",
        },
        {
            name: "Email",
            selector: (row) => row.company_email,
            sortable: true,
            reorder: true,
            width: "260px"
        },
        {
            name: "Phone Number",
            selector: (row) => row.company_phone,
            sortable: true,
            reorder: true,
            width: "180px"
        },
        {
            name: "Owner Name",
            selector: (row) => row.users[0]?.name || "",
            sortable: true,
            reorder: true,
            width: "180px"
        },
        // {
        //     name: "Main Company",
        //     selector: (row) => row.main_company_id==0?"Main Company":data.find(item=>item.id==row.main_company_id).company_name,
        //     sortable: true,
        //     reorder: true,
        //     width: "180px"
        // },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            reorder: true,
            width: "200px",
            cell: (row) => (
                <div className='col-12'>
                    <div className='form-group mb-0 d-flex align-items-center gap-2'>
                        <span className='fw-bold text-muted text-red'>Inactive</span>
                        <label className="custom-switch" >
                            <input type="checkbox" name='is_require_file' checked={row.status == 1} onChange={(e) => StatusChange(row.id, e.target.checked)} />
                            <div className="switch-slider switch-round" />
                        </label>
                        <span className='fw-bold text-success'>Active</span>
                    </div>
                </div>
            )
        },
        {
            name: "Action",
            width: "170px",
            selector: (row) => '',
            cell: (row) => (
                <div className="d-flex">
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                View
                            </Tooltip>
                        }
                    >
                        <button className="me-1 table-action-btn" onClick={() => ShowModel(row)}>
                            <i className="fas fa-eye"></i>
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Edit
                            </Tooltip>
                        }
                    >
                        <button className="me-1 table-action-btn" onClick={() => EditpermissionShow(row)}>
                            <i className="fas fa-pen"></i>
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Add User
                            </Tooltip>
                        }
                    >
                        <button className="me-1 table-action-btn" onClick={() => ShoUserModel(row)}>
                            <i className="fas fa-user-plus"></i>
                        </button>
                    </OverlayTrigger>
                    {/* <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Activity Log
                            </Tooltip>
                        }
                    >
                        <button className="me-1 table-action-btn" onClick={() => ShowLog(row.id, row.company_name)}>
                            <i className="fas fa-history"></i>
                        </button>
                    </OverlayTrigger> */}
                    {/* <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Renew Date
                            </Tooltip>
                        }
                    >
                        <button className="me-1 table-action-btn" >
                            <i className="fa fa-retweet"></i>
                        </button>
                    </OverlayTrigger> */}
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                User List
                            </Tooltip>
                        }
                    >
                        <button className="me-1 table-action-btn" onClick={() => UserShowModal(row.id, row.company_name)}>
                            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width={14}
                                height={14}
                                fill="currentColor"
                                className="">
                                <path d="M21,11h-5c-1.654,0-3,1.346-3,3v7c0,1.654,1.346,3,3,3h5c1.654,0,3-1.346,3-3v-7c0-1.654-1.346-3-3-3Zm-1,9h-3c-.553,0-1-.448-1-1s.447-1,1-1h3c.553,0,1,.448,1,1s-.447,1-1,1Zm0-4.003h-3c-.553,0-1-.448-1-1s.447-1,1-1h3c.553,0,1,.448,1,1s-.447,1-1,1ZM3,6C3,2.691,5.691,0,9,0s6,2.691,6,6-2.691,6-6,6S3,9.309,3,6ZM12.026,24H1c-.557,0-1.001-.46-1-1.017,.009-4.955,4.043-8.983,9-8.983h0c.688,0,1.356,.085,2,.232v6.768c0,1.13,.391,2.162,1.026,3Z" />
                            </svg>
                        </button>
                    </OverlayTrigger>

                </div>
            ),
        },
    ];


    const [viewModel, setViewModel] = useState(false);
    const [viewModelData, setViewModelData] = useState('');
    const ShowModel = (data) => {
        setViewModel(true)
        console.log("data", data);
        setViewModelData(data)
    }
    const HideModel = () => {
        setViewModel(false);
        setViewModelData('')
    }

    const formatViewDate = (v) =>
        v && moment(v).isValid() ? moment(v).format("DD-MMMM-YYYY") : "—";

    const formatPhoneDisplay = (isd, phone) => {
        if (!phone) return "—";
        return `+${isd || ""} ${phone}`.replace(/\s+/g, " ").trim();
    };

    const variantBasedLabel = (v) => {
        if (v === 1 || v === "1") return "Yes";
        if (v === 0 || v === "0") return "No";
        return "—";
    };

    const yesNoLabel = (v) => {
        if (v === 1 || v === "1") return "Yes";
        if (v === 0 || v === "0") return "No";
        return "—";
    };

    // Inverted: production_without_bom=0 means "Has BOM = Yes"
    const hasBomLabel = (v) => {
        if (v === 0 || v === "0") return "Yes";
        if (v === 1 || v === "1") return "No";
        return "—";
    };

    const formatAmountDisplay = (v) => {
        if (v === undefined || v === null || v === "") return "—";
        const num = Number(v);
        if (Number.isFinite(num)) return new Intl.NumberFormat("en-IN").format(num);
        return v;
    };

    const viewField = (label, value) => {
        const display =
            value === undefined || value === null || value === ""
                ? "—"
                : value;
        return (
            <div className="col-md-6">
                <div className="company-view-field border rounded-3 p-3 h-100 bg-light">
                    <div className="text-muted small fw-semibold mb-1">{label}</div>
                    <div className="mb-0 text-break text-body">{display}</div>
                </div>
            </div>
        );
    };

    //==================Add Company========================//
    const [showAddCompany, setShowCompany] = useState(false)
    const ShowCompanyModel = () => {
        setShowCompany(true)
    }
    const HideCompanyModel = () => {
        setShowCompany(false)
    }

    //==================Add User========================//
    const [showAddUser, setShoUser] = useState(false)
    const [companyId, setCompanyId] = useState('')
    const ShoUserModel = (id) => {
        setShoUser(true)
        setCompanyId(id)
    }
    const HideUserModel = () => {
        setShoUser(false)
        setCompanyId('')
    }


    const [msg, setMsg] = useState('')
    const [error, setError] = useState(false)
    // const CreateSheet = () => {
    //     axios.get(`${url}checksheet/checksheet-remainder`)
    //         .then((res) => {
    //             setError(false)
    //             setMsg(res.data.message)
    //         }).catch((err) => {

    //             setError(true)
    //             setMsg("error occur")
    //         })
    // }

    const searchCompany = (e) => {
        setSearchKey(e.target.value)
    }

    // Debounce search key for API calls
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = setTimeout(() => {
            setSearchKeyDebounced(searchKey)
        }, 400)
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        }
    }, [searchKey])

    const prevSearchKeyRef = useRef(searchKeyDebounced)
    // Reset to first page when search key changes and fetch with page 1 to avoid double fetch
    useEffect(() => {
        const searchChanged = prevSearchKeyRef.current !== searchKeyDebounced
        if (searchChanged) {
            prevSearchKeyRef.current = searchKeyDebounced
            setPage(1)
            GetCompany(1, limit, searchKeyDebounced)
        } else {
            GetCompany(page, limit, searchKeyDebounced)
        }
    }, [page, limit, searchKeyDebounced])
    //===========Activity Log=================//
    const [logModal, setLogModal] = useState(false);
    const [compName, setComName] = useState('')
    const [activeLog, setActivelog] = useState('')
    const [activeLogAll, setActivelogAll] = useState('')

    // const getLogData = (id) => {
    //     PrivateAxios.get(`company/activity-log/${id}`)
    //         .then((res) => {
    //             setActivelog(res.data.data)
    //             setActivelogAll(res.data.data)
    //         }).catch((err) => {

    //         })
    // }

    // const ShowLog = (data, name) => {
    //     setComName(name);
    //     getLogData(data)
    //     setLogModal(true)
    // }
    const CloseLog = () => {
        setComName("");
        setLogModal(false)
    }


    const search = (e) => {

        const filteredItems = activeLogAll.filter((item) => {
            return item && item.message && item.message.toLowerCase().replace(/\s+/g, '').includes(e.target.value.toLowerCase().replace(/\s+/g, ''))
        }
        );
        setActivelog(filteredItems);
    }

    const AllActivityColumns = [
        {
            name: 'Sl No.',
            selector: (row, index) => index + 1,
            width: "80px",
        },
        {
            name: "User Name",
            selector: (row) => row.user.name,
            sortable: true,
            width: "250px",
        },
        {
            name: "Message",
            selector: (row) => row.message,
            sortable: true,
            reorder: true,
            maxWidth: "500px",
            cell: (row) => (
                <div style={{
                    whiteSpace: "normal",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                }}>
                    {row.message}
                </div>
            ),
        },
        {
            name: "Date",
            selector: (row) => moment(row.created_at).format("DD-MM-YYYY hh:mm A"),
            sortable: true,
            reorder: true,
            width: "260px"
        },
    ];

    //===============User List================//
    const [UserModal, setUserModal] = useState(false);
    const [UserModalName, setUserModalName] = useState("");
    const [UserList, setUserList] = useState([]);
    const GetuserList = (id) => {
        PrivateAxios.get(`company/user-list/${id}`)
            .then((res) => {
                setUserList(res.data.data);
            }).catch((err) => {

            })
    }
    const UserShowModal = (id, name) => {
        setUserModal(true);
        GetuserList(id)
        setUserModalName(name)
    }
    const UserCloseModal = () => {
        setUserModal(false);
        setUserModalName("")
    }

    const AllUserColumns = [
        {
            name: 'Sl No.',
            selector: (row, index) => index + 1,
            width: "80px",
        },
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
            width: "250px",
        },
        {
            name: "Email",
            selector: (row) => row.email,
            sortable: true,
            maxWidth: "250px",
        },
        {
            name: "User Type",
            selector: (row) => row.position,
            sortable: false,
            width: "250px",
        },
        {
            name: "Phone",
            selector: (row) => row.phone_number || "—",
            sortable: true,
            reorder: true,
            width: "260px"
        },
    ];

    return (
        <React.Fragment>
            <div className="p-4">
                {/* <button className="btn btn-exp-green ms-auto me-0 mb-3" onClick={CreateSheet}>
                    Create CheckSheet
                </button> */}
                {
                    msg ?
                        <div className={`alert ${error ? 'alert-warning' : 'alert-success'} alert-dismissible fade show`} role="alert">
                            <p>{msg}</p>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div> : ""
                }

                <div className='card'>
                    <div className='card-header d-flex flex-wrap justify-content-between align-items-center'>
                        <h3 className="card-title">Company List</h3>
                        <button className="btn btn-exp-green ms-auto me-0" onClick={ShowCompanyModel}>
                            {/* <i className="fas fa-user-add me-2"></i>Create Company sidebar-nav-icon fi fi-ss-building */}
                            <i className="fas fa-plus me-2"></i>Create Company
                        </button>
                    </div>
                    <div className='card-body'>
                        <div className='d-flex w-100 align-items-center my-3 px-5'>
                            <span className='me-2 fw-medium'>Search:</span><input className='form-control' placeholder='company name/email/phone number' value={searchKey} onChange={searchCompany} />
                        </div>
                        {!loading && totalRows === 0 && companies.length === 0 ? (
                            <div className="w-100">
                                <div className="card bg-warning-light mb-0">
                                    <div className="card-body">
                                        <div className="exp-no-data-found text-exp-red">
                                            <img className="task-img mb-3" src={process.env.PUBLIC_URL + 'assets/images/search-no-record-found.webp'} alt="No task" />
                                            <h6>No Record Found</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="table-view">
                                <DataTable
                                    key={String(searchKeyDebounced)}
                                    columns={selectedColumns}
                                    data={companies}
                                    pagination
                                    paginationServer
                                    paginationTotalRows={totalRows}
                                    paginationDefaultPage={1}
                                    paginationResetDefaultPage={false}
                                    paginationPerPage={limit}
                                    paginationRowsPerPageOptions={[5, 10, 25, 50]}
                                    onChangePage={(newPage) => setPage(newPage)}
                                    onChangeRowsPerPage={(newLimit, newPage) => {
                                        setLimit(newLimit)
                                        setPage(newPage)
                                    }}
                                    progressPending={loading && companies.length === 0}
                                    theme="solarized"
                                    striped
                                    className='custom-table-wrap checklist-table-striped'
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <Modal id="viewUserModal" show={viewModel} onHide={HideModel} backdrop="static" keyboard={false} centered size="lg" scrollable>
                <Modal.Header closeButton className="gth-blue-light-bg">
                    <Modal.Title className="gth-modal-title w-100 pe-2">
                        <span className="text-primary fw-semibold d-block text-truncate" title={viewModelData?.company_name}>
                            {viewModelData?.company_name || "Company"}
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-3">
                    <div className="row g-3">
                        {viewField("Company Name", viewModelData?.company_name)}
                        {viewField("Company Email", viewModelData?.company_email)}
                        {viewField(
                            "Company Phone",
                            formatPhoneDisplay(viewModelData?.c_p_isd, viewModelData?.company_phone)
                        )}
                        {viewField("Is Variant Based?", variantBasedLabel(viewModelData?.generalSettings?.is_variant_based))}
                        {viewField(
                            "Company WhatsApp Number",
                            formatPhoneDisplay(
                                viewModelData?.w_isd,
                                viewModelData?.whatsapp_no ?? viewModelData?.whatsapp_number
                            )
                        )}
                        {viewField("Contact Person Name", viewModelData?.contact_name)}
                        {viewField("Contact Person Email", viewModelData?.contact_email)}
                        {viewField(
                            "Contact Person Phone No",
                            formatPhoneDisplay(viewModelData?.p_isd, viewModelData?.contact_phone)
                        )}
                        {/* {viewField("Contact Person WhatsApp Number", viewModelData?.contact_whatsapp_no)} */}
                        {viewField("Owner Name", viewModelData?.users && viewModelData?.users.length > 0 ? viewModelData?.users[0]?.name : "")}
                        {viewField("Owner Email", viewModelData?.users && viewModelData?.users.length > 0 ? viewModelData?.users[0]?.email : "")}
                        {/* {viewField("Password", "Not shown for security")} */}
                        {viewField("Renew Date", formatViewDate(viewModelData?.renew_date))}
                        {viewField("Minimum Purchase Amount", formatAmountDisplay(viewModelData?.generalSettings?.min_purchase_amount))}
                        {viewField("Minimum Sale Amount", formatAmountDisplay(viewModelData?.generalSettings?.min_sale_amount))}
                        {viewField("Has Production Planning", yesNoLabel(viewModelData?.generalSettings?.is_production_planning))}
                        {viewField("Has BOM", hasBomLabel(viewModelData?.generalSettings?.production_without_bom))}
                        <div className="col-12">
                            <div className="company-view-field border rounded-3 p-3 bg-light">
                                <div className="text-muted small fw-semibold mb-1">Address</div>
                                <div className="mb-0 text-break text-body">
                                    {viewModelData?.address?.trim() ? viewModelData.address : "—"}
                                </div>
                            </div>
                        </div>

                        {/*
                          Not on Add Company form — kept for reference if API exposes them later:
                          <div className='col-md-6'>Alternate Number — company_alternate_phone / alternet_p_isd</div>
                          <div className='col-md-6'>Start Date — start_date</div>
                          <div className='col-md-6'>Renew Type — renew_type</div>
                        */}
                    </div>
                </Modal.Body>
            </Modal>

            <Modal id="viewUserLogModal" show={logModal} onHide={CloseLog} backdrop="static" keyboard={false} centered size="xl">
                <Modal.Header closeButton className="gth-blue-light-bg">
                    <Modal.Title className="gth-modal-title">
                        <h5 className="profile-name text-nowrap text-truncate mb-0">{compName && compName}</h5>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className='d-flex w-100 align-items-center mb-3'>
                        <span className='me-2 fw-medium'>Search:</span><input className='form-control' onChange={(e) => search(e)} />
                    </div>
                    <DataTable
                        columns={AllActivityColumns}
                        data={activeLog}
                        pagination={[5, 10, 25, 50]}
                        theme="solarized"
                        striped
                        className='custom-table-wrap checklist-table-striped'
                    //customStyles={customStyles}
                    />
                </Modal.Body>
            </Modal>

            {/* ====================User List Modal===================== */}
            <Modal id="viewUserListModal" show={UserModal} onHide={UserCloseModal} backdrop="static" keyboard={false} centered size="xl">
                <Modal.Header closeButton className="gth-blue-light-bg">
                    <Modal.Title className="gth-modal-title">
                        <h5 className="profile-name text-nowrap text-truncate mb-0">{UserModalName && UserModalName}</h5>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    {/* <div className='d-flex w-100 align-items-center mb-3'>
                        <span className='me-2 fw-medium'>Search:</span><input className='form-control' onChange={(e) => search(e)} />
                    </div> */}
                    <DataTable
                        columns={AllUserColumns}
                        data={UserList}
                        pagination={[5, 10, 25, 50]}
                        theme="solarized"
                        striped
                        className='custom-table-wrap checklist-table-striped'
                    //customStyles={customStyles}
                    />
                </Modal.Body>
            </Modal>

            {/* =======================Edit Company=================== */}
            <Modal id="editCompanyModal" show={permissionEditModel} onHide={EditpermissionHide} backdrop="static" keyboard={false} centered size="lg" scrollable>
                <Modal.Header closeButton className="gth-blue-light-bg">
                    <Modal.Title className="gth-modal-title">
                        <h5 className="profile-name text-nowrap text-truncate mb-0">
                            Edit Company {companyEditData?.name ? `— ${companyEditData.name}` : ""}
                        </h5>
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={UpdateSubmit}>
                    <Modal.Body className='pb-1'>
                        {editLoading ? (
                            <div className="text-center py-4 text-muted">
                                <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                                <p className="mb-0">Loading company details...</p>
                            </div>
                        ) : (
                            <div className='row'>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Company Name <span className="text-exp-red">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyEditData.company_name}
                                            onChange={(e) => { clearEditFieldError("company_name"); setCompanyEditData({ ...companyEditData, company_name: e.target.value }) }}
                                        />
                                        {editErrors.company_name && <span className="error-message text-danger small d-block mt-1">{editErrors.company_name}</span>}
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Company Email <span className="text-exp-red">*</span></label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={companyEditData.company_email}
                                            onChange={(e) => { clearEditFieldError("company_email"); setCompanyEditData({ ...companyEditData, company_email: e.target.value }) }}
                                        />
                                        {editErrors.company_email && <span className="error-message text-danger small d-block mt-1">{editErrors.company_email}</span>}
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Company Phone <span className="text-exp-red">*</span></label>
                                        <PhoneInput
                                            country={'in'}
                                            value={`${companyEditData.c_p_isd || ""}${companyEditData.company_phone || ""}`}
                                            onChange={(value, country) => {
                                                clearEditFieldError("company_phone")
                                                const code = `${country.dialCode}`
                                                const number = value.replace(code, '')
                                                setCompanyEditData({ ...companyEditData, company_phone: number, c_p_isd: code })
                                            }}
                                        />
                                        {editErrors.company_phone && <span className="error-message text-danger small d-block mt-1">{editErrors.company_phone}</span>}
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Company WhatsApp Number</label>
                                        <PhoneInput
                                            country={'in'}
                                            value={`${companyEditData.w_isd || ""}${companyEditData.whatsapp_number || ""}`}
                                            onChange={(value, country) => {
                                                const code = `${country.dialCode}`
                                                const number = value.replace(code, '')
                                                setCompanyEditData({ ...companyEditData, whatsapp_number: number, w_isd: code })
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Minimum Purchase Amount</label>
                                        <input
                                            type="number"
                                            min={0}
                                            className="form-control"
                                            value={companyEditData.min_purchase_amount}
                                            onChange={(e) => setCompanyEditData({ ...companyEditData, min_purchase_amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Minimum Sale Amount</label>
                                        <input
                                            type="number"
                                            min={0}
                                            className="form-control"
                                            value={companyEditData.min_sale_amount}
                                            onChange={(e) => setCompanyEditData({ ...companyEditData, min_sale_amount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Is Variant Based? <span className="text-exp-red">*</span></label>
                                        <YesNoRadioGroup
                                            name="edit_is_variant_based"
                                            value={companyEditData.is_variant_based}
                                            onChange={(e) => { clearEditFieldError("is_variant_based"); setCompanyEditData({ ...companyEditData, is_variant_based: e.target.value }) }}
                                        />
                                        {editErrors.is_variant_based && <span className="error-message text-danger small d-block mt-1">{editErrors.is_variant_based}</span>}
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Has Production Planning</label>
                                        <YesNoRadioGroup
                                            name="edit_is_production_planning"
                                            value={companyEditData.is_production_planning}
                                            onChange={(e) => setCompanyEditData({ ...companyEditData, is_production_planning: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Has BOM</label>
                                        <YesNoRadioGroup
                                            name="edit_production_without_bom"
                                            value={companyEditData.production_without_bom}
                                            onChange={(e) => setCompanyEditData({ ...companyEditData, production_without_bom: e.target.value })}
                                            yesValue="0"
                                            noValue="1"
                                        />
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <div className="form-group">
                                        <label className="form-label">Modules <span className='text-danger'>*</span></label>
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
                                                            checked={(companyEditData.allowed_modules || []).map(Number).includes(Number(m.id))}
                                                            onChange={(e) => toggleModule(m.id, e.target.checked)}
                                                        />
                                                        <span className="checkmark" />
                                                        <span className="text-">{m.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {editErrors.allowed_modules && <span className="error-message text-danger small d-block mt-1">{editErrors.allowed_modules}</span>}
                                    </div>
                                </div>


                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Contact Person Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyEditData.contact_name}
                                            onChange={(e) => setCompanyEditData({ ...companyEditData, contact_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Contact Person Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={companyEditData.contact_email}
                                            onChange={(e) => setCompanyEditData({ ...companyEditData, contact_email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Contact Person Phone No</label>
                                        <PhoneInput
                                            country={'in'}
                                            value={`${companyEditData.p_isd || ""}${companyEditData.contact_phone || ""}`}
                                            onChange={(value, country) => {
                                                const code = `${country.dialCode}`
                                                const number = value.replace(code, '')
                                                setCompanyEditData({ ...companyEditData, contact_phone: number, p_isd: code })
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Owner Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyEditData.owner_name}
                                            onChange={(e) => setCompanyEditData({ ...companyEditData, owner_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Owner Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={companyEditData.owner_email}
                                            onChange={(e) => setCompanyEditData({ ...companyEditData, owner_email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Renew Date <span className="text-exp-red">*</span></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={companyEditData.renew_date}
                                            onChange={(e) => { clearEditFieldError("renew_date"); setCompanyEditData({ ...companyEditData, renew_date: e.target.value }) }}
                                        />
                                        {editErrors.renew_date && <span className="error-message text-danger small d-block mt-1">{editErrors.renew_date}</span>}
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="form-group">
                                        <label className="form-label">Address <span className="text-exp-red">*</span></label>
                                        <textarea
                                            className="form-control"
                                            value={companyEditData.address}
                                            onChange={(e) => { clearEditFieldError("address"); setCompanyEditData({ ...companyEditData, address: e.target.value }) }}
                                        />
                                        {editErrors.address && <span className="error-message text-danger small d-block mt-1">{editErrors.address}</span>}
                                    </div>
                                </div>
                              
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className='btn btn-exp-light' onClick={EditpermissionHide} disabled={editSaving}>
                            Cancel
                        </button>
                        <button type="submit" className='btn btn-exp-green' disabled={editSaving || editLoading}>
                            {editSaving ? "Updating..." : "Update"}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* ======================Add User=========================== */}
            <AddUser editUserShow={showAddUser} editUserModalClose={HideUserModel} companyId={companyId.id} companyEmail={companyId.company_email} />

            {/* ======================Add Company=========================== */}
            <AddCompany editUserShow={showAddCompany} editUserModalClose={HideCompanyModel} GetCompany={GetCompany} />

            {/* ======================renew company Company=========================== */}

        </React.Fragment>
    )
}

export default CompanyManagement