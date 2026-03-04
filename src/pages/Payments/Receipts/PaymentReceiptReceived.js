import React, { useState, useEffect, useRef } from "react";
import PaymentTopBar from "../PaymentTopBar";
import { Link } from "react-router-dom";
import PaymentReceiptsStatusBar from "../PaymentReceiptsStatusBar";
import { UserAuth } from "../../auth/Auth";

const PaymentReceiptReceived = () => {
    const { getGeneralSettingssymbol } =
        UserAuth();


    const payments = [
        {
            id: 1,
            company: "Acme Corp",
            voucherNumber: "VC123456",
            paymentDate: "13/01/2025",
            amount: 7500.0,
            excessAmount: 0.0,
            document: "Invoice_1234.pdf",
            bank: "Wells Fargo",
            mode: "Check",
            reference: "REF789",
            comment: "Payment for Q4 services",
            createdAt: "13/01/2025",
        },
        {
            id: 2,
            company: "Global Tech",
            voucherNumber: "VC654321",
            paymentDate: "15/01/2025",
            amount: 12000.0,
            excessAmount: 250.0,
            document: "Receipt_5678.pdf",
            bank: "Bank of America",
            mode: "Wire Transfer",
            reference: "REF123",
            comment: "Annual subscription",
            createdAt: "14/01/2025",
        },
        {
            id: 3,
            company: "NextGen Solutions",
            voucherNumber: "VC789123",
            paymentDate: "11/01/2025",
            amount: 5000.0,
            excessAmount: 100.0,
            document: "Bill_8910.pdf",
            bank: "Chase Bank",
            mode: "ACH",
            reference: "REF456",
            comment: "Maintenance charges",
            createdAt: "10/01/2025",
        },
        {
            id: 4,
            company: "Innovate Ltd.",
            voucherNumber: "VC456987",
            paymentDate: "09/01/2025",
            amount: 8750.0,
            excessAmount: 0.0,
            document: "Invoice_3456.pdf",
            bank: "Citi Bank",
            mode: "Credit Card",
            reference: "REF321",
            comment: "Project milestone payment",
            createdAt: "08/01/2025",
        },
        {
            id: 5,
            company: "Pioneer Enterprises",
            voucherNumber: "VC321654",
            paymentDate: "07/01/2025",
            amount: 6400.0,
            excessAmount: 150.0,
            document: "Receipt_1122.pdf",
            bank: "HSBC",
            mode: "Wire Transfer",
            reference: "REF987",
            comment: "Purchase of equipment",
            createdAt: "06/01/2025",
        },
    ];
    return (
        <>
            <PaymentTopBar />
            <PaymentReceiptsStatusBar />
            <div className="p-4">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-3">
                            <div className="payment_status_wrap">
                                <div className="bg-light item_payable">
                                    <h6>Received</h6>
                                    <p>
                                        {getGeneralSettingssymbol} 3,850.00
                                    </p>
                                </div>
                            </div>
                            <div className="d-flex gap-3 flex-wrap">
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
                                        <th>#</th>
                                        <th className="min-width-200">Company</th>
                                        <th className="min-width-200">Voucher Number</th>
                                        <th className="min-width-150">Payment Receive Date</th>
                                        <th className="min-width-150 text-end">Amount</th>
                                        <th className="min-width-150 text-end">Excess Amount</th>
                                        <th className="min-width-200">Document</th>
                                        <th className="min-width-200">Bank</th>
                                        <th className="min-width-200">Mode</th>
                                        <th className="min-width-200">Reference</th>
                                        <th className="min-width-200">Comment</th>
                                        <th className="min-width-200">Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={12}>
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
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{payment.id}</td>
                                            <td>{payment.company}</td>
                                            <td>{payment.voucherNumber}</td>
                                            <td>{payment.paymentDate}</td>
                                            <td className="text-end">{getGeneralSettingssymbol} {payment.amount.toFixed(2)}</td>
                                            <td className="text-end">{getGeneralSettingssymbol} {payment.excessAmount.toFixed(2)}</td>
                                            <td>
                                                <a href="#">
                                                    {payment.document}
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        id="Layer_1"
                                                        data-name="Layer 1"
                                                        viewBox="0 0 24 24"
                                                        width={14}
                                                        height={14}
                                                        fill="currentColor"
                                                        className='ms-2'
                                                    >
                                                        <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
                                                    </svg>
                                                </a>
                                            </td>
                                            <td>{payment.bank}</td>
                                            <td>{payment.mode}</td>
                                            <td>{payment.reference}</td>
                                            <td>{payment.comment}</td>
                                            <td>{payment.createdAt}</td>
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
                                            <div className="min-width-150">
                                                &nbsp;
                                            </div>
                                        </td>
                                        <td className="text-end fw-bold f-s-16">
                                            {getGeneralSettingssymbol}{" "}
                                            {payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                                        </td>
                                        <td className="text-end fw-bold f-s-16">
                                            {getGeneralSettingssymbol}{" "}
                                            {payments.reduce((sum, p) => sum + p.excessAmount, 0).toFixed(2)}
                                        </td>
                                        <td colSpan="6"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
};

export default PaymentReceiptReceived;