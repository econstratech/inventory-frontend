import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import Select from 'react-select'
import { PrivateAxios } from '../../environment/AxiosInstance'
import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage'



function AddUser({ editUserShow, editUserModalClose, companyId, companyEmail }) {

    // const [selectRole, setSelectRole] = useState([])
    // const [groups, setGroups] = useState([])
    // const GetAllPermission = async () => {
    //     await PrivateAxios.get("all-permission")
    //         .then((res) => {

    //             setGroups(res.data.data);

    //         }).catch((err) => {

    //             console.log(err);
    //         })
    // }
    // useEffect(() => {
    //     GetAllPermission()
    // }, [])

    // useEffect(() => {
    //     const allSelected = groups.every(group => group.selected);
    //     setSelectAll(allSelected);
    // }, [groups]);

    // const [selectAll, setSelectAll] = useState(false);
    // const [allPermission, setAllPermission] = useState([]);
    // const [allModule, setAllModule] = useState([]);
    // const [adminName, setAdminName] = useState('');

    // const handleSelectAllChange = (e) => {
    //     const newValue = e.target.checked;
    //     setSelectAll(newValue);
    //     setGroups(prevent => prevent.map(group => ({ ...group, selected: newValue, allmodule: group.allmodule.map(item => ({ ...item, selected: newValue })) })))
    //     if (newValue) {
    //         const permissionsToAdd = [];
    //         groups.forEach(group => {
    //             group.allmodule.forEach(item => {
    //                 permissionsToAdd.push({ module_id: group.id, permission_id: item.id, name: item.name });
    //             });
    //         });
    //         setAllPermission([...allPermission, ...permissionsToAdd]);
    //     } else {
    //         setAllPermission([]);
    //     }
    // };

    // const handleGroupChange = (groupId, e) => {
    //     const newValue = e.target.checked;
    //     setGroups(groups.map(group => group.id === groupId ? { ...group, selected: newValue, allmodule: group.allmodule.map(item => ({ ...item, selected: newValue })) } : group));
    //     if (newValue) {
    //         const permissionsToAdd = groups
    //             .find(group => group.id === groupId)
    //             .allmodule.map(item => ({ module_id: groupId, permission_id: item.id, name: item.name }));
    //         setAllPermission([...allPermission, ...permissionsToAdd]);
    //     } else {
    //         setAllPermission(allPermission.filter(
    //             permission => permission.module_id !== groupId
    //         ));
    //     }
    // };

    // const handleItemChange = (groupId, itemId, name, e) => {
    //     console.log(groupId, itemId);
    //     if (e.target.checked) {
    //         setAllPermission([...allPermission, { module_id: groupId, permission_id: itemId, name: name }])
    //     } else {
    //         setAllPermission(allPermission.filter(item =>
    //             !(item.module_id === groupId && item.permission_id === itemId)
    //         ));
    //     }
    //     setGroups(groups.map(group =>
    //         group.id === groupId ? {
    //             ...group,
    //             allmodule: group.allmodule.map(item =>
    //                 item.id === itemId ? { ...item, selected: !item.selected } : item
    //             ),
    //             selected: group.allmodule.every(item => item.id === itemId ? !item.selected : item.selected)
    //         } : group
    //     ));

    //     const allGroupsSelected = groups.every(group =>
    //         group.allmodule.every(item => item.selected)
    //     );
    //     setSelectAll(allGroupsSelected);
    // };

    const [userData, setUserData] = useState({
        "name": "",
        "email": "",
        "p_isd": "",
        "phone": "",
        "w_isd": "",
        "wsnumber": "",
        "password": "",
    })


    const submitUser = (e) => {
        e.preventDefault();
        if (userData.p_isd == "" || userData.phone == "" || userData.w_isd == "" || userData.wsnumber == "" || companyEmail == "") {
            ErrorMessage("Please give your Mobile number and whatsApp number")
        } else {
            const payload = {
                ...userData,
                company_email: companyEmail,
                company_id: companyId
            }
            PrivateAxios.post('company/create-user-growthh', payload)
                .then((res) => {
                    // GetUser();
                    SuccessMessage(res.data.msg)
                    editUserModalClose();
                    setUserData({
                        "name": "",
                        "email": "",
                        "p_isd": "",
                        "phone": "",
                        "w_isd": "",
                        "wsnumber": "",
                        "password": "",
                    })
                }).catch((err) => {
                    ErrorMessage(err.response.data.msg)
                })
        }

    }


    return (
        <Modal id="editUserModal" show={editUserShow} onHide={editUserModalClose} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton className="gth-blue-light-bg">
                <Modal.Title className="gth-modal-title">Add User</Modal.Title>
            </Modal.Header>
            <form onSubmit={submitUser}>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-12'>
                            <h5 className='fw-bold mb-3'>Company Name</h5>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Name <span className="text-exp-red">*</span></label>
                                <input type="text" required className="form-control" onChange={(e) => setUserData({ ...userData, name: e.target.value })} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Email <span className="text-exp-red">*</span></label>
                                <input type="email" required className="form-control" onChange={(e) => setUserData({ ...userData, email: e.target.value })} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Phone <span className="text-exp-red">*</span></label>
                                <PhoneInput
                                    country={'in'}
                                    value={`${userData.p_isd}${userData.phone}`}
                                    onChange={(value, country) => {
                                        const code = `${country.dialCode}`;
                                        const number = value.replace(code, '');
                                        setUserData({ ...userData, phone: number, p_isd: code, wsnumber: number, w_isd: code })
                                    }}
                                />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">WhatsApp</label>
                                <PhoneInput
                                    required
                                    country={'in'}
                                    value={`${userData.w_isd}${userData.wsnumber}`}
                                    onChange={(value, country) => {
                                        const code = `${country.dialCode}`;
                                        const number = value.replace(code, '');
                                        setUserData({ ...userData, wsnumber: number, w_isd: code })
                                    }}
                                />
                            </div>
                        </div>
                        {/* <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Department <span className="text-exp-red">*</span></label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        required
                                        name='department'
                                        options={department}
                                        getOptionLabel={(option) => option.title}
                                        getOptionValue={(option) => option.id}
                                        theme={(theme) => ({
                                            ...theme,
                                            colors: {
                                                ...theme.colors,
                                                primary25: '#ddddff',
                                                primary: '#6161ff',
                                            },
                                        })}
                                        onChange={(data) => setUserData({ ...userData, depertment_id: data.id })}
                                    />
                                </div>

                            </div>
                        </div> */}
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Password <span className="text-exp-red">*</span></label>
                                <input type="password" required className="form-control" onChange={(e) => setUserData({ ...userData, password: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    {/* <div className="row">
                        <div className="col-12">
                            <div className="form-group">
                                <div className="card shadow-none border">
                                    <div className="card-header bg-primary-grey-light-2">
                                        <h6 className="mb-0"><i className="fas fa-user-shield me-2 gth-text-primary"></i>Role Management</h6>
                                    </div>
                                    <div className="card-body pb-3">
                                        <div className="d-flex flex-wrap">
                                            {role.length > 0 ? role.map((item) => (
                                                <label className="custom-checkbox me-3 mb-2">
                                                    <input type="checkbox" checked={selectRole.find((data) => data.role_id === item.id) ? true : false}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                if (item.id === 10 || item.id === 11 || item.id === 12) {
                                                                    setSelectRole((prevSelected) =>
                                                                        prevSelected.filter(
                                                                            (role) => !(role.role_id === 10 || role.role_id === 11 || role.role_id === 12)
                                                                        )
                                                                    );
                                                                }
                                                                setSelectRole((prevSelected) => [...prevSelected, { role_id: item.id }]);
                                                            } else {
                                                                setSelectRole((prevSelected) =>
                                                                    prevSelected.filter((role) => role.role_id !== item.id)
                                                                );
                                                            }
                                                        }} />
                                                    <span className="checkmark" />
                                                    <span className="text-">{item.name}</span>
                                                </label>)) : ""
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-12'>
                            <div className='form-group'>
                                <div className='card shadow-none border'>
                                    <div className="card-header bg-primary-grey-light-2">
                                        <h6 className="mb-0"><i className="fas fa-cogs me-2 gth-text-primary"></i>Additional Permissions</h6>
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
                                </div>
                            </div>
                        </div>
                    </div> */}
                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-exp-green'>
                        Create
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

export default AddUser