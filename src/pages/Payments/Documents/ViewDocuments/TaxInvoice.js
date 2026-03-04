import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserAuth } from "../../../auth/Auth";
import { Tooltip } from "antd";
import { PrivateAxios } from "../../../../environment/AxiosInstance";
import { format } from "date-fns";
import { toWords } from "number-to-words";

function TaxInvoice() {
  const navigate = useNavigate();
  const { getGeneralSettingssymbol, getGeneralSettingsSignature } = UserAuth();
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchInvoice = async () => {
    try {
      const response = await PrivateAxios.get(`/sales/invoice/${id}`);
      console.log(response);
      setInvoice(response.data);
    } catch (error) {
      console.error("Failed to fetch invoice", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const convertToCurrencyWords = (amount) => {
    const [rupeesStr, paiseStr] = Number(amount).toFixed(2).split(".");
    const rupees = parseInt(rupeesStr, 10);
    const paise = parseInt(paiseStr, 10);

    const rupeeWords = toWords(rupees);
    const paiseWords = paise > 0 ? toWords(paise) : "zero";

    return `${capitalize(rupeeWords)} Rupees and ${capitalize(
      paiseWords
    )} Paise Only`;
  };

  const capitalize = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());

  const printRef = useRef();

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // to re-bind events and reload page
  };
  return (
    <>
      <div className="p-4">
        <div className="row justify-content-center">
          <div className="col-lg-12 col-md-12 col-sm-12 position-relative">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <button
                      type="button"
                      className="link-btn text-primary me-1"
                      onClick={() => navigate(-1)} // Navigate back in history
                    >
                      <i className="fas fa-arrow-left" />
                    </button>
                    <span className="fs-6 fw-bold me-1">
                      {invoice?.[0]?.invoice_number}
                    </span>
                    <label className="mb-0 badge exp-badge-info-light rounded-pill">
                      CREATED
                    </label>
                  </div>
                  {/* <div className="ms-auto">
                    <Link
                      to="/transaction/transaction-details/id"
                      role="button"
                      className="btn btn-outline-success"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        id="Layer_1"
                        data-name="Layer 1"
                        viewBox="0 0 24 24"
                        width={14}
                        height={14}
                        fill="currentColor"
                        className="me-2"
                      >
                        <path d="M21,15H9.83c-.8,0-1.55-.31-2.12-.88l-1.42-1.41c-.19-.19-.29-.44-.29-.71s.11-.52,.29-.71l1.42-1.41c.57-.57,1.32-.88,2.12-.88h11.17c1.65,0,3,1.35,3,3s-1.35,3-3,3Zm-3-9H9.83c-.8,0-1.55-.31-2.12-.88l-1.42-1.41c-.19-.19-.29-.44-.29-.71s.11-.52,.29-.71l1.42-1.41c.57-.57,1.32-.88,2.12-.88h8.17c1.65,0,3,1.35,3,3s-1.35,3-3,3Zm-2,18h-6.17c-.8,0-1.55-.31-2.12-.88l-1.42-1.41c-.19-.19-.29-.44-.29-.71s.11-.52,.29-.71l1.42-1.41c.57-.57,1.32-.88,2.12-.88h6.17c1.65,0,3,1.35,3,3s-1.35,3-3,3ZM2,19c-1.1,0-2,.9-2,2s.9,2,2,2,2-.9,2-2-.9-2-2-2Zm0-9c-1.1,0-2,.9-2,2s.9,2,2,2,2-.9,2-2-.9-2-2-2ZM2,1C.9,1,0,1.9,0,3s.9,2,2,2,2-.9,2-2S3.1,1,2,1Z" />
                      </svg>
                      Go to Transaction
                    </Link>
                  </div> */}
                </div>
              </div>
            </div>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="card-title">Tax Invoice Details</h5>
                  <Tooltip title="Print">
                    <button
                      type="button"
                      className="btn icon-btn w-fit-content"
                      onClick={handlePrint}
                    >
                      <i className="fas fa-print"></i>
                    </button>
                  </Tooltip>
                </div>
                <div className="print-area" ref={printRef} id="print-section">
                  <div className="table-responsive">
                    <table
                      cellPadding={0}
                      cellSpacing={0}
                      border={0}
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              cellPadding={10}
                              cellSpacing={0}
                              border={0}
                              width="100%"
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <h4 style={{ marginBottom: 0 }}>
                                      Tax Invoice
                                    </h4>
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      version="1.1"
                                      xmlnsXlink="http://www.w3.org/1999/xlink"
                                      width={50}
                                      height={50}
                                      x={0}
                                      y={0}
                                      viewBox="0 0 32 32"
                                      xmlSpace="preserve"
                                      className=""
                                    >
                                      <g>
                                        <path
                                          d="M4 10a1 1 0 0 0-1 1v16h5V10zm3 14H5v-2h2zm0-4H5v-2h2zm0-4H5v-2h2zm21-6h-4v17h5V11a1 1 0 0 0-1-1zm-1 14h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zM22 2H10a1 1 0 0 0-1 1v24h14V3a1 1 0 0 0-1-1zm-7 22h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zm0-4h-2V6h2zm4 16h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zm0-4h-2v-2h2zm0-4h-2V6h2zm11 22H2v-2h28z"
                                          data-name="97 Office Building, Block Apartment, Buildings, Hotel, Offices"
                                          fill="#d4d4d4"
                                          opacity={1}
                                          data-original="#000000"
                                          className=""
                                        />
                                      </g>
                                    </svg>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              cellPadding={10}
                              cellSpacing={0}
                              border={0}
                              width="100%"
                            >
                              <tr>
                                <td
                                  style={{
                                    minWidth: "300px",
                                    borderTop: "1px solid rgb(219, 219, 219)",
                                    verticalAlign: "top",
                                  }}
                                >
                                  <h6
                                    style={{
                                      fontWeight: "bold",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    Invoice From
                                  </h6>
                                  <p style={{ margin: 0, fontWeight: "bold" }}>
                                    {
                                      invoice?.[0]?.purchase?.companyManagement
                                        ?.company_name
                                    }
                                  </p>

                                  <p style={{ margin: 0 }}>
                                    {
                                      invoice?.[0]?.purchase?.companyManagement
                                        ?.address
                                    }
                                  </p>

                                  <p style={{ margin: 0 }}>
                                    <b>Contact No</b>:{" "}
                                    {
                                      invoice?.[0]?.purchase?.companyManagement
                                        ?.company_phone
                                    }
                                  </p>
                                  <p style={{ margin: 0 }}>
                                    <b>GSTIN</b>:{" "}
                                    {
                                      invoice?.[0]?.purchase?.companyManagement
                                        ?.gst
                                    }
                                  </p>
                                </td>
                                <td
                                  style={{
                                    minWidth: "300px",
                                    borderInline:
                                      "1px solid rgb(219, 219, 219)",
                                    borderTop: "1px solid rgb(219, 219, 219)",
                                    verticalAlign: "top",
                                  }}
                                >
                                  <h6
                                    style={{
                                      fontWeight: "bold",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    Invoice To
                                  </h6>
                                  <p style={{ margin: 0, fontWeight: "bold" }}>
                                    {invoice?.[0]?.purchase?.customer?.name}
                                  </p>
                                  <p style={{ margin: 0 }}>
                                    {invoice?.[0]?.purchase?.customer?.address}{" "}
                                    {invoice?.[0]?.purchase?.customer?.state}{" "}
                                    {invoice?.[0]?.purchase?.customer?.city}{" "}
                                    {invoice?.[0]?.purchase?.customer?.zip}-
                                    {invoice?.[0]?.purchase?.customer?.country}{" "}
                                  </p>
                                  <p style={{ margin: 0 }}>
                                    <b>Contact No</b>:{" "}
                                    {invoice?.[0]?.purchase?.customer?.mobile}
                                  </p>
                                  <p style={{ margin: 0 }}>
                                    <b>GSTIN</b>:{" "}
                                    {invoice?.[0]?.purchase?.customer?.gstin}
                                  </p>
                                </td>
                                {/* <td style={{ minWidth: "300px", borderTop: "1px solid rgb(219, 219, 219)", verticalAlign: "top" }}>
                                                                    <h6 style={{ fontWeight: "bold", marginBottom: '3px' }}>Invoice From</h6>
                                                                    <p style={{ margin: 0, fontWeight: "bold" }}>Surya Demo Supplier</p>
                                                                    <p style={{ margin: 0 }}>26/3, 30, Nanik Niwas, Dr.D.D Sathe Marg</p>
                                                                    <p style={{ margin: 0 }}>Mumbai - 400004</p>
                                                                    <p style={{ margin: 0 }}><b>Contact No</b>: 8355900514</p>
                                                                    <p style={{ margin: 0 }}><b>GSTIN</b>: 27AACCF7457K1Z7</p>
                                                                </td> */}
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              cellPadding={10}
                              cellSpacing={0}
                              border={0}
                              width="100%"
                            >
                              <tr>
                                <td
                                  colSpan={7}
                                  style={{
                                    backgroundColor: "rgb(233, 233, 233)",
                                    textAlign: "center",
                                  }}
                                >
                                  <h5 style={{ marginBottom: 0, fontSize: 18 }}>
                                    Invoice Details
                                  </h5>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              cellPadding={10}
                              cellSpacing={0}
                              border={0}
                              width="100%"
                            >
                              <tr>
                                <td
                                  style={{ width: "50%", paddingBlock: "5px" }}
                                >
                                  <span
                                    style={{
                                      width: "150px",
                                      display: "inline-block",
                                    }}
                                  >
                                    <strong>Invoice Number:</strong>
                                  </span>{" "}
                                  {invoice?.[0]?.invoice_number}
                                </td>
                                <td
                                  style={{ width: "50%", paddingBlock: "5px" }}
                                >
                                  <span
                                    style={{
                                      width: "150px",
                                      display: "inline-block",
                                    }}
                                  >
                                    <strong>Invoice Date:</strong>
                                  </span>{" "}
                                  {invoice?.[0]?.invoice_date
                                    ? format(
                                        new Date(invoice[0].invoice_date),
                                        "dd/MM/yyyy"
                                      )
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{ width: "50%", paddingBlock: "5px" }}
                                >
                                  <span
                                    style={{
                                      width: "150px",
                                      display: "inline-block",
                                    }}
                                  >
                                    <strong>Sales Number:</strong>
                                  </span>{" "}
                                  {invoice?.[0]?.purchase?.reference_number}
                                </td>
                                <td
                                  style={{ width: "50%", paddingBlock: "5px" }}
                                >
                                  <span
                                    style={{
                                      width: "150px",
                                      display: "inline-block",
                                    }}
                                  >
                                    <strong>Sales Date:</strong>
                                  </span>
                                  {invoice?.[0]?.purchase?.created_at
                                    ? format(
                                        new Date(
                                          invoice?.[0]?.purchase?.created_at
                                        ),
                                        "dd/MM/yyyy"
                                      )
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{ width: "50%", paddingBlock: "5px" }}
                                >
                                  <span
                                    style={{
                                      width: "150px",
                                      display: "inline-block",
                                    }}
                                  >
                                    <strong>Payment Terms:</strong>
                                  </span>{" "}
                                  {invoice?.[0]?.purchase?.payment_terms}
                                </td>
                                <td
                                  style={{ width: "50%", paddingBlock: "5px" }}
                                >
                                  <span
                                    style={{
                                      width: "150px",
                                      display: "inline-block",
                                    }}
                                  >
                                    <strong>Expiration:</strong>
                                  </span>
                                  {invoice?.[0]?.purchase?.expiration
                                    ? format(
                                        new Date(
                                          invoice?.[0]?.purchase?.expiration
                                        ),
                                        "dd/MM/yyyy"
                                      )
                                    : "N/A"}{" "}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              cellPadding={10}
                              cellSpacing={0}
                              border={0}
                              width="100%"
                              style={{
                                borderBottom: "1px solid rgb(219, 219, 219)",
                              }}
                            >
                              <thead>
                                <tr>
                                  <th
                                    style={{
                                      borderTop: "1px solid rgb(219, 219, 219)",
                                      borderRight:
                                        "1px solid rgb(219, 219, 219)",
                                      textAlign: "center",
                                    }}
                                  >
                                    <span
                                      style={{
                                        marginBottom: 0,
                                        fontSize: 14,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Sl. No.
                                    </span>
                                  </th>
                                  <th
                                    style={{
                                      borderTop: "1px solid rgb(219, 219, 219)",
                                      borderRight:
                                        "1px solid rgb(219, 219, 219)",
                                    }}
                                  >
                                    <span
                                      style={{
                                        marginBottom: 0,
                                        fontSize: 14,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Description
                                    </span>
                                  </th>
                                  <th
                                    style={{
                                      borderTop: "1px solid rgb(219, 219, 219)",
                                      borderRight:
                                        "1px solid rgb(219, 219, 219)",
                                    }}
                                  >
                                    <span
                                      style={{
                                        marginBottom: 0,
                                        fontSize: 14,
                                        fontWeight: 700,
                                      }}
                                    >
                                      HSN/SAC Code
                                    </span>
                                  </th>
                                  <th
                                    style={{
                                      borderTop: "1px solid rgb(219, 219, 219)",
                                      borderRight:
                                        "1px solid rgb(219, 219, 219)",
                                      textAlign: "right",
                                    }}
                                  >
                                    <span
                                      style={{
                                        marginBottom: 0,
                                        fontSize: 14,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Quantity
                                    </span>
                                  </th>
                                  <th
                                    style={{
                                      borderTop: "1px solid rgb(219, 219, 219)",
                                      borderRight:
                                        "1px solid rgb(219, 219, 219)",
                                      textAlign: "right",
                                    }}
                                  >
                                    <span
                                      style={{
                                        marginBottom: 0,
                                        fontSize: 14,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Rate
                                    </span>
                                  </th>
                                  <th
                                    style={{
                                      borderTop: "1px solid rgb(219, 219, 219)",
                                      borderRight:
                                        "1px solid rgb(219, 219, 219)",
                                      textAlign: "right",
                                    }}
                                  >
                                    <span
                                      style={{
                                        marginBottom: 0,
                                        fontSize: 14,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Taxable Amount
                                    </span>
                                  </th>
                                  <th
                                    style={{
                                      borderTop: "1px solid rgb(219, 219, 219)",
                                      textAlign: "right",
                                    }}
                                  >
                                    <span
                                      style={{
                                        marginBottom: 0,
                                        fontSize: 14,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Total
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoice?.map((item, index) => (
                                  <tr key={item.id}>
                                    <td
                                      style={{
                                        borderTop:
                                          "1px solid rgb(219, 219, 219)",
                                        borderRight:
                                          "1px solid rgb(219, 219, 219)",
                                        width: 80,
                                        textAlign: "center",
                                      }}
                                    >
                                      <span
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {index + 1}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        borderTop:
                                          "1px solid rgb(219, 219, 219)",
                                        borderRight:
                                          "1px solid rgb(219, 219, 219)",
                                      }}
                                    >
                                      <span
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {item.ProductsItem?.product_name}
                                        <br />
                                        <b>Item ID</b>:{" "}
                                        {item.ProductsItem?.product_code}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        borderTop:
                                          "1px solid rgb(219, 219, 219)",
                                        borderRight:
                                          "1px solid rgb(219, 219, 219)",
                                      }}
                                    >
                                      <span
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {item.ProductsItem?.hsn_code}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        borderTop:
                                          "1px solid rgb(219, 219, 219)",
                                        borderRight:
                                          "1px solid rgb(219, 219, 219)",
                                        textAlign: "right",
                                      }}
                                    >
                                      <span
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {item.qty}{" "}
                                        {
                                          item.ProductsItem?.Masteruom
                                            ?.unit_name
                                        }
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        borderTop:
                                          "1px solid rgb(219, 219, 219)",
                                        borderRight:
                                          "1px solid rgb(219, 219, 219)",
                                        textAlign: "right",
                                      }}
                                    >
                                      <span
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {getGeneralSettingssymbol}{" "}
                                        {parseFloat(item.unit_price).toFixed(2)}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        borderTop:
                                          "1px solid rgb(219, 219, 219)",
                                        borderRight:
                                          "1px solid rgb(219, 219, 219)",
                                        textAlign: "right",
                                      }}
                                    >
                                      <span
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {getGeneralSettingssymbol}
                                        {item.taxExcl && item.tax
                                          ? (
                                              (parseFloat(item.taxExcl) *
                                                parseFloat(item.tax)) /
                                              100
                                            ).toFixed(2)
                                          : "0.00"}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        borderTop:
                                          "1px solid rgb(219, 219, 219)",
                                        textAlign: "right",
                                      }}
                                    >
                                      <span
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {getGeneralSettingssymbol}{" "}
                                        {parseFloat(item.taxIncl).toFixed(2)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              cellPadding={10}
                              cellSpacing={0}
                              border={0}
                              width="100%"
                            >
                              <tr>
                                <td style={{ width: "70%" }}>
                                  <p style={{ marginBottom: "10px" }}>
                                    <b>Invoice Amount</b>
                                    <br />
                                    {convertToCurrencyWords(
                                      Number(
                                        invoice?.[0]?.taxIncl || 0
                                      ).toFixed(2)
                                    )}
                                  </p>
                                  <p style={{ marginBottom: "0px" }}>
                                    <b>Payable Amount</b>
                                    <br />
                                    {convertToCurrencyWords(
                                      Number(
                                        invoice?.[0]?.taxIncl || 0
                                      ).toFixed(2)
                                    )}
                                  </p>
                                </td>
                                <td style={{ width: "30%" }}>
                                  <table
                                    cellPadding={5}
                                    cellSpacing={0}
                                    border={0}
                                    width="100%"
                                  >
                                    <tr>
                                      <td
                                        colSpan={1}
                                        style={{
                                          width: "50%",
                                          textAlign: "right",
                                        }}
                                      >
                                        <b>Total (before Tax) :</b>
                                      </td>
                                      <td
                                        colSpan={1}
                                        style={{
                                          width: "50%",
                                          textAlign: "right",
                                        }}
                                      >
                                        {getGeneralSettingssymbol}
                                        {invoice?.[0]?.taxExcl}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        style={{
                                          width: "200px",
                                          textAlign: "center",
                                          border:
                                            "1px solid rgb(219, 219, 219)",
                                        }}
                                      >
                                        <strong>CGST</strong>
                                      </td>
                                      <td
                                        style={{
                                          width: "200px",
                                          textAlign: "center",
                                          border:
                                            "1px solid rgb(219, 219, 219)",
                                        }}
                                      >
                                        <strong>SGST</strong>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        style={{
                                          width: "200px",
                                          textAlign: "center",
                                          border:
                                            "1px solid rgb(219, 219, 219)",
                                        }}
                                      >
                                        {invoice?.[0]?.tax / 2} %
                                      </td>
                                      <td
                                        style={{
                                          width: "200px",
                                          textAlign: "center",
                                          border:
                                            "1px solid rgb(219, 219, 219)",
                                        }}
                                      >
                                        {invoice?.[0]?.tax / 2} %
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        colSpan={1}
                                        style={{
                                          width: "50%",
                                          textAlign: "right",
                                        }}
                                      >
                                        <b>Total Tax :</b>
                                      </td>
                                      <td
                                        colSpan={1}
                                        style={{
                                          width: "50%",
                                          textAlign: "right",
                                        }}
                                      >
                                        {getGeneralSettingssymbol}{" "}
                                        {invoice?.[0]?.taxExcl &&
                                        invoice?.[0]?.tax
                                          ? (
                                              (parseFloat(
                                                invoice?.[0]?.taxExcl
                                              ) *
                                                parseFloat(invoice?.[0]?.tax)) /
                                              100
                                            ).toFixed(2)
                                          : "0.00"}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        colSpan={1}
                                        style={{
                                          width: "50%",
                                          textAlign: "right",
                                        }}
                                      >
                                        <b>Grand Total :</b>
                                      </td>
                                      <td
                                        colSpan={1}
                                        style={{
                                          width: "50%",
                                          textAlign: "right",
                                        }}
                                      >
                                        <b>
                                          {getGeneralSettingssymbol}
                                          {invoice?.[0]?.taxIncl
                                            ? parseFloat(
                                                invoice[0].taxIncl
                                              ).toFixed(2)
                                            : "0.00"}
                                        </b>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              cellPadding={10}
                              cellSpacing={0}
                              border={0}
                              width="100%"
                            >
                              <tr>
                                <td
                                  style={{
                                    textAlign: "left",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      backgroundColor: "rgb(233, 233, 233)",
                                      marginRight: 0,
                                      marginLeft: "auto",
                                      padding: "15px",
                                    }}
                                  >
                                    <b>Terms And Conditions:</b>
                                    <p style={{ marginBottom: "0" }}>
                                      This is a computer generated document
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              cellPadding={10}
                              cellSpacing={0}
                              border={0}
                              width="100%"
                            >
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 240,
                                      height: 170,
                                      backgroundColor: "rgb(233, 233, 233)",
                                      marginRight: 0,
                                      marginLeft: "auto",
                                      padding: "5px",
                                    }}
                                  >
                                    <span className="fw-medium">For {invoice?.[0]?.purchase?.companyManagement
                                        ?.company_name}</span>
                                    <span
                                      style={{
                                        display: "block",
                                        width: "100%",
                                        
                                      }}
                                    />
                                    <img src={getGeneralSettingsSignature} style={{ maxWidth: "170px", margin: "10px 0", maxHeight: "70px" }} alt="" />
                                    <span>Authorised Signatory</span>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="d-flex justify-content-end gap-3 position-sticy bottom-0 p-2 bg-white border-top rounded-10">
              <Link
                to="/document/cn/create"
                role="button"
                className="btn btn-success"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  id="Layer_1"
                  data-name="Layer 1"
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  fill="currentColor"
                  className="me-2"
                >
                  <path d="m18,12c-3.314,0-6,2.686-6,6s2.686,6,6,6,6-2.686,6-6-2.686-6-6-6Zm3.192,6.202l-2.213,2.124c-.452.446-1.052.671-1.653.671s-1.203-.225-1.663-.674l-1.132-1.109c-.395-.387-.4-1.02-.014-1.414.386-.396,1.019-.401,1.414-.014l1.131,1.108c.144.142.379.139.522-.002l2.223-2.134c.397-.382,1.031-.371,1.414.029.382.398.369,1.031-.029,1.414Zm-11.192-.202c0-2.39,1.048-4.534,2.709-6h-7.709c-.553,0-1-.447-1-1s.447-1,1-1h8c.553,0,1,.447,1,1,0,.024-.001.048-.003.072,1.177-.682,2.544-1.072,4.003-1.072v-5c0-2.757-2.243-5-5-5H5C2.243,0,0,2.243,0,5v14c0,2.757,2.243,5,5,5h7.709c-1.661-1.466-2.709-3.61-2.709-6ZM5,5h8c.553,0,1,.447,1,1s-.447,1-1,1H5c-.553,0-1-.447-1-1s.447-1,1-1Zm2,12h-2c-.553,0-1-.447-1-1s.447-1,1-1h2c.553,0,1,.447,1,1s-.447,1-1,1Z" />
                </svg>
                Create Credit Note
              </Link>
              <Link
                to="/document/dn/create"
                role="button"
                className="btn btn-teal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  id="Layer_1"
                  viewBox="0 0 24 24"
                  data-name="Layer 1"
                  width={14}
                  height={14}
                  fill="currentColor"
                  className="me-2"
                >
                  <path d="m14 7v-6.54a6.977 6.977 0 0 1 2.465 1.59l3.484 3.486a6.954 6.954 0 0 1 1.591 2.464h-6.54a1 1 0 0 1 -1-1zm8 3.485v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515c.163 0 .324.013.485.024v6.976a3 3 0 0 0 3 3h6.976c.011.161.024.322.024.485zm-6 6.515a1 1 0 0 0 -1-1h-2v-2a1 1 0 0 0 -2 0v2h-2a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0v-2h2a1 1 0 0 0 1-1z" />
                </svg>
                Create Debit Note
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default TaxInvoice;
