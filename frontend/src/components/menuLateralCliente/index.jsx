import logoRatechName from '../../assets/images/logoRatechNome.png'
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './index.css'

export default function MenuLateralCliente() {
  const { user } = useAuth();
  return (
    <div className='menuLateralPage'>
      <img src={logoRatechName} alt="Ratech Logo" />
      <nav className="menu-links">
        <ul>
          <li>
            <Link to="/mouses">Mouses</Link>
          </li>
          <li>
            <Link to="/mousepads">Mousepads</Link>
          </li>
          <li>
            <Link to="/teclados">Teclados</Link>
          </li>
           <li>
            <Link to="/monitores">Monitores</Link>
          </li>
           <li>
            <Link to="/headset">Headset</Link>
          </li>
           <li>
            <Link to="/controles">Controles</Link>
          </li>
          {user && (
            <li>
              <Link to="/meus-enderecos">Meus Endereços</Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
