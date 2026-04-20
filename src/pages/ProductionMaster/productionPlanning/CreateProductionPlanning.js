import React, { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Input, InputNumber, Select, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import ProductSelect from "../../filterComponents/ProductSelect";
import { UserAuth } from "../../auth/Auth";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
import { generateWorkOrderNumber } from "../../../utils/productionHelper";

const { RangePicker } = DatePicker;

const SHIFT_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

const INITIAL_FORM = {
  wo_number: "",
  product_id: null,
  product_data: null,
  final_product_variant_id: null,
  required_quantity: null,
  planned_quantity: null,
  responsible_staff: "",
  planned_range: null,
  process_step: "",
  shift: [],
};

const Field = ({ label, required, error, children }) => (
  <div className="mb-3">
    <label className="form-label fw-semibold mb-1">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    {children}
    {error && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{error}</div>}
  </div>
);

function CreateProductionPlanning() {
  const navigate = useNavigate();
  const { id: planningId } = useParams();
  const isEdit = Boolean(planningId);
  const { isVariantBased } = UserAuth();

  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    wo_number: planningId ? "" : generateWorkOrderNumber("WO"),
  }));
  const [errors, setErrors] = useState({});
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPlanning, setLoadingPlanning] = useState(false);

  const variantOptions = useMemo(
    () =>
      variants.map((v) => {
        const uomLabel = v?.masterUOM?.label || v?.masterUOM?.name || "";
        const label = `${v?.weight_per_unit ?? ""} ${uomLabel}`.trim();
        return { value: v.id, label: label || `Variant #${v.id}` };
      }),
    [variants]
  );

  const fetchVariants = async (productId) => {
    if (!productId || !isVariantBased) {
      setVariants([]);
      return;
    }
    setLoadingVariants(true);
    try {
      const res = await PrivateAxios.get(`/product/variants/${productId}`);
      const list = Array.isArray(res.data?.data?.variants) ? res.data.data.variants : [];
      setVariants(list);
    } catch (error) {
      setVariants([]);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch variants.");
    } finally {
      setLoadingVariants(false);
    }
  };

  useEffect(() => {
    if (isVariantBased && form.product_id) {
      fetchVariants(form.product_id);
    } else {
      setVariants([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.product_id, isVariantBased]);

  useEffect(() => {
    if (!planningId) return;
    let cancelled = false;
    const loadPlanning = async () => {
      setLoadingPlanning(true);
      try {
        const res = await PrivateAxios.get(`/production/planning/${planningId}`);
        const data = res?.data?.data || {};
        if (cancelled) return;

        let shiftValue = [];
        if (Array.isArray(data.shift)) {
          shiftValue = data.shift;
        } else if (typeof data.shift === "string" && data.shift.trim()) {
          try {
            const parsed = JSON.parse(data.shift);
            shiftValue = Array.isArray(parsed) ? parsed : [];
          } catch {
            shiftValue = [];
          }
        }

        const productData = data.product
          ? {
              id: data.product.id,
              product_name: data.product.product_name,
              product_code: data.product.product_code,
            }
          : null;

        setForm({
          wo_number: data.wo_number || "",
          product_id: data.product_id ?? null,
          product_data: productData,
          final_product_variant_id: data.final_product_variant_id ?? null,
          required_quantity: data.required_qty ?? null,
          planned_quantity: data.planned_qty ?? null,
          responsible_staff: data.responsible_staff || "",
          planned_range:
            data.planned_start_date && data.planned_end_date
              ? [dayjs(data.planned_start_date), dayjs(data.planned_end_date)]
              : null,
          process_step: data.process_step || "",
          shift: shiftValue,
        });
      } catch (error) {
        if (!cancelled) {
          ErrorMessage(error?.response?.data?.message || "Failed to load production planning.");
        }
      } finally {
        if (!cancelled) setLoadingPlanning(false);
      }
    };
    loadPlanning();
    return () => {
      cancelled = true;
    };
  }, [planningId]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleProductChange = (option) => {
    setForm((prev) => ({
      ...prev,
      product_id: option?.value ?? null,
      product_data: option?.productData ?? null,
      final_product_variant_id: null,
    }));
    setErrors((prev) => ({ ...prev, product_id: undefined, final_product_variant_id: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.wo_number?.trim()) next.wo_number = "Work order number is required";
    if (!form.product_id) next.product_id = "Please select a product";
    if (isVariantBased && variantOptions.length > 0 && !form.final_product_variant_id) {
      next.final_product_variant_id = "Please select a variant";
    }
    if (form.required_quantity == null || Number(form.required_quantity) <= 0) {
      next.required_quantity = "Enter a quantity greater than 0";
    }
    if (form.planned_quantity == null || Number(form.planned_quantity) <= 0) {
      next.planned_quantity = "Enter a quantity greater than 0";
    }
    if (!form.planned_range || !form.planned_range[0] || !form.planned_range[1]) {
      next.planned_range = "Select plan duration";
    }
    if (!form.process_step?.trim()) next.process_step = "Process step is required";
    if (!form.responsible_staff?.trim()) next.responsible_staff = "Responsible person is required";
    if (!form.shift || form.shift.length === 0) next.shift = "Select at least one shift";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      wo_number: form.wo_number.trim(),
      product_id: form.product_id,
      final_product_variant_id: form.final_product_variant_id || null,
      required_quantity: Number(form.required_quantity),
      planned_quantity: Number(form.planned_quantity),
      responsible_staff: form.responsible_staff.trim(),
      planned_start_date: form.planned_range[0].format("YYYY-MM-DD"),
      planned_end_date: form.planned_range[1].format("YYYY-MM-DD"),
      process_step: form.process_step.trim(),
      shift: form.shift,
    };

    setSubmitting(true);
    try {
      const res = isEdit
        ? await PrivateAxios.put(`/production/planning/update/${planningId}`, payload)
        : await PrivateAxios.post("/production/planning/create", payload);
      SuccessMessage(
        res?.data?.message ||
          (isEdit ? "Production planning updated successfully" : "Production planning created successfully")
      );
      navigate("/production/planning-list");
    } catch (error) {
      ErrorMessage(
        error?.response?.data?.message ||
          (isEdit ? "Failed to update production planning." : "Failed to create production planning.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">{isEdit ? "Edit Production Planning" : "Create Production Planning"}</h3>
          <p className="text-muted mb-0">
            {isEdit ? "Update an existing production work order plan" : "Plan a new production work order"}
          </p>
        </div>
        <Button onClick={() => navigate("/production/planning-list")}>Back</Button>
      </div>

      <div className="card">
        <Spin spinning={loadingPlanning}>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <Field label="Work Order Number" required error={errors.wo_number}>
                <Input
                  value={form.wo_number}
                  onChange={(e) => updateField("wo_number", e.target.value)}
                  placeholder="WO-2026-123456"
                />
              </Field>
            </div>

            <div className="col-md-6">
              <Field label="FG Name" required error={errors.product_id}>
                <ProductSelect
                  value={form.product_id}
                  selectedProductData={form.product_data}
                  onChange={handleProductChange}
                  placeholder="Search and select product..."
                />
              </Field>
            </div>

            {isVariantBased && (
              <div className="col-md-6">
                <Field label="FG Variant" required error={errors.final_product_variant_id}>
                  <Select
                    value={form.final_product_variant_id || undefined}
                    onChange={(value) => updateField("final_product_variant_id", value)}
                    options={variantOptions}
                    placeholder={form.product_id ? "Select variant" : "Select FG Name first"}
                    loading={loadingVariants}
                    disabled={!form.product_id || loadingVariants}
                    style={{ width: "100%" }}
                    allowClear
                    notFoundContent={form.product_id ? "No variants available" : "Select product first"}
                  />
                </Field>
              </div>
            )}

            <div className="col-md-6">
              <Field label="Required Quantity" required error={errors.required_quantity}>
                <InputNumber
                  value={form.required_quantity}
                  onChange={(value) => updateField("required_quantity", value)}
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Field>
            </div>

            <div className="col-md-6">
              <Field label="Planned Quantity" required error={errors.planned_quantity}>
                <InputNumber
                  value={form.planned_quantity}
                  onChange={(value) => updateField("planned_quantity", value)}
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Field>
            </div>

            <div className="col-md-6">
              <Field label="Plan Duration" required error={errors.planned_range}>
                <RangePicker
                  value={form.planned_range}
                  onChange={(dates) => updateField("planned_range", dates)}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
              </Field>
            </div>

            <div className="col-md-6">
              <Field label="Shift" required error={errors.shift}>
                <Select
                  mode="multiple"
                  value={form.shift}
                  onChange={(value) => updateField("shift", value)}
                  options={SHIFT_OPTIONS}
                  placeholder="Select shifts"
                  style={{ width: "100%" }}
                  allowClear
                />
              </Field>
            </div>

            <div className="col-md-6">
              <Field label="Process Step" required error={errors.process_step}>
                <Input
                  value={form.process_step}
                  onChange={(e) => updateField("process_step", e.target.value)}
                  placeholder="e.g. Cutting"
                />
              </Field>
            </div>

            <div className="col-md-6">
              <Field label="Responsible Person" required error={errors.responsible_staff}>
                <Input
                  value={form.responsible_staff}
                  onChange={(e) => updateField("responsible_staff", e.target.value)}
                  placeholder="e.g. User ABC"
                />
              </Field>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button onClick={() => navigate("/production/planning-list")}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              {isEdit ? "Update Planning" : "Create Planning"}
            </Button>
          </div>
        </div>
        </Spin>
      </div>
    </div>
  );
}

export default CreateProductionPlanning;
