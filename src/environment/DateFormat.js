function getMonthNumber(monthName) {
    var months = {
        "Jan": "01",
        "Feb": "02",
        "Mar": "03",
        "Apr": "04",
        "May": "05",
        "Jun": "06",
        "Jul": "07",
        "Aug": "08",
        "Sep": "09",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12"
    };
    return months[monthName];
}
export function formatDate(dateString) {
    var parts = dateString.split(" ");
    var day = parts[2];
    var month = getMonthNumber(parts[1]);
    var year = parts[3];
    return year + "-" + month + "-" + day;
}

export function  formatDateManual (isoString) {
    const date = new Date(isoString);

    if (isNaN(date)) {
        console.error('Invalid date:', isoString);
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};