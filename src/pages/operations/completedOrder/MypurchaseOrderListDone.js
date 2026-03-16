import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import jsPDF from "jspdf";
import "jspdf-autotable";
// import DataTable, { createTheme } from "react-data-table-component";
import { Link } from "react-router-dom";
import { Modal, Table } from "react-bootstrap";
import DatePicker from "react-datepicker";

// import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios } from "../../../environment/AxiosInstance";
// import { UserAuth } from "../../auth/Auth";
import Loader from "../../landing/loder/Loader";
import moment from "moment";

import { useTable, useExpanded } from 'react-table';

import {
  Grid,
  GridColumn,
} from "@progress/kendo-react-grid";
// import { process } from "@progress/kendo-data-query";
import { Tooltip } from "antd";
import OperationsPageTopBar from "../OperationsPageTopBar";
import PORemarksModalComponent from "../../ModalComponents/PORemarksModalComponent";
// import CompletedOrdersStatusBar from "./CompletedOrdersStatusBar";



function MypurchaseOrderListDone() {

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });
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

  //delete modal

  //end update status

  // const fetchData = async (pid, ref) => {
  //   setReff(ref)
  //   try {
  //     const response = await PrivateAxios.get(`purchase/recv/${pid}`);
  //     if (Array.isArray(response.data)) {
  //       const transformedData = response.data.map(bill => ({
  //         ...bill,
  //         recvPro: bill.recvPro.map(recvProItem => ({
  //           ...recvProItem,
  //           product_name: recvProItem.ProductsItem.product_name,
  //           unit_price: recvProItem.unit_price,
  //           qty: recvProItem.qty,
  //         })),
  //       }));
  //       setDatavalue(transformedData);
  //     } else {
  //       console.error("API data is not in expected format:", response.data);
  //       setDatavalue([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setDatavalue([]);
  //   }
  // };

  // React.useEffect(() => {
  //   fetchData();
  // }, []);

  const columns = React.useMemo(
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
    { columns, data: datavalue },
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
            vendor: item.vendor.vendor_name,
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

  const handlePageChange = (event) => {
    const newPageState = {
      skip: event.page.skip,
      take: event.page.take,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    // Fetch data with updated pagination and current filter
    TaskData(newPageState);
  };

  const StatusCell = (props) => {
    return (
      <td
        dangerouslySetInnerHTML={{ __html: props.dataItem[props.field] }}
      ></td>
    );
  };

  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span className="k_table_link"><Link to={`/purchase/${dataItem.id}`}>{dataItem.reference}</Link></span>


          {/* {dataItem.is_parent === 1 && "   "}
          {dataItem.is_parent == 1 && <i
            className="fas fa-star"
            style={{ fontSize: "15px", color: "#007bff", cursor: "pointer" }}
          ></i>} */}

        </div>
      </td>
    );
  };

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
      
          <Tooltip title="Show Management Remarks">
            <button
              className="me-1 icon-btn"
              onClick={() => {
                setSelectedPOId(dataItem.id);
                setLgShow(true);
              }}
            >
              <i class="fas fa-comment-dots d-flex"></i>
            </button>
          </Tooltip>

          {/* {dataItem.is_parent == 1 && dataItem.status == 2 && (
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
          ((dataItem.status == 2 && dataItem.total_amount && companysettings && companysettings.min_purchase_amount && parseFloat(dataItem.total_amount) < parseFloat(companysettings.min_purchase_amount)) 
          || dataItem.status == 4)
          && (
     
              <Tooltip title="Send to Vendor">
              <button
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleStatusChange(dataItem.id, 5)}
              >
                <i className="fas fa-share-square"></i>
                
              </button>
            </Tooltip>
          )}
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
          </Tooltip> */}

        </div>
      </td>
    );
  };

  return (
    <React.Fragment>
      {loading && <Loader />}

      <OperationsPageTopBar />
      {/* <CompletedOrdersStatusBar /> */}

      <div className="bg-white border-bottom">
        <div className="px-4 py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4 col-lg-2">
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
            <div className="col-md-5 col-lg-4">
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
                className="form-control w-100"
                dateFormat="dd-MM-yyyy"
                name="expected_arrival"
                style={{ height: "38px", display: "block" }}
              />
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
                <Grid
                  data={data}
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
                  loading={loading}
                  pageable={{ buttonCount: 3, pageSizes: true }}
                >
                  {/* Column Definitions */}

                  <GridColumn field="slNo" title="sl No." filterable={false} width="100px" locked={true} />

                  <GridColumn field="reference" title="reference" filterable={false} filter="text" cell={ReferenceCell} width="150px" />
                  <GridColumn field="vendor" title="vendor" filterable={false} filter="text" width="200px" />
                  <GridColumn field="created_by" title="created by" filterable={false} filter="text" width="200px" />
                  <GridColumn field="expected_arrival" title="Expected Arrival" filterable={false} filter="text" width="200px" format="{0:dd-MM-yyyy}" />
                  <GridColumn field="total" title="total" filterable={false} filter="text" width="250px" />
                  <GridColumn
                    field="status_return"
                    title="Status"
                    width="180px"
                    cell={StatusCell} // Use custom cell renderer
                  />
                  <GridColumn title="action" filter="text" cell={ActionCell} filterable={false} width="150px" />
                </Grid>



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
          <Table responsive {...getTableProps()} className="table table-striped">
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
                        <td colSpan={columns.length}>
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
                <td colSpan={columns.length}>Total Received: {totalReceived}</td>
              </tr>
              <tr>
                <td colSpan={columns.length}>Total Rejected: {totalRejected}</td>
              </tr> */}

              <tr>
                <td colSpan={columns.length}><span>Total Received</span>
                 {/* <i class="fi fi-br-arrow-trend-down text-success ms-1"></i>  */}
                 <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-success ms-1"><path d="M20.5,6h-5c-.828,0-1.5,.672-1.5,1.5s.672,1.5,1.5,1.5h3.379l-5.879,5.879-4.119-4.119c-1.037-1.037-2.725-1.037-3.762,0L.439,15.439c-.586,.586-.586,1.535,0,2.121s1.535,.586,2.121,0l4.439-4.439,4.119,4.119c.519,.519,1.199,.778,1.881,.778s1.362-.26,1.881-.778l6.119-6.119v3.379c0,.828,.672,1.5,1.5,1.5s1.5-.672,1.5-1.5v-5c0-1.93-1.57-3.5-3.5-3.5Z"/></svg>
                 <span className="text-success f-s-16 fw-semibold ms-1">{totalReceived}</span> </td>
              </tr>
              <tr>
                <td colSpan={columns.length}>Total Rejected 
                {/* <i class="fi fi-br-arrow-trend-down text-danger ms-1"></i>  */}
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-danger ms-1"><path d="M24,9.5v5c0,1.93-1.57,3.5-3.5,3.5h-5c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5h3.379l-5.879-5.879-4.119,4.119c-1.037,1.037-2.725,1.037-3.762,0L.439,8.561c-.586-.586-.586-1.535,0-2.121s1.535-.586,2.121,0l4.439,4.439,4.08-4.08c1.059-1.059,2.781-1.059,3.84,0l6.08,6.08v-3.379c0-.828,.672-1.5,1.5-1.5s1.5,.672,1.5,1.5Z"/></svg>
                <span className="text-danger f-s-16 fw-semibold ms-1">{totalRejected}</span></td>
              </tr>

            </tbody>
          </Table>
        </Modal.Body>
      </Modal>


      {/* Description modal end */}
    </React.Fragment>
  );
}

export default MypurchaseOrderListDone;
