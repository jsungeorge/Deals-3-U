import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  
  const [guestUrl, setGuestUrl] = useState('');
  const navigate = useNavigate();

  // 1. POLL FOR UPDATES (Every 2 seconds)
  useEffect(() => {
    // Define fetch function inside to keep dependency array clean
    const fetchProducts = () => {
      if (user) {
        axios.get(`http://localhost:5001/api/products/user/${user.id}?t=${new Date().getTime()}`)
          .then(res => {
            const sorted = res.data.sort((a, b) => {
              const aIsDeal = a.currentPrice <= (a.initialPrice * (1 - a.targetPercentage/100));
              const bIsDeal = b.currentPrice <= (b.initialPrice * (1 - b.targetPercentage/100));
              if (aIsDeal && !bIsDeal) return -1;
              if (!aIsDeal && bIsDeal) return 1;
              return new Date(b.dateAdded) - new Date(a.dateAdded);
            });
            setProducts(sorted);
          })
          .catch(err => console.error(err));
      }
    };

    fetchProducts();
    const interval = setInterval(fetchProducts, 2000); 
    return () => clearInterval(interval);
  }, [user]);

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if(!guestUrl) return;
    navigate('/loans', { state: { guestUrl } });
  };
  
  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to stop tracking this item?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/products/${id}`);
      // No manual fetch needed, the poller will catch it
    } catch (err) {
      alert("Error deleting item");
    }
  };

  // --- FOOTER SIGNATURE COMPONENT ---
  const Signature = () => (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', fontSize: '0.85rem', color: '#888', background: 'rgba(255,255,255,0.8)', padding: '5px 10px', borderRadius: '20px', backdropFilter: 'blur(5px)' }}>
      Built with ❤️ by <a href="https://www.linkedin.com/in/jiashusun/" target="_blank" rel="noopener noreferrer" style={{ color: '#db2777', textDecoration: 'none', fontWeight: 'bold' }}>Jiashu Sun</a>
    </div>
  );

  // --- 1. GUEST VIEW ---
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 100%)', minHeight: '80vh' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#db2777', marginBottom: '15px', letterSpacing: '-1px' }}>
          Deals ❤️ U
        </h1>
        <p style={{ fontSize: '1.4rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.5' }}>
          Paste an Amazon link. Set your price. <br/>
          <span style={{fontWeight:'bold', color: '#111'}}>We'll watch for your dream deal</span>
        </p>
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <form onSubmit={handleGuestSubmit} style={{ display: 'flex', gap: '10px', boxShadow: '0 10px 40px rgba(219, 39, 119, 0.15)', padding: '10px', background: 'white', borderRadius: '50px', border: '1px solid #eee' }}>
            <input 
              type="url" placeholder="Paste an Amazon link..." value={guestUrl} onChange={(e) => setGuestUrl(e.target.value)} required
              style={{ flex: 1, padding: '15px 25px', borderRadius: '40px', border: 'none', fontSize: '1.1rem', outline: 'none' }}
            />
            <button type="submit" style={{ background: '#db2777', color: 'white', border: 'none', padding: '15px 35px', borderRadius: '40px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Continue
            </button>
          </form>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '80px', flexWrap: 'wrap' }}>
          <FeatureCard icon="📉" title="Real-Time Drops" desc="We actively scan for price drops so you don't have to." />
          <FeatureCard icon="🎯" title="Smart Targets" desc="Discount goal in mind? You're in control." />
          <FeatureCard icon="📬" title="Instant Alerts" desc="Tick our option for an email the second your price is hit." />
        </div>
        <Signature />
      </div>
    );
  }

  // --- 2. USER DASHBOARD ---
  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>My Watchlist</h2>
        <Link to="/loans" style={{ background: '#db2777', color: 'white', padding: '10px 20px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold' }}>+ Add Item</Link>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #ddd', borderRadius: '12px' }}>
          <h3 style={{color: '#374151'}}>Your dashboard is empty</h3>
          <p style={{color: '#6b7280', marginBottom: '20px'}}>Paste a link to start saving money.</p>
          <Link to="/loans" style={{color: '#db2777', fontWeight: 'bold'}}>Track your first item →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {products.map(p => {
            const targetPrice = p.initialPrice * (1 - p.targetPercentage/100);
            const isDeal = p.currentPrice <= targetPrice;

            return (
              <div key={p._id} style={{ 
                background: isDeal ? '#ecfdf5' : 'white', 
                border: isDeal ? '2px solid #059669' : '1px solid #eee',
                padding: '20px', borderRadius: '16px', display: 'flex', gap: '20px', alignItems: 'center',
                boxShadow: isDeal ? '0 4px 15px rgba(5, 150, 105, 0.15)' : '0 2px 5px rgba(0,0,0,0.03)',
                position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease'
              }}>
                <div style={{ width: '100px', height: '100px', background: 'white', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={p.image} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt={p.title} />
                </div>
                <div style={{ flex: 1 }}>
                  {isDeal && <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '5px' }}>🎉 PRICE DROP DETECTED!</div>}
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', lineHeight: '1.4' }}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{p.title}</a>
                  </h3>
                  <div style={{ display: 'flex', gap: '30px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>CURRENT</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isDeal ? '#059669' : '#333' }}>${p.currentPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>TARGET</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#db2777' }}>${targetPrice.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(p._id)} style={{ background: 'white', border: '1px solid #fee2e2', color: '#dc2626', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">🗑️</button>
              </div>
            );
          })}
        </div>
      )}
      <Signature />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div style={{ width: '250px', padding: '20px', borderRadius: '12px', background: 'white', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{icon}</div>
    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{title}</h3>
    <p style={{ margin: 0, fontSize: '0.95rem', color: '#666', lineHeight: '1.5' }}>{desc}</p>
  </div>
);

export default Home;