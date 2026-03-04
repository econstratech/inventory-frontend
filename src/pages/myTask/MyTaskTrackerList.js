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

function MyTaskTrackerList() {

    //for-data table
    const [value, setValue] = useState(true)
    const [grid, setGrid] = useState(false);
    const [doerShow, setDoerShow] = useState(false);
    const [stopShow, setStopModalShow] = useState(false);
    const [highAlertShow, setHighAlertShow] = useState(false);
    const [descriptionShow, setDescriptionShow] = useState(false);
    const [taskDoneShow, setTaskDoneShow] = useState(false);

    //switch deor modal 
    const doerModalClose = () => setDoerShow(false);
    const doerModalShow = () => setDoerShow(true);
    //details modal
    const stopModalClose = () => setStopModalShow(false);
    const stopModalShow = () => setStopModalShow(true);
    //delete modal
    const highAlertModalClose = () => setHighAlertShow(false);
    const highAlertModalShow = () => setHighAlertShow(true);
    //description modal
    const descriptionModalClose = () => setDescriptionShow(false);
    const descriptionModalShow = () => setDescriptionShow(true);
    //Task Done modal
    const taskDoneModalClose = () => setTaskDoneShow(false);
    const taskDoneModalShow = () => setTaskDoneShow(true);


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
                backgroundColor: '#f3e5fb'
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
            taskName: "Task name test",
            assignedBy: "Sujit Paul",
            priority: "Very High",
            plannedDate: "2024-04-12 11:00:00",
            completedDate: "2024-04-12 11:00:00",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
            remarks: "-",
            status: "Open",
        },
        {
            taskName: "Task name test",
            assignedBy: "Sujit Paul",
            priority: "High",
            plannedDate: "2024-04-12 11:00:00",
            completedDate: "2024-04-12 11:00:00",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
            remarks: "-",
            status: "Closed",
        },
        {
            taskName: "Task name test",
            assignedBy: "Sujit Paul",
            priority: "Medium",
            plannedDate: "2024-04-12 11:00:00",
            completedDate: "2024-04-12 11:00:00",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
            remarks: "-",
            status: "Not Done",
        },
        {
            taskName: "Task name test",
            assignedBy: "Sujit Paul",
            priority: "Low",
            plannedDate: "2024-04-12 11:00:00",
            completedDate: "2024-04-12 11:00:00",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
            remarks: "-",
            status: "Done",
        }
    ]);


    const [selectedColumns, setSelectedColumns] = useState([
        {
            name: 'Sl No.',
            cell: (row, index) => index + 1,
            minWidth: "75px",
            maxWidth: "75px"
        },
        {
            name: "Task Name",
            selector: (row) => row.taskName,
            sortable: true,
            reorder: true,
            minWidth: "180px",
        },
        {
            name: "Assigned By",
            selector: (row) => row.assignedBy,
            sortable: true,
            minWidth: "180px",
        },
        {
            name: "Priority",
            selector: (row) => row.priority,
            sortable: true,
            conditionalCellStyles: [
                {
                    when: row => row.priority === 'Very High',
                    style: {
                        backgroundColor: '#dc3545',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    },
                },
                {
                    when: row => row.priority === 'High',
                    style: {
                        backgroundColor: '#f77488',
                        color: '#242424',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    },
                },
                {
                    when: row => row.priority === 'Medium',
                    style: {
                        backgroundColor: '#ffc107',
                        color: '#242424',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    },
                },
                {
                    when: row => row.priority === 'Low',
                    style: {
                        backgroundColor: '#a9a9a9',
                        color: '#242424',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'center',
                    },

                },
            ],
        },
        {
            name: "Planned Date",
            selector: (row) => row.plannedDate,
            sortable: true,
            minWidth: "180px",
        },
        {
            name: "Completed Date",
            selector: (row) => row.completedDate,
            sortable: true,
            minWidth: "180px",
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
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip >
                                Download
                            </Tooltip>
                        }
                    >
                        <Link to="#" class="ms-1 icon-btn" target="_blank">
                            <i class="bi bi-download"></i>
                        </Link>
                    </OverlayTrigger>
                </div>
            ),
        },
        {
            name: "Remarks",
            selector: (row) => row.remarks,
            sortable: true,
            minWidth: "180px",
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            conditionalCellStyles: [
                {
                    when: row => row.status === 'Open',
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
                    when: row => row.status === 'Closed',
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
                    when: row => row.status === 'Not Done',
                    style: {
                        backgroundColor: '#df2f4a',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    },
                },
                {
                    when: row => row.status === 'Done',
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
                                Done
                            </Tooltip>
                        }
                    >
                        <button type='button' className="me-1 icon-btn" onClick={taskDoneModalShow}>
                            <img src={process.env.PUBLIC_URL + 'assets/images/check.svg'} alt="icon" />
                        </button>
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
                                Stop/Circle
                            </Tooltip>
                        }
                    >
                        <button type='button' className="me-1 icon-btn" onClick={stopModalShow}>
                            <img src={process.env.PUBLIC_URL + 'assets/images/stop-circle.svg'} alt="icon" />
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                High Alert
                            </Tooltip>
                        }
                    >
                        <button type='button' className="me-1 icon-btn" onClick={highAlertModalShow}>
                            <img src={process.env.PUBLIC_URL + 'assets/images/high-alert.svg'} alt="icon" />
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
            title: 'Task Name',
            type: 'text',
            data: 'taskName',
        },
        {
            title: 'Assigned By',
            type: 'text',
            data: 'assignedBy',

        },
        {
            title: 'Priority',
            type: 'text',
            data: 'priority',

        },
        {
            title: 'Planned Date',
            type: 'date',
            data: 'plannedDate',
        },
        {
            title: 'Completed Date',
            type: 'date',
            data: 'completedDate',
        },
        {
            title: 'Description',
            type: 'text',
            data: 'description',

        },
        {
            title: 'Remarks',
            type: 'text',
            data: 'remarks',

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
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-header'>
                            <h5 className='card-title font-weight-medium'>
                                Search Tasks
                            </h5>
                        </div>
                        <div className='card-body pb-1'>
                            <div className='row align-items-end'>
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
                                <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                                    <div className="form-group">
                                        <button type="submit" className="btn btn-exp-green">Search</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card'>
                <div className='card-header d-flex flex-wrap justify-content-between align-items-center'>
                    <h3 className="card-title">My Task Tracker</h3>
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
                                                        Task Name
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Assigned by
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>                                                
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Priority
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
                                                        Description
                                                        <input type="checkbox" />
                                                        <span className="checkmark" />
                                                    </label>
                                                </div>
                                                <div className='w-100 dropdown-item'>
                                                    <label className="custom-checkbox mb-0">
                                                        Remarks
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
                                    className='custom-table-wrap delegation-table-striped'
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
            {/* Task Done modal start */}
            <Modal
                show={taskDoneShow}
                onHide={taskDoneModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Complete Task of <span>Undefined</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Assigned By : </label>
                                <p className='mb-0'>Undefined</p>
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className="form-group">
                                <label className="form-label">Planned Date : </label>
                                <p className='mb-0'>Undefined</p>
                            </div>
                        </div>
                        <div className='col-12'>
                            <div className="form-group">
                                <label className="form-label">Remarks : </label>
                                <textarea className="form-control" name="remarks" rows="3"></textarea>
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
            {/* Task Done modal end */}
            {/* Stop / Close modal start */}
            <Modal
                show={stopShow}
                onHide={stopModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Close This Task</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className='row'>
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
            {/* Stop / Close modal end */}
            {/* High Alert modal start */}
            <Modal
                show={highAlertShow}
                onHide={highAlertModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Change Task Priority</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className='row'>
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
            {/* High Alert modal end */}
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

        </React.Fragment >
    )
}

export default MyTaskTrackerList


