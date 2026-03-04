import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

const ExploreAllFeaturesModal = ({ show, handleClose }) => {
    const [activeVideo, setActiveVideo] = useState("https://www.youtube.com/embed/x_PhPlVL2mY");

    // List of videos
    const videos = [
        { id: 1, url: "https://www.youtube.com/embed/x_PhPlVL2mY", title: "Video 1", duration: "1:1 min" },
        { id: 2, url: "https://www.youtube.com/embed/tyt4JL0olNc", title: "Video 2", duration: "1:10 min" },
        { id: 3, url: "https://www.youtube.com/embed/6ejiLN29qMc", title: "Video 3", duration: "4:15 min" },
        { id: 4, url: "https://www.youtube.com/embed/m1LS3J5i4fM", title: "Video 4", duration: "13:00 min" },
    ];

    const handleVideoClick = (url) => {
        setActiveVideo(url);
    };

    const extractVideoId = (url) => {
        const match = url.match(/embed\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    };

    return (
        <Modal
            id="ExploreAllFeaturesModal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
            size="xl"
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-modal-title">Explore All Features</Modal.Title>
            </Modal.Header>
            <Modal.Body className="moday-body-overflow-none">
                <div className="row">
                    {/* Main Video Section */}
                    <div className="col-lg-8">
                        <div className="d-flex gap-3 align-items-center mb-3">
                            <h4 className="fs-5 mb-0 fw-medium">Inventory</h4>
                            <button className="btn btn-outline-success btn-sm" onClick={handleClose}>
                                <i className="fas fa-external-link-alt me-1"></i> Open
                            </button>
                        </div>
                        <div className="feature_video_wrap mb-2">
                            <iframe
                                width="100%"
                                height="100%"
                                src={activeVideo}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <h6>{videos.find((video) => video.url === activeVideo)?.title}</h6>
                    </div>

                    {/* Playlist Section */}
                    <div className="col-lg-4">
                        <h4 className="fs-5 mb-2 fw-medium">Feature Playlist</h4>
                        <div className="feature_video_list_wrap">
                            {videos.map((video) => {
                                const videoId = extractVideoId(video.url);
                                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                return (
                                    <div
                                        key={video.id}
                                        className="feature_video_list_item"
                                        onClick={() => handleVideoClick(video.url)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="small-video_wrap">
                                            <img src={thumbnailUrl} alt={video.title} className="img-fluid" />
                                        </div>
                                        <div className="video_name_wrap">
                                            <h6>{video.title}</h6>
                                            <p className="text-primary fw-medium mb-0">{video.duration}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ExploreAllFeaturesModal;
