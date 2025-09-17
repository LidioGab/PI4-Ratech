import "./index.css";
import logo from "../../assets/images/logoRatehc.png";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from 'react-router-dom';

export default function Header({ nome }) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="header-page fixed top-0">
      <div className="ghost-div"></div>
      <div>
        <h1>{nome}</h1>
      </div>
      <div className="header-right">
        {isAuthenticated && (
          <>
            <span className="user-badge">{user?.nome} ({user?.grupo})</span>
            <button className="logout-btn" onClick={handleLogout}>Sair</button>
          </>
        )}
        <img src={logo} alt="logo" />
      </div>
    </div>
  );
}
