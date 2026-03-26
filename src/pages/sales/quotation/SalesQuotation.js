import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "jspdf-autotable";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import moment from "moment";
import {
  // ErrorMessage,
  SuccessMessage,
} from "../../../environment/ToastMessage";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import Loader from "../../../environment/Loader";
import { exportExcel, exportPDF } from "../../../environment/exportTable";

import { Tooltip, Table as AntTable } from "antd";
import SalesQuotationPageTopBar from "./SalesQuotationPageTopBar";
// import SalesQuotationStatusBar from "./SalesQuotationStatusBar";

const STATUS_LABEL_TEXT = {
  2: "Active",
  3: "Pending Approval",
  4: "Sent to sales order",
  5: "Sent back to review",
  7: "Done",
  8: "Rejected",
  9: "Pending Dispatch",
};

function renderStatusBadge(status) {
  if (status === 2) {
    return (
      <label className="badge badge-outline-success mb-0">
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>Active
      </label>
    );
  }
  if (status === 3) {
    return (
      <label className="badge badge-outline-yellowGreen mb-0">
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>Pending Approval
      </label>
    );
  }
  if (status === 4) {
    return (
      <label className="badge badge-outline-accent mb-0">
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>Sent to sales order
      </label>
    );
  }
  if (status === 5) {
    return (
      <label className="badge badge-outline-green mb-0">
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>Sent back to review
      </label>
    );
  }
  if (status === 9) {
    return (
      <label className="badge badge-outline-meantGreen mb-0">
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>Pending Dispatch
      </label>
    );
  }
  if (status === 7) {
    return (
      <label className="badge badge-outline-success mb-0">
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>Done
      </label>
    );
  }
  if (status === 8) {
    return (
      <label className="badge badge-outline-danger mb-0">
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>Rejected
      </label>
    );
  }
  return <span className="text-muted">Unknown</span>;
}

function MypurchaseList() {
  const { isLoading, setIsLoading, getGeneralSettingssymbol, MatchPermission, companysettings } = UserAuth();

  const [lgShow, setLgShow] = useState(false);

  const [data, setData] = useState([]);

  const [remarks, setRemarks] = useState([]);
  const [pageState, setPageState] = useState({ skip: 0, take: 15, searchKey: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);

  // Status options for filter dropdown (stable references for react-select)
  const statusOptions = [
    { value: null, label: "All" },
    { value: 2, label: "Active" },
    { value: 3, label: "Pending Approval" },
    { value: 4, label: "Sent to sales order" },
    { value: 9, label: "Sent to floor manager" },
    { value: 5, label: "Sent back to review" },
    { value: 8, label: "Rejected" },
    // { value: 5, label: "Order Confirmed" },
    // { value: 6, label: "Fully Billed" },
    // { value: 7, label: "Done" },
    // { value: 8, label: "Rejected" },
  ];

  const [selectedStatus, setSelectedStatus] = useState(() =>
    statusOptions.find((opt) => opt.value === 2) || { value: 2, label: "Active" }
  );

  //managment review
  const showRemarks = async (ida) => {
    try {
      const response = await PrivateAxios.get(`/sales/getremarks/${ida}`);
      if (response.status === 200) {
        setRemarks(response.data?.data);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };

  const generatePDF = async (id, val) => {
    setIsLoading(true);
    try {
      // const filename = `purchase_order_${val}.pdf`;
      const response = await PrivateAxios.get(
        `sales/generatePDFForvendor/${id}`,
        {
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(url);
    } catch (error) {
      console.error("Error opening PDF:", error);
      // Optionally handle the error state
    } finally {
      setIsLoading(false);
    }
  };

  const ReferenceCell = (dataItem) =>
    MatchPermission(["Sales Quotation Edit"]) ? (
      <Link to={`/sales/${dataItem.id}`} className="k_table_link text-primary">
        {dataItem.reference}
      </Link>
    ) : (
      <span>{dataItem.reference}</span>
    );

  const TaskData = async (statusFilter = undefined, customPageState = null, customReferenceFilter = null, customDateRangeFilter = null) => {
    setIsLoading(true);
    // If statusFilter is explicitly passed (including null), use it. Otherwise use selectedStatus from state
    const statusToUse = statusFilter !== undefined ? statusFilter : selectedStatus?.value;
    const currentPageState = customPageState || pageState;
    const currentReferenceFilter = customReferenceFilter !== null ? customReferenceFilter : referenceNumberFilter;
    const currentDateRangeFilter = customDateRangeFilter !== null ? customDateRangeFilter : dateRangeFilter;
    
    const urlParams = new URLSearchParams({
      page: currentPageState.skip / currentPageState.take + 1,
      limit: currentPageState.take,
      ...(statusToUse !== null && statusToUse !== undefined && { status: statusToUse }),
      ...(currentPageState.searchKey && { search: currentPageState.searchKey }),
      ...(currentReferenceFilter && { reference_number: currentReferenceFilter }),
      ...(currentDateRangeFilter[0] && { expected_delivery_date_start: moment(currentDateRangeFilter[0]).format("YYYY-MM-DD") }),
      ...(currentDateRangeFilter[1] && { expected_delivery_date_end: moment(currentDateRangeFilter[1]).format("YYYY-MM-DD") })
    });
    
    // reset the data
    setData([]);
    
    PrivateAxios.get(`sales/all-sale-quotation?${urlParams.toString()}`)
      .then((res) => {
        const salesquotations = res.data.data || {};
        const rows = salesquotations.rows || [];
        setTotalCount(salesquotations.pagination?.total_records || 0);
        const currentPage = salesquotations.pagination?.current_page || 1;
        const perPage = salesquotations.pagination?.per_page || currentPageState.take;
        const stratingIndex = (currentPage - 1) * perPage;
        
        const transformedData = rows.map((item, index) => ({
          id: item.id,
          slNo: stratingIndex + index + 1,
          reference: item.reference_number,
          creationDate: moment(item.created_at).format("DD/MM/YYYY"),
          deliveryDate: moment(item.expected_delivery_date).format("DD/MM/YYYY"),
          customer: item.customer && item.customer?.name,
          salesPerson: item.createdBy?.name,
          storeName: item.warehouse?.name,
          total: `${getGeneralSettingssymbol}${item.total_amount}`,
          status: item.status,
          is_parent: item.is_parent,
          statusLabel: STATUS_LABEL_TEXT[item.status] || "Unknown",
        }));
        setData(transformedData);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("Error", err);
      });
  };
  
  useEffect(() => {
    // Load data with default status "Active" (value: 2) on initial page load
    TaskData(2);
  }, []);

  // Handle filter button click
  const handleFilter = () => {
    const newPageState = { ...pageState, skip: 0 }; // Reset to first page when filtering
    setPageState(newPageState);
    TaskData(selectedStatus.value, newPageState, null, null); // Pass null to use current filter values from state
  };

  // Handle reset button click – use the same option object from statusOptions so react-select displays "All"
  const handleReset = () => {
    const allOption = statusOptions.find((opt) => opt.value === null) || { value: null, label: "All" };
    const resetPageState = { skip: 0, take: 15, searchKey: "" };
    const resetReferenceFilter = "";
    const resetDateRangeFilter = [null, null];
    
    // Update state
    setSelectedStatus(allOption);
    setPageState(resetPageState);
    setReferenceNumberFilter(resetReferenceFilter);
    setDateRangeFilter(resetDateRangeFilter);
    
    // Call TaskData with reset values directly to avoid async state update issue
    TaskData(null, resetPageState, resetReferenceFilter, resetDateRangeFilter);
  };

  const handlePageChange = (page, pageSize) => {
    const newPageState = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    TaskData(selectedStatus.value, newPageState, null, null);
  };

  const handleStatusChange = async (id, sid) => {
    try {
      const response = await PrivateAxios.put(`sales/statuschange/${id}/${sid}`);
      // const jsonData = response.data;
      if (response.status == 200) {
        SuccessMessage("Status Changed Successfully.!");
        TaskData();
      }
    } catch (error) {
      console.error("Error changing status:", error);
    }

  };

  const exportColumns = [
    { name: "Sl No.", selector: (item) => item.slNo },
    { name: "Reference", selector: (item) => item.reference },
    { name: "Delivery Date", selector: (item) => item.deliveryDate },
    { name: "Creation Date", selector: (item) => item.creationDate },
    { name: "Customer", selector: (item) => item.customer },
    { name: "Store", selector: (item) => item.storeName },
    { name: "Sales Person", selector: (item) => item.salesPerson },
    { name: "Total", selector: (item) => item.total },
    { name: "Status", selector: (item) => item.statusLabel },
  ];

  const handleExportPDF = () => {
    exportPDF(exportColumns, data, "Sales Quotations");
  };

  const handleExportExcel = () => {
    exportExcel(exportColumns, data, "sales-quotations");
  };

  const ActionCell = (dataItem) => {
    const total = parseFloat(String(dataItem.total || "").replace(getGeneralSettingssymbol, ""));

    return (
      <div className="d-flex gap-2 flex-wrap">
        {MatchPermission(["Sales Quotation Edit"]) && [2, 3, 5].includes(dataItem.status) ? (
          <Tooltip title="Edit">
            <Link
              to={{ pathname: `/sales/${dataItem.id}` }}
              state={{ data: dataItem }}
              className="me-1 icon-btn"
            >
              <i className="fas fa-pen d-flex"></i>
            </Link>
          </Tooltip>
        ) : null}
        {[4, 5, 8].includes(dataItem.status) && (
          <Tooltip title="Show Managment Remarks">
            <button
              type="button"
              className="me-1 icon-btn"
              onClick={() => {
                setLgShow(true);
                showRemarks(dataItem.id);
              }}
            >
              <i className="fas fa-info-circle"></i>
            </button>
          </Tooltip>
        )}
        <Tooltip title="View Pdf">
          <button
            type="button"
            className="me-1 icon-btn"
            onClick={() => generatePDF(dataItem.id, dataItem.reference)}
          >
            <i className="fas fa-eye d-flex"></i>
          </button>
        </Tooltip>

        {[2, 3, 5].includes(dataItem.status) && (
          <Tooltip title="Send to management for approval">
            <button
              type="button"
              className="me-1 icon-btn"
              style={{ cursor: "pointer" }}
              onClick={() => handleStatusChange(dataItem.id, 3)}
            >
              <i className="fas fa-check d-flex"></i>
            </button>
          </Tooltip>
        )}

        {dataItem.status === 2 &&
          total &&
          companysettings &&
          companysettings.min_sale_amount &&
          parseFloat(total) < parseFloat(companysettings.min_sale_amount) && (
            <Tooltip title="Send to floor Manager">
              <button
                type="button"
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleStatusChange(dataItem.id, 9)}
              >
                <i className="fas fa-share-square"></i>
              </button>
            </Tooltip>
          )}
      </div>
    );
  };

  const tableColumns = [
    { title: "Sl No.", dataIndex: "slNo", key: "slNo", width: 80 },
    {
      title: "Reference No.",
      dataIndex: "reference",
      key: "reference",
      width: 120,
      render: (_, record) => ReferenceCell(record),
    },
    { title: "Delivery Date", dataIndex: "deliveryDate", key: "deliveryDate", width: 130 },
    { title: "Creation Date", dataIndex: "creationDate", key: "creationDate", width: 130 },
    { title: "Customer", dataIndex: "customer", key: "customer", width: 160 },
    { title: "Store", dataIndex: "storeName", key: "storeName", width: 140 },
    { title: "Sales Person", dataIndex: "salesPerson", key: "salesPerson", width: 160 },
    { title: "Total", dataIndex: "total", key: "total", width: 120 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (_, record) => renderStatusBadge(record.status),
    },
    {
      title: "Action",
      key: "action",
      width: 220,
      fixed: "right",
      render: (_, record) => ActionCell(record),
    },
  ];

  return (
    <React.Fragment>
      {isLoading && <Loader />}
      <SalesQuotationPageTopBar />
      {/* <SalesQuotationStatusBar /> */}

      <div className="bg-white border-bottom">
        <div className="d-flex gap-3 px-4 justify-content-between align-items-center py-3">
          <div className="d-flex gap-3 align-items-center">
            {/* Filter section */}
            <div style={{ minWidth: "200px" }}>
              <label className="form-label mb-1 f-s-14 fw-medium">Filter by Status</label>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statusOptions}
                isSearchable={false}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "38px",
                  }),
                }}
              />
            </div>
            <div style={{ minWidth: "200px" }}>
              <label className="form-label mb-1 f-s-14 fw-medium">Filter by Reference Number</label>
              <input
                type="text"
                name="reference_number"
                className="form-control"
                placeholder="Reference number"
                value={referenceNumberFilter}
                onChange={(e) => setReferenceNumberFilter(e.target.value)}
                style={{ height: "38px" }}
              />
            </div>
            <div style={{ minWidth: "200px" }}>
              <label className="form-label mb-1 f-s-14 fw-medium">Filter by Delivery Date</label>
              <style>
                {`
                  .delivery-date-picker-wrapper .react-datepicker-wrapper,
                  .delivery-date-picker-wrapper .react-datepicker__input-container {
                    width: 100%;
                    height: 38px;
                  }
                  .delivery-date-picker-wrapper .react-datepicker__input-container input {
                    height: 38px !important;
                  }
                `}
              </style>
              <div className="delivery-date-picker-wrapper">
                <DatePicker
                  selected={dateRangeFilter[0]}
                  onChange={(update) => {
                    setDateRangeFilter(update);
                  }}
                  startDate={dateRangeFilter[0]}
                  endDate={dateRangeFilter[1]}
                  selectsRange
                  isClearable
                  placeholderText="Select date range"
                  className="form-control"
                  dateFormat="dd-MM-yyyy"
                  name="expected_delivery_date"
                />
              </div>
            </div>
            <div className="d-flex gap-2 align-items-end">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleFilter}
                style={{ height: "38px", marginTop: "20px" }}
              >
                <i className="fas fa-filter me-2"></i>
                Filter
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleReset}
                style={{ height: "38px" }}
              >
                <i className="fas fa-redo me-2"></i>
                Reset
              </button>
            </div>
           
          </div>
          <div className="d-flex ms-auto gap-3">
            <div className="line"></div>
            <div className="d-flex justify-content-center align-items-center gap-2">
            {MatchPermission(["Quotation Create Sales"]) ?
              <Link to="/sales/new" className="btn btn-exp-primary btn-sm">
                <i className="fas fa-plus"></i>
                <span className="ms-2">Create Sale Order</span>
              </Link>
              :""}
            </div>
          </div>
        </div>
      </div>

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              {/* <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                <div className="table-button-group mb-2 ms-auto d-flex gap-1">
                  <Tooltip title="Export to PDF">
                    <button type="button" className="table-export-btn" onClick={handleExportPDF}>
                      <i className="far fa-file-pdf d-flex f-s-20"></i>
                    </button>
                  </Tooltip>
                  <Tooltip title="Export to Excel">
                    <button type="button" className="table-export-btn" onClick={handleExportExcel}>
                      <i className="far fa-file-excel d-flex f-s-20"></i>
                    </button>
                  </Tooltip>
                </div>
              </div> */}
              <div className="bg_succes_table_head rounded_table">
                <AntTable
                  rowKey="id"
                  dataSource={data}
                  columns={tableColumns}
                  loading={isLoading}
                  pagination={{
                    current: Math.floor(pageState.skip / pageState.take) + 1,
                    pageSize: pageState.take,
                    total: totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 15, 25, 50],
                    onChange: handlePageChange,
                    onShowSizeChange: handlePageChange,
                  }}
                  scroll={{ x: 1500 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description modal end */}
      <Modal
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={lgShow}
        onHide={() => {
          setLgShow(false);
          setRemarks([]);
        }}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Management Remarks
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {remarks && remarks.length > 0 ? (
            <div className="remarks-container">
              {remarks.map((remark, index) => {
                // const referenceNumber = remark.reference_number || remarkData.reference_number || 'N/A';
                const remarksContent = remark.remarks || '';
                const userName = remark.createdBy?.name || remark.createdBy?.email ||'Unknown User';
                const createdAt = remark.created_at || remark.createdAt;
                
                return (
                  <div key={remark.id || index} className="mb-4 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        {/* <h6 className="mb-2 fw-semibold text-primary">
                          {referenceNumber}
                        </h6> */}
                        <div className="d-flex gap-3 align-items-center flex-wrap">
                          <span className="text-muted small">
                            <i className="fas fa-user me-1"></i>
                            {userName}
                          </span>
                          {createdAt && (
                            <span className="text-muted small">
                              <i className="fas fa-calendar-alt me-1"></i>
                              {moment(createdAt).format("DD-MM-YYYY hh:mm A")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div 
                      className="remarks-content mt-3 p-3 bg-light rounded"
                      style={{ minHeight: "60px", lineHeight: "1.6" }}
                    >
                      {remarksContent ? (
                        <div dangerouslySetInnerHTML={{ __html: remarksContent }}></div>
                      ) : (
                        <p className="text-muted mb-0">No remarks content available</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-comment-slash fa-3x text-muted mb-3"></i>
              <p className="text-muted">No remarks available</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setLgShow(false);
              setRemarks([]);
            }}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

export default MypurchaseList;
