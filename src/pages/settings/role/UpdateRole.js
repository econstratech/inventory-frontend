import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { PrivateAxios } from '../../../environment/AxiosInstance'
import { ErrorMessage, SuccessMessage } from '../../../environment/ToastMessage'
import { normalizeModuleGroups, sameModuleId } from './modulePermissionUtils'

function UpdateRole({ departmentUpdateModelClose, update, setLoading, data, fetchModules }) {

    const [groups, setGroups] = useState([])
    const [selectAll, setSelectAll] = useState(false);
    const [allPermission, setAllPermission] = useState([]);
    const [adminName, setAdminName] = useState('');

    const getGroupPermissions = (group) => group?.permissions || group?.allmodule || [];
    const getPermissionKey = (moduleId, permissionId) => `${moduleId}_${permissionId}`;

    const GetAllPermission = async () => {
        setLoading(true)
        await PrivateAxios.get("module-wise-permissions")
            .then((res) => {
                setLoading(false)
                const raw = res.data?.data ?? res.data ?? [];
                setGroups(normalizeModuleGroups(Array.isArray(raw) ? raw : []));
            }).catch((err) => {
                setLoading(false)
                if (err.response?.status == 401) {
                    // Logout();
                }
            })
    }

    useEffect(() => {
        GetAllPermission()
    }, [])

    useEffect(() => {
        if (!data) {
            setAdminName('');
            setAllPermission([]);
            return;
        }
        setAdminName(data.name || '');
        if (groups.length === 0) return;
        if (data.permissions && Array.isArray(data.permissions)) {
            const mapped = data.permissions
                .map((p) => ({
                    module_id: p.module_id ?? p.module,
                    permission_id: p.id ?? p.permission_id,
                }))
                .filter(
                    (p) =>
                        p.module_id !== undefined &&
                        p.module_id !== null &&
                        p.permission_id !== undefined &&
                        p.permission_id !== null
                );
            setAllPermission(mapped);
        } else {
            setAllPermission([]);
        }
    }, [data, groups]);

    useEffect(() => {
        // Check if groups is defined and has length before filtering
        const groupsWithPermissions = groups && groups.length > 0 ? groups.filter((group) => getGroupPermissions(group).length > 0) : [];
        // Check if groupsWithPermissions is defined and has length before checking every group
        if (!groupsWithPermissions || groupsWithPermissions.length === 0) {
            setSelectAll(false);
            return;
        }
        // Set select all to true if all groups have all permissions selected
        const allSelected =
            groupsWithPermissions.every((group) =>
                getGroupPermissions(group).every((permission) =>
                    allPermission.some(
                        (item) =>
                            sameModuleId(item.module_id, group.id) &&
                            String(item.permission_id) === String(permission.id)
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
        const targetGroup = groups.find((group) => sameModuleId(group.id, groupId));
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
            setAllPermission((prev) =>
                prev.filter((permission) => !sameModuleId(permission.module_id, groupId))
            );
        }
    };

    const handleItemChange = (groupId, itemId, e) => {
        if (e.target.checked) {
            setAllPermission((prev) => {
                const exists = prev.some(
                    (item) =>
                        sameModuleId(item.module_id, groupId) &&
                        String(item.permission_id) === String(itemId)
                );
                if (exists) return prev;
                return [...prev, { module_id: groupId, permission_id: itemId }];
            });
        } else {
            setAllPermission((prev) =>
                prev.filter(
                    (item) =>
                        !(
                            sameModuleId(item.module_id, groupId) &&
                            String(item.permission_id) === String(itemId)
                        )
                )
            );
        }
    };

    const isPermissionSelected = (groupId, permissionId) =>
        allPermission.some(
            (item) =>
                sameModuleId(item.module_id, groupId) &&
                String(item.permission_id) === String(permissionId)
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

    const totalPermissionCount = groups && groups.length > 0 ? groups.reduce(
        (sum, group) => sum + getGroupPermissions(group).length,
        0
    ) : 0;

    const submitAdmin = (e) => {
        e.preventDefault();
        if (!data?.id) return;

        if (adminName.trim() === '') {
            ErrorMessage('Role name is required');
            return;
        }
        if (allPermission.length === 0) {
            ErrorMessage('At least one permission is required');
            return;
        }

        const payload = {
            permissions: allPermission,
            name: adminName
        };

        setLoading(true)
        PrivateAxios.post(`update-role/${data.id}`, payload)
            .then((res) => {
                SuccessMessage(res.data.msg)
                departmentUpdateModelClose();
                fetchModules();
                setLoading(false);
            }).catch((err) => {
                setLoading(false);
                ErrorMessage(err.response?.data?.msg || err.response?.data?.message || 'Update failed');
                if (err.response?.status == 401) {
                    // Logout();
                }
            })
    }

    return (
        <Modal show={update} onHide={departmentUpdateModelClose} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Update Role</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='col-12 mb-3'>
                    <div className='form-group mb-0'>
                        <label className='form-label'>Name</label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Enter title'
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                        />
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
                                        {groups && groups.length > 0 && groups.map((item, i) => (
                                            <div className='col-lg-6 col-12' key={`module-${item.id}-${i}`}>
                                                <div className='border rounded-3 p-3 h-100' style={{ background: "#fcfdff", borderColor: "#e2e8f0" }}>
                                                    <div className='d-flex justify-content-between align-items-start mb-3'>
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
                                                    <div className="module-permission-list border-top pt-3 mt-1">
                                                        {getGroupPermissions(item).length ? (
                                                            <div className="d-flex flex-column gap-2">
                                                                {getGroupPermissions(item).map((perm) => (
                                                                    <div className="form-check mb-0" key={`perm-${item.id}-${perm.id}`}>
                                                                        <input
                                                                            id={`permission_${item.id}_${perm.id}`}
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            checked={isPermissionSelected(item.id, perm.id)}
                                                                            onChange={(e) => handleItemChange(item.id, perm.id, e)}
                                                                        />
                                                                        <label className="form-check-label text-dark" htmlFor={`permission_${item.id}_${perm.id}`}>
                                                                            {perm.name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="alert alert-light border text-muted py-2 px-3 mb-0">
                                                                No permissions available
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button type='reset' variant="secondary" className='btn-sm' onClick={departmentUpdateModelClose}>
                    Close
                </Button>
                <Button type='submit' variant="success" className='btn-sm' onClick={submitAdmin}>
                    Update
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default UpdateRole
