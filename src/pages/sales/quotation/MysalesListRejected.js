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
  Tooltip,
} from "react-bootstrap";
import Handsontable from "handsontable/base";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios, url } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import Loader from "../../../environment/Loader";

import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
import {
  AllUser,
  GetTaskPriority,
  GetTaskStatus,
} from "../../../environment/GlobalApi";
import {
  exportExcel,
  exportPDF,
  printTable,
} from "../../../environment/exportTable";

function MypurchaseListRejected() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } = UserAuth();

  //for-data table
  const [value, setValue] = useState(true);
  const [grid, setGrid] = useState(false);
  const [doerShow, setDoerShow] = useState(false);
  const [detailsShow, setDetailsShow] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [descriptionShow, setDescriptionShow] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const [tableData, setTableData] = useState([]);
  const [lgShow, setLgShow] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [data, setData] = useState([]);
  const [getReview, setreview] = useState("");

  const [searchData, setSearchData] = useState({
    name: "",
    assign_to: "",
    task_priority_id: "",
    delegation_status_id: "",
  });
  //managment review
  const showReview = async (ida) => {

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


  const [User, setUser] = useState([{ value: "select", label: "-Select-" }]);
  const [priorityAllData, setPriorityAllData] = useState([
    { value: "select", label: "-Select-" },
  ]);
  const [taskStatusAllData, setTaskStatusAllData] = useState([
    { value: "select", label: "-Select-" },
  ]);
  const [keUpSearch, setKeUpSearch] = useState([]);
  const [getPrintID, PrintsetId] = useState("");
  //delete modal
  const deleteModalClose = () => setDeleteShow(false);
  // const deleteModalShow = () => setDeleteShow(true);



  //description modal
  const descriptionModalClose = () => {
    setDescriptionShow(false);
    setDescriptionData("");
  };
  const descriptionModalShow = (e) => {
    setDescriptionShow(true);
    setDescriptionData(e);
  };
  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("sales/all-rejected-purchase")
      .then((res) => {

        setTableData(res.data);
        setData(res.data);

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


  const customStyles = {
    header: {
      style: {
        minHeight: "56px",
      },
    },
    headRow: {
      style: {
        borderTopStyle: "solid",
        borderTopWidth: "1px",
        borderTopColor: "#d0d4e4",
        backgroundColor: "#e3fffe",
      },
    },
    headCells: {
      style: {
        "&:not(:last-of-type)": {
          borderRightStyle: "solid",
          borderRightWidth: "1px",
          borderRightColor: "#d0d4e4",
        },
      },
    },
    cells: {
      style: {
        "&:not(:last-of-type)": {
          borderRightStyle: "solid",
          borderRightWidth: "1px",
          borderRightColor: "#d0d4e4",
        },
      },
    },
  };
  //

  //

  const [selectedColumns, setSelectedColumns] = useState([
    {
      name: "Sl No.",
      cell: (row, index) => index + 1,
      minWidth: "80px",
      maxWidth: "80px",
    },
    {
      name: "Reference",
      selector: (row) => (

        row.reference_number
      ),
      sortable: true,
      reorder: true,
    },
    {
      name: "Customer",
      selector: (row) => row.customer.name,
      sortable: true,
      reorder: true,
    },
    {
      name: "Salesman",
      selector: (row) => row.buyer,
      sortable: true,
      reorder: true,
    },

    {
      name: "Creation Date",
      selector: (row) => new Date(row.created_at).toLocaleDateString(),
      sortable: true,
      reorder: true,
    },

    {
      name: "Total",
      selector: (row) => getGeneralSettingssymbol + row.total_amount,
      sortable: true,
      reorder: true,
    },
    {
      name: "Status",
      selector: (row) => {
        if (row.status === 1) {
          return "Active";
        }
        if (row.status === 2) {
          return "RFQ";
        } else if (row.status === 3) {
          return "REVIEWING";
        } else if (row.status === 4) {
          return "Approved from Admin";
        } else if (row.status === 5) {
          return "Order Confirmed";
        } else if (row.status === 6) {
          return "Fully Billed";
        } else if (row.status === 7) {
          return "Done";
        } else if (row.status === 8) {
          return "Rejected";
        }
      },
      conditionalCellStyles: [
        {
          when: (row) => {
            return row.status === 1;
          },
          style: {
            backgroundColor: "#00c875",
            color: "#242424",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          },
        },
        {
          when: (row) => {
            return row.status === 2;
          },
          style: {
            backgroundColor: "#ffc107",
            color: "#000",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          },
        },
        {
          when: (row) => {
            return row.status === 3;
          },
          style: {
            backgroundColor: "rgb(247, 116, 136)",
            color: "#000",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          },
        },
        {
          when: (row) => {
            return row.status === 4;
          },
          style: {
            backgroundColor: "rgb(169, 169, 169)",
            color: "#000",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          },
        },
        {
          when: (row) => {
            return row.status === 5;
          },
          style: {
            backgroundColor: "rgb(247, 116, 136)",
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          },
        },
        {
          when: (row) => {
            return row.status === 6;
          },
          style: {
            backgroundColor: "#52A7FB",
            color: "#000",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          },
        },
        {
          when: (row) => {
            return row.status === 7;
          },
          style: {
            backgroundColor: "#30F400",
            color: "#000",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          },
        },
        {
          when: (row) => {
            return row.status === 8;
          },
          style: {
            backgroundColor: "#FF0000",
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          },
        },
      ],
      sortable: true,
      reorder: true,
    },
    {
      name: "Action",
      headerStyle: { textAlign: "center" },
      selector: (row) => null, selector: (row) => null,
      cell: (row) => (
        <div className="d-flex">



          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Show Managment Remarks</Tooltip>}
          >
            <button
              className="me-1 icon-btn"
              onClick={() => {
                setLgShow(true);
                showReview(row.id);
              }}
            >
              <i class="fas fa-info-circle"></i>
            </button>
          </OverlayTrigger>

        </div>
      ),
    },
  ]);

  const handleColumnToggle = (column) => {
    const currentIndex = selectedColumns.findIndex(
      (col) => col.name === column.name
    );
    if (currentIndex === -1) {
      setSelectedColumns([...selectedColumns, column]);
    } else {
      const newColumns = [...selectedColumns];
      newColumns.splice(currentIndex, 1);
      setSelectedColumns(newColumns);
    }
  };

  const CustomColumnToggle = () => (
    <div className="dropdown-menu">
      <div>
        {selectedColumns.map((column, index) => (
          <div key={index} className="form-check form-switch me-2">
            <input
              className="form-check-input"
              type="checkbox"
              id={column.name}
              checked={
                selectedColumns.findIndex((col) => col.name === column.name) !==
                -1
              }
              onChange={() => handleColumnToggle(column)}
            />
            <label className="form-check-label" htmlFor={column.name}>
              {column.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
  //for grid columns
  const gridColumns = [
    {
      title: "Reference",
      type: "text",
      data: "reference_number",
    },
    {
      title: "Vendor",
      type: "text",
      data: "vendor_id",
    },
    {
      title: "Buyer",
      type: "text",
      data: "buyer",
    },
    {
      title: "Order Deadline",
      type: "text",
      data: "order_dateline",
    },
    {
      title: "Source Document",
      type: "text",
      data: "source_document",
    },
    {
      title: "Total",
      type: "text",
      data: "total_amount",
    },
  ];
  //for datepicker

  const tableView = () => {
    setGrid(false);
  };
  const gridView = () => {
    setGrid(true);
  };

  const SearchData = (e) => {
    const filterData = data.filter((item) => {
      return Object.keys(searchData).every((key) => {
        const searchValue = searchData[key];
        const itemValue = item[key];
        if (!searchValue) return true;
        if (itemValue === undefined || itemValue === null) return false;
        if (typeof itemValue === "string") {
          return itemValue
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(searchValue.toLowerCase().replace(/\s+/g, ""));
        }

        if (typeof itemValue === "number") {
          return itemValue
            .toString()
            .replace(/\s+/g, "")
            .includes(searchValue.toString().replace(/\s+/g, ""));
        }
        return false;
      });
    });

    setTableData(filterData);
  };

  const handleKeyUpSearch = (e) => {
    const filteredItems = data.filter((item) => {
      return (
        item &&
        item.reference_number &&
        item.reference_number.toString()
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(e.target.value.toLowerCase().replace(/\s+/g, ""))
      );
    });
    setTableData(filteredItems);
  };
  return (
    <React.Fragment>
      {isLoading && <Loader />}
      <div className="row">
        <div className="col-md-12 col-sm-12 mb-3 d-flex justify-content-end">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Create New</Tooltip>}
          >
            <Link to="/sales/new" className="me-2 btn btn-exp-green">
              <i className="bi bi-plus-circle me-2"></i>
              New
            </Link>
          </OverlayTrigger>

        </div>

      </div>

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center">
          <h3 className="card-title">Rejected Quotation</h3>
          <div className="d-flex ms-auto align-items-center">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Table View</Tooltip>}
            >
              <button
                className={`icon-btn me-2 ${!grid ? "icon-btn-active" : ""}`}
                onClick={tableView}
              >
                <i className="bi bi-table" />
              </button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Grid View</Tooltip>}
            >
              <button
                className={`icon-btn ${grid ? "icon-btn-active" : ""}`}
                onClick={gridView}
              >
                <i className="bi bi-grid-3x3" />
              </button>
            </OverlayTrigger>
          </div>
        </div>
        <div className="card-body">
          {!tableData.length > 0 ? (
            <div div className="w-100">
              <div className="card bg-warning-light mb-0">
                <div className="card-body">
                  <div className="exp-no-data-found text-exp-red">
                    <img
                      className="task-img mb-3"
                      src={
                        process.env.PUBLIC_URL +
                        "assets/images/search-no-record-found.webp"
                      }
                      alt="No task"
                    />
                    <h6>No Record Found</h6>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {!grid ? (
                <div className="table-view">
                  <div className="d-flex justify-content-between">
                    <div className="table-button-group mb-3">
                      <button type='button' className='btn table-export-btn' onClick={() => exportExcel(selectedColumns, tableData, "rfq")}>
                        <i className="fas fa-file-alt"></i>
                      </button>
                      <button type='button' className='btn table-export-btn' onClick={() => exportPDF(selectedColumns, tableData, "rfq")}>
                        <img src={process.env.PUBLIC_URL + 'assets/images/file-pdf.svg'} alt="icon" />
                      </button>
                      <button type='button' className='btn table-export-btn' onClick={() => printTable(selectedColumns, tableData, "rfq")}>
                        <i className="fas fa-print"></i>
                      </button>
                    </div>
                    <div className="d-flex align-items-center">
                      <label className="mr-2 mb-0">Reference: </label>
                      <input
                        type="text"
                        placeholder="e.i: 4356334"
                        onChange={handleKeyUpSearch}
                        className="form-control form-control-sm"
                      />
                    </div>
                  </div>

                  <DataTable
                    //fixedHeader
                    //highlightOnHover
                    //theme="solarized"
                    //striped
                    // defaultSortAsc
                    // persistTableHead
                    // selectableRowsHighlight

                    columns={selectedColumns}
                    data={tableData}
                    pagination={[5, 10, 25, 50]}
                    theme="solarized"
                    striped
                    className="custom-table-wrap checklist-table-striped"
                    customStyles={customStyles}
                  //subHeader
                  //subHeaderComponent={<CustomColumnToggle />}
                  />
                </div>
              ) : (
                <div className="grid-view">
                  <HotTable
                    data={tableData}
                    columns={gridColumns}
                    filters={true}
                    dropdownMenu={[
                      "filter_by_condition",
                      "filter_operators",
                      "---------",
                      "filter_by_value",
                      "filter_action_bar",
                    ]}
                    width="100%"
                    height="auto"
                    colHeaders={true}
                    rowHeaders={true}
                    hiddenColumns={true}
                    //colWidths={[200, 200, 200, 200, 200, 120, 100]}
                    manualColumnResize={true}
                    manualColumnMove={true}
                    manualRowMove={true}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    contextMenu={true}
                    multiColumnSorting={true}
                    stretchH="all"
                    licenseKey="non-commercial-and-evaluation"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>


      {/* Description modal start */}
      <Modal
        show={descriptionShow}
        onHide={descriptionModalClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-12">
              <p className="mb-0 text-muted">{descriptionData}</p>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Description modal end */}
      <Modal
        size="lg"
        backdrop="static"
        keyboard={false}
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {getReview.remark != null ? getReview.remark.reference_number : "Ahh !"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          dangerouslySetInnerHTML={{
            __html: getReview.remarks != "" ? getReview.remarks : "No Remarks Found",
          }}
        ></Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

export default MypurchaseListRejected;
