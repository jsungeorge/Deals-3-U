import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';

const AssetCard = ({ asset }) => {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(addToCart(asset)); // Send to redux
  };
const isOutOfStock = asset.available <= 0;

return (
  <div style={styles.card} className="card">
    <div style={styles.imagePlaceholder}>{asset.category[0]}</div>
    <div style={styles.content}>
      <h3 style={styles.title}>{asset.name}</h3>
      <p style={styles.meta}>{asset.category} • {asset.available} Available</p>
      
      {/* UPDATED BUTTON */}
      <button 
        onClick={handleAdd} 
        disabled={isOutOfStock} // <--- Logic
        className="btn"
        style={{ 
          width: '100%', 
          marginTop: '10px',
          backgroundColor: isOutOfStock ? '#ccc' : 'var(--primary)',
          cursor: isOutOfStock ? 'not-allowed' : 'pointer'
        }}
      >
        {isOutOfStock ? 'Out of Stock' : 'Add to Loan'}
      </button>

    </div>
  </div>
);
  return (
    <div style={styles.card} className="card">
      <div style={styles.imagePlaceholder}>{asset.category[0]}</div>
      <div style={styles.content}>
        <h3 style={styles.title}>{asset.name}</h3>
        <p style={styles.meta}>{asset.category} • {asset.available} Available</p>
        <button onClick={handleAdd} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
          Add to Loan
        </button>
      </div>
    </div>
  );
  
};

const styles = {
  card: { padding: 0, overflow: 'hidden' },
  imagePlaceholder: {
    height: '120px',
    backgroundColor: '#e0e7ff', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: 'var(--primary)',
    fontWeight: 'bold'
  },
  content: { padding: '16px' },
  title: { margin: '0 0 5px 0', fontSize: '1rem' },
  meta: { margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }
};

export default AssetCard;