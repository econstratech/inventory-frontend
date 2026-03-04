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

function TaskManagerWorkflow() {

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
            name: "Order To Delivery",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
            observer: "Sandip Kr Paul",
        },
        {
            name: "Employee Onboarding",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
            observer: "Amit Das Gupta",
        },
        {
            name: "Box",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
            observer: "Gopal Mukharjee",
        },
        {
            name: "New WorkFlow",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
            observer: "Sujit Paul",
        },
    ]);


    const [selectedColumns, setSelectedColumns] = useState([
        {
            name: 'Sl No.',
            cell: (row, index) => index + 1,
            minWidth: "80px",
            maxWidth: "80px"
        },
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
            reorder: true
        },
        {
            name: "Description",
            selector: (row) => row.description,
            sortable: true,
            minWidth: "250px",
            cell: (row) => (
                <div className="table-description">
                    <span className='text-part'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</span>
                    <button className='table-read-more' onClick={descriptionModalShow}>Read more..</button>
                </div>
            ),
        },
        {
            name: "Observer",
            selector: (row) => row.observer,
            sortable: true,
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
                                Create New Workflow Task
                            </Tooltip>
                        }
                    >
                        <Link to="/create-new-workflow-task" className="me-1 icon-btn">
                            <img src={process.env.PUBLIC_URL + 'assets/images/add.svg'} alt="icon" />
                        </Link>
                    </OverlayTrigger>
                    
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Edit Workflow Task
                            </Tooltip>
                        }
                    >
                        <Link to="/edit-workflow-task" className="me-1 icon-btn">
                            <i className="fas fa-pen"></i>
                        </Link>
                    </OverlayTrigger>                    
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
            title: 'Name',
            type: 'text',
            data: 'name',
        },
        {
            title: 'Description',
            type: 'text',
            data: 'description',

        },
        {
            title: 'Observer',
            type: 'text',
            data: 'observer',

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

            <div className='card'>
                <div className='card-header d-flex flex-wrap justify-content-between align-items-center'>
                    <h3 className="card-title">Workflow List</h3>
                    <div className="d-flex ms-auto align-items-center">
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip >
                                    Create New Workflow Template
                                </Tooltip>
                            }
                        >
                            <Link to="/new-workflow-template" className='me-2 btn btn-exp-green'>
                                <i className='bi bi-plus-circle me-2'></i>
                                New
                            </Link>
                        </OverlayTrigger>
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip >
                                    Table View
                                </Tooltip>
                            }
                        >
                            <button className={`icon-btn me-2 ${!grid ? 'icon-btn-active' : ''}`} onClick={tableView} >
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
                            <button className={`icon-btn ${grid ? 'icon-btn-active' : ''}`} onClick={gridView}>
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
                                        <button className='btn table-export-btn'>
                                            <img src={process.env.PUBLIC_URL + 'assets/images/copy.svg'} alt="icon" />
                                        </button>
                                        <button className='btn table-export-btn'>
                                            <i className="fas fa-file-alt"></i>
                                        </button>
                                        <button className='btn table-export-btn'>
                                            <img src={process.env.PUBLIC_URL + 'assets/images/file-excel.svg'} alt="icon" />
                                        </button>
                                        <button className='btn table-export-btn'>
                                            <i className="fas fa-file-pdf"></i>
                                        </button>
                                        <button className='btn table-export-btn'>
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
                                                        Name
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
                                                        Observer
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

export default TaskManagerWorkflow


