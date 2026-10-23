import { Routes, Route } from 'react-router-dom'
import { StudyProvider } from './context/StudyContext.jsx'
import StudyBar from './components/StudyBar.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import SurveyController from './components/SurveyController.jsx'

import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderComplete from './pages/OrderComplete.jsx'
import DeliveryTracking from './pages/DeliveryTracking.jsx'
import MyPage from './pages/MyPage.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <StudyProvider>
      <StudyBar />
      <Header />
      <main style={{ minHeight: '60vh', paddingBottom: 24 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route path="/tracking" element={<DeliveryTracking />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <SurveyController />
    </StudyProvider>
  )
}
