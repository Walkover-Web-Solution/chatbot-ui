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

/**
 * Keys that carry the error itself (or transport metadata) rather than
 * extra context worth showing to the user.
 */
const NON_CONTEXT_DETAIL_KEYS = new Set([
    "error",
    "errors",
    "message",
    "detail",
    "details",
    "success",
    "status",
    "statusCode",
    "status_code",
    "code",
]);

/** Turns `API_KEY_LIMIT_EXCEEDED` into `API key limit exceeded.` */
const humanizeErrorCode = (rawError: string): string => {
    const trimmed = rawError.trim();
    if (!/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(trimmed)) return trimmed;

    const words = trimmed.toLowerCase().split("_");
    const sentence = words
        .map((word, index) =>
            index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        )
        .join(" ");
    return `${sentence}.`;
};

/** Turns `current_usage` into `Current usage`. */
const humanizeKey = (key: string): string => {
    const words = key
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * Appends any extra scalar fields on the error detail as context, so payloads
 * like `{ error: "API_KEY_LIMIT_EXCEEDED", current_usage: 10, limit_value: 5 }`
 * surface their numbers without needing a per-error-code branch.
 */
const withDetailContext = (message: string, detail: any): string => {
    if (!detail || typeof detail !== "object" || Array.isArray(detail)) return message;

    const context = Object.entries(detail)
        .filter(
            ([key, value]) =>
                !NON_CONTEXT_DETAIL_KEYS.has(key) &&
                value !== undefined &&
                value !== null &&
                value !== "" &&
                (typeof value === "string" ||
                    typeof value === "number" ||
                    typeof value === "boolean")
        )
        .map(([key, value]) => `${humanizeKey(key)}: ${value}`)
        .join(", ");

    if (!context) return message;
    return `${message.replace(/[.\s]+$/, "")}. ${context}`;
};

/**
 * Extracts a human-readable error message from an API error/response object.
 *
 * Priority order:
 *   1. `error.response.data.detail.error` (e.g. `"Agent has been deleted"`; error
 *      codes like `API_KEY_LIMIT_EXCEEDED` are humanized, and any extra scalar
 *      fields on `detail` — e.g. `current_usage`/`limit_value` — are appended)
 *   2. `error.response.data.detail` (if string)
 *   3. `error.response.data.error` (string or object)
 *   4. `error.response.data.message` / `error.message`
 *   5. Fallback `"Something went wrong."`
 *
 * Also accepts a plain response body object (e.g. `{ detail: { success: false, error: "..." } }`)
 * so it works both with thrown axios errors and already-parsed error payloads.
 */
export const getApiErrorMessage = (error: any): string => {
    if (typeof error === "string" && error.trim()) return error;
    if (!error) return "Something went wrong.";

    const responseData = error?.response?.data;
    const source = responseData ?? error;
    const detail = source?.detail;

    if (typeof detail === "string" && detail.trim()) return detail;

    if (detail?.error) {
        if (typeof detail.error === "string") {
            const message = humanizeErrorCode(detail.error);
            return withDetailContext(message, detail);
        }
        return withDetailContext(formatErrorMessage(detail.error), detail);
    }

    if (typeof source?.error === "string") return source.error;
    if (source?.error) return formatErrorMessage(source.error);
    if (source?.message) return String(source.message);
    if (error?.message) return String(error.message);

    return "Something went wrong.";
};
