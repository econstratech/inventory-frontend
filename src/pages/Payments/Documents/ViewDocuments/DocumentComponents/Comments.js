import React from 'react'

function CommentsDocument() {
    return (
        <>
            <div className='card shadow-none border mb-0'>
                <div className='card-header gth-bg-blue-light'>
                    <div className='d-flex flex-wrap gap-2 align-items-center'>
                        <h5 className='card-title f-s-16'>Comments</h5>
                    </div>
                </div>
                <div className='card-body doc_body_height_155'>
                    <textarea className='form-control rounded-none' rows={4}></textarea>
                </div>
            </div>
        </>
    )
}

export default CommentsDocument