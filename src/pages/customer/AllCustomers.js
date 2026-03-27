import React, { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import "handsontable/dist/handsontable.full.min.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import Loader from "../landing/loder/Loader";
import VendorsPageTopBar from "../vendor/VendorsPageTopBar";
import { Tooltip, Table, Button } from "antd";
import { exportExcel, exportPDF } from "../../environment/exportTable";

function AllCustomers() {
  const [deleteShow, setDeleteShow] = useState(false);
  const [customerData, setCustomerData] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [file, setFile] = useState(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [pageState, setPageState] = useState({
    skip: 0,
    take: 15,
    searchKey: "",
  });

  const deleteModalClose = () => setDeleteShow(false);

  const fetchCustomers = async (newPageState = null) => {
    setIsLoading(true);
    try {
      const currentPageState = newPageState || pageState;
      const urlParams = new URLSearchParams({
        page: currentPageState.skip / currentPageState.take + 1,
        pageSize: currentPageState.take,
        ...(currentPageState.searchKey && { searchkey: currentPageState.searchKey }),
      });
      const res = await PrivateAxios.get(
        `customer/all-customers?${urlParams.toString()}`
      );
      const customerList = res.data.data.rows || [];
      setCustomerData(customerList);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        ErrorMessage(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    const newPageState = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    fetchCustomers(newPageState);
  };

  const handleFilter = () => {
    const newPageState = { ...pageState, skip: 0 };
    setPageState(newPageState);
    fetchCustomers(newPageState);
  };

  const handleReset = () => {
    const resetPageState = { skip: 0, take: 15, searchKey: "" };
    setPageState(resetPageState);
    fetchCustomers(resetPageState);
  };

  const deleteModalShow = (id) => {
    setDeleteId(id);
    setDeleteShow(true);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

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
      SuccessMessage(
        `${response.data.created_records} customers has been added successfully.`
      );
      fetchCustomers();
      setBulkUploadOpen(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      ErrorMessage("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const exportColumns = [
    { name: "Sl No.", selector: () => {} },
    { name: "Name", selector: (item) => item.name ?? "" },
    { name: "Address", selector: (item) => item.address ?? "" },
    { name: "Email", selector: (item) => item.email ?? "" },
    { name: "Mobile", selector: (item) => item.phone ?? "" },
  ];

  const handleExportPDF = () => {
    if (!customerData?.length) {
      alert("No data available for export.");
      return;
    }
    exportPDF(exportColumns, customerData, "Customers");
  };

  const handleExportExcel = () => {
    if (!customerData?.length) {
      alert("No data available for export.");
      return;
    }
    exportExcel(exportColumns, customerData, "customers");
  };

  const renderAction = (_, record) => (
    <div className="d-flex gap-2">
      <Tooltip title="Edit">
        <Link
          to={`/edit-customer/${record.id}`}
          state={{ data: record }}
          className="icon-btn"
        >
          <i className="fas fa-pen" />
        </Link>
      </Tooltip>
      <Tooltip title="Delete">
        <button
          type="button"
          className="icon-btn"
          onClick={() => deleteModalShow(record.id)}
        >
          <i className="fas fa-trash-alt text-danger" />
        </button>
      </Tooltip>
    </div>
  );

  const columns = [
    {
      title: "Sl No",
      key: "slNo",
      width: 90,
      render: (_, __, index) => pageState.skip + index + 1,
    },
    { title: "Name", dataIndex: "name", key: "name", width: 200 },
    { title: "Address", dataIndex: "address", key: "address", width: 250, ellipsis: true },
    { title: "Email", dataIndex: "email", key: "email", width: 150 },
    { title: "Mobile", dataIndex: "phone", key: "phone", width: 150 },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
      render: renderAction,
    },
  ];

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
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12">
                    <div className="table-button-group ms-auto justify-content-end w-100 d-flex gap-1 mb-2">
                      <Tooltip title="Export to PDF">
                        <button
                          type="button"
                          className="table-export-btn"
                          onClick={handleExportPDF}
                        >
                          <i className="far fa-file-pdf d-flex f-s-20"></i>
                        </button>
                      </Tooltip>
                      <Tooltip title="Export to Excel">
                        <button
                          type="button"
                          className="table-export-btn"
                          onClick={handleExportExcel}
                        >
                          <i className="far fa-file-excel d-flex f-s-20"></i>
                        </button>
                      </Tooltip>
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

                <div className="p-3 border-bottom" style={{ position: "relative", zIndex: 1 }}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label mb-1">Search</label>
                      <input
                        className="form-control"
                        placeholder="Search..."
                        value={pageState.searchKey}
                        onChange={(e) =>
                          setPageState({ ...pageState, searchKey: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-auto">
                      <div className="d-flex gap-2">
                        <Button type="primary" onClick={handleFilter}>
                          Search
                        </Button>
                        <Button onClick={handleReset}>Clear</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="">
                  <div className="bg_succes_table_head rounded_table">
                    <Table
                      columns={columns}
                      dataSource={customerData}
                      rowKey="id"
                      loading={isLoading}
                      pagination={{
                        current: pageState.skip / pageState.take + 1,
                        pageSize: pageState.take,
                        total: totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "15", "25", "50"],
                        onChange: handlePageChange,
                        onShowSizeChange: handlePageChange,
                      }}
                      scroll={{ x: 1100 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

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
        </>
      )}
    </React.Fragment>
  );
}

export default AllCustomers;
