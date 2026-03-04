import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";


import "react-datepicker/dist/react-datepicker.css";

// import { Link } from "react-router-dom";
// import {
//   // Button,
//   // Table,
//   // Alert,
//   Modal,
//   // OverlayTrigger,
//   // Popover,
// } from "react-bootstrap";

import "handsontable/dist/handsontable.full.min.css";
import { Axios, PrivateAxios } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";


// import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";

import moment from "moment";
import "react-quill/dist/quill.snow.css"; // Import the styles


import { Tooltip } from "antd";
import ManagementStatusBar from "./ManagementStatusBar";
import PORemarksModalComponent from "../../ModalComponents/PORemarksModalComponent";
// import ManagementPageTopBar from "../ManagementPageTopBar";


function RejectedFromAdmin() {
  const { isLoading, setIsLoading, Logout } =
    UserAuth();

  //for-data table

  const [lgShow, setLgShow] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });

  // Custom Cell for rendering HTML in the "Status" column
const StatusCell = (props) => {
  return (
    <td
      dangerouslySetInnerHTML={{ __html: props.dataItem[props.field] }}
    ></td>
  );
};

  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("purchase/all-rejected-purchase")
      .then((res) => {
        const transformedData = res.data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number || "N/A",
          vendor: item.vendor?.vendor_name || "N/A",
          buyer: item.buyer || (item.createdBy?.name) || "N/A",
          store: item.warehouse?.name || "N/A",
          expectedArrival: item.expected_arrival ? moment(item.expected_arrival).format("DD-MM-YYYY") : "N/A",
          // orderDeadline: moment(item.order_dateline).format("DD-MM-YYYY H:mm"),
          // sourceDocument: item.source_document,
          total: `₹ ${item.total_amount || 0}`,
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
          ? `<label class="badge badge-outline-accent mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Approved from Admin</label>`
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
  useEffect(() => {
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

  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div className="d-flex gap-2">
          <Tooltip title="Show Management Remarks">
            <a
              className="me-1 table-btn"
              onClick={() => {
                setSelectedPOId(dataItem.id);
                setLgShow(true);
              }}
            >
              <i class="fas fa-eye d-flex"></i>
            </a>
          </Tooltip>
        </div>
      </td>
    );
  };

 
  return (
    <React.Fragment>
      {/* <ManagementPageTopBar /> */}
      <ManagementStatusBar />

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-3 px-3">
                <div className="table-button-group mb-2 ms-auto">
                  <GridToolbar className="border-0 gap-0">
                    <Tooltip title="Export to PDF">
                      <button type='button' className="table-export-btn" onClick={handleExportPDF}>
                        <i class="far fa-file-pdf d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                    <Tooltip title=" Export to Excel">
                      <button type='button' className="table-export-btn" onClick={handleExportExcel}>
                        <i class="far fa-file-excel d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                  </GridToolbar>
                </div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <PDFExport ref={pdfExportRef}>
                      <ExcelExport data={data} ref={excelExportRef}>
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
                          <GridColumn
                            field="slNo"
                            title="Sl No."
                            filter="text"
                            width="100px"
                            filterable={false}
                          />
                          <GridColumn
                            field="reference"
                            title="Reference"
                            filter="text"
                            width="250px"
                          />
                          <GridColumn
                            field="vendor"
                            title="Vendor"
                            filter="text"
                            width="250px"
                          />
                          <GridColumn
                            field="store"
                            title="Store"
                            filter="text"
                            width="250px"
                          />
                          <GridColumn
                            field="buyer"
                            title="Buyer"
                            filter="text"
                            width="250px"
                          />
                          <GridColumn
                            field="expectedArrival"
                            title="Expected Arrival"
                            filter="text"
                            width="200px"
                          />
                          <GridColumn
                            field="total"
                            title="Total"
                            filter="text"
                            width="150px"
                          />
                         <GridColumn
                          field="status_return"
                          title="Status"
                          width="180px"
                          cell={StatusCell} // Use custom cell renderer
                        />
                          <GridColumn
                            title="Action"
                            filter="text"
                            cell={ActionCell}
                            filterable={false}
                            width="150px"
                          />
                        </Grid>
                      </ExcelExport>
                    </PDFExport>


              </div>
            </div>
          </div>
        </div>
      </div>



      {/* ========================================================= modal start here */}

      <PORemarksModalComponent
        show={lgShow}
        onHide={() => {
          setLgShow(false);
          setSelectedPOId(null);
        }}
        purchaseOrderId={selectedPOId}
        title="Management Remarks"
      />
    </React.Fragment>
  );
}


export default RejectedFromAdmin;
