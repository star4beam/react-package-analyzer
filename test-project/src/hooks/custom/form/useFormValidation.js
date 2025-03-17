import { useState } from 'react';
import { formatDate } from '@utils/helpers/format/dateFormatter';

const useFormValidation = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = (fieldValues = values) => {
    let tempErrors = { ...errors };
    
    if ('email' in fieldValues) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      tempErrors.email = emailRegex.test(fieldValues.email) ? '' : 'Email is not valid';
    }

    if ('password' in fieldValues) {
      tempErrors.password = fieldValues.password.length >= 6 
        ? '' 
        : 'Password must be at least 6 characters';
    }

    setErrors({ ...tempErrors });

    return Object.values(tempErrors).every(x => x === '');
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value
    });
    validate({ [name]: value });
  };

  return {
    values,
    errors,
    handleChange,
    validate
  };
};

export default useFormValidation; 