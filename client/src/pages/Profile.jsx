import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (user && user.id) {
        try {
          // 👇 CHANGED: Now fetches your Tracked Products
          const res = await axios.get(`/api/products/user/${user.id}`);
          setTrackedProducts(res.data);
        } catch (err) {
          console.error("Error fetching products:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProducts();
  }, [user]);

  if (!user) return <div style={{ padding: '40px' }}>Please log in.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>My Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Welcome back, {user.name}</p>
        </div>
        
        {/* Quick button to add new items */}
        <Link to="/loans" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
          + Track New Item
        </Link>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>My Watchlist</h2>

      {loading ? (
        <p>Loading your items...</p>
      ) : trackedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>You aren't tracking any items yet.</p>
          <Link to="/loans" style={{ color: '#2563eb', fontWeight: 'bold' }}>Start tracking now →</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {trackedProducts.map((product) => (
            <div key={product._id} style={styles.card}>
              <div style={styles.cardContent}>
                
                {/* 1. Product Image */}
                <div style={styles.imageContainer}>
                  <img 
                    src={product.image || "https://placehold.co/100"} 
                    alt={product.title} 
                    style={styles.image} 
                  />
                </div>

                {/* 2. Details */}
                <div style={{ flex: 1 }}>
                  <h3 style={styles.productTitle}>
                    <a href={product.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {product.title.length > 80 ? product.title.substring(0, 80) + "..." : product.title}
                      <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>🔗</span>
                    </a>
                  </h3>
                  
                  <div style={styles.priceRow}>
                    <div style={styles.priceBlock}>
                      <span style={styles.label}>Current Price</span>
                      <span style={styles.currentPrice}>${product.currentPrice.toFixed(2)}</span>
                    </div>

                    <div style={styles.priceBlock}>
                      <span style={styles.label}>Started At</span>
                      <span style={styles.initialPrice}>${product.initialPrice.toFixed(2)}</span>
                    </div>

                    <div style={styles.priceBlock}>
                      <span style={styles.label}>Target</span>
                      <span style={styles.targetPrice}>${product.targetPrice?.toFixed(2) || "N/A"}</span>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '10px' }}>
                    Tracked since: {new Date(product.dateAdded).toLocaleDateString()}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Updated Styles for "Price Cards"
const styles = {
  grid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { 
    border: '1px solid var(--border)', 
    borderRadius: '12px', 
    padding: '20px', 
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
    transition: 'transform 0.2s',
  },
  cardContent: { display: 'flex', gap: '20px', alignItems: 'center' },
  imageContainer: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    padding: '5px'
  },
  image: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  productTitle: { margin: '0 0 10px 0', fontSize: '1.05rem', lineHeight: '1.4', fontWeight: '600', color: '#1f2937' },
  priceRow: { display: 'flex', gap: '25px', alignItems: 'center' },
  priceBlock: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', letterSpacing: '0.5px' },
  currentPrice: { fontSize: '1.2rem', fontWeight: 'bold', color: '#059669' }, // Green
  initialPrice: { fontSize: '1rem', color: '#9ca3af', textDecoration: 'line-through' }, // Gray strikethrough
  targetPrice: { fontSize: '1rem', color: '#2563eb', fontWeight: '500' } // Blue
};

export default Profile;