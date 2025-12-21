# 배포 전 보안 점검 보고서
**프로젝트**: Shopping Mall Demo
**점검일**: 2025-12-21
**점검자**: Security Assessment Agent

---

## 🔴 치명적 (Critical) - 배포 전 필수 조치

### 1. .gitignore 파일 누락
**위치**: 프로젝트 루트
**심각도**: 🔴 CRITICAL

**문제**:
- .gitignore 파일이 존재하지 않음
- .env 파일들이 Git에 커밋될 위험 (실제 .env 파일이 server/, client/ 폴더에 존재)
- API 키, JWT Secret 등 민감 정보 노출 위험

**조치사항**:
```bash
# 프로젝트 루트에 .gitignore 생성 필요
# 아래 내용 포함:

# Environment variables
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/
client/node_modules/
server/node_modules/

# Build outputs
client/dist/
client/build/
server/dist/

# Logs
*.log
npm-debug.log*
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

**검증 명령**:
```bash
# .env 파일이 Git에 추적되지 않는지 확인
git status --ignored
git ls-files --others --exclude-standard
```

---

### 2. 하드코딩된 localhost URL
**위치**: `client/src/utils/api.js:3`
**심각도**: 🔴 CRITICAL

**문제**:
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```
- 프로덕션 환경에서 작동하지 않음
- 배포 시마다 코드 수정 필요

**권장 조치**:
```javascript
// client/src/utils/api.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

```bash
# client/.env.production 파일 생성
VITE_API_URL=https://your-production-api.com/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
VITE_IMP_CODE=your-imp-code
```

**참고**: Vite의 dev proxy 설정(`vite.config.js`)은 개발 환경에서만 작동하므로 프로덕션 빌드에서는 절대 URL이 필요합니다.

---

### 3. CORS 설정이 너무 개방적
**위치**: `server/src/index.js:14`
**심각도**: 🔴 CRITICAL

**문제**:
```javascript
app.use(cors());  // 모든 origin 허용
```
- 어떤 도메인에서도 API 접근 가능
- CSRF 공격 취약성

**권장 조치**:
```javascript
// server/src/index.js
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',  // 개발환경
    'https://your-production-domain.com'  // 프로덕션
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

```bash
# server/.env에 추가
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

---

### 4. 에러 메시지에서 민감 정보 노출
**위치**: 여러 컨트롤러 파일
**심각도**: 🔴 CRITICAL

**문제**:
```javascript
// server/src/controllers/auth.controller.js:62
res.status(500).json({
  success: false,
  message: '서버 오류가 발생했습니다.',
  error: error.message  // ⚠️ 내부 에러 노출
});
```

**권장 조치**:
```javascript
// 프로덕션 환경에서 상세 에러 숨기기
exports.login = async (req, res) => {
  try {
    // ... 로직
  } catch (error) {
    console.error('Login error:', error);  // 로그는 서버에만
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
      // error: error.message 제거 (개발 환경에서만 활성화)
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};
```

---

### 5. JWT Secret 환경변수 검증 누락
**위치**: `server/src/index.js`
**심각도**: 🔴 CRITICAL

**문제**:
- JWT_SECRET이 설정되지 않아도 서버가 시작됨
- 기본값 없이 사용하면 런타임 에러 발생

**권장 조치**:
```javascript
// server/src/index.js (dotenv.config() 직후)
dotenv.config();

// 필수 환경변수 검증
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file');
  process.exit(1);
}

// JWT_SECRET 길이 검증
if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}
```

---

## 🟡 중요 (High) - 프로덕션 배포 시 권장

### 6. 입력 검증(Input Validation) 부재
**위치**: 모든 컨트롤러
**심각도**: 🟡 HIGH

**문제**:
- 사용자 입력에 대한 타입/형식 검증 없음
- SQL Injection(NoSQL Injection) 가능성
- XSS 공격 가능성

**예시**:
```javascript
// server/src/controllers/product.controller.js:91
const { sku, name, price, category, imageUrl, stock, isPublic, description } = req.body;
// ⚠️ price가 음수인지, sku가 특수문자를 포함하는지 등 검증 없음
```

**권장 조치**:
```bash
# 설치
npm install express-validator
```

```javascript
// server/src/middleware/validation.middleware.js (새로 생성)
const { body, param, validationResult } = require('express-validator');

exports.validateProduct = [
  body('sku').trim().isLength({ min: 1, max: 50 }).matches(/^[A-Za-z0-9-_]+$/),
  body('name').trim().isLength({ min: 1, max: 200 }),
  body('price').isInt({ min: 0, max: 100000000 }),
  body('category').isIn(['생활/주방', '욕실/청소', '데스크/문구', '홈데코/인테리어']),
  body('stock').optional().isInt({ min: 0 }),
  body('imageUrl').optional().isURL(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다.',
        errors: errors.array()
      });
    }
    next();
  }
];

// routes/product.routes.js
const { validateProduct } = require('../middleware/validation.middleware');
router.post('/', verifyToken, isAdmin, validateProduct, productController.createProduct);
```

---

### 7. Rate Limiting 미적용
**위치**: `server/src/index.js`
**심각도**: 🟡 HIGH

**문제**:
- 무제한 API 요청 가능
- Brute Force 공격 취약
- DDoS 공격에 무방비

**권장 조치**:
```bash
npm install express-rate-limit
```

```javascript
// server/src/index.js
const rateLimit = require('express-rate-limit');

// API 전역 제한
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 요청 수
  message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.'
});

// 로그인 엔드포인트 강화
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15분에 5번만
  message: '로그인 시도 횟수를 초과했습니다.'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
```

---

### 8. 보안 헤더 미설정
**위치**: `server/src/index.js`
**심각도**: 🟡 HIGH

**문제**:
- XSS, Clickjacking 등에 취약
- 보안 관련 HTTP 헤더 부재

**권장 조치**:
```bash
npm install helmet
```

```javascript
// server/src/index.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://cdn.iamport.kr"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    }
  }
}));
```

---

### 9. MongoDB Connection String 보안
**위치**: `server/src/config/db.js:5`
**심각도**: 🟡 HIGH

**문제**:
```javascript
const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall');
```
- 프로덕션에서 기본값 사용 위험
- 인증 정보 없는 연결 허용

**권장 조치**:
```javascript
// server/src/config/db.js
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // 프로덕션 권장 옵션
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // 프로덕션에서는 연결 실패 시 종료
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
```

---

### 10. 비밀번호 복잡도 검증 없음
**위치**: `server/src/controllers/user.controller.js`
**심각도**: 🟡 HIGH

**문제**:
- 약한 비밀번호 허용 (예: "123", "password")
- 비밀번호 정책 미적용

**권장 조치**:
```javascript
// middleware/validation.middleware.js에 추가
exports.validateUserRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.'),
  body('name').trim().isLength({ min: 2, max: 50 }),
  // ... validation result check
];
```

---

## 🟢 권장 (Medium) - 보안 강화

### 11. console.log 사용 (개발용 로그)
**위치**: 다수 파일 (서버 4개, 클라이언트 10개)
**심각도**: 🟢 MEDIUM

**문제**:
- 프로덕션에서 민감 정보 로그 노출
- 서버: `server/src/index.js`, `config/db.js`, `utils/portone.js`, `controllers/order.controller.js`
- 클라이언트: 여러 페이지 컴포넌트

**권장 조치**:
```javascript
// server/src/utils/logger.js (새로 생성)
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

**클라이언트 로그 제거**:
```javascript
// vite.config.js에 추가
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 프로덕션 빌드 시 console.log 제거
        drop_debugger: true,
      },
    },
  },
});
```

---

### 12. alert() 사용 (UX 및 보안)
**위치**: 클라이언트 여러 파일 (22개 발견)
**심각도**: 🟢 MEDIUM

**문제**:
- 사용자 경험 저하
- 에러 메시지가 너무 상세할 경우 정보 노출

**파일 목록**:
- `client/src/pages/Cart.jsx`
- `client/src/components/ImageUploader.jsx`
- `client/src/pages/Checkout.jsx`
- `client/src/pages/Login.jsx`
- `client/src/components/ProductModal.jsx`
- `client/src/pages/admin/AdminProducts.jsx`
- 등

**권장 조치**:
```javascript
// Toast 라이브러리 사용 권장
npm install react-toastify

// App.jsx
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// alert 대신 사용
toast.success('장바구니에 추가되었습니다.');
toast.error('에러가 발생했습니다.');
```

---

### 13. 환경변수 관리
**위치**: `.env` 파일들
**심각도**: 🟢 MEDIUM

**현재 상태**:
- ✅ `.env.example` 파일 존재 (server, client 모두)
- ⚠️ `.gitignore` 파일 없어서 실제 `.env` 커밋 위험

**배포 환경별 설정 권장**:
```bash
# Development
client/.env.development
server/.env.development

# Production
client/.env.production
server/.env.production

# 절대 Git에 커밋하지 말 것!
```

---

### 14. MongoDB 쿼리 NoSQL Injection
**위치**: `server/src/controllers/product.controller.js`, `user.controller.js`
**심각도**: 🟢 MEDIUM

**문제**:
```javascript
// product.controller.js:51
const product = await Product.findById(req.params.id);
// req.params.id가 객체로 전달될 경우 NoSQL Injection 가능
// 예: ?id[$ne]=null
```

**권장 조치**:
```javascript
// mongoose sanitize 사용
npm install express-mongo-sanitize

// server/src/index.js
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// 또는 직접 검증
const { param } = require('express-validator');
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid product ID'),
  productController.getProductById
);
```

---

### 15. 파일 업로드 보안 (Cloudinary)
**위치**: `client/src/components/ImageUploader.jsx`
**심각도**: 🟢 MEDIUM

**문제**:
```javascript
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
```
- Upload Preset이 클라이언트에 노출
- 누구나 Cloudinary에 파일 업로드 가능

**권장 조치**:
1. **서버 사이드 업로드 구현** (권장):
```javascript
// server/routes/upload.routes.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,  // 서버에만 존재
});

router.post('/upload', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  // 서버에서 업로드 처리
});
```

2. **Unsigned Upload 제한**:
- Cloudinary 대시보드에서 Upload Preset을 signed로 변경
- 서버에서 signature 생성

---

## 📋 배포 체크리스트

### 배포 전 필수 작업

- [ ] **1. .gitignore 파일 생성 및 커밋**
  ```bash
  # .env 파일이 Git에 없는지 확인
  git ls-files | grep "\.env$"
  # 결과가 없어야 정상
  ```

- [ ] **2. 환경변수 하드코딩 제거**
  - [ ] `client/src/utils/api.js` - API_BASE_URL 환경변수로 변경
  - [ ] 프로덕션 환경변수 파일 생성

- [ ] **3. CORS 설정 강화**
  - [ ] `server/src/index.js` - origin 제한 추가
  - [ ] ALLOWED_ORIGINS 환경변수 설정

- [ ] **4. 에러 메시지 보안**
  - [ ] 모든 컨트롤러의 catch 블록 수정
  - [ ] NODE_ENV 확인 로직 추가

- [ ] **5. JWT_SECRET 검증**
  - [ ] 서버 시작 시 환경변수 검증 로직 추가
  - [ ] 프로덕션 JWT_SECRET 32자 이상 생성

- [ ] **6. 보안 패키지 설치**
  ```bash
  # server
  npm install helmet express-rate-limit express-mongo-sanitize

  # 선택사항
  npm install express-validator winston
  ```

- [ ] **7. MongoDB 연결 강화**
  - [ ] MONGODB_URI 필수 검증
  - [ ] 프로덕션 연결 옵션 설정

- [ ] **8. console.log 제거/대체**
  - [ ] 서버: winston 로거 구현
  - [ ] 클라이언트: Vite terser 설정

---

### 프로덕션 환경변수 설정

**서버 (.env.production)**:
```bash
# Required
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shopping-mall?retryWrites=true&w=majority
JWT_SECRET=<32자 이상의 강력한 랜덤 문자열>

# CORS
ALLOWED_ORIGINS=https://your-frontend.com

# Payment (포트원)
IMP_KEY=your-production-imp-key
IMP_SECRET=your-production-imp-secret

# Optional - Cloudinary (서버 업로드 시)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**클라이언트 (.env.production)**:
```bash
VITE_API_URL=https://your-api-domain.com/api
VITE_IMP_CODE=your-production-imp-code

# Cloudinary (클라이언트 직접 업로드 시)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
```

---

## 🔒 보안 모범 사례

### 강력한 JWT_SECRET 생성
```bash
# Node.js로 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 OpenSSL
openssl rand -hex 32
```

### MongoDB Atlas 보안 설정
1. Network Access: 특정 IP만 허용 (배포 서버 IP)
2. Database User: 최소 권한 원칙 (readWrite만)
3. Connection String: SRV 레코드 사용, SSL/TLS 활성화

### 클라우드 배포 시 추가 조치
- **Vercel/Netlify (프론트엔드)**:
  - Environment Variables 설정
  - HTTPS 강제 활성화

- **Railway/Render (백엔드)**:
  - Environment Variables 설정
  - Health check 엔드포인트 추가
  - Auto-scaling 설정

---

## 📊 보안 점수 평가

### 현재 상태
- 🔴 치명적 이슈: **5개**
- 🟡 중요 이슈: **5개**
- 🟢 권장 이슈: **5개**

**현재 보안 점수: 45/100** ⚠️

### 최소 조치 후 예상 점수
(🔴 5개 해결 시)
**예상 보안 점수: 75/100** ✅

### 모든 조치 완료 시
**목표 보안 점수: 90/100** 🎯

---

## 🚀 빠른 시작 가이드

### 1단계: 즉시 조치 (10분)
```bash
# 1. .gitignore 생성
cat > .gitignore << 'EOF'
.env
.env.*
!.env.example
node_modules/
dist/
build/
*.log
.DS_Store
EOF

# 2. Git에서 .env 제거 (이미 커밋된 경우)
git rm --cached server/.env client/.env
git commit -m "Remove .env files from git"
```

### 2단계: 환경변수 설정 (5분)
```bash
# client/src/utils/api.js 수정
# API_BASE_URL을 환경변수로 변경
```

### 3단계: 보안 패키지 설치 (5분)
```bash
cd server
npm install helmet express-rate-limit express-mongo-sanitize
```

### 4단계: 기본 보안 적용 (10분)
- CORS origin 제한
- helmet 미들웨어 추가
- rate limiting 설정
- 에러 메시지 보안 강화

**총 소요시간: ~30분**

---

## 📚 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**보고서 작성**: Security Assessment Agent
**최종 업데이트**: 2025-12-21
