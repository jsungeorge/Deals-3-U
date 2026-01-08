import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Login
      const res = await axios.post('/api/auth/login', { email, password });
      
      // 2. Save Token
      login(res.data.user, res.data.token);
      
      // 3. 
      // If we have a fully configured product waiting, save it now!
      if (location.state?.productToSave) {
        try {
          await axios.post('/api/products/add', {
            userId: res.data.user.id,
            ...location.state.productToSave
          });
          console.log("Auto-saved item after login");
        } catch (saveErr) {
          console.error("Auto-save failed:", saveErr);
        }
        // Go straight to dashboard since it's saved
        navigate('/');
      } 
      // Fallback: If we just have a raw URL (old flow), go back to Add Page
      else if (location.state?.guestUrl) {
        navigate(location.state.returnUrl, { state: { guestUrl: location.state.guestUrl } });
      } 
      // Default: Just go home
      else {
        navigate('/');
      }

    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome Back</h2>
      
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', background: '#db2777', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Login
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        New here? 
        {/* Pass the state to Register too if they click "Sign Up" from Login page */}
        <Link 
          to="/register" 
          state={location.state} 
          style={{ color: '#db2777', fontWeight: 'bold', marginLeft: '5px' }}
        >
          Create account
        </Link>
      </p>
    </div>
  );
};

export default Login;