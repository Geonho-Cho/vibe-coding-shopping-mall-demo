import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { useAuth } from '../hooks/useAuth';
import { validateForm, loginValidationSchema } from '../utils/validation';
import './Login.css';

const INITIAL_FORM_DATA = {
  email: '',
  password: '',
  rememberEmail: false
};

const SOCIAL_PROVIDERS = [
  { id: 'naver', name: '네이버', icon: 'N' },
  { id: 'kakao', name: '카카오', icon: 'K' },
  { id: 'google', name: '구글', icon: 'G' }
];

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth({ redirectTo: '/' });

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberEmail: true }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSubmitError('');

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateForm(
      formData,
      loginValidationSchema
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);

      // Handle remember email
      if (formData.rememberEmail) {
        localStorage.setItem('savedEmail', formData.email);
      } else {
        localStorage.removeItem('savedEmail');
      }

      navigate('/');
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider.name} 로그인은 추후 구현 예정입니다.`);
  };

  // Show loading while checking auth
  if (authLoading) {
    return <div className="login-container">로딩 중...</div>;
  }

  // Already authenticated - will redirect
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-breadcrumb">
        <Link to="/">HOME</Link> &gt; <span>로그인</span>
      </div>

      <h1 className="login-title">로그인</h1>

      <div className="login-box">
        {/* 회원 로그인 */}
        <section className="member-login">
          <h2 className="section-title">회원 로그인</h2>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-inputs">
              <FormInput
                label=""
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="이메일"
                className="login-input"
              />
              <FormInput
                label=""
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="비밀번호"
                className="login-input"
              />
              <label className="remember-email">
                <input
                  type="checkbox"
                  name="rememberEmail"
                  checked={formData.rememberEmail}
                  onChange={handleChange}
                />
                이메일 저장
              </label>
            </div>

            <button type="submit" className="btn-login" disabled={isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {submitError && <p className="error-message">{submitError}</p>}

          {/* 소셜 로그인 */}
          <div className="social-login">
            {SOCIAL_PROVIDERS.map(provider => (
              <button
                key={provider.id}
                type="button"
                className={`btn-social btn-${provider.id}`}
                onClick={() => handleSocialLogin(provider)}
              >
                <span className={`social-icon ${provider.id}`}>{provider.icon}</span>
                <span>{provider.name}로 로그인</span>
              </button>
            ))}
          </div>

          {/* 하단 링크 */}
          <div className="login-links">
            <Link to="/signup" className="link-btn active">회원가입</Link>
            <button type="button" className="link-btn">아이디 찾기</button>
            <button type="button" className="link-btn">비밀번호 찾기</button>
          </div>
        </section>

        {/* 비회원 주문조회 */}
        <section className="guest-order">
          <h2 className="section-title">비회원 주문조회 하기</h2>

          <div className="guest-form">
            <div className="form-inputs">
              <input
                type="text"
                placeholder="주문자명"
                className="login-input"
              />
              <input
                type="text"
                placeholder="주문번호"
                className="login-input"
              />
            </div>
            <button type="button" className="btn-confirm">확인</button>
          </div>

          <p className="guest-notice">
            주문번호와 비밀번호를 잊으신 경우, 고객센터로 문의하여 주시기 바랍니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;
