import React, { useEffect, useState } from "react";
import { Alert, Button, Modal } from "antd";
import moment from "moment";
import { PrivateAxios } from "../../environment/AxiosInstance";
import Loader from "../../environment/Loader";

function SaleOrderRemarksModal({
  open,
  onClose,
  saleOrderId,
  saleOrderReferenceNumber,
}) {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRemarks = async () => {
      if (!open || !saleOrderId) return;
      setLoading(true);
      setError("");
      setRemarks([]);
      try {
        const response = await PrivateAxios.get(
          `sales/sale-order-remarks/${saleOrderId}`
        );
        if (response?.data?.status) {
          setRemarks(Array.isArray(response?.data?.data) ? response.data.data : []);
        } else {
          setError(response?.data?.message || "Unable to fetch remarks.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to fetch sale order remarks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRemarks();
  }, [open, saleOrderId]);

  const handleClose = () => {
    setRemarks([]);
    setError("");
    setLoading(false);
    onClose?.();
  };

  return (
    <Modal
      title={`Sale Order Remarks${saleOrderReferenceNumber ? ` (${saleOrderReferenceNumber})` : saleOrderId ? ` (#${saleOrderId})` : ""}`}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
      ]}
      width={760}
      destroyOnHidden
    >
      {loading ? (
        <div className="py-4 d-flex justify-content-center">
          <Loader />
        </div>
      ) : error ? (
        <Alert type="error" showIcon message={error} />
      ) : remarks.length === 0 ? (
        <Alert type="info" showIcon message="No remarks found for this sale order." />
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

export default SaleOrderRemarksModal;
