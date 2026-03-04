import React, { useEffect, useState } from "react";
import Select from "react-select";
// import { FaStar } from "react-icons/fa";
// import jsPDF from "jspdf";
import "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import DataTable, { createTheme } from "react-data-table-component";
import { Link } from "react-router-dom";
import moment from "moment";  
import {
  // Dropdown,
  Modal,
  // Overlay,
  // OverlayTrigger,
  // Popover,
} from "react-bootstrap";
// import Handsontable from "handsontable/base";
// import { HotTable } from "@handsontable/react";
// import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
// import { PrivateAxios, url } from "../../environment/AxiosInstance";
// import { UserAuth } from "../auth/Auth";
// import Loader from "../landing/loder/Loader";

// import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";

// import {
//   exportExcel,
//   exportPDF,
//   printTable,
// } from "../../environment/exportTable";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
// import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import { PrivateAxios } from "../../../environment/AxiosInstance";
// import { UserAuth } from "../../auth/Auth";
import Loader from "../../landing/loder/Loader";
import { SuccessMessage, ErrorMessage } from "../../../environment/ToastMessage";
import OperationsPageTopBar from "../OperationsPageTopBar";
import DeleteModal from "../../CommonComponent/DeleteModal";
import ConfirmModal from "../../CommonComponent/ConfirmModal";
// import CreateRfqStatusBar from "./CreateRfqStatusBar";

function MypurchaseList() {
  // const {
  //   isLoading,
  //   setIsLoading,
  //   Logout,
  //   MatchPermission,
  // } = UserAuth();
  
  // #region agent log
  // React.useEffect(() => {
  //   fetch('http://127.0.0.1:7242/ingest/9280eea7-b6c9-4578-b241-b25d1d820583',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MypurchaseList.js:53',message:'companysettings structure',data:{companysettings,hasMinimumPurchaseAmount:!!companysettings?.minimum_purchase_amount,minimum_purchase_amount:companysettings?.minimum_purchase_amount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // }, [companysettings]);
  // #endregion

  //for-data table
  // const [value, setValue] = useState(true);
  // const [grid, setGrid] = useState(false);

  // const [detailsShow, setDetailsShow] = useState(false);
  // const [deleteShow, setDeleteShow] = useState(false);
  // const [descriptionShow, setDescriptionShow] = useState(false);
  // const [descriptionData, setDescriptionData] = useState("");
  // const [tableData, setTableData] = useState([]);
  const [lgShow, setLgShow] = useState(false);
  // const [deleteId, setDeleteId] = useState(null);

  const [purchaseData, setPurchaseData] = useState([]);
  const [userDetails] = useState(JSON.parse(localStorage.getItem('auth_user')) || null);
  const [generalSettings, setGeneralSettings] = useState(null);


  const [isLoading, setIsLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });
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

  const handlePageChange = (event) => {
    const newPageState = {
      skip: event.page.skip,
      take: event.page.take,
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
            created_by: item.createdBy.name,
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
    if (userDetails) {
      setGeneralSettings(userDetails.company.generalSettings);
    }
  }, [userDetails]);

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

  const pdfExportRef = React.createRef();
  const excelExportRef = React.createRef();

  const handleExportPDF = () => {
    if (pdfExportRef.current) {
      pdfExportRef.current.save();
    }
  };

  const handleExportExcel = () => {
    if (purchaseData && purchaseData.length > 0) {
      excelExportRef.current.save();
    } else {
      alert("No data available for export.");
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

  // Reference Cell
  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span className="k_table_link">
            <Link to={`/purchase/${dataItem.id}`}>{dataItem.reference}</Link>
          </span>

          {/* {dataItem.is_parent === 1 && "   "}
          {dataItem.is_parent == 1 && <i
            className="fas fa-star"
            style={{ fontSize: "15px", color: "#007bff", cursor: "pointer" }}
          ></i>} */}

        </div>
      </td>
    );
  };

  // Action Cell
  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div className="d-flex gap-2">
          <Tooltip title="Edit">
            <Link
              to={{ pathname: `/purchase/${dataItem.id}` }}
              state={{ data: dataItem }}
              className="me-1 icon-btn"
            >
              <i className="fas fa-pen"></i>
              
            </Link>
          </Tooltip>
          {(dataItem.status === 5 || dataItem.status === 8) && (
            <Tooltip title="Show Managment Remarks">
              <button
                className="me-1 icon-btn"
                onClick={() => {
                  setLgShow(true);
                  showReview(dataItem.id);
                }}
              >
                <i className="fas fa-info-circle"></i>

              </button>
            </Tooltip>
          )}

          {dataItem.is_parent == 1 && dataItem.status == 2 && (
            <Tooltip title="Send Approval">
              <button
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleStatusChange(dataItem.id, 3)}
              >
                <i className="fas fa-check"></i>
                
              </button>
            </Tooltip>
          )}
          {dataItem.is_parent == 1 && 
          ((
            dataItem.status == 2 && dataItem.total_amount && generalSettings 
            && generalSettings.min_purchase_amount && parseFloat(dataItem.total_amount) < parseFloat(generalSettings.min_purchase_amount)) 
          || dataItem.status == 4)
          && (
              <Tooltip title="Send to Vendor">
              <button
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSendToVendorPOId(dataItem.id);
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
                generatePDF(dataItem.id, dataItem.reference_number)
              }
            >
               <i className="fas fa-print"></i>
            </button>
          </Tooltip>

          <Tooltip title="Cancel PO">
            <button
              className="me-1 icon-btn"
              style={{ cursor: "pointer" }}
              onClick={() => openCancelModal(dataItem.id)}
            >
              <i className="fas fa-trash"></i>
              
            </button>
          </Tooltip>

        </div>
      </td>
    );
  };
  const CustomCell = (props) => {
    const { dataItem, field } = props;

    // Access the field value directly
    const value = dataItem[field];
    return (
      <td>
        <label className="badge badge-outline-accent"><i className="fas fa-circle f-s-8 d-flex me-1"></i>{value}</label>

        {/* {value} */}
      </td>
    );
  };

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
              <Link to="/purchase/new" className="btn btn-exp-primary btn-sm" style={{ marginTop: "10px", height: "38px" }}>
                    <i className="fas fa-plus"></i><span className="ms-2">Create PO</span>
                </Link>
              {/* {MatchPermission(["Create Purchase RFQ"]) ?
                <Link to="/purchase/new" className="btn btn-exp-primary btn-sm" style={{ marginTop: "10px", height: "38px" }}>
                    <i className="fas fa-plus"></i><span className="ms-2">Create PO</span>
                </Link>
                :""} */}
            </div>
          </div>
        </div>
      </div>

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                <div className="table-button-group mb-2 ms-auto">

                  <GridToolbar className="border-0 gap-0">
                    <Tooltip title="Export to PDF">
                      <button type='button' className=" table-export-btn" onClick={handleExportPDF}>
                        <i className="far fa-file-pdf d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                    <Tooltip title=" Export to Excel">
                      <button type='button' className=" table-export-btn" onClick={handleExportExcel}>
                        <i className="far fa-file-excel d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                  </GridToolbar>
                </div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <PDFExport data={purchaseData} ref={pdfExportRef}>
                  <ExcelExport data={purchaseData} ref={excelExportRef} >
                    <Grid
                      data={purchaseData}
                      skip={pageState.skip}
                      take={pageState.take}
                      total={totalCount}
                      onPageChange={handlePageChange}
                      // filterable={false}
                      sortable
                      // scrollable="scrollable"
                      // reorderable
                      // resizable
                      // {...dataState}
                      onDataStateChange={(e) => setDataState(e.dataState)}
                      isLoading={isLoading}
                      pageable={{ buttonCount: 3, pageSizes: true }}
                    >
                      {/* Column Definitions */}

                      <GridColumn field="slNo" title="sl No." filterable={false} width="100px" locked={true} />
                      <GridColumn field="reference" title="reference" filterable={false} filter="text" cell={ReferenceCell} width="150px" />
                      <GridColumn field="vendor" title="vendor" filterable={false} filter="text" width="200px" />
                      <GridColumn field="created_by" title="created by" filterable={false} filter="text" width="200px" />
                      <GridColumn field="expected_arrival" title="Expected Arrival" filterable={false} filter="text" width="200px" format="{0:dd-MM-yyyy}" />
                      {/* <GridColumn field="orderDeadline" title="Order Deadline" filterable={false} filter="numeric" width="200px" /> */}
                      {/* <GridColumn field="sourceDocument" title="source Document" filterable={false} filter="text" width="200px" /> */}
                      <GridColumn field="total" title="total" filterable={false} filter="text" width="150px" />
                      <GridColumn
                        field="status_return"
                        title="status"
                        filterable={false}
                        filter="text"
                        width="150px"
                        // filterCell={CustomDropDownFilter}
                        cells={{
                          data: CustomCell
                        }}
                      />
                      <GridColumn title="action" filter="text" cell={ActionCell} filterable={false} width="250px" />
                    </Grid>
                  </ExcelExport>
                </PDFExport>



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
