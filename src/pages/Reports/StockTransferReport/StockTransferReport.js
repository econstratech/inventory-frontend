import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Button } from "@mui/material";
import { subMonths } from "date-fns";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import StockTransferDetailModal from "./StockTransferDetailModal";

const toDateString = (d) => {
  if (!d || !(d instanceof Date)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const TRANSFER_TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "stock_transfer", label: "Stock Transfer" },
  { value: "add_to_stock", label: "Add to Stock" },
  { value: "sales_order_return", label: "Sales Order Return" },
  { value: "purchase_order_return", label: "Purchase Order Return" },
  { value: "scrap_items", label: "Scrap Items" },
];

const getTransferTypeLabel = (value) => {
  const opt = TRANSFER_TYPE_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value || "—";
};

function StockTransferReport() {
  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 15,
    has_next_page: false,
    has_prev_page: false,
    next_page: null,
    prev_page: null,
  });
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [transferType, setTransferType] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

  const fetchReportData = useCallback(
    async (startDate, endDate, page = 1, limit = 15, typeFilter = "") => {
      try {
        setLoading(true);
        const params = { page, limit };
        const startStr = toDateString(startDate);
        const endStr = toDateString(endDate);
        if (startStr) params.start_date = startStr;
        if (endStr) params.end_date = endStr;
        if (typeFilter && String(typeFilter).trim() !== "") {
          params.transfer_type = String(typeFilter).trim();
        }
        const response = await PrivateAxios.get("report/stock-transfer-report", { params });
        const data = response.data?.data;
        const rows = data?.rows ?? [];
        const pag = data?.pagination ?? {};
        setReportData(rows);
        setPagination({
          total_records: pag.total_records ?? 0,
          total_pages: pag.total_pages ?? 0,
          current_page: pag.current_page ?? 1,
          per_page: pag.per_page ?? limit,
          has_next_page: !!pag.has_next_page,
          has_prev_page: !!pag.has_prev_page,
          next_page: pag.next_page ?? null,
          prev_page: pag.prev_page ?? null,
        });
      } catch (error) {
        console.error("Failed to fetch stock transfer report:", error);
        setReportData([]);
        setPagination((prev) => ({ ...prev, total_records: 0, total_pages: 0 }));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    setFmsData({ startDate: threeMonthsAgo, endDate: today });
    fetchReportData(threeMonthsAgo, today, 1, 15, "");
  }, [fetchReportData]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    let startDate = null;
    let endDate = null;
    const today = new Date();
    if (selectedRange === "custom") {
      if (!fmsData.startDate || !fmsData.endDate || fmsData.startDate > fmsData.endDate) {
        alert("Please provide a valid custom date range.");
        return;
      }
      startDate = fmsData.startDate;
      endDate = fmsData.endDate;
    } else if (selectedRange === "3m") {
      startDate = subMonths(today, 3);
      endDate = today;
      setFmsData({ startDate, endDate });
    } else if (selectedRange === "6m") {
      startDate = subMonths(today, 6);
      endDate = today;
      setFmsData({ startDate, endDate });
    }
    fetchReportData(startDate, endDate, 1, pageSize, transferType);
  };

  const handleReset = () => {
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    setSelectedRange("3m");
    setFmsData({ startDate: threeMonthsAgo, endDate: today });
    setTransferType("");
    setPageSize(15);
    fetchReportData(threeMonthsAgo, today, 1, 15, "");
  };

  const handlePageChange = (newPage) => {
    const start = selectedRange ? fmsData.startDate : null;
    const end = selectedRange ? fmsData.endDate : null;
    fetchReportData(start, end, newPage, pageSize, transferType);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || 15;
    setPageSize(newSize);
    const start = selectedRange ? fmsData.startDate : null;
    const end = selectedRange ? fmsData.endDate : null;
    fetchReportData(start, end, 1, newSize, transferType);
  };

  const handleRangeToggle = (range) => {
    setSelectedRange((prev) => (prev === range ? "" : range));
  };

  const openDetailModal = (record) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="p-4">
      <div className="mb-3">
        <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
          <i className="fas fa-long-arrow-alt-left me-1" />
          Back
        </Button>
      </div>
      <form onSubmit={handleGenerateReport}>
        <div className="card">
          <div
            className="card-header d-flex justify-content-between align-items-center"
            onClick={() => setFilterCollapsed((c) => !c)}
            style={{ cursor: "pointer" }}
            aria-expanded={!filterCollapsed}
          >
            <h4 className="card-title mb-0">Filters</h4>
            <span className="btn btn-sm btn-link text-dark p-0">
              {filterCollapsed ? <i className="fas fa-chevron-down" /> : <i className="fas fa-chevron-up" />}
            </span>
          </div>
          <div style={{ display: filterCollapsed ? "none" : "block" }}>
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-xl-6">
                  <label className="col-form-label">Quick Report (click again to clear)</label>
                  <div className="form-group">
                    <div className="d-flex flex-wrap">
                      {["3m", "6m", "custom"].map((range) => (
                        <label
                          key={range}
                          className={`custom-radio btn-type-radio mb-2 me-3 ${selectedRange === range ? "active" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleRangeToggle(range);
                          }}
                        >
                          <input
                            type="radio"
                            name="reportRange"
                            value={range}
                            checked={selectedRange === range}
                            readOnly
                            tabIndex={-1}
                          />
                          <span className="checkmark" />
                          <span className="text-">
                            {range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}
                          </span>
                        </label>
                      ))}
                    </div>
                    {selectedRange === "custom" && (
                      <div className="row">
                        <div className="col-md-6 col-12">
                          <label className="col-form-label">From <span className="text-exp-red">*</span></label>
                          <div className="exp-datepicker-cont">
                            <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                            <DatePicker
                              required
                              selected={fmsData.startDate}
                              onChange={(date) => setFmsData({ ...fmsData, startDate: date })}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select Date"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 col-12">
                          <label className="col-form-label">To <span className="text-exp-red">*</span></label>
                          <div className="exp-datepicker-cont">
                            <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                            <DatePicker
                              required
                              selected={fmsData.endDate}
                              onChange={(date) => setFmsData({ ...fmsData, endDate: date })}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select Date"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-xl-6">
                  <label className="col-form-label">Filter by Type</label>
                  <select
                    className="form-select"
                    value={transferType}
                    onChange={(e) => setTransferType(e.target.value)}
                  >
                    {TRANSFER_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value || "all"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end">
              <button type="button" className="btn btn-exp-light me-2" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="btn btn-exp-green">
                Apply
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="card mt-4">
        <div className="card-header bg-primary">
          <h4 className="card-title mb-0">Stock Transfer Report</h4>
        </div>
        <div className="card-body p-0 table-responsive stock-transfer-report-grid">
          {loading ? (
            <div className="p-4 text-center">Loading report data...</div>
          ) : (
            <>
              <style>{`
                .stock-transfer-report-grid .k-grid thead th {
                  vertical-align: middle;
                  text-align: center;
                }
              `}</style>
              <Grid data={reportData}>
                <GridColumn field="reference_number" title="Reference Number" width="160px" />
                <GridColumn
                  field="transfer_type"
                  title="Transfer Type"
                  width="180px"
                  cell={(props) => <td>{getTransferTypeLabel(props.dataItem.transfer_type)}</td>}
                />
                <GridColumn
                  title="From Store"
                  width="220px"
                  cell={(props) => <td>{props.dataItem.fromWarehouse?.name ?? "—"}</td>}
                />
                <GridColumn
                  title="To Store"
                  width="220px"
                  cell={(props) => <td>{props.dataItem.toWarehouse?.name ?? "—"}</td>}
                />
                <GridColumn
                  field="created_at"
                  title="Created Date"
                  width="120px"
                  cell={(props) => <td>{formatDisplayDate(props.dataItem.created_at)}</td>}
                />
                <GridColumn
                  title=""
                  width="80px"
                  cell={(props) => (
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-primary p-0"
                        title="View details"
                        onClick={() => openDetailModal(props.dataItem)}
                      >
                        <i className="fas fa-eye" />
                      </button>
                    </td>
                  )}
                />
              </Grid>
              {(pagination.total_pages > 0 || reportData.length > 0) && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-top">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-muted small">
                      Showing page {pagination.current_page} of {pagination.total_pages || 1} (
                      {pagination.total_records} records)
                    </span>
                    <label className="d-flex align-items-center gap-1 small mb-0">
                      <span className="text-muted">Per page:</span>
                      <select
                        className="form-select form-select-sm"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        style={{ width: "auto" }}
                      >
                        {PAGE_SIZE_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={!pagination.has_prev_page}
                      onClick={() => handlePageChange(pagination.prev_page ?? pagination.current_page - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={!pagination.has_next_page}
                      onClick={() => handlePageChange(pagination.next_page ?? pagination.current_page + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <StockTransferDetailModal
        show={detailModalOpen}
        onHide={closeDetailModal}
        record={selectedRecord}
      />
    </div>
  );
}

export default StockTransferReport;
