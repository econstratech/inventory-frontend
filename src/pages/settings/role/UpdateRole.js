import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { PrivateAxios } from '../../../environment/AxiosInstance'
import { ErrorMessage, SuccessMessage } from '../../../environment/ToastMessage'

function UpdateRole({ departmentUpdateModelClose, update,setLoading,data,fetchModules }) {

    const [groups, setGroups] = useState([])
    const GetAllPermission = async () => {
        setLoading(true)
        await PrivateAxios.get("all-permission")
            .then((res) => {
                setLoading(false)
                setGroups(res.data.data);

            }).catch((err) => {
                setLoading(false)
                console.log(err);
            })
    }
    useEffect(() => {
        GetAllPermission()
    }, [])
    useEffect(() => {
        if (data && data.permissions) {
            setAdminName(data.name)
            setGroups(groups.map(group => {
                const updatedModules = group.allmodule.map(module => {
                    const hasPermission = data.permissions.some(permission => permission.id === module.id);
                    if (hasPermission) {
                        return { ...module, selected: true };
                    }
                    return { ...module, selected: false };
                });
                const isGroupSelected = updatedModules.every(module => module.selected);
                return { ...group, allmodule: updatedModules, selected: isGroupSelected };
            }));
            let allPermission = [];
            for (let i = 0; i < data.permissions.length; i++) {
                allPermission.push({ module_id: Number(data.permissions[i].module), permission_id: data.permissions[i].id, name: data.permissions[i].name })
            }
            setAllPermission(allPermission)
        }
    }, [data]);

    useEffect(() => {
        const allSelected = groups.every(group => group.selected);
        setSelectAll(allSelected);
    }, [groups]);

    const [selectAll, setSelectAll] = useState(false);
    const [allPermission, setAllPermission] = useState([]);
    const [allModule, setAllModule] = useState([]);
    const [adminName, setAdminName] = useState('');

    const handleSelectAllChange = (e) => {
        const newValue = e.target.checked;
        setSelectAll(newValue);
        setGroups(prevent => prevent.map(group => ({ ...group, selected: newValue, allmodule: group.allmodule.map(item => ({ ...item, selected: newValue })) })))
        if (newValue) {
            const permissionsToAdd = [];
            groups.forEach(group => {
                group.allmodule.forEach(item => {
                    permissionsToAdd.push({ module_id: group.id, permission_id: item.id, name: item.name });
                });
            });
            setAllPermission([...allPermission, ...permissionsToAdd]);
        } else {
            setAllPermission([]);
        }
    };
    const handleGroupChange = (groupId, e) => {
        const newValue = e.target.checked;
        setGroups(groups.map(group => group.id === groupId ? { ...group, selected: newValue, allmodule: group.allmodule.map(item => ({ ...item, selected: newValue })) } : group));
        if (newValue) {
            const permissionsToAdd = groups
                .find(group => group.id === groupId)
                .allmodule.map(item => ({ module_id: groupId, permission_id: item.id, name: item.name }));
            const uniquePermissions = Array.from(
                new Map([...allPermission, ...permissionsToAdd].map(item => [item.permission_id, item])).values()
            );
            setAllPermission(uniquePermissions);
        } else {
            setAllPermission(allPermission.filter(
                permission => permission.module_id != groupId
            ));
        }
    };
    const handleItemChange = (groupId, itemId, name, e) => {
        if (e.target.checked) {
            setAllPermission([...allPermission, { module_id: groupId, permission_id: itemId, name: name }])
        } else {
            setAllPermission(allPermission.filter(item =>
                !(item.module_id === groupId && item.permission_id === itemId)
            ));
        }
        setGroups(groups.map(group =>
            group.id === groupId ? {
                ...group,
                allmodule: group.allmodule.map(item =>
                    item.id === itemId ? { ...item, selected: !item.selected } : item
                ),
                selected: group.allmodule.every(item => item.id === itemId ? !item.selected : item.selected)
            } : group
        ));

        const allGroupsSelected = groups.every(group =>
            group.allmodule.every(item => item.selected)
        );
        setSelectAll(allGroupsSelected);
    };

    const submitAdmin = (e) => {
        e.preventDefault();
        const payload = {
            permission: allPermission.length > 0 ? JSON.stringify(allPermission) : "",
            name: adminName
        }
        setLoading(true)
        PrivateAxios.put(`role-update/${data.id}`, payload)
            .then((res) => {
                SuccessMessage(res.data.msg)
                // handleCloseEditRoleModal();
                departmentUpdateModelClose();
                fetchModules();
                setLoading(false);
            }).catch((err) => {
                setLoading(false)
                ErrorMessage(err.response.data.msg)
                if (err.response.status == 401) {
                    // Logout();
                }
            })
    }



    return (
        <Modal show={update} onHide={departmentUpdateModelClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Update Role</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='col-12'>
                    <div className='form-group'>
                        <label className='form-label'>Title</label>
                        <input type='text'  className={`form-control`} value={adminName} name='task_name' placeholder='Enter title'  onChange={(e) => setAdminName(e.target.value)}  />
                    </div>
                </div>
                <div className='card-body role-permission-card'>
                    <div className='row'>
                        <div className='col-12'>
                            <div className='form-group'>
                                <label className="custom-checkbox mb-0">
                                    <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
                                    <span className="checkmark" />
                                    <span className="text- text-dark">All</span>
                                </label>
                            </div>
                        </div>
                        {
                            groups && groups.map((item, i) => (
                                <div className='col-lg-4 col-md-6 col-sm-12'>
                                    <div className='form-group'>
                                        <label className="custom-checkbox mb-2">
                                            <input type="checkbox" checked={item.selected} onChange={(e) => handleGroupChange(item.id, e)} />
                                            <span className="checkmark" />
                                            <span className="text- text-dark">{item.name}</span>
                                        </label>
                                        <div className='ps-3'>
                                            {
                                                item.allmodule && item.allmodule.map((data) => (
                                                    <label className="custom-checkbox mb-2">
                                                        <input type="checkbox" checked={data.selected} onChange={(e) => {
                                                            handleItemChange(item.id, data.id, data.name, e)

                                                        }} />
                                                        <span className="checkmark" />
                                                        <span className="text-">{data.name}</span>
                                                    </label>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))
                        }

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