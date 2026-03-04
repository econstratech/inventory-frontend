import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DataTable, { createTheme } from "react-data-table-component";
import { Link } from "react-router-dom";
import { Dropdown, Modal, Table } from "react-bootstrap";

import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios, url } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import Loader from "../../landing/loder/Loader";
import moment from "moment";

import { useTable, useExpanded } from 'react-table';

import {
  Grid,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import OperationsPageTopBar from "../OperationsPageTopBar";
import CompletedOrdersStatusBar from "./CompletedOrdersStatusBar";



function CompletedOrdersNothingsBill() {

  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } = UserAuth();
  //for-data table

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

  //delete modal

  //end update status

  const fetchData = async (pid, ref) => {
    setReff(ref)
    try {
      const response = await PrivateAxios.get(`purchase/recv/${pid}`);
      if (Array.isArray(response.data)) {
        const transformedData = response.data.map(bill => ({
          ...bill,
          recvPro: bill.recvPro.map(recvProItem => ({
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

  React.useEffect(() => {
    fetchData();
  }, []);

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


  useEffect(() => {
    const TaskData = async () => {
      setIsLoading(true);
      PrivateAxios.get("purchase/getallpurchaseorderdone")
        .then((res) => {
          const transformedData = res.data.map((item, index) => ({

            id: item.id,
            slNo: index + 1,
            reference: item.reference_number,
            confirmationDate: moment(item.order_dateline).format("DD-MM-YYYY H:mm"),
            vendor: item.vendor.vendor_name,
            buyer: item.buyer,
            sourceDocument: item.source_document,
            total: `${getGeneralSettingssymbol} ${item.total_amount}`,
            is_parent: item.is_parent,
            expectedArrival: moment(item.expected_arrival).format("DD-MM-YYYY H:mm"),
            status: item.status,
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

  const CustomCell = (props) => {
    const { dataItem, field } = props;

    // Access the field value directly
    const value = dataItem[field];

    return (
      <td>

        <label className="badge badge-outline-purple"><i className="fas fa-circle f-s-8 d-flex me-1"></i>Nothing to Bill</label>

        {/* {value} */}
      </td>
    );
  };


  return (
    <React.Fragment>
      {isLoading && <Loader />}

<OperationsPageTopBar />
<CompletedOrdersStatusBar />

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

                      <GridColumn field="reference" title="reference" filterable={false} filter="text" width="200px" />
                      <GridColumn field="confirmationDate" title="Confirmation Date" filterable={false} width="250px" locked={true} />
                      <GridColumn field="vendor" title="vendor" filterable={false} filter="text" width="250px" />
                      <GridColumn field="buyer" title="buyer" filterable={false} filter="text" width="200" />
                      <GridColumn field="total" title="total" filterable={false} filter="text" width="250px" />
                      {/* <GridColumn field="orderDeadline" title="Order Deadline" filterable={false} filter="numeric" width="200px" /> */}
                      {/* <GridColumn field="status" title="STATUS" filter="text" filterable={false} width="200" /> */}
                      <GridColumn
                        field="status_return"
                        title="status"
                        filterable={false}
                        filter="dropdown"
                        width="250px"
                        // filterCell={CustomDropDownFilter}
                        cells={{
                          data: CustomCell
                        }}
                      />
                      <GridColumn field="expectedArrival" title="Expected Arrival" filterable={false} filter="text" width="200px" format="{0:dd-MM-yyyy}" />
                      {/* <GridColumn title="action" filter="text" cell={ActionCell} filterable={false} width="150px" /> */}
                    </Grid>
                  </ExcelExport>
                </PDFExport>



              </div>
            </div>
          </div>
        </div>
      </div>





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
                 <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-success ms-1"><path d="M20.5,6h-5c-.828,0-1.5,.672-1.5,1.5s.672,1.5,1.5,1.5h3.379l-5.879,5.879-4.119-4.119c-1.037-1.037-2.725-1.037-3.762,0L.439,15.439c-.586,.586-.586,1.535,0,2.121s1.535,.586,2.121,0l4.439-4.439,4.119,4.119c.519,.519,1.199,.778,1.881,.778s1.362-.26,1.881-.778l6.119-6.119v3.379c0,.828,.672,1.5,1.5,1.5s1.5-.672,1.5-1.5v-5c0-1.93-1.57-3.5-3.5-3.5Z"/></svg>
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

export default CompletedOrdersNothingsBill;
