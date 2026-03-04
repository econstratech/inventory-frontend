import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function TaskTrackerEdit() {
    // Set reminder
    const [isCheckedReminder, setIsCheckedReminder] = useState(false);

    const handleSetReminder = (e) => {
        setIsCheckedReminder(e.target.checked);
    };

    //for datepicker
    const [issueDate, setIssueDate] = useState({
        startData: "",
        endDate: ""
        //depertment: ""
    })

    const selectReminderMode = [
        { value: 'select', label: '-Select-' },
        { value: 'Daily', label: 'Daily' },
        { value: 'Hourly', label: 'Hourly' }
    ]

    const selectAuditor = [
        { value: 'select', label: '-Select-' },
        { value: 'ArunavaaDBajpayi', label: 'Arunavaa D Bajpayi' },
        { value: 'SujitPaul', label: 'Sujit Paul' },
        { value: 'SandipKrPaul', label: 'Sandip Kr Paul' },
        { value: 'GopalMukharjee', label: 'Gopal Mukharjee' },
        { value: 'AbuSayed', label: 'Abu Sayed' },
        { value: 'GourangaGhosh', label: 'Gouranga Ghosh' },
        { value: 'MoumitaShome', label: 'Moumita Shome' }
    ]
    const selectTaskNotifyTo = [
        { value: 'select', label: '-Select-' },
        { value: 'ArunavaaDBajpayi', label: 'Arunavaa D Bajpayi' },
        { value: 'SujitPaul', label: 'Sujit Paul' },
        { value: 'SandipKrPaul', label: 'Sandip Kr Paul' },
        { value: 'GopalMukharjee', label: 'Gopal Mukharjee' },
        { value: 'AbuSayed', label: 'Abu Sayed' },
        { value: 'GourangaGhosh', label: 'Gouranga Ghosh' },
        { value: 'MoumitaShome', label: 'Moumita Shome' }
    ]
    const selectTaskPriority = [
        { value: 'select', label: '-Select-' },
        { value: 'VeryHigh', label: 'Very High' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
    ]

    const selectMode = [
        { value: 'select', label: '-Select-' },
        { value: 'Yearly', label: 'Yearly' },
        { value: 'Quarterly', label: 'Quarterly' },
        { value: 'Monthly', label: 'Monthly' },
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Daily', label: 'Daily' },
        { value: 'Hourly', label: 'Hourly' }
    ]

    const selectAssignedTo = [
        { value: 'select', label: '-Select-' },
        { value: 'ArunavaaDBajpayi', label: 'Arunavaa D Bajpayi' },
        { value: 'SujitPaul', label: 'Sujit Paul' },
        { value: 'SandipKrPaul', label: 'Sandip Kr Paul' },
        { value: 'GopalMukharjee', label: 'Gopal Mukharjee' },
        { value: 'AbuSayed', label: 'Abu Sayed' },
        { value: 'GourangaGhosh', label: 'Gouranga Ghosh' },
        { value: 'MoumitaShome', label: 'Moumita Shome' }
    ]
    const selectAssignedBy = [
        { value: 'select', label: '-Select-' },
        { value: 'ArunavaaDBajpayi', label: 'Arunavaa D Bajpayi' },
        { value: 'SujitPaul', label: 'Sujit Paul' },
        { value: 'SandipKrPaul', label: 'Sandip Kr Paul' },
        { value: 'GopalMukharjee', label: 'Gopal Mukharjee' },
        { value: 'AbuSayed', label: 'Abu Sayed' },
        { value: 'GourangaGhosh', label: 'Gouranga Ghosh' },
        { value: 'MoumitaShome', label: 'Moumita Shome' }
    ]
    return (
        <React.Fragment>
            <div className='mb-4'>
                <Link to="/checksheet" className='text-dark back-btn'><i class="bi bi-arrow-left-short me-1" />Back</Link>
            </div>
            <div className='card'>
                <div className='card-header'>
                    <h3 className="card-title">Add New Checksheet</h3>
                </div>
                <div className='card-body pb-1'>
                    <div className='row'>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Task Name</label>
                                <input type='text' className='form-control' placeholder='Enter Task Name' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Assigned By <span className='text-exp-red'>*</span></label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='selectAssignedBy'
                                        options={selectAssignedBy}
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
                                <label className='form-label'>Assigned To <span className='text-exp-red'>*</span></label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='selectAssignedTo'
                                        options={selectAssignedTo}
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
                                <label className='form-label'>Issue Date <span className='text-exp-red'>*</span></label>
                                <div className="exp-datepicker-cont">
                                    <span className="cal-icon"><i class="bi bi-calendar3" /></span>
                                    <DatePicker
                                        selected={issueDate.startData} onChange={(date) => setIssueDate({ ...issueDate, startData: date })}
                                        dateFormat="dd/MM/YYYY"
                                        placeholderText='Select Date'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Mode <span className='text-exp-red'>*</span></label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='selectMode'
                                        options={selectMode}
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
                                <label className='form-label'>Frequency <span className='text-exp-red'>*</span></label>
                                <input type='number' className='form-control' placeholder='Enter Task Name' />
                            </div>
                        </div>
                        <div className='col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Description</label>
                                <textarea className='form-control' placeholder='Enter Description' rows={3}></textarea>
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Task Priority <span className='text-exp-red'>*</span></label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='selectTaskPriority'
                                        options={selectTaskPriority}
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
                                <label className='form-label'>Notify To (if not done)</label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='selectTaskNotifyTo'
                                        options={selectTaskNotifyTo}
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
                                <label className='form-label'>Auditor</label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='selectAuditor'
                                        options={selectAuditor}
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
                        <div className='col-12'>
                            <div className='form-group'>
                                <label className="custom-switch" >
                                    <span className='switch-name'>Set Reminder</span>
                                    <input type="checkbox" onChange={handleSetReminder} />
                                    <div className="switch-slider switch-round" />
                                </label>
                            </div>
                        </div>
                        {isCheckedReminder && (
                            <div className='col-12 reminder-wrap'>
                                <div className='row'>
                                    <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                        <div className='form-group'>
                                            <label className='form-label'>Reminder Mode</label>
                                            <div className='custom-select-wrap'>
                                                <Select
                                                    name='selectReminderMode'
                                                    options={selectReminderMode}
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
                                            <label className='form-label'>Reminder Before Time </label>
                                            <input type='number' className='form-control' placeholder='Reminder Before Time' />
                                        </div>
                                    </div>
                                    <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                        <div className='form-group'>
                                            <label className='form-label'>Reminder Frequency</label>
                                            <input type='number' className='form-control' placeholder='Reminder Frequency' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-end">
                    <button type="reset" class="btn btn-exp-light me-2">Reset</button>
                    <button type="submit" class="btn btn-exp-green">Create</button>
                </div>
            </div>
        </React.Fragment>
    )
}

export default TaskTrackerEdit