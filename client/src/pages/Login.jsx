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
      // 1. Authenticate with Backend
      const res = await axios.post('/api/auth/login', { email, password });
      
      const { user, token } = res.data; // Extract user/token immediately

      // 2. ⚡️ AUTO-SAVE LOGIC (The "Kitchen Sink" Fix)
      if (location.state?.productToSave) {
        try {
          const product = location.state.productToSave;
          const calculatedTargetPrice = product.price * (1 - (product.targetPercentage / 100));

          await axios.post('/api/products/add', 
            {
              // 1. User ID (Safety Check)
              userId: user._id || user.id,

              // 2. The Original Data
              ...product,

              // 3. ✅ FIELD NAME SAFETY NET (Send EVERYTHING)
              // Database wants 'name'? We got it. Wants 'title'? Got that too.
              name: product.title, 
              title: product.title,
              
              // Database wants 'image'? 'imageUrl'? 'img'? Send them all.
              image: product.image,
              imageUrl: product.image,
              img: product.image,

              // Database wants 'price'? 'currentPrice'?
              price: product.price,
              currentPrice: product.price,

              // 4. ✅ REQUIRED DEFAULTS (The likely crash fix)
              // If your DB requires a category and we sent null, it crashes.
              category: "General", 
              available: true,

              // 5. Calculated Logic
              targetPrice: calculatedTargetPrice
            },
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          alert("✅ Success! Item saved to dashboard."); 
        } catch (saveErr) {
          console.error("Auto-save failed:", saveErr);
          
          // 🔎 THE ERROR REVEALER
          // This will print the EXACT reason from the database (e.g., "Path 'category' is required")
          const reason = JSON.stringify(saveErr.response?.data) || saveErr.message;
          alert(`SAVE FAILED. Please tell me what this says:\n\n${reason}`);
        }
      }

      // 3. NOW update the global state (This triggers the redirect)
      login(user, token);
      
      // 4. Manual redirect (backup)
      navigate('/');

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