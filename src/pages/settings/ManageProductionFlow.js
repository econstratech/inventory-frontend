import React, { useEffect, useMemo, useState } from "react";
import { Button, Card } from "antd";
import { UserAuth } from "../auth/Auth";
import { PrivateAxios } from "../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import Loader from "../landing/loder/Loader";

function ManageProductionFlow() {
  const { user } = UserAuth();
  const companyId = user?.company_id ?? user?.company?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [steps, setSteps] = useState([]);
  const [selectedStepIds, setSelectedStepIds] = useState([]);
  const [savedStepIds, setSavedStepIds] = useState([]);

  const selectedSteps = useMemo(() => {
    const byId = new Map(steps.map((s) => [String(s.id), s]));
    return selectedStepIds
      .map((id) => byId.get(String(id)))
      .filter(Boolean);
  }, [steps, selectedStepIds]);

  const hasUnsavedChanges = useMemo(() => {
    if (selectedStepIds.length !== savedStepIds.length) return true;
    return selectedStepIds.some(
      (id, index) => String(id) !== String(savedStepIds[index])
    );
  }, [selectedStepIds, savedStepIds]);

  const fetchStepsAndFlow = async () => {
    if (!companyId) {
      setLoading(false);
      ErrorMessage("Company not found for current user.");
      return;
    }
    setLoading(true);
    try {
      const [stepsRes, flowRes] = await Promise.all([
        PrivateAxios.get("/master/production-steps"),
        PrivateAxios.get(`/company/get-company-production-flow/${companyId}`),
      ]);

      const allSteps = Array.isArray(stepsRes.data?.data) ? stepsRes.data.data : [];
      const activeSteps = allSteps.filter((s) => Number(s?.is_active) === 1);
      setSteps(activeSteps);

      const savedFlow = Array.isArray(flowRes.data?.data) ? flowRes.data.data : [];
      const orderedStepIds = savedFlow
        .slice()
        .sort((a, b) => Number(a.sequence) - Number(b.sequence))
        .map((item) => item.step_id)
        .filter((id) => activeSteps.some((s) => String(s.id) === String(id)));

      setSelectedStepIds(orderedStepIds);
      setSavedStepIds(orderedStepIds);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to load production flow data.");
      setSteps([]);
      setSelectedStepIds([]);
      setSavedStepIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStepsAndFlow();
  }, [companyId]);

  const handleStepToggle = (stepId) => {
    setSelectedStepIds((prev) => {
      const exists = prev.some((id) => String(id) === String(stepId));
      if (exists) return prev.filter((id) => String(id) !== String(stepId));
      return [...prev, stepId];
    });
  };

  const handleSave = async () => {
    if (!companyId) {
      ErrorMessage("Company not found for current user.");
      return;
    }
    if (selectedStepIds.length === 0) {
      ErrorMessage("Please select at least one production step.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        company_id: companyId,
        steps: selectedStepIds.map((id, index) => ({
          id,
          sequence: index + 1,
        })),
      };
      const res = await PrivateAxios.post("/company/create-company-production-flow", payload);
      SuccessMessage(res?.data?.message || "Production flow saved successfully.");
      setSavedStepIds(selectedStepIds);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to save production flow.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedStepIds(savedStepIds);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <Card bordered={false} className="shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h4 className="mb-1">Select Production Processes (in order)</h4>
            <p className="text-muted mb-0">
              Select steps in sequence. Click again to remove and re-order automatically.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              onClick={handleReset}
              disabled={!hasUnsavedChanges || saving}
            >
              Reset
            </Button>
            <Button type="primary" loading={saving} onClick={handleSave}>
              Save Flow
            </Button>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {steps.map((step) => {
            const selectedIndex = selectedStepIds.findIndex(
              (id) => String(id) === String(step.id)
            );
            const isSelected = selectedIndex >= 0;

            return (
              <div className="col-12 col-md-6" key={step.id}>
                <button
                  type="button"
                  onClick={() => handleStepToggle(step.id)}
                  className="w-100 text-start"
                  style={{
                    border: isSelected ? "2px solid #2577ff" : "2px solid #d9dee7",
                    background: isSelected ? "#eef4ff" : "#f8f9fb",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: isSelected ? "#fff" : "#7f8a9a",
                        background: isSelected ? "#2f76e9" : "#eceff4",
                      }}
                    >
                      {isSelected ? selectedIndex + 1 : "—"}
                    </span>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: isSelected ? "#1d4fd8" : "#4a5568",
                      }}
                    >
                      {step.name}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: "#e9eff8",
            borderRadius: "14px",
            padding: "14px 16px",
          }}
        >
          <div style={{ color: "#1f58d6", fontWeight: 700, marginBottom: 10 }}>
            Production Flow:
          </div>
          {selectedSteps.length > 0 ? (
            <div className="d-flex flex-wrap align-items-center gap-2">
              {selectedSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <span
                    className="d-inline-flex align-items-center"
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "#2f76e9",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {index + 1}. {step.name}
                  </span>
                  {index !== selectedSteps.length - 1 && (
                    <span style={{ color: "#2f76e9", fontWeight: 700, fontSize: 20 }}>
                      →
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-muted">No production step selected.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ManageProductionFlow;
