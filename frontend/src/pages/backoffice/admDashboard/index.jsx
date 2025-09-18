import MenuLateral from "../../../components/menuLateral";
import Header from "../../../components/header";
import './index.css';

export default function admpage(){
  return (
    <div className="admin-layout">
      <MenuLateral />
      <div className="admin-main">
        <Header nome={"Bem vindo ao Dashboard"} />
        <div className="page-content">
        </div>
      </div>
    </div>
  );
}
