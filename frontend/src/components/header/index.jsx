import "./index.css"
import logo from "../../assets/images/logoRatehc.png"

export default function Header({nome}){
  return(
    <div className="header-page fixed top-0">
      <div className="ghost-div"></div>
      <div>
        <h1>
          {nome}
        </h1>
      </div>
      <img src={logo} alt="" />
    </div>
  );
}
