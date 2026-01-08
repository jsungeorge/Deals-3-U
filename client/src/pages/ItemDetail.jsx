import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import axios from 'axios';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);

  useEffect(() => {
    // Fetch the specific item details
    axios.get(`http://localhost:5001/api/assets/${id}`)
      .then(res => setItem(res.data))
      .catch(() => navigate('/')); // Go back if not found
  }, [id, navigate]);

  if (!item) return <div style={{padding:'50px', textAlign: 'center'}}>Loading Item...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', display: 'flex', gap: '40px', padding: '0 20px', flexDirection: 'row', alignItems: 'flex-start' }}>
      {/* Left: Image */}
      <div style={{ flex: 1 }}>
        <img 
          src={item.image} 
          alt={item.name} 
          style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
        />
      </div>

      {/* Right: Info */}
      <div style={{ flex: 1 }}>
        <span style={{ 
          background: '#e0e7ff', color: '#4338ca', 
          padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' 
        }}>
          {item.category}
        </span>
        
        <h1 style={{ fontSize: '2.5rem', margin: '15px 0' }}>{item.name}</h1>
        
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563', marginBottom: '30px' }}>
          {item.description}
        </p>

        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', color: item.available > 0 ? '#059669' : '#dc2626' }}>
            Status: {item.available > 0 ? `In Stock (${item.available} available)` : "Out of Stock"}
          </p>
          
          <button 
            onClick={() => {
              dispatch(addToCart(item));
              alert('Added to Cart!');
            }}
            disabled={item.available === 0}
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '1.1rem', opacity: item.available === 0 ? 0.5 : 1 }}
          >
            {item.available > 0 ? "Add to Loan Cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;