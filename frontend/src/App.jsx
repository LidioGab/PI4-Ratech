import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginAdmPage from './pages/backoffice/loginAdmPage/index.jsx';
import AdminDashboard from "./pages/backoffice/admDashboard/index.jsx";
import ListarUsuarios from './pages/backoffice/listarUsuarios/index.jsx';
import CriarUsuario from './pages/backoffice/criarUsuario/index.jsx';
import EditarUsuario from './pages/backoffice/editarUsuario/index.jsx';
import CadastroProduto from './pages/backoffice/cadastroProduto';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ListaProdutos from './pages/backoffice/listarProdutos/index.jsx';
import VisualizarProduto from './pages/backoffice/visualizarProduto';
import EditarProduto from './pages/backoffice/editarProduto';
import DetalhesProduto from './pages/backoffice/detalhesProduto';

import PaginaInicial from './pages/frontoffice/paginaInicial/index.jsx';
import ListarProdutosFrontoffice from './pages/frontoffice/listarProdutos/index.jsx';
import DetalhesProdutoFrontoffice from './pages/frontoffice/detalhesProduto/index.jsx';
import MenuLateralCarrinho from './components/menuLateralCarrinho/index.jsx';



import LoginPage from './pages/frontoffice/LoginPage/index.jsx';



function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PaginaInicial/>}/>
            <Route path="/produtos-loja" element={<ListarProdutosFrontoffice/>}/>
            <Route path="/produto/:id" element={<DetalhesProdutoFrontoffice/>}/>


            <Route path="/login" element={<LoginPage/>} />


            <Route path="/loginAdm" element={<LoginAdmPage/>} />
            <Route path="/admdashboard" element={<ProtectedRoute allowedGroups={["Administrador","Estoquista"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute allowedGroups={["Administrador"]}><ListarUsuarios /></ProtectedRoute>} />
            <Route path="/criar-usuario" element={<ProtectedRoute allowedGroups={["Administrador"]}><CriarUsuario /></ProtectedRoute>} />
            <Route path="/editar-usuario/:id" element={<ProtectedRoute allowedGroups={["Administrador"]}><EditarUsuario /></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute allowedGroups={["Administrador","Estoquista"]}><ListaProdutos /></ProtectedRoute>} />
            <Route path="/criar-produto" element={<ProtectedRoute allowedGroups={["Administrador"]}><CadastroProduto/></ProtectedRoute>} />
            <Route path="/visualizar-produto/:id" element={<ProtectedRoute allowedGroups={["Administrador","Estoquista"]}><VisualizarProduto/></ProtectedRoute>} />
            <Route path="/editar-produto/:id" element={<ProtectedRoute allowedGroups={["Administrador","Estoquista"]}><EditarProduto/></ProtectedRoute>} />
            <Route path="/detalhes-produto" element={<DetalhesProduto />} />
          </Routes>
          <MenuLateralCarrinho />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;