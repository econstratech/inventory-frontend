import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import jsPDF from "jspdf";
import "jspdf-autotable";
// import DataTable, { createTheme } from "react-data-table-component";
// import { Link } from "react-router-dom";
// import Handsontable from "handsontable/base";
// import { HotTable } from "@handsontable/react";
// import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";

import moment from "moment";

// import { useTable, useExpanded } from "react-table";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
// import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";

import { PrivateAxios } from "../../environment/AxiosInstance";
import { SuccessMessage, ErrorMessage } from "../../environment/ToastMessage";
// import InventoryMasterPageTopBar from "./itemMaster/InventoryMasterPageTopBar";
// import ItemMasterStatusBar from "./itemMaster/ItemMasterStatusBar";
import { UserAuth } from "../auth/Auth";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../../environment/Loader";
import SaleOrderDetailsModal from "../CommonComponent/SaleOrderDetailsModal";
import SaleOrderRemarksModal from "../CommonComponent/SaleOrderRemarksModal";

function MypurchaseList() {
  const { isLoading, setIsLoading, Logout } = UserAuth();

  const [data, setData] = useState([]);

  const [showPrice, setShowPrice] = useState(false);
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarksModalSaleOrderId, setRemarksModalSaleOrderId] = useState(null);
  const [remarksModalSaleOrderRef, setRemarksModalSaleOrderRef] = useState("");

  const [ProductCompare, setProductCompare] = useState([]);
  const [pageState, setPageState] = useState({ skip: 0, take: 15, searchKey: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);

  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span>
            <a
              className="k_table_link"
              onClick={() => {
                // setShowPrice(true);
                // PriceCompare(dataItem.id);
              }}
            >
              {dataItem.reference}
              {/* {dataItem.is_parent === 1 && "   "}
              {dataItem.is_parent == 1 && (
                <i
                  className="fas fa-info-circle"
                  style={{
                    fontSize: "15px",
                    color: "#007bff",
                    cursor: "pointer",
                  }}
                ></i>
              )} */}
            </a>
          </span>
        </div>
      </td>
    );
  };
  const PriceCompare = async (id) => {
    try {
      const response = await PrivateAxios.get(
        `/sales/sales/${id}`
      );
      if (response.status === 200) {
        const quotationData = response.data.data;
         // Ensure ProductCompare is always an array
         const dataArray = Array.isArray(quotationData) ? quotationData : [quotationData];
         setProductCompare(dataArray);

        let grandTotal = 0;

        quotationData.products.map((product) => {
            const taxAmount = (product.unit_price * product.tax) / 100;
            const totalWithTax = product.qty * (product.unit_price + taxAmount);
            grandTotal += totalWithTax;
        });
      }
    } catch (error) {
      console.error("Error fetching product comparison data:", error);
    }
  };

  const getStatusLabel = (status) => {
    const statusLable = {
      10: "Dispatched",
      11: "Production",
    }
    return statusLable[status] || "Pending";
  };

  const handleReceiveSalesProduct = async (
    salesid,
    spid,
    sid,
    received_qty,
    currentStoreId,
    currentVariantId,
    currentProductId,
    currentOrderQuantity,
    currentUnitPrice
  ) => {
    try {
      const payload = { 
        sales_id: salesid, 
        sales_product_id: spid,
        product_id: currentProductId,
        order_quantity: currentOrderQuantity,
        unit_price: currentUnitPrice,
        quantity: received_qty,
        warehouse_id: currentStoreId,
        product_variant_id: currentVariantId,
      };

      const response = await PrivateAxios.post(`/sales/sales-product-received`, payload);
      if (response.status === 200) {
        SuccessMessage("Product is dispatched Successfully.!");

        const responseData = response.data;
        if (responseData.status) {
          TaskData();
          // Refresh modal details from source API so edited fields
          // (e.g. unit_price) reflect the latest saved backend values.
          await PriceCompare(salesid);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error receiving sales product:", error);
      ErrorMessage("Error receiving sales product: " + error.message);
      return false;
    }
  };

  // Handler to update warehouse when store is changed
  const handleStoreChange = (purchaseId, selectedStore) => {
    setProductCompare((prev) =>
      prev.map((purchase) => {
        if (purchase.id !== purchaseId) return purchase;

        return {
          ...purchase,
          warehouse: selectedStore ? selectedStore.warehouse : purchase.warehouse,
        };
      })
    );
  };





  //end pdf
  // const handleStatusChange = async (id, sid) => {
  //   const response = await PrivateAxios.put(`sales/statuschange/${id}/${sid}`);
  //   // const jsonData = response.data;
  //   if (response.status == 200) {
  //     SuccessMessage("Status Changed Successfully.!");
  //     TaskData();
  //   }
  // };
  // const columns = React.useMemo(
  //   () => [
  //     { Header: "Bill Number", accessor: "bill_number" },
  //     { Header: "Bill Date", accessor: "bill_date" },
  //     { Header: "Buyer", accessor: "buyer" },
  //     { Header: "Untaxed Amount", accessor: "untaxed_amount" },
  //     { Header: "Total Amount", accessor: "total_amount" },
  //     {
  //       Header: "Details",
  //       id: "details",
  //       Cell: ({ row }) => (
  //         <button type="button" onClick={() => handleToggle(row.original.id)}>
  //           {expandedRows[row.original.id] ? "Hide Details" : "Show Details"}
  //         </button>
  //       ),
  //     },
  //   ],
  //   [expandedRows]
  // );

  // const handleToggle = (rowId) => {
  //   setExpandedRows((prev) => ({
  //     ...prev,
  //     [rowId]: !prev[rowId],
  //   }));
  // };

  // Handle filter button click
  const handleFilter = () => {
    const newPageState = { ...pageState, skip: 0 }; // Reset to first page when filtering
    setPageState(newPageState);
    TaskData(newPageState, null, null); // Pass null to use current filter values from state
  };

  // Handle reset button click
  const handleReset = () => {
    const resetPageState = { skip: 0, take: 15, searchKey: "" };
    const resetReferenceFilter = "";
    const resetDateRangeFilter = [null, null];
    
    // Update state
    setPageState(resetPageState);
    setReferenceNumberFilter(resetReferenceFilter);
    setDateRangeFilter(resetDateRangeFilter);
    
    // Call TaskData with reset values directly to avoid async state update issue
    TaskData(resetPageState, resetReferenceFilter, resetDateRangeFilter);
  };

  const handlePageChange = (event) => {
    const newPageState = {
      skip: event.page.skip,
      take: event.page.take,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    // Fetch data with updated pagination and current filter
    TaskData(newPageState, null, null); // Pass null to use current filter values from state
  };

  // const tableInstance = useTable(
  //   { columns, data: datavalue },
  //   useExpanded // Use the useExpanded plugin hook
  // );

  const getSalesStatus = (status) => {
    let statusLabel = "";
    if (status === 2) {
      statusLabel = `<label class="badge badge-outline-active"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Quotation Created</label>`
    } else if (status === 3) {
      statusLabel = `<label class="badge badge-outline-yellowGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Pending Approval</label>`
    } else if (status === 4) {
      statusLabel = `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Approved Order</label>`
    } else if (status === 9) {
      statusLabel = `<label class="badge badge-outline-meantGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Pending Dispatch</label>`
    } else if (status === 10) {
      statusLabel = `<label class="badge badge-outline-meantGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Dispatch Pending</label>`
    } else if (status === 11) {
      statusLabel = `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Items Received Done</label>`
    } else if (status === 12) {
      statusLabel = `<label class="badge badge-outline-danger "><i class="fas fa-circle f-s-8 d-flex me-1"></i>Rejected</label>`
    }
    return statusLabel;
  }

  const getPurchaseStatus = (status) => {
    let statusLabel = "";
    if (status === 2) {
      statusLabel = `<label class="badge badge-outline-active"><i class="fas fa-circle f-s-8 d-flex me-1"></i>PO Created</label>`
    }
    else if (status === 3) {
      statusLabel = `<label class="badge badge-outline-yellowGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Pending Approval</label>`
    }
    else if (status === 4) {
      statusLabel = `<label class="badge badge-outline-accent"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Approved PO</label>`
    }
    else if (status === 5) {
      statusLabel = `<label class="badge badge-outline-meantGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Pending GRN</label>`
    }
    else if (status === 10) {
      statusLabel = `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Items Received Done</label>`
    }
    else if (status === 8) {
      statusLabel = `<label class="badge badge-outline-danger "><i class="fas fa-circle f-s-8 d-flex me-1"></i>Rejected</label>`
    }
    return statusLabel;
  }

  const TaskData = async (customPageState = null, customReferenceFilter = null, customDateRangeFilter = null) => {
    setIsLoading(true);
    const currentPageState = customPageState || pageState;
    const currentReferenceFilter = customReferenceFilter !== null ? customReferenceFilter : referenceNumberFilter;
    const currentDateRangeFilter = customDateRangeFilter !== null ? customDateRangeFilter : dateRangeFilter;
    
    const urlParams = new URLSearchParams({
      page: currentPageState.skip / currentPageState.take + 1,
      limit: currentPageState.take,
      status: 9,
      ...(currentPageState.searchKey && { search: currentPageState.searchKey }),
      ...(currentReferenceFilter && { reference_number: currentReferenceFilter }),
      ...(currentDateRangeFilter[0] && { expected_delivery_date_start: moment(currentDateRangeFilter[0]).format("YYYY-MM-DD") }),
      ...(currentDateRangeFilter[1] && { expected_delivery_date_end: moment(currentDateRangeFilter[1]).format("YYYY-MM-DD") })
    });
    
    // reset the data
    setData([]);
    
    PrivateAxios.get(`sales/all-sale-quotation?${urlParams.toString()}`)
      .then((res) => {
        const responseData = res.data.data || [];
        const rows = Array.isArray(responseData) ? responseData : (responseData.rows || []);
        setTotalCount(responseData.pagination?.total_records || rows.length);
        const currentPage = responseData.pagination?.current_page || 1;
        const perPage = responseData.pagination?.per_page || currentPageState.take;
        const stratingIndex = (currentPage - 1) * perPage;
        
        const transformedData = rows.map((item, index) => ({
          id: item.id,
          slNo: stratingIndex + index + 1,
          reference: item.reference_number,
          creationDate: moment(item.created_at).format("DD/MM/YYYY"),
          expectedDeliveryDate: moment(item.expected_delivery_date || item.expiration).format("DD/MM/YYYY"),
          creation: moment(item.created_at).format("DD-MM-YYYY"),
          // expiration: moment(item.expiration).format("DD-MM-YYYY"),
          customer: item.customer && item.customer.name,
          // buyer: item.buyer || item.createdBy?.name,
          salesPerson: item.createdBy?.name,
          storeName: item.warehouse?.name,
          total: `₹${item.total_amount}`,
          status: item.status,
          is_parent: item.is_parent,
          product_count: item.products?.length || 0,
          is_parent_id: item.is_parent_id,
          mailsend_status: item.mailsend_status,
          parent_recd_id: item.parent_recd_id,
          paymentTerms: item.payment_terms,
          products: item.products,
          productsreprodut: item.productsreprodut,
          // source_document: item.productsreprodut,
          untaxed_amount: item.untaxed_amount,
          uploadpo: item.uploadpo,
          user_id: item.user_id,
          status_return: getSalesStatus(item.status),
          purchases: item?.purchases || [],
          purchaseReferences: (() => {
            const list = item?.purchases || [];
            if (!list.length) return "<span class=\"text-muted\">—</span>";
            return list
              .map((p) => {
                const ref = p.reference_number != null && p.reference_number !== "" ? String(p.reference_number) : "—";
                const statusHtml = getPurchaseStatus(p.status) || "";
                return "<div class=\"d-flex align-items-center gap-2 mb-1 px-2 py-1 rounded\" style=\"font-size: 13px; background: rgba(0,123,255,0.08); border-left: 3px solid #007bff;\"><span class=\"fw-bold text-dark\">" + ref + "</span>" + statusHtml + "</div>";
              })
              .join("");
          })(),
          // status_return:
          //   item.status === 1
          //     ? `<label class="badge badge-outline-active"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Active</label>`
          //     : item.status === 2
          //       ? `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>RFQ</label>`
          //       : item.status === 3
          //         ? `<label class="badge badge-outline-yellowGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Send to management</label>`
          //         : item.status === 4
          //           ? `<label class="badge badge-outline-accent mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Sales Order</label>`
          //           : item.status === 5
          //             ? `<label class="badge badge-outline-green mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Nothing to Bill</label>`
          //             : item.status === 6
          //               ? `<label class="badge badge-outline-meantGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Fully Billed</label>`
          //               : item.status === 7
          //                 ? `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Done</label>`
          //                 : item.status === 8
          //                   ? `<label class="badge badge-outline-danger "><i class="fas fa-circle f-s-8 d-flex me-1"></i>Rejected from Admin</label>`
          //                   : item.status === 9
          //                     ? `<label class="badge badge-outline-yellowGreen mb-0"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Pending Dispatch</label>`
          //                     : item.status === 10
          //                       ? `<label class="badge badge-outline-success"><i class="fas fa-circle f-s-8 d-flex me-1"></i>Items Received Done</label>`
          //                       : "Unknown",
        }));

        setData(transformedData);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        if (err.response?.data == 401) {
          Logout();
        }
      });
  };

  useEffect(() => {
    TaskData();
  }, []);

  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div className="d-flex gap-2">
          <Tooltip title="Dispatched">
            <button
              className="me-1 icon-btn"
              onClick={() => {
                // handleStatusChange(dataItem.id, 10)
                setShowPrice(true);
                PriceCompare(dataItem.id);
              }}
            >
              <i class="fa fa-truck"></i>
            </button>
          </Tooltip>
          <Tooltip title="View remarks">
            <button
              className="me-1 icon-btn"
              onClick={() => {
                setRemarksModalSaleOrderId(dataItem.id);
                setRemarksModalSaleOrderRef(dataItem.reference || "");
                setRemarksModalOpen(true);
              }}
            >
              <i className="fas fa-comment-dots"></i>
            </button>
          </Tooltip>

          {/* <Tooltip title="Production">
            <button
              className="me-1 icon-btn"
              onClick={() => handleStatusChange(dataItem.id, 11)}
            >
              <i className="fas fa-industry"></i>
            </button>
          </Tooltip> */}
          {/* {dataItem.product_count > 1 && (
            <Tooltip title="Production">
              <button
                className="me-1 icon-btn"
                onClick={() => {
                  setShowPrice(true);
                  PriceCompare(dataItem.id); // ✅ fetch + open modal
                  // setModalSource("production"); // optional
                }}
              >
                <i
                  className="fas fa-boxes"
                  style={{ color: "#28a745", fontSize: "16px" }}
                ></i>
              </button>
            </Tooltip>
          )} */}
        </div>
      </td>
    );
  };

  const CustomCell = (props) => {
    return (
      <td
        dangerouslySetInnerHTML={{ __html: props.dataItem[props.field] }}
      ></td>
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

  return (
    <React.Fragment>
      {isLoading && <Loader />}
      {/* <InventoryMasterPageTopBar />
      <ItemMasterStatusBar /> */}

      <div className="bg-white border-bottom">
        <div className="d-flex gap-3 px-4 justify-content-between align-items-center py-3">
          <div className="d-flex gap-3 align-items-center">
            <div style={{ minWidth: "200px" }}>
              <label className="form-label mb-1 f-s-14 fw-medium">Filter by Reference Number</label>
              <input
                type="text"
                name="reference_number"
                className="form-control"
                placeholder="Reference number"
                value={referenceNumberFilter}
                onChange={(e) => setReferenceNumberFilter(e.target.value)}
                style={{ height: "38px" }}
              />
            </div>
            <div style={{ minWidth: "200px" }}>
              <label className="form-label mb-1 f-s-14 fw-medium">Filter by Delivery Date</label>
              <style>
                {`
                  .delivery-date-picker-wrapper .react-datepicker-wrapper,
                  .delivery-date-picker-wrapper .react-datepicker__input-container {
                    width: 100%;
                    height: 38px;
                  }
                  .delivery-date-picker-wrapper .react-datepicker__input-container input {
                    height: 38px !important;
                  }
                `}
              </style>
              <div className="delivery-date-picker-wrapper">
                <DatePicker
                  selected={dateRangeFilter[0]}
                  onChange={(update) => {
                    setDateRangeFilter(update);
                  }}
                  startDate={dateRangeFilter[0]}
                  endDate={dateRangeFilter[1]}
                  selectsRange
                  isClearable
                  placeholderText="Select date range"
                  className="form-control"
                  dateFormat="dd-MM-yyyy"
                  name="expected_delivery_date"
                />
              </div>
            </div>
            <div className="d-flex gap-2 align-items-end">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleFilter}
                style={{ height: "38px", marginTop: "20px" }}
              >
                <i className="fas fa-filter me-2"></i>
                Filter
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleReset}
                style={{ height: "38px" }}
              >
                <i className="fas fa-redo me-2"></i>
                Reset
              </button>
            </div>
           
          </div>
        </div>
      </div>

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                <div className="table-button-group mb-2 ms-auto">
                  <GridToolbar className="border-0 gap-0">
                    <Tooltip title="Export to PDF">
                      <button
                        type="button"
                        className=" table-export-btn"
                        onClick={handleExportPDF}
                      >
                        <i class="far fa-file-pdf d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                    <Tooltip title=" Export to Excel">
                      <button
                        type="button"
                        className=" table-export-btn"
                        onClick={handleExportExcel}
                      >
                        <i class="far fa-file-excel d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                  </GridToolbar>
                </div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <PDFExport data={data} ref={pdfExportRef}>
                  <ExcelExport data={data} ref={excelExportRef}>
                    <Grid
                      data={data}
                      skip={pageState.skip}
                      take={pageState.take}
                      total={totalCount}
                      onPageChange={handlePageChange}
                      filterable={false}
                      sortable
                      scrollable="scrollable"
                      reorderable
                      resizable
                      loading={isLoading}
                      pageable={{ buttonCount: 3, pageSizes: true }}
                    >
                      {/* Column Definitions */}

                      <GridColumn field="slNo" title="sl No." filterable={false} width="100px" locked={true} />
                      <GridColumn field="reference" title="reference" filterable={false} filter="text" width="100px" cell={ReferenceCell} />
                      <GridColumn field="expectedDeliveryDate" title="Delivery Date" filterable={false} filter="text" width="200px" />
                      <GridColumn field="creationDate" title="Creation Date" filterable={false} filter="text" width="150px" />
                      <GridColumn field="customer" title="Customer" filterable={false} filter="text" width="150px" />
                      <GridColumn field="storeName" title="Store" filterable={false} filter="text" width="150px" />
                      <GridColumn field="salesPerson" title="Sales Person" filter="text" filterable={false} width="200" />
                      <GridColumn field="paymentTerms" title="Payment Terms (Days)" filterable={false} filter="text" width="200px" />
                      <GridColumn
                        field="purchaseReferences"
                        title="Purchase Reference"
                        filterable={false}
                        width="260px"
                        cells={{ data: CustomCell }}
                      />
                      <GridColumn field="total" title="total" filter="text" filterable={false} width="150px" />
                      <GridColumn
                        field="status_return"
                        title="Status"
                        filter="dropdown"
                        width="250px"
                        filterable={false}
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

      <SaleOrderDetailsModal
        show={showPrice}
        onHide={() => setShowPrice(false)}
        productCompare={ProductCompare}
        onStoreChange={handleStoreChange}
        onProductReceive={handleReceiveSalesProduct}
        getStatusLabel={getStatusLabel}
        // currencySymbol={getGeneralSettingssymbol}
      />
      <SaleOrderRemarksModal
        open={remarksModalOpen}
        onClose={() => {
          setRemarksModalOpen(false);
          setRemarksModalSaleOrderId(null);
          setRemarksModalSaleOrderRef("");
        }}
        saleOrderId={remarksModalSaleOrderId}
        saleOrderReferenceNumber={remarksModalSaleOrderRef}
      />
    </React.Fragment>
  );
}

export default MypurchaseList;
