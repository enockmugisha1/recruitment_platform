/** Turn an axios/DRF error into one readable sentence for a toast or form. */
export function apiError(err: any, fallback = "Something went wrong. Please try again."): string {
    const data = err?.response?.data;
    if (!data) return err?.message && !err?.response ? "Could not reach the server." : fallback;
    if (typeof data === "string") return data;
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.error === "string") return data.error;
  
    const [field, value] = Object.entries(data)[0] ?? [];
    if (!field) return fallback;
    const message = Array.isArray(value) ? String(value[0]) : String(value);
    if (field === "non_field_errors" || field === "status") return message;
    const label = field.replace(/_/g, " ");
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${message}`;
  }  