import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { FaStar } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DataTable, { createTheme } from "react-data-table-component";
import { Link } from "react-router-dom";
import {
  Dropdown,
  Modal,
  Overlay,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";

import "handsontable/dist/handsontable.full.min.css";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import Loader from "../../landing/loder/Loader";
import { SuccessMessage } from "../../../environment/ToastMessage";
import OperationsPageTopBar from "../OperationsPageTopBar";
import CreateRfqStatusBar from "./CreateRfqStatusBar";

function CrateFinalPending() {
  const {
    isLoading,
    setIsLoading,
    Logout,
    getGeneralSettingssymbol,

  } = UserAuth();

  //for-data table
  const [value, setValue] = useState(true);
  const [grid, setGrid] = useState(false);

  const [detailsShow, setDetailsShow] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [descriptionShow, setDescriptionShow] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const [tableData, setTableData] = useState([]);
  const [lgShow, setLgShow] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });
  const [getReview, setreview] = useState("");

  //managment review
  const showReview = async (ida) => {
    try {
      //console.log(ida);
      const response = await PrivateAxios.get(`/purchase/getremarks/${ida}`);
      //console.log(response.data);
      if (response.status === 200) {
        setreview(response.data);
        //console.log("success");
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };
  //
  //pdf
  const generatePDF = async (id, val) => {
    setIsLoading(true);
    try {
      // Assuming the filename is constructed as `purchase_order_${val}.pdf`
      const filename = `purchase_order_${val}.pdf`;
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

  //end pdf
  const StatusCell = (props) => {
    return (
      <td
        dangerouslySetInnerHTML={{ __html: props.dataItem[props.field] }}
      ></td>
    );
  };

  const [getPrintID, PrintsetId] = useState("");

  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("purchase/approved-from-admin")
      .then((res) => {
        const transformedData = res.data.map((item, index) => {
          const getOrderDeadline = (orderDeadline, status) => {
            if (status < 5) {
              const today = new Date();
              const orderDate = new Date(orderDeadline);
              const timeDifference = orderDate - today;
              const daysDifference = Math.ceil(
                timeDifference / (1000 * 3600 * 24)
              );

              if (daysDifference === 0) {
                return "Today";
              } else if (daysDifference === 1) {
                return "Tomorrow";
              } else if (daysDifference > 1) {
                return `In ${daysDifference} days`;
              } else if (daysDifference < 0) {
                return `${Math.abs(daysDifference)} days ago`;
              }
            }
            return null; // Return null if no deadline logic applies
          };

          return {
            id: item.id,
            slNo: index + 1,
            reference: item.reference_number,
            vendor: item.vendor.vendor_name,
            buyer: item.buyer,
            orderDeadline: getOrderDeadline(item.order_dateline, item.status),
            sourceDocument: item.source_document,
            total: `${getGeneralSettingssymbol} ${item.total_amount}`,
            is_parent: item.is_parent,
            status: item.status,
            status_return:
            item.status === 1
            ? `<label class="badge badge-outline-active"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Active</label>`
            : item.status === 2
            ? `<label class="badge badge-outline-quotation"><i class="fas fa-circle f-s-8 d-flex me-1"></i>RFQ</label>`
            : item.status === 3
            ? `<label class="badge badge-outline-yellowGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Reviewing</label>`
            : item.status === 4
            ? `<label class="badge badge-outline-green mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Approved from Admin</label>`
            : item.status === 5
            ? `<label class="badge badge-outline-green mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Order Confirmed</label>`
            : item.status === 6
            ? `<label class="badge badge-outline-meantGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Fully Billed</label>`
            : item.status === 7
            ? `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Done</label>`
            : item.status === 8
            ? `<label class="badge badge-outline-danger "><i class="fas fa-circle f-s-8 d-flex me-1"></i>Rejected</label>`
            : item.status === 9
            ?`<label class="badge badge-outline-warning "><i class="fas fa-circle f-s-8 d-flex me-1"></i>Final Approval Pending</label>`
            
            : "Unknown",
          };
        });
        setData(transformedData);
        console.log(transformedData);

        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        if (err.response.data == 401) {
          Logout();
        }
      });
  };
  useEffect(() => {
    TaskData();
  }, []);

  const handleStatusChange = async (id, sid) => {
    const response = await PrivateAxios.put(
      `purchase/statuschange/${id}/${sid}`
    );
    const jsonData = response.data;
    if (response.status == 200) {
      SuccessMessage("Status Changed Successfully.!");
      TaskData();
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
    if (data && data.length > 0) {
      excelExportRef.current.save();
    } else {
      alert("No data available for export.");
    }
  };
  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span className="k_table_link"><Link to={`/purchase/${dataItem.id}`}>{dataItem.reference}</Link></span>


          {dataItem.is_parent === 1 && "   "} {/* Add a space */}
          {dataItem.is_parent == 1 && <i
            className="fas fa-star"
            style={{ fontSize: "15px", color: "#007bff", cursor: "pointer" }}
          ></i>}

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
              <i class="fas fa-pen"></i>
            </Link>
          </Tooltip>
          {(dataItem.status === 4 || dataItem.status === 8) && (
            <Tooltip title="Show Managment Remarks">
              <button
                className="me-1 icon-btn"
                onClick={() => {
                  setLgShow(true);
                  showReview(dataItem.id);
                }}
              >
                <i class="fas fa-info-circle"></i>
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
          {dataItem.is_parent == 1 && dataItem.status == 4 && (
            <Tooltip title="Confirm Order">
              <button
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleStatusChange(dataItem.id, 9)}
              >
                <i className="fas fa-external-link-alt"></i>
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
          </Tooltip>

        </div>
      </td>
    );
  };


  return (
    <React.Fragment>
      {isLoading && <Loader />}

      <OperationsPageTopBar />
      <CreateRfqStatusBar />

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

                      <GridColumn field="slNo" title="sl No." filterable={false} width="100px" locked={true} />
                      <GridColumn field="reference" title="reference" filterable={false} filter="text" cell={ReferenceCell} width="150px" />
                      <GridColumn field="vendor" title="vendor" filterable={false} filter="text" width="250px" />
                      <GridColumn field="buyer" title="buyer" filterable={false} filter="text" width="200" />
                      <GridColumn field="orderDeadline" title="Order Deadline" filterable={false} filter="numeric" width="200px" />
                      <GridColumn field="sourceDocument" title="source Document" filterable={false} filter="text" width="200px" />
                      <GridColumn field="total" title="total" filterable={false} filter="text" width="200px" />
                      {/* <GridColumn field="status" title="STATUS" filter="text" filterable={false} width="200" /> */}
                      <GridColumn
                      field="status_return"
                      title="Status"
                      width="180px"
                      cell={StatusCell} // Use custom cell renderer
                    />
                      <GridColumn title="action" filter="text" cell={ActionCell} filterable={false} width="200px" />
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
    </React.Fragment>
  );
}

export default CrateFinalPending;
