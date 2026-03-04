import React, { useEffect, useRef, useState } from "react";
import moment from "moment";

import jsPDF from "jspdf";
import "jspdf-autotable";

import "react-datepicker/dist/react-datepicker.css";

import { Link } from "react-router-dom";
import { Dropdown, Modal, Overlay } from "react-bootstrap";

import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios, url } from "../../environment/AxiosInstance";
import { UserAuth } from "../auth/Auth";
import Loader from "../../environment/Loader";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import PORemarksModalComponent from "../ModalComponents/PORemarksModalComponent";

function MypurchaseListRejected() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } =
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


  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("purchase/all-rejected-purchase")
      .then((res) => {
        const transformedData = res.data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          vendor: item.vendor.vendor_name,
          buyer: item.buyer,
          orderDeadline: moment(item.order_dateline).format("DD-MM-YYYY H:mm"),
          sourceDocument: item.source_document,
          total: `${getGeneralSettingssymbol} ${item.total_amount}`,
          is_parent: item.is_parent,
          status: item.status,
          status_return:
            item.status === 1
              ? "Active"
              : item.status === 2
                ? "RFQ"
                : item.status === 3
                  ? "REVIEWING"
                  : item.status === 4
                    ? "Approved from Admin"
                    : item.status === 5
                      ? "Order Confirmed"
                      : item.status === 6
                        ? "Fully Billed"
                        : item.status === 7
                          ? "Done"
                          : item.status === 8
                            ? "Rejected"
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
        </div>
      </td>
    );
  };

  return (
    <React.Fragment>
      {isLoading && <Loader />}

      <div className="row">
        <div className="col-12">
          <div className="page_breadcrumb">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item page--icon"><i className="fi fi-sr-shopping-cart-add"></i></li>
                <li className="breadcrumb-item arrow"><i className="fas fa-chevron-right"></i></li>
                <li className="breadcrumb-item">Purchase</li>
                <li className="breadcrumb-item arrow"><i className="fas fa-chevron-right"></i></li>
                <li className="breadcrumb-item">Operations</li>
                <li className="breadcrumb-item arrow"><i className="fas fa-chevron-right"></i></li>
                <li className="breadcrumb-item active" aria-current="page">Rejected Orders</li>
              </ol>
            </nav>
          </div>

          <div className="card mb-2">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h6 className="mb-1 fw-bold">
                    Rejected Quotation
                  </h6>
                  <div className="d-flex flex-wrap align-items-center">
                    <p className="my-1 me-3 f-s-15 fw-medium">Showing results for :
                    </p>
                    <label className="badge exp-badge-secondary-light mb-0">Status: Rejected</label>
                  </div>
                </div>
                <div>
                  <Link to="/purchase/new" className="btn btn-exp-purple">
                    <i className="fas fa-plus"></i><span className="ms-2">Create PO</span>
                  </Link>
                </div>
              </div>
              <hr />
              <div className="d-flex gap-2">
                <GridToolbar className="border-0 p-0 ms-auto export-btn-wrap">
                  <Tooltip title="Export to PDF">
                    <button type='button' className="link-btn tableDocBtn" onClick={handleExportPDF}>
                      <i class="far fa-file-pdf d-flex f-s-20"></i>
                    </button>
                  </Tooltip>
                  <Tooltip title=" Export to Excel">
                    <button type='button' className="link-btn tableDocBtn" onClick={handleExportExcel}>
                      <i class="far fa-file-excel d-flex f-s-20"></i>
                    </button>
                  </Tooltip>
                </GridToolbar>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="bg_succes_table_head rounded_table">
            <PDFExport ref={pdfExportRef}>
              <ExcelExport data={data} ref={excelExportRef}>
                <Grid
                  data={process(data, dataState)} // Add fallback for undefined data
                  filterable
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
                    title="SL NO."
                    filter="text"
                    width="100px"
                    filterable={false}
                  />
                  <GridColumn
                    field="reference"
                    title="REFERENCE"
                    filter="text"
                    width="250px"
                  // className="k_table_link"
                  />
                  <GridColumn
                    field="vendor"
                    title="VENDOR"
                    filter="text"
                    width="250px"
                  />
                  <GridColumn
                    field="buyer"
                    title="BUYER"
                    filter="text"
                    width="250px"
                  />
                  <GridColumn
                    field="orderDeadline"
                    title="Order Deadline"
                    filter="text"
                    width="250px"
                  />
                  <GridColumn
                    field="sourceDocument"
                    title="SOURCE DOCUMENT"
                    filter="text"
                    width="250px"
                  />
                  <GridColumn
                    field="total"
                    title="TOTAL"
                    filter="text"
                    width="150px"
                  />
                  <GridColumn
                    field="status_return"
                    title="Status"
                    filter="text"
                    width="180px"
                  />
                  {/* <GridColumn field="expectedArrival" title="Expected Arrival" filter="text" width="200px" /> */}
                  <GridColumn
                    title="ACTIONS"
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

      {/* Description modal end */}
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

export default MypurchaseListRejected;
