/**
 * Generate a unique reference number for work orders
 * @param {string} prefix - Prefix for the reference number
 * @param {number} numberLength - Length of the reference number
 * @returns {string} Unique reference number
 */
const generateWorkOrderNumber = (prefix, numberLength = 6) => {
    const year = new Date().getFullYear();
    const referenceNumber = Math.floor(10 ** (numberLength - 1) + Math.random() * 9 * 10 ** (numberLength - 1));
    return `${prefix}-${year}-${referenceNumber}`;
}

module.exports = {
    generateWorkOrderNumber
};