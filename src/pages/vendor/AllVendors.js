import React, { useEffect, useRef, useState } from 'react'
import "react-datepicker/dist/react-datepicker.css";
// import DataTable, { createTheme } from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
// import Handsontable from 'handsontable/base';
// import { HotTable } from '@handsontable/react';
import { SuccessMessage, ErrorMessage } from '../../environment/ToastMessage';
import 'handsontable/dist/handsontable.full.min.css';
import { PrivateAxios, PrivateAxiosFile, url } from '../../environment/AxiosInstance';
// import { UserAuth } from '../auth/Auth';
import Loader from '../landing/loder/Loader';
// import { AllUser, GetTaskPriority, GetTaskStatus } from '../../environment/GlobalApi';
// import { exportExcel, exportPDF, printTable } from '../../environment/exportTable';
//import '@progress/kendo-theme-default/dist/all.css';
import { PDFExport } from '@progress/kendo-react-pdf';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { Tooltip } from 'antd';
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import VendorsPageTopBar from './VendorsPageTopBar';
// import Filter from '../CommonComponent/Filter';



function AllVendors() {
    // const { isLoading, setIsLoading, Logout } = UserAuth()
    //for-data table
    // const [loading, setLoading] = useState(false);
    // const [value, setValue] = useState(true)
    // const [grid, setGrid] = useState(false);
    // const [doerShow, setDoerShow] = useState(false);
    // const [detailsShow, setDetailsShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteShow, setDeleteShow] = useState(false);
    // const [descriptionShow, setDescriptionShow] = useState(false);
    // const [descriptionData, setDescriptionData] = useState('');
    const [vendors, setVendors] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [file, setFile] = useState(null);
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
    const fileInputRef = useRef(null);

    const [pageState, setPageState] = useState({
        skip: 0,
        take: 10,
        searchKey: "",
    });
    const handlePageChange = (event) => {
        const newPageState = {
            skip: event.page.skip,
            take: event.page.take,
            searchKey: pageState.searchKey,
          };
          setPageState(newPageState);
          // Fetch data with updated pagination and current filter
        fetchVendors(newPageState); // Pass null to use current filter values from state
    };
    const pagedData = vendors.slice(pageState.skip, pageState.skip + pageState.take);

    //delete modal
    const deleteModalClose = () => setDeleteShow(false);
    // const deleteModalShow = () => setDeleteShow(true);
    //delete
    const deleteModalShow = (id) => {
        setDeleteId(id);
        setDeleteShow(true);
    };
    //start bulk upload
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file) {
            ErrorMessage('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await PrivateAxiosFile.post('/vendor/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            SuccessMessage(`${response.data.created_records} suppliers has been added successfully.`);
            fetchVendors();
            setBulkUploadOpen(false);
            setFile(null);
        } catch (error) {
            ErrorMessage('Upload failed');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    //end bulk upload
    const handleDelete = () => {
        PrivateAxios.delete(`vendor/${deleteId}`)
            .then((res) => {
                setVendors(vendors.filter(item => item.id !== deleteId));
                setDeleteShow(false);
                setDeleteId(null);
            })
            .catch((error) => {
                ErrorMessage('Error deleting data:', error);
                setDeleteShow(false);
                setDeleteId(null);
            });
    };
    //end delete


    //description modal
    // const descriptionModalClose = () => {
    //     setDescriptionShow(false)
    //     setDescriptionData('');
    // };

    // Handle filter button click
    const handleFilter = () => {
        const newPageState = { ...pageState, skip: 0 }; // Reset to first page when filtering
        setPageState(newPageState);
        fetchVendors(newPageState); // Pass null to use current filter values from state
    };

    const handleReset = () => {
        const resetPageState = { skip: 0, take: 15, searchKey: "" };
        
        // Update state
        setPageState(resetPageState);
        fetchVendors(resetPageState);
      };

    const fetchVendors = async (newPageState = null) => {
        setIsLoading(true);
        try {
            const currentPageState = newPageState || pageState;
            const urlParams = new URLSearchParams({
                page: currentPageState.skip / currentPageState.take + 1,
                limit: currentPageState.take,
                ...(currentPageState.searchKey && { searchkey: currentPageState.searchKey })
            });

            const res = await PrivateAxios.get(`vendor?${urlParams.toString()}`);
            const vendorList = res.data.data.rows || [];
            setIsLoading(false);

            setVendors(vendorList);
            setData(vendorList);
            setTotalCount(res.data.data.pagination.total_records);

        } catch (err) {
            console.error("Error fetching vendor data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

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

    //filter modal
    // const [filterShow, setFilterShow] = useState(false);
    // const filterModalClose = () => setFilterShow(false);
    // const filterModalShow = () => setFilterShow(true);


    return (

        <React.Fragment>


            {isLoading ? <Loader /> : <>
                <VendorsPageTopBar />
                <div className='p-4'>
                    <div className="d-flex justify-content-end align-items-center mb-3">
                        {/* <button type='button' className="btn btn-exp-purple btn-sm" aria-controls="example-collapse-text" aria-expanded="false" onClick={filterModalShow}><i className="fas fa-filter me-2" ></i>Filter</button> */}
                    </div>
                    <div className='card'>
                        <div className='card-body p-0'>
                            <div className='row align-items-center p-3'>
                                <div className='col-lg-6 col-sm-12'>
                                    <div className='d-flex justify-content-start'>
                                        <Tooltip title="Create New">
                                            <Link to="/add-new-vendor" className='btn btn-sm btn-outline-primary me-2'>
                                                <i className='fas fa-plus me-2'></i>
                                                New
                                            </Link>
                                        </Tooltip>


                                        <button
                                            type="button"
                                            className="btn btn-exp-purple-outline btn-sm"
                                            onClick={() => setBulkUploadOpen((prev) => !prev)}
                                            aria-expanded={bulkUploadOpen}
                                            aria-controls="contentId"
                                        >
                                            <i className="bi bi-upload me-2"></i>Bulk Upload
                                        </button>
                                        {/* <a
                                            href={`${process.env.PUBLIC_URL || ''}/sample-csv-files/sample_bulk_add_suppliers.csv`}
                                            download="sample_bulk_add_suppliers.csv"
                                            className="btn btn-outline-secondary btn-sm ms-2"
                                        >
                                            <i className="fas fa-download me-2"></i>Download Sample
                                        </a> */}
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
                                    <div className={`collapse p-2 ${bulkUploadOpen ? 'show' : ''}`} id="contentId">
                                        <div className='card shadow-none border'>
                                            <div className='card-header'>
                                                <h5 className='card-title font-weight-medium'>
                                                    Bulk Upload
                                                </h5>
                                            </div>
                                            <div className='card-body pb-1'>
                                                <div className='row align-items-center'>
                                                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                                                        <div className='form-group mb-0'>
                                                            <label className='form-label'>Upload Products</label>
                                                            <div className='custom-select-wrap'>
                                                                <input ref={fileInputRef} type="file" required className='form-control' accept=".xlsx, .csv" onChange={handleFileChange} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                                                        <div className='form-group'>
                                                            <label className='mb-1'>Sample File</label>
                                                            <div className='custom-select-wrap btn-wrap'>
                                                                <a
                                                                    href={`${process.env.PUBLIC_URL || ''}/sample-csv-files/sample_bulk_add_suppliers.csv`}
                                                                    download="sample_bulk_add_suppliers.csv"
                                                                    className='product-btn'
                                                                >
                                                                    <i className="fas fa-download me-2"></i>Download
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="card-footer d-flex justify-content-end">
                                                <button type='submit' class="btn btn-exp-primary" onClick={handleUpload}>Upload</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Section */}
                            <div className="p-3 border-bottom" style={{ position: "relative", zIndex: 1 }}>
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-4">
                                        <label className="form-label mb-1">Search</label>
                                        <input
                                            className="form-control"
                                            placeholder="Search..."
                                            value={pageState.searchKey}
                                            onChange={(e) => setPageState({ ...pageState, searchKey: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-auto">
                                        <div className="d-flex gap-2">
                                            <Button type="primary" onClick={handleFilter}>
                                                Search
                                            </Button>
                                            <Button onClick={handleReset}>
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className=''>
                                <div className="bg_succes_table_head rounded_table">
                                    {/* <div div className="w-100">
                                        <div className="card status-light-quotationBg mb-0 rounded-0">
                                            <div className="card-body ">
                                                <div className="exp-no-data-found text-exp-red">
                                                    <img className="task-img mb-3" src={process.env.PUBLIC_URL + 'assets/images/search-no-record-found.png'} alt="No task" />
                                                    <h6>No Record Found</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                    <PDFExport data={data} ref={pdfExportRef}>
                                        <ExcelExport data={data} ref={excelExportRef} >
                                            <Grid
                                                data={pagedData}
                                                skip={pageState.skip}
                                                take={pageState.take}
                                                total={totalCount}
                                                pageable={{ buttonCount: 3, pageSizes: true }}
                                                onPageChange={handlePageChange}
                                            >
                                                <GridColumn
                                                    field="slno"
                                                    title="Sl No"
                                                    width="80px"
                                                    cell={(props) => (
                                                        <td>{props.dataIndex + 1}</td>
                                                    )}
                                                />
                                                <GridColumn
                                                    field="vendor_name"
                                                    title="Vendor Name"
                                                    width="150px"
                                                    // cell={(props) => {
                                                    //     let tags = 'No tags available';
                                                    //     try {
                                                    //         const parsed = JSON.parse(props.dataItem.tags);
                                                    //         tags = parsed.join(', ');
                                                    //     } catch (e) { }
                                                    //     return (
                                                    //         <td>
                                                    //             <div>
                                                    //                 <span className="k_table_link">{props.dataItem.vendor_name}</span>
                                                    //                 <Tooltip title={tags}>
                                                    //                     <i className="fas fa-info-circle ms-2 text-primary" />
                                                    //                 </Tooltip>
                                                    //             </div>
                                                    //         </td>
                                                    //     );
                                                    // }}
                                                />
                                                <GridColumn field="email" title="Email" width="180px" />
                                                <GridColumn field="mobile" title="Mobile" width="180px" />

                                                <GridColumn field="address" title="Address" width="230px" />

                                                {/* <GridColumn
                                                    field="gstin"
                                                    title="GSTIN"
                                                    width="200px"
                                                    cell={(props) => (
                                                        <td><div className="text-uppercase">{props.dataItem.gstin}</div></td>
                                                    )}
                                                />
                                                <GridColumn
                                                    field="pan"
                                                    title="PAN"
                                                    width="150px"
                                                    cell={(props) => (
                                                        <td><div className="text-uppercase">{props.dataItem.pan}</div></td>
                                                    )}
                                                /> */}

                                                {/* <GridColumn
                                                    field="attachment_file"
                                                    title="Image"
                                                    width="120px"
                                                    cell={(props) => (
                                                        <td>
                                                            <img
                                                                src={props.dataItem.attachment_file ? `${props.dataItem.attachment_file}` : `https://growthh.s3.ap-south-1.amazonaws.com/ERP/sample/alert.png`}
                                                                alt="vendor"
                                                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                                            />
                                                        </td>
                                                    )}
                                                /> */}

                                                {/* ⭐ Star Rating Column */}
                                                {/* <GridColumn
                                                    title="Rating"
                                                    width="140px"
                                                    cell={(props) => (
                                                        <td>
                                                            {Array.from({ length: 5 }, (_, i) => (
                                                                <i
                                                                    key={i}
                                                                    className={`bi ${i < (props.dataItem.ratings || 0) ? 'bi-star-fill' : 'bi-star'}`}
                                                                    style={{ color: '#FF0000', fontSize: '14px' }}
                                                                />
                                                            ))}
                                                        </td>
                                                    )}
                                                /> */}

                                                {/* Action Buttons */}
                                                <GridColumn
                                                    title="Action"
                                                    width="180px"
                                                    cell={(props) => (
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Tooltip title="Edit">
                                                                    <Link
                                                                        to={`/edit-vendor/${props.dataItem.id}`}
                                                                        state={{ data: props.dataItem }}
                                                                        className="icon-btn"
                                                                    >
                                                                        <i className="fas fa-pen" />
                                                                    </Link>
                                                                </Tooltip>
                                                                <Tooltip title="Delete">
                                                                    <button
                                                                        type="button"
                                                                        className="icon-btn"
                                                                        onClick={() => deleteModalShow(props.dataItem.id)}
                                                                    >
                                                                        <i className="fas fa-trash-alt text-danger" />
                                                                    </button>
                                                                </Tooltip>
                                                            </div>
                                                        </td>
                                                    )}
                                                />
                                            </Grid>


                                        </ExcelExport>
                                    </PDFExport>

                                </div>

                            </div>

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
                {/* <Modal
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
                </Modal> */}

                {/* Description modal end */}


                {/* <ManagementFilter /> */}
                {/* {['end'].map((placement, idx) => (
                    <Filter show={filterShow}
                        handleClose={filterModalClose} key={idx} placement={placement.end} name={placement} />
                ))} */}


            </>}
        </React.Fragment >

    )
}

export default AllVendors;
