import React from 'react'
import Welcome from './Welcome'
import "./dashboard.min.css"
import StartingCards from './StartingCards'
import DeliveryPendingReport from './DeliveryPendingReport'
import SalesReport from './SalesReport'
import TransactionHistory from './TransactionHistory'
import CancelReport from './CancelReport'
import SalesGraph from './SalesGraph'
import CustomerNotTurnUp from './CustomerNotTurnUp'

function PosDashboardIndex() {
    return (
        <>
            <div className='p-4'>
                <div className='row'>
                    <div className='col-lg-4'>
                        <Welcome />
                    </div>
                    <div className='col-lg-8'>
                        <StartingCards />
                    </div>
                    <div className='col-lg-12'>
                        <DeliveryPendingReport />
                    </div>
                    <div className='col-lg-6'>
                        <SalesReport />
                    </div>
                    <div className='col-lg-6'>
                        <CancelReport />
                    </div>
                    <div className='col-lg-6'>
                        <SalesGraph />
                    </div>
                    <div className='col-lg-6'>
                        <CustomerNotTurnUp />
                    </div>
                    <div className='col-lg-12'>
                        <TransactionHistory />
                    </div>
                </div>
            </div>

        </>
    )
}

export default PosDashboardIndex