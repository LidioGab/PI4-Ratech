import "./index.css";
import logo from "../../assets/images/logoRatehc.png";
import { useNavigate } from 'react-router-dom';

export default function HeaderFrontoffice({ nome, showBackButton = false, backTo = "/" }) {
  const navigate = useNavigate();

  function handleBack() {
    navigate(backTo);
  }

  function handleHome() {
    navigate('/');
  }

  return (
    <div className="header-frontoffice">
      <div className="header-left">
        {showBackButton && (
          <button className="back-btn" onClick={handleBack}>
            ← Voltar
          </button>
        )}
        <img src={logo} alt="logo" onClick={handleHome} className="logo-clickable" />
      </div>
      <div className="header-center">
        <h1>{nome}</h1>
      </div>
      <div className="header-right">
        <button className="signup-btn" onClick={() => navigate('/cadastro-cliente')}>
          Criar Conta
        </button>
      </div>
    </div>
  );
}
