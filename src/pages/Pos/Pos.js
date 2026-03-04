import React, { useEffect, useState } from 'react'
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { PrivateAxios } from '../../environment/AxiosInstance';
import { UserAuth } from '../auth/Auth';


const Pos = () => {
 const { getGeneralSettingssymbol } = UserAuth();
  //filter modal
  const [cartFilterShow, setCartFilterShow] = useState(false);
  const cartFilterModalClose = () => setCartFilterShow(false);
  const cartFilterModalShow = () => setCartFilterShow(true);

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // count start 
  const [count, setCount] = useState(1);
  const [cart, setCart] = useState(() => {
    const savedCart = sessionStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : {};
  });

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
    const selectedProducts = products.filter(product => cart[product.id]);
    sessionStorage.setItem("cartProducts", JSON.stringify(selectedProducts));
  }, [cart, products]);

  // count end
  const [showCounter, setShowCounter] = useState(false);



  const fetchProduct = () => {
    PrivateAxios.get(`/product/list`)
      .then((response) => {
        setProducts(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const handleAddToCart = (id) => {
  const product = products.find(p => p.id === id);
  const storeId = product?.TrackProductStock?.[0]?.store_id || null;

  if (!storeId) {
    alert("Store ID not found for this product.");
    return;
  }

  setCart((prevCart) => {
    const updatedCart = {
      ...prevCart,
      [id]: {
        quantity: 1,
        store_id: storeId,
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

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

 const getTotalItems = () =>
  Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <>
      <div className='p-4 position-relative'>
        <div className='card'>
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
        </div>
        <div className='card mb-0'>
          <div className='card-body'>
            <div className='d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3'>
              <div className='form-group d-flex align-items-center gap-2 max_400 mb-0'>
                <label className='form-label'>Search</label>
                <input
                type="search"
                placeholder="Search..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const quantity = cart[product.id]?.quantity || 0;

                    console.log(product.TrackProductStock?.[0]?.store_id);
                    
                    return (
                      <tr key={product.id}>
                        <td>{product.product_code}</td>
                        <td><div className='min-width-200'>{product.product_name}</div></td>
                        <td><div className='min-width-100'>{product.Categories?.title || '-'}</div></td>
                        <td><div className='min-width-200'>{product.TrackProductStock?.[0]?.Store?.name || '-'}</div></td>
                        <td>{product.current_stock}</td>
                        <td className="text-end">{product.Masteruom?.unit_name || '-'}</td>
                        <td className="text-end">{getGeneralSettingssymbol} {product.product_price}</td>
                        <td>
                          {quantity === 0 ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Add to Cart</Tooltip>}
                            >
                              <button
                                className="icon-btn"
                                onClick={() => handleAddToCart(product.id)}
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
                    <td colSpan="8" className="text-center">No products found.</td>
                  </tr>
                )}
              </tbody>
              </Table>
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