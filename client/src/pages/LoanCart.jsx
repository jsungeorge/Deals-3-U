import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // To get the guest URL

  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const [discount, setDiscount] = useState(5);
  const [anyDrop, setAnyDrop] = useState(false);
  const [emailNotify, setEmailNotify] = useState(false);

  // 👇 NEW: Auto-fill and Preview if Guest URL exists
  useEffect(() => {
    if (location.state?.guestUrl) {
      setUrl(location.state.guestUrl);
      // Automatically trigger preview
      handlePreview(null, location.state.guestUrl);
    }
  }, [location.state]);

  // Modified to accept optional manual URL (for the useEffect)
  const handlePreview = async (e, manualUrl = null) => {
    if (e) e.preventDefault();
    const targetUrl = manualUrl || url;
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/products/preview', { url: targetUrl });
      setPreviewData(res.data);
      setStep(2);
    } catch (err) {
      alert("Error finding product. Check the link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
   const productToSave = {
        url: previewData.url,
        title: previewData.title,
        image: previewData.image,
        price: previewData.price,
        targetPercentage: anyDrop ? 0.1 : discount,
        notifyOnDrop: emailNotify
      };
      navigate('/register', { state: { productToSave } }); 
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/products/add', {
        userId: user.id,
        url: previewData.url,
        title: previewData.title,
        image: previewData.image,
        price: previewData.price,
        targetPercentage: anyDrop ? 0.1 : discount,
        notifyOnDrop: emailNotify
      });
      navigate('/'); 
    } catch (err) {
      alert("Error saving product.");
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '60px auto', padding: '30px' }}>
      
      {/* STEP 1: PASTE LINK */}
      {step === 1 && (
        <div style={styles.card}>
          <h1 style={{ textAlign: 'center' }}>Track a New Deal</h1>
          <p style={{ textAlign: 'center', color: '#666' }}>Paste an Amazon link to begin.</p>
          <form onSubmit={handlePreview} style={{ marginTop: '20px' }}>
            <input 
              type="url" 
              placeholder="https://www.amazon.ca/..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Scanning..." : "Preview Item →"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: CONFIGURE */}
      {step === 2 && previewData && (
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <img src={previewData.image} style={{ width: '100px', objectFit: 'contain' }} />
            <div>
              <h3 style={{ margin: '0 0 10px 0' }}>{previewData.title.substring(0, 60)}...</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                ${previewData.formattedPrice}
              </div>
            </div>
          </div>

          <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{marginTop: 0, marginBottom: '15px'}}>Alert Settings</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <input 
                type="checkbox" 
                id="anyDrop"
                checked={anyDrop} 
                onChange={(e) => setAnyDrop(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#db2777' }}
              />
              <label htmlFor="anyDrop" style={{fontWeight: 'bold', cursor: 'pointer'}}>Alert me on ANY price drop</label>
            </div>

            <div style={{ opacity: anyDrop ? 0.5 : 1, pointerEvents: anyDrop ? 'none' : 'auto', transition: '0.2s' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                Or wait for a specific discount: <span style={{ color: '#db2777', fontWeight: 'bold' }}>{discount}% OFF</span>
              </label>
              <input 
                type="range" min="1" max="50" value={discount} 
                onChange={(e) => setDiscount(e.target.value)}
                style={{ width: '100%', marginBottom: '10px', accentColor: '#db2777' }} 
              />
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: 0 }}>
                Target Price: <strong>${(previewData.price * (1 - discount/100)).toFixed(2)}</strong>
              </p>
            </div>

            <hr style={{border: 'none', borderTop: '1px solid #ddd', margin: '20px 0'}} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={emailNotify} 
                onChange={(e) => setEmailNotify(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Send me an email notification</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button onClick={() => setStep(1)} style={{ ...styles.btn, background: '#ccc' }}>Back</button>
            
            {/* 👇 DYNAMIC BUTTON TEXT */}
            <button onClick={handleSave} disabled={loading} style={styles.btn}>
              {loading ? "Saving..." : (user ? "Start Tracking" : "Sign in to save this item!")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' },
  input: { width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.1rem', marginBottom: '15px' },
  btn: { width: '100%', padding: '15px', borderRadius: '8px', border: 'none', background: '#db2777', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }
};

export default AddProduct;