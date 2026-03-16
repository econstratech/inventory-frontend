import React, { useEffect, useState } from "react";
import Select from "react-select";
// import { FaStar } from "react-icons/fa";
// import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import DataTable, { createTheme } from "react-data-table-component";
import { Link } from "react-router-dom";
import { UserAuth } from "../../auth/Auth";
import moment from "moment";  
import {
  Modal,
} from "react-bootstrap";
import "handsontable/dist/handsontable.full.min.css";

import { Tooltip, Table } from "antd";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import Loader from "../../landing/loder/Loader";
import { SuccessMessage, ErrorMessage } from "../../../environment/ToastMessage";
import OperationsPageTopBar from "../OperationsPageTopBar";
import DeleteModal from "../../CommonComponent/DeleteModal";
import ConfirmModal from "../../CommonComponent/ConfirmModal";

function MypurchaseList() {
  const [lgShow, setLgShow] = useState(false);
  const { MatchPermission, user } = UserAuth();

  const [purchaseData, setPurchaseData] = useState([]);
  const [generalSettings, setGeneralSettings] = useState(null);


  const [isLoading, setIsLoading] = useState(true);
  const [getReview, setreview] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({ skip: 0, take: 15, searchKey: "" });
  const [selectedStatus, setSelectedStatus] = useState({ value: 2, label: "Active" });
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);
  const [cancelModalShow, setCancelModalShow] = useState(false);
  const [cancelPOId, setCancelPOId] = useState(null);
  const [sendToVendorModalShow, setSendToVendorModalShow] = useState(false);
  const [sendToVendorPOId, setSendToVendorPOId] = useState(null);
  
  // Status options for filter dropdown
  const statusOptions = [
    { value: null, label: "All" },
    { value: 2, label: "Active" },
    { value: 3, label: "Pending Approval" },
    { value: 4, label: "Approved PO" },
    { value: 5, label: "Pending GRN" },
  ];

  const getStatusLabel = (status) => {
    switch (status) {
      case 2:
        return "Active";
      case 3:
        return "Pending Approval";
      case 4:
        return "Approved PO";
      case 5:
        return "Pending GRN";
      case 6:
        return "Received";
      case 10:
        return "Completed";
      case 8:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const handlePageChange = (page, pageSize) => {
    const newPageState = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    // Fetch data with updated pagination and current filter
    FetchPurchaseData(selectedStatus.value, newPageState);
  };

  //managment review
  const showReview = async (ida) => {
    try {
      const response = await PrivateAxios.get(`/purchase/getremarks/${ida}`);
      if (response.status === 200) {
        setreview(response.data);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };
  //pdf
  const generatePDF = async (id, val) => {
    setIsLoading(true);
    try {
      // Assuming the filename is constructed as `purchase_order_${val}.pdf`
      // const filename = `purchase_order_${val}.pdf`;
      const response = await PrivateAxios.get(
        `purchase/generatePDFForvendor/${id}`,
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

  const FetchPurchaseData = async (statusFilter = null, customPageState = null) => {
    setIsLoading(true);
    const statusToUse = statusFilter !== null ? statusFilter : selectedStatus.value;
    const currentPageState = customPageState || pageState;
    const urlParams = new URLSearchParams({
      page: currentPageState.skip / currentPageState.take + 1,
      limit: currentPageState.take,
      status: statusToUse,
      ...(currentPageState.searchKey && { search: currentPageState.searchKey }),
      ...(referenceNumberFilter && { reference_number: referenceNumberFilter }),
      ...(dateRangeFilter[0] && { expected_arrival_start: moment(dateRangeFilter[0]).format("YYYY-MM-DD") }),
      ...(dateRangeFilter[1] && { expected_arrival_end: moment(dateRangeFilter[1]).format("YYYY-MM-DD") })
    });
    // reset the purchase data
    setPurchaseData([]);
    PrivateAxios.get(`purchase/all-purchase-rfq?${urlParams.toString()}`)
      .then((res) => {
        const purchaseData = res.data.data || [];
        setTotalCount(purchaseData.pagination.total_records);
        let slNo = (purchaseData.pagination.current_page -1) * purchaseData.pagination.per_page;
        const transformedData = purchaseData.rows.map((item, index) => {

          return {
            id: item.id,
            slNo: ++slNo,
            reference: item.reference_number,
            vendor: item.vendor.vendor_name,
            buyer: item.createdBy.name,
            expected_arrival: moment(item.expected_arrival).format("DD-MM-YYYY"),
            createdByUser: item.createdBy,
            // orderDeadline: getOrderDeadline(item.order_dateline, item.status),
            // sourceDocument: item.source_document,
            total: `₹ ${item.total_amount}`,
            total_amount: item.total_amount, // Store raw total_amount for comparison
            is_parent: item.is_parent,
            status: item.status,
            status_return: getStatusLabel(item.status),
          };
        });
        setPurchaseData(transformedData);

        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    FetchPurchaseData();
  }, []);

  // Set General Settings
  useEffect(() => {
    if (user) {
      setGeneralSettings(user.company.generalSettings);
    }
  }, [user]);

  // Handle filter button click
  const handleFilter = () => {
    setPageState({ ...pageState, skip: 0 }); // Reset to first page when filtering
    FetchPurchaseData(selectedStatus.value);
  };

  // Handle reset button click
  const handleReset = () => {
    setSelectedStatus({ value: 2, label: "Active" });
    const newPageState = {
      skip: 0,
      take: 15,
      searchKey: "",
    };
    setPageState(newPageState);
    setReferenceNumberFilter("");
    setDateRangeFilter([null, null]);
    FetchPurchaseData(2, newPageState);
  };

  const handleStatusChange = async (id, sid) => {
    const allowedStatuses = [3, 5, 9];
    if (!allowedStatuses.includes(parseInt(sid))) {
      ErrorMessage("Invalid status change.!");
      return;
    }
    const response = await PrivateAxios.put(
      `purchase/statuschange/${id}/${sid}`
    );
    let message = "";
    if (parseInt(sid) === 3){
      message = "Approval Sent Successfully.!";
    } else if (parseInt(sid) === 5){
      message = "Sent to Vendor Successfully.!";
    } else if (parseInt(sid) === 9){
      message = "Order Confirmed Successfully.!";
    }

    // console.log("Success Message: ", message);

    if (response.status == 200) {
      SuccessMessage(message);
      FetchPurchaseData();
    }
  };

  // Handle Close Cancel Modal
  const handleCloseCancelModal = () => {
    setCancelModalShow(false);
    setCancelPOId(null);
  };

  // Handle Cancel PO
  const handleCancelPO = async (id) => {
    try {
      const payload = {};
      const response = await PrivateAxios.post(`purchase/cancel-purchase/${id}`, payload);

      if (response.status === 200) {
        SuccessMessage("Purchase Order cancelled successfully.");
        FetchPurchaseData();
      }
    } catch (error) {
      console.error("There was an error cancelling the PO!", error);
      ErrorMessage("Failed to cancel Purchase Order.");
    } finally {
      handleCloseCancelModal();
    }
  };

  const openCancelModal = (id) => {
    setCancelPOId(id);
    setCancelModalShow(true);
  };

  const renderReference = (_, record) => (
    <span className="k_table_link">
      <Link to={`/purchase/${record.id}`}>{record.reference}</Link>
    </span>
  );

  const renderAction = (_, record) => (
    <div className="d-flex gap-2">
        {MatchPermission(["Update PO"]) ?
          <Tooltip title="Edit">
            <Link
              to={{ pathname: `/purchase/${record.id}` }}
              state={{ data: record }}
              className="me-1 icon-btn"
            >
              <i className="fas fa-pen"></i>
              
            </Link>
          </Tooltip>
        :""}
          {(record.status === 5 || record.status === 8) && (
            <Tooltip title="Show Managment Remarks">
              <button
                className="me-1 icon-btn"
                onClick={() => {
                  setLgShow(true);
                  showReview(record.id);
                }}
              >
                <i className="fas fa-info-circle"></i>

              </button>
            </Tooltip>
          )}

          {MatchPermission(["Send To Management (PO)"]) && record.is_parent == 1 && record.status == 2 && (
            <Tooltip title="Send Approval">
              <button
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleStatusChange(record.id, 3)}
              >
                <i className="fas fa-check"></i>
                
              </button>
            </Tooltip>
          )}
          {MatchPermission(["Send to Vendor"]) && record.is_parent == 1 && 
          ((
            record.status == 2 && record.total_amount && generalSettings 
            && generalSettings.min_purchase_amount && parseFloat(record.total_amount) < parseFloat(generalSettings.min_purchase_amount)) 
          || record.status == 4)
          && (
              <Tooltip title="Send to Vendor">
              <button
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSendToVendorPOId(record.id);
                  setSendToVendorModalShow(true);
                }}
              >
                <i className="fas fa-share-square"></i>
                
              </button>
            </Tooltip>
          )}
          {/* {dataItem.status == 4 && (
            <Tooltip title="Confirm Order">
              <button
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleStatusChange(dataItem.id, 9)}
              >
                <i className="fas fa-external-link-alt"></i>
                
              </button>
            </Tooltip>
          )} */}
          {/* <OverlayTrigger
            trigger="click"
            rootClose
            placement="auto"
            overlay={
              <Popover id="statusChange" className="print-wrap">
                <div className="print-list">
                  <div
                    className="print-list-item"
                    onClick={() =>
                      generatePDF(dataItem.id, dataItem.reference_number)
                    }
                  >
                    <span>Purchase Order</span>
                  </div>
                </div>
              </Popover>
            }
          > 
            <button
              className="me-1 icon-btn"
              onClick={() => PrintsetId(dataItem.id)}              
            >
              <i className="fas fa-print"></i>
            </button>
          </OverlayTrigger>*/}
          <Tooltip title="Print Purchase Order">
            <button
              className="me-1 icon-btn"
              style={{ cursor: "pointer" }}
              onClick={() =>
                generatePDF(record.id, record.reference_number)
              }
            >
               <i className="fas fa-print"></i>
            </button>
          </Tooltip>


          {(MatchPermission(["Delete PO"]) || record.createdByUser.id === user.id) && (
          <Tooltip title="Cancel PO">
            <button
              className="me-1 icon-btn"
              style={{ cursor: "pointer" }}
              onClick={() => openCancelModal(record.id)}
            >
              <i className="fas fa-trash"></i>
              
            </button>
          </Tooltip>
          )}
    </div>
  );

  const renderStatus = (value) => (
    <label className="badge badge-outline-accent">
      <i className="fas fa-circle f-s-8 d-flex me-1"></i>{value}
    </label>
  );

  const columns = [
    { title: "Sl No.", dataIndex: "slNo", key: "slNo", width: 100 },
    { title: "Reference", dataIndex: "reference", key: "reference", width: 150, render: renderReference },
    { title: "Vendor", dataIndex: "vendor", key: "vendor", width: 200 },
    { title: "Created By", dataIndex: "createdByUser", key: "createdByUser", width: 200 },
    { title: "Expected Arrival", dataIndex: "expected_arrival", key: "expected_arrival", width: 200 },
    { title: "Total", dataIndex: "total", key: "total", width: 150 },
    { title: "Status", dataIndex: "status_return", key: "status_return", width: 150, render: renderStatus },
    { title: "Action", key: "action", width: 250, render: renderAction },
  ];

  return (
    <React.Fragment>
      {isLoading && <Loader />}

      <OperationsPageTopBar />
      {/* <CreateRfqStatusBar /> */}
      
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
            <div style={{ minWidth: "250px" }}>
              <label className="form-label mb-1 f-s-14 fw-medium">Filter by Expected Arrival</label>
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
                name="expected_arrival"
                style={{ display: "block" }}
              />
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
          <div className='d-flex ms-auto gap-3'>
            <div className="d-flex justify-content-center align-items-center gap-2">
              {MatchPermission(["Create PO"]) ?

                <Link to="/purchase/new" className="btn btn-exp-primary btn-sm" style={{ marginTop: "10px", height: "38px" }}>
                    <i className="fas fa-plus"></i><span className="ms-2">Create PO</span>
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
              <div className="bg_succes_table_head rounded_table">
                <Table
                  columns={columns}
                  dataSource={purchaseData}
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
                  scroll={{ x: 1400 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>



      <Modal
        size="lg"
        backdrop="static"
        keyboard={false}
        centered
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {getReview.remark != null ? getReview.remark.reference_number : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          dangerouslySetInnerHTML={{
            __html: getReview.remarks != "" ? getReview.remarks : "",
          }}
        ></Modal.Body>
      </Modal>

      <DeleteModal
        show={cancelModalShow}
        handleClose={handleCloseCancelModal}
        onDelete={() => cancelPOId != null && handleCancelPO(cancelPOId)}
        title="Cancel Purchase Order"
        message="Are you sure you want to cancel this Purchase Order?"
      />

      <ConfirmModal
        show={sendToVendorModalShow}
        handleClose={() => {
          setSendToVendorModalShow(false);
          setSendToVendorPOId(null);
        }}
        onConfirm={() => {
          if (sendToVendorPOId != null) {
            handleStatusChange(sendToVendorPOId, 5);
            setSendToVendorModalShow(false);
            setSendToVendorPOId(null);
          }
        }}
        title="Send to Vendor"
        message="Are you sure you want to send this Purchase Order to the vendor?"
        confirmLabel="Send"
      />
    </React.Fragment>
  );
}

export default MypurchaseList;
