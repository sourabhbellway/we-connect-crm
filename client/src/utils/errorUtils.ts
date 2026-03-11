export interface ApiValidationError {
  field: string;
  messages: string[];
}

export const formatValidationErrors = (errors: any[]): string => {
  if (!Array.isArray(errors)) return "";

  return errors
    .map((err) => {
      // Handle the new structure: { field: string, messages: string[] }
      if (err.field && Array.isArray(err.messages)) {
        return `${err.field}: ${err.messages.join(", ")}`;
      }

      // Handle older/other structures: { msg: string } or { message: string }
      return err.msg || err.message || JSON.stringify(err);
    })
    .join("\n");
};

export const getFieldErrorMessage = (errors: any[], fieldName: string): string | undefined => {
  if (!Array.isArray(errors)) return undefined;

  const error = errors.find((err) => err.field === fieldName);
  if (error && Array.isArray(error.messages)) {
    return error.messages.join(", ");
  }

  return undefined;
};
