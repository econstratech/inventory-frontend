import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DataTable, { createTheme } from 'react-data-table-component';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Collapse, Dropdown, Modal, } from 'react-bootstrap';
import Handsontable from 'handsontable/base';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { PrivateAxios, PrivateAxiosFile, url } from '../../environment/AxiosInstance';
import { UserAuth } from '../auth/Auth';
import Loader from '../landing/loder/Loader';

import { AllUser, GetTaskPriority, GetTaskStatus } from '../../environment/GlobalApi';
import { SuccessMessage } from '../../environment/ToastMessage';
import { exportExcel, exportPDF, printTable } from '../../environment/exportTable';
import InventoryMasterPageTopBar from '../InventoryMaster/itemMaster/InventoryMasterPageTopBar';
// import { GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { PDFExport } from '@progress/kendo-react-pdf';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { Tooltip } from 'antd';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import Filter from '../CommonComponent/Filter';
// import { DropDownList } from "@progress/kendo-react-dropdowns";
// import { Link } from "react-router-dom";





function AllProducts() {
    const { isLoading, setIsLoading, Logout } = UserAuth()
    //for-data table
    const [value, setValue] = useState(true)
    const [grid, setGrid] = useState(false);
    const [doerShow, setDoerShow] = useState(false);
    const [detailsShow, setDetailsShow] = useState(false);
    const [deleteShow, setDeleteShow] = useState(false);
    const [descriptionShow, setDescriptionShow] = useState(false);
    const [descriptionData, setDescriptionData] = useState('');
    const [tableData, setTableData] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [data, setData] = useState([]);
    const [file, setFile] = useState(null);
    const [searchData, setSearchData] = useState({
        "name": "",
        "assign_to": "",
        "task_priority_id": "",
        "delegation_status_id": "",
    })
    const [User, setUser] = useState([
        { value: 'select', label: '-Select-' }
    ]);
    const [priorityAllData, setPriorityAllData] = useState([
        { value: 'select', label: '-Select-' }
    ]);
    const [taskStatusAllData, setTaskStatusAllData] = useState([
        { value: 'select', label: '-Select-' }
    ]);
    const [keUpSearch, setKeUpSearch] = useState([]);
    //delete modal
    const navigate = useNavigate();
    const deleteModalClose = () => setDeleteShow(false);
    // const deleteModalShow = () => setDeleteShow(true);
    //delete
    const deleteModalShow = (id) => {
        setDeleteId(id);
        setDeleteShow(true);
    };
    //bulk upload
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        setIsLoading(true)
        if (!file) {
            alert('Please select a file first!');
            setIsLoading(false)
            return;

        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await PrivateAxiosFile.post('/product/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            SuccessMessage('Products uploaded successfully.');
            navigate('/products');
        } catch (error) {
            alert('Upload failed');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    //end bulk upload
    const handleDelete = () => {
        PrivateAxios.delete(`product/${deleteId}`)
            .then((res) => {
                setTableData(tableData.filter(item => item.id !== deleteId));
                setDeleteShow(false);
                setDeleteId(null);
            })
            .catch((error) => {
                console.error('Error deleting data:', error);
                setDeleteShow(false);
                setDeleteId(null);
            });
    };
    //end delete


    //description modal
    const descriptionModalClose = () => {
        setDescriptionShow(false)
        setDescriptionData('');
    };
    // const descriptionModalShow = (e) => {
    //     setDescriptionShow(true);
    //     setDescriptionData(e);
    // }

    useEffect(() => {
        const TaskData = async () => {
            setIsLoading(true)
            PrivateAxios.get("product/list").then((res) => {
                setTableData(res.data.data);
                setData(res.data.data)
                setIsLoading(false)
            }).catch((err) => {
                setIsLoading(false)
                if (err.response.data == 401) {
                    Logout();
                }
            })
        }
        TaskData();

    }, [])

    useEffect(() => {
        // const handler = setTimeout(() => {
        //     setDebouncedSearchTerm(searchTerm);
        // }, 300);
        // return () => {
        //     clearTimeout(handler);
        // };
    }, [keUpSearch]);

    // const filteredItems = data.filter((item) =>
    //     item.toLowerCase().includes(tableData.toLowerCase())
    // );

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
                backgroundColor: '#e3fffe'
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




    const [selectedColumns, setSelectedColumns] = useState([
        {
            name: 'Sl No.',
            cell: (row, index) => index + 1,
            minWidth: "80px",
            maxWidth: "80px"
        },
        {
            name: "Name",
            selector: (row) => row.product_name,
            sortable: true,
            reorder: true
        },
        {
            name: "Category",
            selector: (row) => row.Categories && row.Categories.title,
            sortable: true,
            reorder: true
        },
        {
            name: "Type",
            selector: (row) => row.product_type,
            sortable: true,
            reorder: true
        },
        {
            name: "Unit",
            selector: (row) => row.unit,
            sortable: true,
            reorder: true
        },
        {
            name: "Code",
            selector: (row) => row.product_code,
            sortable: true,
            reorder: true
        },
        {
            name: "Image",
            selector: (row) => (
                <img src={row.attachment_file != null ? url + '/' + row.attachment_file : url + '/no-image.svg'} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />

            ),
            sortable: true,
            reorder: true
        },


        {
            name: "Action",
            headerStyle: { textAlign: "center" },
            minWidth: "210px",
            selector: (row) => null,
            cell: (row) => (
                <div className="d-flex">
                    <Tooltip title="Edit">
                        <Link to={{ pathname: `/edit-product/${row.id}` }} state={{ data: row }} className="me-1 icon-btn">
                            <i className="fas fa-pen"></i>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <button type='button' className="me-1 icon-btn" onClick={() => deleteModalShow(row.id)}>
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </Tooltip>


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
            data: 'product_name',
        },
        {
            title: 'Category',
            type: 'text',
            data: 'Categories.title',
        },
        {
            title: 'Type',
            type: 'text',
            data: 'product_type',
        },
        {
            title: 'Unit',
            type: 'text',
            data: 'unit',
        },
        {
            title: 'Code',
            type: 'text',
            data: 'product_code',
        }
    ]
    //for datepicker


    const tableView = () => {
        setGrid(false)
    }
    const gridView = () => {
        setGrid(true);
    }


    const SearchData = (e) => {
        const filterData = data.filter((item) => {
            return Object.keys(searchData).every(key => {
                const searchValue = searchData[key];
                const itemValue = item[key];
                if (!searchValue) return true;
                if (itemValue === undefined || itemValue === null) return false;
                if (typeof itemValue === 'string') {
                    return itemValue.toLowerCase().replace(/\s+/g, '').includes(searchValue.toLowerCase().replace(/\s+/g, ''));
                }

                if (typeof itemValue === 'number') {
                    return itemValue.toString().replace(/\s+/g, '').includes(searchValue.toString().replace(/\s+/g, ''));
                }
                return false;
            });
        })

        setTableData(filterData);
    }

    const handleKeyUpSearch = (e) => {
        const filteredItems = data.filter((item) => {
            return item && item.product_name && item.product_name.toLowerCase().replace(/\s+/g, '').includes(e.target.value.toLowerCase().replace(/\s+/g, ''))
        }
        );
        setTableData(filteredItems);
    }


    const pdfExportRef = React.createRef();
    const excelExportRef = React.createRef();


    const handleExportPDF = () => {
        if (pdfExportRef.current) {
            pdfExportRef.current.save();
        }
    };

    const handleExportExcel = () => {
        if (data && data.length > 0) {
            excelExportRef.current.save();
        } else {
            alert("No data available for export.");
        }
    };

    //   const ActionCell = (props) => {
    //     const { dataItem } = props || {}; // Ensure props and dataItem exist
    //     if (!dataItem) return null;

    //     return (
    //       <td>
    //         <div className="d-flex gap-2">
    //           <Tooltip title="View Details">
    //             <span
    //               className="me-1 icon-btn"
    //               style={{ cursor: "pointer" }}
    //             >

    //             </span>
    //           </Tooltip>

    //             <Tooltip title="Confirm Order">
    //               <Link
    //                 to=''
    //                 // state={{ data: dataItem }}
    //                 className="me-1 icon-btn"
    //               >
    //                 <i className="fas fa-external-link-alt"></i>
    //               </Link>
    //             </Tooltip>

    //         </div>
    //       </td>
    //     );
    //   }


    const [tableProductData, setTableProductData] = useState([
        {
            slno: "REF001",
            code: "PROC001",
            status: "FinalApprovalPending",
            BOMNumber: "BOM0001",
            unit: "FG001",
            name: "Finished Good #1",
            category: "Assembly",
            type: "PRoduct",

        },


    ]);


    const statuses = [
        { text: "Final Approval Pending", value: "FinalApprovalPending" },
        { text: "Active", value: "Active" },
        { text: "Request For Quotation", value: "RequestForQuotation" },
        { text: "Send to Management", value: "SendToManagement" },
        { text: "Sales Order", value: "SalesOrder" },
        { text: "Rejected from Admin", value: "RejectedfromAdmin" },
        { text: "Fully Billed", value: "FullyBilled" },
        { text: "Done", value: "Done" },
        { text: "Nothing to Bill", value: "NothingToBill" },
        { text: "Items Received Done", value: "ItemsReceivedDone" },
    ];

    const CustomDropDownFilter = (props) => {
        const handleChange = (e) => {
            props.onChange({
                value: e.value,
                operator: "eq",
                field: props.field,
            });
        };

        return (
            <DropDownList
                data={statuses}
                textField="text"
                dataItemKey="value"
                value={statuses.find((s) => s.value === props.value) || statuses[0]}
                onChange={handleChange}
            />
        );
    };


    const statusStyles = {
        FinalApprovalPending: "badge-outline-warning",
        Active: "badge-outline-active",
        RequestForQuotation: "badge-outline-quotation",
        SendToManagement: "badge-outline-warning",
        SalesOrder: "badge-outline-purple",
        RejectedfromAdmin: "badge-outline-danger",
        FullyBilled: "badge-outline-meantGreen",
        Done: "badge-outline-success",
        NothingToBill: "badge-outline-accent",
        ItemsReceivedDone: "badge-outline-green",
    };

    const getStatusBadge = (status) => {
        const style = statusStyles[status] || "badge-outline-secondary";
        return (
            <label className={`mb-0 badge ${style}`}>
                <i className="fas fa-circle f-s-8 d-flex me-1"></i>
                {statuses.find((s) => s.value === status)?.text || status}
            </label>
        );
    };


    // const CustomCell = (props) => {
    //     const { dataItem, field } = props;
    //     const status = dataItem[field];

    //     return <td>{getStatusBadge(status)}</td>;
    // };

    const ActionCell = (props) => {
        const { dataItem } = props || {}; // Ensure props and dataItem exist
        if (!dataItem) return null;

        return (
            <td>
                <div className="d-flex gap-2">

                    <Tooltip title="Edit">
                        <button type='button' className="me-1 icon-btn">
                            <i className='fas fa-pen'></i>
                        </button>

                    </Tooltip>

                    <Tooltip title="Delete">
                        <button type='button' className="me-1 icon-btn">
                            <i class="fas fa-trash-alt text-danger f-s-14"></i>
                        </button>

                    </Tooltip>

                </div>
            </td>
        );
    }
    //filter modal
    const [filterShow, setFilterShow] = useState(false);
    const filterModalClose = () => setFilterShow(false);
    const filterModalShow = () => setFilterShow(true);

    const [openBulkUpload, setOpenBulkUpload] = useState(false);

    return (

        <React.Fragment>
            {isLoading ? <Loader /> : <>
                <InventoryMasterPageTopBar />
                <div className='p-4'>
                    <div className="d-flex justify-content-end align-items-center mb-3">
                        {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                    </div>
                    <div className='card'>
                        <div className='card-body p-0'>
                            <div className='row align-items-center p-3'>
                                <div className='col-lg-6 col-sm-12'>
                                    <div className='d-flex justify-content-start'>

                                        <Link to="/add-new-product" className='btn btn-sm btn-outline-primary me-2'>
                                            <i className='fas fa-plus me-2'></i>
                                            New Product
                                        </Link>


                                        <button
                                            class="btn btn-exp-purple-outline btn-sm"
                                            onClick={() => setOpenBulkUpload(!openBulkUpload)}
                                            aria-controls="contentId"
                                            aria-expanded={openBulkUpload}
                                        >
                                            <i class="bi bi-upload me-2"></i>Bulk Upload
                                        </button>
                                    </div>
                                </div>
                                <div className='col-lg-6 col-sm-12'>
                                    <div className="table-button-group ms-auto justify-content-end w-100">
                                        <GridToolbar className="border-0 gap-0 py-0">
                                            <Tooltip title="Export to PDF">
                                                <button type='button' className=" table-export-btn" onClick={handleExportPDF}>
                                                    <i class="far fa-file-pdf d-flex f-s-20"></i>
                                                </button>
                                            </Tooltip>
                                            <Tooltip title=" Export to Excel">
                                                <button type='button' className=" table-export-btn" onClick={handleExportExcel}>
                                                    <i class="far fa-file-excel d-flex f-s-20"></i>
                                                </button>
                                            </Tooltip>
                                        </GridToolbar>
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <Collapse in={openBulkUpload}>
                                        <div className="py-3" id="contentId">
                                            <div className='card shadow-none border'>
                                                <div className='card-header'>
                                                    <h5 className='card-title font-weight-medium'>
                                                        Bulk Upload
                                                    </h5>
                                                </div>
                                                <div className='card-body pb-1'>
                                                    <div className='row align-items-center'>
                                                        <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                                                            <div className='form-group'>
                                                                <label className='form-label'>Upload Products</label>
                                                                <div className='custom-select-wrap'>
                                                                    <input type="file" required className='form-control' accept=".xlsx, .csv" onChange={handleFileChange} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                                                            <div className='form-group'>
                                                                <div className='custom-select-wrap btn-wrap'>
                                                                    <a href={url + "products.xlsx"} download={url + "products.xlsx"} className='btn btn-warning'>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            id="Layer_1"
                                                                            data-name="Layer 1"
                                                                            viewBox="0 0 24 24"
                                                                            width={14}
                                                                            height={14}
                                                                            fill="currentColor"
                                                                            className='me-1'
                                                                        >
                                                                            <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
                                                                        </svg>
                                                                        Download Template</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-footer d-flex justify-content-end">
                                                    <button type='button' class="btn btn-exp-primary" onClick={handleUpload}>Upload</button>
                                                </div>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>
                            </div>

                            <div className='col-12'>
                                <div className="bg_succes_table_head rounded_table">
                                    <div div className="w-100">
                                        <div className="card status-light-quotationBg mb-0 rounded-0">
                                            <div className="card-body ">
                                                <div className="exp-no-data-found text-exp-red">
                                                    <img className="task-img mb-3" src={process.env.PUBLIC_URL + 'assets/images/search-no-record-found.png'} alt="No task" />
                                                    <h6>No Record Found</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <PDFExport data={data} ref={pdfExportRef}>
                                        <ExcelExport data={data} ref={excelExportRef} >
                                            <Grid
                                                data={tableProductData}
                                                sortable
                                                filterable={false}
                                                pageable={{ buttonCount: 3, pageSizes: true }}

                                            >
                                                <GridColumn
                                                    field="slno"
                                                    width="200px"
                                                    title="Sl No"
                                                    filterable={false}
                                                    locked={false}
                                                />
                                                <GridColumn
                                                    field="name"
                                                    title="Name"
                                                    filter="text"
                                                    width="200px"
                                                    filterable={false}
                                                    locked={false} // Locked column

                                                />
                                                <GridColumn
                                                    field="category"
                                                    title="Category"
                                                    width="250px"
                                                    filterable={false}
                                                // filterCell={CustomDropDownFilter}
                                                // cell={CustomCell} 
                                                />
                                                <GridColumn
                                                    field="type"
                                                    title="Type"
                                                    filter="text"
                                                    width="200px"
                                                    filterable={false}
                                                    locked={false} // Locked column

                                                />
                                                <GridColumn field="unit" title="Unit" filter="text" width="200px" filterable={false} />
                                                <GridColumn field="code" title="Code" filter="text" width="200px" filterable={false} />
                                                <GridColumn
                                                    field="image"
                                                    title="Image"
                                                    filter="text"
                                                    width="200px"
                                                    filterable={false}
                                                    locked={false} // Locked column
                                                    cell={() => (
                                                        <td>
                                                            <img className="task-img mb-3 w-25" src={process.env.PUBLIC_URL + 'assets/images/search-no-record-found.png'} alt="No task" />
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn field="action"
                                                    title="Action"
                                                    filter="text"
                                                    width="200px"
                                                    filterable={false}
                                                    cell={ActionCell} />

                                            </Grid>
                                        </ExcelExport>
                                    </PDFExport>

                                </div>

                            </div>

                        </div>
                    </div>

                    {/* </div> */}
                    <div className='card'>
                        <div className='card-header d-flex flex-wrap justify-content-between align-items-center'>
                            <h3 className="card-title">Products</h3>
                            <div className="d-flex ms-auto align-items-center">

                                {/* <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      
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
                                </OverlayTrigger> */}

                            </div>
                        </div>
                        <div className='card-body'>
                            {!tableData.length > 0 ?
                                <div div className="w-100">
                                    <div className="card bg-warning-light mb-0">
                                        <div className="card-body">
                                            <div className="exp-no-data-found text-exp-red">
                                                <img className="task-img mb-3" src={process.env.PUBLIC_URL + 'assets/images/search-no-record-found.webp'} alt="No task" />
                                                <h6>No Record Found</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div> :
                                <>
                                    {
                                        !grid ?
                                            <div className="table-view" >
                                                <div className='d-flex justify-content-between'>
                                                    <div className='table-button-group mb-3'>
                                                        {/* <button className='btn table-export-btn'>
                                                    <img src={process.env.PUBLIC_URL + 'assets/images/copy.svg'} alt="icon" />
                                                </button> */}
                                                        <button type='button' className='btn table-export-btn' onClick={() => exportExcel(selectedColumns, tableData, "products")}>
                                                            <i className="fas fa-file-alt"></i>
                                                        </button>
                                                        {/* <button className='btn table-export-btn'>
                                                    <img src={process.env.PUBLIC_URL + 'assets/images/file-excel.svg'} alt="icon" />
                                                </button> */}
                                                        <button type='button' className='btn table-export-btn' onClick={() => exportPDF(selectedColumns, tableData, "products")}>
                                                            <i className="fas fa-file-pdf"></i>
                                                        </button>
                                                        <button type='button' className='btn table-export-btn' onClick={() => printTable(selectedColumns, tableData, "products")}>
                                                            <i className="fas fa-print"></i>
                                                        </button>


                                                    </div>
                                                    <div className='d-flex align-items-center'>
                                                        <label className='mr-2 mb-0'>Search: </label>
                                                        <input type='text' placeholder='Type here...' onChange={handleKeyUpSearch} className='form-control form-control-sm' />
                                                    </div>
                                                </div>

                                                <DataTable


                                                    columns={selectedColumns}
                                                    data={tableData}
                                                    pagination={[5, 10, 25, 50]}
                                                    theme="solarized"
                                                    striped
                                                    className='custom-table-wrap checklist-table-striped'
                                                    customStyles={customStyles}

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
                                                    manualColumnResize={true}
                                                    manualColumnMove={true}
                                                    manualRowMove={true}
                                                    autoWrapRow={true}
                                                    autoWrapCol={true}
                                                    contextMenu={true}
                                                    multiColumnSorting={true}
                                                    stretchH="all"
                                                    licenseKey="non-commercial-and-evaluation"
                                                />
                                            </div>

                                    }
                                </>

                            }
                        </div>
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
                        <button type='reset' className='btn btn-secondary' onClick={deleteModalClose}>
                            Cancel
                        </button>
                        <button type='submit' className='btn btn-exp-red' onClick={handleDelete}>
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
                        <Modal.Title>Message</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className='row'>
                            <div className='col-12'>
                                <p className='mb-0 text-muted'>
                                    {descriptionData}
                                </p>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
                {/* <ManagementFilter /> */}
                {['end'].map((placement, idx) => (
                    <Filter show={filterShow}
                        handleClose={filterModalClose} key={idx} placement={placement.end} name={placement} />
                ))}

            </>}
            {/* Description modal end */}
        </React.Fragment >

    )
}

export default AllProducts;