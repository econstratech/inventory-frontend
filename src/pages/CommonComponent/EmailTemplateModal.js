import React from 'react';
import { Modal } from 'react-bootstrap';
import { UserAuth } from '../auth/Auth';

function EmailTemplateModal({ show, handleClose }) {
    const { getGeneralSettingssymbol } = UserAuth();

    return (
        <form>
            <Modal id="EmailPreviewModal" show={show} onHide={handleClose} backdrop="static" centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Email Template</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-1'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='form-group'>
                                <label className='form-label'>Subject</label>
                                <input type='text' className='form-control' placeholder='Full Name' value="[Important] Please review Debit Note of ₹ 1,000.00 against invoice INV00001" />
                            </div>
                        </div>
                        <div className='col-md-12'>
                            <div className='form-group'>
                                <label className='form-label'>Introduction Line</label>
                                <input type='text' className='form-control' placeholder='Full Name' value="We have generated a Credit Note against the below mentioned invoice. Please click on the button below to view the details " />
                            </div>
                        </div>
                        <div className='col-md-12'>
                            <div className='form-group'>
                                <label className='form-label'>Closing Line</label>
                                <input type='text' className='form-control' placeholder='Full Name' value="In case of any query, please reply to this email or reach me on 0000000000. It's always a pleasure to do business with you!" />
                            </div>
                        </div>
                        <div className='col-md-12'>
                            <div className='form-group pt-0'>
                                <label className='col-form-label'>Attachments</label>
                                <div className='d-flex flex-wrap gap-3'>
                                    <div className='text-center text-muted'>
                                        <i class="fas fa-file fs-4"></i>
                                        <p className='mb-0'>CN00001</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-12'>
                            <div className='table-responsive'>
                                <table
                                    cellPadding={0}
                                    width="700px"
                                    align="center"
                                    cellSpacing={0}
                                    style={{
                                        width: 750,
                                        margin: "0px auto",
                                        backgroundColor: "#f9fffb",
                                        borderCollapse: "collapse",
                                        border: "0px solid #009a40"
                                    }}
                                >
                                    <tbody>
                                        <tr>
                                            <td align="right" style={{ padding: "20px 20px" }}>
                                                <table
                                                    border={0}
                                                    cellPadding={0}
                                                    cellSpacing={0}
                                                    role="presentation"
                                                    style={{ borderCollapse: "collapse", borderSpacing: 0 }}
                                                    width="100%"
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <a
                                                                    href="https://www.growthh.com/"
                                                                    target="_blank"
                                                                    style={{ width: 180 }}
                                                                >
                                                                    <img
                                                                        src={process.env.PUBLIC_URL + "/assets/images/icon-logo-navy.png"}
                                                                        alt="growthh"
                                                                        style={{ width: 150, margin: "auto", display: "block" }}
                                                                        border={0}
                                                                    />
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: 10 }}>
                                                <h5
                                                    style={{
                                                        color: "#222222",
                                                        lineHeight: 1,
                                                        marginBottom: 10,
                                                        marginTop: 0,
                                                        fontSize: 18
                                                    }}
                                                >
                                                    <strong>Dear [name],</strong>
                                                </h5>
                                                <p
                                                    style={{
                                                        color: "#545454",
                                                        lineHeight: "1.6",
                                                        margin: "0 0 0px 0",
                                                        fontSize: 15
                                                    }}
                                                >
                                                    We have generated a Credit Note against the below mentioned invoice. Please click on the button below to view the details
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: 10 }}>
                                                <table
                                                    border={0}
                                                    cellPadding={0}
                                                    cellSpacing={0}
                                                    role="presentation"
                                                    style={{ borderCollapse: "collapse", borderSpacing: 0 }}
                                                    width="100%"
                                                >
                                                    <tr>
                                                        <td style={{ width: "50%", fontSize: 15, color: "#545454", }}>Credit Note Number</td>
                                                        <td style={{ width: "50%", fontSize: 15, color: "#545454", }}><b>CN00001</b></td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ width: "50%", fontSize: 15, color: "#545454", }}>Creation Date</td>
                                                        <td style={{ width: "50%", fontSize: 15, color: "#545454", }}><b>16-Jan-2025</b></td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ width: "50%", fontSize: 15, color: "#545454", }}>Invoice Number</td>
                                                        <td style={{ width: "50%", fontSize: 15, color: "#545454", }}><b>INV00001</b></td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ width: "50%", fontSize: 15, color: "#545454", }}>Amount</td>
                                                        <td style={{ width: "50%", fontSize: 15, color: "#545454", }}><b>{getGeneralSettingssymbol} 1,265.00</b></td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: 10 }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <a href="#"
                                                        style={{
                                                            backgroundColor: "#06AA7E",
                                                            borderTop: "10px solid #06AA7E",
                                                            borderRight: "30px solid #06AA7E",
                                                            borderBottom: "10px solid #06AA7E",
                                                            borderLeft: "30px solid #06AA7E",
                                                            color: "#fff",
                                                            fontSize: 16,
                                                            fontWeight: "bold"
                                                        }}
                                                    >
                                                        Credit Note
                                                    </a>

                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: 10 }}>
                                                <p style={{ color: "#222222", lineHeight: "1.6", fontWeight: 600, margin: "0 0 0px 0", fontSize: 15 }}>
                                                    Best regards,
                                                    <br />
                                                    Jocelyn Bright
                                                    <br />
                                                    <span style={{ fontWeight: 500 }}>[Company Name]</span>
                                                </p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td
                                                style={{ textAlign: "center", padding: 12, backgroundColor: "#035123" }}
                                            >
                                                <p style={{ margin: 0, fontSize: 13, color: "#ffffff" }}>
                                                    Powered by Adeya AI | Made in India
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </form>
    );
}

export default EmailTemplateModal;
