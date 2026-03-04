import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom';
import "./welcomecss.min.css"
import { Modal } from 'react-bootstrap';
import { UserAuth } from '../auth/Auth';


function WelcomeScreenIndex() {
    const { Logout, userDetails } = UserAuth();
    // const sessionLogout = () => {
    //     Logout();
    // }
    const location = useLocation();
    // ==============================================collapse sidebar and add class to body when on welcome screen
    useEffect(() => {
        if (location.pathname === `/dashboard`) {
            document.body.classList.add("sidebar-collapse");
        } else {
            document.body.classList.remove("sidebar-collapse");
        }
        return () => {
            document.body.classList.remove("sidebar-collapse");
        };
    }, [location.pathname]);

    // ==============================================Tour modal
    const [showTourModal, setShowTourModal] = useState(false);
    const tourModalClose = () => setShowTourModal(false);
    const tourModalShow = () => setShowTourModal(true);

    // ==============================================Explore all module

    
    // const exploreAllModule = () => {
    //     const sidebar = document.querySelector('.sidebar-mini');
    //     if (sidebar) {
    //         const isOpen = sidebar.classList.contains('sidebar-open');
    //         if (isOpen) {
    //             sidebar.classList.remove('sidebar-open', 'option');
    //             sidebar.classList.add('sidebar-closed', 'sidebar-collapse');
    //         } else {
    //             sidebar.classList.remove('sidebar-closed', 'sidebar-collapse');
    //             sidebar.classList.add('sidebar-open');
    //             if (window.innerWidth < 992) {
    //                 sidebar.classList.add('option');
    //             }
    //         }
    //     }
    // };

    const [sidebarOverlay, setSidebarOverlay] = useState(false);

    const exploreAllModule = () => {
        const sidebar = document.querySelector('.sidebar-mini');
        if (sidebar) {
            const isOpen = sidebar.classList.contains('sidebar-open');
            if (isOpen) {
                sidebar.classList.remove('sidebar-open', 'option');
                sidebar.classList.add('sidebar-closed', 'sidebar-collapse');
                setSidebarOverlay(false);
            } else {
                sidebar.classList.remove('sidebar-closed', 'sidebar-collapse');
                sidebar.classList.add('sidebar-open');
                if (window.innerWidth < 992) {
                    sidebar.classList.add('option');
                }
                setSidebarOverlay(true);
            }
        }
    };

    // Hide sidebar and overlay when overlay is clicked
    const handleOverlayClick = () => {
        const sidebar = document.querySelector('.sidebar-mini');
        if (sidebar) {
            sidebar.classList.remove('sidebar-open', 'option');
            sidebar.classList.add('sidebar-closed', 'sidebar-collapse');
        }
        setSidebarOverlay(false);
    };

    // Optionally: Hide overlay if sidebar is closed by other means
    useEffect(() => {
        const handleResizeOrClick = () => {
            const sidebar = document.querySelector('.sidebar-mini');
            if (sidebar && !sidebar.classList.contains('sidebar-open')) {
                setSidebarOverlay(false);
            }
        };
        window.addEventListener('resize', handleResizeOrClick);
        document.addEventListener('mousedown', handleResizeOrClick);
        return () => {
            window.removeEventListener('resize', handleResizeOrClick);
            document.removeEventListener('mousedown', handleResizeOrClick);
        };
    }, []);


    return (
        <>
            {sidebarOverlay && (
                <div
                    id="sidebar-overlay"
                    style={{
                        display: 'block',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.1)',
                        zIndex: 1037
                    }}
                    onClick={handleOverlayClick}
                ></div>
            )}
            <div className=''>
                <div className="welcome-screen">
                    <div className='welcome-header'>
                        <div className='container'>
                            <div className='card welcome-card mb-0 shadow-sm'>
                                <div className='card-body'>
                                    <h1 className='fs-6'>Made in India, Made with Pride
                                        <img src="https://flagcdn.com/in.svg" alt="India Flag" width="25" className='ms-2' />
                                    </h1>
                                    <h2 className='fs-4 fw-bold'>Adeya AI – Tailored for the <span className='text-teal-dark'>Any Industry</span> 👕✨🚀</h2>
                                    <p className='mb-0 f-s-14'>We are glad to have you here. Explore our features and enjoy your experience.</p>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='welcome-body'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-lg-12'>
                                    <div className='card shadow-none border onboarding-card'>
                                        <div className='card-body d-flex flex-wrap justify-content-between align-items-center gap-2'>
                                            <div className='onboarding-card-clinet-name'>
                                                <h2 className='fs-4 fw-bold'>Welcome <span className='text-primary'>{userDetails.name}!</span></h2>
                                                <p className='mb-0 fw-medium f-s-16'>Great to see you! Start exploring and let the journey begin 🌟</p>
                                            </div>
                                            <div>
                                                <img src={process.env.PUBLIC_URL + "/assets/images/welcome-back.gif"} alt="Welcome Icon" width={150} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className='col-lg-6'>
                                    <div className='d-flex flex-wrap gap-2 mb-3'>
                                        <div className='product-tour cursor-pointer' onClick={tourModalShow}>
                                            <div className='product-tour-icon'>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    version="1.1"
                                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                                    width={40}
                                                    height={40}
                                                    x={0}
                                                    y={0}
                                                    viewBox="0 0 497 497"
                                                    style={{ enableBackground: "new 0 0 512 512" }}
                                                    xmlSpace="preserve"
                                                    className=""
                                                >
                                                    <g>
                                                        <path
                                                            fill="#01c0fa"
                                                            d="M497 28.15v337.71c0 10.33-8.38 18.71-18.71 18.71h-153.9c-3.78 0-7.51.68-11 1.99h-15.617L183.61 485.57a31.32 31.32 0 0 1-11 1.99H18.71C8.38 487.56 0 479.18 0 468.85V331.88L313.39 11.43a31.32 31.32 0 0 1 11-1.99h153.9c10.33 0 18.71 8.38 18.71 18.71z"
                                                            opacity={1}
                                                            data-original="#01c0fa"
                                                        />
                                                        <g fill="#08a9f1">
                                                            <path
                                                                d="M289.49 386.56a31.433 31.433 0 0 0-8.61 4.84l-112.56 89.32a31.207 31.207 0 0 1-8.61 4.85 31.32 31.32 0 0 1-11 1.99h23.9c3.78 0 7.51-.68 11-1.99 3.09-1.14 5.99-2.77 8.61-4.85l112.56-89.32c2.62-2.07 5.52-3.7 8.61-4.84v-1.99h-12.9c-3.78 0-7.51.68-11 1.99zM478.29 9.44h-23.899c10.33 0 18.71 8.38 18.71 18.71v337.71c0 10.33-8.38 18.71-18.71 18.71h23.899c10.33 0 18.71-8.38 18.71-18.71V28.15c0-10.33-8.38-18.71-18.71-18.71z"
                                                                fill="#08a9f1"
                                                                opacity={1}
                                                                data-original="#08a9f1"
                                                            />
                                                        </g>
                                                        <path
                                                            fill="#739ad6"
                                                            d="M313.39 11.43v375.13a31.433 31.433 0 0 0-8.61 4.84l-112.56 89.32a31.207 31.207 0 0 1-8.61 4.85l-23.9-197.457 23.9-177.673c3.09-1.14 5.99-2.77 8.61-4.84l112.56-89.32c2.62-2.08 5.52-3.71 8.61-4.85z"
                                                            opacity={1}
                                                            data-original="#739ad6"
                                                            className=""
                                                        />
                                                        <path
                                                            fill="#08a9f1"
                                                            d="M159.71 288.113V487.56h12.9c3.78 0 7.51-.68 11-1.99V332.23zM478.29 9.44h-23.899c10.33 0 18.71 8.38 18.71 18.71v337.71c0 10.33-8.38 18.71-18.71 18.71h23.899c10.33 0 18.71-8.38 18.71-18.71V28.15c0-10.33-8.38-18.71-18.71-18.71z"
                                                            opacity={1}
                                                            data-original="#08a9f1"
                                                        />
                                                        <path
                                                            fill="#739ad6"
                                                            d="M168.321 480.72a31.207 31.207 0 0 1-8.61 4.85v1.99h12.9c3.78 0 7.51-.68 11-1.99v-16.983z"
                                                            opacity={1}
                                                            data-original="#739ad6"
                                                            className=""
                                                        />
                                                        <path
                                                            fill="#5a84c8"
                                                            d="m304.78 16.28-15.29 12.133v349.356c0 4.783-2.296 9.347-6.298 11.966a31.868 31.868 0 0 0-2.312 1.665l-97.271 77.187v16.983c3.09-1.14 5.99-2.77 8.61-4.85l112.56-89.32c2.62-2.07 5.52-3.7 8.61-4.84V11.43a31.216 31.216 0 0 0-8.609 4.85z"
                                                            opacity={1}
                                                            data-original="#5a84c8"
                                                        />
                                                        <path
                                                            fill="#fcf3e3"
                                                            d="M183.61 110.44v221.79c-26.37 17.06-57.8 26.96-91.53 26.96-33.97 0-65.6-10.04-92.08-27.31V131.14c0-10.33 8.38-18.71 18.71-18.71h153.9c3.78 0 7.51-.68 11-1.99z"
                                                            opacity={1}
                                                            data-original="#fcf3e3"
                                                            className=""
                                                        />
                                                        <path
                                                            fill="#fee8c7"
                                                            d="M172.61 112.43h-12.9v201.53c0 11.925-6.721 22.887-17.431 28.13-18.989 9.296-39.98 15.127-62.146 16.679 3.947.276 7.929.421 11.946.421 33.73 0 65.16-9.9 91.53-26.96V110.44a31.31 31.31 0 0 1-10.999 1.99z"
                                                            opacity={1}
                                                            data-original="#fee8c7"
                                                        />
                                                        <path
                                                            fill="#ffd15b"
                                                            d="m97.227 268.576 6.824 2.427c8.737 3.107 17.869-3.528 17.614-12.798l-.199-7.24a13.203 13.203 0 0 1 2.733-8.411l4.416-5.74c5.655-7.349 2.166-18.085-6.728-20.707l-6.947-2.048a13.195 13.195 0 0 1-7.155-5.198l-4.094-5.974c-5.242-7.649-16.53-7.649-21.773 0l-4.094 5.974a13.195 13.195 0 0 1-7.155 5.198l-6.947 2.048c-8.894 2.622-12.383 13.358-6.728 20.707l4.416 5.74a13.2 13.2 0 0 1 2.733 8.411l-.199 7.24c-.255 9.269 8.877 15.904 17.614 12.798l6.824-2.427a13.202 13.202 0 0 1 8.845 0z"
                                                            opacity={1}
                                                            data-original="#ffd15b"
                                                        />
                                                        <path
                                                            fill="#ffc344"
                                                            d="m121.887 216.108-6.947-2.048a13.195 13.195 0 0 1-7.155-5.198l-4.094-5.974c-5.242-7.649-16.53-7.649-21.772 0l-1.063 1.552 3.031 4.422a13.195 13.195 0 0 0 7.155 5.198l6.947 2.048c8.894 2.622 12.383 13.358 6.728 20.707l-4.416 5.74a13.2 13.2 0 0 0-2.733 8.411l.199 7.24a13.065 13.065 0 0 1-3.826 9.658c1.114.096 2.219.334 3.288.713l6.824 2.427c8.737 3.107 17.869-3.528 17.614-12.798l-.199-7.24a13.203 13.203 0 0 1 2.733-8.411l4.417-5.74c5.652-7.35 2.163-18.085-6.731-20.707z"
                                                            opacity={1}
                                                            data-original="#ffc344"
                                                        />
                                                        <path
                                                            fill="#ffd15b"
                                                            d="M443.925 112.122h-77.384c-5.923 0-10.725-4.802-10.725-10.725V69.06c0-5.924 4.802-10.725 10.725-10.725h77.384c5.924 0 10.725 4.802 10.725 10.725v32.337c0 5.923-4.802 10.725-10.725 10.725z"
                                                            opacity={1}
                                                            data-original="#ffd15b"
                                                        />
                                                        <path
                                                            fill="#ffc344"
                                                            d="M443.925 58.334h-23.899c5.923 0 10.725 4.802 10.725 10.725v32.337c0 5.924-4.802 10.725-10.725 10.725h23.899c5.924 0 10.725-4.802 10.725-10.725V69.06c0-5.924-4.802-10.726-10.725-10.726z"
                                                            opacity={1}
                                                            data-original="#ffc344"
                                                        />
                                                        <path
                                                            fill="#ffd15b"
                                                            d="M443.925 202.518h-77.384c-5.923 0-10.725-4.802-10.725-10.725v-32.337c0-5.924 4.802-10.725 10.725-10.725h77.384c5.924 0 10.725 4.802 10.725 10.725v32.337c0 5.923-4.802 10.725-10.725 10.725z"
                                                            opacity={1}
                                                            data-original="#ffd15b"
                                                        />
                                                        <path
                                                            fill="#ffc344"
                                                            d="M443.925 148.73h-23.899c5.923 0 10.725 4.802 10.725 10.725v32.337c0 5.924-4.802 10.725-10.725 10.725h23.899c5.924 0 10.725-4.802 10.725-10.725v-32.337c0-5.923-4.802-10.725-10.725-10.725z"
                                                            opacity={1}
                                                            data-original="#ffc344"
                                                        />
                                                        <path
                                                            fill="#ffd15b"
                                                            d="M114.787 415H68.822c-4.143 0-7.5-3.358-7.5-7.5s3.357-7.5 7.5-7.5h45.965c4.143 0 7.5 3.358 7.5 7.5s-3.357 7.5-7.5 7.5z"
                                                            opacity={1}
                                                            data-original="#ffd15b"
                                                        />
                                                        <path
                                                            fill="#fcf3e3"
                                                            d="M144.359 446.296H39.251c-4.143 0-7.5-3.358-7.5-7.5s3.357-7.5 7.5-7.5h105.108c4.143 0 7.5 3.358 7.5 7.5s-3.357 7.5-7.5 7.5z"
                                                            opacity={1}
                                                            data-original="#fcf3e3"
                                                            className=""
                                                        />
                                                        <path
                                                            fill="#ffd15b"
                                                            d="M222.854 167.901a7.5 7.5 0 0 1-4.667-13.375l56.136-44.545a7.5 7.5 0 0 1 9.324 11.75l-56.136 44.545a7.468 7.468 0 0 1-4.657 1.625z"
                                                            opacity={1}
                                                            data-original="#ffd15b"
                                                        />
                                                        <path
                                                            fill="#fcf3e3"
                                                            d="M222.854 209.397a7.5 7.5 0 0 1-4.667-13.375l56.136-44.545a7.5 7.5 0 0 1 9.324 11.75l-56.136 44.545a7.468 7.468 0 0 1-4.657 1.625zM222.854 250.894a7.5 7.5 0 0 1-4.667-13.375l56.136-44.545a7.5 7.5 0 0 1 9.324 11.75l-56.136 44.545a7.468 7.468 0 0 1-4.657 1.625z"
                                                            opacity={1}
                                                            data-original="#fcf3e3"
                                                            className=""
                                                        />
                                                        <path
                                                            fill="#ffd15b"
                                                            d="M222.854 337.812a7.5 7.5 0 0 1-4.667-13.375l56.136-44.545a7.5 7.5 0 0 1 9.324 11.75l-56.136 44.545a7.474 7.474 0 0 1-4.657 1.625z"
                                                            opacity={1}
                                                            data-original="#ffd15b"
                                                        />
                                                        <path
                                                            fill="#fcf3e3"
                                                            d="M222.854 379.308a7.5 7.5 0 0 1-4.667-13.375l56.136-44.545a7.5 7.5 0 0 1 9.324 11.75l-56.136 44.545a7.468 7.468 0 0 1-4.657 1.625z"
                                                            opacity={1}
                                                            data-original="#fcf3e3"
                                                            className=""
                                                        />
                                                        <circle
                                                            cx="363.153"
                                                            cy="263.796"
                                                            r="7.338"
                                                            fill="#ffd15b"
                                                            opacity={1}
                                                            data-original="#ffd15b"
                                                        />
                                                        <path
                                                            fill="#fcf3e3"
                                                            d="M446.891 271.296h-55.717c-4.143 0-7.5-3.358-7.5-7.5s3.357-7.5 7.5-7.5h55.717a7.5 7.5 0 0 1 0 15z"
                                                            opacity={1}
                                                            data-original="#fcf3e3"
                                                            className=""
                                                        />
                                                        <circle
                                                            cx="363.153"
                                                            cy="304.038"
                                                            r="7.338"
                                                            fill="#ffd15b"
                                                            opacity={1}
                                                            data-original="#ffd15b"
                                                        />
                                                        <path
                                                            fill="#fcf3e3"
                                                            d="M446.891 311.538h-55.717c-4.143 0-7.5-3.358-7.5-7.5s3.357-7.5 7.5-7.5h55.717a7.5 7.5 0 0 1 0 15z"
                                                            opacity={1}
                                                            data-original="#fcf3e3"
                                                            className=""
                                                        />
                                                    </g>
                                                </svg>
                                            </div>
                                            <p className='mb-0 fw-medium f-s-14'>Take a Product Tour<i class="fas fa-external-link-alt ms-2"></i></p>
                                        </div>
                                        <div className='product-tour cursor-pointer' onClick={exploreAllModule}>
                                            <div className='product-tour-icon'>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    version="1.1"
                                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                                    width={40}
                                                    height={40}
                                                    x={0}
                                                    y={0}
                                                    viewBox="0 0 33 33"
                                                    style={{ enableBackground: "new 0 0 512 512" }}
                                                    xmlSpace="preserve"
                                                    className=""
                                                >
                                                    <g>
                                                        <path
                                                            fill="#ed6262"
                                                            d="M24.303 5.237v9.01l-7.81 4.5v-.01l-7.79-4.49v-9.01l7.8-4.5z"
                                                            opacity={1}
                                                            data-original="#ed6262"
                                                            className=""
                                                        />
                                                        <path
                                                            fill="#cd484b"
                                                            d="M8.7 5.237 16.502.733l7.803 4.504-7.803 4.505z"
                                                            opacity={1}
                                                            data-original="#cd484b"
                                                            className=""
                                                        />
                                                        <path
                                                            fill="#ffbd49"
                                                            d="M32.103 18.747v9.01l-7.79 4.51h-.01l-7.8-4.51v-9.01l7.8-4.5z"
                                                            opacity={1}
                                                            data-original="#ffbd49"
                                                        />
                                                        <path
                                                            fill="#ec9821"
                                                            d="m16.502 18.752 7.803-4.505 7.802 4.505-7.802 4.504z"
                                                            opacity={1}
                                                            data-original="#ec9821"
                                                        />
                                                        <path
                                                            fill="#3aa2eb"
                                                            d="M16.503 18.747v9.01l-7.8 4.51-7.81-4.51v-9.01l7.81-4.5z"
                                                            opacity={1}
                                                            data-original="#3aa2eb"
                                                        />
                                                        <path
                                                            fill="#0f71c7"
                                                            d="M.898 18.752 8.7 14.247l7.802 4.505L8.7 23.256z"
                                                            opacity={1}
                                                            data-original="#0f71c7"
                                                            className=""
                                                        />
                                                        <path
                                                            fill="#f9b548"
                                                            d="M32.103 24.697v3.06l-7.79 4.51-1.96-3.39c-.17-.3-.06-.68.25-.84.3-.15.65-.02.82.26l.45.79c.15.25.47.32.72.17h.01v-.01a.51.51 0 0 0 .22-.7l-.5-.86c-.17-.3-.05-.68.25-.84.3-.15.66-.02.82.26l.42.73c.179.309.59.34.74.19.236-.079.382-.433.22-.71l-.56-.98a.59.59 0 0 1 .25-.84c.29-.15.65-.02.81.27l.94 1.62c.14.24.45.31.68.16a.51.51 0 0 0 .22-.72l-.9-1.56a.618.618 0 0 1 .23-.83c.28-.17.64-.07.82.21l.6 1.05c.17.29.53.42.82.27.31-.16.42-.54.25-.84l-.9-1.57c-.18-.3-.06-.69.25-.85.29-.14.65-.01.81.27.051.089.944 1.654 1.01 1.72z"
                                                            opacity={1}
                                                            data-original="#f9b548"
                                                        />
                                                        <path
                                                            fill="#ef6a6a"
                                                            d="M24.303 11.197v3.05l-7.81 4.5v-.01l-1.95-3.37c-.17-.3-.06-.69.25-.85.29-.14.65-.01.82.27l.45.79c.15.25.47.32.72.17v-.01h.01c.26-.14.36-.45.21-.71l-.49-.85c-.17-.3-.06-.69.25-.85.3-.15.66-.02.82.27l.42.73c.15.25.48.34.73.19h.01c.309-.205.35-.488.22-.71l-.57-.98c-.17-.3-.06-.69.25-.85.3-.15.65-.01.82.27l.93 1.62c.14.24.46.32.69.16.32-.213.353-.483.22-.71l-.9-1.57a.592.592 0 0 1 .22-.82c.29-.17.65-.07.82.2l.61 1.06c.17.28.53.42.82.27.31-.16.42-.55.25-.85l-.91-1.57c-.17-.3-.06-.68.25-.84.3-.15.66-.02.82.27.064.111.938 1.649 1.02 1.73z"
                                                            opacity={1}
                                                            data-original="#ef6a6a"
                                                        />
                                                        <path
                                                            fill="#41acef"
                                                            d="m10.663 28.877-1.96 3.39-7.81-4.51v-3.04c.04-.03.07-.07.09-.11l.94-1.63c.16-.28.52-.41.81-.27.31.16.42.55.25.85l-.9 1.57c-.18.3-.06.68.25.84.29.15.65.02.81-.27l.61-1.05c.17-.28.54-.38.82-.21.29.17.39.54.23.83l-.91 1.56c-.14.25-.05.56.19.7.349.175.588.087.72-.14l.94-1.62c.16-.29.52-.42.81-.27.31.16.43.54.25.84l-.56.98c-.162.277-.016.631.22.71v.01c.26.15.59.06.74-.2l.42-.73a.63.63 0 0 1 .82-.26c.3.16.42.54.25.84l-.5.86a.51.51 0 0 0 .22.7v.01h.01c.25.15.57.08.72-.17l.45-.79a.63.63 0 0 1 .82-.26c.31.16.42.54.25.84z"
                                                            opacity={1}
                                                            data-original="#41acef"
                                                            className=""
                                                        />
                                                    </g>
                                                </svg>
                                            </div>
                                            <p className='mb-0 fw-medium f-s-14'>Explore All Modules<i class="fas fa-external-link-alt ms-2"></i></p>
                                        </div>
                                    </div>
                                </div> */}


                                {/* <div className='col-lg-6'>
                                    <div className='card shadow-none border billing-card bg-light'>
                                        <div className='card-body d-flex flex-wrap justify-content-between align-items-center gap-2'>
                                            <div className='billing-card-info'>
                                                <h5 className='text-primary'>Billing Information</h5>
                                                <p className='fs-6 fw-medium'>Your Current Plan : <b>Basic Plan</b></p>
                                                <p className='mb-0'>Your plan will expire within</p>
                                                <p className='fs-5 fw-bold mb-0 text-danger'>30 Days</p>
                                            </div>
                                            <div>
                                                <img src={process.env.PUBLIC_URL + "/assets/images/billing-invoice.png"} alt="Billing Icon" width={100} />
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                                <div className='col-lg-12'>
                                    <div className='onboarding-card-tabs'>
                                        <ul className="nav nav-pills mb-2" id="myTab" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link active rounded-5 f-s-14 fw-bold"
                                                    id="home-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#home"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="home"
                                                    aria-selected="true"
                                                >
                                                    Home
                                                </button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link rounded-5 f-s-14 fw-bold"
                                                    id="profile-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#profile"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="profile"
                                                    aria-selected="false"
                                                >
                                                    Profile
                                                </button>
                                            </li>
                                        </ul>
                                        <div className="tab-content">
                                            <div
                                                className="tab-pane active"
                                                id="home"
                                                role="tabpanel"
                                                aria-labelledby="home-tab"
                                            >
                                                <h5>Boost your profits by up to 110% with Adeya AI 🚀</h5>
                                                <p className='f-s-14'>Adeya AI empowers your team to perform at their best, leading to measurable increases in both revenue and profit.</p>
                                            </div>
                                            <div
                                                className="tab-pane"
                                                id="profile"
                                                role="tabpanel"
                                                aria-labelledby="profile-tab"
                                            >
                                                <h5>Your data is 100% secure — protected with the same level of encryption trusted by leading email providers. 🔐</h5>
                                                <p className='f-s-14'>
                                                Adeya is a proudly Indian AI-Agentic platform built for MSME manufacturers. We help factories unlock profits using TOC, intelligent agents, and deep manufacturing understanding.                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='tour_video_wrapper'>
                                        {/* <iframe width="100%" height="100%" src="https://www.youtube.com/embed/s5j35CQhmCk?si=C6-BEBUslXjB_pyz" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}
                                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jT1DkxcjRI8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                                    </div>
                                </div>

                                {/* <div className='card shadow-none border tran-history-card mb-0'>
                                        <div className='card-body'>
                                            <h5 className='text-primary'>📄 Transaction History</h5>
                                            <div className='fixed-table-wrapper'>
                                                <table className="table table-striped fixedTable-head">
                                                    <thead>
                                                        <tr>
                                                            <th className='text-nowrap'>Purchase Plan</th>
                                                            <th className='text-nowrap'>Purchase Date</th>
                                                            <th className='text-nowrap'>Transaction ID</th>
                                                            <th className='text-nowrap'>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                Basic Plan <span className='badge badge-success'>Active plan</span>
                                                            </td>
                                                            <td>01 Jan, 2025</td>
                                                            <td>#GTH0000211550</td>
                                                            <td>
                                                                <span className='text-nowrap'>&#8377; 1000.00</span>
                                                                <button className='btn btn-sm btn-primary'><span className='me-2'>🧾</span>Invoice</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                Basic Plan
                                                            </td>
                                                            <td>01 Jan, 2024</td>
                                                            <td>#GTH0000211550</td>
                                                            <td>
                                                                <span className='text-nowrap'>&#8377; 1000.00</span>
                                                                <button className='btn btn-sm btn-primary'><span className='me-2'>🧾</span>Invoice</button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div> */}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                show={showTourModal}
                onHide={tourModalClose}
                backdrop="static"
                keyboard={false}
                centered
                size="xl"
                className="tour_modal"
            >
                <Modal.Header>
                    <Modal.Title>Product Tour</Modal.Title>
                </Modal.Header>
                <button onClick={tourModalClose} className="border-0 close_btn">
                    <i class="fas fa-times f-s-16" close_btn></i>
                </button>
                <Modal.Body>
                    <div className='tour_video_wrapper'>
                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/s5j35CQhmCk?si=C6-BEBUslXjB_pyz" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default WelcomeScreenIndex