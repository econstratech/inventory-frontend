import React, { useState } from 'react'
import Select from "react-select";

const PaymentMethod = () => {

    const bankname = [
        { value: ' State Bank of India', label: ' State Bank of India' },
        { value: ' Bank of Baroda', label: ' Bank of Baroda' },
        { value: ' Bank of India', label: 'Bank of India' },
        { value: ' Bank of Maharashtra', label: 'Bank of Maharashtra' },
        { value: ' Canara Bank', label: 'Canara Bank' },
        { value: ' Central Bank of India', label: 'Central Bank of India' },
        { value: ' Indian Bank', label: 'Indian Bank' },
        { value: ' Indian Overseas Bank', label: 'Indian Overseas Bank' },
        { value: ' Punjab and Sind Bank', label: 'Punjab and Sind Bank' },
        { value: ' Punjab National Bank', label: 'Punjab National Bank' },
        { value: ' UCO Bank', label: 'UCO Bank' },
        { value: ' Union Bank of India', label: 'Union Bank of India' },

    ]
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedUPIMethod, setSelectedUPIMethod] = useState("");

    return (
        <>
            <div className='d-flex align-content-center gap-2'>

                {/* <label className="custom-radio payment_radio  mb-2">
                        <input
                            type="radio"
                            name="template"
                            value="template4"
                            checked={selectedTemplate === "template4"}
                            onChange={() => setSelectedTemplate("template4")}
                        />
                        <img className="prof-img me-2" src={process.env.PUBLIC_URL + '/assets/images/upi.svg'} alt="logo" />
                        <span>UPI</span>
                        <span className="checkmark" />
                    </label>

                <label className="custom-radio payment_radio">
                    <input
                        type="radio"
                        name="template"
                        value="template1"
                        checked={selectedTemplate === "template1"}
                        onChange={() => setSelectedTemplate("template1")}
                    />
                    <img className="prof-img ms-2 me-2" src={process.env.PUBLIC_URL + '/assets/images/card.png'} alt="logo" />
                    <span>Credit/ Debit / ATM Card</span>
                    <span className="checkmark" />
                </label> */}

                <label className="custom-radio payment_radio ">
                    <input
                        type="radio"
                        name="template"
                        value="template2"
                        checked={selectedTemplate === "template2"}
                        onChange={() => setSelectedTemplate("template2")}
                    />
                    <img className="prof-img bankImg ms-2 me-2" src={process.env.PUBLIC_URL + '/assets/images/bank.png'} alt="logo" />
                    <span>Online</span>
                    <span className="checkmark" />
                </label>
                <label className="custom-radio payment_radio">
                    <input
                        type="radio"
                        name="template"
                        value="template3"
                        checked={selectedTemplate === "template3"}
                        onChange={() => setSelectedTemplate("template3")}
                    />
                    <img className="prof-img ms-2 me-2 " src={process.env.PUBLIC_URL + '/assets/images/rupee.png'} alt="logo" />
                    <span>Cash on Delivery</span>
                    <span className="checkmark" />
                </label>
            </div>

            {/* UPI Payment */}
            <div>
                {/* Main UPI Selection */}


                {selectedTemplate === "template4" && (
                    <div className='border rounded-3 p-3 mb-3 '>
                        <div className='d-flex align-items-center gap-2 mt-3 flex-wrap'>

                            {/* Google Pay */}
                            <label className="custom-radio me-3 mb-2">
                                <input
                                    type="radio"
                                    name="upiMethod" // Unique name for sub-options
                                    value="google-pay"
                                    checked={selectedUPIMethod === "google-pay"}
                                    onChange={() => setSelectedUPIMethod("google-pay")}
                                />
                                <span className="checkmark" />
                                <span>
                                    <img className="prof-img me-2" src={process.env.PUBLIC_URL + '/assets/images/google-pay.png'} alt="logo" />
                                    Google Pay
                                </span>
                            </label>

                            {/* Paytm */}
                            <label className="custom-radio me-3 mb-2">
                                <input
                                    type="radio"
                                    name="upiMethod"
                                    value="paytm"
                                    checked={selectedUPIMethod === "paytm"}
                                    onChange={() => setSelectedUPIMethod("paytm")}
                                />
                                <span className="checkmark" />
                                <span>
                                    <img className="prof-img me-2" src={process.env.PUBLIC_URL + '/assets/images/paytm.png'} alt="logo" />
                                    Paytm
                                </span>
                            </label>

                            {/* PhonePe */}
                            <label className="custom-radio me-3 mb-2">
                                <input
                                    type="radio"
                                    name="upiMethod"
                                    value="phonepe"
                                    checked={selectedUPIMethod === "phonepe"}
                                    onChange={() => setSelectedUPIMethod("phonepe")}
                                />
                                <span className="checkmark" />
                                <span>
                                    <img className="prof-img me-2" src={process.env.PUBLIC_URL + '/assets/images/phonepay.png'} alt="logo" />
                                    PhonePe
                                </span>
                            </label>

                        </div>

                        {/* Payment Button */}
                        <div className='form-group'>
                            <button className='w-100 total btn btn-info f-s-20'>
                                Total: <span className='amount'>₹300</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Card Payment */}
            <div>
                {selectedTemplate === "template1" && (
                    <div className='border rounded-3 p-3 mb-3 '>
                        <form>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div class='form-group pt-0'>
                                        <label class='col-from-label pb-0'>Enter Card Number</label>
                                        <input autocomplete='off' class='form-control' size='20' type='text' placeholder='Enter Card Number' required />
                                    </div>
                                </div>
                                <div className='col-md-4'>
                                    <div class='form-group '>
                                        <label class='col-from-label pb-0'>CVC</label>
                                        <input autocomplete='off' class='form-control' placeholder='ex. 311' size='4' type='text' />
                                    </div>
                                </div>
                                <div class='col-md-4'>
                                    <div class='form-group'>
                                        <label class='col-from-label pb-0'>Expiration</label>
                                        <input class='form-control card-expiry-month' placeholder='MM' size='2' type='text' />
                                    </div>
                                </div>
                                <div class='col-md-4'>
                                    <div class='form-group'>
                                        <label class='col-from-label pb-0'> </label>
                                        <input class='form-control card-expiry-year' placeholder='YYYY' size='4' type='text' />
                                    </div>
                                </div>
                                <div className='col-md-12'>
                                    <button class='w-100 total btn btn-info f-s-20'>
                                        Total:
                                        <span class='amount'>₹300</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Net Banking */}
            <div>

                {selectedTemplate === "template2" && (
                    <div className='form-group'>
                        <button class='w-100 total btn btn-info f-s-20'>
                            Total:
                            <span class='amount'>₹300</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Cash on Delivery */}
            <div>

                {selectedTemplate === "template3" && (
                    <div className='form-group '>
                        <button class='w-100 total btn btn-info f-s-20'>
                            Place Order
                        </button>
                    </div>
                )}
            </div>

            {/* </div > */}
        </>
    )
}

export default PaymentMethod