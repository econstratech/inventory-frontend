import React, { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Input, Modal, Progress, Select, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import CustomerSelect from "../../filterComponents/CustomerSelect";
import { UserAuth } from "../../auth/Auth";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
import { use } from "react";

const { RangePicker } = DatePicker;

const DATE_PRESETS = [
  { label: "All Time", value: "all" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Last 3 Months", value: "last_3_months" },
  { label: "This Year", value: "this_year" },
  { label: "Last Year", value: "last_year" },
  { label: "Custom", value: "custom" },
];

const DISPATCH_STATUSES = [
  { value: 0, label: "Pending" },
  { value: 1, label: "Partially Completed" },
  { value: 2, label: "Fully Completed" },
];

const STATUS_BADGE = {
  0: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },       // Blue - Pending
  1: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },       // Yellow - Partially Completed
  2: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },       // Green - Fully Completed
};

const getDateRange = (preset) => {
  const now = dayjs();
  switch (preset) {
    case "this_month":   return [now.startOf("month"), now.endOf("month")];
    case "last_month":   return [now.subtract(1, "month").startOf("month"), now.subtract(1, "month").endOf("month")];
    case "last_3_months":return [now.subtract(3, "month").startOf("day"), now.endOf("day")];
    case "this_year":    return [now.startOf("year"), now.endOf("year")];
    case "last_year":    return [now.subtract(1, "year").startOf("year"), now.subtract(1, "year").endOf("year")];
    default:             return [null, null];
  }
};

function ProductionDispatch() {
  const { user } = UserAuth();

  // ─── list state ────────────────────────────────────────────────
  const [rows, setRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({ skip: 0, take: 25 });

  // ─── stats state ───────────────────────────────────────────────
  const [stats, setStats] = useState({
    total: 0, pending: 0, in_transit: 0, completed: 0,
    qty_out: 0, qty_delivered: 0, work_orders: 0, customers: 0,
  });

  // ─── filter / view state ───────────────────────────────────────
  const [datePreset, setDatePreset] = useState("all");
  const [customRange, setCustomRange] = useState([null, null]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // "table" | "by_wo"

  // ─── add dispatch modal state ──────────────────────────────────
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [completedWOs, setCompletedWOs] = useState([]);
  const [loadingWOs, setLoadingWOs] = useState(false);
  const [addForm, setAddForm] = useState({
    woId: null, dispatchQty: "", dispatchDate: null, notes: "",
  });
  const [addSaving, setAddSaving] = useState(false);

  // ─── inline status update ─────────────────────────────────────
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // ─── dispatch modal state ─────────────────────────────────────
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchRecord, setDispatchRecord] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({ dispatchQty: "", dispatchType: 1, notes: "" });
  const [dispatchSaving, setDispatchSaving] = useState(false);

  // ─── dispatch history modal state ─────────────────────────────
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyRecord, setHistoryRecord] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── helpers ────────────────────────────────────────────────────
  const activeDateRange = useMemo(() => {
    if (datePreset === "custom") return customRange;
    return getDateRange(datePreset);
  }, [datePreset, customRange]);

  const dateParams = useMemo(() => {
    const [from, to] = activeDateRange;
    return {
      ...(from ? { due_date_start: from.format("YYYY-MM-DD") } : {}),
      ...(to   ? { due_date_end:   to.format("YYYY-MM-DD") } : {}),
    };
  }, [activeDateRange]);

  // ── fetch list ─────────────────────────────────────────────────
  const fetchDispatches = async (customPage = null) => {
    const ps = customPage || pageState;
    setListLoading(true);
    try {
      const page = ps.skip / ps.take + 1;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(ps.take),
        sort_by: "created_at",
        order: sortOrder === "oldest" ? "ASC" : "DESC",
        view: viewMode,
        ...(statusFilter !== "all" ? { dispatch_status: statusFilter } : {}),
        ...(customerFilter?.id || customerFilter?.value
          ? { customer_id: String(customerFilter?.id ?? customerFilter?.value) }
          : {}),
        ...dateParams,
      }).toString();
      const res = await PrivateAxios.get(`/production/dispatch?${query}`);
      const payload = res.data?.data ?? {};
      const list = Array.isArray(payload?.rows) ? payload.rows : Array.isArray(payload) ? payload : [];
      const pagination = payload?.pagination || {};

      const dispatchedWOList = [];
      list.map((d) => {
        dispatchedWOList.push({
          ...d,
          customer_name: d.customer?.name || "",
          product_name: d.product?.product_name ? `${d.product?.product_name} (${d.product?.product_code})` : "",
          planned_qty: d.planned_qty || 0,
          final_qty: d.final_qty || 0,
          dispatch_qty: d.dispatch_qty || 0,
          dispatch_status: d.dispatch_status || 0,
          production_completed: d.productionCompletedBy ? `${d.productionCompletedBy.name} at ${dayjs(d.production_completed_at).format("DD/MM/YYYY")}` : null,
          total_dispatched_qty: d.total_dispatched_qty || 0,
        })
      })
      setRows(dispatchedWOList);
      setTotalCount(Number(pagination?.total_records) || dispatchedWOList.length || 0);
    } catch (error) {
      setRows([]);
      setTotalCount(0);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch dispatches.");
    } finally {
      setListLoading(false);
    }
  };

  
  useEffect(() => {
    console.log("completed WOs for dispatch:", rows);
  }, [rows]);

  // ── fetch stats ────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const query = new URLSearchParams({
        ...dateParams,
        ...(customerFilter?.id || customerFilter?.value
          ? { customer_id: String(customerFilter?.id ?? customerFilter?.value) }
          : {}),
      }).toString();
      const res = await PrivateAxios.get(`/production/dispatch/stats?${query}`);
      const d = res.data?.data || {};
      setStats({
        total:         Number(d.total)         || 0,
        pending:       Number(d.pending)       || 0,
        in_transit:    Number(d.in_transit)    || 0,
        completed:     Number(d.completed)     || 0,
        qty_out:       Number(d.qty_out)       || 0,
        qty_delivered: Number(d.qty_delivered) || 0,
        work_orders:   Number(d.work_orders)   || 0,
        customers:     Number(d.customers)     || 0,
      });
    } catch {
      // stats failure is non-critical
    }
  };

  useEffect(() => {
    fetchDispatches();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState.skip, pageState.take]);

  // run search when filters change (reset to page 1)
  const applyFilters = () => {
    const next = { skip: 0, take: pageState.take };
    setPageState(next);
    if (pageState.skip === 0) {
      fetchDispatches(next);
      fetchStats();
    }
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datePreset, customRange, statusFilter, customerFilter, sortOrder, viewMode]);

  // ── inline status update ───────────────────────────────────────
  const handleStatusChange = async (record, newStatus) => {
    setUpdatingStatusId(record.id);
    try {
      const res = await PrivateAxios.put(`/production/dispatch/update-status/${record.id}`, {
        status: newStatus,
      });
      SuccessMessage(res?.data?.message || "Status updated.");
      setRows((prev) =>
        prev.map((r) => (String(r.id) === String(record.id) ? { ...r, status: newStatus } : r))
      );
      fetchStats();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ── dispatch modal ─────────────────────────────────────────────
  const openDispatchModal = (record) => {
    setDispatchRecord(record);
    setDispatchForm({ dispatchQty: "", dispatchType: 1, notes: "" });
    setDispatchModalOpen(true);
  };

  const closeDispatchModal = () => {
    setDispatchModalOpen(false);
    setDispatchRecord(null);
  };

  // ── dispatch history ──────────────────────────────────────────
  const openHistoryModal = async (record) => {
    setHistoryRecord(record);
    setHistoryLogs([]);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await PrivateAxios.get(`/production/dispatch-history/${record.id}`);
      setHistoryLogs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to fetch dispatch history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setHistoryRecord(null);
    setHistoryLogs([]);
  };

  const handleDispatchSubmit = async () => {
    const qty = Number(dispatchForm.dispatchQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      ErrorMessage("Dispatch quantity must be a positive number.");
      return;
    }
    const finalQty = Number(dispatchRecord?.final_qty) || 0;
    if (finalQty > 0 && qty > finalQty) {
      ErrorMessage(`Dispatch quantity cannot exceed final quantity (${finalQty}).`);
      return;
    }
    setDispatchSaving(true);
    try {
      const res = await PrivateAxios.post(`/production/dispatch/${dispatchRecord.id}`, {
        dispatched_qty: qty,
        dispatch_status: dispatchForm.dispatchType,
        dispatch_note: dispatchForm.notes || null,
      });
      SuccessMessage(res?.data?.message || "Dispatch updated successfully.");
      closeDispatchModal();
      const next = { skip: 0, take: pageState.take };
      setPageState(next);
      fetchDispatches(next);
      fetchStats();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to dispatch.");
    } finally {
      setDispatchSaving(false);
    }
  };

  // ── completed WOs for add modal ────────────────────────────────
  const fetchCompletedWOs = async () => {
    setLoadingWOs(true);
    try {
      const res = await PrivateAxios.get("/production/work-order/list?status=completed&limit=100&page=1");
      const payload = res.data?.data ?? {};
      const list = Array.isArray(payload?.rows) ? payload.rows : Array.isArray(payload) ? payload : [];
      setCompletedWOs(
        list.map((w) => ({
          value: w.id,
          label: `${w.wo_number || "N/A"} — ${w.product?.product_name || ""}`,
          woData: w,
        }))
      );
    } catch {
      setCompletedWOs([]);
    } finally {
      setLoadingWOs(false);
    }
  };

  // ── add dispatch modal ─────────────────────────────────────────

  const openAddModal = () => {
    setAddForm({ woId: null, dispatchQty: "", dispatchDate: null, notes: "" });
    fetchCompletedWOs();
    setAddModalOpen(true);
  };

  const closeAddModal = () => setAddModalOpen(false);

  const handleAddDispatch = async () => {
    if (!addForm.woId) { ErrorMessage("Please select a work order."); return; }
    const qty = Number(addForm.dispatchQty);
    if (!Number.isFinite(qty) || qty <= 0) { ErrorMessage("Dispatch quantity must be a positive number."); return; }
    if (!addForm.dispatchDate) { ErrorMessage("Dispatch date is required."); return; }

    setAddSaving(true);
    try {
      const res = await PrivateAxios.post("/production/dispatch/create", {
        wo_id: addForm.woId,
        dispatch_qty: qty,
        dispatch_date: dayjs(addForm.dispatchDate).format("YYYY-MM-DD"),
        notes: addForm.notes || null,
      });
      SuccessMessage(res?.data?.message || "Dispatch created successfully.");
      closeAddModal();
      const next = { skip: 0, take: pageState.take };
      setPageState(next);
      fetchDispatches(next);
      fetchStats();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to create dispatch.");
    } finally {
      setAddSaving(false);
    }
  };

  // ── render helpers ─────────────────────────────────────────────
  const renderStatusBadge = (status) => {
    const s = STATUS_BADGE[status] || STATUS_BADGE[0];
    const label = DISPATCH_STATUSES.find((x) => x.value === status)?.label || status;
    return (
      <span
        style={{
          background: s.bg, color: s.color,
          border: `1px solid ${s.border}`,
          borderRadius: 20, padding: "3px 12px",
          fontSize: 12, fontWeight: 600,
        }}
      >
        {label}
      </span>
    );
  };

  const getProgressColor = (pct) => {
    const hue = Math.round((Math.min(Math.max(Number(pct) || 0, 0), 100) / 100) * 120);
    return `hsl(${hue}, 75%, 42%)`;
  };

  // ── columns ────────────────────────────────────────────────────
  const columns = [
    // {
    //   title: "Dispatch",
    //   dataIndex: "dispatch_number",
    //   key: "dispatch_number",
    //   width: 130,
    //   render: (v) => <span className="fw-bold">{v || "—"}</span>,
    // },
    {
      title: "Work Order",
      dataIndex: "wo_number",
      key: "wo_number",
      width: 160,
      render: (v) => <span className="fw-bold">{v || "—"}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
      width: 200,
      render: (v) => <span style={{ color: "#0f6fb4", fontWeight: 500 }}>{v || "—"}</span>,
    },
    {
      title: "Product",
      dataIndex: "product_name",
      key: "product_name",
      width: 200,
      render: (v) => <span style={{ color: "#0f6fb4", fontWeight: 500 }}>{v || "—"}</span>,
    },
    {
      title: "Planned Qty",
      dataIndex: "planned_qty",
      key: "planned_qty",
      width: 110,
      render: (v) => <span className="text-muted">{new Intl.NumberFormat("en-IN").format(Number(v) || 0)}</span>,
    },
    {
      title: "Final Qty",
      dataIndex: "final_qty",
      key: "final_qty",
      width: 110,
      render: (v) => <span className="fw-bold">{new Intl.NumberFormat("en-IN").format(Number(v) || 0)}</span>,
    },
    // {
    //   title: "Fulfill",
    //   dataIndex: "fulfill_percent",
    //   key: "fulfill_percent",
    //   width: 160,
    //   render: (value) => {
    //     const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
    //     const color = getProgressColor(pct);
    //     return (
    //       <div className="d-flex align-items-center gap-2">
    //         <Progress percent={pct} showInfo={false} strokeColor={color} trailColor="#e9ecef" style={{ width: 90 }} />
    //         <span className="small fw-semibold" style={{ color }}>{pct}%</span>
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Production Completion",
      dataIndex: "production_completed",
      key: "production_completed",
      width: 130,
      // render: (v) => v ? dayjs(v).format("YYYY-MM-DD") : "—",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      width: 130,
      render: (v) => v ? dayjs(v).format("DD/MM/YYYY") : "—",
    },
    {
      title: "Status",
      key: "dispatch_status",
      width: 170,
      render: (_, record) => renderStatusBadge(record.dispatch_status),
    },
    {
      title: "Action",
      key: "action",
      width: 110,
      align: "center",
      render: (_, record) => (
        <div className="d-flex justify-content-center gap-1">
          <Tooltip title="Dispatch">
            <Button
              type="text"
              icon={<i className="fas fa-truck" style={{ color: "#1d4ed8" }} />}
              onClick={() => openDispatchModal(record)}
              disabled={record.dispatch_status === 2}
            />
          </Tooltip>
          <Tooltip title="Dispatch History">
            <Button
              type="text"
              icon={<i className="fas fa-history" style={{ color: "#7c3aed" }} />}
              onClick={() => openHistoryModal(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── stat card ──────────────────────────────────────────────────
  const StatCard = ({ label, value, color }) => (
    <div
      className="card border-0 shadow-sm flex-fill"
      style={{ minWidth: 110, borderRadius: 10 }}
    >
      <div className="card-body p-3">
        <div className="text-muted mb-1" style={{ fontSize: 12 }}>{label}</div>
        <div className="fw-bold" style={{ fontSize: 20, color: color || "#1e293b" }}>
          {typeof value === "number" ? new Intl.NumberFormat("en-IN").format(value) : value}
        </div>
      </div>
    </div>
  );

  // ── render ─────────────────────────────────────────────────────
  return (
    <div className="p-4">
      {/* ── page header ── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Dispatch &amp; Delivery</h3>
          <p className="text-muted mb-0">
            {totalCount} total records — partial dispatch supported
          </p>
        </div>
        <Button type="primary" icon={<i className="fas fa-plus me-1" />} onClick={openAddModal}>
          Add Work Order
        </Button>
      </div>

      {/* ── date preset tabs ── */}
      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <i className="far fa-calendar-alt text-muted me-1"></i>
        {DATE_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => {
              setDatePreset(p.value);
              if (p.value !== "custom") setCustomRange([null, null]);
            }}
            style={{
              border: "none",
              borderRadius: 20,
              padding: "5px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: datePreset === p.value ? "#1e293b" : "#f1f5f9",
              color: datePreset === p.value ? "#fff" : "#64748b",
              transition: "all .15s",
            }}
          >
            {p.label}
          </button>
        ))}
        {datePreset === "custom" && (
          <RangePicker
            value={customRange}
            onChange={(dates) => setCustomRange(dates || [null, null])}
            format="DD/MM/YYYY"
            style={{ height: 34 }}
            allowClear
          />
        )}
      </div>

      {/* ── stats cards ── */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <StatCard label="Period" value={`${stats.total}`} color="#1e293b" />
        <div className="card border-0 shadow-sm flex-fill" style={{ minWidth: 110, borderRadius: 10 }}>
          <div className="card-body p-3">
            <div className="text-muted mb-1" style={{ fontSize: 12 }}>Period</div>
            <div className="fw-bold" style={{ fontSize: 20 }}>{stats.total}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>dispatches</div>
          </div>
        </div>
        <StatCard label="Pending"              value={stats.pending}       color="#1e293b" />
        <StatCard label="Partially Completed" value={stats.in_transit}    color="#2577ff" />
        <StatCard label="Fully Completed"     value={stats.completed}     color="#16a34a" />
        <StatCard label="Qty Out"       value={stats.qty_out}       color="#9333ea" />
        <StatCard label="Qty Delivered" value={stats.qty_delivered} color="#16a34a" />
        <StatCard label="Work Orders"   value={stats.work_orders}   color="#d97706" />
        {/* <StatCard label="Customers"     value={stats.customers}     color="#7c3aed" /> */}
      </div>

      {/* ── main card ── */}
      <div className="card">
        <div className="card-body p-0">

          {/* ── filter bar ── */}
          <div className="p-3 border-bottom d-flex flex-wrap align-items-center gap-2 justify-content-between">
            {/* status tabs */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <i className="fas fa-filter text-muted" style={{ fontSize: 13 }}></i>
              {[
                { value: "all",       label: "All" },
                { value: 0, label: "Pending" },
                { value: 1, label: "Partially Completed" },
                { value: 2, label: "Fully Completed" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatusFilter(s.value)}
                  style={{
                    border: statusFilter === s.value ? "2px solid #1e293b" : "1px solid #e2e8f0",
                    borderRadius: 20,
                    padding: "4px 14px",
                    fontSize: 13,
                    fontWeight: statusFilter === s.value ? 700 : 500,
                    cursor: "pointer",
                    background: statusFilter === s.value ? "#1e293b" : "#fff",
                    color: statusFilter === s.value ? "#fff" : "#64748b",
                    transition: "all .15s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* right-side controls */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div style={{ minWidth: 200 }}>
                <CustomerSelect
                  value={customerFilter}
                  onChange={(opt) => setCustomerFilter(opt || null)}
                  placeholder="All Customers"
                  isClearable
                />
              </div>
              <Select
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                ]}
                style={{ width: 120, height: 38 }}
              />
              {/* table / by-wo toggle */}
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${viewMode === "table" ? "btn-dark" : "btn-outline-secondary"}`}
                  onClick={() => setViewMode("table")}
                >
                  Table
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === "by_wo" ? "btn-dark" : "btn-outline-secondary"}`}
                  onClick={() => setViewMode("by_wo")}
                >
                  By WO
                </button>
              </div>
              {/* page size */}
              <Select
                value={pageState.take}
                onChange={(v) => setPageState({ skip: 0, take: v })}
                options={[10, 15, 25, 50].map((n) => ({ value: n, label: `${n}` }))}
                style={{ width: 80, height: 38 }}
              />
            </div>
          </div>

          {/* ── table ── */}
          <div className="bg_succes_table_head rounded_table">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={rows}
              loading={listLoading}
              pagination={{
                current: pageState.skip / pageState.take + 1,
                pageSize: pageState.take,
                total: totalCount,
                showSizeChanger: false,
              }}
              onChange={(pagination) => {
                setPageState({
                  skip: (pagination.current - 1) * pagination.pageSize,
                  take: pagination.pageSize,
                });
              }}
              scroll={{ x: 1300 }}
              locale={{ emptyText: "No dispatches found." }}
            />
          </div>
        </div>
      </div>

      {/* ── add dispatch modal ── */}
      <Modal
        title={<span className="fw-semibold">Add Dispatch</span>}
        open={addModalOpen}
        onCancel={closeAddModal}
        footer={[
          <Button key="cancel" onClick={closeAddModal} disabled={addSaving}>Cancel</Button>,
          <Button key="save" type="primary" loading={addSaving} onClick={handleAddDispatch}>
            Create Dispatch
          </Button>,
        ]}
        width={560}
      >
        <div className="row g-3 pt-2">
          <div className="col-12">
            <label className="form-label fw-semibold">
              Work Order <span className="text-danger">*</span>
            </label>
            <Select
              value={addForm.woId ?? undefined}
              onChange={(v) => setAddForm((p) => ({ ...p, woId: v }))}
              options={completedWOs}
              loading={loadingWOs}
              placeholder="Select completed work order"
              showSearch
              optionFilterProp="label"
              allowClear
              style={{ width: "100%", height: 42 }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Dispatch Qty <span className="text-danger">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={addForm.dispatchQty}
              onChange={(e) => setAddForm((p) => ({ ...p, dispatchQty: e.target.value }))}
              placeholder="Enter quantity"
              style={{ height: 42 }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Dispatch Date <span className="text-danger">*</span>
            </label>
            <DatePicker
              value={addForm.dispatchDate}
              onChange={(d) => setAddForm((p) => ({ ...p, dispatchDate: d }))}
              format="DD/MM/YYYY"
              placeholder="dd/mm/yyyy"
              style={{ width: "100%", height: 42 }}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Notes</label>
            <Input.TextArea
              value={addForm.notes}
              onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Optional remarks"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* ── dispatch work order modal ── */}
      <Modal
        title={<span className="fw-semibold">Dispatch Work Order</span>}
        open={dispatchModalOpen}
        onCancel={closeDispatchModal}
        footer={[
          <Button key="cancel" onClick={closeDispatchModal} disabled={dispatchSaving}>Cancel</Button>,
          <Button key="submit" type="primary" loading={dispatchSaving} onClick={handleDispatchSubmit}>
            Submit
          </Button>,
        ]}
        width={480}
      >
        {dispatchRecord && (
          <div className="pt-2">
            <div className="mb-3 p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted" style={{ fontSize: 13 }}>Work Order</span>
                <span className="fw-semibold">{dispatchRecord.wo_number || "—"}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted" style={{ fontSize: 13 }}>Store</span>
                <span className="fw-semibold">{dispatchRecord.warehouse?.name || "—"}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted" style={{ fontSize: 13 }}>Final Qty</span>
                <span className="fw-bold">{new Intl.NumberFormat("en-IN").format(Number(dispatchRecord.final_qty) || 0)}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Dispatch Qty <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={dispatchForm.dispatchQty}
                onChange={(e) => setDispatchForm((prev) => ({ ...prev, dispatchQty: e.target.value }))}
                placeholder="Enter dispatch quantity"
                style={{ height: 42 }}
              />
              {(() => {
                const finalQty = Number(dispatchRecord?.final_qty) || 0;
                const alreadyDispatched = Number(dispatchRecord?.total_dispatched_qty) || 0;
                const entering = Number(dispatchForm.dispatchQty) || 0;
                const remaining = Math.max(finalQty - alreadyDispatched - entering, 0);
                return (
                  <div className="d-flex justify-content-between mt-1" style={{ fontSize: 12 }}>
                    <span className="text-muted">
                      Already dispatched: <strong>{new Intl.NumberFormat("en-IN").format(alreadyDispatched)}</strong>
                    </span>
                    <span style={{ color: remaining === 0 && entering > 0 ? "#15803d" : "#b45309", fontWeight: 600 }}>
                      Remaining: {new Intl.NumberFormat("en-IN").format(remaining)}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">
                Dispatch Type <span className="text-danger">*</span>
              </label>
              <div className="d-flex gap-3">
                <label
                  className="d-flex align-items-center gap-2 px-3 py-2 rounded"
                  style={{
                    cursor: "pointer",
                    border: dispatchForm.dispatchType === 1 ? "2px solid #b45309" : "1px solid #e2e8f0",
                    background: dispatchForm.dispatchType === 1 ? "#fffbeb" : "#fff",
                    flex: 1,
                  }}
                >
                  <input
                    type="radio"
                    name="dispatchType"
                    checked={dispatchForm.dispatchType === 1}
                    onChange={() => setDispatchForm((prev) => ({ ...prev, dispatchType: 1 }))}
                  />
                  <span className="fw-semibold" style={{ fontSize: 13 }}>Partial Dispatch</span>
                </label>
                <label
                  className="d-flex align-items-center gap-2 px-3 py-2 rounded"
                  style={{
                    cursor: "pointer",
                    border: dispatchForm.dispatchType === 2 ? "2px solid #15803d" : "1px solid #e2e8f0",
                    background: dispatchForm.dispatchType === 2 ? "#f0fdf4" : "#fff",
                    flex: 1,
                  }}
                >
                  <input
                    type="radio"
                    name="dispatchType"
                    checked={dispatchForm.dispatchType === 2}
                    onChange={() => setDispatchForm((prev) => ({ ...prev, dispatchType: 2 }))}
                  />
                  <span className="fw-semibold" style={{ fontSize: 13 }}>Fully Dispatch</span>
                </label>
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Dispatch Note</label>
              <Input.TextArea
                value={dispatchForm.notes}
                onChange={(e) => setDispatchForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional remarks"
                rows={3}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── dispatch history modal ── */}
      <Modal
        title={
          <span className="fw-semibold">
            Dispatch History {historyRecord?.wo_number ? `— ${historyRecord.wo_number}` : ""}
          </span>
        }
        open={historyModalOpen}
        onCancel={closeHistoryModal}
        footer={[
          <Button key="close" onClick={closeHistoryModal}>Close</Button>,
        ]}
        width={620}
      >
        {historyLoading ? (
          <div className="text-center py-4 text-muted">
            <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
            <p className="mb-0">Loading dispatch history...</p>
          </div>
        ) : historyLogs.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="fas fa-inbox fa-2x mb-2"></i>
            <p className="mb-0">No dispatch records found.</p>
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={historyLogs}
            pagination={false}
            size="small"
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
                width: 80,
                render: (v) => <span className="fw-bold">{new Intl.NumberFormat("en-IN").format(Number(v) || 0)}</span>,
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
                width: 120,
                render: (_, record) => record.dispatchedBy?.name || "—",
              },
              {
                title: "Date",
                dataIndex: "dispacthed_at",
                key: "dispacthed_at",
                width: 140,
                render: (v) => v ? dayjs(v).format("DD/MM/YYYY hh:mm A") : "—",
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}

export default ProductionDispatch;
