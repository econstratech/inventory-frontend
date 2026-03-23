import React, { useEffect, useState } from "react";
import { Alert, Button, Modal } from "antd";
import moment from "moment";
import { PrivateAxios } from "../../environment/AxiosInstance";
import Loader from "../../environment/Loader";

function PurchaseOrderRemarksModal({
  show,
  onHide,
  purchaseOrderId,
  purchaseOrderReferenceNumber,
}) {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRemarks = async () => {
      if (!show || !purchaseOrderId) return;
      setLoading(true);
      setError("");
      setRemarks([]);
      try {
        const response = await PrivateAxios.get(
          `purchase/getremarks/${purchaseOrderId}`
        );
        if (response?.data?.status) {
          setRemarks(Array.isArray(response?.data?.data) ? response.data.data : []);
        } else {
          setError(response?.data?.message || "Unable to fetch remarks.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to fetch purchase order remarks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRemarks();
  }, [show, purchaseOrderId]);

  const handleClose = () => {
    setRemarks([]);
    setError("");
    setLoading(false);
    onHide?.();
  };

  return (
    <Modal
      title={`Purchase Order Remarks${purchaseOrderReferenceNumber ? ` (${purchaseOrderReferenceNumber})` : purchaseOrderId ? ` (#${purchaseOrderId})` : ""}`}
      open={show}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
      ]}
      width={760}
      destroyOnClose
    >
      {loading ? (
        <div className="py-4 d-flex justify-content-center">
          <Loader />
        </div>
      ) : error ? (
        <Alert type="error" showIcon message={error} />
      ) : remarks.length === 0 ? (
        <Alert type="info" showIcon message="No remarks found for this purchase order." />
      ) : (
        <div className="d-flex flex-column gap-3">
          {remarks.map((item) => (
            <div key={item.id} className="border rounded p-3 bg-light">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                <div>
                  <div className="fw-semibold">{item.user?.name || "Unknown User"}</div>
                  {/* <small className="text-muted">{item.user?.email || "N/A"}</small> */}
                </div>
                <small className="text-muted">
                  {item.created_at
                    ? moment(item.created_at).format("DD/MM/YYYY hh:mm A")
                    : "N/A"}
                </small>
              </div>
              <div>{item.remarks || "-"}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default PurchaseOrderRemarksModal;
