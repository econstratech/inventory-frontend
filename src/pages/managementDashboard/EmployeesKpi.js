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

function EmployeesKpi() {
    const [employee, setEmployee] = useState({
        startData: "",
        endDate: ""
        //depertment: ""
    })
    const departments = [
        { value: 'all', label: 'All' },
        { value: 'administrations', label: 'Administrations' },
        { value: 'accounts', label: 'Accounts' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'HR' }
    ]
    const doerName = [
        { value: 'SujitPaul', label: 'Sujit Paul' },
        { value: 'SandipKrPaul', label: 'Sandip Kr Paul' },
        { value: 'GopalMukherjee', label: 'Gopal Mukherjee' },
        { value: 'SubhadeepChowdhury', label: 'Subhadeep Chowdhury' },
        { value: 'MoumitaShome', label: 'Moumita Shome' },
        { value: 'ManasiMukherjee', label: 'Manasi Mukherjee' },
        { value: 'KaushikBiswas', label: 'Kaushik Biswas' }
    ]


    return (
        <React.Fragment>
            <div className='card mb-4'>
                <div className="card-header">
                    <h3 className="card-title">EMPLOYEE'S KPI</h3>
                </div>
                <div className='card-body pb-1'>
                    <Form className='w-100'>
                        <div className='row'>
                            <div className='col-md-3 col-sm-6 col-12'>
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
                            <div className='col-md-3 col-sm-6 col-12'>
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
                            <div className='col-md-3 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Departmant <span className='text-exp-red'>*</span></label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name='Departmant'
                                            options={departments}
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
                            <div className='col-md-3 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Doer Name <span className='text-exp-red'>*</span></label>
                                    <div className='custom-select-wrap multi-select'>
                                        <Select
                                            name='doerName'
                                            options={doerName}
                                            isMulti
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
                            <div className='col-12'>
                                <div className='form-group mb-1'>
                                    <div className='d-flex flex-wrap'>
                                        <label className="custom-checkbox me-4">
                                            Work Flow
                                            <input type="checkbox" name='workflow' />
                                            <span className="checkmark" />
                                        </label>
                                        <label className="custom-checkbox me-4">
                                            Checksheet
                                            <input type="checkbox" name='checksheet' />
                                            <span className="checkmark" />
                                        </label>
                                        <label className="custom-checkbox me-4">
                                            Delegation
                                            <input type="checkbox" />
                                            <span className="checkmark" name='delegation' />
                                        </label>
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
                 {/* no data found end */}
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

export default EmployeesKpi