import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import moment from "moment";
import { PrivateAxios } from "../../environment/AxiosInstance";

/** Get display name: prefer name, else email, else fallback */
function getRemarkAuthor(row) {
  if (!row) return null;
  const name = row.user_name ?? row.name ?? row.user?.name ?? row.created_by_name ?? row.created_by;
  const email = row.email ?? row.user?.email ?? row.user_email;
  if (name && String(name).trim()) return String(name).trim();
  if (email && String(email).trim()) return String(email).trim();
  return null;
}

/** Get formatted date from common API fields */
function getRemarkDate(row) {
  if (!row) return null;
  const raw =
    row.created_at ??
    row.updated_at ??
    row.date ??
    row.remark_date ??
    row.created_at_formatted;
  if (!raw) return null;
  const m = moment(raw);
  return m.isValid() ? m.format("DD MMM YYYY, hh:mm A") : raw;
}

/** Single remark block with author and date */
function RemarkBlock({ text, author, date, isHtml }) {
  const hasMeta = author || date;
  return (
    <div className="border rounded p-3 bg-light mb-3">
      {hasMeta && (
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 small text-muted mb-2 pb-2 border-bottom">
          {author && (
            <span className="d-inline-flex align-items-center">
              <i className="fas fa-user me-1" aria-hidden />
              <span>{author}</span>
            </span>
          )}
          {date && (
            <span className="d-inline-flex align-items-center">
              <i className="fas fa-calendar-alt me-1" aria-hidden />
              <span>{date}</span>
            </span>
          )}
        </div>
      )}
      <div className="remark-text">
        {isHtml ? (
          <div dangerouslySetInnerHTML={{ __html: text }} />
        ) : (
          <p className="mb-0">{text}</p>
        )}
      </div>
    </div>
  );
}

/**
 * PORemarksModalComponent - A reusable component to display Purchase Order remarks
 *
 * @param {boolean} show - Controls the visibility of the modal
 * @param {function} onHide - Callback when modal is closed
 * @param {number|string} purchaseOrderId - ID of the purchase order to fetch remarks for
 * @param {string} title - Optional custom title (defaults to "Management Remarks")
 * @param {string} apiEndpoint - Optional API endpoint (defaults to "/purchase/getremarks/")
 */
function PORemarksModalComponent({
  show,
  onHide,
  purchaseOrderId,
  title = "Management Remarks",
  apiEndpoint = "/purchase/getremarks/",
}) {
  const [remarks, setRemarks] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && purchaseOrderId) {
      fetchRemarks();
    } else {
      setRemarks(null);
    }
  }, [show, purchaseOrderId]);

  const fetchRemarks = async () => {
    if (!purchaseOrderId) return;
    setLoading(true);
    try {
      const response = await PrivateAxios.get(`${apiEndpoint}${purchaseOrderId}`);
      if (response.status === 200) {
        setRemarks(response.data);
      }
    } catch (error) {
      console.error("There was an error fetching the remarks!", error);
      setRemarks(null);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (title !== "Management Remarks") return title;
    if (remarks?.remark?.reference_number) return remarks.remark.reference_number;
    return "Management Remarks";
  };

  const renderRemarksContent = () => {
    if (loading) {
      return (
        <div className="text-center py-4 text-muted">
          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          Loading remarks...
        </div>
      );
    }

    if (!remarks) {
      return (
        <p className="mb-0 text-muted text-center py-3">No remarks available.</p>
      );
    }

    // Array of remark objects
    if (Array.isArray(remarks)) {
      if (remarks.length === 0) {
        return <p className="mb-0 text-muted text-center py-3">No remarks available.</p>;
      }
      return (
        <>
          {remarks.map((row) => {
            const text = row.remarks ?? row.remark ?? row.comment ?? "";
            const author = getRemarkAuthor(row);
            const date = getRemarkDate(row);
            const isHtml = typeof text === "string" && text.includes("<") && text.includes(">");
            return (
              <RemarkBlock
                key={row.id ?? Math.random()}
                text={text}
                author={author}
                date={date}
                isHtml={isHtml}
              />
            );
          })}
        </>
      );
    }

    // Single object with .remarks string
    if (remarks.remarks) {
      if (typeof remarks.remarks !== "string" || remarks.remarks.trim() === "") {
        return <p className="mb-0 text-muted text-center py-3">No remarks available.</p>;
      }
      const author = getRemarkAuthor(remarks);
      const date = getRemarkDate(remarks);
      const isHtml =
        remarks.remarks.includes("<") && remarks.remarks.includes(">");
      return (
        <RemarkBlock
          text={remarks.remarks}
          author={author}
          date={date}
          isHtml={isHtml}
        />
      );
    }

    // Nested remarks.data array
    if (remarks.data && Array.isArray(remarks.data)) {
      if (remarks.data.length === 0) {
        return <p className="mb-0 text-muted text-center py-3">No remarks available.</p>;
      }
      return (
        <>
          {remarks.data.map((row) => {
            const text = row.remarks ?? row.remark ?? row.comment ?? "";
            const author = getRemarkAuthor(row);
            const date = getRemarkDate(row);
            const isHtml = typeof text === "string" && text.includes("<") && text.includes(">");
            return (
              <RemarkBlock
                key={row.id ?? Math.random()}
                text={text}
                author={author}
                date={date}
                isHtml={isHtml}
              />
            );
          })}
        </>
      );
    }

    return <p className="mb-0 text-muted text-center py-3">No remarks available.</p>;
  };

  return (
    <Modal
      size="md"
      centered
      backdrop="static"
      keyboard={false}
      show={show}
      onHide={onHide}
      aria-labelledby="po-remarks-modal-title"
    >
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title id="po-remarks-modal-title" className="mb-0 fw-semibold">
          {getModalTitle()}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">{renderRemarksContent()}</Modal.Body>
    </Modal>
  );
}

export default PORemarksModalComponent;
