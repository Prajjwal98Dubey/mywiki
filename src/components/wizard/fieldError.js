import { get, useFormContext, useFormState } from 'react-hook-form';

/** Returns (name) => error message for a field path, re-rendering when errors change. */
export function useFieldErrors() {
  const { control } = useFormContext();
  const { errors } = useFormState({ control });
  return (name) => get(errors, name)?.message;
}
