import React, { useEffect, useState } from 'react'
import { ReactComponent as Customer } from './icon/user-bag.svg';
import { ReactComponent as Item } from './icon/box-open.svg';
import { ReactComponent as Sale } from './icon/shopping-cart-add.svg';
import { ReactComponent as Quantity } from './icon/boxes.svg';
import { PrivateAxios } from '../../../environment/AxiosInstance';

function StartingCards() {
    const [totalCount, setTotalCount] = useState(0);
    const [summary, setSummary] = useState({ total_order_amount: 0, total_quantity: 0 });
  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await PrivateAxios.get("/product/total-count"); // Your actual route
        setTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Error fetching product count", error);
      }
    };

    fetchProductCount();
  }, []);



  useEffect(() => {
    PrivateAxios.get("/orders/monthly-summary")
      .then(res => setSummary(res.data))
      .catch(err => console.error("Error loading summary", err));
  }, []);
  const [count, setCount] = useState(0);

  useEffect(() => {
    PrivateAxios.get("/customers/count")
      .then((res) => {
        setCount(res.data.totalCustomers);
      })
      .catch((err) => {
        console.error("Failed to load customer count", err);
      });
  }, []);

    return (
        <>
            <div className='row'>
                <div className='col-xl-3 col-lg-6 col-md-6 col-sm-6 col-6'>
                    <div className='card warning-gredient text-center starter_card'>
                        <div className='card-body'>
                            <div className='icon_box text-bg-warning rounded-4 mx-auto'>
                                <Item className='text-white' width={40} height={40} />
                            </div>
                            <div className='icon_desc'>
                                <h5>No. of Items(Active)</h5>
                                <p>{totalCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-xl-3 col-lg-6 col-md-6 col-sm-6 col-6'>
                    <div className='card danger-gredient text-center starter_card'>
                        <div className='card-body'>
                            <div className='icon_box text-bg-danger rounded-4 mx-auto'>
                                <Sale className='text-white' width={40} height={40} />
                            </div>
                            <div className='icon_desc'>
                                <h5>Sale Amount</h5>
                                <p>₹{summary.total_order_amount?.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-xl-3 col-lg-6 col-md-6 col-sm-6 col-6'>
                    <div className='card success-gredient text-center starter_card'>
                        <div className='card-body'>
                            <div className='icon_box text-bg-success rounded-4 mx-auto'>
                                <Quantity className='text-white' width={40} height={40} />
                            </div>
                            <div className='icon_desc'>
                                <h5>Total Quantity</h5>
                                <p>{summary.total_quantity}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-xl-3 col-lg-6 col-md-6 col-sm-6 col-6'>
                    <div className='card info-gredient text-center starter_card'>
                        <div className='card-body'>
                            <div className='icon_box text-bg-info rounded-4 mx-auto'>
                                <Customer className='text-white' width={40} height={40} />
                            </div>
                            <div className='icon_desc'>
                                <h5>No. of Customers</h5>
                                <p>{count}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default StartingCards