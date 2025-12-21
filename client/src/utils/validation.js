// Validation utility functions for form handling

export const validators = {
  required: (value, fieldName = '필드') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName}을(를) 입력해주세요.`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '올바른 이메일 형식이 아닙니다.';
    }
    return null;
  },

  minLength: (value, min, fieldName = '필드') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName}은(는) ${min}자 이상이어야 합니다.`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = '필드') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName}은(는) ${max}자 이하여야 합니다.`;
    }
    return null;
  },

  match: (value, compareValue, message = '값이 일치하지 않습니다.') => {
    if (value !== compareValue) {
      return message;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(value.replace(/-/g, ''))) {
      return '올바른 휴대폰 번호 형식이 아닙니다.';
    }
    return null;
  }
};

// Validate a single field with multiple rules
export const validateField = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

// Validate entire form based on validation schema
export const validateForm = (formData, schema) => {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(formData[field], rules);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Signup form validation schema
export const signupValidationSchema = (formData) => ({
  email: [
    (v) => validators.required(v, '이메일'),
    validators.email
  ],
  name: [
    (v) => validators.required(v, '이름')
  ],
  password: [
    (v) => validators.required(v, '비밀번호'),
    (v) => validators.minLength(v, 6, '비밀번호')
  ],
  passwordConfirm: [
    (v) => validators.required(v, '비밀번호 확인'),
    (v) => validators.match(v, formData.password, '비밀번호가 일치하지 않습니다.')
  ]
});

// Login form validation schema
export const loginValidationSchema = {
  email: [
    (v) => validators.required(v, '이메일'),
    validators.email
  ],
  password: [
    (v) => validators.required(v, '비밀번호')
  ]
};
