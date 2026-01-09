import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Catalog'; // Rename this file to Home.jsx if you prefer
import AddProduct from './pages/LoanCart'; // Rename to AddProduct.jsx if you prefer
import Login from './pages/Login';
import Register from './pages/Register'; // <--- New
import Account from './pages/Account';   // <--- New

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/AddProduct" element={<AddProduct />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* <--- New */}
            <Route path="/account" element={<Account />} />   {/* <--- New */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;