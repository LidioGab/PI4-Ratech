import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/backoffice/loginAdmPage/index.jsx';
import AdminDashboard from "./pages/backoffice/admDashboard/index.jsx";
import ListarUsuarios from './pages/backoffice/listarUsuarios/index.jsx';
import CriarUsuario from './pages/backoffice/criarUsuario/index.jsx';
import EditarUsuario from './pages/backoffice/editarUsuario/index.jsx';

function ListaProdutos() {
  return <h1>Lista de Produtos</h1>;
}

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admdashboard" element={<AdminDashboard />} />
          <Route path="/usuarios" element={<ListarUsuarios />} />
          <Route path="/criar-usuario" element={<CriarUsuario />} />
          <Route path="/editar-usuario/:id" element={<EditarUsuario />} />
          <Route path="/produtos" element={<ListaProdutos />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
