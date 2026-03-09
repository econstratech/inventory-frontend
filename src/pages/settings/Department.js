import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, OverlayTrigger, Table, } from 'react-bootstrap'
import { PrivateAxios } from '../../environment/AxiosInstance'
import Loader from '../landing/loder/Loader';
import { SuccessMessage } from '../../environment/ToastMessage';
import Filter from '../CommonComponent/Filter';
import { Tooltip } from 'antd';
import SettingsPageTopBar from './SettingsPageTopBar';


function Department() {
    const [loading, setLoading] = useState(false);
    const [department, setDepartment] = useState([]);
    const [update, setUpdate] = useState(false)
    const [create, setCreate] = useState(false)
    const [deleteShow, setDeleteShow] = useState(false)
    const [deleteId, setDeleteId] = useState('')
    const [isChecked, setIsChecked] = useState(false);
    const [departmentValue, setDepartmentValue] = useState('')
    const [departmentInputValue, setDepartmentInputValue] = useState({
        "title": "",
        "status": ""
    })
    const departmentData = () => {
        setLoading(true)
        PrivateAxios.get('all-department')
            .then((res) => {
                setLoading(false)
                setDepartment(res.data.data);
            }).catch((err) => {
                setLoading(false)
            })
    }
    useEffect(() => {
        departmentData();
    }, [])

    const departmentUpdateModelClose = () => {
        setUpdate(false);
        setDepartmentValue('')
    }
    const departmentCreateModelClose = () => {
        setCreate(false)
        setDepartmentInputValue('')
    }
    const deleteModalClose = () => {
        setDeleteShow(false);
        setDeleteId('')
    }

    const createDepartment = () => {
        setLoading(true)
        PrivateAxios.post("create-department", departmentInputValue)
            .then((res) => {
                departmentData();
                setLoading(false)
                SuccessMessage(res.data.data);
                departmentCreateModelClose();
            }).catch((err) => {
                setLoading(false)
                console.log(err);
            })
    }
    const UpdateDepartment = () => {
        setLoading(true)
        PrivateAxios.put(`update-department/${departmentValue.id}`, departmentValue)
            .then((res) => {
                const updatedDepartment = department.map((item) =>
                    item.id === departmentValue.id ? { ...item, title: departmentValue.title, status: departmentValue.status } : item
                );
                setDepartment(updatedDepartment)
                setLoading(false)
                SuccessMessage(res.data.data);
                departmentUpdateModelClose();
            }).catch((res) => {
                setLoading(false)
            })
    }
    const deleteDepartment = () => {
        setLoading(true)
        PrivateAxios.delete(`delete-department/${deleteId}`)
            .then((res) => {
                const deleteDepartment = department.filter((item) => item.id != deleteId);
                setDepartment(deleteDepartment)
                setLoading(false)
                SuccessMessage(res.data.data);
                deleteModalClose();
            }).catch((res) => {
                setLoading(false)
            })
    }

    const statusChange = (data, e) => {
        const newStatus = e.target.checked ? 1 : 0;
        setLoading(true)
        PrivateAxios.put(`update-department/${data.id}`, { "title": data.title, "status": e.target.checked })
            .then((res) => {
                const updatedDepartment = department.map((item) =>
                    item.id === data.id ? { ...item, status: newStatus } : item
                );
                setDepartment(updatedDepartment)
                setLoading(false)
                SuccessMessage(res.data.data);
                departmentUpdateModelClose();
            }).catch((res) => {
                setLoading(false)
            })
    }


    //filter modal
    const [filterShow, setFilterShow] = useState(false);
    const filterModalClose = () => setFilterShow(false);
    const filterModalShow = () => setFilterShow(true);


    return (
        <>
            {loading ? <Loader /> :
                <>
                <SettingsPageTopBar />
                    <div className='p-4'>
                        <div className='card'>

                            {/* <h3 className="card-title">Department</h3> */}
                            <div className="d-flex justify-content-between align-items-center p-3">
                                <button type='button' onClick={() => setCreate(true)} className='me-2 product-btn'>
                                    <i className='fas fa-plus me-2'></i>
                                    New
                                </button>
                                {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                            </div>

                            <div className='card-body'>
                                <div className='compare_price_view_table'>
                                    <Table responsive className="table-bordered primary-table-head">
                                        <thead>
                                            <tr>
                                                <th scope="col">SL.NO</th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {department.map((data, i) => (
                                                <tr>
                                                    <td scope="row">{i + 1}</td>
                                                    <td>{data.title}</td>
                                                    <td>
                                                        <div className='form-group mb-0'>
                                                            <label className="custom-switch" >
                                                                <input type="checkbox" checked={data.status == 1} onChange={(e) => statusChange(data, e)} />
                                                                <div className="switch-slider switch-round" />
                                                            </label>
                                                        </div>
                                                        {/* {
                                                data.status == 1 ? <span className='badge bg-success'>Active</span> : <span className='badge bg-danger'>Inactive</span>
                                            } */}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex">
                                                            <Tooltip title='Edit'>
                                                                <button type='button' onClick={() => { setDepartmentValue(data); setUpdate(true) }} to="#" className="me-1 icon-btn">
                                                                    <i className='fas fa-pen'></i>
                                                                </button>
                                                            </Tooltip>

                                                            <Tooltip title='Delete'>
                                                                <button type='button' onClick={() => { setDeleteShow(true); setDeleteId(data.id) }} className="me-1 icon-btn" >
                                                                    <i class="fas fa-trash-alt text-danger f-s-14"></i>
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }

            {/* create Department */}
            <Modal show={create} onHide={departmentCreateModelClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title> create Department</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Title</label>
                            <input type='text' className={`form-control`} placeholder='Enter title' onChange={(e) => setDepartmentInputValue({ ...departmentInputValue, title: e.target.value })} />
                        </div>
                    </div>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Status</label>
                            <Form.Select aria-label="Default select example" onChange={(e) => setDepartmentInputValue({ ...departmentInputValue, status: e.target.value })}>
                                <option value="1" selected>Active</option>
                                <option value="0">Inactive</option>
                            </Form.Select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type='reset' variant="secondary" className='btn-sm' onClick={departmentCreateModelClose}>
                        Close
                    </Button>
                    <button type='submit' className='btn btn-sm btn-success' onClick={createDepartment}>
                        Save
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Update department */}
            <Modal show={update} onHide={departmentUpdateModelClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Update Department</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Title</label>
                            <input type='text' value={departmentValue.title} className={`form-control`} name='task_name' placeholder='Enter title' onChange={(e) => setDepartmentValue({ ...departmentValue, title: e.target.value })} />
                        </div>
                    </div>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Status</label>
                            <Form.Select aria-label="Default select example" value={departmentValue.status} onChange={(e) => setDepartmentValue({ ...departmentValue, status: e.target.value })}>
                                <option value="1" >Active</option>
                                <option value="0">Inactive</option>
                            </Form.Select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type='reset' variant="secondary" className='btn-sm' onClick={departmentUpdateModelClose}>
                        Close
                    </Button>
                    <button type='submit' className='btn btn-sm btn-success' onClick={UpdateDepartment}>
                        Save
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Delete department */}
            <Modal
                show={deleteShow}
                onHide={deleteModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="delete-confirm-wrap text-center">
                        <div className="delete-confirm-icon mb-3 mt-2">
                            <img src={process.env.PUBLIC_URL + '/assets/images/delete-warning.svg'} alt="Warning" className="img-fluid" />
                        </div>
                        <h4 className="text-muted">Are you sure?</h4>
                        <p className="text-muted">
                            Do you really want to delete these record?
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type='reset' className='btn btn-secondary btn-sm' onClick={deleteModalClose}>
                        Cancel
                    </button>
                    <button type='submit' className='btn btn-exp-red btn-sm' onClick={deleteDepartment}>
                        Delete
                    </button>
                </Modal.Footer>
            </Modal>

            {/* <ManagementFilter /> */}
            {['end'].map((placement, idx) => (
                <Filter show={filterShow}
                    handleClose={filterModalClose} key={idx} placement={placement.end} name={placement} />
            ))}

        </>
    )
}

export default Department