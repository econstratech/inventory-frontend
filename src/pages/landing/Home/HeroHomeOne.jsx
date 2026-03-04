import React from 'react';
import ReactPlayer from 'react-player'
import heroThumbOne from '../../../landingAssets/images/hero-thumb-1.png';
import heroThumbTwo from '../../../landingAssets/images/hero-thumb-2.png';
import shapeTwo from '../../../landingAssets/images/shape/shape-2.png';
import shapeThree from '../../../landingAssets/images/shape/shape-3.png';
import shapeFour from '../../../landingAssets/images/shape/shape-4.png';
import heroVideo from '../../../landingAssets/images/hero-video3.mp4';
import heroPoster from '../../../landingAssets/images/hero-video.gif';
import { Link } from 'react-router-dom';

function HeroHomeOne({ className, modalShow }) {
    return (
        <>
            <section className={`appie-hero-area position-relative ${className || ''}`}>

                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="appie-hero-content">
                                <span>Welcome to Growthh</span>
                                <h1 className="appie-title">
                                    Automate Business Operations
                                </h1>
                                <p>
                                    Run Your Business Working 2 Only Days, Automate Tasks, Create Seamless Workflows, Enhance Efficiency by 80%.
                                </p>
                                <ul>
                                    <li>
                                        <a role="button" onClick={modalShow} aria-expanded="false">
                                            <i className="bi bi-calendar3"></i> Book a Demo
                                        </a>
                                    </li>
                                    <li>
                                        <a role="button" className="item-2" onClick={modalShow} aria-expanded="false">
                                            Get 15 Day Trial
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="appie-hero-thumb">
                                <div className="hero-video">
                                    <ReactPlayer url={heroVideo}
                                        controls={false}
                                        playing={true}
                                        loop={true}
                                        playsinline={true}
                                        muted={true}
                                        previewTabIndex={0}
                                        width="100%"
                                        height="auto"
                                        pip={false}
                                        stopOnUnmount={false}
                                        className="hero-video-wrap"
                                    />
                                    {/* <video autoplay="autoplay" loop="true" muted playsinline webkit-playsinline x5-playsinline disablePictureInPicture poster={heroPoster} className="c5-vdo">
                                        <source src={heroVideo} type="video/mp4" />
                                    </video>
                                    <div className="vdoc5-gif">
                                        <img src={heroPoster} alt="" className="img-fluid" />
                                    </div> */}

                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-shape-1">
                    <img src={shapeTwo} alt="" />
                </div>
                <div className="hero-shape-2">
                    <img src={shapeThree} alt="" />
                </div>
                <div className="hero-shape-3">
                    <img src={shapeFour} alt="" />
                </div>
            </section>
        </>
    );
}

export default HeroHomeOne;
