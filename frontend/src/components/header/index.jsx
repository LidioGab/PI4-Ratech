import "./index.css"
import logo from "../../assets/images/logoRatehc.png"

export default function Header(){
  return(
    <div className="header-page fixed top-0">
      <div className="ghost-div"></div>
      <div>
        <h1>
          Faça seu login de admin
        </h1>
      </div>
      <img src={logo} alt="" />
    </div>
  );
}
