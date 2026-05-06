/**
 * Formats error data into a human-readable string message
 * Handles various error formats including strings, arrays, objects, and nested structures
 * 
 * @param errorData - The error data to format (can be string, array, object, or any type)
 * @returns A formatted error message string
 */
export const formatErrorMessage = (errorData: any): string => {
    if (!errorData) return "Something went wrong";

    if (typeof errorData === "string") {
        return errorData;
    }

    if (Array.isArray(errorData)) {
        return errorData
            .map((item) => formatErrorMessage(item))
            .filter(Boolean)
            .join("\n");
    }

    if (typeof errorData === "object") {
        if (errorData?.message) {
            return formatErrorMessage(errorData.message);
        }

        if (errorData?.error) {
            return formatErrorMessage(errorData.error);
        }

        if (errorData?.errors) {
            return formatErrorMessage(errorData.errors);
        }

        const joinedValues = Object.values(errorData)
            .map((value) => formatErrorMessage(value))
            .filter(Boolean)
            .join("\n");

        if (joinedValues) {
            return joinedValues;
        }

        return JSON.stringify(errorData);
    }

    return String(errorData);
};
