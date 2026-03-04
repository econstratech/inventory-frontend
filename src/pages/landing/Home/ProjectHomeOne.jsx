import React from 'react';
import projectThumb from '../../../landingAssets/images/newsletter3.webp';

function ProjectHomeOne({ className }) {
    return (
        <>
            <section className={`appie-project-area pb-70 news-letter ${className || ''}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div
                                className="appie-project-box"
                            >
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="appie-project-content">
                                            <h3 className="title">
                                                Start automating your business
                                            </h3>
                                            <p>Keep in the loop, subscribe for the newsletter.</p>
                                            <form action="#">
                                                <div className="input-box mt-30">
                                                    <input type="text" placeholder="Your Email" />
                                                    <button type="button">Subscribe</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="appie-project-thumb">
                                    <img src={projectThumb} alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default ProjectHomeOne;
