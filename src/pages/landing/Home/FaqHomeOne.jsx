import React, { useState } from 'react';

function FaqHomeOne({ className }) {
    const [showQues, setQues] = useState(1);
    const openQuestion = (value) => {
        setQues(value);
    };
    return (
        <>
            <section className={`appie-faq-area pb-110 ${className || ''}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="appie-section-title text-center">
                                <h3 className="appie-title">Frequently Asked Questions</h3>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <div
                                className="faq-accordion  mt-30"
                            >
                                <div
                                    className="accrodion-grp animated fadeIn faq-accrodion"
                                    data-grp-name="faq-accrodion"
                                >
                                    <div
                                        onClick={() => openQuestion(1)}
                                        className={`accrodion ${showQues === 1 ? 'active' : ''}`}
                                    >
                                        <div className="accrodion-inner">
                                            <div className="accrodion-title">
                                                <h4>Can I try task management in Growthh.in for free?</h4>
                                            </div>
                                            <div
                                                className="accrodion-content"
                                                style={{
                                                    display: showQues === 1 ? 'block' : 'none',
                                                }}
                                            >
                                                <div className="inner">
                                                    <p>
                                                    Experience Growthh.in for free for 30 days, no credit card needed. Begin your journey with a complimentary Business trial, then simply follow the on-screen prompts to access your account!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => openQuestion(2)}
                                        className={`accrodion ${showQues === 2 ? 'active' : ''}`}
                                    >
                                        <div className="accrodion-inner">
                                            <div className="accrodion-title">
                                                <h4>What is task management?</h4>
                                            </div>
                                            <div
                                                className="accrodion-content"
                                                style={{
                                                    display: showQues === 2 ? 'block' : 'none',
                                                }}
                                            >
                                                <div className="inner">
                                                    <p>
                                                    Task management goes beyond simple lists. It involves tracking tasks from start to finish, assigning subtasks, and setting deadlines for timely project completion. Task management tools, such as Growthh.in, enhance team productivity and efficiency.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => openQuestion(5)}
                                        className={`accrodion ${showQues === 5 ? 'active' : ''}`}
                                    >
                                        <div className="accrodion-inner">
                                            <div className="accrodion-title">
                                                <h4>Can I track performance in Growthh.in</h4>
                                            </div>
                                            <div
                                                className="accrodion-content"
                                                style={{
                                                    display: showQues === 5 ? 'block' : 'none',
                                                }}
                                            >
                                                <div className="inner">
                                                    <p>
                                                    Yes, Growthh.in provides comprehensive performance tracking capabilities. With our built-in analytics tools, you can monitor task completion rates, team productivity, and more in real-time. This allows you to assess performance, identify bottlenecks, and make data-driven decisions to optimize workflow efficiency and achieve business goals effectively.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div
                                className="faq-accordion fadeInRight mt-30"
                            >
                                <div
                                    className="accrodion-grp animated fadeIn faq-accrodion"
                                    data-grp-name="faq-accrodion"
                                >
                                    <div
                                        onClick={() => openQuestion(3)}
                                        className={`accrodion ${showQues === 3 ? 'active' : ''}`}
                                    >
                                        <div className="accrodion-inner">
                                            <div className="accrodion-title">
                                                <h4>What is workflow management?</h4>
                                            </div>
                                            <div
                                                className="accrodion-content"
                                                style={{
                                                    display: showQues === 3 ? 'block' : 'none',
                                                }}
                                            >
                                                <div className="inner">
                                                    <p>
                                                    Workflow management refers to the coordination and automation of tasks, activities, and processes within an organization to ensure efficient and effective completion of work. It involves defining, designing, and optimizing workflows to streamline operations and enhance productivity.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => openQuestion(4)}
                                        className={`accrodion ${showQues === 4 ? 'active' : ''}`}
                                    >
                                        <div className="accrodion-inner">
                                            <div className="accrodion-title">
                                                <h4>How can workflow management benefit my business?</h4>
                                            </div>
                                            <div
                                                className="accrodion-content"
                                                style={{
                                                    display: showQues === 4 ? 'block' : 'none',
                                                }}
                                            >
                                                <div className="inner">
                                                    <p>
                                                        Workflow management can benefit your business in several ways:<br/>
                                                        <br/>
                                                        <strong>Increased efficiency</strong>: By automating repetitive tasks and standardizing processes, workflow management reduces manual effort and eliminates errors.<br/>
                                                        
                                                        <strong>Improved productivity</strong>: Clear workflows and automated notifications keep tasks on track, allowing teams to focus on value-added activities.<br/>
                                                        
                                                        <strong>Enhanced collaboration</strong>: Workflow management systems facilitate communication and collaboration among team members, leading to better coordination and faster decision-making.<br/>
                                                        
                                                        <strong>Better visibility and control</strong>: With workflow management, you can track the progress of tasks in real-time, identify bottlenecks, and make informed decisions to optimize workflows and resource allocation.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div
                                        onClick={() => openQuestion(6)}
                                        className={`accrodion ${showQues === 6 ? 'active' : ''}`}
                                    >
                                        <div className="accrodion-inner">
                                            <div className="accrodion-title">
                                                <h4>Is Growthh.in suitable for my business?</h4>
                                            </div>
                                            <div
                                                className="accrodion-content"
                                                style={{
                                                    display: showQues === 6 ? 'block' : 'none',
                                                }}
                                            >
                                                <div className="inner">
                                                    <p>
                                                    Absolutely! Growthh.in is designed to be versatile and adaptable, making it suitable for businesses of all sizes and industries. Whether you're a small startup or a large enterprise, whether you're in manufacturing, healthcare, retail, or any other sector, Growthh.in can be customized to meet your specific needs. With its flexible features and scalable solutions, Growthh.in empowers businesses to streamline their workflows, enhance collaboration, and drive growth across diverse organizational contexts.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-12">
                            <div className="faq-text text-center pt-40">
                                <p>
                                    Can't find an answer?{' '}
                                    <a href="mailto:support@growthh.in">Email us</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default FaqHomeOne;
