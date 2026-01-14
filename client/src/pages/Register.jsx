import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: ''});
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... validation checks ...

    try {
      // 1. Register API
      const res = await axios.post('/api/auth/register', { name, email, password });
      
      // 2. Login Context
      login(res.data.user, res.data.token);

      // 3. AUTO-SAVE LOGIC (Identical to Login.jsx)
      if (location.state?.productToSave) {
        try {
          const userId = res.data.user._id || res.data.user.id;
          await axios.post('/api/products/add', {
            userId: userId, 
            ...location.state.productToSave
          });
        } catch (saveErr) {
          console.error("Auto-save failed:", saveErr);
        }
      }

      navigate('/');

    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };
  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Account</h2>
      
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={styles.label}>Full Name</label>
          <input 
            type="text" 
            placeholder="John Pork"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={styles.input}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={styles.label}>Email</label>
          <input 
            type="email" 
            placeholder="john@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={styles.input}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={styles.label}>Password</label>
          <input 
            type="password" 
            placeholder=""
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={styles.input}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={styles.label}>Confirm Password</label>
          <input 
            type="password" 
            placeholder=""
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            style={styles.input}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', background: '#db2777', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sign Up
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        Already have an account? 
        <Link 
          to="/login" 
          state={location.state} 
          style={{ color: '#db2777', fontWeight: 'bold', marginLeft: '5px' }}
        >
          Login
        </Link>
      </p>
    </div>
  );
};

const styles = {
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }
};

export default Register;