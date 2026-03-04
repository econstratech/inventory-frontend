import React, { useState } from 'react';

const AttachLinks = () => {
    const [links, setLinks] = useState([]); // To store the list of links
    const [showAddLinks, setShowAddLinks] = useState(false); // To toggle the add_links_wrap visibility
    const [newLinks, setNewLinks] = useState(''); // To handle the new links input

    const handleAddLinksClick = () => {
        setShowAddLinks(true); // Show the add_links_wrap
    };

    const handleSaveLinks = () => {
        const newLinksArray = newLinks
            .split('\n') // Split textarea content into lines
            .filter((link) => link.trim() !== ''); // Remove empty lines
        setLinks([...links, ...newLinksArray]); // Add new links to the existing links
        setNewLinks(''); // Clear the textarea
        setShowAddLinks(false); // Hide the add_links_wrap
    };

    return (
        <>
            <div className="card shadow-none border mb-0">
                <div className="card-header gth-bg-blue-light">
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                        <h5 className="card-title f-s-16">Attach Links</h5>
                    </div>
                </div>
                <div className="card-body doc_body_height_155">
                    {/* Links Display Section */}
                    {links.length > 0 && (
                        <div className="links_wrap">
                            <ul>
                                {links.map((link, index) => (
                                    <li key={index}>
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Add Links Section */}
                    {showAddLinks ? (
                        <div className="add_links_wrap">
                            <textarea
                                className="form-control rounded-none"
                                rows={2}
                                placeholder="Press enter for more links to add"
                                value={newLinks}
                                onChange={(e) => setNewLinks(e.target.value)}
                            />
                            <button type="button" className="btn btn-success btn-sm mt-2" onClick={handleSaveLinks}>
                                Save
                            </button>
                        </div>
                    ) : (
                        <div className="nodata_button_wrap text-center">
                            <button className="btn btn-sm btn-light" onClick={handleAddLinksClick}>
                                <i className="fas fa-plus me-2"></i> Add Links
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AttachLinks;