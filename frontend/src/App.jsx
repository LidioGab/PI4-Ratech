import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/backoffice/loginAdmPage/index.jsx';
import AdminDashboard from "./pages/backoffice/admDashboard/index.jsx";
import ListarUsuarios from './pages/backoffice/listarUsuarios/index.jsx';
import CriarUsuario from './pages/backoffice/criarUsuario/index.jsx';
import EditarUsuario from './pages/backoffice/editarUsuario/index.jsx';
import CadastroProduto from './pages/backoffice/cadastroProduto';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ListaProdutos from './pages/backoffice/listarProdutos/index.jsx';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admdashboard" element={<ProtectedRoute allowedGroups={["Administrador","Estoquista"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute allowedGroups={["Administrador"]}><ListarUsuarios /></ProtectedRoute>} />
          <Route path="/criar-usuario" element={<ProtectedRoute allowedGroups={["Administrador"]}><CriarUsuario /></ProtectedRoute>} />
          <Route path="/editar-usuario/:id" element={<ProtectedRoute allowedGroups={["Administrador"]}><EditarUsuario /></ProtectedRoute>} />
          <Route path="/produtos" element={<ProtectedRoute allowedGroups={["Administrador","Estoquista"]}><ListaProdutos /></ProtectedRoute>} />
          <Route path="/criar-produto" element={<ProtectedRoute allowedGroups={["Administrador"]}><CadastroProduto/></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
