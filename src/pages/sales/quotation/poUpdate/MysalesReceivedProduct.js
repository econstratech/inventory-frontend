import React, { useEffect, useState } from "react";

import "react-datepicker/dist/react-datepicker.css";

import "jspdf-autotable";

import { Link } from "react-router-dom";
import { Dropdown, Modal, OverlayTrigger } from "react-bootstrap";

import "handsontable/dist/handsontable.full.min.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
  url,
} from "../../../../environment/AxiosInstance";
import { UserAuth } from "../../../auth/Auth";
import { Button, Table } from "react-bootstrap";

import moment from "moment";
import {
  ErrorMessage,
  SuccessMessage,
} from "../../../../environment/ToastMessage";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import SalesQuotationPageTopBar from "../SalesQuotationPageTopBar";
import PoUpdateStatusBar from "./PoUpdateStatusBar";
import Loader from "../../../../environment/Loader";


function MysalesReceivedProduct() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } =
    UserAuth();
  //for-data table
  const [show, setShow] = useState(false);
  const [modalShow, setModalShow] = React.useState(false);
  const [grid, setGrid] = useState(false);
  const [lgShow, setLgShow] = useState(false);
  const [lgPOShow, setPOShow] = useState(false);
  const [getPOID, setPOID] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });
  const [getReview, setRefNum] = useState("");
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState("");
  const [getProductsRe, setProductsRe] = useState(null);

  console.log(getProductsRe);

  const [error, setError] = useState({});

  const showReview = async (ida) => {
    try {
      const response = await PrivateAxios.get(`/sales/getproducts/${ida}`);

      if (response.status === 200) {
        const data = response.data; // Access the data correctly
        const total = data.reduce((sum, product) => {
          return sum + parseFloat(product.taxIncl);
        }, 0);
        setProducts(data);
        setTotalAmount(total);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };

  const showCompare = async (id) => {
    try {
      const response = await PrivateAxios.get(
        `/sales/getproductscompare/${id}`
      );
      console.log(response);

      if (response.status === 200) {
        setProductsRe(response.data);
      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };

  // Calculate grand totals for products
  const grandTotalProducts = getProductsRe?.products?.reduce(
    (totals, product) => {
      totals.qty += product.qty;
      totals.taxExcl += parseFloat(product.taxExcl);
      totals.taxIncl += parseFloat(product.taxIncl);
      return totals;
    },
    { qty: 0, taxExcl: 0, taxIncl: 0 }
  );

  // Calculate grand totals for productsre
  const grandTotalProductsRe = getProductsRe?.productsreprodut?.reduce(
    (totals, productReProdut) => {
      productReProdut.productsre?.forEach((productRe) => {
        totals.qty += productRe.qty;
        totals.taxExcl += parseFloat(productRe.taxExcl);
        totals.taxIncl += parseFloat(productRe.taxIncl);
      });
      return totals;
    },
    { qty: 0, taxExcl: 0, taxIncl: 0 }
  );

  useEffect(() => {
    console.log("Products State Updated:", products);
  }, [products]);

  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span className="k_table_link">{dataItem.reference}</span>
          <span
            onClick={() => {
              setLgShow(true);
              showReview(dataItem.id);
              setRefNum(dataItem.reference + " - " + dataItem.customer);
            }}
            style={{ marginLeft: "8px" }}
            title="View Details"
          >
            <i
              className="fas fa-info-circle"
              style={{ fontSize: "15px", color: "#007bff", cursor: "pointer" }}
            ></i>
          </span>
        </div>
      </td>
    );
  };

  //description modal
  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("sales/getallpurchaseorderdone")
      .then((res) => {
        const transformedData = res.data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          expiration: moment(item.expiration).format("DD-MM-YYYY H:mm"),
          customer: item.customer && item.customer.name,
          buyer: item.buyer,
          total: `${getGeneralSettingssymbol}${item.total_amount}`,
          status: item.status,
          is_parent: item.is_parent,
          is_parent_id: item.is_parent_id,
          mailsend_status: item.mailsend_status,
          parent_recd_id: item.parent_recd_id,
          payment_terms: item.payment_terms,
          products: item.products,
          productsreprodut: item.productsreprodut,
          source_document: item.productsreprodut,
          untaxed_amount: item.untaxed_amount,
          uploadpo: item.uploadpo,
          user_id: item.user_id,
          status_return:
            item.status === 6 && item.uploadpo == null
              ? "Followup Done"
              : item.status === 6 &&
                item.uploadpo != null &&
                item.productsreprodut.length == 0
                ? "PO Uploaded"
                : item.status === 6 &&
                  item.uploadpo != null &&
                  item.productsreprodut.length !== 0
                  ? "Revised Product"
                  : "Unknown",
        }));
        console.log(transformedData, 'sumit');

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

  //upload PDF
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      ErrorMessage("Please select a PDF file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await PrivateAxiosFile.post(
        `/sales/uploadpo/${getPOID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        setPOShow(false);
        TaskData();
        SuccessMessage("File uploaded successfully!");
      } else {
        ErrorMessage("File upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      ErrorMessage("An error occurred during file upload.");
    }
  };

  //for datepicker

  const fileUpload = async (e) => {
    const file = e.target.files[0];
    let fileSize = file.size;
    if (Number(fileSize) >= 2097152) {
      setError({ file: "This image in getter than 2MB" });
    } else {
      setFormData({ ...formData, file: e.target.files[0] });
      setError("");
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
          <Tooltip title="Show Product Details">
            <button
              className="me-1 icon-btn"
              onClick={() => {
                setLgShow(true);
                showReview(dataItem.id);
                setRefNum(dataItem.reference + " - " + dataItem.customer);
              }}
            >
              <i class="fas fa-info-circle d-flex"></i>
            </button>
          </Tooltip>
          <Tooltip title="Upload P.O">
            <button
              className="me-1 icon-btn"
              onClick={() => {
                setPOShow(true);
                setPOID(dataItem.id);
                setRefNum(dataItem.reference + " - " + dataItem.customer);
              }}
            >
              <i className="fas fa-upload d-flex "></i>
            </button>
          </Tooltip>
          {dataItem.uploadpo != null && (
            <Tooltip title="Show P.O">
              <button
                className="me-1 icon-btn"
                onClick={() =>
                  window.open(`${url}/PO/${dataItem.uploadpo}`, "_blank")
                }
              >
                <i className="fas fa-eye d-flex "></i>
              </button>
            </Tooltip>
          )}

          {dataItem.uploadpo != null && (
            <Tooltip title="Revised Product">
              <button
                className="me-1 icon-btn"
                onClick={() =>
                  (window.location.href = `/sales/revised/${dataItem.id}`)
                }
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </Tooltip>
          )}
          {(dataItem.productsreprodut.length !== 0 ||
            dataItem.productsreprodut[0] != null) && (
              <Tooltip title="Show Revised Product">
                <button
                  className="me-1 icon-btn"
                  onClick={() => {
                    setShow(true);
                    setRefNum(
                      dataItem.reference + " - " + dataItem.customer
                    );
                    showCompare(dataItem.id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    id="Layer_1"
                    data-name="Layer 1"
                    viewBox="0 0 24 24"
                    width={15}
                    height={15}
                    fill="currentColor"
                  >
                    <path d="m23.705,18.549c-.896-1.325-2.959-3.549-6.705-3.549s-5.81,2.224-6.705,3.549c-.391.577-.392,1.323,0,1.902.896,1.325,2.96,3.549,6.706,3.549s5.809-2.224,6.705-3.549c.391-.578.391-1.324,0-1.902Zm-6.705,2.951c-1.105,0-2-.895-2-2s.895-2,2-2,2,.895,2,2-.895,2-2,2Zm-8.362.072c-.852-1.262-.851-2.888.001-4.146,1.116-1.651,3.689-4.427,8.361-4.427,3.311,0,5.568,1.395,7,2.796V5c0-2.761-2.239-5-5-5H5C2.239,0,0,2.239,0,5v13c0,2.761,2.239,5,5,5h4.797c-.489-.506-.872-1.004-1.159-1.428Zm2.362-16.572h7c.552,0,1,.448,1,1s-.448,1-1,1h-7c-.552,0-1-.448-1-1s.448-1,1-1Zm0,5h7c.552,0,1,.448,1,1s-.448,1-1,1h-7c-.552,0-1-.448-1-1s.448-1,1-1Zm-4.5-5.5c.828,0,1.5.672,1.5,1.5s-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5.672-1.5,1.5-1.5Zm0,5c.828,0,1.5.672,1.5,1.5s-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5.672-1.5,1.5-1.5Zm0,8c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5,1.5.672,1.5,1.5-.672,1.5-1.5,1.5Z" />
                  </svg>
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

        <label className="badge badge-outline-accent mb-0"><i className="fas fa-circle f-s-8 d-flex me-1"></i>Revised Product</label>
        {/* {value} */}
      </td>
    );
  };



  return (
    <React.Fragment>
      {isLoading && <Loader />}
      {/* 
      <div className="row">
        <div className="col-12">
          <div className="page_breadcrumb">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item page--icon"><i className=" fi fi-br-chart-mixed-up-circle-dollar"></i></li>
                <li className="breadcrumb-item arrow"><i className="fas fa-chevron-right"></i></li>
                <li className="breadcrumb-item">Sales</li>
                <li className="breadcrumb-item arrow"><i className="fas fa-chevron-right"></i></li>
                <li className="breadcrumb-item">Sales Operation</li>
                <li className="breadcrumb-item arrow"><i className="fas fa-chevron-right"></i></li>
                <li className="breadcrumb-item active" aria-current="page"> P.O Upload</li>
              </ol>
            </nav>
          </div>
          <div className="card mb-2">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h6 className="mb-1 fw-bold">
                    Sales Followup Done and P.O Upload
                  </h6>
                  <div className="d-flex flex-wrap align-items-center">
                    <p className="my-1 me-3 f-s-15 fw-medium">Showing results for :
                    </p>
                    <label className="badge exp-badge-secondary-light mb-0">Status: Reviewing</label>
                  </div>
                </div>

                <div>
                  <Link to="/sales/new" className="btn btn-exp-purple">
                    <i className="fas fa-plus"></i><span className="ms-2">Create Sales Orders</span>
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
                  data={process(data, dataState)} 
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
                    field="reference"
                    cell={ReferenceCell}
                    title="REFERENCE"
                    filter="text"
                    width="200px"
                    filterable={false}
                  />
                  <GridColumn
                    field="expiration"
                    title="Expiration"
                    filter="text"
                    width="250px"
                    filterable={false}
                  />
                  <GridColumn
                    field="customer"
                    title="Customer"
                    filter="text"
                    filterable={false}
                    width="250px"
                  />
                  <GridColumn
                    field="buyer"
                    title="BUYER"
                    filter="text"
                    width="250px"
                    filterable={false}
                  />
                  <GridColumn
                    field="total"
                    title="TOTAL"
                    filter="text"
                    filterable={false}
                    width="200px"
                  />
                  <GridColumn
                    field="status_return"
                    title="Billing Status"
                    filter="text"
                    filterable={false}
                    width="150px"
                  />
                  <GridColumn
                    title="action"
                    filter="text"
                    cell={ActionCell}
                    filterable={false}
                    width="250px"
                  />
                </Grid>
              </ExcelExport>
            </PDFExport>
          </div>
        </div>
      </div> */}
      <SalesQuotationPageTopBar />
      <PoUpdateStatusBar />


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
                      data={process(data, dataState)} // Add fallback for undefined data
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
                      <GridColumn
                        field="reference"
                        cell={ReferenceCell}
                        title="reference"
                        filter="text"
                        width="200px"
                        filterable={false}
                      />
                      <GridColumn
                        field="expiration"
                        title="Expiration"
                        filter="text"
                        width="250px"
                        filterable={false}
                      />
                      <GridColumn
                        field="customer"
                        title="Customer"
                        filter="text"
                        filterable={false}
                        width="250px"
                      />
                      <GridColumn
                        field="buyer"
                        title="BUYER"
                        filter="text"
                        width="250px"
                        filterable={false}
                      />
                      <GridColumn
                        field="total"
                        title="TOTAL"
                        filter="text"
                        filterable={false}
                        width="200px"
                      />
                      <GridColumn
                        field="status_return"
                        title="Billing Status"
                        filter="text"
                        cell={CustomCell}
                        filterable={false}
                        width="150px"
                      />
                      <GridColumn
                        title="action"
                        filter="text"
                        cell={ActionCell}
                        filterable={false}
                        width="250px"
                      />
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
        centered
        backdrop="static"
        keyboard={false}
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {getReview}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="">
            <Table
              striped
              responsive
              hover
              className="table-bordered primary-table-head"
            >
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Tax (%)</th>
                  <th>Tax Excluded Price</th>
                  <th>Tax Included Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.ProductsItem.product_name}</td>
                    <td>{product.qty}</td>
                    <td>
                      {getGeneralSettingssymbol} {product.unit_price}
                    </td>
                    <td>{product.tax}</td>
                    <td>
                      {getGeneralSettingssymbol} {product.taxExcl}
                    </td>
                    <td>
                      {getGeneralSettingssymbol} {product.taxIncl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <p className="border-top text-end pt-2 mb-0"><span className="f-s-18 fw-semibold text-primary-grey-2">  Total Amount (Including Taxes):  </span>
            <span className="fw-bold f-s-20 text-primary-grey-1">  {getGeneralSettingssymbol} {totalAmount.toFixed(2)}</span>
          </p>
          {/* <div className=" mt-2">
            <strong className="mb-0 text-muted">
            {" "}
            </strong>{" "}
            <span className="text-dark f-s-20">
             
            </span>
          </div> */}
        </Modal.Body>
      </Modal>

      <Modal
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={lgPOShow}
        onHide={() => setPOShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {getReview}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">Upload File (PDF)</label>

                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </div>
              <div className="col-12 text-end">
                <button class="btn btn-success pt-10 ms-auto" type="submit">
                  Upload
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        size="xl"
        centered
      // dialogClassName="modal-xl modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            {getReview}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="row">
            <div class="col-md-12 table-container">
              <h5>Products List</h5>
              <div className="">
                <Table
                  striped
                  responsive
                  hover
                  className="table-bordered primary-table-head"
                >
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Tax (%)</th>
                      <th>Tax Excl.</th>
                      <th>Tax Incl.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getProductsRe &&
                      getProductsRe.products &&
                      getProductsRe.products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.ProductsItem.product_name}</td>
                          <td>{product.description}</td>
                          <td>{product.qty}</td>
                          <td>
                            {getGeneralSettingssymbol} {product.unit_price}
                          </td>
                          <td>{product.tax}</td>
                          <td>
                            {getGeneralSettingssymbol} {product.taxExcl}
                          </td>
                          <td>
                            {getGeneralSettingssymbol} {product.taxIncl}
                          </td>
                        </tr>
                      ))}
                    <tr>
                      <td colSpan="2">
                        <strong>Grand Total</strong>
                      </td>
                      <td>
                        <strong>{grandTotalProducts?.qty}</strong>
                      </td>
                      <td colSpan="2"></td>
                      <td>
                        <strong>
                          {getGeneralSettingssymbol}{" "}
                          {grandTotalProducts?.taxExcl.toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {getGeneralSettingssymbol}{" "}
                          {grandTotalProducts?.taxIncl.toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>

            <div class="col-md-12 table-container mt-3">
              <h5>Revised Products</h5>
              <div className="">
                <Table
                  striped
                  responsive
                  hover
                  className="table-bordered primary-table-head"
                >
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Tax (%)</th>
                      <th>Tax Excl.</th>
                      <th>Tax Incl.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getProductsRe &&
                      getProductsRe.productsreprodut &&
                      getProductsRe.productsreprodut.map(
                        (productReProdut) =>
                          productReProdut.productsre &&
                          productReProdut.productsre.map((productRe) => (
                            <tr key={productRe.id}>
                              <td>
                                {productRe.ProductsItemre?.product_name || "-"}
                              </td>
                              <td>{productRe.description || "-"}</td>
                              <td>{productRe.qty || "-"}</td>
                              <td>
                                {getGeneralSettingssymbol}{" "}
                                {productRe.unit_price || "-"}
                              </td>
                              <td>{productRe.tax || "-"}</td>
                              <td>
                                {getGeneralSettingssymbol}{" "}
                                {productRe.taxExcl || "-"}
                              </td>
                              <td>
                                {getGeneralSettingssymbol}{" "}
                                {productRe.taxIncl || "-"}
                              </td>
                            </tr>
                          ))
                      )}

                    <tr>
                      <td colSpan="2">
                        <strong>Grand Total</strong>
                      </td>
                      <td>
                        <strong>{grandTotalProductsRe?.qty}</strong>
                      </td>
                      <td colSpan="2"></td>
                      <td>
                        <strong>
                          {getGeneralSettingssymbol}{" "}
                          {grandTotalProductsRe?.taxExcl.toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {getGeneralSettingssymbol}{" "}
                          {grandTotalProductsRe?.taxIncl.toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment >
  );
}

export default MysalesReceivedProduct;
