import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "jspdf-autotable";
import DatePicker from "react-datepicker";
import "handsontable/dist/handsontable.full.min.css";
import { PrivateAxios, url } from "../../../../environment/AxiosInstance";

import moment from "moment";
import {
  SuccessMessage,
} from "../../../../environment/ToastMessage";

import { Tooltip, Table as AntTable } from "antd";
import SalesQuotationPageTopBar from "../SalesQuotationPageTopBar";
import Loader from "../../../../environment/Loader";
import { logoutAndRedirect } from "../../../../utils/logout";

import FinalSaleOrderDispatchModal from "../../../CommonComponent/FinalSaleOrderDispatchModal";
import SaleOrderRemarksModal from "../../../CommonComponent/SaleOrderRemarksModal";

function CompletedSalesOrdersList() {

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("auth_user")) || null);
  const [generalSettingsSymbol, setGeneralSettingsSymbol] = useState(null);
  const [pageState, setPageState] = useState({ skip: 0, take: 15, searchKey: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [referenceNumberFilter, setReferenceNumberFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);
  const [ProductCompare, setProductCompare] = useState([]);
  const [showFinalSaleOrderDispatchModal, setShowFinalSaleOrderDispatchModal] = useState(false);
  const [remarksModalSaleOrderId, setRemarksModalSaleOrderId] = useState(null);
  const [remarksModalSaleOrderRef, setRemarksModalSaleOrderRef] = useState("");
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setGeneralSettingsSymbol(user.company.generalSettings.symbol);
    }
  }, [user]);


  //end pdf
  const handleStatusChange = async (id, sid) => {
    const response = await PrivateAxios.put(`sales/statuschange/${id}/${sid}`);
    // const jsonData = response.data;
    if (response.status == 200) {
      SuccessMessage("Status Changed Successfully.!");
      TaskData();
    }
  };

  // Fetch product details for the modal
  const PriceCompare = async (id) => {
    try {
      const response = await PrivateAxios.get(
        `/sales/sales/${id}?type=dispatch`
      );
      if (response.status === 200) {
        const quotationData = response.data.data;
        // Ensure ProductCompare is always an array
        const dataArray = Array.isArray(quotationData) ? quotationData : [quotationData];
        setProductCompare(dataArray);
      }
    } catch (error) {
      console.error("Error fetching product comparison data:", error);
    }
  };

  const TaskData = async (customPageState = null, customReferenceFilter = null, customDateRangeFilter = null) => {
    setIsLoading(true);

    const currentPageState = customPageState || pageState;
    const currentReferenceFilter = customReferenceFilter !== null ? customReferenceFilter : referenceNumberFilter;
    const currentDateRangeFilter = customDateRangeFilter !== null ? customDateRangeFilter : dateRangeFilter;

    const urlParams = new URLSearchParams({
      page: currentPageState.skip / currentPageState.take + 1,
      limit: currentPageState.take,
      status: 11,
      ...(currentPageState.searchKey && { search: currentPageState.searchKey }),
      ...(currentReferenceFilter && { reference_number: currentReferenceFilter }),
      ...(currentDateRangeFilter[0] && { expected_delivery_date_start: moment(currentDateRangeFilter[0]).format("YYYY-MM-DD") }),
      ...(currentDateRangeFilter[1] && { expected_delivery_date_end: moment(currentDateRangeFilter[1]).format("YYYY-MM-DD") })
    });
    PrivateAxios.get(`sales/all-sale-quotation?${urlParams.toString()}`)
      .then((res) => {
        const safeCurrencySymbol =
          generalSettingsSymbol ??
          user?.company?.generalSettings?.symbol ??
          "";
        const responseData = res.data.data || [];
        setTotalCount(responseData.pagination?.total_records || 0);
        const currentPage = responseData.pagination?.current_page || 1;
        const perPage = responseData.pagination?.per_page || currentPageState.take;
        const stratingIndex = (currentPage - 1) * perPage;

        const transformedData = responseData.rows.map((item, index) => ({
          id: item.id,
          slNo: stratingIndex + index + 1,
          reference: item.reference_number,
          creation: moment(item.created_at).format("DD-MM-YYYY H:mm"),
          expectedDeliveryDate: moment(item.expected_delivery_date || item.expiration).format("DD/MM/YYYY"),
          paymentTerms: item.payment_terms,
          customer: item.customer && item.customer.name,
          salesPerson: item.createdBy?.name,
          storeName: item.warehouse?.name,
          total: `${safeCurrencySymbol}${Number(item.total_amount || 0).toFixed(2)}`,
          status: item.status,
          is_parent: item.is_parent,
          is_parent_id: item.is_parent_id,
          mailsend_status: item.mailsend_status,
          parent_recd_id: item.parent_recd_id,
          payment_terms: item.payment_terms,
          products: item.products,
          productsreprodut: item.productsreprodut,
          untaxed_amount: item.untaxed_amount,
          user_id: item.user_id,
        }));

        setData(transformedData);

        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        if (err.response.data == 401) {
          logoutAndRedirect();
        }
      });
  };

  useEffect(() => {
    TaskData();
  }, []);

  const handlePageChange = (page, pageSize) => {
    const newPageState = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      searchKey: pageState.searchKey,
    };
    setPageState(newPageState);
    TaskData(newPageState, null, null);
  };

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

  const generatePDF = async (id, val) => {
    setIsLoading(true);
    try {
      // Assuming the filename is constructed as `purchase_order_${val}.pdf`
      const response = await PrivateAxios.get(`sales/generatePDFForvendor/${id}`, {
        responseType: 'blob',
      });

      if (response.status !== 200) {
        throw new Error('Unable to generate PDF');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(url);
    } catch (error) {
      console.error('Error opening PDF:', error);
      // Optionally handle the error state
    } finally {
      setIsLoading(false);
    }
  };

  const ActionCell = (dataItem) => {
    return (
        <div className="d-flex gap-2">
          {dataItem.status !== 11 ? (
            <>
              <Tooltip title="Send Floor Manager">
                <button
                  className="me-1 icon-btn"
                  onClick={() => handleStatusChange(dataItem.id, 9)}
                >
                  <i class="fa fa-user-secret"></i>
                </button>
              </Tooltip>
              <Tooltip title="Order Quotation Download">
                <button
                  className="me-1 icon-btn"
                  onClick={() => window.open(`${url}PO/purchase_order_${dataItem.reference}.pdf`, '_blank')}
                >
                  <i className="fas fa-download"></i>
                </button>
              </Tooltip>
            </>
          ) : (
            <>
            <Tooltip title="show sale order details">
              <button
                className="me-1 icon-btn"
                onClick={() => {
                  // handleStatusChange(dataItem.id, 10)
                  // setShowPrice(true);
                  PriceCompare(dataItem.id);
                  setShowFinalSaleOrderDispatchModal(true);
                }}
              >
                <i class="fa fa-eye"></i>
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
            <Tooltip title="View Pdf">
              <button
                className="me-1 icon-btn"
                onClick={() => generatePDF(dataItem.id, dataItem.reference)}
              >
                <i class="fas fa-file-pdf"></i>
              </button>
            </Tooltip>
            </>
          )}
          {/*
           {dataItem.mailsend_status !== 1 ? (
            <Tooltip title="Send SO by Email">
              <button
                onClick={() => sendMailByPO(dataItem.id)}
                state={{ data: dataItem }}
                className="me-1 icon-btn"
              >
              <i class="fas fa-envelope"></i>
              </button>
            </Tooltip>
          ) : (
            <Tooltip title="Resend SO by Email">

              <button
                onClick={() => sendMailByPO(dataItem.id)}
                state={{ data: dataItem }}
                className="me-1 icon-btn"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </Tooltip>
          )} */}
        </div>
    );
  };

  const CustomCell = () => {
    return (
          <label className="badge badge-outline-green mb-0">
            <i className="fas fa-circle f-s-8 d-flex me-1"></i>Completed
          </label>
    );
  };
  const ReferenceCell = (dataItem) => {
    return (
        <span className="text-primary">{dataItem.reference}</span>
    );
  };

  const tableColumns = [
    { title: "SL No.", dataIndex: "slNo", key: "slNo", width: 100, fixed: "left" },
    {
      title: "Reference No.",
      dataIndex: "reference",
      key: "reference",
      width: 150,
      render: (_, record) => ReferenceCell(record),
    },
    { title: "Delivery Date", dataIndex: "expectedDeliveryDate", key: "expectedDeliveryDate", width: 200 },
    { title: "Creation", dataIndex: "creation", key: "creation", width: 200 },
    { title: "Customer", dataIndex: "customer", key: "customer", width: 200 },
    { title: "Sales Person", dataIndex: "salesPerson", key: "salesPerson", width: 200 },
    { title: "Payment Terms (Days)", dataIndex: "paymentTerms", key: "paymentTerms", width: 200 },
    { title: "Total Amount", dataIndex: "total", key: "total", width: 200 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 250,
      render: () => CustomCell(),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 250,
      render: (_, record) => ActionCell(record),
    },
  ];

  return (
    <React.Fragment>
      {isLoading && <Loader />}
      <SalesQuotationPageTopBar />

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
              </div>
              <div className="bg_succes_table_head rounded_table">
                <AntTable
                  rowKey="id"
                  dataSource={data}
                  columns={tableColumns}
                  loading={isLoading}
                  pagination={{
                    current: Math.floor(pageState.skip / pageState.take) + 1,
                    pageSize: pageState.take,
                    total: totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 15, 25, 50],
                    onChange: handlePageChange,
                    onShowSizeChange: handlePageChange,
                  }}
                  scroll={{ x: 1700 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FinalSaleOrderDispatchModal
        show={showFinalSaleOrderDispatchModal}
        onHide={() => setShowFinalSaleOrderDispatchModal(false)}
        productCompare={ProductCompare}
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

      {/* <SaleOrderDetailsModal
        show={showPrice}
        onHide={() => setShowPrice(false)}
        productCompare={ProductCompare}
        onStoreChange={handleStoreChange}
        onStatusChange={handleStatusChangeproductwise}
        currencySymbol={generalSettingsSymbol}
        getStatusLabel={getStatusLabel}
      /> */}

      {/* <Modal
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
          <div className="">
            <Table
              responsive
              {...getTableProps()}
              className="table table-striped table-bordered primary-table-head"
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  const isExpanded = expandedRows[row.original.id];
                  return (
                    <React.Fragment key={row.id}>
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={columns.length}>
                            <table className="table table-striped">
                              <thead>
                                <tr>
                                  <th>Product Name</th>
                                  <th>Received</th>
                                  <th>Rejected</th>
                                  <th>Received Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.original.recvPro.map((pro) => (
                                  <tr key={pro.id}>
                                    <td>{pro.product_name}</td>
                                    <td>{pro.received}</td>
                                    <td>{pro.rejected}</td>
                                    <td>
                                      {new Date(
                                        pro.created_at
                                      ).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                <tr>
                  <td colSpan={columns.length}>
                    <span>Total Received</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      id="Layer_1"
                      data-name="Layer 1"
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="currentColor"
                      className="text-success ms-1"
                    >
                      <path d="M20.5,6h-5c-.828,0-1.5,.672-1.5,1.5s.672,1.5,1.5,1.5h3.379l-5.879,5.879-4.119-4.119c-1.037-1.037-2.725-1.037-3.762,0L.439,15.439c-.586,.586-.586,1.535,0,2.121s1.535,.586,2.121,0l4.439-4.439,4.119,4.119c.519,.519,1.199,.778,1.881,.778s1.362-.26,1.881-.778l6.119-6.119v3.379c0,.828,.672,1.5,1.5,1.5s1.5-.672,1.5-1.5v-5c0-1.93-1.57-3.5-3.5-3.5Z" />
                    </svg>
                    <span className="text-success f-s-16 fw-semibold ms-1">
                      {totalReceived}
                    </span>{" "}
                  </td>
                </tr>
                <tr>
                  <td colSpan={columns.length}>
                    Total Rejected
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      id="Layer_1"
                      data-name="Layer 1"
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="currentColor"
                      className="text-danger ms-1"
                    >
                      <path d="M24,9.5v5c0,1.93-1.57,3.5-3.5,3.5h-5c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5h3.379l-5.879-5.879-4.119,4.119c-1.037,1.037-2.725,1.037-3.762,0L.439,8.561c-.586-.586-.586-1.535,0-2.121s1.535-.586,2.121,0l4.439,4.439,4.08-4.08c1.059-1.059,2.781-1.059,3.84,0l6.08,6.08v-3.379c0-.828,.672-1.5,1.5-1.5s1.5,.672,1.5,1.5Z" />
                    </svg>
                    <span className="text-danger f-s-16 fw-semibold ms-1">
                      {totalRejected}
                    </span>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal> */}
    </React.Fragment>
  );
}

export default CompletedSalesOrdersList;
