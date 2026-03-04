import React, { useEffect, useRef, useState } from "react";
// import Select from "react-select";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import DataTable, { createTheme } from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
// import Handsontable from "handsontable/base";
// import { HotTable } from "@handsontable/react";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import "handsontable/dist/handsontable.full.min.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
// import { UserAuth } from "../auth/Auth";
import Loader from "../landing/loder/Loader";
// import {
//   AllUser,
//   GetTaskPriority,
//   GetTaskStatus,
// } from "../../environment/GlobalApi";
// import {
//   exportExcel,
//   exportPDF,
//   printTable,
// } from "../../environment/exportTable";
import VendorsPageTopBar from "../vendor/VendorsPageTopBar";

// import { PDFExport } from "@progress/kendo-react-pdf";
// import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Tooltip } from "antd";
// import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
// import Filter from "../CommonComponent/Filter";

function AllCustomers() {
  // const { isLoading, setIsLoading, Logout } = UserAuth();
  //for-data table
  // const [loading, setLoading] = useState(false);
  // const [value, setValue] = useState(true);
  // const [grid, setGrid] = useState(false);
  // const [doerShow, setDoerShow] = useState(false);
  // const [detailsShow, setDetailsShow] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  // const [descriptionShow, setDescriptionShow] = useState(false);
  // const [descriptionData, setDescriptionData] = useState("");
  const [customerData, setCustomerData] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  // const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const deleteModalClose = () => setDeleteShow(false);

  const fetchCustomers = async () => {
    setIsLoading(false);
    try {
      const urlParams = new URLSearchParams({
        page: pageState.skip / pageState.take + 1,
        pageSize: pageState.take,
        ...(pageState.searchKey && { searchkey: pageState.searchKey })
      });
      const res = await PrivateAxios.get(
        `customer/all-customers?${urlParams.toString()}`
      );
      const customerList = res.data.data.rows || [];
      setCustomerData(customerList);
      setTotalCount(res.data.total || 0); // set total items
    } catch (err) {
      if (err.response?.status === 401) {
        ErrorMessage(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      ErrorMessage("Please select a file first!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await PrivateAxiosFile.post(
        "/customer/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      SuccessMessage(`${response.data.created_records} customers has been added successfully.`);
      fetchCustomers();
      setBulkUploadOpen(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      ErrorMessage('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };
  //end bulk upload
  const handleDelete = () => {
    PrivateAxios.delete(`customer/${deleteId}`)
      .then((res) => {
        setCustomerData(customerData.filter((item) => item.id !== deleteId));
        setDeleteShow(false);
        setDeleteId(null);
      })
      .catch((error) => {
        console.error("Error deleting data:", error);
        setDeleteShow(false);
        setDeleteId(null);
      });
  };
  //end delete

  //description modal
  // const descriptionModalClose = () => {
  //   setDescriptionShow(false);
  //   setDescriptionData("");
  // };

  const [searchInput, setSearchInput] = useState("");
  const [pageState, setPageState] = useState({ skip: 0, take: 15, searchKey: "" });

  const handlePageChange = (event) => {
    setPageState({
      skip: event.page.skip,
      take: event.page.take,
      searchKey: pageState.searchKey
    });
  };

  const handleSearchCustomer = () => {
    setPageState(prev => ({
      ...prev,
      skip: 0,
      searchKey: searchInput.trim()
    }));
  };

  const handleResetFilter = () => {
    setSearchInput("");
    setPageState({ skip: 0, take: 15, searchKey: "" });
  };

  useEffect(() => {
    fetchCustomers();
  }, [pageState.skip, pageState.take, pageState.searchKey]);


  //filter modal
  // const [filterShow, setFilterShow] = useState(false);
  // const filterModalClose = () => setFilterShow(false);
  // const filterModalShow = () => setFilterShow(true);

  return (
    <React.Fragment>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <VendorsPageTopBar />
          <div className="p-4">
            <div className="card">
              <div className="card-body p-0">
                <div className="row align-items-center p-3">
                  <div className="col-lg-6 col-sm-12">
                    <div className="d-flex justify-content-start mb-2">
                      <Tooltip title="Create New">
                        <Link
                          to="/add-new-customer"
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          <i className="fas fa-plus me-2"></i>
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
                        href={`${process.env.PUBLIC_URL || ""}/sample-csv-files/sample_bulk_add_customers.csv`}
                        download="sample_bulk_add_customers.csv"
                        className="btn btn-outline-secondary btn-sm ms-2"
                      >
                        <i className="fas fa-download me-2"></i>Download Sample
                      </a> */}
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12">
                    {/* <div className="table-button-group ms-auto justify-content-end w-100">
                      <GridToolbar className="border-0 gap-0 py-0">
                        <Tooltip title="Export to PDF">
                          <button
                            type="button"
                            className=" table-export-btn"
                            onClick={handleExportPDF}
                          >
                            <i class="far fa-file-pdf d-flex f-s-20"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title=" Export to Excel">
                          <button
                            type="button"
                            className=" table-export-btn"
                            onClick={handleExportExcel}
                          >
                            <i class="far fa-file-excel d-flex f-s-20"></i>
                          </button>
                        </Tooltip>
                      </GridToolbar>
                    </div> */}
                    {/* <div className="search-box">
                      <Input.Search
                        placeholder="Search..."
                        id="searchProduct"
                        allowClear
                        className="product-search"
                        onSearch={(value) => {
                          setPageState(prev => ({
                            ...prev,
                            skip: 0,
                            take: 15,
                            searchKey: value.trim()
                          }));
                        }}
                      />
                    </div> */}
                    <div className="search-box d-flex align-items-center gap-2">
                      <div className="d-flex position-relative flex-grow-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          style={{ paddingRight: 40 }}
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchCustomer())}
                        />
                        <button
                          type="button"
                          className="icon-btn position-absolute"
                          style={{ top: 3, right: 3 }}
                          onClick={() => handleSearchCustomer()}
                        >
                          <i className="fas fa-search" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleResetFilter}
                      >
                        Reset Filter
                      </button>
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className={`collapse p-2 ${bulkUploadOpen ? "show" : ""}`}
                      id="contentId"
                    >
                      <div className="card shadow-none border">
                        <div className="card-header">
                          <h5 className="card-title font-weight-medium">
                            Bulk Upload
                          </h5>
                        </div>
                        <div className="card-body pb-1">
                          <div className="row align-items-center">
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                              <div className="form-group mb-0">
                                <label className="form-label">
                                  Upload File
                                </label>
                                <div className="custom-select-wrap">
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    required
                                    className="form-control"
                                    accept=".xlsx, .csv"
                                    onChange={handleFileChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                              <div className="form-group">
                                <label className="mb-1">Sample File</label>
                                <div className="custom-select-wrap btn-wrap">
                                  <a
                                    href={`${process.env.PUBLIC_URL || ""}/sample-csv-files/sample_bulk_add_customers.csv`}
                                    download="sample_bulk_add_customers.csv"
                                    className="product-btn"
                                  >
                                    <i className="fas fa-download me-2"></i>
                                    Download
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer d-flex justify-content-end">
                          <button
                            type="button"
                            className="btn btn-exp-primary"
                            onClick={handleUpload}
                          >
                            Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="">
                  <div className="bg_succes_table_head rounded_table">
                    <Grid
                      data={customerData}
                      skip={pageState.skip}
                      take={pageState.take}
                      total={totalCount}
                      onPageChange={handlePageChange}
                      pageable={{ buttonCount: 3, pageSizes: true }}
                      sortable
                      searchable
                    >
                      <GridColumn
                        title="Sl No"
                        width="80px"
                        cell={(props) => <td>{props.dataIndex + 1}</td>}
                      />
                      <GridColumn
                        field="name"
                        title="Name"
                        width="200px"
                        // cell={(props) => {
                        //   let tags = 'No tags available';
                        //   try {
                        //     const parsed = JSON.parse(props.dataItem.tags);
                        //     tags = parsed.join(', ');
                        //   } catch (e) { }
                        //   return (
                        //     <td>
                        //       <div>
                        //         <span className="k_table_link">{props.dataItem.name}</span>
                        //         <Tooltip title={tags}>
                        //           <i className="fas fa-info-circle ms-2 text-primary" />
                        //         </Tooltip>
                        //       </div>
                        //     </td>
                        //   );
                        // }}
                      />
                      <GridColumn
                        field="address"
                        title="Address"
                        width="250px"
                      />
                      <GridColumn
                        field="email"
                        title="Email"
                        width="150px"
                      />
                      <GridColumn
                        field="phone"
                        title="Mobile"
                        width="150px"
                      />
                      {/* <GridColumn
                        field="gstin"
                        title="GSTIN"
                        width="200px"
                        cell={(props) => (
                          <td>
                            <div className="text-uppercase">
                              {props.dataItem.gstin}
                            </div>
                          </td>
                        )}
                      /> */}
                      {/* <GridColumn
                        field="pan"
                        title="PAN"
                        width="150px"
                        cell={(props) => (
                          <td>
                            <div className="text-uppercase">
                              {props.dataItem.pan}
                            </div>
                          </td>
                        )}
                      /> */}
                      {/* <GridColumn
                        title="Image"
                        width="120px"
                        cell={(props) => (
                          <td>
                            <img
                              src={
                                props.dataItem.attachment_file
                                  ? `${props.dataItem.attachment_file}`
                                  : `https://growthh.s3.ap-south-1.amazonaws.com/ERP/sample/alert.png`
                              }
                              alt="img"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          </td>
                        )}
                      /> */}
                      {/* 
                      <GridColumn
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
                      <GridColumn
                        title="Action"
                        width="180px"
                        cell={(props) => (
                          <td>
                            <div className="d-flex gap-2">
                              <Tooltip title="Edit">
                                <Link
                                  to={`/edit-customer/${props.dataItem.id}`}
                                  state={{ data: props.dataItem }}
                                  className="icon-btn"
                                >
                                  <i className="fas fa-pen" />
                                </Link>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <button
                                  className="icon-btn"
                                  onClick={() =>
                                    deleteModalShow(props.dataItem.id)
                                  }
                                >
                                  <i className="fas fa-trash-alt text-danger" />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        )}
                      />
                    </Grid>
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
                  <img
                    src={
                      process.env.PUBLIC_URL +
                      "assets/images/delete-warning.svg"
                    }
                    alt="Warning"
                    className="img-fluid"
                  />
                </div>
                <h4 className="text-muted">Are you sure?</h4>
                <p className="text-muted">
                  Do you really want to delete these record? This process cannot
                  be undone.
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={deleteModalClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-exp-red"
                onClick={handleDelete}
              >
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
              <div className="row">
                <div className="col-12">
                  <p className="mb-0 text-muted">{descriptionData}</p>
                </div>
              </div>
            </Modal.Body>
          </Modal> */}

          {/* Description modal end */}

          {/* <ManagementFilter /> */}
          {/* {["end"].map((placement, idx) => (
            <Filter
              show={filterShow}
              handleClose={filterModalClose}
              key={idx}
              placement={placement.end}
              name={placement}
            />
          ))} */}
        </>
      )}
    </React.Fragment>
  );
}

export default AllCustomers;
