import { useEffect, useState } from 'react'
import { Modal, Table } from 'react-bootstrap'
 
 
 
import { Tooltip } from 'antd';
// import CreateRole from './role/CreateRole';
// import UpdateRole from './role/UpdateRole';

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
            alert(msg);
        } finally {
            setLoading(false);
        }
    };
 
    const getRoleList = () => {
        PrivateAxios.get("user/get-role")
        .then((res) => {
            console.log(res.data.data,"role");
            
            setRole(res.data.data)
        }).catch((err) => {

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

    const changeLimit = (e) => {
        const newLimit = Number(e.target.value) || 10;
        setLimit(newLimit);
        setPage(1);
        fetchUsers(1, newLimit, filterKey);
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
        PrivateAxios.post("/user/update-user", payload)
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
                console.log(err);
 
            })
 
    }
 
 
 
 
 
 
    return (
            <>
            <div className='d-flex align-items-center justify-content-between mb-3'>
                <h3>Users</h3>

                <div className="d-flex align-items-center gap-2">
                    <div className="input-group" style={{ width: 340 }}>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search ... "
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") applyFilter(); }}
                            aria-label="Filter"
                        />
                        <button className="btn btn-sm btn-primary" type="button" onClick={applyFilter} disabled={loading}>
                            Filter
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={clearFilter} disabled={loading || !filterKey}>
                            Clear
                        </button>
                    </div>

                    <div className="d-flex align-items-center ms-3">
                        <label className="me-2 mb-0">Per page:</label>
                        <select className="form-select form-select-sm" value={limit} onChange={changeLimit} style={{ width: 90 }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>
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

                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button onClick={() => changePage(page - 1)} disabled={page <= 1 || loading}>
                                    Prev
                                    </button>

                                    <span>
                                    Page {page} of {totalPages} ({total} users)
                                    </span>

                                    <button onClick={() => changePage(page + 1)} disabled={page >= totalPages || loading}>
                                    Next
                                    </button>

                                    {/* <div style={{ marginLeft: "auto" }}>
                                        <label>Go to:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={totalPages}
                                            value={page}
                                            onChange={(e) => {
                                            const v = Number(e.target.value) || 1;
                                            changePage(v);
                                            }}
                                            style={{ width: 70, marginLeft: 8 }}
                                        />
                                    </div> */}
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
