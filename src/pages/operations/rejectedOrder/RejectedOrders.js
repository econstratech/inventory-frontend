import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import { Tooltip, Table as AntTable } from "antd";

import "react-datepicker/dist/react-datepicker.css";
import "handsontable/dist/handsontable.full.min.css";


import { PrivateAxios } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";


import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
// import PORemarksModalComponent from "../../ModalComponents/PORemarksModalComponent";
import OperationsPageTopBar from "../OperationsPageTopBar";
// import RejectedOrdersStatusBar from "./RejectedOrdersStatusBar";
import PurchaseOrderRemarksModal from "../../CommonComponent/PurchaseOrderRemarksModal";

function RejectedOrders() {

  const { Logout, getGeneralSettingssymbol } = UserAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedPOReferenceNumber, setSelectedPOReferenceNumber] = useState(null);
  const [selectedPOId, setSelectedPOId] = useState(null);
  const [data, setData] = useState([]);
  const [pageState, setPageState] = useState({ current: 1, pageSize: 15 });
  const [totalCount, setTotalCount] = useState(0);
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);

  const fetchPurchaseOrders = async (
    customPageState = pageState,
    customFilters = {
      referenceNumberFilter,
      dateRangeFilter,
    }
  ) => {
    setIsLoading(true);
    const urlParams = new URLSearchParams({
      ...customPageState,
      ...(customFilters.referenceNumberFilter && {
        reference_number: customFilters.referenceNumberFilter,
      }),
      ...(customFilters.dateRangeFilter?.[0] && {
        expected_arrival_start: moment(customFilters.dateRangeFilter[0]).format("YYYY-MM-DD"),
      }),
      ...(customFilters.dateRangeFilter?.[1] && {
        expected_arrival_end: moment(customFilters.dateRangeFilter[1]).format("YYYY-MM-DD"),
      }),
    });
    PrivateAxios.get(`purchase/all-rejected-purchase?${urlParams.toString()}`)
      .then((res) => {
        const responseData = res.data?.data || {};
        const rows = responseData.rows || [];
        const pagination = responseData.pagination || {};
        setTotalCount(pagination.total_records || 0);
        const slNoBase = ((pagination.current_page || 1) - 1) * (pagination.per_page || customPageState.pageSize);
        const transformedData = rows.map((item, index) => ({
          id: item.id,
          slNo: slNoBase + index + 1,
          reference: item.reference_number,
          vendor: item.vendor.vendor_name,
          buyer: item?.createdBy?.name || "N/A",
          store: item.warehouse?.name || "N/A",
          expectedArrival: moment(item.expected_arrival).format("DD-MM-YYYY"),
          expected_arrival_raw: item.expected_arrival,
          total: `${getGeneralSettingssymbol} ${item.total_amount}`,
          is_parent: item.is_parent,
          status: item.status,
        }));

        setData(transformedData);
        setIsLoading(false);
      })
      .catch((err) => {
        // setLoading(false);
        setIsLoading(false);
        if (err.response.data == 401) {
          Logout();
        }
        ErrorMessage(err.response?.message || "Error!! Unable to fetch purchase orders");
      });
  };
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const handleFilter = () => {
    const newPageState = {
      ...pageState,
      current: 1,
    };
    setPageState(newPageState);
    fetchPurchaseOrders(newPageState, {
      referenceNumberFilter,
      dateRangeFilter,
    });
  };

  const handleReset = () => {
    const newPageState = { current: 1, pageSize: pageState.pageSize };
    const resetFilters = { referenceNumberFilter: "", dateRangeFilter: [null, null] };
    setReferenceNumberFilter("");
    setDateRangeFilter([null, null]);
    setPageState(newPageState);
    fetchPurchaseOrders(newPageState, resetFilters);
  };

  const handlePageChange = (page, pageSize) => {
    const newPageState = {
      current: page,
      pageSize: pageSize || pageState.pageSize,
    };
    setPageState(newPageState);
    fetchPurchaseOrders(newPageState, {
      referenceNumberFilter,
      dateRangeFilter,
    });
  };

  const renderStatus = (_, record) => {
    switch (record.status) {
      case 1:
        return (
          <label className="badge badge-outline-active">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Active
          </label>
        );
      case 2:
        return (
          <label className="badge badge-outline-quotation">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>RFQ
          </label>
        );
      case 3:
        return (
          <label className="badge badge-outline-yellowGreen mb-0">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Reviewing
          </label>
        );
      case 4:
        return (
          <label className="badge badge-outline-accent mb-0">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Approved from Admin
          </label>
        );
      case 5:
        return (
          <label className="badge badge-outline-green mb-0">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Order Confirmed
          </label>
        );
      case 6:
        return (
          <label className="badge badge-outline-meantGreen mb-0">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Fully Billed
          </label>
        );
      case 7:
        return (
          <label className="badge badge-outline-success">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Done
          </label>
        );
      case 8:
        return (
          <label className="badge badge-outline-danger">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Rejected
          </label>
        );
      case 9:
        return (
          <label className="badge badge-outline-warning">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Final Approval Pending
          </label>
        );
      default:
        return "Unknown";
    }
  };

  const renderAction = (_, record) => (
    <div className="d-flex gap-2">
      <Tooltip title="Show Management Remarks">
        <a
          className="me-1 icon-btn"
          onClick={() => {
            setSelectedPOId(record.id);
            setSelectedPOReferenceNumber(record.reference);
            setShowRemarksModal(true);
          }}
        >
          <i className="fas fa-comments d-flex"></i>
        </a>
      </Tooltip>
    </div>
  );

  const columns = [
    {
      title: "Sl No.",
      dataIndex: "slNo",
      key: "slNo",
      width: 100,
    },
    {
      title: "Reference No.",
      dataIndex: "reference",
      key: "reference",
      width: 250,
      render: (_, record) => {
        return (
          <span className="k_table_link">
            {record.reference}
          </span>
        );
      },
    },
    {
      title: "Vendor",
      dataIndex: "vendor",
      key: "vendor",
      width: 250,
    },
    {
      title: "Created By",
      dataIndex: "buyer",
      key: "buyer",
      width: 250,
    },
    {
      title: "Expected Arrival",
      dataIndex: "expectedArrival",
      key: "expectedArrival",
      width: 250,
    },
    {
      title: "Store",
      dataIndex: "store",
      key: "store",
      width: 250,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 150,
    },
    {
      title: "Status",
      key: "status",
      width: 180,
      render: renderStatus,
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: renderAction,
    },
  ];


  return (
    <React.Fragment>
     <OperationsPageTopBar />
     {/* <RejectedOrdersStatusBar /> */}

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="bg-white border-bottom">
                <div className="d-flex gap-3 px-4 justify-content-between align-items-center py-3">
                  <div className="d-flex gap-3 align-items-center">
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
                    <div style={{ minWidth: "250px", display: "flex", flexDirection: "column" }}>
                      <label className="form-label mb-1 f-s-14 fw-medium">Filter by Expected Arrival</label>
                      <DatePicker
                        selected={dateRangeFilter[0]}
                        onChange={(update) => setDateRangeFilter(update)}
                        startDate={dateRangeFilter[0]}
                        endDate={dateRangeFilter[1]}
                        selectsRange
                        isClearable
                        placeholderText="Select date range"
                        className="form-control"
                        dateFormat="dd-MM-yyyy"
                        name="expected_arrival"
                        style={{ display: "block", width: "100%" }}
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
                        style={{ height: "38px", marginTop: "20px" }}
                      >
                        <i className="fas fa-redo me-2"></i>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <AntTable
                  columns={columns}
                  dataSource={data}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{
                    current: pageState.current,
                    pageSize: pageState.pageSize,
                    total: totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "15", "25", "50"],
                    onChange: handlePageChange,
                    onShowSizeChange: handlePageChange,
                  }}
                  scroll={{ x: 1400 }}
                />
                {/* <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{
                    current: pageState.current,
                    pageSize: pageState.pageSize,
                    total: filteredData.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "15", "25", "50"],
                    onChange: (page, pageSize) =>
                      setPageState({
                        current: page,
                        pageSize: pageSize || pageState.pageSize,
                      }),
                    onShowSizeChange: (_, pageSize) =>
                      setPageState({
                        current: 1,
                        pageSize,
                      }),
                  }}
                  scroll={{ x: 1400 }}
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>









      {/* ========================================================= modal start here */}

      <PurchaseOrderRemarksModal
        show={showRemarksModal}
        onHide={() => setShowRemarksModal(false)}
        purchaseOrderId={selectedPOId}
        purchaseOrderReferenceNumber={selectedPOReferenceNumber}
      />
    </React.Fragment>
  );
}


 

export default RejectedOrders;
