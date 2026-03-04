import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, OverlayTrigger, Table, } from 'react-bootstrap'
import { PrivateAxios } from '../../environment/AxiosInstance'
import Loader from '../landing/loder/Loader';
import { SuccessMessage } from '../../environment/ToastMessage';
import SettingsPageTopBar from './SettingsPageTopBar';
import { Tooltip } from 'antd';


function Modulesdata() {
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

    const fetchModules = async () => {
        setLoading(true)
        try {
            const response = await PrivateAxios.get('/module/all-modules');
            setLoading(false)
            setDepartment(response.data.data);
        } catch (error) {
            setLoading(false)

            console.error("Error fetching modules:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchModules();
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
        console.log(departmentInputValue);

        setLoading(true)
        PrivateAxios.post("/module/add", departmentInputValue)
            .then((res) => {

                setLoading(false)
                SuccessMessage(res.data.data);
                departmentCreateModelClose();
                fetchModules();
            }).catch((err) => {
                setLoading(false)
                console.log(err);
            })
    }

    const UpdateDepartment = () => {
        setLoading(true)
        PrivateAxios.put(`module/update/${departmentValue.id}`, departmentValue)
            .then((res) => {
                const updatedDepartment = department.map((item) =>
                    item.id === departmentValue.id ? { ...item, name: departmentValue.name } : item
                );
                setDepartment(updatedDepartment)
                setLoading(false)
                SuccessMessage(res.data.data);
                departmentUpdateModelClose();
                fetchModules();
            }).catch((res) => {
                setLoading(false)
            })
    }

    const deleteDepartment = () => {
        setLoading(true)
        PrivateAxios.delete(`module/delete/${deleteId}`)
            .then((res) => {
                const deleteDepartment = department.filter((item) => item.id != deleteId);
                setDepartment(deleteDepartment)
                setLoading(false)
                SuccessMessage(res.data.data);
                deleteModalClose();
                fetchModules();
            }).catch((res) => {
                setLoading(false)
            })
    }

    return (
        <>
            {loading ? <Loader /> :
                <>
                    <SettingsPageTopBar />
                    <div className='p-4'>
                        <div className='card'>
                            <div className='p-3 d-flex justify-content-end'>
                                <button type='button' onClick={() => setCreate(true)} className='me-2 btn btn-sm btn-outline-primary ms-auto'>
                                    <i className='fas fa-plus me-2'></i>
                                    New
                                </button>
                            </div>
                            <div className='compare_price_view_table'>
                                <Table responsive className="table-bordered primary-table-head">
                                    <thead>
                                        <tr>
                                            <th scope="col">SL.NO</th>
                                            <th scope="col">Name</th>

                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {department.map((data, i) => (
                                            <tr>
                                                <td scope="row">{i + 1}</td>
                                                <td>{data.name}</td>

                                                <td>
                                                    <div className="d-flex">
                                                        <Tooltip title='Edit'>
                                                            <button type='button' onClick={() => { setDepartmentValue(data); setUpdate(true) }} to="#" className="me-1 icon-btn">
                                                                <i className='fas fa-pen d-flex'></i>
                                                            </button>
                                                        </Tooltip>

                                                        <Tooltip title='Delete'>
                                                            <button type='button' onClick={() => { setDeleteShow(true); setDeleteId(data.id) }} className="me-1 icon-btn" >
                                                                <i className='fas fa-trash-alt text-danger'></i>
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
                </>
            }

            {/* create Department */}
            <Modal show={create} onHide={departmentCreateModelClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Module</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Title</label>
                            <input type='text' className={`form-control`} placeholder='Enter title' onChange={(e) => setDepartmentInputValue({ ...departmentInputValue, name: e.target.value })} />
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
                    <Modal.Title>Create Module</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Title</label>
                            <input type='text' value={departmentValue.name} className={`form-control`} name='task_name' placeholder='Enter title' onChange={(e) => setDepartmentValue({ ...departmentValue, name: e.target.value })} />
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button type='reset' variant="secondary" className='btn-sm' onClick={departmentUpdateModelClose}>
                        Close
                    </Button>
                    <Button type='submit' variant="success" className='btn-sm' onClick={UpdateDepartment}>
                        Save
                    </Button>
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
                    <button type='resert' className='btn btn-secondary btn-sm' onClick={deleteModalClose}>
                        Cancel
                    </button>
                    <button type='submit' className='btn btn-exp-red btn-sm' onClick={deleteDepartment}>
                        Delete
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Modulesdata