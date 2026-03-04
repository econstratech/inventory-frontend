import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { PrivateAxios } from '../../../environment/AxiosInstance'
import { ErrorMessage, SuccessMessage } from '../../../environment/ToastMessage'

function CreateRole({departmentCreateModelClose,setLoading,create,fetchModules}) {

    const [groups, setGroups] = useState([])
    const GetAllPermission = async () => {
        setLoading(true)
        await PrivateAxios.get("all-permission")
            .then((res) => {
                setLoading(false)
                setGroups(res.data.data);

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
                    permissionsToAdd.push({ module_id: group.id, permission_id: item.id });
                });
            });
            setAllPermission([...allPermission, ...permissionsToAdd]);
        } else {
            setAllPermission([]);
        }
    };

    // console.log(groups);

    const handleGroupChange = (groupId, e) => {
        const newValue = e.target.checked;
        setGroups(groups.map(group => group.id === groupId ? { ...group, selected: newValue, allmodule: group.allmodule.map(item => ({ ...item, selected: newValue })) } : group));
        if (newValue) {
            const permissionsToAdd = groups
                .find(group => group.id === groupId)
                .allmodule.map(item => ({ module_id: groupId, permission_id: item.id }));
            setAllPermission([...allPermission, ...permissionsToAdd]);
        } else {
            setAllPermission(allPermission.filter(
                permission => permission.module_id !== groupId
            ));
        }
    };

    const handleItemChange = (groupId, itemId, e) => {
        
        if (e.target.checked) {
            setAllPermission([...allPermission, { module_id: groupId, permission_id: itemId }])
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
        PrivateAxios.post('create-role', payload)
            .then((res) => {
                SuccessMessage(res.data.msg)
                fetchModules();
                departmentCreateModelClose()
                setAdminName('')
            })
            .catch((err) => {
                ErrorMessage(err.response.data.msg)
                if (err.response.status == 401) {
                    // Logout();
                }
            })

    }
    const clearAll=()=>{
        GetAllPermission();
        setAdminName();
    }

  return (
    <Modal show={create} onHide={departmentCreateModelClose} centered>
    <Modal.Header closeButton>
        <Modal.Title>Create Role</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <div className='col-12'>
            <div className='form-group'>
                <label className='form-label'>Name</label>
                <input type='text' className={`form-control`} placeholder='Enter title' value={adminName}  onChange={(e) => setAdminName(e.target.value)}/>
            </div>
        </div>
        <div className='col-12'>
            <div className='form-group'>
                <div className='card shadow-none border'>
                    <div className="card-header bg-primary-grey-light-2">
                        <h6 className="mb-0"><i className="fas fa-cogs me-2 gth-text-primary"></i>Role Permissions</h6>
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
                                                                handleItemChange(item.id, data.id, e)

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
                </div>
            </div>
        </div>

    </Modal.Body>
    <Modal.Footer>
        <Button type='reset' variant="secondary" className='btn-sm' onClick={departmentCreateModelClose}>
            Close
        </Button>
        <Button type='submit' variant="success" className='btn-sm' onClick={submitAdmin}>
            Save
        </Button>
    </Modal.Footer>
</Modal>
  )
}

export default CreateRole