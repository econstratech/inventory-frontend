import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import jsPDF from "jspdf";
import "jspdf-autotable";
// import DataTable, { createTheme } from "react-data-table-component";
import { Link, useParams } from "react-router-dom";
import { Modal, Table } from "react-bootstrap";
// import Handsontable from "handsontable/base";
// import { HotTable } from "@handsontable/react";
// import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios } from "../../environment/AxiosInstance";
// import { UserAuth } from "../auth/Auth";
import Loader from "../landing/loder/Loader";
// import {
//   exportExcel,
//   exportPDF,
//   printTable,
  // } from "../../environment/exportTable";
// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import Form from "react-bootstrap/Form";
import moment from "moment";
// import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
// import {
//   AllUser,
//   GetTaskPriority,
//   GetTaskStatus,
//   sendMail,
// } from "../../environment/GlobalApi";
import { useTable, useExpanded } from "react-table";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import ReceiveUpdatePageTopBar from "./ReceiveUpdatePageTopBar";
// import ReceiveUpdateStatusBar from "./ReceiveUpdateStatusBar";

function RecvUpdate() {
  const { id } = useParams();
  // const { loading, setLoading, Logout, getGeneralSettingssymbol } =
  //   UserAuth();
  //for-data table
  // const [value, setValue] = useState(true);
  // const [grid, setGrid] = useState(false);
  // const [doerShow, setDoerShow] = useState(false);
  // const [detailsShow, setDetailsShow] = useState(false);
  // const [deleteShow, setDeleteShow] = useState(false);
  // const [descriptionShow, setDescriptionShow] = useState(false);
  // const [descriptionData, setDescriptionData] = useState("");
  // const [tableData, setTableData] = useState([]);
  const handleClose = () => setShow(false);
  // const [editorContent, setEditorContent] = useState("");
  const handleShow = () => setShow(true);
  // const [deleteId, setDeleteId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });
  const RemarksClose = () => setShowremark(false);
  const RemarksShow = () => setShowremark(true);
  const [getshowRemarks, setShowremark] = useState(false);
  const [getRemarksdata, getremarkdata] = useState("");

  const [getRemarksRef, getremarksRef] = useState("");
  // const [searchData, setSearchData] = useState({
  //   name: "",
  //   assign_to: "",
  //   task_priority_id: "",
  //   delegation_status_id: "",
  // });

  // const [getPid, setPid] = useState(false);
  const [getReff, setReff] = useState("");

  const [show, setShow] = useState(false);
  const [datavalue, setDatavalue] = useState([]);
  const [expandedRows, setExpandedRows] = React.useState([]);

  const getRemarks = (rmks, refid) => {
    const sortedFollowupData = rmks.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const followupData = sortedFollowupData
      .map(
        (followup) => `
          <tr key=${followup.id}>
              <td>${followup.content}</td>
              <td>${new Date(followup.created_at).toLocaleString()}</td>
          </tr>
      `
      )
      .join("");
    getremarkdata(followupData);
    getremarksRef(refid);
  };

  //end update status

  const fetchData = async (pid, ref) => {
    setReff(ref);
    try {
      const response = await PrivateAxios.get(`purchase/recv/${pid}`);
      if (Array.isArray(response.data)) {
        const transformedData = response.data.map((bill) => ({
          ...bill,
          recvPro: bill.recvPro.map((recvProItem) => ({
            ...recvProItem,
            product_name: recvProItem.ProductsItem.product_name,
            unit_price: recvProItem.unit_price,
            qty: recvProItem.qty,
          })),
        }));
        setDatavalue(transformedData);
      } else {
        console.error("API data is not in expected format:", response.data);
        setDatavalue([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setDatavalue([]);
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: "Bill Number", accessor: "bill_number" },
      { Header: "Bill Date", accessor: "bill_date" },
      // { Header: "Buyer", accessor: "buyer" },
      { Header: "Untaxed Amount", accessor: "untaxed_amount" },
      { Header: "Total Amount", accessor: "total_amount" },
      {
        Header: "Details",
        id: "details",
        Cell: ({ row }) => (
          <button type='button' className="btn btn-primary btn-sm" onClick={() => handleToggle(row.original.id)}>
            {expandedRows[row.original.id] ? "Hide Details" : "Show Details"}
          </button>
        ),
      },
    ],
    [expandedRows]
  );

  const handleToggle = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const tableInstance = useTable(
    { columns, data: datavalue },
    useExpanded // Use the useExpanded plugin hook
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;
  // Calculate total received and rejected
  const calculateTotals = () => {
    let totalReceived = 0;
    let totalRejected = 0;

    datavalue.forEach((bill) => {
      bill.recvPro.forEach((pro) => {
        totalReceived += pro.received || 0; // Use pro.received if it's available
        totalRejected += pro.rejected || 0; // Use pro.rejected if it's available
      });
    });

    return { totalReceived, totalRejected };
  };

  const { totalReceived, totalRejected } = calculateTotals();
  //end

  const TaskData = async () => {
    setLoading(true);
    PrivateAxios.get("purchase/getallpurchaseorderforrecv")
      .then((res) => {
        const transformedData = res.data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          vendor: item.vendor.vendor_name,
          buyer: item.buyer,
          total: `₹ ${item.total_amount}`,
          is_parent: item.is_parent,
          status: item.status,
          followup: item.followup,
          expectedArrival: moment(item.expected_arrival).format(
            "DD/MM/YYYY"
          ),
          createdDate: moment(item.created_at).format(
            "DD/MM/YYYY"
          ),
          status_return:
            item.status === 1
              ? "Active"
              : item.status === 2
              ? "RFQ"
              : item.status === 3
              ? "Send to management"
              : item.status === 4
              ? "Order confirmed"
              : item.status === 5
              ? "Nothing to Bill"
              : item.status === 6
              ? "Fully Billed"
              : item.status === 7
              ? "Done"
              : item.status === 8
              ? "Rejected from Admin"
              : item.status === 10
              ? "Items Received Done"
              : "Unknown",
        }));
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

  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span>
            <a className="k_table_link"
              onClick={() => {
                RemarksShow(true);
                getRemarks(
                  dataItem.followup,
                  dataItem.vendor + " - " + dataItem.reference
                );
              }}
            >
              {dataItem.reference}{" "}
              {/* <i
                className="fas fa-info-circle"
                style={{
                  fontSize: "15px",
                  color: "#007bff",
                  cursor: "pointer",
                }}
              ></i> */}
            </a>
          </span>
        </div>
      </td>
    );
  };

  const pdfExportRef = React.createRef();
  const excelExportRef = React.createRef();

  const handleExportPDF = () => {
    if (pdfExportRef.current) {
      pdfExportRef.current.save();
    }
  };

  const handleExportExcel = () => {
    if (excelExportRef.current) {
      excelExportRef.current.save();
    }
  };

  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div className="d-flex gap-2">
          {dataItem.status !== 7 && dataItem.status !== 8 && (
            <>
              {/* <Tooltip title="Check PO">
                <Link
                  target="_blank"
                  to={
                    url + "purchase_order_" + dataItem.reference_number + ".pdf"
                  }
                  className="me-1 icon-btn"
                >
                  <i class="far fa-file-pdf d-flex"></i>
                </Link>
              </Tooltip> */}

              <Tooltip title="Receive Update">
                <Link
                  to={`/purchase-orders/recvorder/${dataItem.id}`}
                  className="me-1 icon-btn"
                >
                  <i class="fas fa-tag d-flex"></i>
                </Link>
              </Tooltip>
              {/* <Tooltip title="Receive Update View">
                <button
                  onClick={() => {
                    handleShow(true);
                    fetchData(
                      dataItem.id,
                      dataItem.vendor + " - " + dataItem.reference
                    );
                  }}
                  className="me-1 icon-btn"
                >
                  <i className="fas fa-eye d-flex d-flex"></i>
                </button>
              </Tooltip> */}
              {/* <Tooltip title="Receive Completed">
                <button
                  onClick={() => {
                    changeStatusfromAdmin(dataItem.id, "10");
                  }}
                  className="me-1 icon-btn"
                >
                  <i className="fas fa-check-circle d-flex"></i>
                </button>
              </Tooltip> */}
            </>
          )}
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

        <label className="badge badge-outline-accent">
          <i className="fas fa-circle f-s-8 d-flex me-1"></i>Pending GRN
        </label>

        {/* {value} */}
      </td>
    );
  };


  return (
    <React.Fragment>
      {loading && <Loader />}

        <ReceiveUpdatePageTopBar />
        {/* <ReceiveUpdateStatusBar /> */}

        <div className="row p-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body p-0">
                <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                  <div className="table-button-group mb-2 ms-auto">
  
                    <GridToolbar className="border-0 gap-0">
                      <Tooltip title="Export to PDF">
                        <button type='button' className=" table-export-btn" onClick={handleExportPDF}>
                          <i class="far fa-file-pdf d-flex f-s-20"></i>
                        </button>
                      </Tooltip>
                      <Tooltip title=" Export to Excel">
                        <button type='button' className=" table-export-btn" onClick={handleExportExcel}>
                          <i class="far fa-file-excel d-flex f-s-20"></i>
                        </button>
                      </Tooltip>
                    </GridToolbar>
                  </div>
                </div>
                <div className="bg_succes_table_head rounded_table">
                  <PDFExport data={data} ref={pdfExportRef}>
                    <ExcelExport data={data} ref={excelExportRef} >
                      <Grid
                        data={process(data, dataState)}  // Add fallback for undefined data
                        filterable={false}
                        sortable
                        scrollable="scrollable"
                        reorderable
                        resizable
                        {...dataState}
                        onDataStateChange={(e) => setDataState(e.dataState)}
                        loading={loading}
                        pageable={{ buttonCount: 3, pageSizes: true }}
                      >
  
  
                        {/* Column Definitions */}
  
                        <GridColumn field="reference"  cell={ReferenceCell} title="reference" filterable={false} filter="text" width="200px" />
                        <GridColumn field="vendor" title="vendor" filterable={false} filter="text" width="250px" />
                        {/* <GridColumn field="buyer" title="buyer" filterable={false} filter="text" width="200" /> */}
                        <GridColumn field="total" title="total" filterable={false} filter="text" width="250px" />
                        {/* <GridColumn field="orderDeadline" title="Order Deadline" filterable={false} filter="numeric" width="200px" /> */}
                        {/* <GridColumn field="status" title="STATUS" filter="text" filterable={false} width="200" /> */}
                        <GridColumn
                          field="status_return"
                          title="PO Status"
                          filterable={false}
                          filter="dropdown"
                          width="250px"
                          // filterCell={CustomDropDownFilter}
                          cells={{
                            data: CustomCell
                          }}
                        />
                        <GridColumn field="expectedArrival" title="Expected Arrival" filterable={false} filter="text" width="200px" format="{0:dd-MM-yyyy}" />
                        <GridColumn field="createdDate" title="Created Date" filterable={false} filter="text" width="200px" format="{0:dd-MM-yyyy}" />

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
        show={show}
        onHide={handleClose}
        closeButton
        backdrop="static"
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">{getReff}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="">
            <Table
              {...getTableProps()}
              responsive
              className="table-bordered primary-table-head"
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  const isExpanded = expandedRows[row.original.id];
                  return (
                    <React.Fragment key={row.id}>
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={columns.length} className="subTable_row">
                          <div className="">
                            <Table responsive className="table table-striped table-bordered primary-table-head">
                              <thead>
                                <tr>
                                  <th>Product Name</th>
                                  <th>Received</th>
                                  <th>Rejected</th>
                                  <th>Received Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.original.recvPro.map((pro) => (
                                  <tr key={pro.id}>
                                    <td>{pro.product_name}</td>
                                    <td>{pro.received}</td>
                                    <td>{pro.rejected}</td>
                                    <td>
                                      {new Date(
                                        pro.created_at
                                      ).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                            </div>
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
                  <td colSpan={columns.length}>
                    <span>Total Received</span>{" "}
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-success ms-1"><path d="M20.5,6h-5c-.828,0-1.5,.672-1.5,1.5s.672,1.5,1.5,1.5h3.379l-5.879,5.879-4.119-4.119c-1.037-1.037-2.725-1.037-3.762,0L.439,15.439c-.586,.586-.586,1.535,0,2.121s1.535,.586,2.121,0l4.439-4.439,4.119,4.119c.519,.519,1.199,.778,1.881,.778s1.362-.26,1.881-.778l6.119-6.119v3.379c0,.828,.672,1.5,1.5,1.5s1.5-.672,1.5-1.5v-5c0-1.93-1.57-3.5-3.5-3.5Z"/></svg>
                    <span className="text-success f-s-16 fw-semibold ms-1">
                      {totalReceived}
                    </span>{" "}
                  </td>
                </tr>
                <tr>
                  <td colSpan={columns.length}>
                    Total Rejected{" "}
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-danger ms-1"><path d="M24,9.5v5c0,1.93-1.57,3.5-3.5,3.5h-5c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5h3.379l-5.879-5.879-4.119,4.119c-1.037,1.037-2.725,1.037-3.762,0L.439,8.561c-.586-.586-.586-1.535,0-2.121s1.535-.586,2.121,0l4.439,4.439,4.08-4.08c1.059-1.059,2.781-1.059,3.84,0l6.08,6.08v-3.379c0-.828,.672-1.5,1.5-1.5s1.5,.672,1.5,1.5Z"/></svg>
                    <span className="text-danger f-s-16 fw-semibold ms-1">
                      {totalRejected}
                    </span>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={getshowRemarks}
        onHide={RemarksClose}
        closeButton
        backdrop="static"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Follow Up / {getRemarksRef}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="">
            <Table responsive className="table-bordered primary-table-head">
              {/* <table className="table table-smtable-responsive-sm"> */}
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Post Date</th>
                </tr>
              </thead>
              <tbody
                dangerouslySetInnerHTML={{ __html: getRemarksdata }}
              ></tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>

      {/* Description modal end */}
    </React.Fragment>
  );
}
RecvUpdate.modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    // Toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

RecvUpdate.formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
];

export default RecvUpdate;
