import { useEffect, useState } from 'react'
import { Modal, Table } from 'react-bootstrap'
 
 
 
import { Tooltip, Pagination, Input, Button } from 'antd';
// import CreateRole from './role/CreateRole';
// import UpdateRole from './role/UpdateRole';
import { ErrorMessage } from '../../../environment/ToastMessage';
import Loader from '../../landing/loder/Loader';

import { PrivateAxios } from '../../../environment/AxiosInstance';
import { SuccessMessage } from '../../../environment/ToastMessage';
 
 
function UserList() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [filterKey, setFilterKey] = useState("");
    const [searchKey, setSearchKey] = useState("");
    const [loading, setLoading] = useState(false);
    // const [user, setUser] = useState([]);
    const [role, setRole] = useState([]);
    const [update, setUpdate] = useState(false)
    const [updateUserData, setUpdateUserData] = useState('')


    const fetchUsers = async (p = page, l = limit, filterKey) => {
        setLoading(true);
        try {
            const params = { page: p, limit: l };
            if (filterKey && filterKey.trim() !== "") params.searchkey = filterKey.trim();

            const res = await PrivateAxios.get("/user/list", { params });
            const data = res.data || {};
            setUsers(data.users || []);
            const meta = data.meta || {};
            setPage(meta.page || p);
            setLimit(meta.limit || l);
            setTotal(meta.total || 0);
            setTotalPages(meta.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch users", err);
            // Minimal UI-friendly error handling
            const msg = err?.response?.data?.message || "Failed to fetch users";
            ErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };
 
    const getRoleList = () => {
        PrivateAxios.get("/get-all-roles")
        .then((res) => {        
            setRole(res.data?.data || [])
        }).catch((err) => {
            console.error("Failed to fetch roles", err);
            const msg = err?.response?.data?.message || "Failed to fetch roles";
            ErrorMessage(msg);
        })
    }
 
    useEffect(() => {
        fetchUsers();
        getRoleList();
    }, [])

    const applyFilter = () => {
        setFilterKey(searchKey);
        setPage(1);
        fetchUsers(1, limit, searchKey);
    }

    const clearFilter = () => {
        setSearchKey("");
        setFilterKey("");
        setPage(1);
        fetchUsers(1, limit, "");
    }

    const changePage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
        fetchUsers(newPage, limit, filterKey);
    }

    // const changeLimit = (e) => {
    //     const newLimit = Number(e.target.value) || 10;
    //     setLimit(newLimit);
    //     setPage(1);
    //     fetchUsers(1, newLimit, filterKey);
    // }

    const handlePaginationChange = (newPage, pageSize) => {
        if (pageSize !== limit) {
            setLimit(pageSize);
            setPage(1);
            fetchUsers(1, pageSize, filterKey);
            return;
        }
        changePage(newPage);
    }
 
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
        PrivateAxios.post("/user/update-user-roles", payload)
            .then((res) => {
                SuccessMessage(res.data.message);
 
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id == updateUserData.id
                            ? { ...user, role: payload.role }
                            : user
                    )
                );
                UpdateModalClose();
            }).catch((err) => {
                console.error("Failed to update user", err);
                const msg = err?.response?.data?.message || "Failed to update user";
                ErrorMessage(msg);
 
            })
 
    }
 
 
    return (
            <>
            {loading ? <Loader /> :
                <>
                    <div className='p-4'>
                        <div className='card'>
                            <div className='card-body pb-0'>
                                <div className='d-flex align-items-center justify-content-between mb-3'>
                                    <div>
                                        <h3 className='mb-0'>Users</h3>
                                        <p className='text-muted mb-0'>View and manage users</p>
                                    </div>
                                </div>
                            </div>
                            <div className='p-3'>
                                <div className='row g-3 align-items-end'>
                                    <div className='col-md-4'>
                                        <label className='form-label mb-2'>Search</label>
                                        <Input
                                            placeholder='Enter name or username...'
                                            value={searchKey}
                                            onChange={(e) => setSearchKey(e.target.value)}
                                            onPressEnter={applyFilter}
                                            style={{ height: '38px' }}
                                        />
                                    </div>
                                    <div className='col-md-4'>
                                        <div className='d-flex gap-2'>
                                            <Button
                                                type='primary'
                                                onClick={applyFilter}
                                                loading={loading}
                                                style={{ height: '38px' }}
                                            >
                                                Search
                                            </Button>
                                            <Button
                                                onClick={clearFilter}
                                                disabled={loading || (!searchKey && !filterKey)}
                                                style={{ height: '38px' }}
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            
                            <div className='p-3'>
                                <Table responsive className="table-bordered primary-table-head">
                                    <thead>
                                        <tr>
                                            <th scope="col">SL.NO</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">User Name</th>
                                            <th scope="col">Roles</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                            <td colSpan={5}>No users found.</td>
                                            </tr>
                                        ) : (
                                            users.map((u, idx) => (
                                            <tr key={u.id || u._id || idx}>
                                                <td>{(page - 1) * limit + idx + 1}</td>
                                                <td>{u.name || "-"}</td>
                                                <td>{u.email || "-"}</td>
                                                <td>{u.roleNames.length > 0 ? u.roleNames.join(", ") : "N/A"}</td>
                                                <td>
                                                    <div className="d-flex">
                                                        <Tooltip title='Edit'>
                                                            <button type='button' onClick={() => { UpdateModalShow(u) }} to="#" className="me-1 icon-btn">
                                                                <i className='fas fa-pen d-flex'></i>
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>

                                <div className='d-flex justify-content-end p-3'>
                                    <Pagination
                                        current={page}
                                        total={total}
                                        pageSize={limit}
                                        showSizeChanger
                                        pageSizeOptions={[5, 10, 25, 50]}
                                        onChange={handlePaginationChange}
                                        showTotal={(count, range) => `${range[0]}-${range[1]} of ${count} users`}
                                    />
                                </div>
                             
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
