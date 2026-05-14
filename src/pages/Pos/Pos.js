import React, { useEffect, useState, useCallback } from 'react'
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Input, Button } from 'antd'
import { FilterOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import Select from 'react-select'
import { PrivateAxios } from '../../environment/AxiosInstance';
import { UserAuth } from '../auth/Auth';


const Pos = () => {
 const { getGeneralSettingssymbol } = UserAuth();
  //filter modal
  const [cartFilterShow, setCartFilterShow] = useState(false);
  const cartFilterModalClose = () => setCartFilterShow(false);
  const cartFilterModalShow = () => setCartFilterShow(true);

  const [stockEntries, setStockEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [productController, setProductController] = useState({
    page: 1,
    rowsPerPage: 15,
    searchKey: '',
    warehouseId: null,
  });
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    per_page: 15,
    has_next_page: false,
    has_prev_page: false,
  });

  // Filter input state (committed to productController on Search)
  const [searchKeyInput, setSearchKeyInput] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeOptions, setStoreOptions] = useState([]);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // count start
  const [count, setCount] = useState(1);
  const [cart, setCart] = useState(() => {
    const savedCart = sessionStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : {};
  });

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
    const selectedProducts = Object.values(cart)
      .map(item => item?.product)
      .filter(Boolean);
    sessionStorage.setItem("cartProducts", JSON.stringify(selectedProducts));
  }, [cart]);

  // count end
  const [showCounter, setShowCounter] = useState(false);

  const formatStoreOptionLabel = (option) => {
    const store = option?.storeData || {};
    const isFg = Number(store.is_fg_store) === 1;
    const isRm = Number(store.is_rm_store) === 1;
    return (
      <span className="d-inline-flex align-items-center flex-wrap" style={{ gap: 6 }}>
        <span>{option.label}</span>
        {isFg && <span className="badge bg-success">FG Store</span>}
        {isRm && <span className="badge bg-info">RM Store</span>}
      </span>
    );
  };

  const fetchStores = async () => {
    try {
      const response = await PrivateAxios.get('/warehouse');
      const storeData = response.data?.data;
      if (storeData && storeData.length > 0) {
        const options = storeData.map((item) => ({
          value: item.id,
          label: `${item.name || 'N/A'} (${item.city || 'N/A'})`,
          storeData: item,
        }));
        setStoreOptions(options);
      } else {
        setStoreOptions([]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStoreOptions([]);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStockEntries = useCallback(() => {
    setIsLoading(true);
    const { page, rowsPerPage, searchKey, warehouseId } = productController;
    const params = new URLSearchParams({
      page,
      limit: rowsPerPage,
      ...(searchKey && searchKey.trim() !== '' && { searchkey: searchKey.trim() }),
      ...(warehouseId && { warehouse_id: warehouseId }),
    }).toString();

    PrivateAxios.get(`/product/stock-entries?${params}`)
      .then((response) => {
        const data = response.data?.data;
        setStockEntries(data?.rows || []);
        if (data?.pagination) {
          setPagination(data.pagination);
        }
      })
      .catch((error) => {
        console.error('Error fetching stock entries:', error);
        setStockEntries([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productController]);

  useEffect(() => {
    fetchStockEntries();
  }, [fetchStockEntries]);

  const handleSearch = () => {
    setProductController((prev) => ({
      ...prev,
      page: 1,
      searchKey: searchKeyInput.trim(),
      warehouseId: selectedStore ? selectedStore.value : null,
    }));
  };

  const handleClearFilters = () => {
    setSearchKeyInput('');
    setSelectedStore(null);
    setProductController({
      page: 1,
      rowsPerPage: 15,
      searchKey: '',
      warehouseId: null,
    });
  };

  const handleAddToCart = (entryId) => {
  const entry = stockEntries.find(e => e.id === entryId);
  const product = entry?.product;
  const storeId = entry?.warehouse?.id || null;

  if (!product) return;

  if (!storeId) {
    alert("Warehouse not found for this stock entry.");
    return;
  }

  setCart((prevCart) => {
    const updatedCart = {
      ...prevCart,
      [product.id]: {
        quantity: 1,
        store_id: storeId,
        product,
      }
    };
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    return updatedCart;
  });
};

  const handleQuantityChange = (id, delta) => {
  setCart((prevCart) => {
    const existing = prevCart[id] || {};
    const newQty = (existing.quantity || 0) + delta;

    let updatedCart = { ...prevCart };
    if (newQty <= 0) {
      delete updatedCart[id];
    } else {
      updatedCart[id] = {
        ...existing,
        quantity: newQty
      };
    }

    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    return updatedCart;
  });
};

  const getTotalItems = () =>
    Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handlePrevPage = () => {
    if (pagination.has_prev_page && !isLoading) {
      setProductController((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
    }
  };

  const handleNextPage = () => {
    if (pagination.has_next_page && !isLoading) {
      setProductController((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newPerPage = Number(e.target.value);
    setProductController((prev) => ({ ...prev, rowsPerPage: newPerPage, page: 1 }));
  };

  return (
    <>
      <div className='p-4 position-relative'>
        {/* <div className='card'>
          <div className='card-body py-5'>
            <div className='text-center imgBx'>
              <img src={process.env.PUBLIC_URL + 'assets/images/empty-box.png'} alt="pos" />
              <p>Your don't have any inventory item</p>
            </div>
            <div className='d-flex justify-content-center mt-4'>
              <Link to="/inventory/inventory-master" className="btn btn-exp-primary" role='button'>
                <i class="fas fa-plus"></i><span className="ms-2">Add Item</span>
              </Link>
            </div>

          </div>
        </div> */}
        <div className='card mb-0'>
          <div className='card-body'>
            <div className='d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3'>
              <div>
                <h3 className="mb-0">POS</h3>
                <p className="text-muted mb-0">Browse stock entries and add to cart</p>
              </div>
              <div className='d-flex gap-2 flex-wrap'>
                <Link to="/inventory/inventory-master" className="btn btn-exp-primary btn-sm" role='button'>
                  <i class="fas fa-plus"></i><span className="ms-2">Add Item</span>
                </Link>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      Go to Cart
                    </Tooltip>
                  }
                >
                  <Link to='/pos/view-details' className="btn btn-exp-purple-outline btn-sm d-inline-flex align-items-center" ria-controls="example-collapse-text" aria-expanded="false" onClick={cartFilterModalShow}>
                    <span className='count'>{getTotalItems()}</span><span className="ms-2">View Cart</span></Link>
                </OverlayTrigger>

              </div>
            </div>

            <div className="border rounded-10 bg-white mb-3" style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
              <div className="p-3" style={{ position: 'relative', zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center" style={{ gap: 8, fontWeight: 600 }}>
                    <FilterOutlined />
                    <span>Filters</span>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setIsFiltersCollapsed((prev) => !prev)}
                    icon={isFiltersCollapsed ? <DownOutlined /> : <UpOutlined />}
                  >
                    {isFiltersCollapsed ? 'Show' : 'Hide'}
                  </Button>
                </div>
                <div
                  className="row g-3 align-items-end"
                  style={{ display: isFiltersCollapsed ? 'none' : undefined }}
                >
                  <div className="col-md-4">
                    <label className="form-label mb-2">Search</label>
                    <Input
                      placeholder="Enter search key..."
                      value={searchKeyInput}
                      onChange={(e) => setSearchKeyInput(e.target.value)}
                      onPressEnter={handleSearch}
                      style={{ height: '38px', borderRadius: '20px' }}
                    />
                  </div>

                  <div className="col-md-4" style={{ position: 'relative', zIndex: 1000 }}>
                    <label className="form-label mb-2">Filter by Store</label>
                    <Select
                      placeholder="Select Store"
                      value={selectedStore}
                      onChange={(selectedOption) => setSelectedStore(selectedOption)}
                      options={storeOptions}
                      isClearable
                      isSearchable
                      formatOptionLabel={formatStoreOptionLabel}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '38px',
                          borderRadius: '20px',
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  </div>

                  <div className="col-md-4">
                    <div className="d-flex gap-2">
                      <Button
                        type="primary"
                        onClick={handleSearch}
                        style={{ height: '38px' }}
                      >
                        Search
                      </Button>
                      <Button
                        onClick={handleClearFilters}
                        style={{ height: '38px' }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className=" custom_postable pos_table">
              <Table responsive className="table-bordered primary-table-head">
                <thead>
                  <tr>
                    <th className=' text-nowrap'>Item Id</th>
                    <th>Item Name</th>
                    <th>Item Category</th>
                    <th>Location</th>
                    <th className='text-end'>Quantity</th>
                    <th>UOM</th>
                    <th className='text-end'>Amount</th>
                    <th >Action</th>
                  </tr>
                </thead>
                <tbody>
                {stockEntries.length > 0 ? (
                  stockEntries.map((entry) => {
                    const product = entry.product || {};
                    const variant = entry.productVariant || {};
                    const warehouse = entry.warehouse || {};
                    const quantity = cart[product.id]?.quantity || 0;

                    return (
                      <tr key={entry.id}>
                        <td>{product.product_code || '-'}</td>
                        <td><div className='min-width-200'>{product.product_name || '-'}</div></td>
                        <td><div className='min-width-100'>{product.productCategory?.title || '-'}</div></td>
                        <td><div className='min-width-200'>{warehouse.name || '-'}</div></td>
                        <td>{entry.quantity ?? '-'}</td>
                        <td className="text-end">{variant.masterUOM?.name || '-'}</td>
                        <td className="text-end">{getGeneralSettingssymbol} {product.product_price ?? '-'}</td>
                        <td>
                          {quantity === 0 ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Add to Cart</Tooltip>}
                            >
                              <button
                                className="icon-btn"
                                onClick={() => handleAddToCart(entry.id)}
                              >
                                <i className="fas fa-shopping-cart" />
                              </button>
                            </OverlayTrigger>
                          ) : (
                            <div className="count_btn d-flex align-items-center">
                              <button
                                onClick={() => handleQuantityChange(product.id, -1)}
                                className="table-btn"
                              >
                                <i className="fas fa-minus f-s-10" />
                              </button>
                              <input
                                type="text"
                                value={quantity}
                                readOnly
                                className="text-center fw-bold count_number border-0 rounded"
                                style={{ width: "50px" }}
                              />
                              <button
                                onClick={() => handleQuantityChange(product.id, 1)}
                                className="table-btn"
                              >
                                <i className="fas fa-plus f-s-10" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      {isLoading ? 'Loading...' : 'No stock entries found.'}
                    </td>
                  </tr>
                )}
              </tbody>
              </Table>
            </div>

            <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3'>
              <div className='d-flex align-items-center gap-2'>
                <label className='form-label mb-0'>Rows per page:</label>
                <select
                  className='form-select form-select-sm w-auto'
                  value={productController.rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  disabled={isLoading}
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className='text-muted ms-2'>
                  {pagination.total_records > 0
                    ? `${(pagination.current_page - 1) * pagination.per_page + 1}–${Math.min(pagination.current_page * pagination.per_page, pagination.total_records)} of ${pagination.total_records}`
                    : '0 of 0'}
                </span>
              </div>
              <div className='d-flex align-items-center gap-2'>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-secondary'
                  onClick={handlePrevPage}
                  disabled={!pagination.has_prev_page || isLoading}
                >
                  <i className='fas fa-chevron-left' />
                </button>
                <span>
                  Page {pagination.current_page} of {pagination.total_pages || 1}
                </span>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-secondary'
                  onClick={handleNextPage}
                  disabled={!pagination.has_next_page || isLoading}
                >
                  <i className='fas fa-chevron-right' />
                </button>
              </div>
            </div>

          </div>
        </div>

        {getTotalItems() > 0 && (
        <div className="view_cart_bottom_div show">
          <Link to="/pos/view-details" className="view_cart_bottom_Link">
            <span className="d-block text-dark fs-5 fw-medium">
              Added <span className="fw-bold bg-purple text-white rounded-pill px-2 py-1">
                {getTotalItems()}
              </span> items into cart
            </span>
            <span className="btn btn-primary d-block">View Cart</span>
          </Link>
        </div>
      )}
      </div>



    </>
  )
}

export default Pos