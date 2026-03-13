import React, { useEffect, useState } from 'react'
import { Modal, Table, } from 'react-bootstrap'
import { PrivateAxios } from '../../environment/AxiosInstance'
import Loader from '../landing/loder/Loader';
import { SuccessMessage } from '../../environment/ToastMessage';
import { Tooltip } from 'antd';
import SettingsPageTopBar from './SettingsPageTopBar';
import CreateRole from './role/CreateRole';
import UpdateRole from './role/UpdateRole';


function RoleData() {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [update, setUpdate] = useState(false)
    const [create, setCreate] = useState(false)
    const [deleteShow, setDeleteShow] = useState(false)
    const [deleteId, setDeleteId] = useState('')
    // const [isChecked, setIsChecked] = useState(false);
    const [departmentValue, setDepartmentValue] = useState('')
    const [departmentInputValue, setDepartmentInputValue] = useState({
        "title": "",
        "status": ""
    })

    const fetchModules = async () => {
        setLoading(true)
        try {
            const response = await PrivateAxios.get('/get-all-roles');
            setLoading(false)
            setRoles(response.data.data);
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

        setLoading(true)
        PrivateAxios.post("/roles/add", departmentInputValue)
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
        PrivateAxios.put(`roles/update/${departmentValue.id}`, departmentValue)
            .then((res) => {
                const updatedDepartment = roles.map((item) =>
                    item.id === departmentValue.id ? { ...item, name: departmentValue.name } : item
                );
                setRoles(updatedDepartment)
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
        PrivateAxios.delete(`delete-role/${deleteId}`)
            .then((res) => {
                const deleteDepartment = roles.filter((item) => item.id != deleteId);
                setRoles(deleteDepartment)
                setLoading(false)
                SuccessMessage(res.data.msg);
                deleteModalClose();
                fetchModules();
            }).catch((res) => {
                setLoading(false)
            })
    }

    //==============================My Code enable===========================//




    return (
        <>
            {loading ? <Loader /> :
                <>
                    <SettingsPageTopBar />
                    <div className='p-4'>
                        <div className='card'>
                            {/* <div className='card-header '>
                                <h3 className="card-title">Role</h3>
                                <Button type='button' onClick={() => setCreate(true)} className='me-2  btn-sm  float-end'>
                                    <i className='bi bi-plus-circle me-2'></i>
                                    New
                                </Button>
                            </div> */}

                            <div className='card-body'>
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
                                                <th scope="col">Role</th>
                                                <th scope="col">Permissions</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roles.map((data, i) => (
                                                <tr>
                                                    <td scope="row">{i + 1}</td>
                                                    <td>{data.name}</td>
                                                    <td>{data.permissions.map((permission) => permission.name).join(', ')}</td>

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
                    </div>

                </>
            }

            {/* create Department */}
            <CreateRole departmentCreateModelClose={departmentCreateModelClose} setLoading={setLoading} create={create} fetchModules={fetchModules} />

            {/* Update department */}
            <UpdateRole update={update} departmentUpdateModelClose={departmentUpdateModelClose} setLoading={setLoading} data={departmentValue} fetchModules={fetchModules}  />

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
        </>
    )
}

export default RoleData