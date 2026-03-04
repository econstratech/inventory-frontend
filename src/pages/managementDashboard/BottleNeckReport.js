import React, { useState } from 'react'
import Form from 'react-bootstrap/Form';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 16,
                }
            }
        },
        title: {
            display: true,
            text: 'Sujit Paul',
            font: {
                size: 18,                
            }
        },
        
    },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const data = {
    labels,
    datasets: [
        {
            label: 'Total Task',
            data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
            backgroundColor: 'rgb(97, 97, 255)',
        },
        {
            label: 'Pending Task',
            data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
            backgroundColor: 'rgb(223, 47, 74)',
        },
        {
            label: 'Completed Task',
            data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
            backgroundColor: 'rgb(0, 200, 117)',
        },
        {
            label: 'Delayed Task',
            data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
            backgroundColor: 'rgb(253, 171, 61)',
        },
    ],
};

function BottleNeckReport() {
    const [employee, setEmployee] = useState({
        startData: "",
        endDate: ""
        //depertment: ""
    })
    const fms = [
        { value: 'orderToDelivery', label: 'Order to Delivery' },
        { value: 'employeeOnboarding', label: 'Employee Onboarding' },
        { value: 'box', label: 'Box' },
        { value: 'newWorkFlow', label: 'New Work Flow' },
        { value: 'purchase', label: 'Purchase' }
    ]


    return (
        <React.Fragment>
            <div className='card mb-4'>
                <div className="card-header">
                    <h3 className="card-title">Bottle-Neck Report</h3>
                </div>
                <div className='card-body pb-1'>
                    <Form className='w-100'>
                        <div className='row'>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Form <span className='text-exp-red'>*</span></label>
                                    <div className="exp-datepicker-cont">
                                        <span className="cal-icon"><i class="bi bi-calendar3" /></span>
                                        <DatePicker
                                            selected={employee.startData} onChange={(date) => setEmployee({ ...employee, startData: date })}
                                            dateFormat="dd/MM/YYYY"
                                            placeholderText='Select Date'
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>To <span className='text-exp-red'>*</span></label>
                                    <div className="exp-datepicker-cont">
                                        <span className="cal-icon"><i class="bi bi-calendar3" /></span>
                                        <DatePicker
                                            selected={employee.endDate} onChange={(date) => setEmployee({ ...employee, endDate: date })}
                                            dateFormat="dd/MM/YYYY"
                                            placeholderText='Select Date'
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>FMS <span className='text-exp-red'>*</span></label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name='fms'
                                            options={fms}
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
                    </Form>
                </div>
                <div className="card-footer d-flex justify-content-end">
                    <button type="reset" name="reset_button" className="btn btn-exp-light me-2">Reset</button>
                    <button type="submit" name="submit_button" className="btn btn-exp-green">Submit</button>
                </div>
            </div>
            <div className="row">
                {/* no data found */}
                <div className="col-12">
                    <div className="card bg-warning-light mb-0">
                        <div className="card-body">
                            <div className="exp-no-data-found text-exp-red">
                                <img className="task-img mb-3" src={process.env.PUBLIC_URL + 'assets/images/search-no-record-found.webp'} alt="No task" />
                                <h6>No Record Found</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-12'>
                    <div className='card mb-0'>
                        <div className='card-body'>
                            <Bar options={options} data={data} />
                        </div>
                    </div>

                </div>
            </div>

        </React.Fragment>
    )
}

export default BottleNeckReport