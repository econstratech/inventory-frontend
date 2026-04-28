import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Table, Tag, Tooltip } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subMonths } from "date-fns";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";

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
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatDisplayDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

const DISPATCH_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "0", label: "Not Dispatched" },
  { value: "1", label: "Partially Dispatched" },
  { value: "2", label: "Fully Dispatched" },
];

const dispatchStatusTagColor = (status) => {
  const s = Number(status);
  if (s === 2) return "green";
  if (s === 1) return "orange";
  return "default";
};

function DispatchReport() {
  const { isVariantBased } = UserAuth();

  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [search, setSearch] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState("");
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
  const [pageSize, setPageSize] = useState(15);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logModalRow, setLogModalRow] = useState(null);

  const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

  const openLogModal = (row) => {
    setLogModalRow(row);
    setLogModalOpen(true);
  };

  const closeLogModal = () => {
    setLogModalOpen(false);
    setLogModalRow(null);
  };

  const getDateParams = useCallback(
    (rangeOverride, fmsOverride) => {
      const range = rangeOverride ?? selectedRange;
      const fms = fmsOverride ?? fmsData;
      const today = new Date();
      let startDate = null;
      let endDate = null;

      if (range === "custom" && fms.startDate && fms.endDate) {
        startDate = fms.startDate;
        endDate = fms.endDate;
      } else if (range === "3m") {
        startDate = subMonths(today, 3);
        endDate = today;
      } else if (range === "6m") {
        startDate = subMonths(today, 6);
        endDate = today;
      }
      return { startDate, endDate };
    },
    [selectedRange, fmsData]
  );

  const fetchReportData = useCallback(
    async (startDate, endDate, page = 1, limit = 15, searchVal = "", statusVal = "") => {
      setLoading(true);
      try {
        const params = { page, limit };
        const startStr = toDateString(startDate);
        const endStr = toDateString(endDate);
        if (startStr) params.date_from = startStr;
        if (endStr) params.date_to = endStr;
        if (searchVal.trim()) params.search = searchVal.trim();
        if (statusVal !== "") params.dispatch_status = statusVal;

        const response = await PrivateAxios.get("report/production/dispatch-report", { params });
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
        console.error("Failed to fetch dispatch report:", error);
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
    fetchReportData(threeMonthsAgo, today, 1, 15, "", "");
  }, [fetchReportData]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const { startDate, endDate } = getDateParams();
    if (selectedRange === "custom" && (!fmsData.startDate || !fmsData.endDate || fmsData.startDate > fmsData.endDate)) {
      alert("Please provide a valid custom date range.");
      return;
    }
    if (selectedRange === "3m" || selectedRange === "6m") {
      setFmsData({ startDate, endDate });
    }
    fetchReportData(startDate, endDate, 1, pageSize, search, dispatchStatus);
  };

  const handleReset = () => {
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    setSelectedRange("");
    setFmsData({ startDate: threeMonthsAgo, endDate: today });
    setSearch("");
    setDispatchStatus("");
    setPageSize(15);
    fetchReportData(null, null, 1, 15, "", "");
  };

  const handlePageChange = (newPage) => {
    const { startDate, endDate } = getDateParams();
    fetchReportData(startDate, endDate, newPage, pageSize, search, dispatchStatus);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || 15;
    setPageSize(newSize);
    const { startDate, endDate } = getDateParams();
    fetchReportData(startDate, endDate, 1, newSize, search, dispatchStatus);
  };

  const handleRangeToggle = (range) => {
    setSelectedRange((prev) => (prev === range ? "" : range));
  };

  const handleExport = async () => {
    if (selectedRange === "custom" && (!fmsData.startDate || !fmsData.endDate || fmsData.startDate > fmsData.endDate)) {
      alert("Please provide a valid custom date range.");
      return;
    }

    const { startDate, endDate } = getDateParams();
    const params = {};
    const startStr = toDateString(startDate);
    const endStr = toDateString(endDate);
    if (startStr) params.date_from = startStr;
    if (endStr) params.date_to = endStr;
    if (search.trim()) params.search = search.trim();
    if (dispatchStatus !== "") params.dispatch_status = dispatchStatus;

    setExporting(true);
    try {
      const response = await PrivateAxios.get("report/production/export/dispatch-report", {
        params,
        responseType: "blob",
      });

      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, "0")}${String(today.getMonth() + 1).padStart(2, "0")}${today.getFullYear()}`;
      const fallbackFilename = `dispatch-report${dateStr}.csv`;

      const disposition = response?.headers?.["content-disposition"] || "";
      const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
      const filename = fileNameMatch?.[1]
        ? decodeURIComponent(fileNameMatch[1].replace(/"/g, ""))
        : fallbackFilename;

      const blob = new Blob([response.data], {
        type: response?.headers?.["content-type"] || "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export dispatch report:", error);
      alert("Failed to export dispatch report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const colCount = isVariantBased ? 11 : 8;

  return (
    <div className="p-4">
      <div className="mb-3">
        <button className="btn link-btn text-dark" onClick={() => window.history.back()}>
          <i className="fas fa-long-arrow-alt-left me-1" />
          Back
        </button>
      </div>

      {/* ── Filters ── */}
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
              <div className="row g-3">
                <div className="col-xl-4 col-lg-12 py-3">
                  <label className="col-form-label">Quick Report (click again to clear)</label>
                  <div className="d-flex flex-nowrap gap-2 overflow-auto">
                    {["3m", "6m", "custom"].map((range) => (
                      <label
                        key={range}
                        className={`custom-radio btn-type-radio mb-0 ${selectedRange === range ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleRangeToggle(range);
                        }}
                        style={{ flex: "0 0 auto" }}
                      >
                        <input type="radio" name="reportRange" value={range} checked={selectedRange === range} readOnly tabIndex={-1} />
                        <span className="checkmark" />
                        <span className="text-">{range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 py-3">
                  <label className="col-form-label">Dispatch Status</label>
                  <select
                    className="form-select"
                    value={dispatchStatus}
                    onChange={(e) => setDispatchStatus(e.target.value)}
                  >
                    {DISPATCH_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-xl-3 col-lg-8 col-md-6 py-3">
                  <label className="col-form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by WO number or FG name / code"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {selectedRange === "custom" && (
                  <>
                    <div className="col-xl-3 col-md-6">
                      <label className="col-form-label">
                        From <span className="text-exp-red">*</span>
                      </label>
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
                    <div className="col-xl-3 col-md-6">
                      <label className="col-form-label">
                        To <span className="text-exp-red">*</span>
                      </label>
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
                  </>
                )}
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

      {/* ── Report Table ── */}
      <div className="card mt-4">
        <div className="card-header bg-primary d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Dispatch Report</h4>
          <button
            type="button"
            className="btn btn-light btn-sm ms-auto"
            onClick={handleExport}
            disabled={exporting || loading}
          >
            {exporting ? (
              <>
                <i className="fas fa-spinner fa-spin me-1" />
                Exporting...
              </>
            ) : (
              <>
                <i className="fas fa-file-csv me-1" />
                Export
              </>
            )}
          </button>
        </div>
        <div className="card-body p-0 table-responsive">
          {loading ? (
            <div className="p-4 text-center">Loading report data...</div>
          ) : (
            <>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>SL No.</th>
                    <th>Work Order No.</th>
                    <th>FG Name</th>
                    {isVariantBased && <th>Variant</th>}
                    <th>Planned Qty</th>
                    {isVariantBased && <th>Planned Weight</th>}
                    <th>Used RM Qty</th>
                    {isVariantBased && <th>Used Weight</th>}
                    <th>Dispatched Qty</th>
                    <th>Dispatch Status</th>
                    <th>Production Completed</th>
                    <th style={{ width: 80 }} className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="text-center text-muted py-4">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row, index) => (
                      <tr key={row.id}>
                        <td>{(pagination.current_page - 1) * pagination.per_page + index + 1}</td>
                        <td className="fw-semibold">{row.wo_number}</td>
                        <td>
                          <div>{row.fg_product?.product_name || "N/A"}</div>
                          {row.fg_product?.product_code && (
                            <small className="text-muted">{row.fg_product.product_code}</small>
                          )}
                        </td>
                        {isVariantBased && (
                          <td>
                            {row.fg_variant ? (
                              <span>
                                {row.fg_variant.weight_per_unit} {row.fg_variant.uom_label}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        )}
                        <td>{row.planned_qty}</td>
                        {isVariantBased && (
                          <td className="fw-semibold">{row.planned_weight || "N/A"}</td>
                        )}
                        <td>{row.raw_material_used_qty}</td>
                        {isVariantBased && (
                          <td className="fw-semibold">{row.used_weight || "N/A"}</td>
                        )}
                        <td>{row.dispatched_quantity || 0 }</td>
                        <td>
                          <Tag
                            color={dispatchStatusTagColor(row.dispatch_status)}
                            style={{ fontWeight: 600 }}
                          >
                            {row.dispatch_status_label || "N/A"}
                          </Tag>
                        </td>
                        <td>{formatDisplayDate(row.production_completed_at)}</td>
                        <td className="text-center">
                          <Tooltip title="View Dispatch Log">
                            <Button
                              type="text"
                              size="small"
                              icon={<i className="fas fa-eye" style={{ color: "#1d4ed8" }} />}
                              onClick={() => openLogModal(row)}
                              disabled={!Array.isArray(row.dispatch_log) || row.dispatch_log.length === 0}
                            />
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {(pagination.total_pages > 0 || reportData.length > 0) && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-top">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-muted small">
                      Showing page {pagination.current_page} of {pagination.total_pages || 1} ({pagination.total_records} records)
                    </span>
                    <label className="d-flex align-items-center gap-1 small mb-0">
                      <span className="text-muted">Per page:</span>
                      <select className="form-select form-select-sm" value={pageSize} onChange={handlePageSizeChange} style={{ width: "auto" }}>
                        {PAGE_SIZE_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
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

      {/* ── dispatch log modal ── */}
      <Modal
        title={
          <span className="fw-semibold">
            Dispatch Log {logModalRow?.wo_number ? `— ${logModalRow.wo_number}` : ""}
          </span>
        }
        open={logModalOpen}
        onCancel={closeLogModal}
        footer={[
          <Button key="close" onClick={closeLogModal}>Close</Button>,
        ]}
        width={760}
      >
        {(() => {
          const logs = Array.isArray(logModalRow?.dispatch_log) ? logModalRow.dispatch_log : [];
          if (logs.length === 0) {
            return (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-inbox fa-2x mb-2"></i>
                <p className="mb-0">No dispatch records found.</p>
              </div>
            );
          }
          return (
            <Table
              rowKey="id"
              dataSource={logs}
              pagination={false}
              size="small"
              expandable={{
                rowExpandable: (record) => Array.isArray(record.batches) && record.batches.length > 0,
                expandedRowRender: (record) => (
                  <div className="px-3 py-2" style={{ background: "#f8fafc" }}>
                    <div className="fw-semibold mb-2" style={{ fontSize: 12, color: "#475569" }}>
                      Batches ({record.batches.length})
                    </div>
                    <Table
                      rowKey="id"
                      dataSource={record.batches}
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: "Batch No.",
                          dataIndex: "batch_no",
                          key: "batch_no",
                          width: 140,
                          render: (v) => <span className="fw-semibold">{v || "—"}</span>,
                        },
                        {
                          title: "Quantity",
                          dataIndex: "quantity",
                          key: "quantity",
                          width: 90,
                          render: (v) =>
                            v != null
                              ? new Intl.NumberFormat("en-IN").format(Number(v))
                              : <span className="text-muted">—</span>,
                        },
                        {
                          title: "Mfg Date",
                          dataIndex: "mfg_date",
                          key: "mfg_date",
                          width: 120,
                          render: (v) => (v ? formatDisplayDate(v) : <span className="text-muted">—</span>),
                        },
                        {
                          title: "Exp Date",
                          dataIndex: "exp_date",
                          key: "exp_date",
                          width: 120,
                          render: (v) => (v ? formatDisplayDate(v) : <span className="text-muted">—</span>),
                        },
                      ]}
                    />
                  </div>
                ),
              }}
              columns={[
                {
                  title: "#",
                  key: "index",
                  width: 40,
                  render: (_, __, i) => i + 1,
                },
                {
                  title: "Quantity",
                  dataIndex: "dispatched_qty",
                  key: "dispatched_qty",
                  width: 90,
                  render: (v) => (
                    <span className="fw-bold">
                      {new Intl.NumberFormat("en-IN").format(Number(v) || 0)}
                    </span>
                  ),
                },
                {
                  title: "Batches",
                  key: "batches_count",
                  width: 80,
                  render: (_, record) => {
                    const count = Array.isArray(record.batches) ? record.batches.length : 0;
                    return count > 0 ? (
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                          borderRadius: 12,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {count}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    );
                  },
                },
                {
                  title: "Note",
                  dataIndex: "dispatch_note",
                  key: "dispatch_note",
                  width: 200,
                  render: (v) => v || <span className="text-muted">—</span>,
                },
                {
                  title: "Dispatched By",
                  key: "dispatched_by",
                  width: 130,
                  render: (_, record) => record.dispatchedBy?.name || "—",
                },
                {
                  title: "Date",
                  dataIndex: "dispatched_at",
                  key: "dispatched_at",
                  width: 160,
                  render: (v) => formatDisplayDateTime(v),
                },
              ]}
            />
          );
        })()}
      </Modal>
    </div>
  );
}

export default DispatchReport;
