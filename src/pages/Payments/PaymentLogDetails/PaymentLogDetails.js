import React from 'react'
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../auth/Auth';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

function PaymentLogDetails() {
  const navigate = useNavigate();
  const { getGeneralSettingssymbol } = UserAuth();

  //select payment Account
  const paymentAccountOptions = [
    { value: 'bank-001', label: 'HDFC Bank - Savings Account' },
    { value: 'bank-002', label: 'ICICI Bank - Current Account' },
    { value: 'wallet-001', label: 'Paytm Wallet' },
    { value: 'card-001', label: 'Visa Credit Card (****1234)' },
    { value: 'cash', label: 'Cash Payment' }
  ];

  const handlePaymentAccountChange = (selectedOption) => {
    console.log('Selected payment account:', selectedOption);
  };

  //select payment mode
  const paymentModeOptions = [
    { value: 'cheque', label: 'Cheque' },
    { value: 'rtgs', label: 'RTGS' },
    { value: 'neft', label: 'Neft' },
    { value: 'imps', label: 'IMPS' },
    { value: 'upi', label: 'UPI' },
    { value: 'cash', label: 'Cash' }
  ];

  const handlePaymentModeChange = (selectedOption) => {
    console.log('Selected payment mode:', selectedOption);
  };


  return (
    <>
      <div className='p-4'>
        <div className="card shadow-sm">
          <div className="card-body">
            <div className='d-flex align-items-center justify-content-between flex-wrap'>
              <div className='d-flex align-items-center'>
                <button
                  type="button"
                  className="link-btn text-primary me-3"
                  onClick={() => navigate(-1)} // Navigate back in history
                >
                  <i className="fas fa-arrow-left" />
                </button>
                <span className="fs-6 fw-bold me-3">
                  Payments Log
                </span>
              </div>
              <div className='ms-auto'>
              </div>
            </div>
          </div>
        </div>
        {/* each payment card */}
        <div className='card'>
          <div className='card-header'>
            <h5 className='card-title text-muted'>Payment To <span className='text-primary'>Surya Demo Supplier</span></h5>
          </div>
          <div className='card-body'>
            <div className='d-flex gap-3 flex-wrap mb-3'>
              <div className='gth-bg-success-light p-3 rounded-4 max-width-250'>
                <h6 className='f-s-14 text-muted mb-1'>Total Payment Amount</h6>
                <p className='fw-bold fs-4 text-teal-dark mb-0'>{getGeneralSettingssymbol} 3,600.00</p>
              </div>
              <div className='gth-bg-success-light p-3 rounded-4 max-width-250'>
                <h6 className='f-s-14 text-muted mb-1'>Counter Party Payment Amount</h6>
                <p className='fw-bold fs-4 text-teal-dark mb-0'>{getGeneralSettingssymbol} 3,600.00</p>
              </div>
            </div>
            <div class="fixed-table-wrapper mb-3 fixed_first_col">
              <table className="table table-striped align-middle fixedTable-head">
                <thead>
                  <tr>
                    <th className="min-width-200">Counter Party Name</th>
                    <th className="min-width-200">Document Type</th>
                    <th className="min-width-200">Document Number</th>
                    <th className="min-width-200">Creation Date</th>
                    <th className="min-width-200">Due Date</th>
                    <th className="min-width-200 text-end">Amount Due</th>
                    <th className="min-width-200">Payment Amount</th>
                    <th className="text-nowrap">Mark Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, index) => (
                    <tr key={index}>
                      <td>Surya Demo Supplier</td>
                      <td>Invoice</td>
                      <td>INV00001 (PO: PO00001)</td>
                      <td>13/01/2025</td>
                      <td>28/01/2025</td>
                      <td className='text-end'>{getGeneralSettingssymbol}3,600.00</td>
                      <td>
                        <input type="number" className="form-control" />
                      </td>
                      <td>
                        <label className="custom-checkbox me-0 mb-0">
                          <input
                            type="checkbox"
                          />
                          <span className="checkmark" />
                          <span className="text-"></span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
            <div className='card shadow-none border mb-0'>
              <div className='card-body'>
                <h6 className='pb-3 border-bottom mb-3'>Other Details</h6>
                <div className='row'>
                  <div className='col-lg-6'>
                    <div className='form-group'>
                      <label className='form-label date-label'>Payment Date <span className='text-exp-red'>*</span></label>
                      <div className="exp-datepicker-cont">
                        <span className="cal-icon"><i className="fas fa-calendar-alt"></i></span>
                        <DatePicker
                          dateFormat="dd/MM/YYYY"
                          placeholderText='Select Date'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='form-group'>
                      <label className='form-label'>Payment Account <span className='text-exp-red'>*</span></label>
                      <div className='custom-select-wrap'>
                        <Select
                          name="PaymentAccount"
                          options={paymentAccountOptions}
                          placeholder="Select Payment Account"
                          onChange={handlePaymentAccountChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='form-group'>
                      <label className='form-label'>Payment Mode</label>
                      <div className='custom-select-wrap'>
                        <Select
                          name="PaymentMode"
                          options={paymentModeOptions}
                          placeholder="Select Payment Mode"
                          onChange={handlePaymentModeChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='form-group'>
                      <label className='form-label'>Reference Number</label>
                      <input type="text" placeholder="Enter Reference Number" className="form-control" />
                    </div>
                  </div>
                  <div className='col-12'>
                    <div className='form-group'>
                      <label className='form-label'>Comment</label>
                      <textarea className="form-control" rows="4" placeholder="Enter Comment..."></textarea>
                    </div>
                  </div>
                  <div className='col-12 text-end'>
                    <button type='button' className='btn btn-success'>
                      Log Payment
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        {/* each payment card end*/}

        <div className='card'>
          <div className='card-header'>
            <h5 className='card-title text-muted'>Payment To <span className='text-primary'>Genpact Technologies</span></h5>
          </div>
          <div className='card-body'>
            <div className='d-flex gap-3 flex-wrap mb-3'>
              <div className='gth-bg-success-light p-3 rounded-4 max-width-250'>
                <h6 className='f-s-14 text-muted mb-1'>Total Payment Amount</h6>
                <p className='fw-bold fs-4 text-teal-dark mb-0'>{getGeneralSettingssymbol} 3,600.00</p>
              </div>
              <div className='gth-bg-success-light p-3 rounded-4 max-width-250'>
                <h6 className='f-s-14 text-muted mb-1'>Counter Party Payment Amount</h6>
                <p className='fw-bold fs-4 text-teal-dark mb-0'>{getGeneralSettingssymbol} 3,600.00</p>
              </div>
            </div>
            <div class="fixed-table-wrapper mb-3 fixed_first_col">
              <table className="table table-striped align-middle fixedTable-head">
                <thead>
                  <tr>
                    <th className="min-width-200">Counter Party Name</th>
                    <th className="min-width-200">Document Type</th>
                    <th className="min-width-200">Document Number</th>
                    <th className="min-width-200">Creation Date</th>
                    <th className="min-width-200">Due Date</th>
                    <th className="min-width-200 text-end">Amount Due</th>
                    <th className="min-width-200">Payment Amount</th>
                    <th className="text-nowrap">Mark Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, index) => (
                    <tr key={index}>
                      <td>Genpact Technologies</td>
                      <td>Invoice</td>
                      <td>INV00001 (PO: PO00001)</td>
                      <td>13/01/2025</td>
                      <td>28/01/2025</td>
                      <td className='text-end'>{getGeneralSettingssymbol}3,600.00</td>
                      <td>
                        <input type="number" className="form-control" />
                      </td>
                      <td>
                        <label className="custom-checkbox me-0 mb-0">
                          <input
                            type="checkbox"
                          />
                          <span className="checkmark" />
                          <span className="text-"></span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
            <div className='card shadow-none border mb-0'>
              <div className='card-body'>
                <h6 className='pb-3 border-bottom mb-3'>Other Details</h6>
                <div className='row'>
                  <div className='col-lg-6'>
                    <div className='form-group'>
                      <label className='form-label date-label'>Payment Date <span className='text-exp-red'>*</span></label>
                      <div className="exp-datepicker-cont">
                        <span className="cal-icon"><i className="fas fa-calendar-alt"></i></span>
                        <DatePicker
                          dateFormat="dd/MM/YYYY"
                          placeholderText='Select Date'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='form-group'>
                      <label className='form-label'>Payment Account <span className='text-exp-red'>*</span></label>
                      <div className='custom-select-wrap'>
                        <Select
                          name="PaymentAccount"
                          options={paymentAccountOptions}
                          placeholder="Select Payment Account"
                          onChange={handlePaymentAccountChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='form-group'>
                      <label className='form-label'>Payment Mode</label>
                      <div className='custom-select-wrap'>
                        <Select
                          name="PaymentMode"
                          options={paymentModeOptions}
                          placeholder="Select Payment Mode"
                          onChange={handlePaymentModeChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='form-group'>
                      <label className='form-label'>Reference Number</label>
                      <input type="text" placeholder="Enter Reference Number" className="form-control" />
                    </div>
                  </div>
                  <div className='col-12'>
                    <div className='form-group'>
                      <label className='form-label'>Comment</label>
                      <textarea className="form-control" rows="4" placeholder="Enter Comment..."></textarea>
                    </div>
                  </div>
                  <div className='col-12 text-end'>
                    <button type='button' className='btn btn-success'>
                      Log Payment
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

    </>
  )
}

export default PaymentLogDetails