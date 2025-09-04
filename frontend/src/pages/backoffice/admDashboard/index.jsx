import MenuLateral from "../../../components/menuLateral";
import Header from "../../../components/header";

export default function admpage(){
return(
    <div className="admin-page">
      <MenuLateral />      
      <div>
        <Header nome={"Bem vindo ao Dashboard"}/>
      </div>
    </div>
  );
}
