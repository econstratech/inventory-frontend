import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function NewWorkflowTask() {
    //for datepicker
    const [task, setTask] = useState({
        startData: "",
        endDate: ""
        //depertment: ""
    })

    const partyType = [
        { value: 'select', label: '-Select-' },
        { value: 'new', label: 'New' },
        { value: 'regular', label: 'Regular' }
    ]

    const assignDoer = [
        { value: 'select', label: '-Select-' },
        { value: 'SujitPaul', label: 'SujitPaul' },
        { value: 'SandipKrPaul', label: 'Sandip Kr Paul' }
    ]

    return (
        <React.Fragment>
            <div className='mb-4'>
                <Link to="/workflow" className='text-dark back-btn'><i class="bi bi-arrow-left-short me-1" />Back</Link>
            </div>
            <div className='card'>
                <div className='card-header'>
                    <h3 className="card-title">Initiate Form</h3>
                </div>
                <div className='card-body pb-1'>
                    <div className='row'>
                        <div className="col-12 mb-3">
                            <h5 className="text-exp-blue">EconStra O2D Process</h5>
                        </div>

                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>PO Number</label>
                                <input type='text' className='form-control' placeholder='PO Number' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Party Name</label>
                                <input type='text' className='form-control' placeholder='Party Name' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Demo Name</label>
                                <input type='text' className='form-control' placeholder='Demo Name' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Field Number 1</label>
                                <input type='text' className='form-control' placeholder='Field Number 1' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Delivery Address</label>
                                <input type='text' className='form-control' placeholder='Delivery Address' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Client Mail</label>
                                <input type='text' className='form-control' placeholder='Client Mail' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Contact No</label>
                                <input type='text' className='form-control' placeholder='Contact No' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Transport required</label>
                                <div className='d-flex flex-wrap'>
                                    <label className="custom-radio me-4">Yes
                                        <input type="radio" name="radio" />
                                        <span className="checkmark" />
                                    </label>
                                    <label className="custom-radio">No
                                        <input type="radio" name="radio" />
                                        <span className="checkmark" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Product Description</label>
                                <input type='text' className='form-control' placeholder='Product Description' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Party Type</label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='partyType'
                                        options={partyType}
                                        theme={(theme) => ({
                                            ...theme,
                                            colors: {
                                                ...theme.colors,
                                                primary25: '#ddddff',
                                                primary: '#6161ff',
                                            },
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Additional</label>
                                <div className='d-flex flex-wrap'>
                                    <label className="custom-checkbox me-4">
                                        Insureance
                                        <input type="checkbox" />
                                        <span className="checkmark" />
                                    </label>
                                    <label className="custom-checkbox me-4">
                                        Packaging
                                        <input type="checkbox" />
                                        <span className="checkmark" />
                                    </label>
                                    <label className="custom-checkbox">
                                        Tools
                                        <input type="checkbox" />
                                        <span className="checkmark" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Advance</label>
                                <input type='text' className='form-control' placeholder='Advance' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Quotation</label>
                                <input type='file' className='form-control' placeholder='file' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>ETD</label>
                                <div className="exp-datepicker-cont">
                                    <span className="cal-icon"><i class="bi bi-calendar3" /></span>
                                    <DatePicker
                                        selected={task.startData} onChange={(date) => setTask({ ...task, startData: date })}
                                        dateFormat="dd/MM/YYYY"
                                        placeholderText='Select Date'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Assign doer to Check Inventory, Is It Available? step</label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='assignDoer'
                                        options={assignDoer}
                                        theme={(theme) => ({
                                            ...theme,
                                            colors: {
                                                ...theme.colors,
                                                primary25: '#ddddff',
                                                primary: '#6161ff',
                                            },
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-end">
                    <button type="submit" class="btn btn-exp-green">Submit</button>
                </div>
            </div>
        </React.Fragment>
    )
}

export default NewWorkflowTask