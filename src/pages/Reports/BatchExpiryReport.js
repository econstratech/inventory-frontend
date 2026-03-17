import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table as AntTable } from "antd";
import { PrivateAxios } from "../../environment/AxiosInstance";

const toDateString = (d) => {
  if (!d || !(d instanceof Date)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

function BatchExpiryReport() {
  const [expiryDate, setExpiryDate] = useState(() => new Date());
  const [appliedExpiryDate, setAppliedExpiryDate] = useState(() => new Date());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState({ page: 1, limit: 15 });
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterCollapsed, setFilterCollapsed] = useState(false);

  const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

  const fetchReportData = useCallback(
    async (date, page = 1, limit = 15) => {
      try {
        setLoading(true);
        const expiryStr = toDateString(date) || toDateString(new Date());
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          expiry_date: expiryStr,
        });
        const response = await PrivateAxios.get(`report/batch-expiration-report?${params.toString()}`);
        const data = response.data?.data;
        const rows = data?.rows ?? [];
        const pag = data?.pagination ?? {};
        setReportData(Array.isArray(rows) ? rows : []);
        setTotalRecords(pag.total_records ?? 0);
      } catch (error) {
        console.error("Failed to fetch batch expiration report:", error);
        setReportData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchReportData(appliedExpiryDate, pageState.page, pageState.limit);
  }, [appliedExpiryDate, pageState.page, pageState.limit, fetchReportData]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setAppliedExpiryDate(expiryDate || new Date());
    setPageState((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    const now = new Date();
    setExpiryDate(now);
    setAppliedExpiryDate(now);
    setPageState({ page: 1, limit: 15 });
  };

  const handlePageChange = (page, pageSize) => {
    setPageState((prev) => ({
      ...prev,
      page,
      limit: pageSize || prev.limit,
    }));
  };

  const getVariantLabel = (record) => {
    const pv = record.productVariant;
    if (!pv) return "—";
    const weight = pv.weight_per_unit ?? "";
    const uom = pv.masterUOM?.label ?? pv.masterUOM?.name ?? "";
    if (!weight && !uom) return "—";
    return `${weight} ${uom}`.trim();
  };

  const tableColumns = [
    {
      title: "SL No.",
      key: "slNo",
      width: 90,
      render: (_, __, index) => (pageState.page - 1) * pageState.limit + index + 1,
    },
    { title: "Batch No.", dataIndex: "batch_no", key: "batch_no", width: 130 },
    {
      title: "Product Code",
      key: "product_code",
      width: 130,
      render: (_, record) => record.productVariant?.product?.product_code ?? "—",
    },
    {
      title: "Product Name",
      key: "product_name",
      width: 200,
      render: (_, record) => record.productVariant?.product?.product_name ?? "—",
    },
    {
      title: "Variant",
      key: "variant",
      width: 120,
      render: (_, record) => getVariantLabel(record),
    },
    {
      title: "Manufacture Date",
      key: "manufacture_date",
      width: 140,
      render: (_, record) => formatDisplayDate(record.manufacture_date),
    },
    {
      title: "Expiry Date",
      key: "expiry_date",
      width: 120,
      render: (_, record) => formatDisplayDate(record.expiry_date),
    },
    {
      title: "Balance Qty",
      dataIndex: "available_quantity",
      key: "available_quantity",
      width: 100,
      render: (val) => (val != null ? Number(val) : "—"),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-3">
        <button
          type="button"
          className="btn link-btn text-dark"
          onClick={() => window.history.back()}
        >
          <i className="fas fa-long-arrow-alt-left me-1" />
          Back
        </button>
      </div>

      <form onSubmit={handleApplyFilter}>
        <div className="card">
          <div
            className="card-header d-flex justify-content-between align-items-center"
            onClick={() => setFilterCollapsed((c) => !c)}
            style={{ cursor: "pointer" }}
            aria-expanded={!filterCollapsed}
          >
            <h4 className="card-title mb-0">Filters</h4>
            <span className="btn btn-sm btn-link text-dark p-0">
              {filterCollapsed ? (
                <i className="fas fa-chevron-down" />
              ) : (
                <i className="fas fa-chevron-up" />
              )}
            </span>
          </div>
          <div style={{ display: filterCollapsed ? "none" : "block" }}>
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-xl-6">
                  <label className="col-form-label">
                    Expiry Date <span className="text-exp-red">*</span>
                  </label>
                  <div className="exp-datepicker-cont">
                    <span className="cal-icon">
                      <i className="fas fa-calendar-alt" />
                    </span>
                    <DatePicker
                      selected={expiryDate}
                      onChange={(date) => setExpiryDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                      className="form-control"
                    />
                  </div>
                  <small className="text-muted">Batches expiring on or before this date (default: today)</small>
                </div>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-exp-light me-2"
                onClick={handleReset}
              >
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
          <h4 className="card-title mb-0">Batch Expiry Report</h4>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center">Loading report data...</div>
          ) : (
            <AntTable
              rowKey="id"
              dataSource={reportData}
              columns={tableColumns}
              loading={loading}
              pagination={{
                current: pageState.page,
                pageSize: pageState.limit,
                total: totalRecords,
                showSizeChanger: true,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                onChange: handlePageChange,
                showTotal: (total) => `Total ${total} records`,
              }}
              size="small"
              className="px-3"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BatchExpiryReport;
