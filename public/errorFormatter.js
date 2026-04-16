/**
 * Formats error data into a human-readable string message
 * Handles various error formats including strings, arrays, objects, and nested structures
 * 
 * @param {any} errorData - The error data to format (can be string, array, object, or any type)
 * @returns {string} A formatted error message string
 */
window.formatErrorMessage = function(errorData) {
    if (!errorData) return 'Something went wrong';

    if (typeof errorData === 'string') {
        return errorData;
    }

    if (Array.isArray(errorData)) {
        return errorData
            .map(item => window.formatErrorMessage(item))
            .filter(Boolean)
            .join('\n');
    }

    if (typeof errorData === 'object') {
        if (errorData.message) {
            return window.formatErrorMessage(errorData.message);
        }

        if (errorData.error) {
            return window.formatErrorMessage(errorData.error);
        }

        if (errorData.errors) {
            return window.formatErrorMessage(errorData.errors);
        }

        const values = Object.values(errorData)
            .map(value => window.formatErrorMessage(value))
            .filter(Boolean)
            .join('\n');

        if (values) {
            return values;
        }

        return JSON.stringify(errorData);
    }

    return String(errorData);
};
