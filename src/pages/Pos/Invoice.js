import { Input } from 'antd'
import React, { useState } from 'react'
import { Table } from 'react-bootstrap'
import AutoHeightTextarea from '../CommonComponent/AutoHeightTextarea'

const Invoice = ({ paymentShow, showContinueButton = true }) => {


    return (
        <>
            {/* <div className=''>
                <div className='card-body'> */}

                    <button className=' print_btn'><i class="fas fa-print"></i></button>
            <div className="rounded-lg position-relative mt-5">


                <Table responsive className="primary-table-head">
                    <tbody>
                        <tr>
                            <td className='p-0 border-top-0'>
                                <table className='w-100'>
                                    <tbody>
                                        <tr>
                                            <td colSpan={8}>
                                                <h3 className="text-center fw-bold mb-0">INVOICE</h3>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className='p-0 border-top-0'>
                                <table className='w-100'>
                                    <tbody>
                                        <tr>
                                            <td className=' border-end' colSpan={4}>
                                                <p className="fw-bold f-s-25 mb-0"> INV00001
                                                </p>
                                            </td>
                                            <td colSpan={4}>
                                                <p className="mb-0 text-end"><span className="f-s-16 fw-semibold text-primary-grey-4">Billing Date & Time  : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-2">11-03-2025 | 11:45 PM</span></p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className='p-0' colSpan={5}>
                                <table className='w-100'>
                                    <tbody>
                                        <tr>
                                            <td  className=''>
                                                <div className='w-100 mb-4'>
                                                    <p className="mb-1"> <span className="f-s-16 fw-semibold text-primary-grey-4">Billed to : </span> <span className="f-s-16 fw-semibold text-primary-grey-2"> Pratima Majumder </span>
                                                        {/* <input type="text" className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0" id="exampleFormControlInput1" placeholder='Pratima Majumder' /> */}
                                                    </p>
                                                    <p className="mb-1 d-flex"><span className="f-s-16 fw-semibold text-primary-grey-4 text-nowrap">Billing Address : </span> <span className="f-s-16 fw-semibold text-primary-grey-2"> EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091</span>
                                                        {/* <AutoHeightTextarea className="custom_textarea input_border fw-semibold f-s-16 text-primary-grey-2 border-0 w-75" placeholder="EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091" rows={1}
                                                        /> */}
                                                    </p>
                                                    <p className="mb-1"><span className="f-s-16 fw-semibold text-primary-grey-4">Billing Contact Number : </span> <span className="f-s-16 fw-semibold text-primary-grey-2"> 8236954884 </span>

                                                        {/* <input type="number" className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0" id="exampleFormControlInput1" placeholder="8236954884" />
                                                        <span className="fw-semibold f-s-16 text-primary-grey-2"></span> */}
                                                    </p>
                                                    <p className="mb-1"><span className="f-s-16 fw-semibold text-primary-grey-4">GST No : </span> <span className="f-s-16 fw-semibold text-primary-grey-2"> GST6954884 </span>
                                                        {/* <input type="text" className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0" id="exampleFormControlInput1" placeholder="GST6954884" />
                                                        <span className="fw-semibold f-s-16 text-primary-grey-2"></span> */}
                                                    </p>
                                                </div>                                                

                                                <h6 className='mb-3 text-primary-grey-1 fw-bold mt-3'>Shipping Details</h6>
                                                <div className='w-100 mt-1'>
                                                    <p className="mb-1"> <span className="f-s-16 fw-semibold text-primary-grey-4">Ship to : </span> <span className="f-s-16 fw-semibold text-primary-grey-2"> Pratima Majumder </span>
                                                        {/* <input type="text" className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0" id="exampleFormControlInput1" placeholder='Pratima Majumder' /> */}
                                                    </p>
                                                    <p className="mb-1 d-flex"><span className="f-s-16 fw-semibold text-primary-grey-4 text-nowrap">Shipping Address :  </span> <span className="f-s-16 fw-semibold text-primary-grey-2"> EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091</span>
                                                        {/* <AutoHeightTextarea className="custom_textarea input_border fw-semibold f-s-16 text-primary-grey-2 border-0 w-75" placeholder="EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091" rows={1}
                                                        /> */}
                                                    </p>
                                                    <p className="mb-1"><span className="f-s-16 fw-semibold text-primary-grey-4"> Contact Number : </span>
                                                      <span className="f-s-16 fw-semibold text-primary-grey-2"> 8236954884</span>
                                                        {/* <input type="number" className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0" id="exampleFormControlInput1" placeholder="8236954884" />
                                                        <span className="fw-semibold f-s-16 text-primary-grey-2"></span> */}
                                                    </p>
                                                    {/* <p className="mb-1"><span className="f-s-16 fw-semibold text-primary-grey-4">GST No : </span>
                                                        <input type="text" className="fw-semibold input_border f-s-16 text-primary-grey-2 border-0" id="exampleFormControlInput1" placeholder="GST6954884" />
                                                        <span className="fw-semibold f-s-16 text-primary-grey-2"> GST6954884</span>
                                                    </p> */}
                                                </div>
                                            </td>
                                            <td  className="text-end align-top">

                                                <p className="mb-1">
                                                    {/* <span className="f-s-16 fw-semibold text-primary-grey-4">Bill Date : </span> */}
                                                    <span className="fw-semibold f-s-25 text-primary-grey-2">GYAANMART KNOWLEDGE TECHNOLOGY PRIVATE</span>
                                                </p>
                                                <p className="mb-1">
                                                    <span className="f-s-16 fw-semibold text-primary-grey-4">HeadOffice : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-2">A1/46, SUSHANT LOK-2, SECTOR-55, GOLF COURSE</span>
                                                </p>
                                                <p className="mb-1">
                                                    <span className="f-s-16 fw-semibold text-primary-grey-4">Website : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-2">www.growthh.com</span>
                                                </p>
                                                <p className="mb-1">
                                                    <span className="f-s-16 fw-semibold text-primary-grey-4">Email : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-2">info@growthh.com</span>
                                                </p>
                                                <p className="mb-1">
                                                    <span className="f-s-16 fw-semibold text-primary-grey-4">GSTN : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-2">GSTN9831093864</span>
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className='p-0' colSpan={5}>
                                <table className='w-100 primary-table-head'>
                                    <tbody>
                                        <tr>
                                            <th className='text-nowrap'>Item ID</th>
                                            <th className='text-nowrap'>Item Name</th>
                                            <th className='text-nowrap'>Description</th>
                                            <th className='text-nowrap'>Location</th>
                                            <th className="text-end">Quantity</th>
                                            <th className='text-nowrap'>UOM</th>
                                            <th className="text-end">Amount</th>
                                        </tr>
                                        {[...Array(4)].map((_, index) => (
                                            <tr key={index}>
                                                <td className="fw-bold w_min100">E058{index + 1}</td>
                                                <td> <div className="profile-wrap ">
                                                    <div className="exp-avtar pos_avatar border ">
                                                        <img className="prof-img" src={process.env.PUBLIC_URL + '/assets/images/demo-logo.png'} alt="logo" />
                                                    </div>
                                                    <div className="ps-2 profile-name-wrap">
                                                        <h5 className="profile-name text-nowrap">Econstra Business Consultants LLP </h5>
                                                    </div>
                                                </div></td>
                                                <td className='w_min200'>Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</td>
                                                <td className='w_min200'>EN Block, Sector V, Kolkata</td>
                                                <td className="text-end">{index + 3}</td>
                                                <td>Kg</td>
                                                <td className="text-end fw-bold">₹1600</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={4}></td>
                                            <td colSpan={5} className="fw-medium text-primary-grey-3">
                                                <p className="mb-1 text-nowrap text-end"><span className="f-s-16 fw-medium text-primary-grey-3">Sub Total : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-1">₹ 1,596.00</span></p>
                                                <p className="mb-1 text-nowrap text-end"><span className="f-s-16 fw-medium text-primary-grey-3">SGST : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-1">₹ 35</span></p>
                                                <p className="mb-1 text-nowrap text-end"><span className="f-s-16 fw-medium text-primary-grey-3">CGST : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-1">₹ 10</span></p>
                                                <p className="mb-3 text-nowrap text-end"><span className="f-s-16 fw-medium text-primary-grey-3">IGST : </span>
                                                    <span className="fw-semibold f-s-16 text-primary-grey-1">₹ 0</span></p>
                                                <p className="mb-1 text-nowrap text-end"><span className="f-s-20 fw-semibold text-primary-grey-2">Total : </span>
                                                    <span className="fw-semibold f-s-20 text-primary-grey-1">₹ 1638</span></p>
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className='p-0'>
                                <table className='w-100 primary-table-head'>
                                    <tbody>
                                        <tr>
                                            <td className=' align-top' rowSpan={3}>
                                                {/* <td className=' border-top-0 align-top'> */}
                                                <p className="mb-1 text-nowrap"><span className="f-s-16 fw-medium text-primary-grey-3">Amount chargeable ( in words )</span></p>
                                                <p className="mb-1 text-nowrap"><span className="f-s-20 fw-bold text-primary-grey-2">One Thousand six Hundred Thirty Eight Only</span></p>
                                            </td>
                                            <td colSpan={5} className=" align-top text-center" >
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className='p-0'>
                                <table className='w-100 primary-table-head'>
                                    <tbody>
                                        <tr>
                                            <td className='border-end align-bottom' rowSpan={3}>
                                                <div>
                                                <p className="mb-1 text-nowrap"><span className="f-s-18 fw-semibold text-primary-grey-mx-2"><u>Terms and Conditions</u></span></p>
                                                <p className="mb-1 "><span className="f-s-16 fw-medium text-primary-grey-mx-5">It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                                </span></p>
                                                </div>
                                                <div>
                                                <p className="mb-1 text-nowrap mt-5"><span className="f-s-18 fw-semibold text-primary-grey-mx-2"><u>Declaration</u></span></p>
                                                <p className="mb-1 "><span className="f-s-16 fw-medium text-primary-grey-mx-5">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                                                </span></p>
                                                </div>
                                            </td>
                                            <td colSpan={5} className=" align-top text-center" >
                                                <p className="mb-3">
                                                    <span className="fw-semibold f-s-25 text-primary-grey-2">GYAANMART KNOWLEDGE TECHNOLOGY PRIVATE</span>
                                                </p>
                                                <img className="prof-img" src={process.env.PUBLIC_URL + '/assets/images/signature.png'} alt="logo" />
                                                <p className="mb-1">
                                                    <span className="fw-semibold f-s-16 text-primary-grey-2">Authorised Signatory</span>
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <table className='w-100'>
                                    <tbody>
                                        <tr>
                                            <td className=' align-middle border-top-0'>
                                            <p className='text-center f-s-18 fw-semibold mb-0'>This is a Computer Generated Invoice</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </Table>
                
            </div>




            {/* Show button only if showContinueButton is true */}
            {showContinueButton && (
                <button className="btn btn-exp-green btn-sm ms-auto mt-3" onClick={paymentShow}>Continue</button>
            )}
            {/* <button className="btn btn-exp-green btn-sm ms-auto mt-3" onClick={paymentShow} >Continue</button> */}
            {/* </div>
            </div> */}
        </>
    )
}

export default Invoice