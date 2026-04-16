import React, { useEffect, useMemo, useRef, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Input, Modal, Select } from "antd";
import { UserAuth } from "../auth/Auth";
import { PrivateAxios } from "../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import Loader from "../landing/loder/Loader";
import ConfirmModal from "../CommonComponent/ConfirmModal";

function ManageProductionFlow() {
  const { user } = UserAuth();
  const companyId = user?.company_id ?? user?.company?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [steps, setSteps] = useState([]);
  /** Master catalog for the add-step modal only; main grid uses company steps. */
  const [masterSteps, setMasterSteps] = useState([]);
  const [selectedStepIds, setSelectedStepIds] = useState([]);
  const [savedStepIds, setSavedStepIds] = useState([]);

  const [addStepModalOpen, setAddStepModalOpen] = useState(false);
  const [modalStepId, setModalStepId] = useState(null);
  const [newStepName, setNewStepName] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");
  const [creatingStep, setCreatingStep] = useState(false);
  const [addingCompanyStep, setAddingCompanyStep] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stepPendingDelete, setStepPendingDelete] = useState(null);
  const [deletingStep, setDeletingStep] = useState(false);
  const deleteInFlightRef = useRef(false);

  const selectedSteps = useMemo(() => {
    const companyById = new Map(steps.map((s) => [String(s.id), s]));
    const masterById = new Map(masterSteps.map((s) => [String(s.id), s]));
    return selectedStepIds
      .map((id) => {
        const key = String(id);
        return companyById.get(key) || masterById.get(key);
      })
      .filter(Boolean);
  }, [steps, masterSteps, selectedStepIds]);

  const hasUnsavedChanges = useMemo(() => {
    if (selectedStepIds.length !== savedStepIds.length) return true;
    return selectedStepIds.some(
      (id, index) => String(id) !== String(savedStepIds[index])
    );
  }, [selectedStepIds, savedStepIds]);

  const fetchStepsAndFlow = async ({ showLoader = true } = {}) => {
    if (!companyId) {
      setLoading(false);
      ErrorMessage("Company not found for current user.");
      return;
    }
    if (showLoader) setLoading(true);
    try {
      const [stepsRes, flowRes] = await Promise.all([
        PrivateAxios.get(`/company/production-steps/${companyId}`),
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
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStepsAndFlow({ showLoader: true });
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

  const fetchMasterStepsOnly = async () => {
    const stepsRes = await PrivateAxios.get("/master/production-steps");
    const allSteps = Array.isArray(stepsRes.data?.data) ? stepsRes.data.data : [];
    const activeSteps = allSteps.filter((s) => Number(s?.is_active) === 1);
    setMasterSteps(activeSteps);
    return activeSteps;
  };

  const fetchCompanyStepsOnly = async () => {
    if (!companyId) return [];
    const stepsRes = await PrivateAxios.get(`/company/production-steps/${companyId}`);
    const allSteps = Array.isArray(stepsRes.data?.data) ? stepsRes.data.data : [];
    const activeSteps = allSteps.filter((s) => Number(s?.is_active) === 1);
    setSteps(activeSteps);
    return activeSteps;
  };

  const openAddStepModal = () => {
    setModalStepId(null);
    setNewStepName("");
    setNewStepDescription("");
    setAddStepModalOpen(true);
    void fetchMasterStepsOnly().catch(() => {});
  };

  const closeAddStepModal = () => {
    if (addingCompanyStep || creatingStep) return;
    setAddStepModalOpen(false);
    setModalStepId(null);
    setNewStepName("");
    setNewStepDescription("");
  };

  const appendStepToFlow = (stepId) => {
    if (stepId == null) return;
    setSelectedStepIds((prev) => {
      if (prev.some((id) => String(id) === String(stepId))) return prev;
      return [...prev, stepId];
    });
  };

  const handleAddSelectedStepFromModal = async () => {
    if (!companyId) {
      ErrorMessage("Company not found for current user.");
      return;
    }
    if (modalStepId == null) {
      ErrorMessage("Please select a production step.");
      return;
    }
    setAddingCompanyStep(true);
    try {
      const res = await PrivateAxios.post("/company/production-steps", {
        company_id: companyId,
        step_id: modalStepId,
      });
      SuccessMessage(res?.data?.message || "Step added to the company and sequence.");
      await fetchCompanyStepsOnly();
      appendStepToFlow(modalStepId);
      setAddStepModalOpen(false);
      setModalStepId(null);
      setNewStepName("");
      setNewStepDescription("");
    } catch (error) {
      ErrorMessage(
        error?.response?.data?.message || "Failed to add production step to company."
      );
    } finally {
      setAddingCompanyStep(false);
    }
  };

  const handleCreateMasterStep = async () => {
    if (!companyId) {
      ErrorMessage("Company not found for current user.");
      return;
    }
    const name = newStepName.trim();
    if (!name) {
      ErrorMessage("Please enter a step name.");
      return;
    }
    setCreatingStep(true);
    try {
      const res = await PrivateAxios.post("/master/production-steps", {
        name,
        description: newStepDescription.trim() || undefined,
        company_id: companyId,
      });
      SuccessMessage(res?.data?.message || "Production step added.");
      const masterList = await fetchMasterStepsOnly();
      const createdMaster = masterList.find((s) => String(s.name).trim() === name);
      const companyList = await fetchCompanyStepsOnly();
      const createdCompany =
        companyList.find((s) => String(s.name).trim() === name) ||
        (createdMaster && companyList.find((s) => String(s.id) === String(createdMaster.id)));
      const stepToAdd = createdCompany || createdMaster;
      if (stepToAdd) {
        setModalStepId(stepToAdd.id);
        appendStepToFlow(stepToAdd.id);
      }
      setNewStepName("");
      setNewStepDescription("");
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to add production step.");
    } finally {
      setCreatingStep(false);
    }
  };

  const openDeleteConfirm = (step) => {
    setStepPendingDelete({ id: step.id, name: step.name });
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    if (deletingStep) return;
    setDeleteConfirmOpen(false);
    setStepPendingDelete(null);
  };

  const handleConfirmDeleteStep = async () => {
    if (stepPendingDelete == null || deleteInFlightRef.current) return;
    deleteInFlightRef.current = true;
    setDeletingStep(true);
    try {
      const res = await PrivateAxios.delete(
        `/company/production-steps/${stepPendingDelete.id}`
      );
      SuccessMessage(res?.data?.message || "Production step deleted.");
      setDeleteConfirmOpen(false);
      setStepPendingDelete(null);
      await fetchStepsAndFlow({ showLoader: false });
    } catch (error) {
      ErrorMessage(
        error?.response?.data?.message || "Failed to delete production step."
      );
    } finally {
      deleteInFlightRef.current = false;
      setDeletingStep(false);
    }
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
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button onClick={openAddStepModal}>Add production step</Button>
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
                <div className="d-flex align-items-stretch gap-1">
                  <button
                    type="button"
                    onClick={() => handleStepToggle(step.id)}
                    className="flex-grow-1 text-start"
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
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${step.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteConfirm(step);
                    }}
                    style={{ alignSelf: "center", flexShrink: 0 }}
                  />
                </div>
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

      <Modal
        title="Add production step"
        open={addStepModalOpen}
        onCancel={closeAddStepModal}
        maskClosable={!addingCompanyStep && !creatingStep}
        footer={[
          <Button
            key="cancel"
            onClick={closeAddStepModal}
            disabled={addingCompanyStep || creatingStep}
          >
            Cancel
          </Button>,
          <Button
            key="add"
            type="primary"
            loading={addingCompanyStep}
            disabled={creatingStep}
            onClick={handleAddSelectedStepFromModal}
          >
            Add to sequence
          </Button>,
        ]}
        destroyOnClose
        width={520}
      >
        <div className="d-flex flex-column gap-3">
          <div>
            <label className="form-label mb-1 fw-semibold">Select step</label>
            <Select
              className="w-100"
              placeholder="Choose a production step"
              allowClear
              showSearch
              optionFilterProp="label"
              value={modalStepId}
              onChange={(v) => setModalStepId(v)}
              options={masterSteps.map((s) => ({
                value: s.id,
                label: s.name,
                title: s.description,
              }))}
            />
          </div>

          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: 12,
            }}
          >
            <div className="text-muted small mb-2">
              Step not in the list? Add it to master data — it will appear in the
              list and be added to your sequence.
            </div>
            <div className="d-flex flex-column gap-2">
              <Input
                placeholder="New step name"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
              />
              <Input.TextArea
                rows={2}
                placeholder="Description (optional)"
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
              />
              <Button
                type="default"
                loading={creatingStep}
                onClick={handleCreateMasterStep}
              >
                Create step and add to sequence
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        show={deleteConfirmOpen}
        handleClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDeleteStep}
        title="Delete production step"
        message={
          stepPendingDelete
            ? `Are you sure you want to delete "${stepPendingDelete.name}"? This removes it from your company.`
            : null
        }
        confirmLabel={deletingStep ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
      />
    </div>
  );
}

export default ManageProductionFlow;
