import React, { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Input, Modal, Progress, Select, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import CustomerSelect from "../../filterComponents/CustomerSelect";
import ProductSelect from "../../filterComponents/ProductSelect";
import DeleteModal from "../../CommonComponent/DeleteModal";
import { UserAuth } from "../../auth/Auth";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";

function WorkOrders() {
  const { user, isVariantBased } = UserAuth();
  const companyId = user?.company_id ?? user?.company?.id ?? null;

  const [rows, setRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({ skip: 0, take: 15 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    orderId: "",
    customer: null,
    finishedGoodId: null,
    finishedGoodData: null,
    productionStepId: null,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [flowSteps, setFlowSteps] = useState([]);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [finishedGoodVariants, setFinishedGoodVariants] = useState([]);
  const [loadingFinishedGoodVariants, setLoadingFinishedGoodVariants] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteWorkOrder, setDeleteWorkOrder] = useState(null);
  const [deletingWorkOrder, setDeletingWorkOrder] = useState(false);
  const [materialIssueOpen, setMaterialIssueOpen] = useState(false);
  const [materialIssueLoading, setMaterialIssueLoading] = useState(false);
  const [materialIssueRows, setMaterialIssueRows] = useState([]);
  const [materialIssueWorkOrder, setMaterialIssueWorkOrder] = useState(null);
  const [editingMaterialIssueRowId, setEditingMaterialIssueRowId] = useState(null);
  const [materialIssueDraftQty, setMaterialIssueDraftQty] = useState("");
  const [materialIssueSubmittingId, setMaterialIssueSubmittingId] = useState(null);
  const [materialIssueCompleting, setMaterialIssueCompleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [formData, setFormData] = useState({
    customer: null,
    finishedGoodId: null,
    finishedGoodData: null,
    finishedGoodVariantId: null,
    quantity: "",
    workOrderStepIds: [],
    dueDate: null,
  });

  const selectedWorkOrderSteps = useMemo(() => {
    const flowMap = new Map(
      flowSteps.map((f) => [String(f.step_id), f?.step?.name || `Step ${f.step_id}`])
    );
    return (formData.workOrderStepIds || []).map((id) => ({
      id,
      name: flowMap.get(String(id)) || `Step ${id}`,
    }));
  }, [flowSteps, formData.workOrderStepIds]);

  const productionStepFilterOptions = useMemo(
    () =>
      flowSteps.map((item) => ({
        value: item?.step_id,
        label: item?.step?.name || `Step ${item?.step_id}`,
      })),
    [flowSteps]
  );

  const fetchCompanyFlow = async () => {
    if (!companyId) return;
    setLoadingFlow(true);
    try {
      const res = await PrivateAxios.get(`/company/get-company-production-flow/${companyId}`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const ordered = data.slice().sort((a, b) => Number(a.sequence) - Number(b.sequence));
      setFlowSteps(ordered);
    } catch (error) {
      setFlowSteps([]);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch company production flow.");
    } finally {
      setLoadingFlow(false);
    }
  };

  useEffect(() => {
    fetchCompanyFlow();
  }, [companyId]);

  const fetchFinishedGoodVariants = async (productId) => {
    if (!productId || !isVariantBased) {
      setFinishedGoodVariants([]);
      return;
    }
    setLoadingFinishedGoodVariants(true);
    try {
      const res = await PrivateAxios.get(`/product/variants/${productId}`);
      const variants = Array.isArray(res.data?.data?.variants) ? res.data.data.variants : [];
      const options = variants.map((v) => {
        const uomLabel = v?.masterUOM?.label || v?.masterUOM?.name || "";
        const label = `${v?.weight_per_unit ?? ""} ${uomLabel}`.trim();
        return {
          value: v.id,
          label: label || `Variant #${v.id}`,
        };
      });
      setFinishedGoodVariants(options);
    } catch (error) {
      setFinishedGoodVariants([]);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch finished good variants.");
    } finally {
      setLoadingFinishedGoodVariants(false);
    }
  };

  const formatQuantity = (value, unit = "") => {
    const num = Number(value);
    const formatted = Number.isFinite(num) ? Number(num.toFixed(3)).toString() : "0";
    return `${formatted} ${unit}`.trim();
  };

  const mapWorkOrderRows = (list = []) =>
    (Array.isArray(list) ? list : []).map((item) => {
      const finishedGoodName =
        item?.finishedGood?.product_name ||
        item?.product?.product_name ||
        item?.finished_good_name ||
        "N/A";
      const finishedGoodCode =
        item?.finishedGood?.product_code ||
        item?.product?.product_code ||
        item?.finished_good_code ||
        "";

      return {
        id: item?.id,
        orderId: item?.wo_number ?? "N/A",
        createdAt: item?.created_at ? dayjs(item.created_at).format("DD/MM/YYYY") : "N/A",
        customer:
          item?.customer?.name ||
          item?.customer_name ||
          item?.customer?.label ||
          "N/A",
        finishedGood: `${finishedGoodName}${finishedGoodCode ? ` (${finishedGoodCode})` : ""}`,
        finishedGoodVariant: item?.finalProductVariant?.weight_per_unit ? `${item?.finalProductVariant?.weight_per_unit} ${item?.finalProductVariant?.masterUOM.label}` : "",
        qty: Number(item?.planned_qty) || 0,
        status: Number(item?.status) || 0,
        statusLabel:
          item?.productionStep?.name ||
          "Pending",
        workOrderStatus: item?.status === 1 ? "Pending Material Issue" : item?.status === 2 ? "In-progress" : item?.status === 3 ? "Material Issued" : item?.status === 4 ? "Completed" : "Cancelled",
        progress: Number(item?.progress_percentage) || 0,
        processFlow: Array.isArray(item?.workOrderSteps)
          ? item.workOrderSteps.map((p) => p?.step?.name || p).filter(Boolean)
          : [],
        materialProgress: Number(item?.material_progress_percentage) || 0,
        dueDate: item?.due_date ? dayjs(item.due_date).format("DD/MM/YYYY") : "N/A",
        materialIssuedBy: item?.materialIssuedBy?.name || "N/A",
        materialIssuedAt: item?.material_issued_at
          ? dayjs(item.material_issued_at).format("DD/MM/YYYY")
          : "N/A",
      };
    });

  const fetchWorkOrders = async (customPageState = null, customFilters = null) => {
    const currentPageState = customPageState || pageState;
    const currentFilters = customFilters || filters;
    setListLoading(true);
    try {
      const page = currentPageState.skip / currentPageState.take + 1;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(currentPageState.take),
        status: 'active',
        ...(String(currentFilters.orderId || "").trim() && { wo_number: String(currentFilters.orderId).trim() }),
        ...(currentFilters.customer?.id || currentFilters.customer?.value
          ? { customer_id: String(currentFilters.customer?.id ?? currentFilters.customer?.value) }
          : {}),
        ...(currentFilters.finishedGoodId
          ? { product_id: String(currentFilters.finishedGoodId) }
          : {}),
        ...(currentFilters.productionStepId
          ? { production_step_id: String(currentFilters.productionStepId) }
          : {}),
      }).toString();
      const res = await PrivateAxios.get(`/production/work-order/list?${query}`);
      const payload = res.data?.data ?? res.data ?? {};
      const list = Array.isArray(payload?.rows)
        ? payload.rows
        : Array.isArray(payload)
          ? payload
          : [];
      const pagination = payload?.pagination || {};
      setRows(mapWorkOrderRows(list));
      setTotalCount(Number(pagination?.total_records) || list.length || 0);
    } catch (error) {
      setRows([]);
      setTotalCount(0);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch work orders.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders(pageState, filters);
  }, [pageState.skip, pageState.take]);

  const openAddModal = () => {
    setFormData({
      customer: null,
      finishedGoodId: null,
      finishedGoodData: null,
      finishedGoodVariantId: null,
      quantity: "",
      workOrderStepIds: flowSteps.map((item) => item.step_id),
      dueDate: null,
    });
    setFinishedGoodVariants([]);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleStepToggle = (stepId) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.workOrderStepIds) ? prev.workOrderStepIds : [];
      const exists = current.some((id) => String(id) === String(stepId));
      const nextIds = exists
        ? current.filter((id) => String(id) !== String(stepId))
        : [...current, stepId];

      return {
        ...prev,
        workOrderStepIds: nextIds,
      };
    });
  };

  const handleSave = async () => {
    if (!formData.customer) {
      ErrorMessage("Customer is required.");
      return;
    }
    if (!formData.finishedGoodId) {
      ErrorMessage("Finished Good is required.");
      return;
    }
    if (isVariantBased && !formData.finishedGoodVariantId) {
      ErrorMessage("Finished Good Variant is required.");
      return;
    }
    const qty = Number(formData.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      ErrorMessage("Quantity must be a positive number.");
      return;
    }
    if (!formData.workOrderStepIds || formData.workOrderStepIds.length === 0) {
      ErrorMessage("Please select work order steps in sequence.");
      return;
    }
    if (!formData.dueDate) {
      ErrorMessage("Due Date is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customer_id: formData.customer?.id ?? formData.customer?.value,
        product_id: formData.finishedGoodId,
        final_product_variant_id: isVariantBased ? formData.finishedGoodVariantId : null,
        planned_qty: qty,
        due_date: dayjs(formData.dueDate).format("YYYY-MM-DD"),
        production_step_id: formData.workOrderStepIds[0],
        work_order_steps: formData.workOrderStepIds.map((id, index) => ({
          step_id: id,
          sequence: index + 1,
        })),
      };

      const res = await PrivateAxios.post("/production/work-order/create", payload);
      SuccessMessage(res?.data?.message || "Work order created successfully.");
      const resetPageState = { skip: 0, take: pageState.take || 15 };
      setPageState(resetPageState);
      fetchWorkOrders(resetPageState);
      closeAddModal();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to create work order.");
    } finally {
      setSaving(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    setPageState({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  };

  const handleFilterSearch = () => {
    const nextPageState = { skip: 0, take: pageState.take };
    setPageState(nextPageState);
    if (pageState.skip === 0) {
      fetchWorkOrders(nextPageState, filters);
    }
  };

  const handleFilterReset = () => {
    const resetFilters = {
      orderId: "",
      customer: null,
      finishedGoodId: null,
      finishedGoodData: null,
      productionStepId: null,
    };
    const nextPageState = { skip: 0, take: 15 };
    setFilters(resetFilters);
    setPageState(nextPageState);
    if (pageState.skip === 0 && pageState.take === 15) {
      fetchWorkOrders(nextPageState, resetFilters);
    }
  };

  const closeMaterialIssueModal = () => {
    setMaterialIssueOpen(false);
    setMaterialIssueRows([]);
    setMaterialIssueWorkOrder(null);
    setEditingMaterialIssueRowId(null);
    setMaterialIssueDraftQty("");
    setMaterialIssueSubmittingId(null);
  };

  const openMaterialIssueModal = async (record) => {
    if (!record?.id) return;
    setMaterialIssueOpen(true);
    setMaterialIssueLoading(true);
    setMaterialIssueWorkOrder(record);

    try {
      const res = await PrivateAxios.get(`/production/work-order/bom-list/${record.id}`);
      const payload = res?.data?.data || {};
      const workOrder = payload?.workOrder || {};
      const plannedQty = Number(workOrder?.planned_qty) || 0;
      const rows = (Array.isArray(payload?.materialList) ? payload.materialList : []).map((item) => {
        const variant = item?.rawMaterialProductVariant || {};
        const unitLabel = variant?.masterUOM?.label || "";
        const stockEntries = Array.isArray(variant?.productStockEntries)
          ? variant.productStockEntries
          : [];
        const stockQty = stockEntries.reduce(
          (sum, entry) => sum + (Number(entry?.quantity) || 0),
          0
        );

        const requiredQty = plannedQty * (Number(item?.quantity) || 0);
        const materialIssues = Array.isArray(workOrder?.workOrderMaterialIssues)
          ? workOrder.workOrderMaterialIssues
          : [];
        const issuedQty = materialIssues.reduce((sum, issue) => {
          if (issue?.rm_product_variant_id !== item?.raw_material_variant_id) {
            return sum;
          }
          return sum + (Number(issue?.issued_qty) || 0);
        }, 0);
        const pendingQty = Math.max(requiredQty - issuedQty, 0);
        
        return {
          id: item?.id,
          woId: workOrder?.id || record?.id,
          rmProductId: item?.raw_material_product_id,
          rmProductVariantId: item?.raw_material_variant_id,
          unitLabel,
          requiredQty,
          disabledIssue: parseInt(workOrder?.status) === 1 ? true : false,
          issuedQty,
          pendingQty,
          material: item?.rawMaterialProduct?.product_name || "N/A",
          code: item?.rawMaterialProduct?.product_code || "N/A",
          required: formatQuantity(requiredQty, unitLabel),
          issued: formatQuantity(issuedQty, unitLabel),
          pending: formatQuantity(pendingQty, unitLabel),
          stock: formatQuantity(stockQty, unitLabel),
          status: parseInt(workOrder?.status),
        };
      });

      setMaterialIssueRows(rows);
      setMaterialIssueWorkOrder((prev) => ({
        ...(prev || record),
        orderId: record?.orderId || prev?.orderId,
        workOrderStatus: parseInt(workOrder?.status),
      }));

    } catch (error) {
      setMaterialIssueRows([]);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch BOM list.");
    } finally {
      setMaterialIssueLoading(false);
    }
  };

  const startMaterialIssueEdit = (row) => {
    setEditingMaterialIssueRowId(row?.id ?? null);
    const existingIssuedQty = Number(row?.issuedQty);
    setMaterialIssueDraftQty(
      Number.isFinite(existingIssuedQty) && existingIssuedQty > 0
        ? String(existingIssuedQty)
        : ""
    );
  };

  const cancelMaterialIssueEdit = () => {
    setEditingMaterialIssueRowId(null);
    setMaterialIssueDraftQty("");
  };

  const submitMaterialIssue = async (row) => {
    const issuedQty = Number(materialIssueDraftQty);
    if (!Number.isFinite(issuedQty) || issuedQty <= 0) {
      ErrorMessage("Issued quantity must be a positive number.");
      return;
    }

    const payload = {
      wo_id: row?.woId,
      rm_product_id: row?.rmProductId,
      rm_product_variant_id: row?.rmProductVariantId,
      issued_qty: issuedQty,
    };

    setMaterialIssueSubmittingId(row?.id);
    try {
      const res = await PrivateAxios.post("/production/work-order/material-issue", payload);
      SuccessMessage(res?.data?.message || "Material issued successfully.");
      setMaterialIssueRows((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(row.id)) return item;
          // const nextIssuedQty = (Number(item.issuedQty) || 0) + issuedQty;
          // const nextPendingQty = Math.max((Number(item.requiredQty) || 0) - nextIssuedQty, 0);
          const nextPendingQty = Math.max((Number(item.requiredQty) || 0) - issuedQty, 0);
          return {
            ...item,
            issuedQty: issuedQty,
            pendingQty: nextPendingQty,
            issued: formatQuantity(issuedQty, item.unitLabel),
            pending: formatQuantity(nextPendingQty, item.unitLabel),
          };
        })
      );
      cancelMaterialIssueEdit();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to issue material.");
    } finally {
      setMaterialIssueSubmittingId(null);
    }
  };

  const completeMaterialIssue = async () => {
    const woId = materialIssueWorkOrder?.id;
    if (!woId) {
      ErrorMessage("Work order id is missing.");
      return;
    }

    setMaterialIssueCompleting(true);
    try {
      const res = await PrivateAxios.post("/production/work-order/material-issue-complete", {
        wo_id: woId,
      });
      SuccessMessage(res?.data?.message || "Material issue completed successfully.");
      closeMaterialIssueModal();
      fetchWorkOrders(pageState, filters);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to complete material issue.");
    } finally {
      setMaterialIssueCompleting(false);
    }
  };

  const openDeleteModal = (record) => {
    setDeleteWorkOrder(record || null);
    setDeleteModalShow(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalShow(false);
    setDeleteWorkOrder(null);
  };

  const handleDeleteWorkOrder = async () => {
    const id = deleteWorkOrder?.id;
    if (!id) return;
    setDeletingWorkOrder(true);
    try {
      const res = await PrivateAxios.delete(`/production/work-order/delete/${id}`);
      SuccessMessage(res?.data?.message || "Work order deleted successfully.");
      closeDeleteModal();
      fetchWorkOrders(pageState, filters);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to delete work order.");
    } finally {
      setDeletingWorkOrder(false);
    }
  };

  const renderStatus = (status) => {
    const key = String(status || "").toLowerCase().trim();
    const statusStyles = {
      pending: "badge-outline-warning",
      printing: "badge-outline-accent",
      lamination: "badge-outline-active",
      cutting: "badge-outline-quotation",
      packing: "badge-outline-green",
      "quality testing": "badge-outline-meantGreen",
      "in production": "badge-outline-yellowGreen",
      completed: "badge-outline-success",
      cancelled: "badge-outline-danger",
      canceled: "badge-outline-danger",
    };
    const badgeClass = statusStyles[key] || "badge-outline-accent";

    return (
      <label className={`badge ${badgeClass} mb-0`}>
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>
        {status}
      </label>
    );
  };

  const columns = [
    { title: "Order ID", dataIndex: "orderId", key: "orderId", width: 150 },
    { title: "Customer", dataIndex: "customer", key: "customer", width: 190 },
    { 
      title: "Finished Good", 
      dataIndex: "finishedGood", 
      key: "finishedGood", 
      width: 250,
      render: (text, record) => (
        <div>
          {text}
          {record.finishedGoodVariant && <span className="text-muted"> ({record.finishedGoodVariant})</span>}
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 110,
      render: (v) => new Intl.NumberFormat("en-IN").format(Number(v) || 0),
    },
    {
      title: "Current Step",
      dataIndex: "statusLabel",
      key: "statusLabel",
      width: 120,
      render: renderStatus,
    },
    {
      title: "Status",
      dataIndex: "workOrderStatus",
      key: "workOrderStatus",
      width: 200,
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      width: 150,
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <Progress percent={Number(value) || 0} showInfo={false} style={{ width: 80 }} />
          <span className="small text-muted">{Number(value) || 0}%</span>
        </div>
      ),
    },
    {
      title: "Process Flow",
      dataIndex: "processFlow",
      key: "processFlow",
      width: 320,
      render: (flow = []) => (
        <div className="d-flex align-items-center flex-wrap gap-1">
          {flow.map((name, idx) => (
            <React.Fragment key={`${name}-${idx}`}>
              <span
                className="badge"
                style={{
                  background: "#dbeafe",
                  color: "#0f3d91",
                  fontWeight: 600,
                  borderRadius: 14,
                  padding: "5px 10px",
                }}
              >
                {name}
              </span>
              {idx < flow.length - 1 && (
                <i className="fas fa-arrow-right text-muted mx-1" aria-hidden="true"></i>
              )}
            </React.Fragment>
          ))}
        </div>
      ),
    },
    {
      title: "Material",
      dataIndex: "materialProgress",
      key: "materialProgress",
      width: 120,
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <Progress percent={Number(value) || 0} showInfo={false} style={{ width: 70 }} />
          <span className="small text-muted">{Number(value) || 0}%</span>
        </div>
      ),
    },
    { title: "Created Date", dataIndex: "createdAt", key: "createdAt", width: 150 },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate", width: 120 },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div className="d-flex gap-2">
          <Tooltip title="Material Issue">
            <i
              className="fas fa-box-open text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => openMaterialIssueModal(record)}
            ></i>
          </Tooltip>
          <Tooltip title="Edit">
            <i className="far fa-edit text-success" style={{ cursor: "pointer" }}></i>
          </Tooltip>
          <Tooltip title="Delete">
            <span
              role="button"
              tabIndex={0}
              onClick={() => openDeleteModal(record)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openDeleteModal(record);
                }
              }}
              className="text-danger"
              style={{ cursor: "pointer", lineHeight: 1 }}
            >
              <i className="far fa-trash-alt"></i>
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Work Orders</h3>
          <p className="text-muted mb-0">Production work order management with material tracking</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus me-2"></i>
          Add Work Order
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
            <h6 className="mb-0">Work Orders <small className="text-muted fw-normal ms-2">{totalCount} items</small></h6>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <i className="fas fa-filter me-1"></i>
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
              <div className="btn-group btn-group-sm" role="group" aria-label="View toggle">
                <button
                  type="button"
                  className={`btn ${viewMode === "list" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setViewMode("list")}
                  title="List view"
                >
                  <i className="fas fa-list"></i>
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                >
                  <i className="fas fa-th-large"></i>
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="p-3 border-bottom">
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label mb-1">Order ID</label>
                  <Input
                    value={filters.orderId}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, orderId: e.target.value }))
                    }
                    placeholder="Enter Order ID"
                    style={{ height: "38px" }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label mb-1">Customer</label>
                  <CustomerSelect
                    value={filters.customer}
                    onChange={(option) =>
                      setFilters((prev) => ({ ...prev, customer: option || null }))
                    }
                    placeholder="Search and select customer..."
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label mb-1">Finished Good</label>
                  <ProductSelect
                    value={filters.finishedGoodId}
                    selectedProductData={filters.finishedGoodData}
                    onChange={(option) =>
                      setFilters((prev) => ({
                        ...prev,
                        finishedGoodId: option ? option.value : null,
                        finishedGoodData: option?.productData || null,
                      }))
                    }
                    placeholder="Search and select finished good..."
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label mb-1">Production Step</label>
                  <Select
                    value={filters.productionStepId}
                    onChange={(value) =>
                      setFilters((prev) => ({ ...prev, productionStepId: value ?? null }))
                    }
                    options={productionStepFilterOptions}
                    placeholder="Select step"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    loading={loadingFlow}
                    style={{ width: "100%", height: "38px" }}
                  />
                </div>
                <div className="col-12">
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ height: "38px" }}
                      onClick={handleFilterSearch}
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      style={{ height: "38px" }}
                      onClick={handleFilterReset}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {viewMode === "list" ? (
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
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "15", "25", "50"],
                  onChange: handlePageChange,
                  onShowSizeChange: handlePageChange,
                }}
                scroll={{ x: 1600 }}
              />
            </div>
          ) : (
            <div className="p-3">
              {listLoading ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                  <p className="mb-0">Loading work orders…</p>
                </div>
              ) : rows.length === 0 ? (
                <div className="text-center py-5 text-muted">No work orders found.</div>
              ) : (
                <>
                  <div className="row g-3">
                    {rows.map((record) => (
                      <div key={record.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                        <div
                          className="card h-100 border"
                          style={{ borderRadius: 12, transition: "box-shadow .15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.10)")}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                        >
                          <div className="card-body p-3">
                            {/* header row */}
                            <div className="d-flex align-items-start justify-content-between mb-2">
                              <div>
                                <span className="fw-bold text-dark" style={{ fontSize: 14 }}>
                                  {record.orderId}
                                </span>
                                <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                                  {record.createdAt}
                                </div>
                              </div>
                              {renderStatus(record.statusLabel)}
                            </div>

                            {/* product */}
                            <div
                              className="fw-semibold text-truncate mb-1"
                              style={{ fontSize: 13 }}
                              title={record.finishedGood}
                            >
                              {record.finishedGood}
                            </div>
                            {record.finishedGoodVariant && (
                              <div className="text-muted mb-1" style={{ fontSize: 12 }}>
                                {record.finishedGoodVariant}
                              </div>
                            )}

                            {/* customer */}
                            <div className="text-muted mb-2" style={{ fontSize: 12 }}>
                              <i className="far fa-user me-1"></i>{record.customer}
                            </div>

                            {/* progress */}
                            <div className="mb-2">
                              <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                                <span className="text-muted">Progress</span>
                                <span className="fw-semibold">{Number(record.progress) || 0}%</span>
                              </div>
                              <Progress
                                percent={Number(record.progress) || 0}
                                showInfo={false}
                                strokeColor="#2577ff"
                                trailColor="#e8edf5"
                                size="small"
                              />
                            </div>

                            {/* meta row */}
                            <div className="d-flex justify-content-between align-items-center" style={{ fontSize: 12 }}>
                              <span className="text-muted">
                                <i className="far fa-calendar-alt me-1"></i>Due: {record.dueDate}
                              </span>
                              <span className="text-muted">
                                Qty: <strong>{new Intl.NumberFormat("en-IN").format(Number(record.qty) || 0)}</strong>
                              </span>
                            </div>
                          </div>

                          {/* card footer – actions */}
                          <div className="px-3 pb-3 pt-1 d-flex justify-content-end gap-2">
                            <Tooltip title="View">
                              <button
                                type="button"
                                className="border-0"
                                onClick={() => openMaterialIssueModal(record)}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  background: "#eef4ff",
                                  color: "#2577ff",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <i className="far fa-eye" style={{ fontSize: 14 }}></i>
                              </button>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <button
                                type="button"
                                className="border-0"
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  background: "#edf9f1",
                                  color: "#16a34a",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <i className="far fa-edit" style={{ fontSize: 14 }}></i>
                              </button>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <button
                                type="button"
                                className="border-0"
                                onClick={() => openDeleteModal(record)}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  background: "#fff1f2",
                                  color: "#ef4444",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <i className="far fa-trash-alt" style={{ fontSize: 14 }}></i>
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* grid pagination */}
                  <div className="d-flex justify-content-end mt-3">
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${pageState.skip === 0 ? "disabled" : ""}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(Math.max(1, pageState.skip / pageState.take), pageState.take)}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                        <li className="page-item disabled">
                          <span className="page-link">
                            Page {pageState.skip / pageState.take + 1} of {Math.max(1, Math.ceil(totalCount / pageState.take))}
                          </span>
                        </li>
                        <li className={`page-item ${pageState.skip + pageState.take >= totalCount ? "disabled" : ""}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pageState.skip / pageState.take + 2, pageState.take)}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={<span className="fw-semibold">Add Work Order</span>}
        open={isAddModalOpen}
        onCancel={closeAddModal}
        footer={[
          <Button key="cancel" onClick={closeAddModal}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleSave}>
            Save
          </Button>,
        ]}
        width={980}
      >
        <div className="row g-3 pt-2">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Customer <span className="text-danger">*</span></label>
            <CustomerSelect
              value={formData.customer}
              onChange={(option) => setFormData((prev) => ({ ...prev, customer: option || null }))}
              placeholder="Select Customer"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Finished Good <span className="text-danger">*</span></label>
            <ProductSelect
              value={formData.finishedGoodId}
              selectedProductData={formData.finishedGoodData}
              onChange={(option) => {
                const nextProductId = option ? option.value : null;
                setFormData((prev) => ({
                  ...prev,
                  finishedGoodId: nextProductId,
                  finishedGoodData: option?.productData || null,
                  finishedGoodVariantId: null,
                }));
                setFinishedGoodVariants([]);
                if (nextProductId) {
                  fetchFinishedGoodVariants(nextProductId);
                }
              }}
              placeholder="Select Finished Good"
            />
          </div>
          {isVariantBased && (
            <div className="col-md-6">
              <label className="form-label fw-semibold">Finished Good Variant <span className="text-danger">*</span></label>
              <Select
                value={formData.finishedGoodVariantId}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, finishedGoodVariantId: value }))
                }
                options={finishedGoodVariants}
                placeholder={formData.finishedGoodId ? "Select Finished Good Variant" : "Select Finished Good first"}
                loading={loadingFinishedGoodVariants}
                disabled={!formData.finishedGoodId}
                allowClear
                showSearch
                optionFilterProp="label"
                size="large"
                style={{ width: "100%" }}
              />
            </div>
          )}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Quantity <span className="text-danger">*</span></label>
            <Input
              type="number"
              min={0}
              value={formData.quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="Enter quantity"
              style={{ height: "42px" }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Due Date <span className="text-danger">*</span></label>
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))}
              format="DD/MM/YYYY"
              placeholder="dd/mm/yyyy"
              style={{ width: "100%", height: "42px" }}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Work Order Steps (in sequence) <span className="text-danger">*</span></label>
            <div className="row g-2">
              {flowSteps.map((flowItem) => {
                const stepId = flowItem.step_id;
                const stepName = flowItem?.step?.name || `Step ${stepId}`;
                const selectedIndex = (formData.workOrderStepIds || []).findIndex(
                  (id) => String(id) === String(stepId)
                );
                const isSelected = selectedIndex >= 0;
                return (
                  <div className="col-12 col-md-4" key={flowItem.id || stepId}>
                    <button
                      type="button"
                      className="w-100 text-start"
                      onClick={() => handleStepToggle(stepId)}
                      style={{
                        border: isSelected ? "2px solid #2577ff" : "1px solid #d9dee7",
                        background: isSelected ? "#eef4ff" : "#f8f9fb",
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <span
                        className="d-inline-flex align-items-center justify-content-center me-2"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "999px",
                          background: isSelected ? "#2f76e9" : "#eceff4",
                          color: isSelected ? "#fff" : "#7f8a9a",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {isSelected ? selectedIndex + 1 : "—"}
                      </span>
                      <span className="fw-semibold">{stepName}</span>
                    </button>
                  </div>
                );
              })}
            </div>
            {selectedWorkOrderSteps.length > 0 && (
              <div className="mt-2 small text-muted">
                Sequence:{" "}
                {selectedWorkOrderSteps.map((s, idx) => `${idx + 1}. ${s.name}`).join(" > ")}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <div>
            <div className="fw-semibold">Material Issue (BOM)</div>
            <div className="small text-primary">
              {materialIssueWorkOrder?.orderId
                ? `Work Order: ${materialIssueWorkOrder.orderId}`
                : "Work order BOM details"}
            </div>
            <div className="small text-primary">
              Issued By: {materialIssueWorkOrder?.materialIssuedBy || "N/A"}{" "}
              {`|`} Issued Date: {materialIssueWorkOrder?.materialIssuedAt || "N/A"}
            </div>
          </div>
        }
        open={materialIssueOpen}
        onCancel={closeMaterialIssueModal}
        footer={[
          <Button
            key="complete"
            type="primary"
            onClick={completeMaterialIssue}
            loading={materialIssueCompleting}
            disabled={
              !materialIssueWorkOrder?.id ||
              materialIssueLoading ||
              materialIssueSubmittingId !== null ||
              String(materialIssueWorkOrder?.status) === "3"
            }
          >
            Complete Material Issue
          </Button>,
          <Button key="close" onClick={closeMaterialIssueModal}>
            Close
          </Button>,
        ]}
        width={1080}
      >
        <div className="bg_succes_table_head rounded_table">
          <Table
            rowKey="id"
            loading={materialIssueLoading}
            dataSource={materialIssueRows}
            pagination={false}
            locale={{ emptyText: "No raw materials found." }}
            columns={[
              {
                title: "Raw Material",
                dataIndex: "material",
                key: "material",
                width: 200,
                render: (value) => <span className="fw-semibold">{value}</span>,
              },
              {
                title: "Product Code",
                dataIndex: "code",
                key: "code",
                width: 140,
              },
              {
                title: "Required",
                dataIndex: "required",
                key: "required",
                width: 130,
              },
              {
                title: "Issued",
                dataIndex: "issued",
                key: "issued",
                width: 180,
                render: (value, record) =>
                  editingMaterialIssueRowId === record.id ? (
                    <div className="d-flex align-items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={materialIssueDraftQty}
                        onChange={(e) => setMaterialIssueDraftQty(e.target.value)}
                        placeholder="Qty"
                        style={{ width: 90, height: "34px" }}
                      />
                      <span className="text-success fw-semibold">{record.unitLabel || ""}</span>
                    </div>
                  ) : (
                    <span className="text-success fw-semibold">{value}</span>
                  ),
              },
              {
                title: "Pending",
                dataIndex: "pending",
                key: "pending",
                width: 130,
                render: (value) => <span className="text-warning fw-semibold">{value}</span>,
              },
              {
                title: "Stock",
                dataIndex: "stock",
                key: "stock",
                width: 130,
              },
              ...(parseInt(materialIssueWorkOrder?.workOrderStatus) === 3
                ? []
                : [
                    {
                      title: "Action",
                      key: "action",
                      width: 180,
                      render: (_, record) =>
                        editingMaterialIssueRowId === record.id ? (
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => submitMaterialIssue(record)}
                              disabled={materialIssueSubmittingId === record.id}
                              style={{ minWidth: 82 }}
                            >
                              {materialIssueSubmittingId === record.id ? "Saving..." : "Submit"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={cancelMaterialIssueEdit}
                              disabled={materialIssueSubmittingId === record.id}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => startMaterialIssueEdit(record)}
                            disabled={record.disabledIssue}
                            style={{ minWidth: 82, opacity: record.disabledIssue ? 0.5 : 1 }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Issue
                          </button>
                        ),
                    },
                  ]),
            ]}
          />
        </div>
      </Modal>

      <DeleteModal
        show={deleteModalShow}
        handleClose={closeDeleteModal}
        onDelete={handleDeleteWorkOrder}
        title="Delete Work Order"
        message={`Are you sure you want to delete work order ${deleteWorkOrder?.orderId || ""}? Once deleted, it cannot be recovered.`}
      />
    </div>
  );
}

export default WorkOrders;