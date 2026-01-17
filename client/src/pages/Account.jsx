import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return <div style={{ padding: '40px' }}>Please log in.</div>;

  // Format the date 
  const joinDate = user.dateJoined 
    ? new Date(user.dateJoined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Account Settings</h1>
      
      <div style={styles.card}>
        <div style={styles.row}>
          <span style={styles.label}>Full Name</span>
          <span style={styles.value}>{user.name}</span>
        </div>
        
        <div style={styles.row}>
          <span style={styles.label}>Email Address</span>
          <span style={styles.value}>{user.email}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Member Since</span>
          <span style={styles.value}>{joinDate}</span>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => { logout(); navigate('/'); }} 
          style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #f3f4f6' },
  label: { color: '#666', fontWeight: '500' },
  value: { fontWeight: 'bold', color: '#111' }
};

export default Account;
