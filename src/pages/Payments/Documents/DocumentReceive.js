import React, { useState, useEffect, useRef } from "react";
import PaymentTopBar from "../PaymentTopBar";
import PaymentDocumentStatusBar from "../PaymentDocumentStatusBar";
import { Link } from "react-router-dom";
import { UserAuth } from "../../auth/Auth";
import DocumentDetailsModal from "../../CommonComponent/DocumentDetailsModal";

const DocumentReceive = () => {
  const { getGeneralSettingssymbol } =
    UserAuth();

  // Document Details Modal start
  const [showDocumentDetailsModal, setShowDocumentDetailsModal] = useState(false);
  const handleCloseDocumentDetailsModal = () => setShowDocumentDetailsModal(false);
  const handleShowDocumentDetailsModal = () => setShowDocumentDetailsModal(true);

  //Payment log button active / inactive
  const [isButtonPaymentLogDisabled, setIsButtonPaymentLogDisabled] = useState(true);
  const [checkedPaymentLogItems, setCheckedPaymentLogItems] = useState([]);

  const handlePaymentLogCheckboxChange = (index) => {
    const updatedCheckedPaymentLogItems = [...checkedPaymentLogItems];
    if (updatedCheckedPaymentLogItems.includes(index)) {
      // Remove index if already checked
      updatedCheckedPaymentLogItems.splice(updatedCheckedPaymentLogItems.indexOf(index), 1);
    } else {
      // Add index if not already checked
      updatedCheckedPaymentLogItems.push(index);
    }
    setCheckedPaymentLogItems(updatedCheckedPaymentLogItems);

    // Enable button if any checkbox is checked
    setIsButtonPaymentLogDisabled(updatedCheckedPaymentLogItems.length === 0);
  };

  return (
    <>
      <PaymentTopBar />
      <PaymentDocumentStatusBar />
      <div className="p-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-3">
              <div className="payment_status_wrap">
                <div className="bg-light item_payable">
                  <h6>Total Payable</h6>
                  <p>
                    {getGeneralSettingssymbol} 3,650.00
                  </p>
                </div>
                <div className="bg-light item_payable">
                  <h6>Total Receivable</h6>
                  <p>
                    {getGeneralSettingssymbol} 7,650.00
                  </p>
                </div>
                <div className="bg-light item_payable">
                  <h6>Overdue Payable</h6>
                  <p>
                    {getGeneralSettingssymbol} 0.00
                  </p>
                </div>
                <div className="bg-light item_payable">
                  <h6>Overdue Receivable</h6>
                  <p>
                    {getGeneralSettingssymbol} 0.00
                  </p>
                </div>
              </div>
              <div className="d-flex gap-3 flex-wrap">
                <Link
                  to="/payment/document/log-details"
                  className={`btn btn-warning ${isButtonPaymentLogDisabled ? "disabled" : ""}`}
                  style={{ pointerEvents: isButtonPaymentLogDisabled ? "none" : "auto" }}
                >
                  <i className="fas fa-history me-2"></i>
                  Payment Log
                </Link>
                <Link to="/opening-balance" className="btn btn-primary">
                  <i className="fas fa-balance-scale me-2"></i>
                  Opening Balance
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body p-0">
            <div className="fixed-table-wrapper fixed_secnd_col">
              <table className="table table-striped fixedTable-head">
                <thead>
                  <tr>
                    <th><div className="">#</div></th>
                    <th><div className="min-width-200">Company</div></th>
                    <th><div className="min-width-200">Document Type</div></th>
                    <th><div className="min-width-200">Document Number</div></th>
                    <th><div className="min-width-200">Document Date</div></th>
                    <th><div className="min-width-200">Payment Due Date</div></th>
                    <th><div className="min-width-200 text-end">Amount to Receive</div></th>
                    <th><div className="min-width-200 text-end">Amount Received</div></th>
                    <th><div className="min-width-200 text-end">Amount Set-Off</div></th>
                    <th><div className="min-width-200 text-end">Split Amount</div></th>
                    <th><div className="min-width-200 text-end">Advance Amount</div></th>
                    <th><div className="min-width-200">Last Modified At</div></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={13}>
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          width={60}
                          height={60}
                          x={0}
                          y={0}
                          viewBox="0 0 64 64"
                          xmlSpace="preserve"
                          fillRule="evenodd"
                          className=""
                        >
                          <g>
                            <path
                              fill="#cadcf0"
                              d="M27 9.677a1 1 0 0 1 1-1h22.554L62 21.37v15.953s.036 13.177-3.707 19.468a.995.995 0 0 1-.842.464c-3.827.003-26.548.003-32.899.003a1.002 1.002 0 0 1-.882-1.47C26.773 49.051 27 37.323 27 37.323z"
                              opacity={1}
                              data-original="#cadcf0"
                            />
                            <path
                              fill="#a4bbdb"
                              d="M62 37.323s.036 13.177-3.707 19.468a.995.995 0 0 1-.842.464c-3.827.003-26.548.003-32.899.003a1.002 1.002 0 0 1-.882-1.47l.039-.086c12.314.579 30.196-1.578 32.551-2.5 2.516-.985 5.69-10.437 5.739-15.755z"
                              opacity={1}
                              data-original="#a4bbdb"
                            />
                            <path
                              fill="#347bfa"
                              d="M62 21.37c-3.036-1.199-6.25-1.233-9.549-.724a.997.997 0 0 1-1.146-1.09c.362-3.694-.003-7.308-.751-10.879C55.392 12.269 59.212 16.496 62 21.37z"
                              opacity={1}
                              data-original="#347bfa"
                            />
                            <path
                              fill="#a4bbdb"
                              d="M27 12.068a12.495 12.495 0 0 1 7.314 3.577c4.103 4.103 4.769 10.349 1.999 15.148l1.647 5.223a.72.72 0 0 1-.177.727 9.24 9.24 0 0 0-.14.14.678.678 0 0 1-.682.166l-5.249-1.655a12.505 12.505 0 0 1-4.728 1.58c.012-.331.016-.513.016-.513z"
                              opacity={1}
                              data-original="#a4bbdb"
                            />
                            <path
                              fill="#e9f3fc"
                              d="M30.447 34.168c-4.588 2.649-10.56 2.012-14.483-1.911-4.683-4.683-4.683-12.287 0-16.97 4.683-4.684 12.287-4.684 16.971 0 3.922 3.922 4.559 9.894 1.911 14.482l1.574 4.994a.687.687 0 0 1-.169.694l-.134.134a.648.648 0 0 1-.652.16z"
                              opacity={1}
                              data-original="#e9f3fc"
                            />
                            <g fill="#347bfa">
                              <path
                                d="M22.333 20.182c-.022-.954.335-1.649.888-2.057.868-.64 2.164-.613 2.868.18.303.341.478.823.483 1.433.012 1.462-.675 2.317-1.346 3.203-.904 1.193-1.807 2.419-1.919 4.466a1 1 0 0 0 1.997.109c.085-1.555.829-2.461 1.516-3.367.92-1.213 1.768-2.423 1.752-4.427-.01-1.178-.403-2.087-.987-2.745-1.365-1.537-3.87-1.702-5.551-.462-1.008.744-1.741 1.976-1.7 3.714a1 1 0 0 0 1.999-.047z"
                                fill="#347bfa"
                                opacity={1}
                                data-original="#347bfa"
                              />
                              <circle
                                cx="24.212"
                                cy="30.944"
                                r="1.23"
                                fill="#347bfa"
                                opacity={1}
                                data-original="#347bfa"
                              />
                              <path
                                d="m12.217 7.364 4 5.032a1 1 0 0 0 1.566-1.244l-4-5.032a1 1 0 0 0-1.566 1.244zM1.502 9.867l10.452 6a1 1 0 1 0 .995-1.734l-10.451-6a1 1 0 1 0-.996 1.734zM3 21h7a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2z"
                                fill="#347bfa"
                                opacity={1}
                                data-original="#347bfa"
                              />
                            </g>
                          </g>
                        </svg>
                        <h6>No Data Found</h6>
                      </div>
                    </td>
                  </tr>
                  {[...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td>
                        <div className="">
                          <label className="custom-checkbox me-0 mb-0">
                            <input
                              type="checkbox"
                              onChange={() => handlePaymentLogCheckboxChange(index)}
                              checked={checkedPaymentLogItems.includes(index)}
                            />
                            <span className="checkmark" />
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="min-width-200">Surya Demo Supplier</div>
                      </td>
                      <td>
                        <div className="min-width-200">
                          <button
                            type="button"
                            className="link-btn text-primary fw-medium"
                            onClick={handleShowDocumentDetailsModal}
                          >
                            Invoice
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="min-width-200">
                          <div>
                            <Link to="/payment/document/tax-invoice/id" className="fw-medium">
                              INV00001 (PO: PO00001)
                              <span className="ms-2 text-primary">
                                <i className="fas fa-external-link-alt"></i>
                              </span>
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="min-width-200">13/01/2025</div>
                      </td>
                      <td>
                        <div className="min-width-200">28/01/2025</div>
                      </td>
                      <td>
                        <div className="min-width-200 text-end">
                          {getGeneralSettingssymbol} 3,650.00
                        </div>
                      </td>
                      <td>
                        <div className="min-width-200 text-end">
                          {getGeneralSettingssymbol} 0.00
                        </div>
                      </td>
                      <td>
                        <div className="min-width-200 text-end">
                          {getGeneralSettingssymbol} 0.00
                        </div>
                      </td>
                      <td>
                        <div className="min-width-200 text-end">
                          {getGeneralSettingssymbol} 0.00
                        </div>
                      </td>
                      <td>
                        <div className="min-width-200 text-end">
                          {getGeneralSettingssymbol} 0.00
                        </div>
                      </td>
                      <td>
                        <div className="min-width-200">13/01/2025, 10:42 am</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <div className="">
                        &nbsp;
                      </div>
                    </td>
                    <td><div className="min-width-200">&nbsp;</div></td>
                    <td>
                      <div className="min-width-200">
                        &nbsp;
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200">
                        &nbsp;
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200">
                        &nbsp;
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200">
                        &nbsp;
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end fw-bold f-s-16">
                        {getGeneralSettingssymbol} 3,650.00
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end fw-bold f-s-16">
                        {getGeneralSettingssymbol} 0.00
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end fw-bold f-s-16">
                        {getGeneralSettingssymbol} 0.00
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end fw-bold f-s-16">
                        {getGeneralSettingssymbol} 0.00
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200 text-end fw-bold f-s-16">
                        {getGeneralSettingssymbol} 0.00
                      </div>
                    </td>
                    <td>
                      <div className="min-width-200">&nbsp;</div>
                    </td>
                  </tr>
                </tfoot>
              </table>

            </div>
          </div>
        </div>
      </div>

      {/* Document Payment Details Modal Start*/}
      <DocumentDetailsModal
        show={showDocumentDetailsModal}
        handleClose={handleCloseDocumentDetailsModal}
      />
      {/* Document Payment Details Modal end*/}
    </>
  );
};

export default DocumentReceive;