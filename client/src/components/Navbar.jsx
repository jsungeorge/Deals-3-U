import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        {/* BRAND */}
        <Link to="/" style={styles.brand}>
          Deals ❤️ U
        </Link>
        
        <div style={styles.links}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link to="/account" style={styles.userLink}>
                Hi, {user.name}
              </Link>
            </div>
          ) : (

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.btnAccent}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: { backgroundColor: 'white', borderBottom: '1px solid #eaeaea', padding: '15px 0', position: 'sticky', top: 0, zIndex: 100 },
  container: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  brand: { fontSize: '1.5rem', fontWeight: 'bold', color: '#db2777', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center' },
  link: { textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' },
  userLink: { textDecoration: 'none', color: '#333', fontWeight: 'bold', fontSize: '1rem' },
  btnAccent: { 
    textDecoration: 'none', 
    backgroundColor: '#db2777', 
    color: 'white', 
    padding: '10px 24px', 
    borderRadius: '30px', 
    fontWeight: 'bold', 
    fontSize: '0.95rem',
    display: 'inline-block',
    lineHeight: '1' 
  },
};

export default Navbar;
