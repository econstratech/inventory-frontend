import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, OverlayTrigger, Table, } from 'react-bootstrap'
 
 
 
import { Tooltip } from 'antd';
// import CreateRole from './role/CreateRole';
// import UpdateRole from './role/UpdateRole';
import { PrivateAxios } from '../../../environment/AxiosInstance';
import { SuccessMessage } from '../../../environment/ToastMessage';
import Loader from '../../landing/loder/Loader';
 
 
function UserList() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState([]);
    const [role, setRole] = useState([]);
    const [update, setUpdate] = useState(false)
    const [updateUserData, setUpdateUserData] = useState('')
 
 
 
    const userList = () => {
        PrivateAxios.get("user/all-user")
            .then((res) => {
                setUser(res.data.user)
 
            }).catch((err) => {
 
            })
    }
 
    const getRoleList = () => {
        PrivateAxios.get("user/get-role")
            .then((res) => {
                setRole(res.data.data)
            }).catch((err) => {
 
            })
    }
 
    useEffect(() => {
        userList();
        getRoleList();
    }, [])
 
    const [roleId, setRoleId] = useState([])
 
    const UpdateModalShow = (data) => {
        setUpdate(true);
        setUpdateUserData(data);
        if (data.role) {
            const parsedRoles = JSON.parse(data.role);
            setRoleId(parsedRoles.map(Number));
        } else {
            setRoleId([]);
        }
 
    }
    const UpdateModalClose = () => {
        setUpdate(false);
        setUpdateUserData('');
        setRoleId([]);
    }
 
 
 
    const UpdateData = () => {
        const payload = {
            role: roleId.length > 0 ? JSON.stringify(roleId) : "",
            id: updateUserData.id
        }
        PrivateAxios.post("/user/update-user", payload)
            .then((res) => {
                SuccessMessage(res.data.message);
 
                setUser(prevUsers =>
                    prevUsers.map(user =>
                        user.id == updateUserData.id
                            ? { ...user, role: payload.role }
                            : user
                    )
                );
                UpdateModalClose();
            }).catch((err) => {
                console.log(err);
 
            })
 
    }
 
 
 
 
 
 
    return (
        <>
            {loading ? <Loader /> :
                <>
                    <div className='p-4'>
                        <div className='card'>
                            {/* <div className='p-3 d-flex justify-content-end'>
                                <button type='button' onClick={() => setCreate(true)} className='me-2 btn btn-sm btn-outline-primary ms-auto'>
                                    <i className='fas fa-plus me-2'></i>
                                    New
                                </button>
                            </div> */}
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
                                        {user.map((data, i) => (
                                            <tr>
                                                <td scope="row">{i + 1}</td>
                                                <td>{data.name}</td>
 
                                                <td>
                                                    <div className="d-flex">
                                                        <Tooltip title='Edit'>
                                                            <button type='button' onClick={() => { UpdateModalShow(data) }} to="#" className="me-1 icon-btn">
                                                                <i className='fas fa-pen d-flex'></i>
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
 
 
 
            {/* Delete department */}
            <Modal
                show={update}
                onHide={UpdateModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{updateUserData.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card-body role-permission-card">
                        <h4 className="text-muted">Add Role</h4>
                        <hr />
                        <div className='row'>
                            {role.length > 0 ? role.map((item) => (
                                <div className='col-4'>
                                    <div className='form-group'>
                                        <label className="custom-checkbox mb-0">
                                            <input type="checkbox" checked={roleId.includes(item.id)} onChange={(e) => {
                                                if (e.target.checked) {
                                                    setRoleId(prev => [...prev, item.id]);
                                                } else {
                                                    setRoleId(prev => prev.filter(r => r !== item.id));
                                                }
                                            }} />
                                            <span className="checkmark" />
                                            <span className="text- text-dark">{item.name}</span>
                                        </label>
                                    </div>
                                </div>)) :
                                <p>Please create role</p>
                            }
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type='reset' className='btn btn-secondary btn-sm' onClick={UpdateModalClose}>
                        Cancel
                    </button>
                    <button type='submit' className='btn btn-exp-primary btn-sm' onClick={UpdateData}>
                        Update
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
 
export default UserList
 