import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useNavigate } from "react-router-dom";
import { Collapse, Modal } from "react-bootstrap";
import "handsontable/dist/handsontable.full.min.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
  url,
} from "../../environment/AxiosInstance";
import { UserAuth } from "../auth/Auth";
import Loader from "../landing/loder/Loader";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import InventoryMasterPageTopBar from "../InventoryMaster/itemMaster/InventoryMasterPageTopBar";
import { Tooltip, Table, Switch } from "antd";
// import CategoryStatusBar from "./CategoryStatusBar";
import { exportExcel, exportPDF } from "../../environment/exportTable";
import DeleteModal from "../CommonComponent/DeleteModal";

function AllCategories() {
  const { isLoading, setIsLoading, Logout } = UserAuth();
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editShow, setEditShow] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryTitle, setEditCategoryTitle] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [descriptionShow, setDescriptionShow] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const navigate = useNavigate();
  const deleteModalClose = () => setDeleteShow(false);
  const editModalClose = () => {
    setEditShow(false);
    setEditCategoryId(null);
    setEditCategoryTitle("");
  };

  const descriptionModalClose = () => {
    setDescriptionShow(false);
    setDescriptionData("");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const [pageState, setPageState] = useState({
    skip: 0,
    take: 15,
  });

  const fetchCategories = async (customPageState = null, customFilters = null) => {
    setIsLoading(true);
    try {
      const currentPageState = customPageState || pageState;
      const filters = customFilters || {
        status: statusFilter,
        title: titleFilter,
      };
      const urlParams = new URLSearchParams({
        page: currentPageState.skip / currentPageState.take + 1,
        limit: currentPageState.take,
        ...(filters.status !== "" && { status: filters.status }),
        ...(String(filters.title || "").trim() && { title: String(filters.title).trim() }),
      });
      const res = await PrivateAxios.get(`product-category?${urlParams.toString()}`);
      const payload = res.data?.data || {};
      const rows = Array.isArray(payload?.rows) ? payload.rows : [];
      const pagination = payload?.pagination || {};

      setData(rows);
      setTotalCount(Number(pagination?.total_records) || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        Logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      await PrivateAxiosFile.post("/category/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
    fetchCategories();
  }, []);

  const deleteModalShow = (id) => {
    setDeleteId(id);
    setDeleteShow(true);
  };

  const editModalShow = (record) => {
    setEditCategoryId(record?.id ?? null);
    setEditCategoryTitle(record?.title ?? "");
    setEditShow(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    PrivateAxios.delete(`product-category/${deleteId}`)
      .then((res) => {
        SuccessMessage(res?.data?.message || "Category deleted successfully.");
        fetchCategories(pageState);
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        ErrorMessage(
          error?.response?.data?.message || "Failed to delete category."
        );
        if (error?.response?.status === 401) {
          Logout();
        }
      })
      .finally(() => {
        setDeleteShow(false);
        setDeleteId(null);
      });
  };

  const exportColumns = [
    { name: "Sl No.", selector: () => {} },
    { name: "Name", selector: (item) => item.title ?? "" },
    { name: "Status", selector: (item) => (Number(item.status) === 1 ? "Active" : "Inactive") },
  ];

  const handleExportPDF = () => {
    if (!data?.length) {
      alert("No data available for export.");
      return;
    }
    exportPDF(exportColumns, data, "Categories");
  };

  const handleExportExcel = () => {
    if (!data?.length) {
      alert("No data available for export.");
      return;
    }
    exportExcel(exportColumns, data, "categories");
  };

  const renderStatus = (value) => (
    <label
      className={`badge mb-0 ${Number(value) === 1 ? "badge-outline-active" : "badge-outline-danger"}`}
    >
      <i className="fas fa-circle f-s-8 d-flex me-1"></i>
      {Number(value) === 1 ? "Active" : "Inactive"}
    </label>
  );

  const handleStatusToggle = async (record, checked) => {
    const nextStatus = checked ? 1 : 0;
    const previousStatus = Number(record.status) === 1 ? 1 : 0;

    setData((prev) =>
      prev.map((item) =>
        String(item.id) === String(record.id)
          ? { ...item, status: nextStatus }
          : item
      )
    );
    setUpdatingStatusId(record.id);

    try {
      const res = await PrivateAxios.put(
        `/product-category/${record.id}`,
        { status: nextStatus }
      );
      SuccessMessage(
        res?.data?.message ||
          `Category marked as ${nextStatus === 1 ? "Active" : "Inactive"}.`
      );
    } catch (error) {
      setData((prev) =>
        prev.map((item) =>
          String(item.id) === String(record.id)
            ? { ...item, status: previousStatus }
            : item
        )
      );
      ErrorMessage(error?.response?.data?.message || "Failed to update category status.");
      if (error?.response?.status === 401) {
        Logout();
      }
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleEditCategorySubmit = async () => {
    const trimmedTitle = String(editCategoryTitle || "").trim();
    if (!editCategoryId) return;
    if (!trimmedTitle) {
      ErrorMessage("Category title is required.");
      return;
    }
    setEditSubmitting(true);
    try {
      const res = await PrivateAxios.put(
        `/product-category/${editCategoryId}`,
        { title: trimmedTitle }
      );
      setData((prev) =>
        prev.map((item) =>
          String(item.id) === String(editCategoryId)
            ? { ...item, title: trimmedTitle }
            : item
        )
      );
      SuccessMessage(res?.data?.message || "Category title updated successfully.");
      editModalClose();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to update category title.");
      if (error?.response?.status === 401) {
        Logout();
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Sl No.",
      key: "slNo",
      width: 90,
      render: (_, __, index) =>
        pageState.skip + index + 1,
    },
    { title: "Name", dataIndex: "title", key: "title", width: 240 },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 140,
      render: renderStatus,
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_, record) => (
        <div className="d-flex align-items-center gap-2">
          <Switch
            checked={Number(record.status) === 1}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            loading={String(updatingStatusId) === String(record.id)}
            onChange={(checked) => handleStatusToggle(record, checked)}
          />
          <Tooltip title="Edit Category">
            <button
              type="button"
              className="icon-btn"
              onClick={() => editModalShow(record)}
            >
              <i className="fas fa-pen"></i>
            </button>
          </Tooltip>
          <Tooltip title="Delete Category">
            <button
              type="button"
              className="icon-btn text-danger"
              onClick={() => deleteModalShow(record.id)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const [openBulkUpload, setOpenBulkUpload] = useState(false);

  const handleTableChange = (pagination) => {
    const newPageState = {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    };
    setPageState(newPageState);
    fetchCategories(newPageState);
  };

  const handleFilter = () => {
    const newPageState = {
      skip: 0,
      take: pageState.take,
    };
    setPageState(newPageState);
    fetchCategories(newPageState, {
      status: statusFilter,
      title: titleFilter,
    });
  };

  const handleResetFilter = () => {
    const newPageState = {
      skip: 0,
      take: 15,
    };
    setStatusFilter("");
    setTitleFilter("");
    setPageState(newPageState);
    fetchCategories(newPageState, {
      status: "",
      title: "",
    });
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <InventoryMasterPageTopBar />
          {/* <CategoryStatusBar /> */}
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
                        type="button"
                        className="btn btn-exp-purple-outline btn-sm"
                        onClick={() => setOpenBulkUpload(!openBulkUpload)}
                        aria-controls="contentId"
                        aria-expanded={openBulkUpload}
                      >
                        <i className="bi bi-upload me-2"></i>Bulk Upload
                      </button>
                    </div>
                  </div>

                  <div className="col-lg-6 col-sm-12">
                    <div className="table-button-group ms-auto justify-content-end w-100 d-flex gap-1">
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
                </div>

                <div className="col-12">
                  <div className="p-3 border-top border-bottom">
                    <div className="row g-3 align-items-end">
                      <div className="col-md-3">
                        <label className="form-label mb-1">Filter by Status</label>
                        <select
                          className="form-select"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          style={{ height: "38px" }}
                        >
                          <option value="">All</option>
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label mb-1">Filter by Category Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Category name"
                          value={titleFilter}
                          onChange={(e) => setTitleFilter(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleFilter();
                            }
                          }}
                          style={{ height: "38px" }}
                        />
                      </div>
                      <div className="col-md-auto">
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-exp-primary"
                            style={{ height: "38px" }}
                            onClick={handleFilter}
                          >
                            <i className="fas fa-filter me-2"></i>
                            Filter
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            style={{ height: "38px" }}
                            onClick={handleResetFilter}
                          >
                            <i className="fas fa-redo me-2"></i>
                            Reset
                          </button>
                        </div>
                      </div>
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
                                  className="btn btn-warning"
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
                  </Collapse>
                </div>

                <div className="col-12">
                  <div className="bg_succes_table_head rounded_table">
                    <Table
                      rowKey="id"
                      columns={columns}
                      dataSource={data}
                      loading={isLoading}
                      pagination={{
                        current: pageState.skip / pageState.take + 1,
                        pageSize: pageState.take,
                        total: totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "15", "25", "50"],
                        onChange: (page, pageSize) =>
                          handleTableChange({ current: page, pageSize }),
                        onShowSizeChange: (page, pageSize) =>
                          handleTableChange({ current: page, pageSize }),
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                      }}
                      scroll={{ x: 700 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DeleteModal
            show={deleteShow}
            handleClose={deleteModalClose}
            onDelete={handleDelete}
            title="Delete Category"
            message="Are you sure you want to delete this category? This action cannot be undone."
          />

          <Modal
            show={editShow}
            onHide={editModalClose}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="form-group mb-0">
                <label className="form-label">Category Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter category title"
                  value={editCategoryTitle}
                  onChange={(e) => setEditCategoryTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEditCategorySubmit();
                    }
                  }}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={editModalClose}
                disabled={editSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-exp-primary"
                onClick={handleEditCategorySubmit}
                disabled={editSubmitting}
              >
                {editSubmitting ? "Saving..." : "Save"}
              </button>
            </Modal.Footer>
          </Modal>

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
        </>
      )}
    </React.Fragment>
  );
}

export default AllCategories;
