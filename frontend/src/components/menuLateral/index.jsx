
import logoRatechName from '../../assets/images/logoRatechNome.png'
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './index.css'

export default function MenuLateral() {
  const { user } = useAuth();
  
  return (
    <div className='menuLateralPage'>
      <img src={logoRatechName} alt="Ratech Logo" />
      <nav className="menu-links">
        <ul>
          {user?.grupo === 'Administrador' && (
            <li>
              <Link to="/usuarios">Lista de Usuários</Link>
            </li>
          )}
          <li>
            <Link to="/produtos">Lista de Produtos</Link>
          </li>
          {user?.grupo === 'Estoquista' && (
            <li>
              <Link to="/listar-pedidos">Lista de Pedidos</Link>
            </li>
          )}
          <li>
            <Link to="/admdashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
