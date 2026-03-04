import React, { useState, useEffect } from 'react';
import { Button, OverlayTrigger, Tooltip, Modal  } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { UserAuth } from '../pages/auth/Auth';
import { PrivateAxios } from '../environment/AxiosInstance';
import { ErrorMessage, SuccessMessage, WaringMessage } from '../environment/ToastMessage';
function Header() {
    const { Logout, userDetails } = UserAuth();
    const [greeting, setGreeting] = useState('');
    const sessionLogout = () => {
        Logout();
        // window.open(window.location.href,"_blank")

    }
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showChangePasswordValue, setShowChangePasswordValue] = useState({
        "old_password": "",
        "password": "",
        "new_password": "",
    });
    const handleCloseChangePasswordModal = () => {
        setShowChangePasswordModal(false);
        setShowChangePasswordValue({
            ...showChangePasswordValue,
            old_password: "",
            password: "",
            new_password: "",
        })
    }
    const handleShowChangePasswordModal = () => {
        setShowChangePasswordModal(true);
    }
    const ChangePassowrd = (e) => {
        e.preventDefault();
        if (showChangePasswordValue.password === showChangePasswordValue.new_password) {
            PrivateAxios.post('user/change-password', showChangePasswordValue)
                .then((res) => {
                    SuccessMessage(res.data.message);
                    handleCloseChangePasswordModal();
                }).catch((err) => {
                    ErrorMessage(err.response.data.errorMessage)

                })
        } else {
            ErrorMessage('confirm password does not match')
        }
    }


    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const [showPasswordNew, setShowPasswordNew] = useState(false);
    const togglePasswordVisibilityNew = () => {
        setShowPasswordNew(!showPasswordNew);
    };
    const [showPasswordCon, setShowPasswordCon] = useState(false);
    const togglePasswordVisibilityCon = () => {
        setShowPasswordCon(!showPasswordCon);
    };
    const getGreetingMessage = () => {
        const currentHour = new Date().getHours();

        if (currentHour >= 5 && currentHour < 12) {
            return 'Good Morning!';
        } else if (currentHour >= 12 && currentHour < 17) {
            return 'Good Afternoon!';
        } else if (currentHour >= 17 && currentHour < 21) {
            return 'Good Evening!';
        } else {
            return 'Hello!';
        }
    };

    useEffect(() => {
        const message = getGreetingMessage();
        setGreeting(message);
    }, []);

    return (
         <React.Fragment>
        <nav className="main-header navbar navbar-expand navbar-light exp-top-bar exp-top-bar3 px-3">
            {/* Left navbar links */}
            {/* <a href className="brand-link d-flex justify-content-center">
                <img
                    src={process.env.PUBLIC_URL + "/assets/images/logo-icon.webp"}
                    alt="Logo"
                    className="brand-image img-fluid"
                />
                <span className="brand-text">
                    <img
                        src={process.env.PUBLIC_URL + "/assets/images/logo-navy.png"}
                        alt="Logo"
                        className="img-fluid brand-name"
                    />
                </span>
            </a> */}
            <ul className="navbar-nav">
                <li className="nav-item mr-2">
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip >
                                Navigation
                            </Tooltip>
                        }
                    >
                        <button className='nav-link' data-widget="pushmenu" role='button'><i className="fas fa-bars fs-6" /></button>
                    </OverlayTrigger>
                </li>
                <li className="nav-item">
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip >
                                Fullscreen
                            </Tooltip>
                        }
                    >
                        <button className='nav-link' data-widget="fullscreen" role='button'><i className="fas fa-expand-arrows-alt fs-6" /></button>
                    </OverlayTrigger>
                </li>
                {/* <li className="nav-item">
                    <img src={process.env.PUBLIC_URL + '/assets/images/client-logo.png'} alt="Logo" className="top-brand-image img-fluid mt-1 ms-2" />
                </li> */}
            </ul>
            {/* Right navbar links */}
            <ul className="navbar-nav ml-auto align-items-center">
                <li className="nav-item dropdown">
                    <h6 className="d-none d-sm-block m-0">
                        <img src={process.env.PUBLIC_URL + '/assets/images/hand-wave.gif'} alt='hand wave' style={{ width: '25px', marginTop: '-7px' }} />
                        <em>
                            <span className='text-muted'>{greeting}</span><span className='ms-1'>{userDetails.name}</span>
                        </em>
                    </h6>
                </li>
                <li className="nav-item dropdown">
                    <a
                    role="button"
                    className="ps-3 flex-column d-flex justify-content-center"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    >
                    <span>
                        <img
                        className="profile-img"
                        src={process.env.PUBLIC_URL + '/assets/images/user.png'}
                        alt="User"
                        />
                    </span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-sm dropdown-menu-end profile-dropdown ">
                        {/* <div className="dropdown-item">
                            <i className="bi bi-person me-2" />User Name
                        </div> */}
                        <button className="dropdown-item d-flex align-items-center text-nowrap" onClick={handleShowChangePasswordModal}><i className="fas fa-key me-2 mt-1"></i>Change Password</button>
                        <button className="dropdown-item text-nowrap text-danger" onClick={sessionLogout}><i className="fas fa-sign-out-alt me-2"></i><span>Logout</span></button>
                    </div>
                </li>
            </ul>
        </nav>
        <>
    <Modal id="changePasswordModal" show={showChangePasswordModal} onHide={handleCloseChangePasswordModal} backdrop="static" centered size="md">
                <Modal.Header closeButton className="gth-blue-light-bg">
                    <Modal.Title className="gth-modal-title">Change Password</Modal.Title>
                </Modal.Header>
                <form onSubmit={ChangePassowrd}>
                    <Modal.Body className="pb-0">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="form-group">
                                    <label className="form-label">Old Password</label>
                                    <div className='input-group'>
                                        <input type={showPassword ? "text" : "password"} value={showChangePasswordValue.old_password} className="form-control" required placeholder="Enter Old Password" onChange={(e) => setShowChangePasswordValue({ ...showChangePasswordValue, old_password: e.target.value })} />
                                        <div className="input-group-text bg-white">
                                            <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} onClick={togglePasswordVisibility} style={{ marginRight: 5, cursor: 'pointer', color: '#777' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <div className='input-group'>
                                        <input type={showPasswordNew ? "text" : "password"} value={showChangePasswordValue.password} className="form-control" required placeholder="Enter New Password" onChange={(e) => setShowChangePasswordValue({ ...showChangePasswordValue, password: e.target.value })} />
                                        <div className="input-group-text bg-white">
                                            <i className={`fas ${showPasswordNew ? 'fa-eye' : 'fa-eye-slash'}`} onClick={togglePasswordVisibilityNew} style={{ marginRight: 5, cursor: 'pointer', color: '#777' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <div className='input-group'>
                                        <input type={showPasswordCon ? "text" : "password"} value={showChangePasswordValue.new_password} className="form-control" required placeholder="Confirm Password" onChange={(e) => setShowChangePasswordValue({ ...showChangePasswordValue, new_password: e.target.value })} />
                                        <div className="input-group-text bg-white">
                                            <i className={`fas ${showPasswordCon ? 'fa-eye' : 'fa-eye-slash'}`} onClick={togglePasswordVisibilityCon} style={{ marginRight: 5, cursor: 'pointer', color: '#777' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type='submit' className="btn btn-exp-green">
                            Save
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
            </>
             </React.Fragment>
    )
}

export default Header