import React, { useEffect, useState } from 'react';
import useToggle from '../Hooks/useToggle.js';
import BackToTop from '../BackToTop.jsx';
import Drawer from '../Mobile/Drawer.jsx';
import BlogHomeOne from './BlogHomeOne.jsx';
import FaqHomeOne from './FaqHomeOne.jsx';
import FeaturesHomeOne from './FeaturesHomeOne.jsx';
import FooterHomeOne from './FooterHomeOne.jsx';
import HeroHomeOne from './HeroHomeOne.jsx';
import HomeOneHeader from './HomeOneHeader.jsx';
import PricingHomeOne from './PricingHomeOne.jsx';
import ProjectHomeOne from './ProjectHomeOne.jsx';
import ServicesHomeOne from './ServicesHomeOne.jsx';
import TeamHomeOne from './TeamHomeOne.jsx';
import TestimonialHomeOne from './TestimonialHomeOne.jsx';
import TrafficHomeOne from './TrafficHomeOne.jsx';
import AboutUs from './AboutUs.jsx';
import { useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';



function Index() {
    const [drawer, drawerAction] = useToggle(false);
    
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => {
        setShow(true)
    };
    return (
        <>
            <Drawer drawer={drawer} action={drawerAction.toggle} />
            <HomeOneHeader action={drawerAction.toggle} modalShow={handleShow}/>
            <HeroHomeOne modalShow={handleShow} />
            <AboutUs />
            <ServicesHomeOne />
            <FeaturesHomeOne />
            <TrafficHomeOne />
            <TestimonialHomeOne />
            {/* <TeamHomeOne /> */}
            <PricingHomeOne />
            <FaqHomeOne />
            {/* <BlogHomeOne /> */}
            <ProjectHomeOne />
            <FooterHomeOne />
            <BackToTop />
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Index;
