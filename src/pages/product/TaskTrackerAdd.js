import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PrivateAxiosFile } from '../../../environment/AxiosInstance';
import { formatDate } from '../../../environment/DateFormat';
import { ErrorMessage } from '../../../environment/ToastMessage';
import { UserAuth } from '../../auth/Auth';
import { AllUser, GetTaskPriority, GetTaskRemainder } from '../../../environment/GlobalApi';
import "../../global.css"

function TaskTrackerAdd() {
    // Set reminder
    const { Logout } = UserAuth();
    const [isCheckedReminder, setIsCheckedReminder] = useState(false);
    const [isFileRequired, setIsFileRequired] = useState(false);
    const [error, setError] = useState({});
    const [taskData, setTaskData] = useState({
        "task_name": "",
        "assign_by": "",
        "assign_to": "",
        "planned_date": "",
        "file": "",
        "description": "",
        "priority": "",
        "notification_to": "",
        "auditor": "",
        "remember_mode": "",
        "reminder_time": "",
        "remainder_frequency": "",
        "is_require_file": "",
    });
    const [User, setUser] = useState([
        { value: 'select', label: '-Select-' }
    ]);
    const [priority, setPriority] = useState([
        { value: 'select', label: '-Select-' }
    ]);
    const [reminderMode, selectReminderMode] = useState([
        { value: 'select', label: '-Select-' }
    ]);
    const handleSetReminder = (e) => {
        setIsCheckedReminder(e.target.checked);
    };
    const handleFIleRequired = (e) => {
        setTaskData({ ...taskData, is_require_file: e.target.checked });
    };

    useEffect(() => {
        const AllUsers = async () => {
            const newUserArray = await AllUser();
            if (newUserArray == 401) {
                Logout();
            }
            const newUserList = newUserArray.user.map((data) => ({
                value: data.id,
                label: data.name
            }));
            setUser(newUserList);
        }
        const TaskPriority = async () => {
            const response = await GetTaskPriority();
            if (response == 401) {
                Logout();
            }
            const newUserList = response.data.map((data) => ({
                value: data.id,
                label: data.title
            }));
            setPriority(newUserList);
        }
        const Remainder = async () => {
            const response = await GetTaskRemainder();
            if (response == 401) {
                Logout();
            }
            const newRemainderList = response.data.map((data) => ({
                value: data.id,
                label: data.title
            }));
            selectReminderMode(newRemainderList);
        }
        TaskPriority()
        AllUsers();
        Remainder();
    }, []);

    //for datepicker
    const [issueDate, setIssueDate] = useState({
        startData: "",
    })

    const fileUpload = async (e) => {
        const file = e.target.files[0];
        let fileSize = file.size;
        if (Number(fileSize) >= 2097152) {
            setError({ file: "This image in getter than 2MB" })
        } else {
            setTaskData({ ...taskData, file: e.target.files[0] });
            setError("")
        }
    }


    const getTaskData = async (e, data) => {

        if (e.target) {
            var name = e.target.name;
            setTaskData({ ...taskData, [name]: e.target.value })
            // formData.append(name, e.target.value)
            // console.log(name, e.target.value);
        } else {
            setTaskData({ ...taskData, [data.name]: e.value })
            // formData.append(data.name, e.value)
        }
    }

    const SubmitData = async (e) => {
        e.preventDefault();
        let formData = await new FormData();
        formData.append('task_name', taskData.task_name)
        formData.append('assign_by', taskData.assign_by)
        formData.append('assign_to', taskData.assign_to)
        formData.append('planned_date', issueDate.startData ? formatDate(issueDate.startData.toString()) : "")
        formData.append('description', taskData.description)
        formData.append('priority', taskData.priority)
        formData.append('notification_to', taskData.notification_to)
        formData.append('auditor', taskData.auditor)
        if (isCheckedReminder) {
            formData.append('reminder_mode', taskData.remember_mode)
            formData.append('reminder_time', taskData.reminder_time)
            formData.append('remainder_frequency', taskData.remainder_frequency)
        } else {
            formData.append('reminder_mode', "")
            formData.append('reminder_time', "")
            formData.append('remainder_frequency', "")
        }
        formData.append('is_require_file', taskData.is_require_file)
        formData.append('file', taskData.file)
        console.log(formData.get('file'));
        PrivateAxiosFile.post("task/add", formData)
            .then((res) => {
                console.log(res);
            }).catch((err) => {
                console.log(err);
                var userError = {}
                if (!err.response.data.errorMessage) {
                    err.response.data.details.map((err) => (
                        userError[err.context.label] = err.message
                    ))
                } else {
                    ErrorMessage(err.response.data.errorMessage);
                }
                setError(userError)
            })

    }

    

    return (
        <React.Fragment>
            <div className='mb-4'>
                <Link to="/task-tracker" className='text-dark back-btn'><i class="bi bi-arrow-left-short me-1" />Back</Link>
            </div>
            <div className='card'>
                <div className='card-header'>
                    <h3 className="card-title">Add New Task</h3>
                </div>
                <form action='' onSubmit={SubmitData} method='post'>
                    <div className='card-body pb-1'>
                        <div className='row'>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Task Name</label>
                                    <input type='text' className="form-control" name='task_name' placeholder='Enter Task Name' onChange={getTaskData} />
                                    {error.task_name ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.task_name}</span> : ""}
                                </div>

                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Assigned By <span className='text-exp-red'>*</span></label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name='assign_by'
                                            options={User}
                                            theme={(theme) => ({
                                                ...theme,
                                                colors: {
                                                    ...theme.colors,
                                                    primary25: '#ddddff',
                                                    primary: '#6161ff',
                                                },
                                            })}
                                            onChange={getTaskData}
                                        />
                                    </div>
                                    {error.assign_by ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.assign_by}</span> : ""}
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Assigned To <span className='text-exp-red'>*</span></label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name='assign_to'
                                            options={User}
                                            theme={(theme) => ({
                                                ...theme,
                                                colors: {
                                                    ...theme.colors,
                                                    primary25: '#ddddff',
                                                    primary: '#6161ff',
                                                },
                                            })}
                                            onChange={getTaskData}
                                        />
                                    </div>
                                    {error.assign_to ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.assign_to}</span> : ""}
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Planned Date <span className='text-exp-red'>*</span></label>
                                    <div className="exp-datepicker-cont">
                                        <span className="cal-icon"><i class="bi bi-calendar3" /></span>
                                        <DatePicker
                                            selected={issueDate.startData} onChange={(date) => setIssueDate({ ...issueDate, startData: date })}
                                            dateFormat="dd/MM/YYYY"
                                            placeholderText='Select Date'
                                        />
                                    </div>
                                    {error.planned_date ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.planned_date}</span> : ""}
                                </div>
                            </div>

                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Upload File (if any)</label>
                                    <input type='file' className='form-control' placeholder='Enter Task Name' accept=".png, .jpg, .jpeg, .pdf, .xls, .xlsx , .doc" onChange={fileUpload} />
                                </div>
                            </div>
                            <div className='col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Description</label>
                                    <textarea className='form-control' name='description' placeholder='Enter Description' rows={3} onChange={getTaskData}></textarea>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Task Priority <span className='text-exp-red'>*</span></label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name='priority'
                                            options={priority}
                                            theme={(theme) => ({
                                                ...theme,
                                                colors: {
                                                    ...theme.colors,
                                                    primary25: '#ddddff',
                                                    primary: '#6161ff',
                                                },
                                            })}
                                            onChange={getTaskData}
                                        />
                                    </div>
                                    {error.priority ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.priority}</span> : ""}
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Notify To (if not done)</label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name='notification_to'
                                            options={User}
                                            theme={(theme) => ({
                                                ...theme,
                                                colors: {
                                                    ...theme.colors,
                                                    primary25: '#ddddff',
                                                    primary: '#6161ff',
                                                },
                                            })}
                                            onChange={getTaskData}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Auditor</label>
                                    <div className='custom-select-wrap'>
                                        <Select
                                            name='auditor'
                                            options={User}
                                            theme={(theme) => ({
                                                ...theme,
                                                colors: {
                                                    ...theme.colors,
                                                    primary25: '#ddddff',
                                                    primary: '#6161ff',
                                                },
                                            })}
                                            onChange={getTaskData}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='col-12'>
                                <div className='form-group'>
                                    <label className="custom-switch" >
                                        <span className='switch-name'>Set Reminder</span>
                                        <input type="checkbox" onChange={handleSetReminder} />
                                        <div className="switch-slider switch-round" />
                                    </label>
                                </div>
                            </div>
                            {isCheckedReminder && (
                                <div className='col-12 reminder-wrap'>
                                    <div className='row'>
                                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                            <div className='form-group'>
                                                <label className='form-label'>Reminder Mode</label>
                                                <div className='custom-select-wrap'>
                                                    <Select
                                                        name='remember_mode'
                                                        options={reminderMode}
                                                        theme={(theme) => ({
                                                            ...theme,
                                                            colors: {
                                                                ...theme.colors,
                                                                primary25: '#ddddff',
                                                                primary: '#6161ff',
                                                            },
                                                        })}
                                                        onChange={getTaskData}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                            <div className='form-group'>
                                                <label className='form-label'>Reminder Before Time </label>
                                                <input type='number' name='reminder_time' className='form-control' placeholder='Reminder Before Time' onChange={getTaskData} />
                                            </div>
                                        </div>
                                        <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                            <div className='form-group'>
                                                <label className='form-label'>Reminder Frequency</label>
                                                <input type='number' name='remainder_frequency' className='form-control' placeholder='Reminder Frequency' onChange={getTaskData} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className='col-12'>
                                <div className='form-group'>
                                    <label className="custom-switch" >
                                        <span className='switch-name'>Attachment is required for this task</span>
                                        <input type="checkbox" name='is_require_file' onChange={handleFIleRequired} />
                                        <div className="switch-slider switch-round" />
                                    </label>
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

export default TaskTrackerAdd;