import React from 'react'
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../auth/Auth';
import Select from 'react-select';

function OpeningBalance() {
    const navigate = useNavigate();
    const { getGeneralSettingssymbol } = UserAuth();

    //select category
    const selectCategory = [
        { value: 'receivables', label: 'Receivables' },
        { value: 'payables', label: 'Payables' }
    ];
    const handleChangeSelectCategory = (selectedOption) => {
        console.log('Selected ', selectedOption);
    };
    //select category Type
    const selectCategoryType = [
        { value: 'all', label: 'All' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'partiallyPaid', label: 'Partially Paid' },
        { value: 'fullyPaid', label: 'Fully Paid' },
        { value: 'deleted', label: 'Deleted' }
    ];
    const handleChangeSelectCategoryType = (selectedOptionType) => {
        console.log('Selected ', selectedOptionType);
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
                                    Opening Balance
                                </span>
                            </div>
                            <div className='ms-auto'>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='card shadow-none border'>
                    <div className='card-body'>
                        <div className='row'>
                            <div className='col-lg-6'>
                                <div className='form-group'>
                                    <label className='form-label'>
                                        Upload opening balance
                                    </label>
                                    <input type='file' className='form-control' />
                                    <p className='mb-0 mt-1 text-muted'>Upload the Excel file (Opening Balance) to import data to the system.</p>
                                </div>
                            </div>
                            <div className='col-lg-6'>
                                <div className='form-group text-end'>
                                    <div className="dropdown">
                                        <button type='button' className="btn btn-warning dropdown-toggle" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                id="Layer_1"
                                                data-name="Layer 1"
                                                viewBox="0 0 24 24"
                                                width={14}
                                                height={14}
                                                fill="currentColor"
                                                className='me-1'
                                            >
                                                <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
                                            </svg>
                                            Download Template
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                            <li><a href='#' role='button' className="dropdown-item">Download Template Buyer</a></li>
                                            <li><a href="#" role='button' className="dropdown-item">Download Template Supplier</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12'>
                                <button type='submit' className='btn btn-success'>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='card shadow-none border'>
                    <div className='card-header'>
                        <h5 className='card-title'>List of opening balance</h5>
                    </div>
                    <div className='card-body'>
                        <div className='row'>
                            <div className='col-lg-4 col-md-6 col-sm-12 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Category</label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name="Category"
                                            options={selectCategory}
                                            placeholder="Select..."
                                            onChange={handleChangeSelectCategory}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-6 col-sm-12 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Type</label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name="Type"
                                            options={selectCategoryType}
                                            placeholder="Select..."
                                            onChange={handleChangeSelectCategoryType}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='fixed-table-wrapper fixed_first_col'>
                            <table className='table table-striped fixedTable-head'>
                                <thead>
                                    <tr>
                                        <th className='min-width-200'>Company</th>
                                        <th className='min-width-200'>Description</th>
                                        <th className='min-width-200'>Document Date</th>
                                        <th className='min-width-200'>Payment Due Date</th>
                                        <th className='min-width-150 text-end'>Amount to Pay</th>
                                        <th className='min-width-150 text-end'>Payment Logged</th>
                                        <th className='min-width-200'>Creation Date</th>
                                        <th className='min-width-200'>Last Modified At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='min-width-200'>ABC Pvt Ltd</td>
                                        <td className='min-width-200'>Purchase Invoice</td>
                                        <td className='min-width-200'>10/01/2025</td>
                                        <td className='min-width-200'>20/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}15,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}10,000.00</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                        <td className='min-width-200'>12/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>XYZ Enterprises</td>
                                        <td className='min-width-200'>Service Invoice</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                        <td className='min-width-200'>30/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}25,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}5,000.00</td>
                                        <td className='min-width-200'>10/01/2025</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>LMN Co.</td>
                                        <td className='min-width-200'>Expense Invoice</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}8,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}8,000.00</td>
                                        <td className='min-width-200'>01/01/2025</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>ABC Pvt Ltd</td>
                                        <td className='min-width-200'>Purchase Invoice</td>
                                        <td className='min-width-200'>10/01/2025</td>
                                        <td className='min-width-200'>20/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}15,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}10,000.00</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                        <td className='min-width-200'>12/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>XYZ Enterprises</td>
                                        <td className='min-width-200'>Service Invoice</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                        <td className='min-width-200'>30/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}25,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}5,000.00</td>
                                        <td className='min-width-200'>10/01/2025</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>LMN Co.</td>
                                        <td className='min-width-200'>Expense Invoice</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}8,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}8,000.00</td>
                                        <td className='min-width-200'>01/01/2025</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>ABC Pvt Ltd</td>
                                        <td className='min-width-200'>Purchase Invoice</td>
                                        <td className='min-width-200'>10/01/2025</td>
                                        <td className='min-width-200'>20/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}15,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}10,000.00</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                        <td className='min-width-200'>12/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>XYZ Enterprises</td>
                                        <td className='min-width-200'>Service Invoice</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                        <td className='min-width-200'>30/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}25,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}5,000.00</td>
                                        <td className='min-width-200'>10/01/2025</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>LMN Co.</td>
                                        <td className='min-width-200'>Expense Invoice</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}8,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}8,000.00</td>
                                        <td className='min-width-200'>01/01/2025</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>ABC Pvt Ltd</td>
                                        <td className='min-width-200'>Purchase Invoice</td>
                                        <td className='min-width-200'>10/01/2025</td>
                                        <td className='min-width-200'>20/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}15,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}10,000.00</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                        <td className='min-width-200'>12/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>XYZ Enterprises</td>
                                        <td className='min-width-200'>Service Invoice</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                        <td className='min-width-200'>30/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}25,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}5,000.00</td>
                                        <td className='min-width-200'>10/01/2025</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                    </tr>
                                    <tr>
                                        <td className='min-width-200'>LMN Co.</td>
                                        <td className='min-width-200'>Expense Invoice</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                        <td className='min-width-200'>15/01/2025</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}8,000.00</td>
                                        <td className='min-width-150 text-end'>{getGeneralSettingssymbol}8,000.00</td>
                                        <td className='min-width-200'>01/01/2025</td>
                                        <td className='min-width-200'>05/01/2025</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td className='min-width-200'>&nbsp;</td>
                                        <td className='min-width-200'>&nbsp;</td>
                                        <td className='min-width-200'>&nbsp;</td>
                                        <td className='min-width-200'>&nbsp;</td>
                                        <td className='min-width-150 text-end fw-bold f-s-16'>{getGeneralSettingssymbol}48,000.00</td>
                                        <td className='min-width-150 text-end fw-bold f-s-16'>{getGeneralSettingssymbol}23,000.00</td>
                                        <td className='min-width-200'>&nbsp;</td>
                                        <td className='min-width-200'>&nbsp;</td>
                                    </tr>
                                </tfoot>
                            </table>

                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default OpeningBalance