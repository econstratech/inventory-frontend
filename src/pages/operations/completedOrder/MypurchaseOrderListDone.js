import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import jsPDF from "jspdf";
import "jspdf-autotable";
// import DataTable, { createTheme } from "react-data-table-component";
import { Link } from "react-router-dom";
import { Modal, Table as RbTable } from "react-bootstrap";
import DatePicker from "react-datepicker";

// import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios } from "../../../environment/AxiosInstance";
// import { UserAuth } from "../../auth/Auth";
import Loader from "../../landing/loder/Loader";
import moment from "moment";

import { useTable, useExpanded } from 'react-table';

import { Tooltip, Table } from "antd";
import OperationsPageTopBar from "../OperationsPageTopBar";
import PORemarksModalComponent from "../../ModalComponents/PORemarksModalComponent";
// import CompletedOrdersStatusBar from "./CompletedOrdersStatusBar";



function MypurchaseOrderListDone() {

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [getReff, setReff] = useState('');
  const [datavalue, setDatavalue] = useState([]);
  const [expandedRows, setExpandedRows] = React.useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({
    skip: 0,
    take: 10,
    searchKey: "",
    referenceNumberFilter: "",
  });
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [lgShow, setLgShow] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState(null);

  const modalColumns = React.useMemo(
    () => [
      { Header: 'Bill Number', accessor: 'bill_number' },
      { Header: 'Bill Date', accessor: 'bill_date' },
      { Header: 'Buyer', accessor: 'buyer' },
      { Header: 'Untaxed Amount', accessor: 'untaxed_amount' },
      { Header: 'Total Amount', accessor: 'total_amount' },
      {
        Header: 'Details',
        id: 'details',
        Cell: ({ row }) => (
          <button type='button' onClick={() => handleToggle(row.original.id)}>
            {expandedRows[row.original.id] ? 'Hide Details' : 'Show Details'}
          </button>
        ),
      },
    ],
    [expandedRows]
  );

  // Handle filter button click
  const handleFilter = () => {
    setPageState({ ...pageState, skip: 0 }); // Reset to first page when filtering
    TaskData();
  };

  // Handle reset button click
  const handleReset = () => {
    // setPageState({ skip: 0, take: 15, searchKey: "" });
    setReferenceNumberFilter("");
    setDateRangeFilter([null, null]);
    const newPageState = {
      skip: 0,
      take: 15,
      searchKey: "",
    };
    setPageState(newPageState);
    // Fetch data with updated pagination and current filter
    TaskData(newPageState);
  };

  const handleToggle = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const tableInstance = useTable(
    { columns: modalColumns, data: datavalue },
    useExpanded // Use the useExpanded plugin hook
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;
  // Calculate total received and rejected
  const calculateTotals = () => {
    let totalReceived = 0;
    let totalRejected = 0;

    datavalue.forEach(bill => {
      bill.recvPro.forEach(pro => {
        totalReceived += pro.received || 0; // Use pro.received if it's available
        totalRejected += pro.rejected || 0; // Use pro.rejected if it's available
      });
    });

    return { totalReceived, totalRejected };
  };

  const { totalReceived, totalRejected } = calculateTotals();
  //description modal

  const TaskData = async (customPageState = null) => {
    setLoading(true);
    const currentPageState = customPageState || pageState;
    const urlParams = new URLSearchParams({
      page: currentPageState.skip / currentPageState.take + 1,
      limit: currentPageState.take,
      status: 10,
      ...(currentPageState.searchKey && { search: currentPageState.searchKey }),
      ...(referenceNumberFilter && { reference_number: referenceNumberFilter }),
      ...(dateRangeFilter[0] && { expected_arrival_start: moment(dateRangeFilter[0]).format("YYYY-MM-DD") }),
      ...(dateRangeFilter[1] && { expected_arrival_end: moment(dateRangeFilter[1]).format("YYYY-MM-DD") })
    });
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
            // confirmationDate: moment(item.order_dateline).format("DD-MM-YYYY H:mm"),
            vendor: item.vendor?.vendor_name || "N/A",
            store: item.warehouse?.name || "N/A",
            created_by: item.createdBy.name,
            // sourceDocument: item.source_document,
            total: `₹ ${item.total_amount}`,
            is_parent: item.is_parent,
            expected_arrival: moment(item.expected_arrival).format("DD-MM-YYYY"),
            status: item.status,
            status_return:
              item.status === 1
          ? `<label class="badge badge-outline-active"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Active</label>`
          : item.status === 2
          ? `<label class="badge badge-outline-quotation"><i class="fas fa-circle f-s-8 d-flex me-1"></i>RFQ</label>`
          : item.status === 3
          ? `<label class="badge badge-outline-yellowGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Reviewing</label>`
          : item.status === 4
          ? `<label class="badge badge-outline-accent mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Approved from Admin</label>`
          : item.status === 5
          ? `<label class="badge badge-outline-green mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>PO Issued</label>`
          : item.status === 6
          ? `<label class="badge badge-outline-meantGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Fully Billed</label>`
          : item.status === 10
          ? `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>PO Completed</label>`
          : item.status === 8
          ? `<label class="badge badge-outline-danger "><i class="fas fa-circle f-s-8 d-flex me-1"></i>Rejected</label>`
          : item.status === 9
          ?`<label class="badge badge-outline-warning "><i class="fas fa-circle f-s-8 d-flex me-1"></i>Final Approval Pending</label>`
          
          : "Unknown",
          };
        });
        setData(transformedData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    TaskData();
  }, []);

  const handlePageChange = (page, pageSize) => {
    const newPageState = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    TaskData(newPageState);
  };

  const renderReference = (_, record) => (
    <span className="k_table_link">
      <Link to={`/purchase/${record.id}`}>{record.reference}</Link>
    </span>
  );

  const renderStatus = (_, record) => (
    <span dangerouslySetInnerHTML={{ __html: record.status_return }} />
  );

  const renderAction = (_, record) => (
    <div className="d-flex gap-2">
      <Tooltip title="Edit">
        <Link
          to={{ pathname: `/purchase/${record.id}` }}
          state={{ data: record }}
          className="me-1 icon-btn"
        >
          <i className="fas fa-pen"></i>
        </Link>
      </Tooltip>
      <Tooltip title="Show Management Remarks">
        <button
          type="button"
          className="me-1 icon-btn"
          onClick={() => {
            setSelectedPOId(record.id);
            setLgShow(true);
          }}
        >
          <i className="fas fa-comment-dots d-flex"></i>
        </button>
      </Tooltip>
    </div>
  );

  const purchaseTableColumns = [
    { title: "Sl No.", dataIndex: "slNo", key: "slNo", width: 100 },
    { title: "Reference No.", dataIndex: "reference", key: "reference", width: 150, render: renderReference },
    { title: "Vendor", dataIndex: "vendor", key: "vendor", width: 200 },
    { title: "Store", dataIndex: "store", key: "store", width: 200 },
    { title: "Created By", dataIndex: "created_by", key: "created_by", width: 200 },
    { title: "Expected Arrival", dataIndex: "expected_arrival", key: "expected_arrival", width: 200 },
    { title: "Total Amount", dataIndex: "total", key: "total", width: 250 },
    { title: "Status", dataIndex: "status_return", key: "status_return", width: 180, render: renderStatus },
    { title: "Action", key: "action", width: 150, render: renderAction },
  ];

  return (
    <React.Fragment>
      {loading && <Loader />}

      <OperationsPageTopBar />
      {/* <CompletedOrdersStatusBar /> */}

      <div className="bg-white border-bottom">
        <div className="px-4 py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4 col-lg-2">
              <div className="d-flex flex-column">
                <label className="form-label mb-1 f-s-14 fw-medium">Filter by Reference No.</label>
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
            </div>
            <div className="col-md-5 col-lg-4" style={{ minWidth: "220px" }}>
              <div className="d-flex flex-column w-100">
                <label className="form-label mb-1 f-s-14 fw-medium d-block w-100" htmlFor="expected_arrival_filter">
                  Filter by Expected Arrival
                </label>
                <div className="expected-arrival-picker-wrap w-100">
                  <style>
                    {`
                      .expected-arrival-picker-wrap .react-datepicker-wrapper,
                      .expected-arrival-picker-wrap .react-datepicker__input-container {
                        width: 100%;
                        display: block;
                      }
                      .expected-arrival-picker-wrap .react-datepicker__input-container input {
                        height: 38px !important;
                        width: 100%;
                      }
                    `}
                  </style>
                  <DatePicker
                    id="expected_arrival_filter"
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
                    wrapperClassName="w-100"
                  />
                </div>
              </div>
            </div>
            <div className="col-md-auto">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleFilter}
                  style={{ height: "38px" }}
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
          </div>
        </div>
      </div>

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                <div className="table-button-group mb-2 ms-auto"></div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <Table
                  columns={purchaseTableColumns}
                  dataSource={data}
                  rowKey="id"
                  loading={loading}
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


      <PORemarksModalComponent
        show={lgShow}
        onHide={() => {
          setLgShow(false);
          setSelectedPOId(null);
        }}
        purchaseOrderId={selectedPOId}
        title="Management Remarks"
      />





      <Modal show={show} onHide={handleClose} closeButton backdrop="static"
        centered
        size="lg">
        <Modal.Header closeButton >
          <Modal.Title id="example-modal-sizes-title-lg">
            {getReff}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RbTable responsive {...getTableProps()} className="table table-striped">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                const isExpanded = expandedRows[row.original.id];
                return (
                  <React.Fragment key={row.id}>
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={modalColumns.length}>
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Product Name</th>
                                <th>Received</th>
                                <th>Rejected</th>
                                <th>Received Date</th>

                              </tr>
                            </thead>
                            <tbody>
                              {row.original.recvPro.map(pro => (
                                <tr key={pro.id}>
                                  <td>{pro.product_name}</td>
                                  <td>{pro.received}</td>
                                  <td>{pro.rejected}</td>
                                  <td>{new Date(pro.created_at).toLocaleString()}</td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>

                    )}
                  </React.Fragment>
                );
              })}
              {/* Totals row */}
              {/* <tr>
                <td colSpan={modalColumns.length}>Total Received: {totalReceived}</td>
              </tr>
              <tr>
                <td colSpan={modalColumns.length}>Total Rejected: {totalRejected}</td>
              </tr> */}

              <tr>
                <td colSpan={modalColumns.length}><span>Total Received</span>
                 {/* <i class="fi fi-br-arrow-trend-down text-success ms-1"></i>  */}
                 <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-success ms-1"><path d="M20.5,6h-5c-.828,0-1.5,.672-1.5,1.5s.672,1.5,1.5,1.5h3.379l-5.879,5.879-4.119-4.119c-1.037-1.037-2.725-1.037-3.762,0L.439,15.439c-.586,.586-.586,1.535,0,2.121s1.535,.586,2.121,0l4.439-4.439,4.119,4.119c.519,.519,1.199,.778,1.881,.778s1.362-.26,1.881-.778l6.119-6.119v3.379c0,.828,.672,1.5,1.5,1.5s1.5-.672,1.5-1.5v-5c0-1.93-1.57-3.5-3.5-3.5Z"/></svg>
                 <span className="text-success f-s-16 fw-semibold ms-1">{totalReceived}</span> </td>
              </tr>
              <tr>
                <td colSpan={modalColumns.length}>Total Rejected 
                {/* <i class="fi fi-br-arrow-trend-down text-danger ms-1"></i>  */}
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-danger ms-1"><path d="M24,9.5v5c0,1.93-1.57,3.5-3.5,3.5h-5c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5h3.379l-5.879-5.879-4.119,4.119c-1.037,1.037-2.725,1.037-3.762,0L.439,8.561c-.586-.586-.586-1.535,0-2.121s1.535-.586,2.121,0l4.439,4.439,4.08-4.08c1.059-1.059,2.781-1.059,3.84,0l6.08,6.08v-3.379c0-.828,.672-1.5,1.5-1.5s1.5,.672,1.5,1.5Z"/></svg>
                <span className="text-danger f-s-16 fw-semibold ms-1">{totalRejected}</span></td>
              </tr>

            </tbody>
          </RbTable>
        </Modal.Body>
      </Modal>


      {/* Description modal end */}
    </React.Fragment>
  );
}

export default MypurchaseOrderListDone;
