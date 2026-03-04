import React, { useEffect, useRef, useState } from "react";
import "jspdf-autotable";
import "react-datepicker/dist/react-datepicker.css";
import DataTable, { createTheme } from "react-data-table-component";
import { Link } from "react-router-dom";
import {
  Button,
  Table,
  Modal,
  OverlayTrigger,
} from "react-bootstrap";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios, url } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import Loader from "../../landing/loder/Loader";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
import moment from "moment";
import { BrowserRouter as Router, useNavigate, useParams } from "react-router-dom";

import {
  Grid,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the styles
import { DropDownList } from "@progress/kendo-react-dropdowns";
import ManagementPageTopBar from "../ManagementPageTopBar";
import ManagementStatusBar from "../approveQuotation/ManagementStatusBar";
import ManagementApprovalStatusBar from "./ManagementApprovalStatusBar";

function FinalApproval() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } = UserAuth();
  const { id } = useParams();
  //for-data table
  const [editorContent, setEditorContent] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [ProductCompare, setProductCompare] = useState([]);

  const [grid, setGrid] = useState(false);
  const [getdata, setsubmitdata] = useState([]);
  const [getPid, setPid] = useState(false);
  const [show, setShow] = useState(false);
  const [getshowRemarks, setShowremark] = useState(false);
  const [getRemarksdata, getremarkdata] = useState('');
  const [getRemarksRef, getremarksRef] = useState('');
  const [getReff, setReff] = useState('');
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const RemarksClose = () => setShowremark(false);
  const RemarksShow = () => setShowremark(true);
  const [tableData, setTableData] = useState([]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 5,
    sort: [],
    filter: null,
  });


  const navigate = useNavigate();
  const getRef = (pid, ref) => {
    setReff(ref)
    setPid(pid)
  }
  const getRemarks = (rmks, refid) => {
    getremarkdata(rmks)
    getremarksRef(refid)
  }

  const changeStatusfromAdmin = async (id, sid, oid) => {

    const response = await PrivateAxios.put(
      `purchase/statuschangefromadmin/${id}/${sid}`
    );
    const jsonData = response.data;
    if (response.status == 200) {
      SuccessMessage("Approved Successfully.!");
      setShowPrice(true);
      PriceCompare(oid);
      TaskData();
    }
  };
  const getStatus = (status) => {
    if (status === 1) {
      return "Active";
    } else if (status === 2) {
      return "RFQ";
    } else if (status === 3) {
      return "Send to management";
    } else if (status === 4) {
      return "Review Confirmed";
    } else if (status === 5) {
      return "Order Confirm";
    } else if (status === 8) {
      return "Rejected";
    } else if (status === 9) {
      return "Filan Approval Pending";
    }
  };
  const PriceCompare = async (ida) => {
    try {
      const response = await PrivateAxios.get(
        `/purchase/getPurchasecompareManagment/${ida}`
      ); // Adjust the URL to your API endpoint
      console.log(response.data);
      if (response.status === 200) {
        setProductCompare(response.data);
        setPid(ida);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };

  const handleCloseAfterReview = () => {
    if (areAllStatusesFive()) {
      setShowPrice(false);
      navigate('/operation/purchase-orders/received-done');
    } else {
      alert("All statuses must be 5 to close the modal.");
    }
  };
  const areAllStatusesFive = () => {
    return ProductCompare.every((productPriceCompare) => productPriceCompare.status === 5 || productPriceCompare.status === 8);
  };

  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("purchase/final-approval")
      .then((res) => {
        const transformedData = res.data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          vendor: item.vendor.vendor_name,
          buyer: item.buyer,
          expectedArrival: moment(item.expected_arrival).format("DD-MM-YYYY H:mm"),
          sourceDocument: item.source_document,
          total: `${getGeneralSettingssymbol} ${item.total_amount}`,
          is_parent: item.is_parent,
          status: item.status,
          status_return: item.status === 1
        
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

  const totalAmount = ProductCompare.reduce(
    (accumulator, productPriceCompare) => {
      // Convert total_amount to a number
      const amountToAdd = parseFloat(productPriceCompare.total_amount) || 0;
      return accumulator + amountToAdd;
    },
    0
  );

  // Ensure totalAmount is formatted correctly (e.g., two decimal places)
  const formattedTotalAmount = totalAmount.toFixed(2);


console.log(ProductCompare,"data");











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
          <span className="k_table_link">{dataItem.reference}</span>
          <span
            onClick={() => {
              setShowPrice(true);
              PriceCompare(dataItem.id);
            }}
            style={{ marginLeft: "8px" }}
            title="View Details"
          >
            {dataItem.reference_number}
            {dataItem.is_parent == 1 && "   "} {/* Add a space */}
            {dataItem.is_parent == 1 && <i
              className="fas fa-info-circle"
              style={{ fontSize: "15px", color: "#007bff", cursor: "pointer" }}
            ></i>}

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
          {<Tooltip title="View Details">
            <div>


              
                <Link onClick={() => {
                  setShowPrice(true);
                  PriceCompare(dataItem.id);

                }} ><i class="fas fa-eye"></i></Link>
                          </div>
          </Tooltip>
          }

          {dataItem.is_parent == 1 && dataItem.status == 4 && (
            <Tooltip title="Confirm Order">
              <Link
                to={{ pathname: `/purchase/${dataItem.id}` }}
                state={{ data: dataItem }}
                className="me-1 icon-btn"
              >
                <i className="fas fa-external-link-alt"></i>
              </Link>
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

      <ManagementPageTopBar />
      <ManagementApprovalStatusBar />

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
                      <GridColumn field="expectedArrival" title="expected Arrival" filterable={false} filter="numeric" width="200px" />
                      <GridColumn field="sourceDocument" title="source Document" filterable={false} filter="text" width="200px" />
                      <GridColumn field="total" title="total" filterable={false} filter="text" width="200px" />
                      {/* <GridColumn field="status" title="STATUS" filter="text" filterable={false} width="200" /> */}
                      <GridColumn
                        field="status_return"
                        title="Status"
                        width="180px"
                        cell={StatusCell} // Use custom cell renderer
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





















      <Modal
        backdrop="static"
        centered
        size="xl"
        show={showPrice}
        onHide={() => setShowPrice(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header >
          <Modal.Title id="example-custom-modal-styling-title">
            Compare Price
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-bordered price-compare-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Expected Date</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit of Measure</th>
                  <th>Unit Price</th>
                  <th>Tax (%)</th>
                  <th>Price (Excl tax)</th>
                  <th>Total</th>
                  <th>Action</th>

                </tr>
              </thead>
              <tbody>
               
                
                {ProductCompare.map((productPriceCompare) => (
                  
                  <tr
                    className={
                      productPriceCompare.status === 5 ? "confirmorder-tr" :
                        productPriceCompare.status === 8 ? "rejected-tr" : ""
                    }
                  >
                    <td>{productPriceCompare.vendor.vendor_name} </td>
                    <td>{productPriceCompare.reference_number} {productPriceCompare.remarkdata && productPriceCompare.remarkdata.remarks != '' ? <i style={{ cursor: 'pointer' }} class="bi bi-eye-fill" onClick={() => {
                      RemarksShow(true);
                      getRemarks(productPriceCompare.remarkdata.remarks, productPriceCompare.vendor.vendor_name + ' - ' + productPriceCompare.reference_number);
                    }}></i> : ''}</td>
                    <td>{getStatus(productPriceCompare.status)} </td>
                    <td>
                      {new Date(productPriceCompare.expected_arrival)
                        .toJSON()
                        .slice(0, 10)}
                    </td>
                    <td>
                      {productPriceCompare.products.map((product) => (
                        <div key={product.id}>
                          <div>{product.ProductsItem.product_name}</div>
                        </div>
                      ))}
                    </td>
                    <td>
                      {productPriceCompare.products.map((product) => (
                        <div key={product.id}>
                          <div>{product.qty}</div>
                        </div>
                      ))}
                    </td>
                    <td>
                      {productPriceCompare.products.map((product) => (
                        <div key={product.id}>
                          <div> {product.ProductsItem.unit}</div>
                        </div>
                      ))}
                    </td>
                    <td>
                      {productPriceCompare.products.map((product) => (
                        <div key={product.id}>
                          <div>

                            {getGeneralSettingssymbol} {product.unit_price}
                          </div>
                        </div>
                      ))}
                    </td>
                    <td>
                      {productPriceCompare.products.map((product) => (
                        <div key={product.id}>
                          <div>{product.tax}</div>
                        </div>
                      ))}
                    </td>
                    <td>
                      {productPriceCompare.products.map((product) => (
                        <div key={product.id}>
                          <div>
                            {getGeneralSettingssymbol} {product.taxExcl}

                          </div>
                        </div>
                      ))}
                    </td>
                    <td>

                      {getGeneralSettingssymbol} {productPriceCompare.total_amount}
                    </td>
                    <td>

                      {productPriceCompare.status != 8 ?
                        <div className="d-flex">
                          {productPriceCompare.status != 5 ?
                            <Tooltip title="Approve">
                              <span onClick={() => {
                                changeStatusfromAdmin(productPriceCompare.id, '5', productPriceCompare.is_parent_id != 0 ? productPriceCompare.parent_recd_id : productPriceCompare.id);
                              }}
                                className="me-1 icon-btn"
                                style={{ cursor: "pointer" }}>
                                <i class="fas fa-check d-flex"></i>
                              </span>
                            </Tooltip>
                            :
                            <Tooltip title="Undo">
                              <span onClick={() => {
                                changeStatusfromAdmin(productPriceCompare.id, '9', productPriceCompare.is_parent_id != 0 ? productPriceCompare.parent_recd_id : productPriceCompare.id);
                              }}
                                className="me-1 icon-btn"
                                style={{ cursor: "pointer" }}>
                                <i class="fas fa-undo d-flex"></i>
                              </span>
                            </Tooltip>
                          }
                          <Tooltip title="Reject">
                            <span onClick={() => {
                              changeStatusfromAdmin(productPriceCompare.id, '8', productPriceCompare.is_parent_id != 0 ? productPriceCompare.parent_recd_id : productPriceCompare.id);
                            }}
                              className="me-1 icon-btn"
                              style={{ cursor: "pointer" }}>
                              <i class="fas fa-times f-s-20 d-flex text-danger"></i>
                            </span>
                          </Tooltip>
                        </div>
                        : <></>}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={12} align="right">
                    {/* <h6>Grand Total: {formattedTotalAmount}</h6> */}
                    <h6 className="mb-0 text-muted">Grand Total: <span className="text-dark f-s-20">{getGeneralSettingssymbol} {formattedTotalAmount}</span></h6>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type='submit' className="btn btn-success" onClick={handleCloseAfterReview} disabled={!areAllStatusesFive()}>
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={getshowRemarks} onHide={RemarksClose} closeButton backdrop="static"
        centered
        size="lg">
        <Modal.Header closeButton >
          <Modal.Title id="example-modal-sizes-title-lg">
            {getRemarksRef}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body dangerouslySetInnerHTML={{ __html: getRemarksdata != '' ? getRemarksdata : '' }}
        ></Modal.Body>

      </Modal>
    </React.Fragment>
  );
}
// Optional: Customize the modules and formats of the editor
FinalApproval.modules = {
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

FinalApproval.formats = [
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

export default FinalApproval;
