import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing scanner...");
  const [previewData, setPreviewData] = useState(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const [discount, setDiscount] = useState(5);
  const [anyDrop, setAnyDrop] = useState(false);
  const [emailNotify, setEmailNotify] = useState(false);

  const messages = [
    ":D Launching the price tracker...",
    "🔎 Scanning Amazon for details...",
    "📦 Extracting product image...",
    "This may take up to 30 seconds...",
    "Almost there... :)"
  ];

  // TEXT ROTATION EFFECT
  useEffect(() => {
    let interval;
    if (loading) {
      let i = 0;
      setLoadingText(messages[0]);
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingText(messages[i]);
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [loading]);

  // CHECK FOR GUEST URL
  useEffect(() => {
    if (location.state?.guestUrl) {
      setUrl(location.state.guestUrl);
      handlePreview(null, location.state.guestUrl);
    }
  }, [location.state]);

  const handlePreview = async (e, manualUrl = null) => {
    if (e) e.preventDefault();
    const targetUrl = manualUrl || url;
    
    if (!targetUrl) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/products/preview', { url: targetUrl });
      setPreviewData(res.data);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Error finding product. Amazon might be blocking requests or the link is invalid.");
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
      
      navigate('/login', { state: { productToSave } }); 
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/products/add', {
        userId: user.id,
        url: previewData.url, // Ensure we send the cleaned URL if backend provides it
        title: previewData.title,
        image: previewData.image,
        price: previewData.price,
        targetPercentage: anyDrop ? 0.1 : discount,
        notifyOnDrop: emailNotify
      });
      navigate('/'); 
    } catch (err) {
      alert("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '60px auto', padding: '30px' }}>
      <style>
      {`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}
    </style>
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
            
            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            <button 
              type="submit" 
              disabled={loading} 
              style={{
                ...styles.btn, 
                background: loading ? '#9ca3af' : '#db2777',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {loading ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
                    🔄
                  </span>
                  <span>{loadingText}</span>
                </>
              ) : (
                "Preview Item →"
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: CONFIGURE */}
      {step === 2 && previewData && (
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <img src={previewData.image} style={{ width: '100px', objectFit: 'contain' }} alt="Product" />
            <div>
              <h3 style={{ margin: '0 0 10px 0' }}>{previewData.title.substring(0, 60)}...</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {/* ⬇️ THIS WAS THE BUG. CHANGED FROM formattedPrice TO price */}
                ${previewData.price} 
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