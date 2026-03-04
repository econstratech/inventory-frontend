
import React, { useState, useEffect } from 'react';


const AutoCompleteDropdown = ({ suggestions }) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (filteredSuggestions.length > 0) {
            setInputValue(filteredSuggestions[0]); // Set the first suggestion as the default value
        }
    }, [filteredSuggestions]);

    const handleAutoCompleteChange = (e) => {
        const userInput = e.target.value;

        // Filter suggestions based on user input
        const filtered = suggestions.filter(
            suggestion =>
                suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );

        setFilteredSuggestions(filtered);
        setShowDropdown(true);
    };

    const handleAutoCompleteSelect = (suggestion) => {
        setInputValue(suggestion);
        setShowDropdown(false);
    };

    const clearInput = () => {
        setInputValue('');
        setFilteredSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <div controlId="autocomplete" className='auto-complete-wrap'>
            <input
                className='form-control'
                type="text"
                placeholder="Start typing..."
                value={inputValue}
                onChange={handleAutoCompleteChange}
                onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                onFocus={() => setShowDropdown(true)}
            />
            {inputValue && (
                <div
                    onClick={clearInput}
                    style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#aaa'
                    }}
                ><i className="fas fa-times d-flex f-s-12"></i></div>
            )}
            {showDropdown && inputValue && (
                <div className='auto-complete-dropdown shadow'>
                    {filteredSuggestions.length ? (
                        filteredSuggestions.map((suggestion, index) => (
                            <div className='auto-complete-dropdown-item'
                                key={index}
                                onClick={() => handleAutoCompleteSelect(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))
                    ) : (
                        <div></div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AutoCompleteDropdown;

