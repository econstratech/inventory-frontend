import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'


function NewWorkflowTemplate() {
    const selectObserver = [
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
                <Link to="/workflow" className='text-dark back-btn'><i class="bi bi-arrow-left-short me-1" />Back</Link>
            </div>           
            <div className='card'>
                <div className='card-header'>
                    <h3 className="card-title">Add New Workflow</h3>
                </div>
                <div className='card-body pb-1'>
                    <div className='row'>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Name</label>
                                <input type='text' className='form-control' placeholder='Enter Name' />
                            </div>
                        </div>
                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                            <div className='form-group'>
                                <label className='form-label'>Observer</label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='selectObserver'
                                        options={selectObserver}
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
                                <label className='form-label'>Description</label>
                                <textarea className='form-control' placeholder='Enter Description' rows={3}></textarea>
                            </div>
                        </div>
                        <div className='col-12'>
                            <div className='form-group'>
                                <label className='form-label'>SOP Video Link</label>
                                <input type='text' className='form-control' placeholder='Enter SOP Video Link' />
                            </div>
                        </div>
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

export default NewWorkflowTemplate