import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { GetTaskMode, GetTaskPriority, GetTaskRemainder, GetTaskStatus } from '../../environment/GlobalApi';
import { UserAuth } from '../auth/Auth';

function TaskProperties() {
    const { Logout } = UserAuth();
    const [taskMode, setTaskMode] = useState(false);
    const [taskModeData, setTaskModeData] = useState({
        "title": "",
        "status": '1'
    });
    const [taskModeAllData, setTaskModeAllData] = useState([]);

    const [taskStatus, setTaskStatus] = useState(false);
    const [taskStatusData, setTaskStatusData] = useState({
        "title": "",
        "status": ""
    });
    const [taskStatusAllData, setTaskStatusAllData] = useState([]);

    const [priority, setPriority] = useState(false);
    const [priorityData, setPriorityData] = useState({
        "title": "",
        "status": ""
    });
    const [priorityAllData, setPriorityAllData] = useState([]);

    const [remainderMode, setRemainderMode] = useState(false);
    const [remainderModeData, setRemainderModeData] = useState({
        "title": "",
        "status": ""
    });
    const [remainderModeAllData, setRemainderModeAllData] = useState([]);


    const taskModeClose = () => {
        setTaskMode(false);
        setTaskModeData({ status: '1'.status, title: "" })
    };

    const taskModeShow = (e) => {
        if (e) {
            const taskModeDataFilter = taskModeAllData.filter((data) => (data.id === e));
            setTaskModeData({ status: taskModeDataFilter[0].status, title: taskModeDataFilter[0].title })
        }
        setTaskMode(true)
    };

    const taskStatusClose = () => setTaskStatus(false);
    const taskStatusShow = () => setTaskStatus(true);

    const priorityClose = () => setPriority(false);
    const priorityShow = () => setPriority(true);

    const remainderModeClose = () => setRemainderMode(false);
    const remainderModeShow = () => setRemainderMode(true);

    useEffect(() => {
        const taskMode = async () => {
            const result = await GetTaskMode();
            if (result == 401) {
                Logout();
            }
            setTaskModeAllData(result.data);
        }
        const taskStatus = async () => {
            const result = await GetTaskStatus();
            if (result == 401) {
                Logout();
            }
            setTaskStatusAllData(result.data);
        }
        const taskPriority = async () => {
            const result = await GetTaskPriority();
            if (result == 401) {
                Logout();
            }
            setPriorityAllData(result.data);
        }
        const taskRemainder = async () => {
            const result = await GetTaskRemainder();
            if (result == 401) {
                Logout();
            }
            setRemainderModeAllData(result.data);
        }
        taskMode();
        taskStatus();
        taskPriority();
        taskRemainder();
    }, [])
    const taskModeSubmit = (e) => {
        console.log(taskModeData);
    }


    return (
        <React.Fragment>
            <div className='d-flex gap-5 flex-wrap'>
                <div className='card col-12 col-md-5'>
                    <div className='card-header '>
                        <h3 className="card-title">TASK MODE</h3>
                        <Button onClick={() => taskModeShow('')} className='me-2  btn-sm  float-end'>
                            <i className='bi bi-plus-circle me-2'></i>
                            New
                        </Button>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">SL.NO</th>
                                <th scope="col">Name</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskModeAllData.map((data, i) => (
                                <tr>

                                    <th scope="row">{i + 1}</th>
                                    <td>{data.title}</td>
                                    <td>
                                        {
                                            data.status == 1 ? <span className='badge bg-success'>Active</span> : <span className='badge bg-danger'>Inactive</span>
                                        }
                                    </td>
                                    <td>
                                        <div className="d-flex">
                                            <OverlayTrigger
                                                placement="top"
                                                trigger="click"
                                                overlay={
                                                    <Tooltip>
                                                        Edit
                                                    </Tooltip>
                                                }
                                            >
                                                <Link to="#" className="me-1 icon-btn" onClick={() => taskModeShow(data.id)}>
                                                    <i className="fas fa-pen"></i>
                                                </Link>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        Delete
                                                    </Tooltip>
                                                }
                                            >
                                                <button className="me-1 icon-btn" >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='card col-12 col-md-6'>
                    <div className='card-header'>
                        <h3 className="card-title">TASK STATUS</h3>
                        <Button onClick={taskStatusShow} className='me-2  btn-sm  float-end'>
                            <i className='bi bi-plus-circle me-2'></i>
                            New
                        </Button>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">SL.NO</th>
                                <th scope="col">Name</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskStatusAllData.map((data, i) => (
                                <tr>
                                    <th scope="row">{i + 1}</th>
                                    <td>{data.title}</td>
                                    <td> {
                                        data.status == 1 ? <span className='badge bg-success'>Active</span> : <span className='badge bg-danger'>Inactive</span>
                                    }</td>
                                    <td>
                                        <div className="d-flex">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        Edit
                                                    </Tooltip>
                                                }
                                            >
                                                <Link to="#" className="me-1 icon-btn">
                                                    <i className="fas fa-pen"></i>
                                                </Link>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        Delete
                                                    </Tooltip>
                                                }
                                            >
                                                <button className="me-1 icon-btn" >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='d-flex gap-5 flex-wrap'>
                <div className='card col-12 col-md-5'>
                    <div className='card-header'>
                        <h3 className="card-title">TASK PRIORITIES</h3>
                        <Button onClick={priorityShow} className='me-2  btn-sm  float-end'>
                            <i className='bi bi-plus-circle me-2'></i>
                            New
                        </Button>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">SL.NO</th>
                                <th scope="col">Name</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priorityAllData.map((data, i) => (
                                <tr>
                                    <th scope="row">{i + 1}</th>
                                    <td>{data.title}</td>
                                    <td> {
                                        data.status == 1 ? <span className='badge bg-success'>Active</span> : <span className='badge bg-danger'>Inactive</span>
                                    }</td>
                                    <td>
                                        <div className="d-flex">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        Edit
                                                    </Tooltip>
                                                }
                                            >
                                                <Link to="#" className="me-1 icon-btn">
                                                    <i className="fas fa-pen"></i>
                                                </Link>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        Delete
                                                    </Tooltip>
                                                }
                                            >
                                                <button className="me-1 icon-btn" >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                </div>
                <div className='card col-12 col-md-6'>
                    <div className='card-header'>
                        <h3 className="card-title">REMINDER MODE</h3>
                        <Button onClick={remainderModeShow} className='me-2  btn-sm  float-end'>
                            <i className='bi bi-plus-circle me-2'></i>
                            New
                        </Button>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">SL.NO</th>
                                <th scope="col">Name</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {remainderModeAllData.map((data, i) => (
                                <tr>
                                    <th scope="row">{i + 1}</th>
                                    <td>{data.title}</td>
                                    <td> {
                                        data.status == 1 ? <span className='badge bg-success'>Active</span> : <span className='badge bg-danger'>Inactive</span>
                                    }</td>
                                    <td>
                                        <div className="d-flex">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        Edit
                                                    </Tooltip>
                                                }
                                            >
                                                <Link to="#" className="me-1 icon-btn">
                                                    <i className="fas fa-pen"></i>
                                                </Link>
                                            </OverlayTrigger>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        Delete
                                                    </Tooltip>
                                                }
                                            >
                                                <button className="me-1 icon-btn" >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>

            <Modal show={taskMode} onHide={taskModeClose}>
                <Modal.Header closeButton>
                    <Modal.Title>TASK MODE</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Title</label>
                            <input type='text' className={`form-control`} onChange={(e) => setTaskModeData({ ...taskModeData, title: e.target.value })} value={taskModeData.title} name='task_name' placeholder='Enter title' />
                        </div>
                    </div>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Status</label>
                            <Form.Select aria-label="Default select example" value={taskModeData.status} onChange={(e) => setTaskModeData({ ...taskModeData, status: e.target.value })} >
                                <option value="1"  >Active</option>
                                <option value="2">Inactive</option>
                            </Form.Select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className='btn-sm' onClick={taskModeClose}>
                        Close
                    </Button>
                    <Button variant="primary" className='btn-sm' onClick={taskModeSubmit}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={taskStatus} onHide={taskStatusClose}>
                <Modal.Header closeButton>
                    <Modal.Title>TASK STATUS</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Title</label>
                            <input type='text' className={`form-control`} name='task_name' placeholder='Enter title' />
                        </div>
                    </div>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Status</label>
                            <Form.Select aria-label="Default select example">
                                <option value="1" selected>Active</option>
                                <option value="2">Inactive</option>
                            </Form.Select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className='btn-sm' onClick={taskStatusClose}>
                        Close
                    </Button>
                    <Button variant="primary" className='btn-sm' onClick={taskStatusClose}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={priority} onHide={priorityClose}>
                <Modal.Header closeButton>
                    <Modal.Title>TASK PRIORITIES</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Title</label>
                            <input type='text' className={`form-control`} name='task_name' placeholder='Enter title' />
                        </div>
                    </div>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Status</label>
                            <Form.Select aria-label="Default select example">
                                <option value="1" selected>Active</option>
                                <option value="2">Inactive</option>
                            </Form.Select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className='btn-sm' onClick={priorityClose}>
                        Close
                    </Button>
                    <Button variant="primary" className='btn-sm' onClick={priorityClose}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={remainderMode} onHide={remainderModeClose}>
                <Modal.Header closeButton>
                    <Modal.Title>REMINDER MODE</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Title</label>
                            <input type='text' className={`form-control`} name='task_name' placeholder='Enter title' />
                        </div>
                    </div>
                    <div className='col-12'>
                        <div className='form-group'>
                            <label className='form-label'>Status</label>
                            <Form.Select aria-label="Default select example">
                                <option value="1" selected>Active</option>
                                <option value="2">Inactive</option>
                            </Form.Select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className='btn-sm' onClick={remainderModeClose}>
                        Close
                    </Button>
                    <Button variant="primary" className='btn-sm' onClick={remainderModeClose}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
}

export default TaskProperties