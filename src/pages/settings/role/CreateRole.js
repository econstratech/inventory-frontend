import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { PrivateAxios } from '../../../environment/AxiosInstance'
import { ErrorMessage, SuccessMessage } from '../../../environment/ToastMessage'

function CreateRole({departmentCreateModelClose,setLoading,create,fetchModules}) {

    const [groups, setGroups] = useState([])
    const [selectAll, setSelectAll] = useState(false);
    const [allPermission, setAllPermission] = useState([]);
    const [adminName, setAdminName] = useState('');

    const getGroupPermissions = (group) => group?.permissions || group?.allmodule || [];
    const getPermissionKey = (moduleId, permissionId) => `${moduleId}_${permissionId}`;

    const GetAllPermission = async () => {
        setLoading(true)
        await PrivateAxios.get("get-all-permissions")
            .then((res) => {
                setLoading(false)
                setGroups(res.data.data || []);

            }).catch((err) => {
                setLoading(false)
                if (err.response.status == 401) {
                    // Logout();
                }
            })
    }
    useEffect(() => {
        GetAllPermission()
    }, [])

    useEffect(() => {
        const groupsWithPermissions = groups.filter((group) => getGroupPermissions(group).length > 0);
        const allSelected =
            groupsWithPermissions.length > 0 &&
            groupsWithPermissions.every((group) =>
                getGroupPermissions(group).every((permission) =>
                    allPermission.some(
                        (item) => item.module_id === group.id && item.permission_id === permission.id
                    )
                )
            );
        setSelectAll(allSelected);
    }, [groups, allPermission]);

    const handleSelectAllChange = (e) => {
        const newValue = e.target.checked;
        setSelectAll(newValue);
        if (newValue) {
            const permissionsToAdd = [];
            groups.forEach(group => {
                getGroupPermissions(group).forEach(item => {
                    permissionsToAdd.push({ module_id: group.id, permission_id: item.id });
                });
            });
            const uniquePermissions = [];
            const seen = new Set();
            [...allPermission, ...permissionsToAdd].forEach((item) => {
                const key = getPermissionKey(item.module_id, item.permission_id);
                if (!seen.has(key)) {
                    seen.add(key);
                    uniquePermissions.push(item);
                }
            });
            setAllPermission(uniquePermissions);
        } else {
            setAllPermission([]);
        }
    };

    const handleGroupChange = (groupId, e) => {
        const newValue = e.target.checked;
        const targetGroup = groups.find((group) => group.id === groupId);
        const groupPermissions = getGroupPermissions(targetGroup);

        if (newValue) {
            const permissionsToAdd = groupPermissions.map((item) => ({
                module_id: groupId,
                permission_id: item.id
            }));
            setAllPermission((prev) => {
                const uniquePermissions = [];
                const seen = new Set();
                [...prev, ...permissionsToAdd].forEach((item) => {
                    const key = getPermissionKey(item.module_id, item.permission_id);
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniquePermissions.push(item);
                    }
                });
                return uniquePermissions;
            });
        } else {
            setAllPermission((prev) => prev.filter((permission) => permission.module_id !== groupId));
        }
    };

    const handleItemChange = (groupId, itemId, e) => {
        if (e.target.checked) {
            setAllPermission((prev) => {
                const exists = prev.some(
                    (item) => item.module_id === groupId && item.permission_id === itemId
                );
                if (exists) return prev;
                return [...prev, { module_id: groupId, permission_id: itemId }];
            });
        } else {
            setAllPermission((prev) => prev.filter(item =>
                !(item.module_id === groupId && item.permission_id === itemId)
            ));
        }
    };

    const isPermissionSelected = (groupId, permissionId) =>
        allPermission.some(
            (item) => item.module_id === groupId && item.permission_id === permissionId
        );

    const isGroupChecked = (group) => {
        const permissions = getGroupPermissions(group);
        if (!permissions.length) return false;
        return permissions.every((permission) => isPermissionSelected(group.id, permission.id));
    };

    const isGroupIndeterminate = (group) => {
        const permissions = getGroupPermissions(group);
        if (!permissions.length) return false;
        const selectedCount = permissions.filter((permission) =>
            isPermissionSelected(group.id, permission.id)
        ).length;
        return selectedCount > 0 && selectedCount < permissions.length;
    };

    const getGroupSelectedCount = (group) => {
        const permissions = getGroupPermissions(group);
        return permissions.filter((permission) =>
            isPermissionSelected(group.id, permission.id)
        ).length;
    };

    const totalPermissionCount = groups.reduce(
        (sum, group) => sum + getGroupPermissions(group).length,
        0
    );

    const createUserRole = (e) => {
        e.preventDefault();

        if(adminName.trim() === ''){
            ErrorMessage('Role name is required')
            return;
        }
        if(allPermission.length === 0){
            ErrorMessage('At least one permission is required')
            return;
        }
      
        const payload = {
            permissions: allPermission,
            name: adminName
        }
        PrivateAxios.post('create-role', payload)
            .then((res) => {
                SuccessMessage(res.data.msg)
                fetchModules();
                departmentCreateModelClose()
                setAdminName('')
            })
            .catch((err) => {
                ErrorMessage(err.response.data.message)
                if (err?.response?.status == 401) {
                    // Logout();
                }
            })

    }
    const clearAll=()=>{
        GetAllPermission();
        setAdminName('');
        setAllPermission([]);
    }

  return (
    <Modal show={create} onHide={departmentCreateModelClose} centered size="xl">
    <Modal.Header closeButton>
        <Modal.Title>Create Role</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <div className='col-12 mb-3'>
            <div className='form-group mb-0'>
                <label className='form-label'>Name</label>
                <input type='text' className={`form-control`} placeholder='Enter title' value={adminName}  onChange={(e) => setAdminName(e.target.value)}/>
            </div>
        </div>
        <div className='col-12'>
            <div className='form-group mb-0'>
                <div className='card shadow-none border rounded-3 overflow-hidden'>
                    <div className="card-header bg-primary-grey-light-2 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0"><i className="fas fa-cogs me-2 gth-text-primary"></i>Set Permissions</h6>
                        <small className="text-muted">
                            {allPermission.length}/{totalPermissionCount} selected
                        </small>
                    </div>
                    <div className='card-body role-permission-card p-3'>
                        <div
                            className='border rounded-3 px-3 py-2 mb-3 bg-light'
                            style={{ borderColor: "#dfe3eb" }}
                        >
                            <div className='d-flex justify-content-between align-items-center'>
                                <div className="form-check mb-0">
                                    <input
                                        id="select_all_permissions"
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                    <label className="form-check-label fw-semibold text-dark" htmlFor="select_all_permissions">
                                        Select all permissions
                                    </label>
                                </div>
                                <span className='badge bg-secondary-subtle text-secondary-emphasis'>
                                    Modules: {groups.length}
                                </span>
                            </div>
                        </div>
                        <div style={{ maxHeight: "44vh", overflowY: "auto", paddingRight: "4px" }}>
                            <div className='row g-3'>
                            {
                                groups && groups.map((item, i) => (
                                    <div className='col-lg-6 col-12' key={item.id || i}>
                                        <div className='border rounded-3 p-3 h-100' style={{ background: "#fcfdff", borderColor: "#e2e8f0" }}>
                                            <div className='d-flex justify-content-between align-items-start mb-2'>
                                                <div className="form-check mb-0">
                                                <input
                                                    id={`module_${item.id}`}
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={isGroupChecked(item)}
                                                    ref={(el) => {
                                                        if (el) {
                                                            el.indeterminate = isGroupIndeterminate(item);
                                                        }
                                                    }}
                                                    onChange={(e) => handleGroupChange(item.id, e)}
                                                    disabled={!getGroupPermissions(item).length}
                                                />
                                                    <label className="form-check-label fw-semibold text-dark" htmlFor={`module_${item.id}`}>
                                                        {item.name}
                                                    </label>
                                                </div>
                                                <small className='text-muted'>
                                                    {getGroupSelectedCount(item)}/{getGroupPermissions(item).length}
                                                </small>
                                            </div>
                                            <div className='row g-2 mt-1'>
                                                {
                                                    getGroupPermissions(item).length ? getGroupPermissions(item).map((data) => (
                                                        <div className='col-xl-6 col-12' key={data.id}>
                                                            <div className="form-check mb-0">
                                                            <input
                                                                id={`permission_${item.id}_${data.id}`}
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={isPermissionSelected(item.id, data.id)}
                                                                onChange={(e) => {
                                                                handleItemChange(item.id, data.id, e)
                                                            }} />
                                                                <label className="form-check-label text-dark" htmlFor={`permission_${item.id}_${data.id}`}>
                                                                    {data.name}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className='col-12'>
                                                            <div className="alert alert-light border text-muted py-2 px-3 mb-0">
                                                                No permissions available
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </Modal.Body>
    <Modal.Footer>
        <Button type='reset' variant="secondary" className='btn-sm' onClick={departmentCreateModelClose}>
            Close
        </Button>
        <Button type='submit' variant="success" className='btn-sm' onClick={createUserRole}>
            Save
        </Button>
    </Modal.Footer>
</Modal>
  )
}

export default CreateRole