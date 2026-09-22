import { useState } from 'react';

export default function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValues = { ...values, [name]: value };
    setValues(updatedValues);

    if (touched[name] && validationRules[name]) {
      const error = validationRules[name](value, updatedValues);
      setErrors((prev) => ({ ...prev, [name]: error || '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (validationRules[name]) {
      const error = validationRules[name](value, values);
      setErrors((prev) => ({ ...prev, [name]: error || '' }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    let valid = true;

    for (const key of Object.keys(validationRules)) {
      const error = validationRules[key](values[key], values);
      if (error) {
        newErrors[key] = error;
        valid = false;
      }
    }

    setErrors(newErrors);

    const allTouched = {};
    Object.keys(initialValues).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    return valid;
  };

  const isFormFilled = Object.keys(initialValues).every((key) => {
    const val = values[key];
    return typeof val === 'string' ? val.trim().length > 0 : Boolean(val);
  });

  const hasNoErrors = Object.keys(validationRules).every((key) => {
    const err = validationRules[key](values[key], values);
    return !err;
  });

  const isValid = isFormFilled && hasNoErrors;

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid,
    setValues
  };
}
