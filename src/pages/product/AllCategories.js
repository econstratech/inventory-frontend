import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DataTable, { createTheme } from "react-data-table-component";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Collapse, Dropdown, Modal, OverlayTrigger } from "react-bootstrap";
import "handsontable/dist/handsontable.full.min.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
  url,
} from "../../environment/AxiosInstance";
import { UserAuth } from "../auth/Auth";
import Loader from "../landing/loder/Loader";
import { process } from "@progress/kendo-data-query";
import { SuccessMessage } from "../../environment/ToastMessage";
import InventoryMasterPageTopBar from "../InventoryMaster/itemMaster/InventoryMasterPageTopBar";
import { PDFExport } from "@progress/kendo-react-pdf";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Tooltip } from "antd";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import CategoryStatusBar from "./CategoryStatusBar";

// registerAllModules();

function AllCategories() {
  const { isLoading, setIsLoading, Logout } = UserAuth();
  //for-data table
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [descriptionShow, setDescriptionShow] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  //delete modal
  const navigate = useNavigate();
  const deleteModalClose = () => setDeleteShow(false);
  //const deleteModalShow = () => setDeleteShow(true);
  //description modal
  const descriptionModalClose = () => {
    setDescriptionShow(false);
    setDescriptionData("");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 20,
    sort: [],
    filter: null,
  });
  const handleUpload = async () => {
    setIsLoading(true);
    if (!file) {
      alert("Please select a file first!");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await PrivateAxiosFile.post(
        "/category/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      SuccessMessage("Category Added successfully.");
      navigate("/category");
    } catch (error) {
      alert("Upload failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const TaskData = async () => {
      setIsLoading(true);
      PrivateAxios.get("product-category")
        .then((res) => {
          setData(res.data.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          if (err.response.data == 401) {
            Logout();
          }
        });
    };
    TaskData();
  }, []);

  const ActionCell = (props) => {
    const { dataItem } = props || {}; // Ensure props and dataItem exist
    if (!dataItem) return null;

    return (
      <td>
        <div className="d-flex gap-2">
          <Tooltip title="Edit">
            <Link
              to={{ pathname: `/edit-category/${dataItem.id}` }}
              state={{ data: dataItem }}
              className="me-1 icon-btn"
            >
              <i className="fas fa-pen"></i>
            </Link>
          </Tooltip>

          <Tooltip title="Delete">
            <button
              type="button"
              className="me-1 icon-btn"
              onClick={() => deleteModalShow(dataItem.id)}
            >
              <i class="fas fa-trash-alt text-danger f-s-14"></i>
            </button>
          </Tooltip>
        </div>
      </td>
    );
  };

  const deleteModalShow = (id) => {
    setDeleteId(id);
    setDeleteShow(true);
  };

  const handleDelete = () => {
    PrivateAxios.delete(`category/${deleteId}`)
      .then((res) => {
        setData(data.filter((item) => item.id !== deleteId));
        setDeleteShow(false);
        setDeleteId(null);
      })
      .catch((error) => {
        console.error("Error deleting data:", error);
        setDeleteShow(false);
        setDeleteId(null);
      });
  };

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
  const CustomSlNoCell = (props) => {
    const { dataIndex } = props;
    return <td>{dataIndex + 1}</td>; // Adjust for 1-based indexing
  };

  const CustomCell = (props) => {
    const { dataItem, field } = props;

    // Access the field value directly
    const value = dataItem[field];

    return (
      <td>
        <label className="badge badge-outline-active mb-0">
          <i className="fas fa-circle f-s-8 d-flex me-1"></i>Active
        </label>

        {/* {value} */}
      </td>
    );
  };

  const [openBulkUpload, setOpenBulkUpload] = useState(false);

  return (
    <React.Fragment>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <InventoryMasterPageTopBar />
          <CategoryStatusBar />
          <div className="p-4">
            <div className="card">
              <div className="card-body p-0">
                <div className="row align-items-center p-3">
                  <div className="col-lg-6 col-sm-12">
                    <div className="d-flex justify-content-start">
                      <Link
                        to="/add-new-category"
                        className="btn btn-sm btn-primary me-2"
                      >
                        <i className="fas fa-plus me-2"></i>
                        New Category
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

                  <div className="col-lg-6 col-sm-12">
                    <div className="table-button-group ms-auto justify-content-end w-100">
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
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <Collapse in={openBulkUpload}>
                    <div className="p-3" id="contentId">
                      <div className="card shadow-none border">
                        <div className="card-header">
                          <h5 className="card-title font-weight-medium">
                            Bulk Upload
                          </h5>
                        </div>
                        <div className="card-body pb-1">
                          <div className="row align-items-center">
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                              <div className="form-group ">
                                <label className="form-label">
                                  Upload Product Categories
                                </label>
                                <div className="custom-select-wrap">
                                  <input
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
                                <a
                                  href={url + "category.xlsx"}
                                  download={url + "category.xlsx"}
                                  class="btn btn-warning"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    id="Layer_1"
                                    data-name="Layer 1"
                                    viewBox="0 0 24 24"
                                    width={14}
                                    height={14}
                                    fill="currentColor"
                                    className="me-1"
                                  >
                                    <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
                                  </svg>
                                  Download Template
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="card-footer d-flex justify-content-end">
                          <button
                            type="button"
                            class="btn btn-exp-primary"
                            onClick={handleUpload}
                          >
                            Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  </Collapse>
                </div>

                <div className="col-12">
                  <div className="bg_succes_table_head rounded_table">
                    <PDFExport data={data} ref={pdfExportRef}>
                      <ExcelExport data={data} ref={excelExportRef}>
                        <Grid
                          data={process(data, dataState)} // Add fallback for undefined data
                          // filterable
                          sortable
                          scrollable="scrollable"
                          reorderable
                          resizable
                          {...dataState}
                          onDataStateChange={(e) => setDataState(e.dataState)}
                          loading={loading}
                          pageable={{ buttonCount: 3, pageSizes: true }}
                        >
                          <GridColumn
                            field="slno"
                            title="Sl No"
                            filterable={false}
                            locked={false}
                            cell={CustomSlNoCell}
                          />
                          <GridColumn
                            field="title"
                            title="Name"
                            filter="text"
                            filterable={false}
                            locked={false} // Locked column
                          />
                          <GridColumn
                            field="status"
                            title="Status"
                            cells={{
                              data: CustomCell,
                            }}
                            filterable={false}
                          />
                          <GridColumn
                            field="action"
                            title="Action"
                            filter="text"
                            filterable={false}
                            cell={ActionCell}
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
                type="reset"
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
              <div className="row">
                <div className="col-12">
                  <p className="mb-0 text-muted">{descriptionData}</p>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          {/* Description modal end */}
        </>
      )}
    </React.Fragment>
  );
}

export default AllCategories;
