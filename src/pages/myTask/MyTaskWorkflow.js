import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DataTable, { createTheme } from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { Dropdown, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Handsontable from 'handsontable/base';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';


registerAllModules();

function MyTaskWorkflow() {

    //for-data table
    const [value, setValue] = useState(true)
    const [grid, setGrid] = useState(false);
    const [doerShow, setDoerShow] = useState(false);
    const [detailsShow, setDetailsShow] = useState(false);
    const [deleteShow, setDeleteShow] = useState(false);
    const [descriptionShow, setDescriptionShow] = useState(false);

    //switch deor modal 
    const doerModalClose = () => setDoerShow(false);
    const doerModalShow = () => setDoerShow(true);
    //details modal
    const detailsModalClose = () => setDetailsShow(false);
    const detailsModalShow = () => setDetailsShow(true);
    //delete modal
    const deleteModalClose = () => setDeleteShow(false);
    const deleteModalShow = () => setDeleteShow(true);
    //description modal
    const descriptionModalClose = () => setDescriptionShow(false);
    const descriptionModalShow = () => setDescriptionShow(true);


    const customStyles = {
        header: {
            style: {
                minHeight: '56px',
            },
        },
        headRow: {
            style: {
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor: '#d0d4e4',
                backgroundColor: '#fffcda'
            },
        },
        headCells: {
            style: {
                '&:not(:last-of-type)': {
                    borderRightStyle: 'solid',
                    borderRightWidth: '1px',
                    borderRightColor: '#d0d4e4',
                },
            },
        },
        cells: {
            style: {
                '&:not(:last-of-type)': {
                    borderRightStyle: 'solid',
                    borderRightWidth: '1px',
                    borderRightColor: '#d0d4e4',
                },
            },
        },
    };

    const [tableData, setTableData] = useState([
        {
            process: "Employee Onboarding",
            step: "Candidate Screening & Sorting",
            
            plannedDate: "2024-04-12 19:00:00",
            completedDate: "-",
            dailyHours: "233",
            status: "Active",
        },
        {
            process: "Employee Onboarding",
            step: "Candidate Screening & Sorting",
            
            plannedDate: "2024-04-12 19:00:00",
            completedDate: "-",
            dailyHours: "233",
            status: "Inactive",
        },
        {           
            process: "Employee Onboarding",
            step: "Candidate Screening & Sorting",
           
            plannedDate: "2024-04-12 19:00:00",
            completedDate: "-",
            dailyHours: "233",
            status: "Skipped",
        },
        {            
            process: "Employee Onboarding",
            step: "Candidate Screening & Sorting",
            
            plannedDate: "2024-04-12 19:00:00",
            completedDate: "-",
            dailyHours: "233",
            status: "Completed",
        },
    ]);

    // const columns = [
    //     {
    //         name: 'Sl No.',
    //         cell: (row, index) => index + 1,
    //         minWidth: "80px",
    //         maxWidth: "80px"
    //     },
    //     {
    //         name: "Process",
    //         selector: (row) => row.process,
    //         sortable: true,
    //         reorder: true
    //     },
    //     {
    //         name: "Step",
    //         selector: (row) => row.step,
    //         sortable: true,
    //     },
    //     {
    //         name: "Description",
    //         selector: (row) => row.description,
    //         sortable: true,
    //     },
    //     {
    //         name: "Planned Date",
    //         selector: (row) => row.plannedDate,
    //         sortable: true,
    //     },
    //     {
    //         name: "Completed Date",
    //         selector: (row) => row.completedDate,
    //         sortable: true,
    //     },
    //     {
    //         name: "Daily (Hours)",
    //         selector: (row) => row.dailyHours,
    //         sortable: true,
    //     },
    //     {
    //         name: "Status",
    //         selector: (row) => row.status,
    //         sortable: true,
    //         conditionalCellStyles: [
    //             {
    //                 when: row => row.status === 'Active',
    //                 style: {
    //                     backgroundColor: '#6161ff',
    //                     color: 'white',
    //                     fontWeight: 'bold',
    //                     textAlign: 'center',
    //                     display: 'flex',
    //                     justifyContent: 'center',
    //                 },
    //             },
    //             {
    //                 when: row => row.status === 'Inactive',
    //                 style: {
    //                     backgroundColor: '#6c757d',
    //                     color: 'white',
    //                     fontWeight: 'bold',
    //                     textAlign: 'center',
    //                     display: 'flex',
    //                     justifyContent: 'center',
    //                 },
    //             },
    //             {
    //                 when: row => row.status === 'Skipped',
    //                 style: {
    //                     backgroundColor: '#fdab3d',
    //                     color: 'white',
    //                     fontWeight: 'bold',
    //                     textAlign: 'center',
    //                     display: 'flex',
    //                     justifyContent: 'center',
    //                 },
    //             },
    //             {
    //                 when: row => row.status === 'Completed',
    //                 style: {
    //                     backgroundColor: '#00c875',
    //                     color: 'white',
    //                     fontWeight: 'bold',
    //                     display: 'flex',
    //                     justifyContent: 'center',
    //                 },

    //             },
    //         ],
    //     },
    //     {
    //         name: "Action",
    //         headerStyle: { textAlign: "center" },
    //         minWidth: "210px",
    //         cell: (row) => (
    //             <div className="d-flex">
    //                 <OverlayTrigger
    //                     placement="top"
    //                     overlay={
    //                         <Tooltip>
    //                             Submit FMS Task
    //                         </Tooltip>
    //                     }
    //                 >
    //                     <Link to="#" className="me-1 icon-btn">
    //                         <img src={process.env.PUBLIC_URL + 'assets/images/disk.svg'} alt="icon" />
    //                     </Link>
    //                 </OverlayTrigger>
    //                 <OverlayTrigger
    //                     placement="top"
    //                     overlay={
    //                         <Tooltip>
    //                             No Action Require
    //                         </Tooltip>
    //                     }
    //                 >
    //                     <button disabled className="me-1 icon-btn btn-exp-red-light disabled">
    //                         <img src={process.env.PUBLIC_URL + 'assets/images/ban.svg'} alt="icon" />
    //                     </button>
    //                 </OverlayTrigger>
    //                 <OverlayTrigger
    //                     placement="top"
    //                     overlay={
    //                         <Tooltip>
    //                             Switch Doer for this task
    //                         </Tooltip>
    //                     }
    //                 >
    //                     <button className="me-1 icon-btn">
    //                         <img src={process.env.PUBLIC_URL + 'assets/images/change.svg'} alt="icon" />
    //                     </button>
    //                 </OverlayTrigger>
    //                 <OverlayTrigger
    //                     placement="top"
    //                     overlay={
    //                         <Tooltip>
    //                             Details of this FMS task
    //                         </Tooltip>
    //                     }
    //                 >
    //                     <button className="me-1 icon-btn">
    //                         <img src={process.env.PUBLIC_URL + 'assets/images/info.svg'} alt="icon" />
    //                     </button>
    //                 </OverlayTrigger>
    //                 <OverlayTrigger
    //                     placement="top"
    //                     overlay={
    //                         <Tooltip>
    //                             Delete
    //                         </Tooltip>
    //                     }
    //                 >
    //                     <button className="me-1 icon-btn">
    //                         <i className="fas fa-trash-alt"></i>
    //                     </button>
    //                 </OverlayTrigger>
    //             </div>
    //         ),
    //     },
    // ];
    const [selectedColumns, setSelectedColumns] = useState([
        {
            name: 'Sl No.',
            cell: (row, index) => index + 1,
            minWidth: "80px",
            maxWidth: "80px"
        },
        {
            name: "Process",
            selector: (row) => row.process,
            sortable: true,
            reorder: true
        },
        {
            name: "Step",
            selector: (row) => row.step,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.description,
            sortable: true,
            minWidth: "250px",
            cell: (row) => (
                <div className="table-description">
                    <span className='text-part'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</span>
                    <button type='button' className='table-read-more' onClick={descriptionModalShow}>Read more..</button>
                </div>
            ),
        },
        {
            name: "Planned Date",
            selector: (row) => row.plannedDate,
            sortable: true,
        },
        {
            name: "Completed Date",
            selector: (row) => row.completedDate,
            sortable: true,
        },
        {
            name: "Daily (Hours)",
            selector: (row) => row.dailyHours,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            conditionalCellStyles: [
                {
                    when: row => row.status === 'Active',
                    style: {
                        backgroundColor: '#6161ff',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    },
                },
                {
                    when: row => row.status === 'Inactive',
                    style: {
                        backgroundColor: '#6c757d',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    },
                },
                {
                    when: row => row.status === 'Skipped',
                    style: {
                        backgroundColor: '#fdab3d',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    },
                },
                {
                    when: row => row.status === 'Completed',
                    style: {
                        backgroundColor: '#00c875',
                        color: 'white',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'center',
                    },

                },
            ],
        },
        {
            name: "Action",
            headerStyle: { textAlign: "center" },
            minWidth: "210px",
            cell: (row) => (
                <div className="d-flex">
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Submit FMS Task
                            </Tooltip>
                        }
                    >
                        <Link to="/my-workflow-task-details" className="me-1 icon-btn">
                            <img src={process.env.PUBLIC_URL + 'assets/images/disk.svg'} alt="icon" />
                        </Link>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                No Action Require
                            </Tooltip>
                        }
                    >
                        <button type='button' disabled className="me-1 icon-btn btn-exp-red-light disabled">
                            <img src={process.env.PUBLIC_URL + 'assets/images/ban.svg'} alt="icon" />
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Switch Doer for this task
                            </Tooltip>
                        }
                    >
                        <button type='button' className="me-1 icon-btn" onClick={doerModalShow}>
                            <img src={process.env.PUBLIC_URL + 'assets/images/change.svg'} alt="icon" />
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Details of this FMS task
                            </Tooltip>
                        }
                    >
                        <button type='button' className="me-1 icon-btn" onClick={detailsModalShow}>
                            <img src={process.env.PUBLIC_URL + 'assets/images/info.svg'} alt="icon" />
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Delete
                            </Tooltip>
                        }
                    >
                        <button type='button' className="me-1 icon-btn" onClick={deleteModalShow}>
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </OverlayTrigger>
                </div>
            ),
        },
    ]);

    const handleColumnToggle = (column) => {
        const currentIndex = selectedColumns.findIndex(col => col.name === column.name);
        if (currentIndex === -1) {
            setSelectedColumns([...selectedColumns, column]);
        } else {
            const newColumns = [...selectedColumns];
            newColumns.splice(currentIndex, 1);
            setSelectedColumns(newColumns);
        }
    };

    const CustomColumnToggle = () => (
        <div className='dropdown-menu'>
            <div>
                {selectedColumns.map((column, index) => (
                    <div key={index} className="form-check form-switch me-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={column.name}
                            checked={selectedColumns.findIndex(col => col.name === column.name) !== -1}
                            onChange={() => handleColumnToggle(column)}
                        />
                        <label className="form-check-label" htmlFor={column.name}>
                            {column.name}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
    //for grid columns 
    const gridColumns = [

        {
            title: 'Process',
            type: 'text',
            data: 'process',
        },
        {
            title: 'Step',
            type: 'numeric',
            data: 'step',

        },
        {
            title: 'Description',
            type: 'text',
            data: 'description',

        },
        {
            title: 'Planned Date',
            type: 'date',
            data: 'plannedDate',
            //correctFormat: true,
            //className: 'htRight',
        },
        {
            title: 'Completed Date',
            type: 'date',
            data: 'completedDate',
            //correctFormat: true,
            //className: 'htRight',
        },
        {
            title: 'Daily (Hours)',
            type: 'text',
            data: 'dailyHours',

        },
        {
            title: 'Status',
            type: 'text',
            data: 'status',
        }
    ]
    //for datepicker
    const [task, setTask] = useState({
        startData: "",
        endDate: ""
        //depertment: ""
    })
    const selectFms = [
        { value: 'select', label: '-Select-' },
        { value: 'orderToDelivery', label: 'Order to Delivery' },
        { value: 'employeeOnboarding', label: 'Employee Onboarding' },
        { value: 'box', label: 'Box' },
        { value: 'newWorkFlow', label: 'New Work Flow' },
        { value: 'purchase', label: 'Purchase' }
    ]
    const selectTask = [
        { value: 'select', label: '-Select-' },
        { value: 'CheckInventoryIsItAvailable?', label: 'Check Inventory, Is It Available?' },
        { value: 'PurchaseRawMterial', label: 'Purchase Raw Material' },
        { value: 'ReceiveStoreRawMaterial', label: 'Receive & Store Raw Material' },
        { value: 'Production', label: 'Production' },
        { value: 'Transport', label: 'Transport' }
    ]
    const selectStatus = [
        { value: 'select', label: '-Select-' },
        { value: 'Inactive?', label: 'Inactive' },
        { value: 'Active', label: 'Active' },
        { value: 'Skipped', label: 'Skipped' },
        { value: 'Completed', label: 'Completed' }
    ]
    const selectDoer = [
        { value: 'select', label: '-Select-' },
        { value: 'SujitPaul', label: 'Sujit Paul' },
        { value: 'SandeepKrPaul', label: 'SandeepKrPaul' },
        { value: 'MoumeetaShome', label: 'Moumeeta Shome' },
        { value: 'AbuSayed', label: 'Abu Sayed' }
    ]
    const tableView = () => {
        setGrid(false)
    }
    const gridView = () => {
        setGrid(true);
    }
    return (
        <React.Fragment>
            <div className='row'>
                <div className='col-md-12 col-sm-12 mb-3 d-flex justify-content-end'>
                    <button
                        class="btn btn-exp-primary"
                        data-bs-toggle="collapse"
                        href="#contentId"
                        aria-expanded="false"
                        aria-controls="contentId"
                    >
                        <i class="bi bi-search me-2"></i>Search
                    </button>
                </div>
                <div className='col-12'>
                    <div class="collapse" id="contentId">
                        <div className='card'>
                            <div className='card-header'>
                                <h5 className='card-title font-weight-medium'>
                                    Search Tasks
                                </h5>
                            </div>
                            <div className='card-body pb-1'>
                                <div className='row'>
                                    <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                        <div className='form-group'>
                                            <label className='form-label'>Select FMS</label>
                                            <div className='custom-select-wrap'>
                                                <Select
                                                    name='selectFms'
                                                    options={selectFms}
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
                                            <label className='form-label'>Select Task</label>
                                            <div className='custom-select-wrap'>
                                                <Select
                                                    name='selectTask'
                                                    options={selectTask}
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
                                            <label className='form-label'>Select Status</label>
                                            <div className='custom-select-wrap'>
                                                <Select
                                                    name='selectStatus'
                                                    options={selectStatus}
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
                                            <label className='form-label'>Start Date</label>
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
                                            <label className='form-label'>End Date</label>
                                            <div className="exp-datepicker-cont">
                                                <span className="cal-icon"><i class="bi bi-calendar3" /></span>
                                                <DatePicker
                                                    selected={task.endData} onChange={(date) => setTask({ ...task, endData: date })}
                                                    dateFormat="dd/MM/YYYY"
                                                    placeholderText='Select Date'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer d-flex justify-content-end">
                                <button type="reset" class="btn btn-exp-light me-2">Reset</button>
                                <button type="submit" class="btn btn-exp-green">Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card'>
                <div className='card-header d-flex flex-wrap justify-content-between align-items-center'>
                    <h3 className="card-title">Workflow Task Details</h3>
                    <div className="d-flex ms-auto">
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip >
                                    Table View
                                </Tooltip>
                            }
                        >
                            <button type='button' className={`icon-btn me-2 ${!grid ? 'icon-btn-active' : ''}`} onClick={tableView} >
                                <i className="bi bi-table" />
                            </button>
                        </OverlayTrigger>
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip >
                                    Grid View
                                </Tooltip>
                            }
                        >
                            <button type='button' className={`icon-btn ${grid ? 'icon-btn-active' : ''}`} onClick={gridView}>
                                <i className="bi bi-grid-3x3" />
                            </button>
                        </OverlayTrigger>

                    </div>
                </div>
                <div className='card-body'>
                    {/* no data found */}
                    <div className="w-100">
                        <div className="card bg-warning-light mb-0">
                            <div className="card-body">
                                <div className="exp-no-data-found text-exp-red">
                                    <img className="task-img mb-3" src={process.env.PUBLIC_URL + 'assets/images/search-no-record-found.webp'} alt="No task" />
                                    <h6>No Record Found</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* no data found end */}

                    {
                        !grid ?
                            <div className="table-view" >
                                <div className='d-flex justify-content-between'>
                                    <div className='table-button-group mb-3'>
                                        <button type='button' className='btn table-export-btn'>
                                            <img src={process.env.PUBLIC_URL + 'assets/images/copy.svg'} alt="icon" />
                                        </button>
                                        <button type='button' className='btn table-export-btn'>
                                            <i className="fas fa-file-alt"></i>
                                        </button>
                                        <button type='button' className='btn table-export-btn'>
                                            <img src={process.env.PUBLIC_URL + 'assets/images/file-excel.svg'} alt="icon" />
                                        </button>
                                        <button type='button' className='btn table-export-btn'>
                                            <i className="fas fa-file-pdf"></i>
                                        </button>
                                        <button type='button' className='btn table-export-btn'>
                                            <i className="fas fa-print"></i>
                                        </button>
                                        <Dropdown>
                                            <Dropdown.Toggle id="dropdown-basic" className='btn table-export-btn right-border-radious'>
                                                <img src={process.env.PUBLIC_URL + 'assets/images/info.svg'} alt="icon" />
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Sl No.
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Process
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Step
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Description
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Planned Date
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Completed Date
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Daily (Hours)
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Status
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Action
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                    </div>
                                    <div className='d-flex align-items-center'>
                                        <label className='mr-2 mb-0'>Search: </label>
                                        <input type='text' placeholder='Type here...' className='form-control form-control-sm' />
                                    </div>
                                </div>
                                <DataTable
                                    //fixedHeader
                                    //highlightOnHover                        
                                    //theme="solarized"
                                    //striped
                                    // defaultSortAsc
                                    // persistTableHead
                                    // selectableRowsHighlight


                                    columns={selectedColumns}
                                    data={tableData}
                                    pagination={[5, 10, 25, 50]}
                                    theme="solarized"
                                    striped
                                    className='custom-table-wrap workflow-table-striped'
                                    customStyles={customStyles}
                                    //subHeader
                                    //subHeaderComponent={<CustomColumnToggle />}
                                />
                            </div> :
                            <div className="grid-view" >

                                <HotTable
                                    data={tableData}
                                    columns={gridColumns}
                                    filters={true}
                                    dropdownMenu={["filter_by_condition", "filter_operators", "---------", "filter_by_value", "filter_action_bar"]}
                                    width="100%"
                                    height="auto"
                                    colHeaders={true}
                                    rowHeaders={true}
                                    hiddenColumns={true}
                                    //colWidths={[200, 200, 200, 200, 200, 120, 100]}
                                    manualColumnResize={true}
                                    manualColumnMove={true}
                                    manualRowMove={true}
                                    autoWrapRow={true}
                                    autoWrapCol={true}
                                    contextMenu={true}
                                    multiColumnSorting={true}
                                    licenseKey="non-commercial-and-evaluation"
                                />
                            </div>

                    }
                </div>
            </div>
            {/* Switch Doer modal start */}
            <Modal
                show={doerShow}
                onHide={doerModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Switch Doer</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-12'>
                            <div className='form-group'>
                                <label className="form-label">Select Doer</label>
                                <div className='custom-select-wrap'>
                                    <Select
                                        name='selectDoer'
                                        options={selectDoer}
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
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="remarks" className="form-label">Remarks</label>
                                <textarea className="form-control" name="remarks" rows={3} defaultValue={""} />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type='submit' className='btn btn-exp-primary'>
                        Confirm
                    </button>
                </Modal.Footer>
            </Modal>
            {/* Switch Doer modal end */}
            {/* Details modal start */}
            <Modal
                show={detailsShow}
                onHide={detailsModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>FMS Task Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-12'>
                            <div className="task-details-wrap">
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">PO Number</span>: 100/100
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">Party Name</span>: dSdsad
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">Delivery  Address</span>: dasdasd
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">Client Mail</span>: dasd@gmail.com
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">Contact No</span>: 9876543210
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">Transport required</span>: Yes
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">Product Description</span>: sadasd
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">Additional</span>: ["Packaging"]
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">ETD</span>: 2024-04-30
                                </p>
                                <p className="task-details-wrap-item">
                                    <span className="task-details-wrap-name">Quotation</span>:
                                    <Link to="#" className="ms-2 btn btn-secondary btn-sm" target="_blank">
                                        <i className="bi bi-download me-1" />Download
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            {/* Details modal end */}
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
                    <button type='reset' className='btn btn-secondary' onClick={deleteModalClose}>
                        Cancel
                    </button>
                    <button type='submit' className='btn btn-exp-red'>
                        Delete
                    </button>
                </Modal.Footer>
            </Modal>
            {/* Delete modal end */}
            {/* Description modal start */}
            <Modal
                show={descriptionShow}
                onHide={descriptionModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Description</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className='col-12'>
                            <p className='mb-0 text-muted'>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </p>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            {/* Description modal end */}

        </React.Fragment >
    )
}

export default MyTaskWorkflow


