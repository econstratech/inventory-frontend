import React, { useEffect, useState } from "react";

import "react-datepicker/dist/react-datepicker.css";

import "jspdf-autotable";

import { Link } from "react-router-dom";
import { Dropdown, Modal, OverlayTrigger } from "react-bootstrap";
import { FaFileInvoice } from 'react-icons/fa'; 
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
import PoUpdateStatusBar from "../poUpdate/PoUpdateStatusBar";
import Loader from "../../../../environment/Loader";


function MysalesOrderDispatchList() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } =
    UserAuth();
  //for-data table
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDispatchItem, setSelectedDispatchItem] = useState(null);
  const [dispatchType, setDispatchType] = useState(""); // "stock" or "customer"

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

const handleOpenConfirmModal = (item, type) => {
  setSelectedDispatchItem(item);
  setDispatchType(type);
  setShowConfirmModal(true);
};

const handleCloseConfirmModal = () => {
  setShowConfirmModal(false);
  setSelectedDispatchItem(null);
  setDispatchType("");
};



  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });

  const fetchWorkOrders = async () => {
    try {
      const response = await PrivateAxios.get("sales/production/GetAllDdone");
      console.log(response.data);

      const filteredData = response.data.filter(
        (order) => order.is_deleted !== 1 &&
        (order.production_status === 5 || order.production_status === 0) &&
        (order.is_dispatched === true || order.is_dispatched === 1) || (order.is_invoice === true || order.is_invoice === 1)

      );
 
      const transformedData = filteredData.map((item, index) => ({
        id: item.id,
        slNo: index + 1,
        
        production_number: item.production_number || "-",
        reference: item.purchase?.reference_number || "-",
        invoice: item.invoice_number || "-",
        customer: item.purchase?.customer?.name || "-",
        createdBy: item.purchase?.createdByUser?.name || "-",
        product_name: item.ProductsItem?.product_name || "-",
        product_code: item.ProductsItem?.product_code || "-",
        qty: item.qty,
        tax: item.tax,
        unit_price: getGeneralSettingssymbol + Number(item.unit_price).toFixed(2),
        total_tax_incl: getGeneralSettingssymbol + Number(item.taxIncl).toFixed(2),
        unit: item.ProductsItem?.Masteruom?.unit_name || "-",
        created_at: moment(item.updated_at).format("DD-MM-YYYY"),
      }));
  
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching work orders:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWorkOrders();
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

  const InvoiceCell = (props) => {
    const { dataItem } = props;
  
    const invoiceNumber = dataItem.invoice;
    const invoiceId = dataItem.id; // assuming `id` is the invoice/item ID
  
    const handleInvoiceClick = (e) => {
      e.preventDefault();
      if (invoiceId) {
        window.open(`/payment/document/tax-invoice/${invoiceId}`, '_blank');
      }
    };
  
    return (
      <td>
        {invoiceNumber && invoiceNumber !== "-" ? (
          <a
            href="#"
            onClick={handleInvoiceClick}
            title="View Invoice"
            style={{ textDecoration: "none", color: "#007bff", display: "flex", alignItems: "center", gap: "6px" }}
          >
           
            <span>{invoiceNumber}</span>
          </a>
        ) : (
          <span style={{ color: "#aaa" }}>—</span>
        )}
      </td>
    );
  };
  

  return (
    <React.Fragment>
      {isLoading && <Loader />}
    
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
                      <GridColumn field="production_number" title="Production Number" width="150px" />
                      <GridColumn field="reference" title="Reference" width="150px" />
                      <GridColumn field="invoice_number" title="Invoice" width="150px" cell={InvoiceCell}/>
                      <GridColumn field="customer" title="Customer" width="200px" />
                      <GridColumn field="product_code" title="Product Code" width="150px" />

                      <GridColumn field="product_name" title="Product Name" width="200px" />
                      <GridColumn field="qty" title="Qty" width="80px" />
                      <GridColumn field="unit_price" title="Unit Price" width="120px" />
                      <GridColumn field="total_tax_incl" title="Total (Tax Incl.)" width="130px" />
                      <GridColumn field="tax" title="Tax(%)" width="130px" />
                      <GridColumn field="unit" title="Unit" width="100px" />
                      <GridColumn field="createdBy" title="Created By" width="150px" />
                      <GridColumn field="created_at" title="Dispatch Date" width="130px" />
                      
                    </Grid>
                  </ExcelExport>
                </PDFExport>
              </div>
            </div>
          </div>
        </div>
      </div>

 
  
    </React.Fragment >
  );
}

export default MysalesOrderDispatchList;
