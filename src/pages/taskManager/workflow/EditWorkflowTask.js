import React, { useEffect, useState } from 'react'
import { Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import $ from "jquery";


function EditWorkflowTask() {
    useEffect(() => {

    }, [])

    //Step according to value
    const [isConditionalStep1, setIsConditionalStep1] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const handleConditionalStep = (e) => {
        if(e.target.checked){
            setIsConditionalStep1(e.target.checked);
        }else{
            setIsConditionalStep1(false)
            setSelectedOption('')
        }
       
    };

    const handleRadioChange = (e) => {
        setSelectedOption(e.target.value);
    };


    //add more custom field
    const [showMoreOptions, setShowMoreOptions] = useState(true);
    const [divList, setDivList] = useState([]);
    const handleButtonClick = () => {
        const newDiv = (
            <div className='d-flex mb-3' key={divList.length}>
                <input type='text' className='form-control' placeholder='' />
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Delete</Tooltip>}
                >
                    <button className="ms-1 btn btn-exp-red-outline px-2 py-1" onClick={() => handleRemoveButtonClick(divList.length)}>
                        <i className="bi bi-x-circle-fill"></i>
                    </button>
                </OverlayTrigger>
            </div>
        );
        setDivList([...divList, newDiv]);
    };
    const handleRemoveButtonClick = (indexToRemove) => {
        const updatedDivList = divList.filter((_, index) => index !== indexToRemove);
        setDivList(updatedDivList);
    };


    //form input type selection
    const [inputType, setInputType] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        setInputType(selectedValue);
        setShowOptions(selectedValue === 'checkbox' || selectedValue === 'radio' || selectedValue === 'select');
    };


    //delete Modal
    const [deleteShow, setDeleteShow] = useState(false);
    const deleteModalClose = () => setDeleteShow(false);
    const deleteModalShow = () => setDeleteShow(true);
    //Form modal 
    const [generateFormShow, setGenerateFormModalShow] = useState(false);
    const generateFormModalClose = () => setGenerateFormModalShow(false);
    const generateFormModalShow = () => setGenerateFormModalShow(true);

    //for workflow icon show
    const [workflowIcon, setWorkflowIcon] = useState(null);
    const handleWorkflowIcon = (event) => {
        const file = event.target.files[0];
        setWorkflowIcon(file);
    };

    //for condition step check initial step
    const [isConditionalStep, setConditionalStep] = useState(false);
    const handleCheckboxChange = () => {
        setConditionalStep(!isConditionalStep);
    };

    const onReject = [
        { value: 'select', label: '-Select-' },
        { value: 'CheckInventoryIsItAvailable', label: 'Check Inventory, Is It Available?' },
        { value: 'PurchaseRawMaterial', label: 'Purchase Raw Material' },
        { value: 'ReceiveStoreRawMaterial', label: 'Receive & Store Raw Material' },
        { value: 'Production', label: 'Production' },
        { value: 'Transport', label: 'Transport' },
        { value: 'Sample', label: 'Sample' }
    ]
    const onAccept = [
        { value: 'select', label: '-Select-' },
        { value: 'CheckInventoryIsItAvailable', label: 'Check Inventory, Is It Available?' },
        { value: 'PurchaseRawMaterial', label: 'Purchase Raw Material' },
        { value: 'ReceiveStoreRawMaterial', label: 'Receive & Store Raw Material' },
        { value: 'Production', label: 'Production' },
        { value: 'Transport', label: 'Transport' },
        { value: 'Sample', label: 'Sample' }
    ]
    const selectAssignOn = [
        { value: 'select', label: '-Select-' },
        { value: 'InitialStep', label: 'Initial Step' },
        { value: 'CheckInventoryIsItAvailable?', label: 'Check Inventory, Is It Available?' }
    ]
    const selectSelectionType = [
        { value: 'select', label: '-Select-' },
        { value: 'random', label: 'Random' },
        { value: 'manual', label: 'Manual' }
    ]
    const selectMultipleDoers = [
        { value: 'select', label: '-Select-' },
        { value: 'ArunavaaDBajpayi', label: 'Arunavaa D Bajpayi' },
        { value: 'SujitPaul', label: 'Sujit Paul' },
        { value: 'SandipKrPaul', label: 'Sandip Kr Paul' },
        { value: 'GopalMukharjee', label: 'Gopal Mukharjee' },
        { value: 'AbuSayed', label: 'Abu Sayed' },
        { value: 'GourangaGhosh', label: 'Gouranga Ghosh' },
        { value: 'MoumitaShome', label: 'Moumita Shome' }
    ]
    const selectSignleDoers = [
        { value: 'select', label: '-Select-' },
        { value: 'ArunavaaDBajpayi', label: 'Arunavaa D Bajpayi' },
        { value: 'SujitPaul', label: 'Sujit Paul' },
        { value: 'SandipKrPaul', label: 'Sandip Kr Paul' },
        { value: 'GopalMukharjee', label: 'Gopal Mukharjee' },
        { value: 'AbuSayed', label: 'Abu Sayed' },
        { value: 'GourangaGhosh', label: 'Gouranga Ghosh' },
        { value: 'MoumitaShome', label: 'Moumita Shome' }
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
    const estimatedDate = [
        { value: 'select', label: '-Select-' },
        { value: 'interviewDate', label: 'Interview Date' },
        { value: 'dob', label: 'DOB' }
    ]
    const field = [
        { value: 'select', label: '-Select-' },
        { value: 'candidateName', label: 'Candidate Name' },
        { value: 'interviewDate', label: 'Interview Date' },
        { value: 'secondInterview', label: 'Second Interview' },
        { value: 'futureRequired', label: 'Future Required' },
        { value: 'finalStatus', label: 'Final Status' },
        { value: 'demoName', label: 'Demo Name' },
        { value: 'contactNo', label: 'Contact No' },
        { value: 'remarks', label: 'Remarks' },
        { value: 'time', label: 'Time' },
        { value: 'interviewDate2', label: 'Interview Date2' },
        { value: 'email', label: 'Email' },
        { value: 'time2', label: 'Time 2' },
        { value: 'positionApplied', label: 'Position Applied' },
        { value: 'DOB', label: 'DOB' },
        { value: 'highestQualification', label: 'Highest Qualification' },
        { value: 'experience', label: 'Experience' },
        { value: 'totalExperience', label: 'Total Experience' },
        { value: 'relocate', label: 'Relocate' },
        { value: 'identityDoc', label: 'Identity_Doc' },
        { value: 'CV', label: 'CV' }
    ]
    const jumpTo = [
        { value: 'select', label: '-Select-' },
        { value: 'candidateScreeningSorting', label: 'Candidate Screening & Sorting' },
        { value: 'followUpForInterviewFixedDate', label: 'Follow Up For Interview & Fixed Date' },
        { value: 'interview', label: 'Interview' },
        { value: 'secondRoundInterview', label: 'Second Round Interview' },
        { value: 'holdForFutureRequirement?', label: 'Hold For Future Requirement?' },
        { value: 'finalSelectionStatus', label: 'Final Selection Status' },
    ]



    return (
        <React.Fragment>
            <div className='mb-4'>
                <Link to="/workflow" className='text-dark back-btn'><i class="bi bi-arrow-left-short me-1" />Back</Link>
            </div>

            <div className='card'>
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center">
                    <h4 className="card-title">Initial Step</h4>
                    <div className="ms-auto">
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip>
                                    Edit Workflow Step
                                </Tooltip>
                            }
                        >
                            <button className="ms-2 icon-btn" type="button" data-bs-toggle="collapse" data-bs-target="#step_1" aria-expanded="false" aria-controls="step_1">
                                <i className="fas fa-pen"></i>
                            </button>
                        </OverlayTrigger>
                    </div>

                </div>
                <div className="collapse" id="step_1">
                    <div className="card-body">
                        <div className='row'>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Name</label>
                                    <input type='text' className='form-control' placeholder='Enter Name' disabled />
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
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Estimated Date</label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name='estimatedDate'
                                            options={estimatedDate}
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
                            <div className='col-12'>
                                <div className='form-group'>
                                    <label className="custom-checkbox">
                                        Conditional Step
                                        <input type="checkbox" checked={isConditionalStep} onChange={handleCheckboxChange} />
                                        <span className="checkmark" />
                                    </label>
                                </div>
                            </div>
                            {isConditionalStep && (
                                <div className='col-12'>
                                    <div className='row'>
                                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                            <div className='form-group'>
                                                <label className='form-label'>Field</label>
                                                <div className='custom-select-wrap'>
                                                    <Select
                                                        name='field'
                                                        options={field}
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
                                                <label className='form-label'>Field Value</label>
                                                <input type='text' className='form-control' placeholder='Field Value' />
                                            </div>
                                        </div>
                                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                            <div className='form-group'>
                                                <label className='form-label'>Jump To</label>
                                                <div className='custom-select-wrap'>
                                                    <Select
                                                        name='jumpTo'
                                                        options={jumpTo}
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
                            )}

                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Workflow Icon</label>
                                    <input
                                        type='file'
                                        className='form-control'
                                        placeholder='Workflow Icon'
                                        onChange={handleWorkflowIcon}
                                    />
                                    {workflowIcon ? (
                                        <div className='uploaded-img'>
                                            <img
                                                src={URL.createObjectURL(workflowIcon)}
                                                alt="icon"
                                                className="img-fluid"
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label d-block w-100'>&nbsp;</label>
                                    <label className="custom-checkbox">
                                        Display in Desk
                                        <input type="checkbox" />
                                        <span className="checkmark" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="pt-2 d-flex justify-content-between">
                            <button type="reset" class="btn btn-exp-primary" onClick={generateFormModalShow}>
                                <i class="bi bi-file-earmark-medical me-2"></i>Form
                            </button>
                            <button type="submit" class="btn btn-exp-green">
                                <i class="bi bi-floppy me-2"></i>Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card'>
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center">
                    <h4 className="card-title">Check Inventory, Is It Available?</h4>
                    <div className="ms-auto">
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip>
                                    Edit Workflow Step
                                </Tooltip>
                            }
                        >
                            <button className="ms-2 icon-btn" type="button" data-bs-toggle="collapse" data-bs-target="#step_2" aria-expanded="false" aria-controls="step_2">
                                <i className="fas fa-pen"></i>
                            </button>
                        </OverlayTrigger>
                    </div>

                </div>
                <div className="collapse" id="step_2">
                    <div className="card-body">
                        <div className='row'>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Name</label>
                                    <input type='text' className='form-control' placeholder='Enter Name' disabled />
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
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className="custom-radio mb-0">Single Doer
                                        <input type="radio" name="radio" />
                                        <span className="checkmark" />
                                    </label>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className="custom-radio mb-0">Multiple Doer
                                        <input type="radio" name="radio" />
                                        <span className="checkmark" />
                                    </label>
                                </div>
                            </div>
                            <div className='col-12'>
                                <div className='row'>
                                    <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                        <div className='form-group'>
                                            <label className='form-label'>Doers</label>
                                            <div className='custom-select-wrap'>
                                                <Select
                                                    name='selectSignleDoers'
                                                    options={selectSignleDoers}
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
                            <div className='col-12'>
                                <div className='row'>
                                    <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                        <div className='form-group'>
                                            <label className='form-label'>Doers</label>
                                            <div className='custom-select-wrap'>
                                                <Select
                                                    name='selectMultipleDoers'
                                                    options={selectMultipleDoers}
                                                    isMulti
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
                                            <label className='form-label'>Selection Type</label>
                                            <div className='custom-select-wrap'>
                                                <Select
                                                    name='selectSelectionType'
                                                    options={selectSelectionType}
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
                                            <label className='form-label'>Assign On</label>
                                            <div className='custom-select-wrap'>
                                                <Select
                                                    name='selectAssignOn'
                                                    options={selectAssignOn}
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
                            <div className='col-12'>
                                <div className='row'>
                                    <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                        <div className='form-group'>
                                            <label className="custom-checkbox">
                                                Conditional Step
                                                <input type="checkbox" checked={isConditionalStep1} onChange={handleConditionalStep} />
                                                <span className="checkmark" />
                                            </label>
                                        </div>
                                    </div>
                                    {isConditionalStep1 && (
                                        <>
                                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                                <div className='form-group'>
                                                    <label className="custom-checkbox">
                                                        According to Value
                                                        <input type="checkbox" name='conditionStepCheck' value="value" checked={selectedOption === "value"} onChange={handleRadioChange} />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                                <div className='form-group'>
                                                    <label className="custom-checkbox">
                                                        According to Action
                                                        <input type="checkbox" name='conditionStepCheck' value="action" checked={selectedOption === "action"} onChange={handleRadioChange} />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {selectedOption === 'value' && (
                                <div className='col-12 accordingToValue'>
                                    <div className='row'>
                                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                            <div className='form-group'>
                                                <label className='form-label'>Field</label>
                                                <div className='custom-select-wrap'>
                                                    <Select
                                                        name='field'
                                                        options={field}
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
                                                <label className='form-label'>Field Value</label>
                                                <input type='text' className='form-control' placeholder='Field Value' />
                                            </div>
                                        </div>
                                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                            <div className='form-group'>
                                                <label className='form-label'>Jump To</label>
                                                <div className='custom-select-wrap'>
                                                    <Select
                                                        name='jumpTo'
                                                        options={jumpTo}
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
                            )}

                            {selectedOption === 'action' && (
                                <div className='col-12 accordingToAction'>
                                    <div className='row'>
                                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                            <div className='form-group'>
                                                <label className='form-label'>On Accept</label>
                                                <div className='custom-select-wrap'>
                                                    <Select
                                                        name='onAccept'
                                                        options={onAccept}
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
                                                <label className='form-label'>On Reject</label>
                                                <div className='custom-select-wrap'>
                                                    <Select
                                                        name='onReject'
                                                        options={onReject}
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
                            )}

                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Workflow Icon</label>
                                    <input
                                        type='file'
                                        className='form-control'
                                        placeholder='Workflow Icon'
                                        onChange={handleWorkflowIcon}
                                    />
                                    {workflowIcon ? (
                                        <div className='uploaded-img'>
                                            <img
                                                src={URL.createObjectURL(workflowIcon)}
                                                alt="icon"
                                                className="img-fluid"
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label d-block w-100'>&nbsp;</label>
                                    <label className="custom-checkbox">
                                        Display in Desk
                                        <input type="checkbox" />
                                        <span className="checkmark" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="pt-2 d-flex justify-content-between">
                            <button type="reset" class="btn btn-exp-primary" onClick={generateFormModalShow}>
                                <i class="bi bi-file-earmark-medical me-2"></i>Form
                            </button>
                            <button type="submit" class="btn btn-exp-green">
                                <i class="bi bi-floppy me-2"></i>Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Generate Form modal start */}
            <Modal
                show={generateFormShow}
                onHide={generateFormModalClose}
                backdrop="static"
                keyboard={false}
                centered
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Switch Doer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className='col-lg-3 col-md-12'>
                            <div className='form-group'>
                                <label className="form-label">Select Input Type</label>
                                <Form.Select onChange={handleSelectChange}>
                                    <option>-Select-</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="date">Date</option>
                                    <option value="email">Email</option>
                                    <option value="file">File</option>
                                    <option value="number">Number</option>
                                    <option value="radio">Radio</option>
                                    <option value="select">Select</option>
                                    <option value="tel">Telphone</option>
                                    <option value="text">Text</option>
                                </Form.Select>
                            </div>
                            <div className='form-group'>
                                <input type='text' className='form-control' placeholder='Input name...' />
                            </div>
                            <div className='form-group'>
                                <input type='text' className='form-control' placeholder='Input label...' />
                            </div>
                            {showOptions && (
                                <div className='form-group mb-0'>
                                    <label className="form-label">Options</label>
                                    <div className='d-flex mb-3'>
                                        <input type='text' className='form-control' placeholder='' />
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip>Add</Tooltip>}
                                        >
                                            <button className="ms-1 btn btn-exp-green-outline px-2 py-1" onClick={handleButtonClick}>
                                                <i className="bi bi-plus-circle-fill"></i>
                                            </button>
                                        </OverlayTrigger>
                                    </div>
                                    {divList.map((div, index) => (
                                        <div key={index}>
                                            {div}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className='form-group'>
                                <label className="custom-checkbox mb-0">
                                    Display in Grid
                                    <input type="checkbox" />
                                    <span className="checkmark" />
                                </label>
                            </div>
                            <div className='form-group'>
                                <label className="custom-checkbox mb-0">
                                    Is Required
                                    <input type="checkbox" />
                                    <span className="checkmark" />
                                </label>
                            </div>
                            <div className='form-group'>
                                <label className="custom-checkbox mb-0">
                                    Display In Task
                                    <input type="checkbox" />
                                    <span className="checkmark" />
                                </label>
                            </div>
                            <div className='form-group'>
                                <input
                                    type="number"
                                    class="form-control no-spin"
                                    name="sequence"
                                    placeholder="Order sequence..."
                                    onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
                                />
                            </div>
                            <div className=''>
                                <button className='btn btn-exp-primary w-100'>
                                    Add Input Element
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-9 col-md-12">
                            <div className="table-responsive">
                                <table className='table table-bordered mb-0 table-striped'>
                                    <thead>
                                        <tr>
                                            <th>
                                                Label
                                            </th>
                                            <th>
                                                Field Name
                                            </th>
                                            <th>
                                                Field Type
                                            </th>
                                            <th>
                                                Input Options
                                            </th>
                                            <th>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                PO Number
                                            </td>
                                            <td>
                                                PO_No
                                            </td>
                                            <td>
                                                text
                                            </td>
                                            <td>
                                                &nbsp;
                                            </td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>
                                                            Delete
                                                        </Tooltip>
                                                    }
                                                >
                                                    <button className="me-1 icon-btn" onClick={deleteModalShow}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Party Name
                                            </td>
                                            <td>
                                                Party_Name
                                            </td>
                                            <td>
                                                text
                                            </td>
                                            <td>
                                                &nbsp;
                                            </td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>
                                                            Delete
                                                        </Tooltip>
                                                    }
                                                >
                                                    <button className="me-1 icon-btn" onClick={deleteModalShow}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Transport required
                                            </td>
                                            <td>
                                                Transport
                                            </td>
                                            <td>
                                                radio
                                            </td>
                                            <td>
                                                <span>Yes | No</span>
                                            </td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>
                                                            Delete
                                                        </Tooltip>
                                                    }
                                                >
                                                    <button className="me-1 icon-btn" onClick={deleteModalShow}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Party Type
                                            </td>
                                            <td>
                                                Party_Type
                                            </td>
                                            <td>
                                                select
                                            </td>
                                            <td>
                                                <span>New | Regular</span>
                                            </td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>
                                                            Delete
                                                        </Tooltip>
                                                    }
                                                >
                                                    <button className="me-1 icon-btn" onClick={deleteModalShow}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Additional
                                            </td>
                                            <td>
                                                Additional
                                            </td>
                                            <td>
                                                checkbox
                                            </td>
                                            <td>
                                                <span>Insureance | Packaging | Tools</span>
                                            </td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>
                                                            Delete
                                                        </Tooltip>
                                                    }
                                                >
                                                    <button className="me-1 icon-btn" onClick={deleteModalShow}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-secondary' onClick={generateFormModalClose}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
            {/* Generate Form modal end */}
            {/* Delete modal start */}
            <Modal
                show={deleteShow}
                onHide={deleteModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="delete-confirm-wrap text-center">
                        <div className="delete-confirm-icon mb-3 mt-2">
                            <img src={process.env.PUBLIC_URL + 'assets/images/delete-warning.svg'} alt="Warning" className="img-fluid" />
                        </div>
                        <h4 className="text-muted">Are you sure?</h4>
                        <p className="text-muted">
                            Do you really want to delete these record? This process cannot be undone.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer className='justify-content-center'>
                    <button className='btn btn-secondary' onClick={deleteModalClose}>
                        Cancel
                    </button>
                    <button className='btn btn-exp-red'>
                        Delete
                    </button>
                </Modal.Footer>
            </Modal>
            {/* Delete modal end */}


        </React.Fragment>
    )
}

export default EditWorkflowTask
