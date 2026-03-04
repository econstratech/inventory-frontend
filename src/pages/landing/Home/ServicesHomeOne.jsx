import React from "react";
import IconOne from "../../../landingAssets/images/task-manager.svg";
import IconTwo from "../../../landingAssets/images/checksheet.svg";
import IconThree from "../../../landingAssets/images/workflow.svg";
import IconFour from "../../../landingAssets/images/reports.svg";
import FourteenDays from "../../../landingAssets/images/14-days.svg";
import FreeImplementation from "../../../landingAssets/images/free-implementation.svg";
import FreeChatSupport from "../../../landingAssets/images/free-chat-support.svg";
import { Link } from "react-router-dom";

function ServicesHomeOne({ className }) {
    return (
        <section className={`appie-service-area pt-90 pb-100 ${className}`} id="service">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="appie-features-content text-center">
                            <span>Our Solutions</span>
                            <h2 className="title">
                                Designed to provide you the best results
                            </h2>
                            <p>Get tasks done faster than ever, build and scale workflows, make data-driven decisions and achieve your goals.</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-3 col-md-6">
                        <div
                            className="appie-single-service text-center mt-30"
                        >
                            <div className="icon">
                                <img src={IconOne} alt="" />                                
                                <span>1</span>
                            </div>
                            <h4 className="appie-title">Task Manager</h4>
                            <p>Maintain a clear focus <br/>on priorities</p>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div
                            className="appie-single-service text-center mt-30 item-2"
                        >
                            <div className="icon">
                                <img src={IconTwo} alt="" />
                                <span>2</span>
                            </div>
                            <h4 className="appie-title">Checksheet</h4>
                            <p>Never miss a <br/>deadline</p>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div
                            className="appie-single-service text-center mt-30 item-3"
                        >
                            <div className="icon">
                                <img src={IconThree} alt="" />
                                <span>3</span>
                            </div>
                            <h4 className="appie-title">Workflows</h4>
                            <p>Scale, Collaborate, <br/>Manage</p>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div
                            className="appie-single-service text-center mt-30 item-4"
                        >
                            <div className="icon">
                                <img src={IconFour} alt="" />
                                <span>4</span>
                            </div>
                            <h4 className="appie-title">Reports</h4>
                            <p>Address bottlenecks, risks,<br/> and challenges</p>
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="appie-features-content text-center mt-50 mb-30">
                            <span>Support</span>
                            <h2 className="title">
                                Implementation & After Sales Support 
                            </h2>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                        <div className="text-center support-wrap">
                            <img src={FourteenDays} alt="" className="support-icon"/>
                            <h5 className="support-title">Go Live in <br/>14 Days!</h5>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                        <div className="text-center support-wrap">
                            <img src={FreeImplementation} alt="" className="support-icon"/>
                            <h5 className="support-title">Free Implementation <br/>& Training</h5>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                        <div className="text-center support-wrap">
                            <img src={FreeChatSupport} alt="" className="support-icon"/>
                            <h5 className="support-title">Free Chat Support<br/>within 10 seconds</h5>
                        </div>
                    </div>
                    <div className="col-12 text-center mt-40">
                        <a className="main-btn" href="/register">Get Started For Free</a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ServicesHomeOne;
