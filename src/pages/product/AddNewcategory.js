import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import Select from 'react-select'
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
// import { UserAuth } from '../auth/Auth';
// import { AllUser, GetTaskPriority, GetTaskRemainder } from '../../environment/GlobalApi';
import "../global.css"
import { PrivateAxios } from '../../environment/AxiosInstance';
//import { useNavigate } from 'react-router-dom';

function AddNewcategory() {
    const navigate = useNavigate();
    const [error, setError] = useState({});

    const [productCategoryData, setProductCategoryData] = useState({
        "title": "",
    });


    const SubmitData = async (e) => {
        e.preventDefault();

        PrivateAxios.post("product-category", productCategoryData)
            .then((res) => {

                if (res.status === 200) {
                    SuccessMessage('Product category added!');
                    navigate('/category');
                }
            }).catch((err) => {
                ErrorMessage(err.response.data.message);
                console.error('There was an error!', err);
            })

    }

    return (
        <React.Fragment>
            <div className='p-4'>
                <div className='mb-4'>
                    {/* <Link to="/category" className='text-dark'><i class="fas fa-arrow-left me-1" /><span class="ms-2 f-s-16">Back</span></Link> */}
                    <button
                        type="button"
                        className="link-btn text-dark "
                        onClick={() => navigate(-1)} // Navigate back in history
                    >
                        <i className="fas fa-arrow-left me-1" />
                        <span className="ms-2 f-s-16">Back</span>
                    </button>
                </div>
                <div className='card'>
                    <div className='card-header'>
                        <h3 className="card-title">Add New Category</h3>
                    </div>
                    <form action='' onSubmit={SubmitData} method='post'>
                        <div className='card-body pb-1'>
                            <div className='row'>
                                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Category Name</label>
                                        <input type='text' className="form-control" name='title' placeholder='Enter Category Name' onChange={(e) => setProductCategoryData({ ...productCategoryData, title: e.target.value })} />
                                        {error.title ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.title}</span> : ""}
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
            </div>
        </React.Fragment>
    )
}

export default AddNewcategory;
