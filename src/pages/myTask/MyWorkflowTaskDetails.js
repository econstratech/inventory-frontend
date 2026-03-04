import React from 'react'
import { Link } from 'react-router-dom'

function MyWorkflowTaskDetails() {
  return (
    <React.Fragment>
        <div className='mb-4'>
            <Link to="/my-workflow-task" className='text-dark back-btn'><i class="bi bi-arrow-left-short me-1"/>Back</Link>
        </div>
        <div className=''>

        </div>
    </React.Fragment>
  )
}

export default MyWorkflowTaskDetails