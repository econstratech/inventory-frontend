import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import { UserAuth } from '../auth/Auth';
import { AllUser, AllCategories, GetTaskRemainder,formatDateTimeForMySQL } from '../../environment/GlobalApi';
import "../global.css"
import { PrivateAxios, PrivateAxiosFile } from '../../environment/AxiosInstance';

function AddNewVendor() {
    // Set reminder
    const { Logout } = UserAuth();
    const [isCheckedReminder, setIsCheckedReminder] = useState(false);
    const [isFileRequired, setIsFileRequired] = useState(false);
    const [error, setError] = useState({});
    //country list
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    useEffect(() => {
        PrivateAxios.get('https://countriesnow.space/api/v0.1/countries')
        .then(response => {
          const countryOptions = response.data.data.map(country => ({
            label: country.country,
            value: country.country
          }));
          setCountries(countryOptions);
        })
        .catch(error => console.error('Error fetching countries:', error));
    }, []);
    
   
    const [formData, setFormData] = useState({
        'vendor_name': '',
      
        
    });
    
    const getTaskData = async (e, data) => {

        if (e.target) {
            var name = e.target.name;
            setFormData({ ...formData, [name]: e.target.value })
        } else {
            setFormData({ ...formData, [data.name]: e.value })
        }
    }
   


const navigate = useNavigate();

const fileUpload = async (e) => {
    const file = e.target.files[0];
    let fileSize = file.size;
    if (Number(fileSize) >= 2097152) {
        setError({ file: "This image in getter than 2MB" })
    } else {
        setFormData({ ...formData, file: e.target.files[0] });
        setError("")
    }
}

  
    const SubmitData = async (e) => {
        e.preventDefault();
        let formData1 = await new FormData();
        formData1.append('vendor_name', formData.vendor_name)
        formData1.append('type', formData.type)
        formData1.append('address', formData.address)
        formData1.append('gst_treatment', formData.gst_treatment)
        formData1.append('gstin', formData.gstin)
        formData1.append('pan', formData.pan)
        formData1.append('phone', formData.phone)
        formData1.append('mobile', formData.mobile)
        formData1.append('email', formData.email)
        formData1.append('zip', formData.zip)
        formData1.append('country', formData.country)
        formData1.append('state', formData.state)
        formData1.append('city', formData.city)
        formData1.append('website', formData.website)
        formData1.append('account_number', formData.account_number)
        formData1.append('bank_name', formData.bank_name)
        formData1.append('account_holder', formData.account_holder)
        formData1.append('ifsc_code', formData.ifsc_code)
        formData1.append('file', formData.file)
        
        
        PrivateAxiosFile.post("vendor/add", formData1)
        .then((res) => {
                
            if (res.status === 200) {
                SuccessMessage('vendor added successfully!');
                //navigate('/vendors'); 
            }
        }).catch((err) => {
          
            console.error('There was an error!', error);
        })

    }


    return (
        <React.Fragment>
            <div className='mb-4'>
                <Link to="/vendors" className='text-dark back-btn'><i class="bi bi-arrow-left-short me-1" />Back</Link>
            </div>
            <div className='card'>
                <div className='card-header'>
                    <h3 className="card-title">Add New Vendor</h3>
                </div>
                <form action='' onSubmit={SubmitData} method='post'>
                    <div className='card-body pb-1'>
                        <div className='row'>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Vendor Name</label>
                                    <input type='text' title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='vendor_name' placeholder='Enter vendor Name' onChange={getTaskData} required />
                                    {error.vendor_name ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.catname}</span> : ""}
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Vendor Type</label>
                                    <div className='custom-select-wrap'>
                                    <select class="form-select" aria-label="Default select example" name='type' onChange={getTaskData} required>
                                    <option value="">Select </option>
                                   <option value="Individual">Individual</option>
                                    <option value="Company">Company</option>
                                    </select>
                                </div>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Website</label>
                                    <input type='url'  className="form-control" name='website' placeholder='http://www.econstra.com' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Address</label>
                                    <input type='text' title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='address' placeholder='Enter Product Code' onChange={getTaskData} required />
                                </div>
                            </div>
                            
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Country</label>
                                    <Select
                                    name='country'
                                    options={countries}
                                    onChange={getTaskData}
                                    placeholder="Select a country"
                                    />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>State</label>
                                    <input type='text' title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='state' placeholder='Enter state' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>City</label>
                                    <input type='text' title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='city' placeholder='Enter city' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Zip</label>
                                    <input type='text' title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='zip' placeholder='Enter zip Code' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Email</label>
                                    <input type='email'  className="form-control" name='email' placeholder='Enter your email' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Phone</label>
                                    <input type='text' title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='phone' placeholder='Enter your phone' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Mobile</label>
                                    <input type='text' title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='mobile' placeholder='Enter your mobile number' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>GST Treatment</label>
                                    <div className='custom-select-wrap'>
                                    <select class="form-select" aria-label="Default select example" name='gst_treatment' onChange={getTaskData} required>
                                    <option value="">Select One</option>
                                        <option value="regular">Registered Business - Regular</option>
                                        <option value="composition">Registered Business - Composition</option>
                                        <option value="unregistered">Unregistered Business</option>
                                        <option value="consumer">Consumer</option>
                                        <option value="overseas">Overseas</option>
                                        <option value="special_economic_zone">Special Economic Zone</option>
                                        <option value="deemed_export">Deemed Export</option>
                                    <option value="uin_holders">UIN Holders</option>
                                    </select>
                                </div>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>GSTIN</label>
                                    <input type='text' title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*"  className="form-control text-uppercase" name='gstin' placeholder='e.g. BE0477472501' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>PAN</label>
                                    <input type='text' title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='pan' placeholder='e.g. ABCTY1234k' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Bank Account Number</label>
                                    <input type='text' title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='account_number' placeholder='e.g. 6345234564539' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Bank Name</label>
                                    <input type='text' title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='bank_name' placeholder='e.g. HDFC' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Account Holder</label>
                                    <input type='text'  pattern="[A-Za-z0-9 ]*" className="form-control" name='account_holder' placeholder='e.g. Anil Gupta' onChange={getTaskData} required />
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>IFSC</label>
                                    <input type='text' title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='ifsc_code' placeholder='e.g. HDFC0000088' onChange={getTaskData} required />
                                </div>
                            </div>
                            
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Upload File (if any)</label>
                                    <input type='file' className='form-control' placeholder='Upload file' accept=".png, .jpg, .jpeg" onChange={fileUpload} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-end">
                        <button type="reset" class="btn btn-exp-light me-2">Reset</button>
                        <button type="submit" class="btn btn-exp-green">Create</button>
                    </div>
                </form>
            </div>
        </React.Fragment>
    )
}

export default AddNewVendor;
