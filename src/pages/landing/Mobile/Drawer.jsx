import React, { useState } from 'react';
import logo from '../../../landingAssets/images/logo-navy.png';
import { Link } from 'react-router-dom';


function Drawer({ drawer, action, lang }) {
    const [itemSize, setSize] = useState('0px');
    const [item, setItem] = useState('home');
    const handler = (e, value) => {
        // e.preventDefault();
        const getItems = document.querySelectorAll(`#${value} li`).length;
        if (getItems > 0) {
            setSize(`${43 * getItems}px`);
            setItem(value);
        }
    };
    const scrollToSection = (id) => {
        window.scrollTo({
            top: document.getElementById(id).offsetTop - 50,
            behavior: 'smooth',
        });
    };
    return (

        <>
            <div
                onClick={(e) => action(e)}
                className={`off_canvars_overlay ${drawer ? 'active' : ''}`}
            ></div>
            <div className="offcanvas_menu">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div
                                className={`offcanvas_menu_wrapper ${drawer ? 'active' : ''
                                    }`}
                            >
                                <div className="canvas_close">
                                    <a href="#" onClick={(e) => action(e)}>
                                        <i className="fa fa-times"></i>
                                    </a>
                                </div>
                                <div className="offcanvas-brand text-center mb-40">
                                    <img src={logo} alt="" />
                                </div>
                                <div id="menu" className="text-left ">
                                    <ul className="offcanvas_main_menu">
                                        <li
                                            onClick={(e) => handler(e, 'home')}
                                            id="home"
                                            className="menu-item-has-children active"
                                        >
                                            <a href="/">Home</a>

                                        </li>
                                        <li className="menu-item-has-children active"
                                        >
                                            <a href="#features" onClick={() => scrollToSection('features')}>Features</a>
                                        </li>
                                        <li className="menu-item-has-children active">
                                            <a href="https://www.econstra.com/contact-us/">Contact</a>
                                        </li>
                                        <a className="main-btn" href="/register">
                                            Get Started
                                        </a>
                                        {/* <li
                                            onClick={(e) => handler(e, 'news')}
                                            id="news"
                                            className="menu-item-has-children active"
                                        >
                                            <span className="menu-expand">
                                                <i className="fa fa-angle-down"></i>
                                            </span>
                                            <a href="#">News</a>
                                            <ul
                                                className="sub-menu"
                                                style={{
                                                    height:
                                                        item === 'news' ? itemSize : '0px',
                                                }}
                                            >
                                                <li>
                                                    <a href="#">News Page</a>
                                                </li>
                                                <li>
                                                    <a href="#">
                                                        Single News
                                                    </a>
                                                </li>
                                            </ul>
                                        </li> */}

                                    </ul>
                                </div>
                                {/* <div className="offcanvas-social">
                                    <ul className="text-center">
                                        <li>
                                            <a href="$">
                                                <i className="fab fa-facebook-f"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="$">
                                                <i className="fab fa-twitter"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="$">
                                                <i className="fab fa-instagram"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="$">
                                                <i className="fab fa-dribbble"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div> */}
                                {/* <div className="footer-widget-info">
                                    <ul>
                                        <li>
                                            <a href="#">
                                                <i className="fal fa-envelope"></i>{' '}
                                                support@appie.com
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <i className="fal fa-phone"></i> +(642) 342
                                                762 44
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <i className="fal fa-map-marker-alt"></i>{' '}
                                                442 Belle Terre St Floor 7, San Francisco,
                                                AV 4206
                                            </a>
                                        </li>
                                    </ul>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Drawer;
