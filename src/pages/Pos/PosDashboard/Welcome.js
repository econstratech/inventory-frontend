import React, { useEffect, useState } from 'react'
import { ReactComponent as UpArrow } from './icon/arrow-trend-up.svg';
import { ReactComponent as DownArrow } from './icon/arrow-trend-down.svg';
import { UserAuth } from '../../auth/Auth';
import { PrivateAxios } from '../../../environment/AxiosInstance';


function Welcome() {
    const { Logout, userDetails } = UserAuth();
      const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await PrivateAxios.get('/orders/monthly-summary'); // Replace with your API endpoint
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching order summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div>Loading summary...</div>;

  if (!summary) return <div>Failed to load summary.</div>;

  const {
    total_quantity,
    total_order_amount,
    last_month_order_amount,
    sales_increase_percentage,
  } = summary;
    return (
        <>
            <div class="card bg-primary-gt overflow-hidden">
                <div class="card-body position-relative z-1">
                    <span class="badge badge-primary d-inline-flex align-items-center gap-2 fs-6 px-3 flex-wrap">
                        <UpArrow className='text-white' width={20} height={20}/>
                        <span class="fw-normal">Sale increase <span class="fw-bold">{sales_increase_percentage > 0 ? '+' : '-'}
          {sales_increase_percentage}%</span>
                        </span>
                    </span>
                    <h4 class="fw-normal mt-5 mb-1">Hey, <span class="fw-bold">{userDetails.name}</span>
                    </h4>
                    <h6 class="opacity-75 fw-medium mb-0">Welcome back to your dashboard!</h6>
                </div>
            </div>
        </>
    )
}

export default Welcome