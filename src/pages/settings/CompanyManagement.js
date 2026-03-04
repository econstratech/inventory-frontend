import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import DataTable from 'react-data-table-component'
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import moment from 'moment'

import { SuccessMessage } from '../../environment/ToastMessage'
import { PrivateAxios, url } from '../../environment/AxiosInstance'
import AddCompany from './AddCompany'
import AddUser from './AddUser'


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
    const [companyEditData, setCompanyEditData] = useState({
        "id": "",
        "name": "",
        "tasktracker": 0,
        "checksheet": 0,
        "workflow": 0,
        "helpticket": 0,
        "renew_date": ""
    })
    // const getCompanyData = (id) => {
    //     PrivateAxios.get(`company/company-info/${id}`)
    //         .then((res) => {
    //             const { tasktracker, checksheet, workflow, helpticket, renew_date } = res.data.data
    //             setCompanyEditData({ ...companyEditData, tasktracker, checksheet, workflow, helpticket, renew_date });
    //         }).catch((err) => {

    //         })
    // }

    const UpdateSubmit = (e) => {
        e.preventDefault();
        PrivateAxios.put(`company/company-update/${permissionEditId}`, companyEditData)
            .then((res) => {
                SuccessMessage(res.data.message);
                EditpermissionHide();
                GetCompany(page, limit);
            }).catch((err) => {

            })
    }

    const [permissionEditModel, setEditpermissionModel] = useState(false);

    // const EditpermissionShow = (data) => {
    //     setEditpermissionModel(true);
    //     serPermissionEditId(data.id);
    //     getCompanyData(data.id)
    //     setCompanyEditData({ ...companyEditData, id: data.id, name: data.company_name })
    // }
    const EditpermissionHide = () => {
        setEditpermissionModel(false);
        serPermissionEditId("");
        setCompanyEditData({
            "id": "",
            "name": "",
            "tasktracker": 0,
            "checksheet": 0,
            "workflow": 0,
            "helpticket": 0,
            "renew_date": ""
        })
    }

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
            name: "GST NO.",
            selector: (row) => row.gst,
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
                    {/* <OverlayTrigger
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
                    </OverlayTrigger> */}
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
        setViewModelData(data)
    }
    const HideModel = () => {
        setViewModel(false);
        setViewModelData('')
    }


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
            name: "User Name",
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
            name: "Phone",
            selector: (row) => row.phone_number,
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
                    <div className='card-body p-0'>
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
                                    columns={selectedColumns}
                                    data={companies}
                                    pagination
                                    paginationServer
                                    paginationTotalRows={totalRows}
                                    paginationDefaultPage={1}
                                    paginationPerPage={limit}
                                    paginationRowsPerPageOptions={[5, 10, 25, 50]}
                                    onChangePage={(newPage) => setPage(newPage)}
                                    onChangeRowsPerPage={(newLimit, newPage) => {
                                        setLimit(newLimit)
                                        setPage(newPage)
                                    }}
                                    progressPending={loading}
                                    theme="solarized"
                                    striped
                                    className='custom-table-wrap checklist-table-striped'
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <Modal id="viewUserModal" show={viewModel} onHide={HideModel} backdrop="static" keyboard={false} centered size="lg">
                <Modal.Header closeButton className="gth-blue-light-bg">
                    <Modal.Title className="gth-modal-title">
                        <h5 className="profile-name text-nowrap text-truncate">{viewModelData && viewModelData.company_name}</h5>

                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <p className="mb-0">{viewModelData && viewModelData.company_name}</p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Email</label>
                                <p className="mb-0">{viewModelData && viewModelData.company_email}</p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Company Phone</label>
                                <p className="mb-0">{viewModelData.company_phone ? `+${viewModelData && viewModelData.c_p_isd} ${viewModelData && viewModelData.company_phone}` : ""}</p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Alternate Number</label>
                                <p className="mb-0">{viewModelData.company_alternate_phone ? `+${viewModelData && viewModelData.alternet_p_isd} ${viewModelData && viewModelData.company_alternate_phone}` : ""}</p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <p className="mb-0">{viewModelData && viewModelData.address} </p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Name</label>
                                <p className="mb-0">{viewModelData && viewModelData.contact_name} </p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact Email</label>
                                <p className="mb-0">{viewModelData && viewModelData.contact_email} </p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Contact phone</label>
                                <p className="mb-0">+{viewModelData && viewModelData.p_isd} {viewModelData && viewModelData.contact_phone}</p>
                            </div>
                        </div>
                        {/* <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Whatsapp Number</label>
                                <p className="mb-0">+{viewModelData && viewModelData.w_isd} {viewModelData && viewModelData.whatsapp_number} </p>
                            </div>
                        </div> */}
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <p className="mb-0">{viewModelData && moment(viewModelData.start_date).format("DD-MMMM-YYYY")} </p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Renew Type</label>
                                <p className="mb-0">{viewModelData && viewModelData.renew_type}</p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Renew Date</label>
                                <p className="mb-0">{viewModelData && moment(viewModelData.renew_date).format("DD-MMMM-YYYY")}</p>
                            </div>
                        </div>
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
            <Modal id="viewUserListModal" show={permissionEditModel} onHide={EditpermissionHide} backdrop="static" keyboard={false} centered size="xl">
                <Modal.Header closeButton className="gth-blue-light-bg">
                    <Modal.Title className="gth-modal-title">
                        <h5 className="profile-name text-nowrap text-truncate mb-0">{companyEditData && companyEditData.name}</h5>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <form onSubmit={UpdateSubmit}>
                        <div className="form-group">
                            <label className="form-label">Permission <span className='text-danger'>*</span></label>
                            <div className="d-flex flex-wrap">
                                <label className="custom-checkbox me-3 mb-2">
                                    <input type="checkbox" checked={companyEditData.checksheet == 1 && companyEditData.tasktracker == 1 && companyEditData.workflow == 1} onChange={(e) => {
                                        e.target.checked ? setCompanyEditData({ ...companyEditData, tasktracker: 1, checksheet: 1, workflow: 1, }) : setCompanyEditData({ ...companyEditData, tasktracker: 0, checksheet: 0, workflow: 0, helpticket: 0 })
                                    }} />
                                    <span className="checkmark" />
                                    <span className="text-">All</span>
                                </label>
                                <label className="custom-checkbox me-3 mb-2">
                                    <input
                                        type="checkbox" checked={companyEditData.tasktracker == 1} onChange={(e) => { e.target.checked ? setCompanyEditData({ ...companyEditData, tasktracker: 1 }) : setCompanyEditData({ ...companyEditData, tasktracker: 0 }) }}
                                    />
                                    <span className="checkmark" />
                                    <span className="text-">Task Tracker</span>
                                </label>
                                <label className="custom-checkbox me-3 mb-2">
                                    <input
                                        type="checkbox" checked={companyEditData.checksheet == 1} onChange={(e) => { e.target.checked ? setCompanyEditData({ ...companyEditData, checksheet: 1 }) : setCompanyEditData({ ...companyEditData, checksheet: 0 }) }}
                                    />
                                    <span className="checkmark" />
                                    <span className="text-">Check Sheet</span>
                                </label>
                                <label className="custom-checkbox me-3 mb-2">
                                    <input
                                        type="checkbox" checked={companyEditData.workflow == 1} onChange={(e) => { e.target.checked ? setCompanyEditData({ ...companyEditData, workflow: 1 }) : setCompanyEditData({ ...companyEditData, workflow: 0 }) }}
                                    />
                                    <span className="checkmark" />
                                    <span className="text-">Work Flow</span>
                                </label>
                                {/* <label className="custom-checkbox me-3 mb-2">
                                    <input
                                        type="checkbox" checked={companyEditData.helpticket == 1} onChange={(e) => { e.target.checked ? setCompanyEditData({ ...companyEditData, helpticket: 1 }) : setCompanyEditData({ ...companyEditData, helpticket: 0 }) }}
                                    />
                                    <span className="checkmark" />
                                    <span className="text-">Help Ticket</span>
                                </label> */}
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Renew Date <span className="text-exp-red">*</span></label>
                                <input type="date" required className="form-control" onChange={(e) => setCompanyEditData({ ...companyEditData, renew_date: e.target.value })} value={companyEditData.renew_date} />
                            </div>
                        </div>
                        {/* <div className='d-flex w-100 align-items-center mb-3'>
                        <span className='me-2 fw-medium'>Search:</span><input className='form-control' onChange={(e) => search(e)} />
                    </div> */}
                        {/* <DataTable
                        columns={AllUserColumns}
                        data={UserList}
                        pagination={[5, 10, 25, 50]}
                        theme="solarized"
                        striped
                        className='custom-table-wrap checklist-table-striped'
                    //customStyles={customStyles}
                    /> */}
                        <Modal.Footer>
                            <button className='btn btn-exp-green'>
                                Update
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal.Body>
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