import React from 'react';
import { Modal } from 'react-bootstrap';
import { UserAuth } from '../auth/Auth';

const DocumentDetailsModal = ({
  show,
  handleClose
}) => {
    const { getGeneralSettingssymbol } =
            UserAuth();
  return (
    <Modal
      id="DocumentDetailsModal"
      show={show}
      onHide={handleClose}
      backdrop="static"
      centered
      size="xxxl"
    >
      <Modal.Header closeButton>
        <Modal.Title className="gth-modal-title">Document Payment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className='pb-1'>
        <h6 className="text-primary fw-bold mb-3">Document ID: 2647568</h6>
        <div className='card shadow-none border'>
          <div className='card-header gth-blue-light-bg'>
            <h5 className='card-title'>Document Details</h5>
          </div>
          <div className='card-body'>
            <div className="table-responsive mb-0">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>
                      <div className="min-width-200">Document Number</div>
                    </th>
                    <th>
                      <div className="min-width-200">Party</div>
                    </th>
                    <th>
                      <div className="min-width-200 text-end">Document Amount</div>
                    </th>
                    <th>
                      <div className="min-width-200 text-end">Payment Logged</div>
                    </th>
                    <th>
                      <div className="min-width-200 text-end">Set Off Amount</div>
                    </th>
                    <th>
                      <div className="min-width-150">Due Date</div>
                    </th>
                    <th>
                      <div className="min-width-150 text-end">Balance</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="min-width-200">INV00001 (PO: PO00001)</div>
                    </td>
                    <td>
                      <div className="min-width-200">Surya Demo Supplier</div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end">{getGeneralSettingssymbol} 3,650.00</div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end">{getGeneralSettingssymbol} 0.00</div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end">{getGeneralSettingssymbol} 0.00</div>
                    </td>
                    <td>
                      <div className="min-width-150">28/01/2025</div>
                    </td>
                    <td>
                      <div className="min-width-150 text-end">{getGeneralSettingssymbol} 3,650.00</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>            
          </div>
        </div>
        <div className='card shadow-none border'>
          <div className='card-header gth-blue-light-bg'>
            <h5 className='card-title'>Payment History</h5>
          </div>
          <div className='card-body'>            
            <div className="table-responsive mb-0">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>
                      <div className="min-width-200">Date</div>
                    </th>
                    <th>
                      <div className="min-width-200">Party</div>
                    </th>
                    <th>
                      <div className="min-width-200 text-end">Amount</div>
                    </th>
                    <th>
                      <div className="min-width-200">Bank</div>
                    </th>
                    <th>
                      <div className="min-width-200">Mode</div>
                    </th>
                    <th>
                      <div className="min-width-200">Reference</div>
                    </th>
                    <th>
                      <div className="min-width-200">Comment</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="min-width-200">01/01/2025</div>
                    </td>
                    <td>
                      <div className="min-width-200">Surya Demo Supplier</div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end">{getGeneralSettingssymbol} 1,200.00</div>
                    </td>
                    <td>
                      <div className="min-width-200">Axis Bank</div>
                    </td>
                    <td>
                      <div className="min-width-200">NEFT</div>
                    </td>
                    <td>
                      <div className="min-width-200">TRX123456</div>
                    </td>
                    <td>
                      <div className="min-width-200">Payment for January</div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="min-width-200">15/01/2025</div>
                    </td>
                    <td>
                      <div className="min-width-200">Surya Demo Supplier</div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end">{getGeneralSettingssymbol} 2,450.00</div>
                    </td>
                    <td>
                      <div className="min-width-200">HDFC Bank</div>
                    </td>
                    <td>
                      <div className="min-width-200">RTGS</div>
                    </td>
                    <td>
                      <div className="min-width-200">TRX789012</div>
                    </td>
                    <td>
                      <div className="min-width-200">Second payment installment</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DocumentDetailsModal;
