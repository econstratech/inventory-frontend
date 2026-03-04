import React from 'react';
import { Modal } from 'react-bootstrap';

const TallyIntegrationModal = ({
    show,
    handleClose,
    faqItems // Array of FAQ items
}) => {
    return (
        <Modal
            id="TallyIntegrationExtensionModal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-modal-title">
                    Tally Integration Extension
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h6 className="fw-bold">How to download & access the Extension</h6>
                <div className="intregation_video_wrap mb-3">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/sUyfhOVhCvc?si=eAonrdishEOPXxcm"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>
                <h6 className="fw-bold">FAQ</h6>
                <div className="accordion" id="accordionExample">
                    {faqItems.map((item, index) => (
                        <div className="accordion-item" key={index}>
                            <h2 className="accordion-header">
                                <button
                                    className={`accordion-button ${index === 0 ? '' : 'collapsed'}`}
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse${index}`}
                                    aria-expanded={index === 0 ? 'true' : 'false'}
                                    aria-controls={`collapse${index}`}
                                >
                                    {index + 1}. {item.question}
                                </button>
                            </h2>
                            <div
                                id={`collapse${index}`}
                                className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                data-bs-parent="#accordionExample"
                            >
                                <div className="accordion-body">{item.answer}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer className="gth-blue-light-bg">
                <button className="btn btn-exp-green" onClick={handleClose}>
                    Go to Extension
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default TallyIntegrationModal;
