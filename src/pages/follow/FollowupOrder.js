import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "jspdf-autotable";
import { Link } from "react-router-dom";
import { Dropdown, Modal, Table } from "react-bootstrap";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios, url } from "../../environment/AxiosInstance";
import { UserAuth } from "../auth/Auth";
import Loader from "../landing/loder/Loader";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import moment from "moment";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import FollowupPageTopBar from "./FollowupPageTopBar";
import FollowupStatusBar from "./FollowupStatusBar";

function FollowupOrder() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } =
    UserAuth();
  //for-data table

  const handleClose = () => setShow(false);
  const [editorContent, setEditorContent] = useState("");
  const handleShow = () => setShow(true);

  const RemarksClose = () => setShowremark(false);
  const RemarksShow = () => setShowremark(true);
  const [getshowRemarks, setShowremark] = useState(false);
  const [getRemarksdata, getremarkdata] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });
  const [getRemarksRef, getremarksRef] = useState("");

  const [getPid, setPid] = useState(false);
  const [getReff, setReff] = useState("");

  const [show, setShow] = useState(false);
  const getRef = (pid, ref) => {
    setReff(ref);
    setPid(pid);
  };

  //pdf

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      getPid,
      editorContent,
    };

    PrivateAxios.post("purchase/addfollowup", dataToSend)
      .then((res) => {
        if (res.status === 200) {
          setEditorContent("");
          handleClose(true);
          SuccessMessage("Remarks added successfully");
          TaskData();
        }
      })
      .catch((err) => {
        ErrorMessage(
          "Error: Server busy please try again after some time later"
        );
      });
  };
  //description modal

  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("purchase/getallpurchaseorderfollowup")
      .then((res) => {
        const transformedData = res.data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          confirmationDate: moment(item.order_dateline).format(
            "DD-MM-YYYY H:mm"
          ),
          vendor: item.vendor.vendor_name,
          buyer: item.buyer,
          total: `${getGeneralSettingssymbol} ${item.total_amount}`,
          is_parent: item.is_parent,
          expectedArrival: moment(item.expected_arrival).format(
            "DD-MM-YYYY H:mm"
          ),
          status: item.status,
          followup: item.followup,
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
  useEffect(() => {
    TaskData();
  }, []);

  const ReferenceCell = (props) => {
    const { dataItem } = props;
    console.log(dataItem);

    return (
      <td>
        <div>
          <a
            className="k_table_link"
            style={{ cursor: "pointer" }}
            onClick={() => {
              RemarksShow(true);
              getRemarks(
                dataItem.followup,
                dataItem.vendor + " - " + dataItem.reference
              );
            }}
          >
            {dataItem.reference}
            {"   "} {/* Add a space */}
            {<i class="fas fa-info-circle"></i>}
          </a>
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

  const CustomCell = (props) => {
    const { dataItem, field } = props;

    // Access the field value directly
    const value = dataItem[field];

    return (
      <td>

        <label className="badge badge-outline-purple"><i className="fas fa-circle f-s-8 d-flex me-1"></i>	Nothing to Bill</label>

        {/* {value} */}
      </td>
    );
  };

  const ActionCell = (props) => {
    const { dataItem } = props;
    console.log('hhhhhh-', dataItem);

    return (
      <td>
        <div className="d-flex gap-2">
          {dataItem.status !== 7 && dataItem.status !== 8 && (
            <>
              <Tooltip title="Check PO">
                <Link
                  target="_blank"
                  to={
                    url + "pdf/purchase_order_" + dataItem.reference + ".pdf"
                  }
                  className="me-1 icon-btn"
                >
                  <i class="far fa-file-pdf"></i>
                </Link>
              </Tooltip>

              <Tooltip title="Follow Up">
                <button
                  onClick={() => {
                    handleShow(true);
                    getRef(
                      dataItem.id,
                      dataItem.vendor +
                      " - " +
                      dataItem.reference
                    );
                  }}
                  className="me-1 icon-btn"
                >
                  <i class="far fa-comment-dots"></i>

                </button>
              </Tooltip>
            </>
          )}
        </div>
      </td>
    );
  };

  return (
    <React.Fragment>
      {isLoading && <Loader />}

      <FollowupPageTopBar />
      <FollowupStatusBar />


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
                        title="Billing Status"
                        filterable={false}
                        filter="dropdown"
                        width="250px"
                        // filterCell={CustomDropDownFilter}
                        cells={{
                          data: CustomCell
                        }}
                      />
                      <GridColumn field="expectedArrival" title="Expected Arrival" filterable={false} filter="text" width="200px" format="{0:dd-MM-yyyy}" />
                      <GridColumn title="action" filter="text" cell={ActionCell} filterable={false} width="150px" />
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
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">{getReff}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div
            // style={{ minHeight: "200px" }}
            >
              <ReactQuill
                value={editorContent}
                onChange={handleEditorChange}
                modules={FollowupOrder.modules}
                formats={FollowupOrder.formats}
                theme="snow"
              // style={{ minHeight: "200px" }}
              />
            </div>
            <div class=" d-flex justify-content-end pt-4">
              <button class="btn btn-exp-green" type="submit">
                Submit
              </button>
            </div>
          </form>
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
FollowupOrder.modules = {
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

FollowupOrder.formats = [
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

export default FollowupOrder;
