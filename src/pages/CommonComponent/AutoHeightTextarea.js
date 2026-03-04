import React, { useRef, useEffect } from 'react';

function AutoHeightTextarea({placeholder,onChange, value, className, rows}) {
    const textareaRef = useRef(null);

    // Adjust height on input change
    const handleInput = () => {
        const textarea = textareaRef.current;
        // Reset the height to recalculate the new height
        textarea.style.height = 'auto';
        // Set the height according to the scroll height
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    // Set initial height after rendering
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, []);

    return (
        <textarea
            ref={textareaRef}
            className={className || `form-control` }
            placeholder={placeholder || 'Click or Tap to enter something...'}
            rows={rows}
            onInput={handleInput}
            onChange={onChange} 
            value={value}
            style={{ overflow: 'hidden', resize: 'none' }} // Disable manual resize
        ></textarea>
    );
}

export default AutoHeightTextarea;
