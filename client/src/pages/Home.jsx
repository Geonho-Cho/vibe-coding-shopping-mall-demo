import { Link } from 'react-router-dom';
import FeaturedProducts from '../components/FeaturedProducts';
import './Home.css';

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            일상의 품격을<br />
            높이는 경험
          </h1>
          <p className="hero-subtitle">
            혁신적인 기술과 미니멀한 디자인이 만나<br />
            특별한 순간을 만들어냅니다
          </p>
          <Link to="/products" className="hero-btn">
            제품 둘러보기
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Philosophy Section */}
      <section className="philosophy">
        <div className="philosophy-grid">
          <div className="philosophy-item">
            <h3 className="philosophy-title">Design Philosophy</h3>
            <p className="philosophy-text">
              우리는 단순함 속에서 완벽함을 추구합니다. 불필요한 것을 제거하고
              본질에 집중하여, 사용자에게 진정한 가치를 전달합니다.
            </p>
            <p className="philosophy-text">
              모든 제품은 세심한 고민과 엄격한 기준을 거쳐 탄생합니다.
            </p>
          </div>
          <div className="philosophy-item">
            <h3 className="philosophy-title">Technology</h3>
            <p className="philosophy-text">
              혁신적인 기술은 사용자 경험을 위해 존재합니다. 복잡한 기술을
              직관적인 경험으로 변환하여, 누구나 쉽게 프리미엄을 즐길 수 있도록 합니다.
            </p>
            <p className="philosophy-text">
              끊임없는 연구와 개발로 더 나은 내일을 만들어갑니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
