import React, { useEffect, useState } from "react";

import "react-datepicker/dist/react-datepicker.css";

import "jspdf-autotable";

import { Link } from "react-router-dom";
import { Dropdown, Modal, Table } from "react-bootstrap";

import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios, url } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import Loader from "../../../environment/Loader";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import moment from "moment";
import {
  ErrorMessage,
  SuccessMessage,
} from "../../../environment/ToastMessage";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import FollowupPageTopBar from "../../follow/FollowupPageTopBar";
import FollowupStatusBar from "../../follow/FollowupStatusBar";
import FollowupOrderStatusBar from "./FollowupOrderStatusBar";
import FollowupOrderPageTopBar from "./FollowupOrderPageTopBar";

function FollowupOrder() {
  const {
    isLoading,
    setIsLoading,
    Logout,

    getGeneralSettingssymbol,
  } = UserAuth();
  //for-data table

  const handleClose = () => setShow(false);
  const [editorContent, setEditorContent] = useState("");
  const [getfolowup, setFollowupdateContent] = useState("");
  const [deleteShow, setDeleteShow] = useState(false);
  const handleShow = () => setShow(true);
  const [deleteId, setDeleteId] = useState(null);

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

  const [getPid, setPid] = useState(false);
  const [getReff, setReff] = useState("");

  const [show, setShow] = useState(false);
  const getRef = (pid, ref) => {
    setReff(ref);
    setPid(pid);
  };

  const deleteModalClose = () => setDeleteShow(false);
  // const deleteModalShow = () => setDeleteShow(true);
  //delete
  const deleteModalShow = (id) => {
    setDeleteId(id);
    setDeleteShow(true);
  };

  const handleStatusChange = async () => {
    const sid = 6;
    const response = await PrivateAxios.put(
      `sales/statuschange/${deleteId}/${sid}`
    );

    if (response.status == 200) {
      SuccessMessage("Successfully Recorded.!");
      setDeleteShow(false);
      TaskData();
    }
  };
  //end delete

  //pdf

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };
  const handleFollowupdateChange = (content) => {
    setFollowupdateContent(content);
  };
  const getRemarks = (rmks, refid) => {
    console.log(rmks, "sumit");

    const sortedFollowupData = rmks.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const followupData = sortedFollowupData
      .map(
        (followup) => `
          <tr key=${followup.id}>
              <td>${followup.content}</td>
               <td>${new Date(
          followup.next_followup_date
        ).toLocaleString()}</td>
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
      getfolowup,
    };
    PrivateAxios.post("sales/addfollowup", dataToSend)
      .then((res) => {
        if (res.status === 200) {
          setEditorContent("");
          setFollowupdateContent("");
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

    try {
      const res = await PrivateAxios.get("sales/getallpurchaseorderfollowup");

      const transformedData = res.data.map((item, index) => {
        // Sort the followup array by next_followup_date (if followup exists)
        const sortedFollowup =
          item.followup && item.followup.length > 0
            ? item.followup.sort(
              (a, b) =>
                new Date(a.next_followup_date) -
                new Date(b.next_followup_date)
            )
            : [];

        // Pick the next_followup_date (earliest) if followups exist
        const nextFollowupDate =
          sortedFollowup.length > 0
            ? sortedFollowup[0].next_followup_date
            : null;

        return {
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          customer_reference: item.customer_reference,
          creation: moment(item.created_at).format("DD-MM-YYYY H:mm"),
          expiration: moment(item.expiration).format("DD-MM-YYYY H:mm"),
          customer: item.customer?.name || "N/A",
          buyer: item.buyer,
          total: `${getGeneralSettingssymbol}${item.total_amount}`,
          status: item.status,
          nextFollowup: nextFollowupDate
            ? moment(nextFollowupDate).format("DD-MM-YYYY H:mm")
            : "No Follow-Up",
          is_parent: item.is_parent,
          mailsend_status: item.mailsend_status,
          parent_recd_id: item.parent_recd_id,
          payment_terms: item.payment_terms,
          products: item.products,
          followup: sortedFollowup,
          productsreprodut: item.productsreprodut,
          source_document: item.productsreprodut,
          untaxed_amount: item.untaxed_amount,
          uploadpo: item.uploadpo,
          user_id: item.user_id,
          status_return: item.status === 5 ? "Follow Up" : "Unknown",
        };
      });

      setData(transformedData);
    } catch (err) {
      console.error("Error fetching task data:", err);
      if (err.response?.status === 401) {
        Logout();
      } else {
        alert("An error occurred while fetching data.");
      }
    } finally {
      setIsLoading(false);
    }
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
                  dataItem.customer.name + " - " + dataItem.reference
                );
              }}
            >
              {dataItem.reference}{" "}
              <i
                className="fas fa-info-circle"
                style={{
                  fontSize: "15px",
                  color: "#007bff",
                  cursor: "pointer",
                }}
              ></i>
            </a>
          </span>
        </div>
      </td>
    );
  };

  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div className="d-flex gap-2">
          <Tooltip title="Check Followup Details">
            <Link
              onClick={() => {
                RemarksShow(true);
                getRemarks(
                  dataItem.followup,
                  dataItem.customer.name + " - " + dataItem.reference
                );
              }}
              className="me-1 icon-btn"
            >
              <i class="fas fa-info"></i>
            </Link>
          </Tooltip>

          <Tooltip title="Follow Up">
            <button
              onClick={() => {
                handleShow(true);
                getRef(
                  dataItem.id,
                  dataItem.customer.name + " - " + dataItem.reference
                );
              }}
              className="me-1 icon-btn"
            >
              <i class="fas fa-file-alt"></i>
            </button>
          </Tooltip>
          {dataItem.followup.length > 0 && (
            <Tooltip title="Done Followup">
              <button
                onClick={() => deleteModalShow(dataItem.id)}
                className="me-1 icon-btn"
              >
                <i className="fas fa-check-circle"></i>
              </button>
            </Tooltip>
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

        <label className="badge badge-outline-active mb-0"><i className="fas fa-circle f-s-8 d-flex me-1"></i>Follow Up</label>
        {/* {value} */}
      </td>
    );
  };


  return (
    <React.Fragment>
      {isLoading && <Loader />}

      <FollowupOrderPageTopBar />
      <FollowupOrderStatusBar />

      <div className="p-4">
        <div className="row">
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

                        <GridColumn field="reference" title="reference" filterable={false} filter="text" cell={ReferenceCell} width="150px" />
                        <GridColumn field="expiration" title="Expiration" filterable={false} width="220px" locked={true} />
                        <GridColumn field="customer" title="Customer" filterable={false} filter="text" width="200px" />
                        {/* <GridColumn field="vendor" title="vendor" filter="text" filterable={false} width="250px" /> */}
                        <GridColumn field="buyer" title="buyer" filter="text" filterable={false} width="200" />
                        {/* <GridColumn field="expectedArrival" title="expected Arrival " filterable={false} filter="numeric" width="200px" /> */}
                        {/* <GridColumn field="sourceDocument" title="source DocumentT" filterable={false} filter="text" width="200px" /> */}
                        <GridColumn field="total" title="total" filter="text" filterable={false} width="200px" />
                        <GridColumn field="nextFollowup" title="Next Followup" filter="numeric" width="200px" />
                        {/* <GridColumn field="status" title="STATUS" filter="text" filterable={false} width="200" /> */}
                        <GridColumn
                          field="status_return"
                          title="Billing Status"
                          // filter="dropdown"
                          width="250px"
                          filterable={false}
                          // filterCell={CustomDropDownFilter}
                          cells={{
                            data: CustomCell
                          }}
                        />
                        <GridColumn title="action" filter="text" cell={ActionCell} filterable={false} width="150px" />
                      </Grid>
                    </ExcelExport>
                  </PDFExport>



                </div>
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
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">{getReff}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="col-12">
              <div className="form-group">
                <label className="form-label date-label">Next Followup Date</label>
                {/* <input
                  type="datetime-local"
                  value={
                    getfolowup != ""
                      ? new Date(getfolowup).toJSON().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => handleFollowupdateChange(e.target.value)}
                  required
                  className="form-control"
                /> */}
                <div className="exp-datepicker-cont">
                  <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                  <DatePicker
                    selected={getfolowup}
                    onChange={(date) => handleFollowupdateChange(date)}
                    showTimeSelect
                    timeFormat="hh:mm aa"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy hh:mm aa"
                    placeholderText="Select Date and Time"
                    className="form-control"
                    required
                  />
                </div>
              </div>
            </div>
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
              <button class="btn btn-success" type="submit">
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
            <Table
              // striped
              responsive
              // hover
              className="table-bordered primary-table-head"
            >
              {/* <table className="table table-smtable-responsive-sm"> */}
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Next Followup date</th>
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

      {/* Delete modal start */}
      <Modal
        show={deleteShow}
        onHide={deleteModalClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="delete-confirm-wrap text-center">
            <div className="delete-confirm-icon mb-3 mt-2">
              <img
                src={process.env.PUBLIC_URL + "/assets/images/check-mark.png"}
                alt="Warning"
                className="img-fluid"
              />
            </div>
            <h4 className="text-muted">Are you sure?</h4>
            <p className="text-muted f-s-14">
              Do you really want to done these record? This process cannot be
              undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <button type='reset' className="btn btn-secondary" onClick={deleteModalClose}>
            Cancel
          </button>
          <button type='submit' className="btn btn-success" onClick={handleStatusChange}>
            Submit
          </button>
        </Modal.Footer>
      </Modal>
      {/* Delete modal end */}
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
