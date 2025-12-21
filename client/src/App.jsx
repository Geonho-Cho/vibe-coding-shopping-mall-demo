import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderComplete from "./pages/OrderComplete";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import MyPageLayout from "./components/MyPageLayout";

// Admin
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

// Layout for public pages
function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes - No Header */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* Public Routes - With Header */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/products/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/order-complete" element={<PublicLayout><OrderComplete /></PublicLayout>} />
        <Route path="/signup" element={<PublicLayout><SignUp /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />

        {/* MyPage Routes */}
        <Route path="/mypage" element={<PublicLayout><MyPageLayout /></PublicLayout>}>
          <Route index element={<MyOrders />} />
          <Route path="orders" element={<MyOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
