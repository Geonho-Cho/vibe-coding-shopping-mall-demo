import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { validateForm, signupValidationSchema } from '../utils/validation';
import './SignUp.css';

// Constants moved outside component to prevent recreation on each render
const YEAR_OPTIONS = Array.from({ length: 91 }, (_, i) => ({
  value: 2010 - i,
  label: 2010 - i
}));

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: i + 1
}));

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: i + 1
}));

const INITIAL_FORM_DATA = {
  email: '',
  name: '',
  password: '',
  passwordConfirm: '',
  address: '',
  phone: '',
  gender: '',
  birthYear: '',
  birthMonth: '',
  birthDay: ''
};

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateForm(
      formData,
      signupValidationSchema(formData)
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          address: formData.address,
          userType: 'customer'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-breadcrumb">
        <Link to="/">HOME</Link> &gt; <span>회원가입</span> &gt; <span>정보입력</span>
      </div>

      <h1 className="signup-title">회원가입</h1>

      <div className="signup-steps">
        <span className="step completed">01 약관동의</span>
        <span className="step-arrow">&gt;</span>
        <span className="step active">02 정보입력</span>
        <span className="step-arrow">&gt;</span>
        <span className="step">03 가입완료</span>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        <section className="form-section">
          <h2 className="section-title">기본정보</h2>
          <p className="required-notice">* 표시는 반드시 입력해야 하는 항목입니다.</p>

          <FormInput
            label="이메일"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="이메일을 입력하세요"
            required
          />

          <FormInput
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="비밀번호를 입력하세요"
            className="short"
            required
          />

          <FormInput
            label="비밀번호 확인"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            error={errors.passwordConfirm}
            placeholder="비밀번호를 다시 입력하세요"
            className="short"
            required
          />

          <FormInput
            label="이름"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="이름을 입력하세요"
            required
          />

          <FormInput
            label="휴대폰번호"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="- 없이 입력하세요"
          />

          <FormInput
            label="주소"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="주소를 입력하세요"
          />
        </section>

        <section className="form-section">
          <h2 className="section-title">부가정보</h2>

          <div className="form-row">
            <label className="form-label">성별</label>
            <div className="form-input-wrapper radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                />
                남자
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                여자
              </label>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">생일</label>
            <div className="form-input-wrapper birth-selects">
              <FormSelect
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                options={YEAR_OPTIONS}
                placeholder="년"
              />
              <FormSelect
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleChange}
                options={MONTH_OPTIONS}
                placeholder="월"
              />
              <FormSelect
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                options={DAY_OPTIONS}
                placeholder="일"
              />
            </div>
          </div>
        </section>

        <div className="form-buttons">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate('/')}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
