import React, { useEffect, useRef, useState } from "react";

import "jspdf-autotable";

import "react-datepicker/dist/react-datepicker.css";

import { Link } from "react-router-dom";

import { Modal } from "react-bootstrap";
import {
  ErrorMessage,
  SuccessMessage,
} from "../../../environment/ToastMessage";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios, url } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import Loader from "../../../environment/Loader";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import SalesQuotationPageTopBar from "./SalesQuotationPageTopBar";
import SalesQuotationStatusBar from "./SalesQuotationStatusBar";

function MypurchaseList() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } =
    UserAuth();

  const [lgShow, setLgShow] = useState(false);

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
    console.log(ida);
    try {
      const response = await PrivateAxios.get(`/sales/getremarks/${ida}`);
      if (response.status === 200) {
        setreview(response.data);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };
  //

  const generatePDF = async (id, val) => {
    setIsLoading(true);
    try {
      const filename = `purchase_order_${val}.pdf`;
      const response = await PrivateAxios.get(
        `sales/generatePDFForvendor/${id}`,
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

  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span>
            {" "}
            <Link to={`/sales/${dataItem.id}`} className="k_table_link">{dataItem.reference}</Link>
          </span>
        </div>
      </td>
    );
  };

  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("sales/all-sales-quotetionreject")
      .then((res) => {
        const transformedData = res.data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          creationDate: new Date(item.created_at).toLocaleString(),
          customer: item.customer && item.customer.name,
          salesPerson: item.buyer,
          total: `${getGeneralSettingssymbol}${item.total_amount}`,
          status: item.status,
          is_parent: item.is_parent,
          status_return:
            item.status === 1
              ? `<label class="badge badge-outline-active"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Active</label>`
              : item.status === 2
                ? `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Quotation Created</label>`
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

  const handleStatusChange = async (id, sid) => {
    const response = await PrivateAxios.put(`sales/statuschange/${id}/${sid}`);
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
    if (excelExportRef.current) {
      excelExportRef.current.save();
    }
  };

  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div className="d-flex gap-2">
          <Tooltip title="Edit">
            <Link
              to={{ pathname: `/sales/${dataItem.id}` }}
              state={{ data: dataItem }}
              className="me-1 icon-btn"
            >
              <i class="fas fa-pen d-flex"></i>
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
          <Tooltip title="View Pdf">
            <button
              className="me-1 icon-btn"
              onClick={() => generatePDF(dataItem.id, dataItem.reference)}
            >
              <i class="fas fa-eye d-flex"></i>
            </button>
          </Tooltip>

          {(dataItem.status == 2 || dataItem.status == 8) && (
            <Tooltip title="Send Approval">
              <button
                className="me-1 icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleStatusChange(dataItem.id, 3)}
              >
                <i className="fas fa-file-alt d-flex"></i>
              </button>
            </Tooltip>
          )}
        </div>
      </td>
    );
  };


  const StatusCell = (props) => {
    return (
      <td
        dangerouslySetInnerHTML={{ __html: props.dataItem[props.field] }}
      ></td>
    );
  };

  return (
    <React.Fragment>
      {isLoading && <Loader />}
      <SalesQuotationPageTopBar />
      <SalesQuotationStatusBar />

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
                      {/* <GridColumn field="vendor" title="vendor" filter="text" filterable={false} width="250px" /> */}
                      <GridColumn field="creationDate" title="Creation Date" filterable={false} filter="numeric" width="200px" />
                      <GridColumn field="customer" title="Customer" filterable={false} filter="text" width="200px" />
                      <GridColumn field="salesPerson" title="Sales Person" filter="text" filterable={false} width="200" />
                      {/* <GridColumn field="sourceDocument" title="source DocumentT" filterable={false} filter="text" width="200px" /> */}
                      <GridColumn field="total" title="total" filter="text" filterable={false} width="200px" />
                      <GridColumn
                        field="status_return"
                        title="Status"
                        width="180px"
                        cell={StatusCell} // Use custom cell renderer
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

      {/* Description modal end */}
      <Modal
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {getReview.remark != null
              ? getReview.remark.reference_number
              : "Ahh !"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          dangerouslySetInnerHTML={{
            __html:
              getReview.remarks != "" ? getReview.remarks : "No Remarks Found",
          }}
        ></Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

export default MypurchaseList;
