import React, { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Input, Modal, Popconfirm, Progress, Select, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import CustomerSelect from "../../filterComponents/CustomerSelect";
import StoreSelect from "../../filterComponents/StoreSelect";
import ProductSelect from "../../filterComponents/ProductSelect";
import SalesQuotationSelect from "../../filterComponents/SalesQuotationSelect";

import DeleteModal from "../../CommonComponent/DeleteModal";
import { UserAuth } from "../../auth/Auth";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";

// Match react-select dropdowns to AntD's size="large" box look (42px tall, 6px radius)
const boxSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    height: "42px",
    borderRadius: "6px",
    borderColor: state.isFocused ? "#6161ff" : "#d9d9d9",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(97, 97, 255, 0.1)" : "none",
    "&:hover": { borderColor: "#6161ff" },
  }),
  valueContainer: (base) => ({ ...base, height: "42px", padding: "0 11px" }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base) => ({ ...base, height: "42px" }),
  placeholder: (base) => ({ ...base, color: "#bfbfbf" }),
};

function WorkOrders() {
  const { user, isVariantBased } = UserAuth();
  const companyId = user?.company_id ?? user?.company?.id ?? null;
  const companySettings = user?.company?.generalSettings || null;
  const productionwithoutBOM = companySettings.production_without_bom === 1;

  const [rows, setRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({ skip: 0, take: 15 });
  const [sortState, setSortState] = useState({
    sort: null,
    order: null,
    columnKey: null,
  });
  const [statusTab, setStatusTab] = useState(null);
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
  const [variantsByIndex, setVariantsByIndex] = useState({});
  const [variantLoadingByIndex, setVariantLoadingByIndex] = useState({});
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteWorkOrder, setDeleteWorkOrder] = useState(null);
  const [materialIssueOpen, setMaterialIssueOpen] = useState(false);
  const [materialIssueLoading, setMaterialIssueLoading] = useState(false);
  const [materialIssueRows, setMaterialIssueRows] = useState([]);
  const [materialIssueWorkOrder, setMaterialIssueWorkOrder] = useState(null);
  const [editingMaterialIssueRowId, setEditingMaterialIssueRowId] = useState(null);
  const [materialIssueDraftQty, setMaterialIssueDraftQty] = useState("");
  const [materialIssueSubmittingId, setMaterialIssueSubmittingId] = useState(null);
  const [deletingMaterialIssueId, setDeletingMaterialIssueId] = useState(null);
  const [materialIssueCompleting, setMaterialIssueCompleting] = useState(false);
  const [completingProduction, setCompletingProduction] = useState(false);
  const [productionFlowDrafts, setProductionFlowDrafts] = useState({});
  const [productionFlowSavingId, setProductionFlowSavingId] = useState(null);
  const [editingInProgressStepId, setEditingInProgressStepId] = useState(null);
  const [saving, setSaving] = useState(false);
  // const [startingProductionId, setStartingProductionId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editWorkOrderId, setEditWorkOrderId] = useState(null);
  const [editWorkOrderLoading, setEditWorkOrderLoading] = useState(false);
  const [uomList, setUomList] = useState([]);
  const [uomLoading, setUomLoading] = useState(false);
  const MAX_WORK_ORDERS = 4;
  const buildEmptyEntry = () => ({
    customer: null,
    store: null,
    finishedGoodId: null,
    finishedGoodData: null,
    finishedGoodVariantId: null,
    quantity: "",
    totalWeightValue: "",
    totalWeightUnit: "kg",
    workOrderStepIds: [],
    dueDate: null,
    sellOrder: null,
  });
  const [formEntries, setFormEntries] = useState([buildEmptyEntry()]);

  const flowStepNameMap = useMemo(
    () => new Map(flowSteps.map((f) => [String(f.step_id), f?.step?.name || `Step ${f.step_id}`])),
    [flowSteps]
  );
  const getSelectedStepsForEntry = (entry) =>
    (entry?.workOrderStepIds || []).map((id) => ({
      id,
      name: flowStepNameMap.get(String(id)) || `Step ${id}`,
    }));

  const productionStepFilterOptions = useMemo(
    () =>
      flowSteps.map((item) => ({
        value: item?.step_id,
        label: item?.step?.name || `Step ${item?.step_id}`,
      })),
    [flowSteps]
  );

  const uomOptions = useMemo(
    () => uomList.map((u) => ({ value: u.id, label: `${u.name} (${u.label})` })),
    [uomList]
  );

  const normalizeWorkOrderSteps = (steps = []) =>
    (Array.isArray(steps) ? steps : [])
      .slice()
      .sort((a, b) => Number(a?.sequence) - Number(b?.sequence))
      .map((step) => ({
        id: step?.id,
        stepId: step?.step_id,
        status: Number(step?.status) || 1,
        sequence: Number(step?.sequence) || 0,
        processName: step?.processName || step?.step?.name || "N/A",
        uomId: step?.uomId ?? step?.uom_id ?? null,
        inputQty: step?.inputQty ?? step?.input_qty,
        outputQty: step?.outputQty ?? step?.output_qty,
        wasteQty: step?.wasteQty ?? step?.waste_qty,
        yieldPercent: step?.yieldPercent ?? step?.yield_percent,
      }));

  const buildProductionStepDrafts = (steps = []) =>
    (Array.isArray(steps) ? steps : []).reduce((acc, step, index) => {
      const stepKey = step?.id || `${step?.stepId || step?.step_id}-${index}`;
      acc[stepKey] = {
        inputQty: step?.inputQty ?? step?.input_qty ?? "",
        outputQty: step?.outputQty ?? step?.output_qty ?? "",
        uomId: step?.uomId ?? step?.uom_id ?? step?.input_uom_id ?? step?.output_uom_id ?? null,
        status: Number(step?.status) || 1,
      };
      return acc;
    }, {});

  const getProductionStepStatusLabel = (status) => {
    const code = Number(status);
    if (code === 1) return "Pending";
    if (code === 2) return "In-progress";
    if (code === 3) return "Completed";
    if (code === 4) return "Skipped";
    return "Pending";
  };

  const productionFlowRows = useMemo(() => {
    const steps = Array.isArray(materialIssueWorkOrder?.workOrderSteps)
      ? materialIssueWorkOrder.workOrderSteps
      : [];

    return steps
      .slice()
      .sort((a, b) => Number(a?.sequence) - Number(b?.sequence))
      .map((step, index) => {
        const inputQty = step?.inputQty ?? step?.input_qty ?? null;
        const outputQty = step?.outputQty ?? step?.output_qty ?? null;
        const wasteQty = step?.wasteQty ?? step?.waste_qty ?? null;
        const yieldPercent = step?.yieldPercent ?? step?.yield_percent ?? null;
        const rowId = String(step?.id ?? `${step?.stepId ?? step?.step_id}-${index}`);
        const draft = productionFlowDrafts?.[rowId] || {};
        const mappedStepId = step?.stepId ?? step?.step_id;
        const status = Number(
          draft.status ??
            step?.status ??
            1
        );
        const isCurrentStep =
          String(mappedStepId) === String(materialIssueWorkOrder?.currentStep);

        return {
          id: rowId,
          woStepId: step?.id,
          stepId: mappedStepId,
          sequence: Number(step?.sequence) || index + 1,
          processName: step?.processName || step?.step?.name || "N/A",
          inputQty: draft.inputQty ?? (inputQty ?? ""),
          outputQty: draft.outputQty ?? (outputQty ?? ""),
          uomId: draft.uomId ?? null,
          wasteQty,
          yieldPercent,
          status,
          statusLabel: getProductionStepStatusLabel(status),
          isCurrentStep,
        };
      });
  }, [materialIssueWorkOrder?.workOrderSteps, materialIssueWorkOrder?.currentStep, productionFlowDrafts]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const fetchUomList = async () => {
    setUomLoading(true);
    try {
      const res = await PrivateAxios.get("/master/uom/list");
      setUomList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setUomList([]);
    } finally {
      setUomLoading(false);
    }
  };

  useEffect(() => {
    fetchUomList();
  }, []);

  const updateEntry = (index, patch) => {
    setFormEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const fetchFinishedGoodVariantsForEntry = async (productId, index) => {
    if (!productId || !isVariantBased) {
      setVariantsByIndex((prev) => ({ ...prev, [index]: [] }));
      return;
    }
    setVariantLoadingByIndex((prev) => ({ ...prev, [index]: true }));
    try {
      const res = await PrivateAxios.get(`/product/variants/${productId}`);
      const variants = Array.isArray(res.data?.data?.variants) ? res.data.data.variants : [];
      const options = variants.map((v) => {
        const uomLabel = v?.masterUOM?.label || v?.masterUOM?.name || "";
        const label = `${v?.weight_per_unit ?? ""} ${uomLabel}`.trim();
        return {
          value: v.id,
          label: label || `Variant #${v.id}`,
          weight_per_unit: v?.weight_per_unit,
          uomLabel,
          variantData: v,
        };
      });
      setVariantsByIndex((prev) => ({ ...prev, [index]: options }));
    } catch (error) {
      setVariantsByIndex((prev) => ({ ...prev, [index]: [] }));
      ErrorMessage(error?.response?.data?.message || "Failed to fetch finished good variants.");
    } finally {
      setVariantLoadingByIndex((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Returns a human-readable total weight string from a unit count.
  // e.g. formatWeightFromUnits(280, 500, "g") => "140 kg"
  const formatWeightFromUnits = (units, weightPerUnit, uomLabel) => {
    const qty = Number(units);
    const wpu = Number(weightPerUnit);
    if (!Number.isFinite(qty) || !Number.isFinite(wpu) || wpu === 0) return null;
    const total = qty * wpu;
    if ((uomLabel || "").toLowerCase() === "g" && total >= 1000) {
      return `${Number((total / 1000).toFixed(3))} kg`;
    }
    return `${Number(total.toFixed(3))} ${uomLabel || ""}`.trim();
  };

  // Picks the most readable unit for a work-order's total required quantity,
  // using `unitFactorMap` to convert between units in the same group (weight/volume).
  // e.g. formatTotalRequired(300, 500, "g") => "150 kg"
  //      formatTotalRequired(100, 2, "kg")  => "200 kg"
  //      formatTotalRequired(300, 1, "pcs") => "300 pcs"  (unknown label, pass-through)
  const formatTotalRequired = (plannedQty, weightPerUnit, uomLabel) => {
    const qty = Number(plannedQty);
    const wpu = Number(weightPerUnit);
    if (!Number.isFinite(qty) || qty <= 0) return null;
    if (!Number.isFinite(wpu) || wpu <= 0) return null;

    const total = qty * wpu;
    const label = (uomLabel || "").trim();
    const normalized = label.toLowerCase();
    const entry = unitFactorMap[normalized];

    // piece/pc share the weight group in the map but shouldn't be converted to g/kg.
    const isPiece = normalized === "piece" || normalized === "pc";
    if (!entry || isPiece) {
      return `${Number(total.toFixed(3))} ${label}`.trim();
    }

    const base = total * entry.factor;
    if (entry.group === "weight") {
      if (base >= 1_000_000) return `${Number((base / 1_000_000).toFixed(3))} ton`;
      if (base >= 1000) return `${Number((base / 1000).toFixed(3))} kg`;
      return `${Number(base.toFixed(3))} g`;
    }
    if (entry.group === "volume") {
      if (base >= 1000) return `${Number((base / 1000).toFixed(3))} l`;
      return `${Number(base.toFixed(3))} ml`;
    }
    return `${Number(total.toFixed(3))} ${label}`.trim();
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
        warehouse: item?.warehouse || "",
        customer:
          item?.customer?.name ||
          item?.customer_name ||
          item?.customer?.label ||
          "N/A",
        finishedGood: `${finishedGoodName}${finishedGoodCode ? ` (${finishedGoodCode})` : ""}`,
        finishedGoodVariant: item?.finalProductVariant?.weight_per_unit ? `${item?.finalProductVariant?.weight_per_unit} ${item?.finalProductVariant?.masterUOM.label}` : "",
        qty: Number(item?.planned_qty) || 0,
        plannedQty: Number(item?.planned_qty) || 0,
        finalQty: Number(item?.final_qty) || 0,
        status: Number(item?.status) || 0,
        statusLabel: item?.status < 3 ? "Not Started Yet" : item?.productionStep?.name || "Pending",
        workOrderStatus: item?.status === 1 ? "Pending Material Issue" : item?.status === 2 ? "In-progress" : item?.status === 3 ? "Material Issued" : item?.status === 4 ? "Completed" : "Cancelled",
        progress: Number(item?.progress_percent) || 0,
        currentStep: Number(item?.production_step_id || item?.productionStep?.id) || 0,
        processFlow: Array.isArray(item?.workOrderSteps)
          ? item.workOrderSteps.map((p) => ({ name: p?.step?.name, colour: p?.step?.colour_code })).filter((s) => s.name)
          : [],
        workOrderSteps: normalizeWorkOrderSteps(item?.workOrderSteps),
        materialProgress: Number(item?.material_issue_percent) || 0,
        dueDate: item?.due_date ? dayjs(item.due_date).format("DD/MM/YYYY") : "N/A",
        materialIssuedBy: item?.materialIssuedBy?.name || "N/A",
        materialIssuedAt: item?.material_issued_at
          ? dayjs(item.material_issued_at).format("DD/MM/YYYY")
          : "N/A",
        fgUomLabel: item?.finalProductVariant?.masterUOM?.label || "kg",
      };
    });

  const fetchWorkOrders = async (customPageState = null, customFilters = null, customSortState = null, customStatusTab) => {
    const currentPageState = customPageState || pageState;
    const currentFilters = customFilters || filters;
    const currentSortState = customSortState || sortState;
    const currentStatusTab = customStatusTab !== undefined ? customStatusTab : statusTab;

    setListLoading(true);
    try {
      const page = currentPageState.skip / currentPageState.take + 1;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(currentPageState.take),
        ...(currentStatusTab != null ? { status: String(currentStatusTab) } : {}),
        ...(currentSortState?.sort && currentSortState?.order
          ? { sort: String(currentSortState.sort), order: String(currentSortState.order) }
          : {}),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState.skip, pageState.take, sortState.sort, sortState.order]);

  const openAddModal = () => {
    setModalMode("add");
    setEditWorkOrderId(null);
    const presetStepIds = flowSteps.map((item) => item.step_id);
    setFormEntries([{ ...buildEmptyEntry(), workOrderStepIds: presetStepIds }]);
    setVariantsByIndex({});
    setVariantLoadingByIndex({});
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditWorkOrderId(null);
    setModalMode("add");
    setFormEntries([buildEmptyEntry()]);
    setVariantsByIndex({});
    setVariantLoadingByIndex({});
  };

  const addAnotherEntry = () => {
    setFormEntries((prev) => {
      if (prev.length >= MAX_WORK_ORDERS) return prev;
      const presetStepIds = flowSteps.map((item) => item.step_id);
      return [...prev, { ...buildEmptyEntry(), workOrderStepIds: presetStepIds }];
    });
  };

  const removeEntry = (index) => {
    setFormEntries((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    setVariantsByIndex((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        const key = Number(k);
        if (key === index) return;
        next[key < index ? key : key - 1] = prev[k];
      });
      return next;
    });
    setVariantLoadingByIndex((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        const key = Number(k);
        if (key === index) return;
        next[key < index ? key : key - 1] = prev[k];
      });
      return next;
    });
  };

  const openEditModal = async (record) => {
    if (!record?.id) return;
    setModalMode("edit");
    setEditWorkOrderId(record.id);
    setFormEntries([buildEmptyEntry()]);
    setVariantsByIndex({});
    setVariantLoadingByIndex({});
    setIsAddModalOpen(true);
    setEditWorkOrderLoading(true);
    try {
      const res = await PrivateAxios.get(`/production/work-order/${record.id}`);
      const data = res.data?.data || {};
      const stepIds = (Array.isArray(data.workOrderSteps) ? data.workOrderSteps : [])
        .slice()
        .sort((a, b) => Number(a.sequence) - Number(b.sequence))
        .map((s) => s.step_id);
      const customerOption = data.customer
        ? { id: data.customer.id, name: data.customer.name, value: data.customer.id, label: data.customer.name }
        : null;
      const storeOption = data.warehouse
        ? { value: data.warehouse.id, label: `${data.warehouse.name || "N/A"} (${data.warehouse.city || "N/A"})`, storeData: data.warehouse }
        : null;
      const plannedQtyNum = parseFloat(data.planned_qty);
      const variantWpu = parseFloat(data?.finalProductVariant?.weight_per_unit);
      const variantUomLabel = data?.finalProductVariant?.masterUOM?.label || "kg";
      const prefillTotalWeight =
        Number.isFinite(plannedQtyNum) &&
        Number.isFinite(variantWpu) &&
        variantWpu > 0
          ? String(Number((plannedQtyNum * variantWpu).toFixed(3)))
          : "";

      setFormEntries([{
        customer: customerOption,
        store: storeOption,
        finishedGoodId: data.product?.id || null,
        finishedGoodData: data.product || null,
        finishedGoodVariantId: data.finalProductVariant?.id || null,
        quantity: String(data.planned_qty ?? ""),
        totalWeightValue: prefillTotalWeight,
        totalWeightUnit: variantUomLabel,
        workOrderStepIds: stepIds,
        dueDate: data.due_date ? dayjs(data.due_date) : null,
        sellOrder: null,
      }]);
      if (data.product?.id && isVariantBased) {
        fetchFinishedGoodVariantsForEntry(data.product.id, 0);
      }
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to fetch work order details.");
      setIsAddModalOpen(false);
    } finally {
      setEditWorkOrderLoading(false);
    }
  };

  const handleStepToggle = (index, stepId) => {
    setFormEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== index) return entry;
        const current = Array.isArray(entry.workOrderStepIds) ? entry.workOrderStepIds : [];
        const exists = current.some((id) => String(id) === String(stepId));
        const nextIds = exists
          ? current.filter((id) => String(id) !== String(stepId))
          : [...current, stepId];
        return { ...entry, workOrderStepIds: nextIds };
      })
    );
  };

  // Cross-unit conversion used for the Total Weight → Quantity derivation.
  // Mirrors the logic in MyNewpurchase.js so behaviour stays consistent across
  // creation flows.
  const unitFactorMap = {
    mg: { group: "weight", factor: 0.001 },
    g: { group: "weight", factor: 1 },
    kg: { group: "weight", factor: 1000 },
    ton: { group: "weight", factor: 1000000 },
    tonne: { group: "weight", factor: 1000000 },
    ml: { group: "volume", factor: 1 },
    l: { group: "volume", factor: 1000 },
    piece: { group: "weight", factor: 1 },
    pc: { group: "weight", factor: 1 },
  };

  const normalizeUnit = (unit) => String(unit || "").trim().toLowerCase();

  const convertUnitValue = (value, fromUnit, toUnit) => {
    const from = unitFactorMap[normalizeUnit(fromUnit)];
    const to = unitFactorMap[normalizeUnit(toUnit)];
    if (!from || !to || from.group !== to.group) return null;
    const baseValue = Number(value) * from.factor;
    return baseValue / to.factor;
  };

  // Quantity = convertedTotalWeight / variant.weight_per_unit. Triggered from
  // the Total Weight input and unit select; ignored when no variant is chosen
  // or variant has no weight_per_unit.
  const handleTotalWeightChange = (index, field, value) => {
    setFormEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== index) return entry;
        const next = { ...entry, [field]: value };
        const variants = variantsByIndex[index] || [];
        const selectedVariant = variants.find(
          (v) => String(v.value) === String(entry.finishedGoodVariantId)
        );
        if (!selectedVariant) return next;

        const variantWeightPerUnit = parseFloat(selectedVariant.weight_per_unit) || 0;
        const variantUnit = selectedVariant.uomLabel || "kg";
        const totalWeightValueRaw =
          field === "totalWeightValue" ? value : entry.totalWeightValue;
        const totalWeightUnit =
          field === "totalWeightUnit" ? value : entry.totalWeightUnit || "kg";
        const totalWeightValue = parseFloat(totalWeightValueRaw);

        if (
          Number.isFinite(totalWeightValue) &&
          totalWeightValue >= 0 &&
          variantWeightPerUnit > 0
        ) {
          const converted = convertUnitValue(
            totalWeightValue,
            totalWeightUnit,
            variantUnit
          );
          if (converted !== null) {
            next.quantity = String(Number((converted / variantWeightPerUnit).toFixed(3)));
          }
        }
        return next;
      })
    );
  };

  // Validate a single entry. Returns null on success, else an error message
  // prefixed with the work-order position when there are multiple entries.
  const validateEntry = (entry, index, total) => {
    const prefix = total > 1 ? `Work Order #${index + 1}: ` : "";
    if (!entry.customer) return `${prefix}Customer is required.`;
    if (!entry.store) return `${prefix}Store is required.`;
    if (!entry.finishedGoodId) return `${prefix}Finished Good is required.`;
    if (isVariantBased && !entry.finishedGoodVariantId)
      return `${prefix}Finished Good Variant is required.`;
    const qty = Number(entry.quantity);
    if (!Number.isFinite(qty) || qty <= 0)
      return `${prefix}Quantity must be a positive number.`;
    if (!entry.workOrderStepIds || entry.workOrderStepIds.length === 0)
      return `${prefix}Please select work order steps in sequence.`;
    if (!entry.dueDate) return `${prefix}Due Date is required.`;
    return null;
  };

  const entryToPayload = (entry) => ({
    customer_id: entry.customer?.id ?? entry.customer?.value,
    warehouse_id: entry.store?.value,
    product_id: entry.finishedGoodId,
    final_product_variant_id: isVariantBased ? entry.finishedGoodVariantId : null,
    planned_qty: Number(entry.quantity),
    due_date: dayjs(entry.dueDate).format("YYYY-MM-DD"),
    production_step_id: entry.workOrderStepIds[0],
    sales_id: entry.sellOrder?.id ?? entry.sellOrder?.value ?? null,
    work_order_steps: entry.workOrderStepIds.map((id, idx) => ({
      step_id: id,
      sequence: idx + 1,
    })),
  });

  const handleSave = async () => {
    for (let i = 0; i < formEntries.length; i++) {
      const err = validateEntry(formEntries[i], i, formEntries.length);
      if (err) {
        ErrorMessage(err);
        return;
      }
    }

    setSaving(true);
    try {
      let res;
      if (formEntries.length === 1) {
        res = await PrivateAxios.post(
          "/production/work-order/create",
          entryToPayload(formEntries[0])
        );
      } else {
        res = await PrivateAxios.post(
          "/production/work-order/create-multiple",
          { work_orders: formEntries.map(entryToPayload) }
        );
      }
      SuccessMessage(
        res?.data?.message ||
          (formEntries.length === 1
            ? "Work order created successfully."
            : `${formEntries.length} work orders created successfully.`)
      );
      const resetPageState = { skip: 0, take: pageState.take || 15 };
      setPageState(resetPageState);
      fetchWorkOrders(resetPageState);
      closeAddModal();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to create work order(s).");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    const entry = formEntries[0];
    const err = validateEntry(entry, 0, 1);
    if (err) {
      ErrorMessage(err);
      return;
    }

    setSaving(true);
    try {
      const payload = entryToPayload(entry);
      delete payload.sales_id; // update API did not previously include sales_id
      const res = await PrivateAxios.put(`/production/work-order/update/${editWorkOrderId}`, payload);
      SuccessMessage(res?.data?.message || "Work order updated successfully.");
      fetchWorkOrders(pageState, filters);
      closeAddModal();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to update work order.");
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

  const toApiOrder = (antOrder) => {
    if (antOrder === "ascend") return "asc";
    if (antOrder === "descend") return "desc";
    return null;
  };

  const toAntOrder = (apiOrder) => {
    if (apiOrder === "asc") return "ascend";
    if (apiOrder === "desc") return "descend";
    return null;
  };

  const handleTableChange = (pagination, _tableFilters, sorter) => {
    const nextPage = pagination?.current || 1;
    const nextPageSize = pagination?.pageSize || pageState.take;
    const nextPageState = {
      skip: (nextPage - 1) * nextPageSize,
      take: nextPageSize,
    };

    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;

    const sortFieldMap = {
      customer: "customer_name",
      finishedGood: "product_name",
    };

    let nextSortState = sortState;
    if (activeSorter && (activeSorter.columnKey || activeSorter.field || activeSorter.order !== undefined)) {
      if (activeSorter.order) {
        const columnKey = activeSorter.columnKey || activeSorter.field;
        const apiSortField = sortFieldMap[columnKey];
        if (apiSortField) {
          nextSortState = {
            sort: apiSortField,
            order: toApiOrder(activeSorter.order),
            columnKey,
          };
        }
      } else {
        nextSortState = { sort: null, order: null, columnKey: null };
      }
    } else {
      // when cancel sort, set sort state to null
      nextSortState = { sort: null, order: null, columnKey: null };
    }

    setPageState(nextPageState);
    setSortState(nextSortState);
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
    setStatusTab(null);
    setPageState(nextPageState);
    if (pageState.skip === 0 && pageState.take === 15) {
      fetchWorkOrders(nextPageState, resetFilters, null, null);
    }
  };

  const handleExportWorkOrders = async () => {
    setExporting(true);
    try {
      const params = {
        ...(statusTab != null ? { status: String(statusTab) } : {}),
        ...(String(filters.orderId || "").trim() && { wo_number: String(filters.orderId).trim() }),
        ...(filters.customer?.id || filters.customer?.value
          ? { customer_id: String(filters.customer?.id ?? filters.customer?.value) }
          : {}),
        ...(filters.finishedGoodId ? { product_id: String(filters.finishedGoodId) } : {}),
        ...(filters.productionStepId ? { production_step_id: String(filters.productionStepId) } : {}),
      };
      const response = await PrivateAxios.get("/production/work-order/export", {
        params,
        responseType: "blob",
      });
      const disposition = response.headers["content-disposition"];
      let filename = "work-orders.csv";
      if (disposition) {
        const match = disposition.match(/filename="?([^";\n]+)"?/i);
        if (match?.[1]) filename = match[1].trim();
      }
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to export work orders.");
    } finally {
      setExporting(false);
    }
  };

  const closeMaterialIssueModal = () => {
    setMaterialIssueOpen(false);
    setMaterialIssueRows([]);
    setMaterialIssueWorkOrder(null);
    setProductionFlowDrafts({});
    setProductionFlowSavingId(null);
    setEditingInProgressStepId(null);
    setEditingMaterialIssueRowId(null);
    setMaterialIssueDraftQty("");
    setMaterialIssueSubmittingId(null);
  };

  const openMaterialIssueModal = async (record) => {
    if (!record?.id) return;
    setMaterialIssueOpen(true);
    setMaterialIssueLoading(true);
    setMaterialIssueWorkOrder(record);
    setEditingInProgressStepId(null);

    try {
      const apiPath = productionwithoutBOM
        ? `/production/work-order/materials-list/${record.id}`
        : `/production/work-order/bom-list/${record.id}`;
      const res = await PrivateAxios.get(apiPath);
      const payload = res?.data?.data || {};
      const workOrder = payload?.workOrder || {};
      const fgUOM = payload?.fg_uom || null;
      const fgUomLabel = payload?.fg_uom?.label || record?.fgUomLabel || "kg";
      const plannedQty = Number(workOrder?.planned_qty) || 0;
      const materialIssues = Array.isArray(workOrder?.workOrderMaterialIssues)
        ? workOrder.workOrderMaterialIssues
        : [];
      const disabledIssue = parseInt(workOrder?.status) !== 1 && parseInt(workOrder?.status) !== 2;
      const woId = workOrder?.id || record?.id;
      const rows = [];

      if (productionwithoutBOM) {
        // Mapping-based flow: /materials-list returns rmProduct + productStockEntries.
        // No BOM multiplier → no required/pending. One row per {rm, warehouse};
        // when variant-based, a row carries all variants available in that warehouse
        // so the user can pick one from a dropdown.
        for (const item of (Array.isArray(payload?.materialList) ? payload.materialList : [])) {
          const rmProduct = item?.rmProduct || {};
          const rmProductId = item?.rm_product_id;
          const rmProductName = rmProduct?.product_name || "N/A";
          const rmProductCode = rmProduct?.product_code || "N/A";
          const stockEntries = Array.isArray(rmProduct?.productStockEntries)
            ? rmProduct.productStockEntries
            : [];

          const base = {
            woId,
            rmProductId,
            requiredQty: null,
            pendingQty: null,
            disabledIssue,
            material: rmProductName,
            code: rmProductCode,
            status: parseInt(workOrder?.status),
          };

          if (stockEntries.length === 0) {
            rows.push({
              ...base,
              id: String(item?.id),
              rmProductVariantId: null,
              unitLabel: "",
              weightPerUnit: 0,
              availableVariants: [],
              warehouseId: null,
              warehouseName: "—",
              stockQty: 0,
              issuedQty: 0,
            });
            continue;
          }

          // Group stock entries by warehouse_id.
          const byWarehouse = new Map();
          for (const entry of stockEntries) {
            const whId = entry?.warehouse?.id ?? null;
            if (!byWarehouse.has(whId)) byWarehouse.set(whId, []);
            byWarehouse.get(whId).push(entry);
          }

          for (const [whId, entries] of byWarehouse.entries()) {
            const warehouseName = entries[0]?.warehouse?.name || "—";
            const availableVariants = entries.map((entry) => {
              const variant = entry?.productVariant || {};
              const variantId = variant?.id ?? null;
              const unitLabel = variant?.masterUOM?.label || "";
              const label = variant?.weight_per_unit != null
                ? `${variant.weight_per_unit} ${unitLabel}`.trim()
                : unitLabel || "Default";
              // Find the issue record matching this {rm, variant, warehouse}, if any.
              const matchingIssue = materialIssues.find(
                (issue) =>
                  issue?.rm_product_id === rmProductId &&
                  issue?.rm_product_variant_id === variantId &&
                  issue?.warehouse_id === whId
              );
              const variantIssuedQty = materialIssues.reduce((sum, issue) => {
                if (issue?.rm_product_id !== rmProductId) return sum;
                if (issue?.rm_product_variant_id !== variantId) return sum;
                if (issue?.warehouse_id !== whId) return sum;
                return sum + (Number(issue?.issued_qty) || 0);
              }, 0);
              return {
                value: variantId,
                label: label || "Default",
                weightPerUnit: Number(variant?.weight_per_unit) || 0,
                unitLabel,
                stockQty: Number(entry?.quantity) || 0,
                issuedQty: variantIssuedQty,
                materialIssueId: matchingIssue?.id ?? null,
              };
            });

            // Prefer the already-issued variant as the default selection so its
            // quantity and issue id are visible without the user having to pick it.
            const defaultVariant =
              availableVariants.find((v) => (v.issuedQty || 0) > 0) ||
              availableVariants[0];
            rows.push({
              ...base,
              id: `${item?.id}-w${whId ?? "none"}`,
              rmProductVariantId: defaultVariant?.value ?? null,
              unitLabel: defaultVariant?.unitLabel || "",
              weightPerUnit: defaultVariant?.weightPerUnit || 0,
              availableVariants,
              warehouseId: whId,
              warehouseName,
              stockQty: defaultVariant?.stockQty ?? 0,
              issuedQty: defaultVariant?.issuedQty ?? 0,
              materialIssueId: defaultVariant?.materialIssueId ?? null,
            });
          }
        }
      } else {
        // Existing BOM flow.
        for (const item of (Array.isArray(payload?.materialList) ? payload.materialList : [])) {
          const variant = item?.rawMaterialProductVariant || {};
          const unitLabel = variant?.masterUOM?.label || "";
          const stockEntries = Array.isArray(variant?.productStockEntries)
            ? variant.productStockEntries
            : [];

          const requiredQty = plannedQty * (Number(item?.quantity) || 0);
          // Total issued across all warehouses — used for overall pending calculation
          const totalIssuedQty = materialIssues.reduce((sum, issue) => {
            if (issue?.rm_product_variant_id !== item?.raw_material_variant_id) return sum;
            return sum + (Number(issue?.issued_qty) || 0);
          }, 0);
          const pendingQty = Math.max(requiredQty - totalIssuedQty, 0);
          let rawMaterialName = item?.rawMaterialProduct?.product_name || "N/A";
          rawMaterialName += ` (${variant.weight_per_unit} ${variant?.masterUOM?.label || ""})`;
          const base = {
            woId,
            rmProductId: item?.raw_material_product_id,
            rmProductVariantId: item?.raw_material_variant_id,
            unitLabel,
            weightPerUnit: Number(variant?.weight_per_unit) || 0,
            requiredQty,
            disabledIssue,
            pendingQty,
            material: rawMaterialName,
            code: item?.rawMaterialProduct?.product_code || "N/A",
            status: parseInt(workOrder?.status),
          };

          if (stockEntries.length === 0) {
            rows.push({ ...base, id: String(item?.id), warehouseId: null, warehouseName: "—", stockQty: 0, issuedQty: totalIssuedQty });
          } else {
            for (const entry of stockEntries) {
              const warehouseIssuedQty = materialIssues.reduce((sum, issue) => {
                if (issue?.rm_product_variant_id !== item?.raw_material_variant_id) return sum;
                if (issue?.warehouse_id !== entry?.warehouse?.id) return sum;
                return sum + (Number(issue?.issued_qty) || 0);
              }, 0);
              rows.push({
                ...base,
                id: `${item?.id}-${entry?.id}`,
                warehouseId: entry?.warehouse?.id ?? null,
                warehouseName: entry?.warehouse?.name || "—",
                stockQty: Number(entry?.quantity) || 0,
                issuedQty: warehouseIssuedQty,
              });
            }
          }
        }
      }

      setMaterialIssueRows(rows);
      setMaterialIssueWorkOrder((prev) => ({
        ...(prev || record),
        orderId: record?.orderId || prev?.orderId,
        workOrderStatus: parseInt(workOrder?.status),
        fgUOM,
        fgUomLabel,
        currentStep:
          Number(workOrder?.production_step_id || workOrder?.productionStep?.id) ||
          Number(record?.currentStep) ||
          Number(prev?.currentStep) ||
          0,
      }));
      setProductionFlowDrafts(buildProductionStepDrafts(record?.workOrderSteps));

    } catch (error) {
      setMaterialIssueRows([]);
      ErrorMessage(
        error?.response?.data?.message ||
          (productionwithoutBOM
            ? "Failed to fetch material list."
            : "Failed to fetch BOM list.")
      );
    } finally {
      setMaterialIssueLoading(false);
    }
  };

  const handleMaterialIssueVariantChange = (rowId, variantId) => {
    setMaterialIssueRows((prev) =>
      prev.map((row) => {
        if (String(row.id) !== String(rowId)) return row;
        const selected = (row.availableVariants || []).find(
          (v) => String(v.value) === String(variantId)
        );
        if (!selected) return row;
        return {
          ...row,
          rmProductVariantId: selected.value,
          unitLabel: selected.unitLabel,
          weightPerUnit: selected.weightPerUnit,
          stockQty: selected.stockQty,
          issuedQty: selected.issuedQty ?? 0,
          materialIssueId: selected.materialIssueId ?? null,
        };
      })
    );
  };

  const handleDeleteMaterialIssue = async (row) => {
    const issueId = row?.materialIssueId;
    if (!issueId) return;
    setDeletingMaterialIssueId(row.id);
    try {
      const res = await PrivateAxios.delete(
        `/production/work-order/material-issue/${issueId}`
      );
      SuccessMessage(
        res?.data?.message || "Material issue record deleted successfully."
      );
      // Clear issued qty + issue id locally, and also strip it from the
      // matching variant option so re-selecting the variant stays consistent.
      setMaterialIssueRows((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(row.id)) return item;
          const nextVariants = (item.availableVariants || []).map((v) =>
            v.value === row.rmProductVariantId
              ? { ...v, issuedQty: 0, materialIssueId: null }
              : v
          );
          const next = {
            ...item,
            availableVariants: nextVariants,
            issuedQty: 0,
            materialIssueId: null,
          };
          if (item.requiredQty != null) {
            next.pendingQty = Number(item.requiredQty) || 0;
          }
          return next;
        })
      );
    } catch (error) {
      ErrorMessage(
        error?.response?.data?.message || "Failed to delete material issue."
      );
    } finally {
      setDeletingMaterialIssueId(null);
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
      fg_uom: materialIssueWorkOrder?.fgUomLabel || null,
      rm_weight_per_unit: row?.weightPerUnit,
      fg_weight_per_unit: materialIssueWorkOrder?.fgUOM?.weight_per_unit,
      rm_uom: row?.unitLabel || null,
      issued_qty: issuedQty,
      warehouse_id: row?.warehouseId ?? null,
    };

    setMaterialIssueSubmittingId(row?.id);
    try {
      const res = await PrivateAxios.post("/production/work-order/material-issue", payload);
      SuccessMessage(res?.data?.message || "Material issued successfully.");
      const issueId = res?.data?.data?.id ?? row?.materialIssueId ?? null;
      setMaterialIssueRows((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(row.id)) return item;
          const nextVariants = (item.availableVariants || []).map((v) =>
            v.value === row.rmProductVariantId
              ? { ...v, issuedQty, materialIssueId: issueId }
              : v
          );
          const next = {
            ...item,
            issuedQty,
            availableVariants: nextVariants,
            materialIssueId: issueId,
          };
          if (item.requiredQty != null) {
            next.pendingQty = Math.max(
              (Number(item.requiredQty) || 0) - issuedQty,
              0
            );
          }
          return next;
        })
      );
      // Update materialProgress so the "complete" button validation stays in sync
      setMaterialIssueWorkOrder((prev) => ({
        ...prev,
        materialProgress: Math.max(Number(prev?.materialProgress) || 0, 1),
      }));
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
    } else if (materialIssueWorkOrder?.workOrderStatus === 3) {
      ErrorMessage("Material issue is already completed for this work order.");
      return;
    } else if (materialIssueWorkOrder?.materialProgress === 0) {
      ErrorMessage("Cannot complete material issue with 0% material issued.");
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


  const handleProductionStepDraftChange = (rowId, field, value) => {
    if (rowId === null || rowId === undefined || rowId === "") return;
    const draftKey = String(rowId);
    setProductionFlowDrafts((prev) => ({
      ...prev,
      [draftKey]: {
        ...(prev?.[draftKey] || {}),
        [field]: value,
      },
    }));
  };

  const startInProgressStepEdit = (stepRow) => {
    if (stepRow?.id === null || stepRow?.id === undefined || stepRow?.id === "") return;
    const draftKey = String(stepRow.id);
    setEditingInProgressStepId(draftKey);
    setProductionFlowDrafts((prev) => ({
      ...prev,
      [draftKey]: {
        ...(prev?.[draftKey] || {}),
        inputQty: stepRow?.inputQty ?? "",
        outputQty: stepRow?.outputQty ?? "",
        uomId: stepRow?.uomId ?? prev?.[draftKey]?.uomId ?? null,
        status: Number(stepRow?.status) || 2,
      },
    }));
  };

  const submitProductionStepData = async (stepRow) => {
    const isEditingPreviousInProgress =
      String(editingInProgressStepId) === String(stepRow?.id);
    if (!stepRow?.isCurrentStep && !isEditingPreviousInProgress) return;
    const woId = materialIssueWorkOrder?.id;
    if (!woId || !stepRow?.woStepId) {
      ErrorMessage("Work order or work order step is missing.");
      return;
    }

    const draftKey = String(stepRow?.id);
    const latestDraft = productionFlowDrafts?.[draftKey] || {};
    const inputQty = Number(latestDraft?.inputQty ?? stepRow?.inputQty);
    const outputQty = Number(latestDraft?.outputQty ?? stepRow?.outputQty);
    const uomId = latestDraft?.uomId ?? null;
    const status = Number(latestDraft?.status ?? stepRow?.status);
    if (!Number.isFinite(inputQty) || inputQty < 0) {
      ErrorMessage("Input quantity must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(outputQty) || outputQty < 0) {
      ErrorMessage("Output quantity must be 0 or greater.");
      return;
    }
    if (![1, 2, 3, 4].includes(status)) {
      ErrorMessage("Invalid production status.");
      return;
    }

    const payload = {
      wo_id: woId,
      wo_step_id: stepRow.woStepId,
      input_qty: inputQty,
      output_qty: outputQty,
      uom_id: uomId,
      status,
    };

    setProductionFlowSavingId(stepRow.id);
    try {
      const res = await PrivateAxios.post("/production/work-order/save-production-data", payload);
      SuccessMessage(res?.data?.message || "Production step saved successfully.");
      const updatedWorkOrder =
        res?.data?.data?.workOrder ||
        (res?.data?.data?.id ? res.data.data : null) ||
        res?.data?.workOrder ||
        null;

      if (updatedWorkOrder?.id) {
        const normalizedSteps = normalizeWorkOrderSteps(updatedWorkOrder?.workOrderSteps);
        setMaterialIssueWorkOrder((prev) => ({
          ...(prev || {}),
          workOrderSteps: normalizedSteps,
          currentStep:
            Number(updatedWorkOrder?.production_step_id || updatedWorkOrder?.productionStep?.id) ||
            Number(prev?.currentStep) ||
            0,
        }));
        setProductionFlowDrafts(buildProductionStepDrafts(normalizedSteps));
      } else {
        setMaterialIssueWorkOrder((prev) => {
          if (!prev) return prev;
          const existingSteps = Array.isArray(prev.workOrderSteps) ? prev.workOrderSteps : [];
          const nextWasteQty = Number((Math.max(inputQty - outputQty, 0)).toFixed(3));
          const nextYieldPercent =
            inputQty > 0 ? Number(((outputQty / inputQty) * 100).toFixed(2)) : 0;
          const updatedSteps = existingSteps.map((step) =>
            String(step?.id) === String(stepRow.woStepId)
              ? {
                  ...step,
                  inputQty,
                  outputQty,
                  wasteQty: nextWasteQty,
                  yieldPercent: nextYieldPercent,
                  status,
                }
              : step
          );

          const nextCurrentStep = updatedSteps
            .slice()
            .sort((a, b) => Number(a?.sequence) - Number(b?.sequence))
            .find((step) => ![3, 4].includes(Number(step?.status)))?.stepId ?? prev.currentStep;

          return {
            ...prev,
            workOrderSteps: updatedSteps,
            currentStep: nextCurrentStep,
          };
        });
        setProductionFlowDrafts((prev) => ({
          ...prev,
          [draftKey]: {
            ...(prev?.[draftKey] || {}),
            inputQty,
            outputQty,
            status,
          },
        }));
      }

      fetchWorkOrders(pageState, filters);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to save production step data.");
    } finally {
      setProductionFlowSavingId(null);
      setEditingInProgressStepId(null);
    }
  };

  // const handleStartProduction = async (record) => {
  //   const id = record?.id;
  //   if (!id) return;
  //   setStartingProductionId(id);
  //   try {
  //     const res = await PrivateAxios.post("/production/work-order/material-issue-complete", { wo_id: id });
  //     SuccessMessage(res?.data?.message || "Production started successfully.");
  //     fetchWorkOrders(pageState, filters);
  //   } catch (error) {
  //     ErrorMessage(error?.response?.data?.message || "Failed to start production.");
  //   } finally {
  //     setStartingProductionId(null);
  //   }
  // };

  const [completeProductionModalOpen, setCompleteProductionModalOpen] = useState(false);
  const [finalQty, setFinalQty] = useState("");

  const openCompleteProductionModal = () => {
    const woId = materialIssueWorkOrder?.id;
    if (!woId) {
      ErrorMessage("Work order id is missing.");
      return;
    }
    setFinalQty("");
    setCompleteProductionModalOpen(true);
  };

  const closeCompleteProductionModal = () => {
    setCompleteProductionModalOpen(false);
    setFinalQty("");
  };

  const handleCompleteProduction = async () => {
    const woId = materialIssueWorkOrder?.id;
    if (!woId) {
      ErrorMessage("Work order id is missing.");
      return;
    }
    const qty = Number(finalQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      ErrorMessage("Final quantity must be a positive number.");
      return;
    }
    const plannedQty = Number(materialIssueWorkOrder?.plannedQty) || 0;
    if (plannedQty > 0 && qty > plannedQty) {
      ErrorMessage(`Final quantity cannot exceed planned quantity (${plannedQty}).`);
      return;
    }
    setCompletingProduction(true);
    try {
      const res = await PrivateAxios.post("/production/work-order/complete-production", {
        wo_id: woId,
        final_qty: qty,
      });
      SuccessMessage(res?.data?.message || "Production completed successfully.");
      closeCompleteProductionModal();
      closeMaterialIssueModal();
      fetchWorkOrders(pageState, filters);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to complete production.");
    } finally {
      setCompletingProduction(false);
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
    try {
      const res = await PrivateAxios.delete(`/production/work-order/delete/${id}`);
      SuccessMessage(res?.data?.message || "Work order deleted successfully.");
      closeDeleteModal();
      fetchWorkOrders(pageState, filters);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to delete work order.");
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

  const getProgressColor = (value) => {
    const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);
    const hue = Math.round((safeValue / 100) * 120); // 0 => red, 120 => green
    return `hsl(${hue}, 75%, 42%)`;
  };

  const columns = [
    { title: "Order ID", dataIndex: "orderId", key: "orderId", width: 150 },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      width: 190,
      sorter: true,
      sortDirections: ["descend", "ascend"],
      // sortOrder: sortState.columnKey === "customer" ? toAntOrder(sortState.order) : null,
      sortOrder:
        sortState.columnKey === "customer"
          ? (sortState.order === "asc" ? "ascend" : sortState.order === "desc" ? "descend" : null)
          : null,
    },
    { 
      title: "Finished Good", 
      dataIndex: "finishedGood", 
      key: "finishedGood", 
      width: 250,
      sorter: true,
      sortDirections: ["descend", "ascend"],
      sortOrder: sortState.columnKey === "finishedGood" ? toAntOrder(sortState.order) : null,
      render: (text, record) => (
        <div>
          {text}
          {record.finishedGoodVariant && <span className="text-muted"> ({record.finishedGoodVariant})</span>}
        </div>
      ),
    },
    {
      title: "Planned Qty",
      dataIndex: "plannedQty",
      key: "plannedQty",
      width: 110,
      render: (v) => new Intl.NumberFormat("en-IN").format(Number(v) || 0),
    },
    {
      title: "Final Qty",
      dataIndex: "finalQty",
      key: "finalQty",
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
      render: (value) => {
        const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);
        const progressColor = getProgressColor(safeValue);
        return (
          <div className="d-flex align-items-center gap-2">
            <Progress
              percent={safeValue}
              showInfo={false}
              strokeColor={progressColor}
              trailColor="#e9ecef"
              style={{ width: 80 }}
            />
            <span className="small fw-semibold" style={{ color: progressColor }}>{safeValue}%</span>
          </div>
        );
      },
    },
    {
      title: "Process Flow",
      dataIndex: "processFlow",
      key: "processFlow",
      width: 320,
      render: (flow = []) => (
        <div className="d-flex align-items-center flex-wrap gap-1">
          {flow.map((step, idx) => {
            const bg = step.colour || "#2f76e9";
            return (
              <React.Fragment key={`${step.name}-${idx}`}>
                <span
                  className="badge"
                  style={{
                    background: `${bg}18`,
                    color: bg,
                    border: `1px solid ${bg}40`,
                    fontWeight: 600,
                    borderRadius: 14,
                    padding: "5px 10px",
                  }}
                >
                  {step.name}
                </span>
                {idx < flow.length - 1 && (
                  <i className="fas fa-arrow-right text-muted mx-1" aria-hidden="true"></i>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ),
    },
    {
      title: "Material",
      dataIndex: "materialProgress",
      key: "materialProgress",
      width: 120,
      render: (value) => {
        const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);
        const progressColor = getProgressColor(safeValue);
        return (
          <div className="d-flex align-items-center gap-2">
            <Progress
              percent={safeValue}
              showInfo={false}
              strokeColor={progressColor}
              trailColor="#e9ecef"
              style={{ width: 70 }}
            />
            <span className="small fw-semibold" style={{ color: progressColor }}>{safeValue}%</span>
          </div>
        );
      },
    },
    { title: "Store", dataIndex: "warehouse", key: "warehouse", width: 180, render: (v) => v?.name || "—" },
    { title: "Created Date", dataIndex: "createdAt", key: "createdAt", width: 150 },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate", width: 120 },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <div className="d-flex gap-2 align-items-center">
          <Tooltip title="Material Issue">
            <i
              className="fas fa-box-open text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => openMaterialIssueModal(record)}
            ></i>
          </Tooltip>
          {/* {Number(record.status) === 2 && (
            <Tooltip title="Start Production">
              {startingProductionId === record.id ? (
                <i className="fas fa-spinner fa-spin text-warning"></i>
              ) : (
                <i
                  className="fas fa-play text-warning"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleStartProduction(record)}
                ></i>
              )}
            </Tooltip>
          )} */}
          <Tooltip title="Edit">
            <i
              className="far fa-edit text-success"
              style={{ cursor: "pointer" }}
              onClick={() => openEditModal(record)}
            ></i>
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
                onClick={handleExportWorkOrders}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download me-1"></i>
                    Export
                  </>
                )}
              </button>
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
          <div className="px-3 py-2 border-bottom" style={{ background: "#f8fafc", overflowX: "auto" }}>
            <div className="d-flex gap-2">
              {[
                { value: null, label: "All",            color: "#475569" },
                { value: 1,    label: "Pending",        color: "#f59e0b" },
                { value: 2,    label: "Material Issue", color: "#3b82f6" },
                { value: 3,    label: "In Production",  color: "#8b5cf6" },
                { value: 4,    label: "Completed",      color: "#10b981" },
                { value: 5,    label: "Cancelled",      color: "#ef4444" },
              ].map((tab) => {
                const isActive = statusTab === tab.value;
                return (
                  <button
                    key={String(tab.value)}
                    type="button"
                    onClick={() => {
                      setStatusTab(tab.value);
                      const resetPage = { skip: 0, take: pageState.take };
                      setPageState(resetPage);
                      fetchWorkOrders(resetPage, null, null, tab.value);
                    }}
                    style={{
                      padding: "6px 14px",
                      border: isActive ? `1.5px solid ${tab.color}` : "1.5px solid #e2e8f0",
                      borderRadius: 20,
                      background: isActive ? `${tab.color}14` : "#fff",
                      color: isActive ? tab.color : "#64748b",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
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
                onChange={handleTableChange}
                pagination={{
                  current: pageState.skip / pageState.take + 1,
                  pageSize: pageState.take,
                  total: totalCount,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "15", "25", "50"],
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
                    {rows.map((record) => {
                      const pct = Number(record.progress) || 0;
                      const progressColor = getProgressColor(pct);
                      const WO_STATUS_CONFIG = {
                        1: { label: "Pending",         bg: "#fff7ed", color: "#f59e0b", border: "#f59e0b30" },
                        2: { label: "Material Issue",  bg: "#eff6ff", color: "#3b82f6", border: "#3b82f630" },
                        3: { label: "In Production",   bg: "#f5f3ff", color: "#8b5cf6", border: "#8b5cf630" },
                        4: { label: "Completed",       bg: "#f0fdf4", color: "#10b981", border: "#10b98130" },
                        5: { label: "Cancelled",       bg: "#fef2f2", color: "#ef4444", border: "#ef444430" },
                      };
                      const st = WO_STATUS_CONFIG[record.status] || WO_STATUS_CONFIG[1];

                      return (
                        <div key={record.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                          <div
                            className="card h-100 border-0 shadow-sm"
                            style={{ borderRadius: 14, transition: "box-shadow .2s, transform .2s", overflow: "hidden" }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"; e.currentTarget.style.transform = "none"; }}
                          >
                            {/* top colour accent */}
                            <div style={{ height: 4, background: st.color }} />

                            <div className="card-body p-3">
                              {/* header */}
                              <div className="d-flex align-items-start justify-content-between mb-2">
                                <div>
                                  <span className="fw-bold" style={{ fontSize: 14, color: "#1e293b" }}>{record.orderId}</span>
                                  <div className="text-muted" style={{ fontSize: 11 }}>{record.createdAt}</div>
                                </div>
                                <span
                                  style={{
                                    background: st.bg,
                                    color: st.color,
                                    border: `1px solid ${st.border}`,
                                    borderRadius: 20,
                                    padding: "3px 10px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {st.label}
                                </span>
                              </div>

                              {/* product + variant */}
                              <div className="fw-semibold text-truncate" style={{ fontSize: 13, color: "#334155" }} title={record.finishedGood}>
                                {record.finishedGood}
                              </div>
                              {record.finishedGoodVariant && (
                                <div className="text-muted" style={{ fontSize: 12 }}>{record.finishedGoodVariant}</div>
                              )}

                              {/* customer */}
                              <div className="text-muted mt-1 mb-3" style={{ fontSize: 12 }}>
                                <i className="far fa-user me-1" />{record.customer}
                              </div>

                              {/* progress */}
                              <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                                  <span className="text-muted">Progress</span>
                                  <span className="fw-bold" style={{ color: progressColor }}>{pct}%</span>
                                </div>
                                <Progress
                                  percent={pct}
                                  showInfo={false}
                                  strokeColor={progressColor}
                                  trailColor="#e8edf5"
                                  size="small"
                                />
                              </div>

                              {/* meta */}
                              <div className="d-flex flex-wrap gap-2" style={{ fontSize: 11 }}>
                                <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: "#f1f5f9", color: "#475569" }}>
                                  <i className="far fa-calendar-alt" /> Due: {record.dueDate}
                                </span>
                                <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: "#f1f5f9", color: "#475569" }}>
                                  Planned: <strong>{new Intl.NumberFormat("en-IN").format(Number(record.plannedQty) || 0)}</strong>
                                </span>
                                {record.finalQty > 0 && (
                                  <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                                    Final: <strong>{new Intl.NumberFormat("en-IN").format(Number(record.finalQty))}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* footer actions */}
                            <div className="px-3 pb-3 pt-0 d-flex justify-content-end gap-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                              <Tooltip title="View">
                                <button type="button" className="border-0" onClick={() => openMaterialIssueModal(record)}
                                  style={{ width: 32, height: 32, borderRadius: "50%", background: "#eef4ff", color: "#2577ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                  <i className="far fa-eye" style={{ fontSize: 13 }} />
                                </button>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <button type="button" className="border-0" onClick={() => openEditModal(record)}
                                  style={{ width: 32, height: 32, borderRadius: "50%", background: "#edf9f1", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                  <i className="far fa-edit" style={{ fontSize: 13 }} />
                                </button>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <button type="button" className="border-0" onClick={() => openDeleteModal(record)}
                                  style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff1f2", color: "#ef4444", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                  <i className="far fa-trash-alt" style={{ fontSize: 13 }} />
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
        title={
          <span className="fw-semibold">
            {modalMode === "edit"
              ? "Edit Work Order"
              : formEntries.length > 1
                ? `Add Work Orders (${formEntries.length})`
                : "Add Work Order"}
          </span>
        }
        open={isAddModalOpen}
        onCancel={closeAddModal}
        footer={[
          <Button key="cancel" onClick={closeAddModal} disabled={saving || editWorkOrderLoading}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={saving}
            disabled={editWorkOrderLoading}
            onClick={modalMode === "edit" ? handleUpdate : handleSave}
          >
            {modalMode === "edit"
              ? "Update"
              : formEntries.length > 1
                ? `Save ${formEntries.length} Work Orders`
                : "Save"}
          </Button>,
        ]}
        width={980}
      >
        {editWorkOrderLoading ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
            <p className="mb-0">Loading work order details…</p>
          </div>
        ) : (
        <div className="pt-2">
          {formEntries.map((entry, entryIndex) => {
            const variants = variantsByIndex[entryIndex] || [];
            const variantsLoading = !!variantLoadingByIndex[entryIndex];
            const selectedSteps = getSelectedStepsForEntry(entry);
            const isMulti = formEntries.length > 1;
            return (
              <div
                key={entryIndex}
                style={{
                  border: isMulti ? "1px solid #e5e7eb" : "none",
                  borderRadius: 8,
                  padding: isMulti ? "16px" : "0",
                  marginBottom: isMulti && entryIndex < formEntries.length - 1 ? 16 : 0,
                  background: isMulti ? "#fafafa" : undefined,
                }}
              >
                {modalMode === "add" && isMulti && (
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-semibold" style={{ color: "#6161ff" }}>
                      Work Order #{entryIndex + 1}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => removeEntry(entryIndex)}
                      disabled={saving}
                    >
                      <i className="fas fa-trash me-1"></i>Remove
                    </button>
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Customer <span className="text-danger">*</span></label>
                    <CustomerSelect
                      value={entry.customer}
                      onChange={(option) => updateEntry(entryIndex, { customer: option || null })}
                      placeholder="Select Customer"
                      styles={boxSelectStyles}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Store <span className="text-danger">*</span></label>
                    <StoreSelect
                      value={entry.store}
                      onChange={(option) => updateEntry(entryIndex, { store: option || null })}
                      placeholder="Select Store"
                      styles={boxSelectStyles}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Finished Good <span className="text-danger">*</span></label>
                    <ProductSelect
                      value={entry.finishedGoodId}
                      selectedProductData={entry.finishedGoodData}
                      onChange={(option) => {
                        const nextProductId = option ? option.value : null;
                        updateEntry(entryIndex, {
                          finishedGoodId: nextProductId,
                          finishedGoodData: option?.productData || null,
                          finishedGoodVariantId: null,
                        });
                        setVariantsByIndex((prev) => ({ ...prev, [entryIndex]: [] }));
                        if (nextProductId) {
                          fetchFinishedGoodVariantsForEntry(nextProductId, entryIndex);
                        }
                      }}
                      placeholder="Select Finished Good"
                    />
                  </div>
                  {isVariantBased && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Finished Good Variant <span className="text-danger">*</span></label>
                      <Select
                        value={entry.finishedGoodVariantId}
                        onChange={(value) =>
                          setFormEntries((prev) =>
                            prev.map((e, i) => {
                              if (i !== entryIndex) return e;
                              const next = { ...e, finishedGoodVariantId: value };
                              const selectedVariant = variants.find(
                                (v) => String(v.value) === String(value)
                              );
                              if (selectedVariant) {
                                const variantWeightPerUnit = parseFloat(selectedVariant.weight_per_unit) || 0;
                                const variantUnit = selectedVariant.uomLabel || "kg";
                                const totalWeightValue = parseFloat(e.totalWeightValue);
                                if (
                                  Number.isFinite(totalWeightValue) &&
                                  totalWeightValue >= 0 &&
                                  variantWeightPerUnit > 0
                                ) {
                                  const converted = convertUnitValue(
                                    totalWeightValue,
                                    e.totalWeightUnit || "kg",
                                    variantUnit
                                  );
                                  if (converted !== null) {
                                    next.quantity = String(
                                      Number((converted / variantWeightPerUnit).toFixed(3))
                                    );
                                  }
                                }
                              }
                              return next;
                            })
                          )
                        }
                        options={variants}
                        placeholder={entry.finishedGoodId ? "Select Finished Good Variant" : "Select Finished Good first"}
                        loading={variantsLoading}
                        disabled={!entry.finishedGoodId}
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
                      value={entry.quantity}
                      onChange={(e) => updateEntry(entryIndex, { quantity: e.target.value })}
                      placeholder="Enter quantity"
                      style={{ height: "42px" }}
                    />
                  </div>
                  {isVariantBased && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Total Weight</label>
                      <div className="d-flex gap-2">
                        <Input
                          type="number"
                          min={0}
                          step="0.001"
                          value={entry.totalWeightValue ?? ""}
                          onChange={(e) =>
                            handleTotalWeightChange(entryIndex, "totalWeightValue", e.target.value)
                          }
                          placeholder="Enter total weight"
                          style={{ height: "42px", flex: 1 }}
                        />
                        <Select
                          value={entry.totalWeightUnit || "kg"}
                          onChange={(value) => handleTotalWeightChange(entryIndex, "totalWeightUnit", value)}
                          options={[
                            { value: "l", label: "litre" },
                            { value: "g", label: "gram" },
                            { value: "kg", label: "kg" },
                            { value: "pc", label: "Piece" },
                          ]}
                          size="large"
                          style={{ width: "110px" }}
                        />
                      </div>
                      {(() => {
                        const selectedVariant = variants.find(
                          (v) => String(v.value) === String(entry.finishedGoodVariantId)
                        );
                        if (!selectedVariant) return null;
                        return (
                          <small className="text-muted d-block mt-1">
                            Variant: {selectedVariant.weight_per_unit} {selectedVariant.uomLabel}
                            {" "}per unit
                          </small>
                        );
                      })()}
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Due Date <span className="text-danger">*</span></label>
                    <DatePicker
                      value={entry.dueDate}
                      onChange={(date) => updateEntry(entryIndex, { dueDate: date })}
                      format="DD/MM/YYYY"
                      placeholder="dd/mm/yyyy"
                      style={{ width: "100%", height: "42px" }}
                    />
                  </div>
                  {modalMode === "add" && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sell Order No.</label>
                      <SalesQuotationSelect
                        value={entry.sellOrder}
                        onChange={(selectedOption) => updateEntry(entryIndex, { sellOrder: selectedOption })}
                        placeholder="Select Sale Order No."
                        styles={boxSelectStyles}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                      />
                    </div>
                  )}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Work Order Steps (in sequence) <span className="text-danger">*</span></label>
                    <div className="row g-2">
                      {flowSteps.map((flowItem) => {
                        const stepId = flowItem.step_id;
                        const stepName = flowItem?.step?.name || `Step ${stepId}`;
                        const sc = flowItem?.step?.colour_code || "#2f76e9";
                        const stepSelectedIndex = (entry.workOrderStepIds || []).findIndex(
                          (id) => String(id) === String(stepId)
                        );
                        const isSelected = stepSelectedIndex >= 0;
                        return (
                          <div className="col-12 col-md-4" key={flowItem.id || stepId}>
                            <button
                              type="button"
                              className="w-100 text-start"
                              onClick={() => handleStepToggle(entryIndex, stepId)}
                              style={{
                                border: isSelected ? `2px solid ${sc}` : "1px solid #d9dee7",
                                background: isSelected ? `${sc}12` : "#f8f9fb",
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
                                  background: isSelected ? sc : "#eceff4",
                                  color: isSelected ? "#fff" : "#7f8a9a",
                                  fontWeight: 700,
                                  fontSize: 12,
                                }}
                              >
                                {isSelected ? stepSelectedIndex + 1 : "—"}
                              </span>
                              <span className="fw-semibold" style={{ color: isSelected ? sc : undefined }}>{stepName}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {selectedSteps.length > 0 && (
                      <div className="mt-2 small text-muted">
                        Sequence:{" "}
                        {selectedSteps.map((s, idx) => `${idx + 1}. ${s.name}`).join(" > ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {modalMode === "add" && formEntries.length < MAX_WORK_ORDERS && (
            <div className="mt-3 d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={addAnotherEntry}
                disabled={saving || editWorkOrderLoading}
              >
                <i className="fas fa-plus me-1"></i>Add Another Work Order
              </button>
              <span className="text-muted small">
                ({formEntries.length} of {MAX_WORK_ORDERS})
              </span>
            </div>
          )}
        </div>
        )}
      </Modal>

      <Modal
        title={
          <div>
            <div className="fw-semibold">
              {productionwithoutBOM ? "Material Issue" : "Material Issue (BOM)"}
            </div>
            <div className="small text-primary">
              {materialIssueWorkOrder?.orderId
                ? `Work Order: ${materialIssueWorkOrder.orderId}`
                : productionwithoutBOM
                ? "Work order material details"
                : "Work order BOM details"}
            </div>
            {(() => {
              const plannedQty = Number(materialIssueWorkOrder?.plannedQty) || 0;
              if (plannedQty <= 0) return null;
              const wpu = Number(materialIssueWorkOrder?.fgUOM?.weight_per_unit) || 0;
              const label = materialIssueWorkOrder?.fgUOM?.label || "";
              const totalText =
                wpu > 0
                  ? formatTotalRequired(plannedQty, wpu, label)
                  : `${plannedQty}${label ? ` ${label}` : ""}`;
              if (!totalText) return null;
              return (
                <div className="small text-primary">
                  Total Required: <strong>{totalText}</strong>
                </div>
              );
            })()}
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
            key="complete-production"
            type="primary"
            onClick={openCompleteProductionModal}
            disabled={
              !materialIssueWorkOrder?.id ||
              materialIssueWorkOrder?.status === 4 ||
              materialIssueLoading ||
              completingProduction
            }
          >
            Complete Production
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
              ...(productionwithoutBOM && isVariantBased
                ? [
                    {
                      title: "Variant",
                      key: "variant",
                      width: 180,
                      render: (_, record) => {
                        const options = Array.isArray(record?.availableVariants)
                          ? record.availableVariants
                          : [];
                        if (options.length === 0) {
                          return <span className="text-muted">—</span>;
                        }
                        const variantLocked =
                          !!record.materialIssueId ||
                          Number(record.issuedQty) > 0;
                        return (
                          <Select
                            size="middle"
                            style={{ width: "100%" }}
                            value={record.rmProductVariantId}
                            options={options.map((opt) => ({
                              value: opt.value,
                              label: opt.label,
                            }))}
                            onChange={(val) =>
                              handleMaterialIssueVariantChange(record.id, val)
                            }
                            disabled={
                              record.disabledIssue ||
                              editingMaterialIssueRowId === record.id ||
                              variantLocked
                            }
                          />
                        );
                      },
                    },
                  ]
                : []),
              ...(productionwithoutBOM
                ? []
                : [
                    {
                      title: "Required",
                      dataIndex: "requiredQty",
                      key: "required",
                      width: 140,
                      render: (value, record) => {
                        const weight = formatWeightFromUnits(value, record.weightPerUnit, record.unitLabel);
                        return (
                          <div>
                            <div className="fw-semibold">{Number.isFinite(Number(value)) ? Number(value) : 0} Units</div>
                            {weight && <div className="text-muted" style={{ fontSize: 11 }}>{weight}</div>}
                          </div>
                        );
                      },
                    },
                  ]),
              {
                title: "Issued",
                dataIndex: "issuedQty",
                key: "issued",
                width: 190,
                render: (value, record) => {
                  if (editingMaterialIssueRowId === record.id) {
                    const draftWeight = formatWeightFromUnits(materialIssueDraftQty, record.weightPerUnit, record.unitLabel);
                    return (
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            value={materialIssueDraftQty}
                            onChange={(e) => setMaterialIssueDraftQty(e.target.value)}
                            placeholder="Units"
                            style={{ width: 90, height: "34px" }}
                          />
                          <span className="fw-semibold">Units</span>
                        </div>
                        {draftWeight && (
                          <div className="text-muted mt-1" style={{ fontSize: 11 }}>{draftWeight}</div>
                        )}
                      </div>
                    );
                  }
                  const weight = formatWeightFromUnits(value, record.weightPerUnit, record.unitLabel);
                  return (
                    <div>
                      <div className="text-success fw-semibold">{Number.isFinite(Number(value)) ? Number(value) : 0} Units</div>
                      {weight && <div className="text-muted" style={{ fontSize: 11 }}>{weight}</div>}
                    </div>
                  );
                },
              },
              ...(productionwithoutBOM
                ? []
                : [
                    {
                      title: "Pending",
                      dataIndex: "pendingQty",
                      key: "pending",
                      width: 140,
                      render: (value, record) => {
                        const weight = formatWeightFromUnits(value, record.weightPerUnit, record.unitLabel);
                        return (
                          <div>
                            <div className="text-warning fw-semibold">{Number.isFinite(Number(value)) ? Number(value) : 0} Units</div>
                            {weight && <div className="text-muted" style={{ fontSize: 11 }}>{weight}</div>}
                          </div>
                        );
                      },
                    },
                  ]),
              {
                title: "Stock",
                dataIndex: "stockQty",
                key: "stock",
                width: 140,
                render: (value, record) => {
                  const weight = formatWeightFromUnits(value, record.weightPerUnit, record.unitLabel);
                  return (
                    <div>
                      <div className="fw-semibold">{Number.isFinite(Number(value)) ? Number(value) : 0} Units</div>
                      {weight && <div className="text-muted" style={{ fontSize: 11 }}>{weight}</div>}
                    </div>
                  );
                },
              },
              {
                title: "Store",
                dataIndex: "warehouseName",
                key: "warehouseName",
                width: 200,
                render: (name) =>
                  !name || name === "—" ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        background: "#f0fdf4",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                        borderRadius: 6,
                        fontWeight: 500,
                        fontSize: 11,
                        padding: "3px 8px",
                      }}
                    >
                      {name}
                    </span>
                  ),
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
                          <div className="d-flex gap-2">
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
                            {record.materialIssueId && (
                              <Popconfirm
                                title="Delete issued material"
                                description="Are you sure you want to remove this issued material record? This cannot be undone."
                                okText="Yes, delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true, loading: deletingMaterialIssueId === record.id }}
                                onConfirm={() => handleDeleteMaterialIssue(record)}
                                disabled={record.disabledIssue}
                              >
                                <button
                                  type="button"
                                  className="border-0"
                                  title="Remove issued material"
                                  disabled={record.disabledIssue || deletingMaterialIssueId === record.id}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: "#fff1f2",
                                    color: "#ef4444",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: record.disabledIssue ? 0.5 : 1,
                                  }}
                                >
                                  <i className="far fa-trash-alt" style={{ fontSize: 13 }} />
                                </button>
                              </Popconfirm>
                            )}
                          </div>
                        ),
                    },
                  ]),
            ]}
          />
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Button
            type="primary"
            onClick={completeMaterialIssue}
            loading={materialIssueCompleting}
            disabled={
              !materialIssueWorkOrder?.id ||
              materialIssueLoading ||
              materialIssueSubmittingId !== null ||
              materialIssueWorkOrder?.status === 3 ||
              materialIssueWorkOrder?.status === 4
            }
          >
            Complete Material Issue
          </Button>
        </div>

        <div className="mt-4">
          <h6 className="mb-1 fw-semibold">Manage Production</h6>
          <div className="small text-muted mb-2">
            Production Flow:{" "}
            {productionFlowRows.length > 0
              ? productionFlowRows.map((step) => step.processName).join(" -> ")
              : "N/A"}
          </div>
          <div className="bg_succes_table_head rounded_table">
            <Table
              rowKey="id"
              loading={materialIssueLoading}
              dataSource={productionFlowRows}
              pagination={false}
              locale={{ emptyText: "No production steps found." }}
              columns={[
                {
                  title: "Step",
                  dataIndex: "sequence",
                  key: "sequence",
                  width: 80,
                },
                {
                  title: "Process",
                  dataIndex: "processName",
                  key: "processName",
                  width: 180,
                  render: (value) => <span className="fw-semibold">{value}</span>,
                },
                {
                  title: "Status",
                  dataIndex: "statusLabel",
                  key: "statusLabel",
                  width: 170,
                  render: (value, record) =>
                    record.isCurrentStep || String(editingInProgressStepId) === String(record.id) ? (
                      <Select
                        value={Number(record?.status) || 1}
                        onChange={(nextStatus) =>
                          handleProductionStepDraftChange(record.id, "status", Number(nextStatus))
                        }
                        options={[
                          { value: 1, label: "Pending" },
                          { value: 2, label: "In-Progress" },
                          { value: 3, label: "Completed" },
                          { value: 4, label: "Skipped" },
                        ]}
                        style={{ width: 150 }}
                      />
                    ) : (
                      <label
                        className={`badge ${
                          value === "Completed"
                            ? "badge-outline-success"
                            : value === "In-progress"
                              ? "badge-outline-meantGreen"
                              : value === "Skipped"
                                ? "badge-outline-secondary"
                                : "badge-outline-yellowGreen"
                        } mb-0`}
                      >
                        {value}
                      </label>
                    ),
                },
                {
                  title: "UOM",
                  dataIndex: "uomId",
                  key: "uomId",
                  width: 170,
                  render: (value, record) => {
                    const isEditing = record.isCurrentStep || String(editingInProgressStepId) === String(record.id);
                    if (isEditing) {
                      return (
                        <Select
                          value={value ?? undefined}
                          onChange={(v) => handleProductionStepDraftChange(record.id, "uomId", v)}
                          options={uomOptions}
                          loading={uomLoading}
                          placeholder="Select UOM"
                          allowClear
                          style={{ width: "100%" }}
                        />
                      );
                    }
                    const uomEntry = uomList.find((u) => u.id === value);
                    return uomEntry
                      ? <span className="badge badge-outline-accent">{uomEntry.name} <span className="text-muted">({uomEntry.label})</span></span>
                      : <span className="text-muted">—</span>;
                  },
                },
                {
                  title: "Input Qty",
                  dataIndex: "inputQty",
                  key: "inputQty",
                  width: 150,
                  render: (value, record) =>
                    record.isCurrentStep || String(editingInProgressStepId) === String(record.id) ? (
                      <Input
                        type="number"
                        min={0}
                        value={value}
                        onChange={(e) => handleProductionStepDraftChange(record.id, "inputQty", e.target.value)}
                        placeholder="Enter qty"
                      />
                    ) : value === null || value === undefined || value === "" ? (
                      "-"
                    ) : (
                      value
                    ),
                },
                {
                  title: "Output Qty",
                  dataIndex: "outputQty",
                  key: "outputQty",
                  width: 150,
                  render: (value, record) =>
                    record.isCurrentStep || String(editingInProgressStepId) === String(record.id) ? (
                      <Input
                        type="number"
                        min={0}
                        value={value}
                        onChange={(e) => handleProductionStepDraftChange(record.id, "outputQty", e.target.value)}
                        placeholder="Enter qty"
                      />
                    ) : value === null || value === undefined || value === "" ? (
                      "-"
                    ) : (
                      value
                    ),
                },
                {
                  title: "Waste",
                  dataIndex: "wasteQty",
                  key: "wasteQty",
                  width: 100,
                  render: (value) => (value === null || value === undefined ? "-" : value),
                },
                {
                  title: "Yield %",
                  dataIndex: "yieldPercent",
                  key: "yieldPercent",
                  width: 120,
                  render: (value) =>
                    value === null || value === undefined ? (
                      "-"
                    ) : (
                      <span className="text-success fw-semibold">{value}%</span>
                    ),
                },
                {
                  title: "Action",
                  key: "action",
                  width: 170,
                  render: (_, record) =>
                    record.isCurrentStep ? (
                      <button
                        type="button"
                        className="btn btn-warning btn-sm"
                        onClick={() => submitProductionStepData(record)}
                        disabled={productionFlowSavingId === record.id}
                        style={{ minWidth: 72 }}
                      >
                        {productionFlowSavingId === record.id ? "Saving..." : "Save"}
                      </button>
                    ) : [2, 3].includes(Number(record?.status)) && String(editingInProgressStepId) === String(record.id) ? (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => submitProductionStepData(record)}
                          disabled={productionFlowSavingId === record.id}
                          style={{ minWidth: 72 }}
                        >
                          {productionFlowSavingId === record.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setEditingInProgressStepId(null)}
                          disabled={productionFlowSavingId === record.id}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : [2, 3].includes(Number(record?.status)) ? (
                      <button
                        type="button"
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => startInProgressStepEdit(record)}
                      >
                        Change
                      </button>
                    ) : (
                      <span className="text-muted">-</span>
                    ),
                },
              ]}
            />
          </div>
        </div>
      </Modal>

      <DeleteModal
        show={deleteModalShow}
        handleClose={closeDeleteModal}
        onDelete={handleDeleteWorkOrder}
        title="Delete Work Order"
        message={`Are you sure you want to delete work order ${deleteWorkOrder?.orderId || ""}? Once deleted, it cannot be recovered.`}
      />

      {/* ── Complete Production Modal ── */}
      <Modal
        title={<span className="fw-semibold">Complete Production</span>}
        open={completeProductionModalOpen}
        onCancel={closeCompleteProductionModal}
        footer={[
          <Button key="cancel" onClick={closeCompleteProductionModal} disabled={completingProduction}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" loading={completingProduction} onClick={handleCompleteProduction}>
            Confirm
          </Button>,
        ]}
        width={420}
      >
        <div className="pt-2">
          <p className="text-muted mb-2" style={{ fontSize: 13 }}>
            Planned Quantity: <strong>{new Intl.NumberFormat("en-IN").format(Number(materialIssueWorkOrder?.plannedQty) || 0)}</strong>
          </p>
          <label className="form-label fw-semibold">
            Final Quantity <span className="text-danger">*</span>
          </label>
          <Input
            type="number"
            min={1}
            max={Number(materialIssueWorkOrder?.plannedQty) || undefined}
            value={finalQty}
            onChange={(e) => setFinalQty(e.target.value)}
            placeholder="Enter final quantity"
            style={{ height: 42 }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default WorkOrders;