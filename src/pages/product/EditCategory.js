import React, { useEffect, useState } from 'react'

import Select from 'react-select'


import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import { UserAuth } from '../auth/Auth';
import { AllUser, GetTaskPriority, GetTaskRemainder } from '../../environment/GlobalApi';
import "../global.css"
import { PrivateAxios } from '../../environment/AxiosInstance';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';

const EditCategory = () => {
    const location = useLocation();
    const { data } = location.state || {};
    const { Logout } = UserAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const status = [
        { value: '1', label: 'Active' },
        { value: '0', label: 'In-active' }
    ]

    const [formData, setFormData] = useState({
        'catname': data.title,
        'status': data.status,
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState({});

    const getTaskData = async (e, data) => {

        if (e.target) {
            var name = e.target.name;
            setFormData({ ...formData, [name]: e.target.value })
        } else {
            setFormData({ ...formData, [data.name]: e.value })
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        //console.log(formData);

        try {
            const response = await PrivateAxios.put(`category/updatecat/${id}`, formData);
            if (response.status === 200) {
                SuccessMessage('Product category updated!');
                navigate('/category');
            }
        } catch (error) {
            ErrorMessage('Error: Unable to update product category.');
            console.error('There was an error!', error);
        }
    };

    return (
        <React.Fragment>
            <div className='p-4'>
                <div className='mb-4'>
                    {/* <Link to="/category" className="text-dark">
                        <i class="fas fa-arrow-left me-1"></i>
                        <span class="ms-2 f-s-16">Back</span>
                    </Link> */}
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
                        <h3 className="card-title">Update Category</h3>
                    </div>
                    <form action='' onSubmit={handleSubmit} method='post'>
                        <div className='card-body pb-1'>
                            <div className='row'>
                                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Category Name</label>
                                        <input type='text' className="form-control" name='catname' placeholder='Enter Category Name'
                                            value={formData.catname} onChange={getTaskData} required />
                                        {error.catname ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.catname}</span> : ""}
                                    </div>

                                </div>
                                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Status <span className='text-exp-red'>*</span></label>
                                        <div className='custom-select-wrap'>
                                            <Select
                                                onChange={getTaskData}
                                                value={formData.status == 0 ? status[1] : status[0]}
                                                name='status'
                                                options={status}
                                                theme={(theme) => ({
                                                    ...theme,
                                                    colors: {
                                                        ...theme.colors,
                                                        primary25: '#ddddff',
                                                        primary: '#6161ff',
                                                    },
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class="card-footer d-flex justify-content-end">
                            <button type="reset" class="btn btn-exp-light me-2">Reset</button>
                            <button type="submit" class="btn btn-exp-green">Update</button>
                        </div>
                    </form>
                </div>
            </div>
        </React.Fragment>
    )
}

export default EditCategory;

