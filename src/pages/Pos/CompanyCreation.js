import React, { useState } from 'react'
import AutoHeightTextarea from '../CommonComponent/AutoHeightTextarea'
import { Table } from 'react-bootstrap';
import { Upload } from '@progress/kendo-react-upload';

const CompanyCreation = () => {
    const [formData, setFormData] = useState({
        companyInformation: "",
        state: "",
        city: "",
        country: "",
    });


    const getTaskData = async (e, data) => {
        if (e.target) {
            var name = e.target.name;
            setFormData({ ...formData, [name]: e.target.value });
        } else {
            setFormData({ ...formData, [data.name]: e.id });
        }
    };

    return (
        <>
            <div className='p-4'>
                <div className='card'>
                    <div className='card-header'>
                        <h3 className='mb-0 card-title'>Company Creation</h3>
                    </div>
                    <div className='card-body'>
                        <form action="" >
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label">
                                            Company Name
                                            {/* <span className="text-danger">*</span> */}
                                        </label>
                                        <input
                                            type="text"
                                            name="Name"
                                            placeholder="Enter Item Name"
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label d-flex justify-content-between">
                                            <span>Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Enter Company Mail"
                                            className="form-control"
                                        // onChange={getTaskData}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label className="form-label d-flex justify-content-between">
                                            <span>Contact Number</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="number"
                                            placeholder="Enter Number"
                                            className="form-control"
                                        // onChange={getTaskData}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label className="form-label d-flex justify-content-between">
                                            <span>Country</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            name="state"
                                            onChange={getTaskData}
                                        >
                                            <option value="in">India</option>

                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label className="form-label">
                                            State
                                            {/* <span className="text-danger">*</span> */}
                                        </label>
                                        <select
                                            className="form-select"
                                            name="state"
                                            onChange={getTaskData}
                                        >
                                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                            <option value="Assam">Assam</option>
                                            <option value="Bihar">Bihar</option>
                                            <option value="Chhattisgarh">Chhattisgarh</option>
                                            <option value="Goa">Goa</option>
                                            <option value="Gujarat">Gujarat</option>
                                            <option value="Haryana">Haryana</option>
                                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                                            <option value="Jharkhand">Jharkhand</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Kerala">Kerala</option>
                                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Manipur">Manipur</option>
                                            <option value="Meghalaya">Meghalaya</option>
                                            <option value="Mizoram">Mizoram</option>
                                            <option value="Nagaland">Nagaland</option>
                                            <option value="Odisha">Odisha</option>
                                            <option value="Punjab">Punjab</option>
                                            <option value="Rajasthan">Rajasthan</option>
                                            <option value="Sikkim">Sikkim</option>
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                            <option value="Telangana">Telangana</option>
                                            <option value="Tripura">Tripura</option>
                                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                                            <option value="Uttarakhand">Uttarakhand</option>
                                            <option value="West Bengal">West Bengal</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label className="form-label">
                                            City
                                            {/* <span className="text-danger">*</span> */}
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City"
                                            className="form-control"
                                        // onChange={getTaskData}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label className="form-label">
                                            ZIP / Postcode
                                            {/* <span className="text-danger">*</span> */}
                                        </label>
                                        <input
                                            type="number"
                                            name="zip"
                                            placeholder="Enter Zip / Postcode"
                                            className="form-control"
                                        // onChange={getTaskData}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label for="formFile" className="form-label">Company Image / Logo</label>
                                        <Upload batch={false} multiple={true} defaultFiles={[]} withCredentials={false} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label d-flex justify-content-between">
                                            <span>Address</span>
                                        </label>
                                        <AutoHeightTextarea placeholder='Full Address' rows={3} />
                                    </div>
                                </div>


                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label d-flex justify-content-between">
                                            <span>Terms and Conditions (optional)</span>
                                        </label>
                                        <AutoHeightTextarea placeholder='Right Your Note Here...' rows={3} />
                                    </div>
                                </div>

                            </div>

                            <button type="submit" className="btn btn-success">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
                <div className='card mb-0'>
                    <div className='card-body pb-0'>
                        <div className=" custom_postable pos_table">
                            <Table responsive className="table-bordered primary-table-head">
                                <thead>
                                    <tr>
                                        <th>Company Name</th>
                                        <th>Email</th>
                                        <th>Contact Number</th>
                                        <th>Country</th>
                                        <th>State</th>
                                        <th>City</th>
                                        <th>ZIP / Postcode</th>
                                        <th>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="profile-wrap ">
                                                <div className="exp-avtar border pos_avatar ">
                                                    <img className="prof-img" src={process.env.PUBLIC_URL + '/assets/images/demo-logo.png'} alt="logo" />
                                                </div>
                                                <div className="ps-2 profile-name-wrap">
                                                    <h5 className="profile-name text-nowrap">Econstra Business Consultants LLP</h5>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='w_min300'>
                                            <p className='mb-0'>company.abc@gmail.com</p>
                                        </td>
                                        <td className='w_min200'>
                                            <p className='mb-0'>
                                                85461239825
                                            </p>
                                        </td>
                                        <td className=' w_min100'>
                                            India
                                        </td>
                                        <td className='w_min100'>
                                            Maharashtra
                                        </td>
                                        <td className='w_min100'>
                                            <p className='mb-0 '>Mumbai</p>
                                        </td>
                                        <td>
                                            <p className='mb-0'>400003</p>
                                        </td>
                                        <td className='w_min200'>
                                            <p className='mb-0 '>EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="profile-wrap ">
                                                <div className="exp-avtar border pos_avatar ">
                                                    <img className="prof-img" src={process.env.PUBLIC_URL + '/assets/images/demo-logo2.jpg'} alt="logo" />
                                                </div>
                                                <div className="ps-2 profile-name-wrap">
                                                    <h5 className="profile-name text-nowrap">Econstra Business Consultants LLP</h5>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='w_min300'>
                                            <p className='mb-0'>company.abc@gmail.com</p>
                                        </td>
                                        <td className='w_min200'>
                                            <p className='mb-0'>
                                                85461239825
                                            </p>
                                        </td>
                                        <td className=' w_min100'>
                                            India
                                        </td>
                                        <td className='w_min100'>
                                            Maharashtra
                                        </td>
                                        <td className='w_min100'>
                                            <p className='mb-0 '>Mumbai</p>
                                        </td>
                                        <td>
                                            <p className='mb-0'>400003</p>
                                        </td>
                                        <td className='w_min200'>
                                            <p className='mb-0 '>EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="profile-wrap ">
                                                <div className="exp-avtar border pos_avatar ">
                                                    <img className="prof-img" src={process.env.PUBLIC_URL + '/assets/images/demo-logo3.jpg'} alt="logo" />
                                                </div>
                                                <div className="ps-2 profile-name-wrap">
                                                    <h5 className="profile-name text-nowrap">Econstra Business Consultants LLP</h5>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='w_min300'>
                                            <p className='mb-0'>company.abc@gmail.com</p>
                                        </td>
                                        <td className='w_min200'>
                                            <p className='mb-0'>
                                                85461239825
                                            </p>
                                        </td>
                                        <td className=' w_min100'>
                                            India
                                        </td>
                                        <td className='w_min100'>
                                            Maharashtra
                                        </td>
                                        <td className='w_min100'>
                                            <p className='mb-0 '>Mumbai</p>
                                        </td>
                                        <td>
                                            <p className='mb-0'>400003</p>
                                        </td>
                                        <td className='w_min200'>
                                            <p className='mb-0 '>EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091</p>
                                        </td>
                                    </tr>

                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CompanyCreation