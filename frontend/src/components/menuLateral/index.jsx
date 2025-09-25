
import logoRatechName from '../../assets/images/logoRatechNome.png'
import { Link } from 'react-router-dom';
import './index.css'

export default function MenuLateral() {
  return (
    <div className='menuLateralPage'>
      <img src={logoRatechName} alt="Ratech Logo" />
      <nav className="menu-links">
        <ul>
          <li>
            <Link to="/usuarios">Lista de Usuários</Link>
          </li>
          <li>
            <Link to="/produtos">Lista de Produtos</Link>
          </li>
          <li>
            <Link to="/admdashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
