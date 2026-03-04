import React from 'react';
import { Link, animateScroll as scroll } from 'react-scroll';

function Navigation({ lang = false }) {
    const scrollToSection = (id) => {
        window.scrollTo({
            top: document.getElementById(id).offsetTop,
            behavior: 'smooth',
        });
    };

    return (
        <>
            <ul>
                <li>
                    <a href="/">
                        Home
                    </a>
                </li>
                <li>
                    <a href="#features" onClick={() => scrollToSection('features')}>Features</a>
                </li>
                <li>
                    <a href="https://www.econstra.com/contact-us/">Contact</a>
                </li>
            </ul>
            {/* {lang ? (
                <ul>
                    <li>
                        <a href="#">
                            أنا 
                            
                        </a>
                        <ul className="sub-menu">
                            <li>
                                <a href='#'>الصفحة الرئيسية 1</a>
                            </li>
                            <li>
                                <a href="/home-two">الصفحة الرئيسية 2</a>
                            </li>
                            <li>
                                <a href="/home-three">المنزل 3</a>
                            </li>
                            <li>
                                <a href="/home-four">المنزل 4</a>
                            </li>
                            <li>
                                <a href="/home-five">المنزل 5</a>
                            </li>
                            <li>
                                <a href="/home-six">الصفحة الرئيسية 6</a>
                            </li>
                            <li>
                                <a href="/home-seven">المنزل 7</a>
                            </li>
                            <li>
                                <a href="/home-eight">الصفحة الرئيسية 8</a>
                            </li>
                            <li>
                                <a href="/home-dark">الصفحة الرئيسية الظلام</a>
                            </li>
                            <li>
                                <a href="/home-rtl">الصفحة الرئيسية Rtl</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="/service">خدمة</a>
                    </li>
                    <li>
                        <a href="#">
                            الصفحات 
                            
                        </a>
                        <ul className="sub-menu">
                            <li>
                                <a href="/about-us">عن</a>
                            </li>
                            <li>
                                <a href="/error">خطأ</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#">
                            أخبار 
                            
                        </a>
                        <ul className="sub-menu">
                            <li>
                                <a href="/news">صفحة الأخبار </a>
                            </li>
                            <li>
                                <a href="/news/single-news">أخبار واحدة</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="/contact">اتصل</a>
                    </li>
                </ul>
            ) : (
                <ul>
                    <li>
                        <a href="/">
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="#features" onClick={() => scrollToSection('features')}>Features</a>
                    </li>
                    <li>
                        <a href="https://www.econstra.com/contact-us/">Contact</a>
                    </li>
                </ul>
            )} */}
        </>
    );
}

export default Navigation;
