import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, OverlayTrigger, Table, } from 'react-bootstrap'
import { PrivateAxios } from '../../environment/AxiosInstance'
import Loader from '../landing/loder/Loader';
import { SuccessMessage, ErrorMessage } from '../../environment/ToastMessage';
import SettingsPageTopBar from './SettingsPageTopBar';
import { Tooltip } from 'antd';


function Brands() {
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [searchBrandName, setSearchBrandName] = useState('');
    const [update, setUpdate] = useState(false)
    const [create, setCreate] = useState(false)
    const [deleteShow, setDeleteShow] = useState(false)
    const [deleteId, setDeleteId] = useState('')
    const [brandValue, setBrandValue] = useState('')
    const [brandInputValue, setBrandInputValue] = useState({
        "name": "",
        "description": ""
    })

    const fetchBrands = async (brandName = searchBrandName) => {
        setLoading(true)
        try {
            const queryParams = {};
            if (brandName?.trim()) {
                queryParams.brandName = brandName.trim();
            }

            const response = await PrivateAxios.get('/master/brand/list', {
                params: queryParams,
            });
            setLoading(false)
            setBrands(response.data.data);
        } catch (error) {
            setLoading(false)
            console.error("Error fetching brands:", error);
            ErrorMessage("Failed to fetch brands");
        }
    };

    useEffect(() => {
        fetchBrands();
    }, [])

    const handleSearchBrands = () => {
        fetchBrands(searchBrandName);
    };

    const handleClearSearch = () => {
        setSearchBrandName('');
        fetchBrands('');
    };

    const brandUpdateModelClose = () => {
        setUpdate(false);
        setBrandValue('')
    }

    const brandCreateModelClose = () => {
        setCreate(false)
        setBrandInputValue({
            "name": "",
            "description": ""
        })
    }

    const deleteModalClose = () => {
        setDeleteShow(false);
        setDeleteId('')
    }

    const createBrand = () => {
        if (!brandInputValue.name || brandInputValue.name.trim() === '') {
            ErrorMessage("Please enter brand name");
            return;
        }

        setLoading(true)
        PrivateAxios.post("/master/brand", brandInputValue)
            .then((res) => {
                setLoading(false)
                SuccessMessage(res.data.message || "Brand created successfully");
                brandCreateModelClose();
                fetchBrands();
            }).catch((err) => {
                setLoading(false)
                ErrorMessage(err.response?.data?.message || "Failed to create brand");
                console.log(err);
            })
    }

    const UpdateBrand = () => {
        if (!brandValue.name || brandValue.name.trim() === '') {
            ErrorMessage("Please enter brand name");
            return;
        }

        setLoading(true)
        PrivateAxios.put(`master/brand/${brandValue.id}`, brandValue)
            .then((res) => {
                setLoading(false)
                SuccessMessage(res.data.message || "Brand updated successfully");
                brandUpdateModelClose();
                fetchBrands();
            }).catch((err) => {
                setLoading(false)
                ErrorMessage(err.response?.data?.message || "Failed to update brand");
                console.log(err);
            })
    }

    const deleteBrand = () => {
        setLoading(true)
        PrivateAxios.delete(`master/brand/${deleteId}`)
            .then((res) => {
                setLoading(false)
                SuccessMessage(res.data.message || "Brand deleted successfully");
                deleteModalClose();
                fetchBrands();
            }).catch((err) => {
                setLoading(false)
                ErrorMessage(err.response?.data?.message || "Failed to delete brand");
                console.log(err);
            })
    }

    return (
        <>
            {loading ? <Loader /> :
                <>
                    <SettingsPageTopBar />
                    <div className='p-4'>
                        <div className='card'>
                            <div className='p-3 d-flex justify-content-end align-items-center gap-2'>
                                <input
                                    type='text'
                                    className='form-control form-control-sm'
                                    placeholder='Search brand'
                                    value={searchBrandName}
                                    onChange={(e) => setSearchBrandName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchBrands();
                                        }
                                    }}
                                    style={{ maxWidth: '220px' }}
                                />
                                <button type='button' onClick={handleSearchBrands} className='btn btn-sm btn-outline-secondary'>
                                    Search
                                </button>
                                {searchBrandName && (
                                    <button type='button' onClick={handleClearSearch} className='btn btn-sm btn-outline-secondary'>
                                        Clear
                                    </button>
                                )}
                                <button type='button' onClick={() => setCreate(true)} className='me-2 btn btn-sm btn-outline-primary ms-auto'>
                                    <i className='fas fa-plus me-2'></i>
                                    New
                                </button>
                            </div>
                            <div className='card-body'>
                            <div className='compare_price_view_table'>
                                <Table responsive className="table-bordered primary-table-head">
                                    <thead>
                                        <tr>
                                            <th scope="col">SL.NO</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {brands.map((data, i) => (
                                            <tr key={data.id}>
                                                <td scope="row">{i + 1}</td>
                                                <td>{data.name}</td>
                                                <td>{data.description || 'N/A'}</td>
                                                <td>
                                                    <div className="d-flex">
                                                        <Tooltip title='Edit'>
                                                            <button type='button' onClick={() => { setBrandValue(data); setUpdate(true) }} className="me-1 icon-btn">
                                                                <i className='fas fa-pen d-flex'></i>
                                                            </button>
                                                        </Tooltip>

                                                        <Tooltip title='Delete'>
                                                            <button type='button' onClick={() => { setDeleteShow(true); setDeleteId(data.id) }} className="me-1 icon-btn" >
                                                                <i className='fas fa-trash-alt text-danger'></i>
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            </div>
                        </div>
                    </div>
                </>
            }

            {/* create Brand */}
            <Modal show={create} onHide={brandCreateModelClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Brand</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group mb-3'>
                            <label className='form-label'>Name <span className='text-danger'>*</span></label>
                            <input 
                                type='text' 
                                className='form-control' 
                                placeholder='Enter brand name' 
                                value={brandInputValue.name}
                                onChange={(e) => setBrandInputValue({ ...brandInputValue, name: e.target.value })} 
                            />
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>Description</label>
                            <textarea 
                                className='form-control' 
                                placeholder='Enter brand description' 
                                rows="3"
                                value={brandInputValue.description}
                                onChange={(e) => setBrandInputValue({ ...brandInputValue, description: e.target.value })} 
                            />
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button type='reset' variant="secondary" className='btn-sm' onClick={brandCreateModelClose}>
                        Close
                    </Button>
                    <button type='submit' className='btn btn-sm btn-success' onClick={createBrand}>
                        Save
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Update Brand */}
            <Modal show={update} onHide={brandUpdateModelClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Update Brand</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-12'>
                        <div className='form-group mb-3'>
                            <label className='form-label'>Name <span className='text-danger'>*</span></label>
                            <input 
                                type='text' 
                                value={brandValue.name || ''} 
                                className='form-control' 
                                placeholder='Enter brand name' 
                                onChange={(e) => setBrandValue({ ...brandValue, name: e.target.value })} 
                            />
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>Description</label>
                            <textarea 
                                className='form-control' 
                                placeholder='Enter brand description' 
                                rows="3"
                                value={brandValue.description || ''} 
                                onChange={(e) => setBrandValue({ ...brandValue, description: e.target.value })} 
                            />
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button type='reset' variant="secondary" className='btn-sm' onClick={brandUpdateModelClose}>
                        Close
                    </Button>
                    <Button type='submit' variant="success" className='btn-sm' onClick={UpdateBrand}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Brand */}
            <Modal
                show={deleteShow}
                onHide={deleteModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="delete-confirm-wrap text-center">
                        <div className="delete-confirm-icon mb-3 mt-2">
                            <img src={process.env.PUBLIC_URL + '/assets/images/delete-warning.svg'} alt="Warning" className="img-fluid" />
                        </div>
                        <h4 className="text-muted">Are you sure?</h4>
                        <p className="text-muted">
                            Do you really want to delete this brand?
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type='reset' className='btn btn-secondary btn-sm' onClick={deleteModalClose}>
                        Cancel
                    </button>
                    <button type='submit' className='btn btn-exp-red btn-sm' onClick={deleteBrand}>
                        Delete
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Brands
