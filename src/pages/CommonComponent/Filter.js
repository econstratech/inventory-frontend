import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'
import AutoCompleteDropdown from './AutoCompleteDropdown';
import Select from 'react-select';

const Filter = ({ show, handleClose }) => {


    const [selectedReference, setSelectedReference] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');

    const references = ['9905020', '3720231', '5574381', '3115619'];
    const vendors = ['Econstra', 'Sumit', 'Net Systems', 'abc'];

    const statusOptions = [
        { value: ' Final Approval Pending', label: ' Final Approval Pending' },
        { value: ' Active', label: ' Active' },
        { value: ' Request for Quotation', label: 'Request for Quotation' },
        { value: ' Send to Management', label: 'Send to Management' },
        { value: ' Sales Order', label: 'Sales Order' },
        { value: ' Rejected form Admin', label: 'Rejected form Admin' },
        { value: '  Fully Billed', label: ' Fully Billed' },
        { value: '  Done', label: ' Done' },
        { value: '  Nothing to Bill', label: ' Nothing to Bill' },
        { value: '  Item Received Done', label: ' Item Received Done' },

    ]

    // const [show, setShow] = useState(false);

    // const handleClose = () => setShow(false);
    // const handleShow = () => setShow(true);

    return (
        <>


            <Offcanvas show={show} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filter</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <form>
                        <div className='form-group'>
                            <label className='form-label'>Reference</label>
                            <AutoCompleteDropdown
                                suggestions={references}
                                onChange={(value) => setSelectedReference(value)}
                                className="form-control"
                            />
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>Vendors</label>
                            <AutoCompleteDropdown
                                suggestions={vendors}
                                onChange={(value) => setSelectedVendor(value)}
                            />
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>Status</label>
                            <div className='custom-select-wrap'>
                                <Select
                                    name='Departmant'
                                    options={statusOptions}
                                    className='input_control'
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            //primary25: '#ddddff',
                                            //primary: '#6161ff',
                                        },
                                    })}
                                />
                            </div>
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>Stage</label>
                            <div className='custom-select-wrap'>
                                <Select
                                    name='processStage'                                    
                                    className='input_control'                                    
                                />
                            </div>
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>Company</label>
                            <div className='custom-select-wrap'>
                                <Select
                                    name='company'                                    
                                    className='input_control'                                    
                                />
                            </div>
                        </div>
                        <div className=' mt-3'>
                            <button type='submit' className='btn btn-success ms-auto d-block'>Search Filter</button>
                        </div>

                    </form>


                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default Filter