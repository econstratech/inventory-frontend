import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Table, Tag } from "antd";
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

function MaterialIssueReport() {
  const { isVariantBased } = UserAuth();

  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [search, setSearch] = useState("");
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

  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);

  const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

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
    async (startDate, endDate, page = 1, limit = 15, searchVal = "") => {
      setLoading(true);
      try {
        const params = { page, limit };
        const startStr = toDateString(startDate);
        const endStr = toDateString(endDate);
        if (startStr) params.date_from = startStr;
        if (endStr) params.date_to = endStr;
        if (searchVal.trim()) params.search = searchVal.trim();

        const response = await PrivateAxios.get("report/production/material-issue-report", { params });
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
        console.error("Failed to fetch material issue report:", error);
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
    const { startDate, endDate } = getDateParams();
    if (selectedRange === "custom" && (!fmsData.startDate || !fmsData.endDate || fmsData.startDate > fmsData.endDate)) {
      alert("Please provide a valid custom date range.");
      return;
    }
    if (selectedRange === "3m" || selectedRange === "6m") {
      setFmsData({ startDate, endDate });
    }
    fetchReportData(startDate, endDate, 1, pageSize, search);
  };

  const handleReset = () => {
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    setSelectedRange("");
    setFmsData({ startDate: threeMonthsAgo, endDate: today });
    setSearch("");
    setPageSize(15);
    fetchReportData(null, null, 1, 15, "");
  };

  const handlePageChange = (newPage) => {
    const { startDate, endDate } = getDateParams();
    fetchReportData(startDate, endDate, newPage, pageSize, search);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || 15;
    setPageSize(newSize);
    const { startDate, endDate } = getDateParams();
    fetchReportData(startDate, endDate, 1, newSize, search);
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

    setExporting(true);
    try {
      const response = await PrivateAxios.get("report/production/export/material-issue-report", {
        params,
        responseType: "blob",
      });

      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, "0")}${String(today.getMonth() + 1).padStart(2, "0")}${today.getFullYear()}`;
      const fallbackFilename = `material-issue-report${dateStr}.csv`;

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
      console.error("Failed to export material issue report:", error);
      alert("Failed to export material issue report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const openDetailModal = (record) => {
    setSelectedWO(record);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedWO(null);
  };

  // Material detail modal columns
  const materialColumns = [
    {
      title: "Raw Material",
      dataIndex: ["rawMaterialProduct", "product_name"],
      key: "rm_name",
      render: (_, row) => (
        <div>
          <div className="fw-semibold">{row.rawMaterialProduct?.product_name || "N/A"}</div>
          {isVariantBased && row.rawMaterialProductVariant && (
            <small className="text-muted">
              {row.rawMaterialProductVariant.weight_per_unit} {row.rawMaterialProductVariant.masterUOM?.label}
            </small>
          )}
        </div>
      ),
    },
    {
      title: "Product Code",
      key: "rm_code",
      render: (_, row) => row.rawMaterialProduct?.product_code || "N/A",
    },
    {
      title: "BOM Qty/Unit",
      dataIndex: "bom_qty_per_unit",
      key: "bom_qty",
      // align: "right",
    },
    {
      title: "Required Qty",
      dataIndex: "required_qty",
      key: "required_qty",
      // align: "right",
      render: (val) => <span className="fw-semibold">{val}</span>,
    },
    {
      title: "Issued Qty",
      dataIndex: "issued_qty",
      key: "issued_qty",
      // align: "right",
      render: (val) => <span style={{ color: val > 0 ? "#10b981" : "#64748b", fontWeight: 600 }}>{val}</span>,
    },
    {
      title: "Variance",
      dataIndex: "variance",
      key: "variance",
      // align: "right",
      render: (val) => (
        <Tag color={val >= 0 ? "green" : "red"} style={{ fontWeight: 600 }}>
          {val >= 0 ? `+${val}` : val}
        </Tag>
      ),
    },
  ];

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
                          <input type="radio" name="reportRange" value={range} checked={selectedRange === range} readOnly tabIndex={-1} />
                          <span className="checkmark" />
                          <span className="text-">{range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}</span>
                        </label>
                      ))}
                    </div>

                    {selectedRange === "custom" && (
                      <div className="row">
                        <div className="col-md-6 col-12">
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
                        <div className="col-md-6 col-12">
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
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-xl-6">
                  <label className="col-form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by WO number, product, or customer"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
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

      {/* ── Report Table ── */}
      <div className="card mt-4">
        <div className="card-header bg-primary d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Material Issue Report</h4>
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
                    <th>Customer Name</th>
                    <th>FG Name</th>
                    {isVariantBased && <th>Variant</th>}
                    <th>Due Date</th>
                    <th>Planned Qty</th>
                    <th>Final Qty</th>
                    <th style={{ width: 50, textAlign: "center" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={isVariantBased ? 9 : 8} className="text-center text-muted py-4">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row, index) => (
                      <tr key={row.id}>
                        <td>{(pagination.current_page - 1) * pagination.per_page + index + 1}</td>
                        <td className="fw-semibold">{row.wo_number}</td>
                        <td>{row.customer?.name || "N/A"}</td>
                        <td>
                          <div>{row.product?.product_name || "N/A"}</div>
                          <small className="text-muted">{row.product?.product_code}</small>
                        </td>
                        {isVariantBased && (
                          <td>
                            {row.finalProductVariant ? (
                              <span>
                                {row.finalProductVariant.weight_per_unit} {row.finalProductVariant.masterUOM?.label}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        )}
                        <td>{formatDisplayDate(row.due_date)}</td>
                        <td>{row.planned_qty}</td>
                        <td>{row.final_qty ?? "N/A"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-primary p-0"
                            title="View material details"
                            onClick={() => openDetailModal(row)}
                          >
                            <i className="fas fa-eye" />
                          </button>
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

      {/* ── Material Detail Modal ── */}
      <Modal
        title={
          <div>
            <div className="fw-semibold">Material Issue Details</div>
            {selectedWO && (
              <div className="small text-muted">
                {selectedWO.wo_number} &mdash; {selectedWO.product?.product_name} &mdash; {selectedWO.customer?.name}
              </div>
            )}
          </div>
        }
        open={detailModalOpen}
        onCancel={closeDetailModal}
        footer={[
          <Button key="close" onClick={closeDetailModal}>
            Close
          </Button>,
        ]}
        width={850}
        destroyOnClose
      >
        {selectedWO && (
          <div>
            <div className="row mb-3">
              <div className="col-md-3">
                <div className="text-muted small">Planned Qty</div>
                <div className="fw-semibold">{selectedWO.planned_qty}</div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small">Final Qty</div>
                <div className="fw-semibold">{selectedWO.final_qty ?? "N/A"}</div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small">Due Date</div>
                <div className="fw-semibold">{formatDisplayDate(selectedWO.due_date)}</div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small">Completed At</div>
                <div className="fw-semibold">{formatDisplayDate(selectedWO.production_completed_at)}</div>
              </div>
            </div>
            <Table
              columns={materialColumns}
              dataSource={selectedWO.materialDetails || []}
              rowKey="bom_id"
              pagination={false}
              size="small"
              bordered
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MaterialIssueReport;
