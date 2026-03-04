import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import taskManager from '../../../landingAssets/images/task-management.webp';
import shapeSix from '../../../landingAssets/images/shape/shape-6.png';
import shapeSeven from '../../../landingAssets/images/shape/shape-7.png';
import shapeEight from '../../../landingAssets/images/shape/shape-8.png';

function FeaturesHomeOne({ className }) {
    const [tab, setTab] = useState('taskManager');
    const handleClick = (e, value) => {
        e.preventDefault();
        setTab(value);
    };
    return (
        <section className={`appie-features-area pt-100 ${className}`} id="features">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-3">
                        <div className="appie-features-tabs-btn">
                            <div
                                className="nav flex-column nav-pills"
                                id="v-pills-tab"
                                role="tablist"
                                aria-orientation="vertical"
                            >
                                <a
                                    onClick={(e) => handleClick(e, 'taskManager')}
                                    className={`nav-link ${tab === 'taskManager' ? 'active' : ''}`}
                                    id="v-pills-home-tab"
                                    data-toggle="pill"
                                    href="#v-pills-home"
                                    role="tab"
                                    aria-controls="v-pills-home"
                                    aria-selected="true"
                                >
                                    <span className="tab-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={512} height={512} viewBox="0 0 512 512" fill="none">
                                            <g clipPath="url(#clip0_2_52)">
                                                <path d="M41.2896 446.071H256V429.551H41.2896C27.608 429.551 16.5154 418.459 16.5154 404.777V41.4221C16.5154 27.7362 27.608 16.6479 41.2896 16.6479H404.645C418.332 16.6479 429.419 27.7362 429.419 41.4221V231.356H445.938V41.4221C445.912 18.6286 427.44 0.159501 404.645 0.132477H41.2896C18.5004 0.158971 0.0291436 18.6286 0 41.4221V404.777C0.0291436 427.57 18.5004 446.04 41.2896 446.071Z" />
                                                <path d="M33.0351 33.1675H49.5484V49.6808H33.0351V33.1675ZM66.0638 33.1675H82.5834V49.6808H66.0638V33.1675ZM99.0967 33.1675H115.614V49.6808H99.0967V33.1675ZM33.0351 66.1957H412.903V82.7159H33.0351V66.1957ZM118.034 101.649L97.0577 122.625C79.3273 110.887 55.5837 114.488 42.1279 130.956C28.6741 147.422 29.8807 171.407 44.9161 186.44C59.9489 201.48 83.9367 202.686 100.404 189.23C116.871 175.777 120.474 152.029 108.734 134.303L129.708 113.327L118.034 101.649ZM74.3204 181.808C60.6404 181.808 49.5484 170.717 49.5484 157.036C49.5484 143.352 60.6404 132.264 74.3204 132.264C78 132.275 81.629 133.121 84.9345 134.737L68.4853 151.189L80.1592 162.868L96.6211 146.426C98.2382 149.73 99.0847 153.358 99.0967 157.036C99.0967 170.718 88.0084 181.808 74.3204 181.808ZM140.388 132.264H280.772V148.777H140.388V132.264ZM140.388 165.295H198.193V181.808H140.388V165.295ZM214.71 165.295H330.32V181.808H214.71V165.295ZM297.29 132.264H379.871V148.777H297.29V132.264ZM118.034 200.745L97.0577 221.721C79.3273 209.983 55.5837 213.584 42.1279 230.052C28.6741 246.52 29.8807 270.503 44.9161 285.541C59.9489 300.576 83.9367 301.783 100.404 288.327C116.871 274.871 120.474 251.131 108.734 233.399L129.708 212.423L118.034 200.745ZM74.3204 280.906C60.6404 280.906 49.5484 269.814 49.5484 256.132C49.5484 242.449 60.6404 231.356 74.3204 231.356C78.0001 231.37 81.629 232.217 84.9345 233.834L68.4853 250.289L80.1592 261.963L96.6211 245.52C98.238 248.825 99.0844 252.453 99.0967 256.132C99.0967 269.814 88.0084 280.907 74.3204 280.907V280.906ZM140.388 231.356H280.772V247.874H140.388V231.356ZM140.388 264.391H198.193V280.907H140.388V264.391ZM214.71 264.391H280.772V280.907H214.71V264.391ZM297.29 231.356H330.32V247.874H297.29V231.356ZM118.034 299.842L97.0577 320.817C79.3273 309.079 55.5837 312.681 42.1279 329.149C28.6741 345.617 29.8807 369.6 44.9161 384.638C59.9489 399.675 83.9367 400.878 100.404 387.423C116.871 373.967 120.474 350.226 108.734 332.493L129.708 311.52L118.034 299.842ZM74.3204 380.003C60.6404 380.003 49.5484 368.911 49.5484 355.229C49.5484 341.545 60.6404 330.455 74.3204 330.455C78.0002 330.466 81.6295 331.313 84.9345 332.931L68.4853 349.386L80.1592 361.06L96.6211 344.617C98.2378 347.922 99.0843 351.55 99.0967 355.229C99.0967 368.911 88.0084 380.003 74.3204 380.003ZM140.388 330.455H247.742V346.975H140.388V330.455ZM140.388 363.488H198.193V380.003H140.388V363.488ZM214.71 363.488H247.741V380.003H214.71V363.488ZM388.131 495.619C456.547 495.619 512 440.156 512 371.746C512 303.331 456.547 247.874 388.131 247.874C319.716 247.874 264.259 303.331 264.259 371.747C264.339 440.124 319.75 495.536 388.131 495.619ZM388.131 264.391C447.418 264.391 495.487 312.455 495.487 371.746C495.487 431.038 447.418 479.1 388.131 479.1C328.838 479.1 280.772 431.037 280.772 371.747C280.843 312.485 328.865 264.457 388.131 264.391Z" />
                                                <path d="M337.757 376.31L322.975 383.691L339.492 416.724C340.076 417.896 340.931 418.912 341.986 419.688C343.041 420.464 344.266 420.978 345.559 421.187C345.985 421.253 346.411 421.289 346.84 421.295C349.028 421.295 351.128 420.423 352.681 418.875L451.773 319.778L440.1 308.1L349.1 399.096L337.757 376.31Z" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_2_52">
                                                <rect width={512} height={512} fill="white" />
                                                </clipPath>
                                            </defs>
                                            </svg>


                                    </span>
                                    Task Manager
                                </a>
                                <a
                                    onClick={(e) => handleClick(e, 'report')}
                                    className={`nav-link ${tab === 'report' ? 'active' : ''}`}
                                    id="v-pills-profile-tab"
                                    data-toggle="pill"
                                    href="#v-pills-profile"
                                    role="tab"
                                    aria-controls="v-pills-profile"
                                    aria-selected="false"
                                >
                                    <span className="tab-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 573 551" fill="none">
                                            <path d="M96.34 202.84L160.34 138.84L171.66 150.15L107.66 214.15L96.34 202.84Z" />
                                            <path d="M414 536.5H62C57.58 536.5 54 532.92 54 528.5V96.5C54 94.38 54.84 92.34 56.34 90.84L120.34 26.84C121.84 25.34 123.87 24.5 126 24.5H414C418.42 24.5 422 28.08 422 32.5V528.5C422 532.92 418.42 536.5 414 536.5ZM70 520.5H406V40.5H129.31L70 99.81V520.5Z" />
                                            <path d="M126 104.5H62V88.5H118V32.5H134V96.5C134 100.92 130.42 104.5 126 104.5ZM166 216.5H102C97.58 216.5 94 212.92 94 208.5V144.5C94 140.08 97.58 136.5 102 136.5H166C170.42 136.5 174 140.08 174 144.5V208.5C174 212.92 170.42 216.5 166 216.5ZM110 200.5H158V152.5H110V200.5ZM206 152.5H382V168.5H206V152.5ZM190 184.5H382V200.5H190V184.5ZM166 320.5H102C97.58 320.5 94 316.92 94 312.5V248.5C94 244.08 97.58 240.5 102 240.5H166C170.42 240.5 174 244.08 174 248.5V312.5C174 316.92 170.42 320.5 166 320.5ZM110 304.5H158V256.5H110V304.5ZM206 256.5H382V272.5H206V256.5ZM190 288.5H382V304.5H190V288.5ZM166 424.5H102C97.58 424.5 94 420.92 94 416.5V352.5C94 348.08 97.58 344.5 102 344.5H166C170.42 344.5 174 348.08 174 352.5V416.5C174 420.92 170.42 424.5 166 424.5ZM110 408.5H158V360.5H110V408.5ZM206 360.5H382V376.5H206V360.5ZM190 392.5H382V408.5H190V392.5ZM510 536.5H462C457.58 536.5 454 532.92 454 528.5V224.5C454 220.08 457.58 216.5 462 216.5H510C514.42 216.5 518 220.08 518 224.5V528.5C518 532.92 514.42 536.5 510 536.5ZM470 520.5H502V232.5H470V520.5Z" />
                                            <path d="M462 440.5H510V456.5H462V440.5ZM502.5 227.31L486 183.28L469.5 227.28L454.51 221.68L478.51 157.68C480.05 153.54 484.66 151.44 488.8 152.98C490.97 153.79 492.69 155.51 493.5 157.68L517.5 221.68L502.5 227.31Z" />
                                        </svg>

                                    </span>  Checksheet
                                </a>
                                <a
                                    onClick={(e) => handleClick(e, 'notice')}
                                    className={`nav-link ${tab === 'notice' ? 'active' : ''}`}
                                    id="v-pills-messages-tab"
                                    data-toggle="pill"
                                    href="#v-pills-messages"
                                    role="tab"
                                    aria-controls="v-pills-messages"
                                    aria-selected="false"
                                >
                                    <span className="tab-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" x={0} y={0} viewBox="0 0 64 64" style={{ enableBackground: 'new 0 0 512 512' }} xmlSpace="preserve" className><g><path d="M23.059 34.1a1.723 1.723 0 0 0 .193 1.349l1.288 2.133a1.835 1.835 0 0 0 2.438.641l.376-.208a7.825 7.825 0 0 0 1.553.867v.349A1.789 1.789 0 0 0 30.711 41h2.578a1.789 1.789 0 0 0 1.8-1.768v-.349a7.847 7.847 0 0 0 1.553-.867l.376.208a1.835 1.835 0 0 0 2.437-.64l1.29-2.134a1.727 1.727 0 0 0 .192-1.349 1.788 1.788 0 0 0-.86-1.093l-.329-.181a7.148 7.148 0 0 0 0-1.654l.329-.181a1.788 1.788 0 0 0 .86-1.093 1.723 1.723 0 0 0-.193-1.349l-1.284-2.133a1.834 1.834 0 0 0-2.438-.641l-.376.208a7.825 7.825 0 0 0-1.553-.867v-.349A1.789 1.789 0 0 0 33.289 23h-2.578a1.789 1.789 0 0 0-1.8 1.768v.349a7.847 7.847 0 0 0-1.553.867l-.376-.208a1.835 1.835 0 0 0-2.437.64l-1.29 2.134a1.727 1.727 0 0 0-.192 1.349 1.788 1.788 0 0 0 .86 1.093l.329.181a7.148 7.148 0 0 0 0 1.654l-.329.181a1.788 1.788 0 0 0-.864 1.092zM26.2 32a5.019 5.019 0 0 1 .054-.738 1.732 1.732 0 0 0-.9-1.764l-.251-.139 1.057-1.751.324.179a1.863 1.863 0 0 0 1.992-.144 5.809 5.809 0 0 1 1.283-.712 1.787 1.787 0 0 0 1.151-1.648V25h2.186v.283a1.787 1.787 0 0 0 1.151 1.648 5.8 5.8 0 0 1 1.284.713 1.858 1.858 0 0 0 1.991.143l.324-.179 1.054 1.751-.25.138a1.733 1.733 0 0 0-.9 1.768 5.087 5.087 0 0 1 .05.735 5.019 5.019 0 0 1-.054.738 1.732 1.732 0 0 0 .9 1.764l.251.139-1.057 1.751-.324-.179a1.865 1.865 0 0 0-1.992.144 5.809 5.809 0 0 1-1.283.712 1.787 1.787 0 0 0-1.151 1.648V39h-2.183v-.283a1.787 1.787 0 0 0-1.151-1.648 5.8 5.8 0 0 1-1.284-.713 1.864 1.864 0 0 0-1.991-.143l-.324.179-1.057-1.751.25-.138a1.733 1.733 0 0 0 .9-1.768A5.087 5.087 0 0 1 26.2 32z" opacity={1} data-original="#000000" className /><path d="M32 36a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0-6a2 2 0 1 1-2 2 2 2 0 0 1 2-2zM32 17a8 8 0 1 0-8-8 8.009 8.009 0 0 0 8 8zm0-14a6 6 0 1 1-6 6 6.006 6.006 0 0 1 6-6zM63 32a8 8 0 1 0-8 8 8.009 8.009 0 0 0 8-8zm-8 6a6 6 0 1 1 6-6 6.006 6.006 0 0 1-6 6zM9 40a8 8 0 1 0-8-8 8.009 8.009 0 0 0 8 8zm0-14a6 6 0 1 1-6 6 6.006 6.006 0 0 1 6-6zM40 55a8 8 0 1 0-8 8 8.009 8.009 0 0 0 8-8zm-14 0a6 6 0 1 1 6 6 6.006 6.006 0 0 1-6-6zM8 14a5.006 5.006 0 0 1 5-5h4l-1.6 1.2 1.2 1.6 4-3a1 1 0 0 0 0-1.6l-4-3-1.2 1.6L17 7h-4a7.008 7.008 0 0 0-7 7v7h2zM56 14v3l-1.2-1.6-1.6 1.2 3 4a1 1 0 0 0 1.6 0l3-4-1.6-1.2L58 17v-3a7.008 7.008 0 0 0-7-7h-8v2h8a5.006 5.006 0 0 1 5 5zM47.4 59.8l1.2-1.6L47 57h4a7.008 7.008 0 0 0 7-7v-7h-2v7a5.006 5.006 0 0 1-5 5h-4l1.6-1.2-1.2-1.6-4 3a1 1 0 0 0 0 1.6zM9.2 48.6l1.6-1.2-3-4a1.036 1.036 0 0 0-1.6 0l-3 4 1.6 1.2L6 47v3a7.008 7.008 0 0 0 7 7h8v-2h-8a5.006 5.006 0 0 1-5-5v-3z" opacity={1} data-original="#000000" className /><path d="M31 8h2v2h-2zM52 31h2v2h-2zM56 31h2v2h-2zM29 56h2v2h-2zM33 56h2v2h-2zM31 52h2v2h-2zM6 33h2v2H6zM10 33h2v2h-2zM6 29h2v2H6zM10 29h2v2h-2z" opacity={1} data-original="#000000" className /></g></svg>

                                    </span>  Workflows
                                </a>
                                <a
                                    onClick={(e) => handleClick(e, 'app')}
                                    className={`nav-link ${tab === 'app' ? 'active' : ''}`}
                                    id="v-pills-settings-tab"
                                    data-toggle="pill"
                                    href="#v-pills-settings"
                                    role="tab"
                                    aria-controls="v-pills-settings"
                                    aria-selected="false"
                                >
                                    <span className="tab-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" x={0} y={0} viewBox="0 0 100 100" style={{ enableBackground: 'new 0 0 512 512' }} xmlSpace="preserve" className><g><path d="M72.157 98.001c3.551 0 6.44-2.889 6.44-6.44V89.54h2.41c3.552 0 6.441-2.89 6.441-6.44V8.439c0-3.551-2.89-6.44-6.44-6.44h-53.17c-3.55 0-6.44 2.889-6.44 6.44v2.026H18.99c-3.55 0-6.44 2.889-6.44 6.44v74.657c0 3.55 2.89 6.44 6.44 6.44h53.166zM23.397 8.438a4.445 4.445 0 0 1 4.44-4.44h53.17a4.445 4.445 0 0 1 4.441 4.44v74.66a4.445 4.445 0 0 1-4.44 4.44h-2.41V16.906c0-3.551-2.89-6.44-6.44-6.44h-48.76zm-8.845 83.124V16.905a4.444 4.444 0 0 1 4.44-4.44h53.165a4.445 4.445 0 0 1 4.44 4.44v74.657a4.445 4.445 0 0 1-4.44 4.44H18.991a4.444 4.444 0 0 1-4.44-4.44z" opacity={1} data-original="#000000" /><path d="M21.828 54.226h12.429a1 1 0 0 0 .829-.44l1.998-2.963a14.72 14.72 0 0 0 7.826 2.257c8.178 0 14.83-6.653 14.83-14.83 0-4.744-2.24-9.149-5.987-11.935l2.123-3.149h11.896a1 1 0 1 0 0-2H55.344a1 1 0 0 0-.83.441l-2.446 3.63a14.814 14.814 0 0 0-7.158-1.828c-8.178 0-14.83 6.657-14.83 14.84 0 4.586 2.093 8.691 5.373 11.414l-1.728 2.563H21.828a1 1 0 1 0 0 2zm24.082-28.78c1.79.137 3.491.65 5.028 1.466L49.5 29.046a1 1 0 0 0 1.658 1.119l1.468-2.176a12.848 12.848 0 0 1 2.69 2.732l-9.405 5.746v-11.02zM32.08 38.25c0-6.744 5.22-12.29 11.83-12.803V38.25c0 .807.883 1.243 1.522.853l10.924-6.674a12.896 12.896 0 0 1 1.384 5.82c0 7.075-5.756 12.83-12.83 12.83-2.46 0-4.754-.708-6.709-1.914l1.902-2.82a1 1 0 0 0-1.659-1.117l-1.862 2.762c-2.75-2.355-4.502-5.844-4.502-9.74zM23.358 73.252h7.399a2.533 2.533 0 0 0 2.53-2.53v-5.255L35.4 64a1 1 0 1 0-1.14-1.643l-1.001.696a2.525 2.525 0 0 0-2.502-2.249h-7.399a2.533 2.533 0 0 0-2.53 2.53v7.39a2.533 2.533 0 0 0 2.53 2.53zm-.53-9.918c0-.293.238-.53.53-.53h7.399c.292 0 .53.237.53.53v1.088l-4.02 2.794-.619-.8a1 1 0 1 0-1.582 1.224l1.2 1.55a1 1 0 0 0 1.362.21l3.66-2.543v3.865c0 .293-.24.53-.531.53h-7.399a.531.531 0 0 1-.53-.53zM40.562 64.317a1 1 0 0 0 1 1H69.46a1 1 0 1 0 0-2H41.562a1 1 0 0 0-1 1zM41.562 70.738h16.787a1 1 0 1 0 0-2H41.562a1 1 0 1 0 0 2zM23.358 90.173h7.399a2.533 2.533 0 0 0 2.53-2.53v-5.69l2.113-1.469a1 1 0 1 0-1.14-1.642l-1.073.746a2.527 2.527 0 0 0-2.43-1.864h-7.399a2.533 2.533 0 0 0-2.53 2.53v7.39a2.533 2.533 0 0 0 2.53 2.53zm-.53-9.92c0-.292.238-.53.53-.53h7.399c.292 0 .53.238.53.53v.655l-4.02 2.794-.619-.8a1 1 0 1 0-1.582 1.224l1.2 1.55a1 1 0 0 0 1.362.21l3.66-2.543v4.3c0 .293-.24.53-.531.53h-7.399a.531.531 0 0 1-.53-.53zM69.46 80.238H41.562a1 1 0 1 0 0 2H69.46a1 1 0 1 0 0-2zM58.349 85.659H41.562a1 1 0 1 0 0 2h16.787a1 1 0 1 0 0-2z" opacity={1} data-original="#000000" /></g></svg>
                                    </span> Reports
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <div className="tab-content" id="v-pills-tabContent">
                            <div
                                className={`${tab === 'taskManager' ? 'show active' : ''
                                    } tab-pane fade`}
                                id="v-pills-home"
                                role="tabpanel"
                                aria-labelledby="v-pills-home-tab"
                            >
                                <div className="row align-items-center">
                                    <div className="col-lg-6">
                                        <div
                                            className="appie-features-thumb text-center"
                                        >
                                            <img src={taskManager} alt="" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div
                                            className="appie-features-content"
                                        >
                                            <span>Task Manager</span>
                                            <h3 className="title">
                                                Plan, Delegate and Complete Tasks
                                            </h3>
                                            <p>
                                                Get tasks done efficiently – stay organized and on top of everything.
                                            </p>
                                            <a className="main-btn" href="/register">
                                                Sign Up Now!
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`${tab === 'report' ? 'show active' : ''} tab-pane fade`}
                                id="v-pills-profile"
                                role="tabpanel"
                                aria-labelledby="v-pills-profile-tab"
                            >
                                <div className="row align-items-center">
                                    <div className="col-lg-6">
                                        <div
                                            className="appie-features-thumb text-center"
                                        >
                                            <img src={taskManager} alt="" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div
                                            className="appie-features-content"
                                        >
                                            <span>Checksheet</span>
                                            <h3 className="title">
                                                Stay Organized with Effective
                                            </h3>
                                            <p>
                                                Stay on track, never miss a task and ensure everything gets done.
                                            </p>
                                            <a className="main-btn" href="/register">
                                                Sign Up Now!
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`${tab === 'notice' ? 'show active' : ''} tab-pane fade`}
                                id="v-pills-messages"
                                role="tabpanel"
                                aria-labelledby="v-pills-messages-tab"
                            >
                                <div className="row align-items-center">
                                    <div className="col-lg-6">
                                        <div
                                            className="appie-features-thumb text-center"
                                        >
                                            <img src={taskManager} alt="" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div
                                            className="appie-features-content"
                                        >
                                            <span>Workflows</span>
                                            <h3 className="title">
                                                Build and scale workflows
                                            </h3>
                                            <p>
                                                Build scalable workflows by having one central place for planning & collaboration.
                                            </p>
                                            <a className="main-btn" href="/register">
                                                Sign Up Now!
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`${tab === 'app' ? 'show active' : ''} tab-pane fade`}
                                id="v-pills-settings"
                                role="tabpanel"
                                aria-labelledby="v-pills-settings-tab"
                            >
                                <div className="row align-items-center">
                                    <div className="col-lg-6">
                                        <div
                                            className="appie-features-thumb text-center"
                                        >
                                            <img src={taskManager} alt="" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div
                                            className="appie-features-content"
                                        >
                                            <span>Reports</span>
                                            <h3 className="title">
                                                Make the right data-driven decisions
                                            </h3>
                                            <p>
                                                Real-time insights into progress and workloads enable your teams to make smarter decisions faster.
                                            </p>
                                            <a className="main-btn" href="/register">
                                                Sign Up Now!
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="features-shape-1">
                <img src={shapeSix} alt="" />
            </div>
            <div className="features-shape-2">
                <img src={shapeSeven} alt="" />
            </div>
            <div className="features-shape-3">
                <img src={shapeEight} alt="" />
            </div>
        </section>
    );
}

export default FeaturesHomeOne;
