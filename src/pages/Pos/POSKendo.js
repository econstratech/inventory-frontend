import React, { useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';

const POSKendo = () => {
  const [cartFilterShow, setCartFilterShow] = useState(false);
  const cartFilterModalClose = () => setCartFilterShow(false);
  const cartFilterModalShow = () => setCartFilterShow(true);

  const [count, setCount] = useState(1);
  const [showCounter, setShowCounter] = useState(false);

  const increase = () => setCount(count + 1);
  const decrease = () => setCount(count > 0 ? count - 1 : 0);

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setCount(value);
    } else {
      setCount(0);
    }
  };

  const toggleCounter = () => {
    setShowCounter(!showCounter);
  };

  const data = [
    {
      id: 'E0589',
      name: 'Econstra Business Consultants LLP',
      description: 'Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
      location: 'EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091',
      quantity: 4,
      uom: 'Kg',
      amount: 1600,
      image: process.env.PUBLIC_URL + 'assets/images/demo-logo.png',
    },
    {
      id: 'E05800',
      name: 'Econstra Business Consultants LLP',
      description: 'Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
      location: 'EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091',
      quantity: 3,
      uom: 'Kg',
      amount: 1600,
      image: process.env.PUBLIC_URL + 'assets/images/demo-logo2.jpg',
    },
  ];

  return (
    <>
      <div className="p-4 position-relative">
        <div className="card">
          <div className="card-body py-5">
            <div className="text-center imgBx">
              <img src={process.env.PUBLIC_URL + 'assets/images/empty-box.png'} alt="pos" />
              <p>Your don't have any inventory item</p>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <Link to="/inventory/inventory-master" className="btn btn-exp-primary" role="button">
                <i className="fas fa-plus"></i>
                <span className="ms-2">Add Item</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="card mb-0">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center gap-2">
              <div className="form-group d-flex align-items-center gap-2 max_400">
                <label className="form-label">Search</label>
                <input type="search" placeholder="Search..." className="form-control" />
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/inventory/inventory-master" className="btn btn-exp-primary btn-sm" role="button">
                  <i className="fas fa-plus"></i>
                  <span className="ms-2">Add Item</span>
                </Link>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Go to Cart</Tooltip>}
                >
                  <Link
                    to="/pos/view-details"
                    className="btn btn-exp-purple-outline btn-sm d-inline-flex align-items-center"
                    ria-controls="example-collapse-text"
                    aria-expanded="false"
                    onClick={cartFilterModalShow}
                  >
                    <span className="count">2</span>
                    <span className="ms-2">View Cart</span>
                  </Link>
                </OverlayTrigger>
              </div>
            </div>
            <div className="rounded-10 table-responsive mb-0">
              
                <Grid
                  data={data}
                  filterable={true}                  
                >
                  <GridColumn
                    field="id"
                    title="Item Id"
                    width="80px"
                    headerStyle={{ minWidth: '80px' }}
                    cellStyle={{ minWidth: '80px' }}
                    headerClassName="fw-bold"
                    filterable={false}
                  />
                  <GridColumn
                    title="Item Name"
                    cell={(props) => (
                      <td>
                        <div className="profile-wrap">
                          <div className="exp-avtar border pos_avatar">
                            <img className="prof-img" src={props.dataItem.image} alt="logo" />
                          </div>
                          <div className="ps-2 profile-name-wrap">
                            <h5 className="profile-name">{props.dataItem.name}</h5>
                          </div>
                        </div>
                      </td>
                    )}
                    width="300px"
                    headerStyle={{ minWidth: '300px' }}
                    cellStyle={{ minWidth: '300px' }}
                    headerClassName="fw-bold"
                  />
                  <GridColumn
                    field="description"
                    title="Item Description"
                    width="300px"
                    headerStyle={{ minWidth: '300px' }}
                    cellStyle={{ minWidth: '300px' }}
                    headerClassName="fw-bold"
                  />
                  <GridColumn
                    field="location"
                    title="Location"
                    width="300px"
                    headerStyle={{ minWidth: '300px' }}
                    cellStyle={{ minWidth: '300px' }}
                    headerClassName="fw-bold"
                  />
                  <GridColumn
                    field="quantity"
                    title="Quantity"
                    width="100px"
                    headerStyle={{ minWidth: '100px' }}
                    cellStyle={{ minWidth: '100px' }}
                    headerClassName="fw-bold justify-content-end"
                    className='text-end fw-bold'
                    filterable={false}
                  />
                  <GridColumn
                    field="uom"
                    title="UOM"
                    width="100px"
                    headerStyle={{ minWidth: '100px' }}
                    cellStyle={{ minWidth: '100px' }}
                    headerClassName="fw-bold"
                    filterable={false}
                  />
                  <GridColumn
                    field="amount"
                    title="Amount"
                    width="150px"
                    headerStyle={{ minWidth: '150px' }}
                    cellStyle={{ minWidth: '150px' }}
                    headerClassName="fw-bold justify-content-end"
                    filterable={false}
                    cell={(props) => (
                      <td className="text-end">
                        <p className="mb-0 fw-bold">₹{props.dataItem.amount}</p>
                      </td>
                    )}
                  />
                  <GridColumn
                    title="Action"
                    width="150px"
                    headerStyle={{ minWidth: '150px' }}
                    cellStyle={{ minWidth: '150px' }}
                    headerClassName="fw-bold"
                    filterable={false}
                    cell={(props) => (
                      <td>
                        {!showCounter && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Add to Cart</Tooltip>}
                          >
                            <button
                              className="me-1 icon-btn"
                              type="button"
                              onClick={toggleCounter}
                            >
                              <i className="fas fa-shopping-cart"></i>
                            </button>
                          </OverlayTrigger>
                        )}
                        {showCounter && (
                          <div className="count_btn">
                            <button onClick={decrease} className="table-btn">
                              <i className="fas fa-minus f-s-10"></i>
                            </button>
                            <input
                              type="text"
                              value={count}
                              onChange={handleChange}
                              className="f-s-12 mb-0 text-center fw-bold rounded-1 count_number border-0"
                              style={{ width: '50px' }}
                              min={0}
                            />
                            <button onClick={increase} className="table-btn">
                              <i className="fas fa-plus f-s-10"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  />
                </Grid>
            </div>
          </div>
        </div>
        <div className={`view_cart_bottom_div ${showCounter ? 'show' : ''}`}>
          <Link to="/pos/view-details" className="view_cart_bottom_Link">
            <span className="d-block text-dark fs-5 fw-medium line-height-1">
              Added <span className="fw-bold gth-bg-purple text-white rounded-pill px-2 py-1">4</span> items into cart
            </span>
            <span className="btn btn-primary d-block">View Cart</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default POSKendo;