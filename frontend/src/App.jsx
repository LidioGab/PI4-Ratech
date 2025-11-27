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
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import ListaProdutos from './pages/backoffice/listarProdutos/index.jsx';
import VisualizarProduto from './pages/backoffice/visualizarProduto';
import EditarProduto from './pages/backoffice/editarProduto';
import DetalhesProduto from './pages/backoffice/detalhesProduto';
import ListarPedidos from './pages/backoffice/listarPedidos/index.jsx';
import EditarPedido from './pages/backoffice/editarPedido/index.jsx';

import PaginaInicial from './pages/frontoffice/paginaInicial/index.jsx';
import ListarProdutosFrontoffice from './pages/frontoffice/listarProdutos/index.jsx';
import DetalhesProdutoFrontoffice from './pages/frontoffice/detalhesProduto/index.jsx';
import CadastroCliente from './pages/frontoffice/cadastroCliente/index.jsx';
import PerfilCliente from './pages/frontoffice/perfilCliente/index.jsx';
import PedidosCliente from './pages/frontoffice/pedidosCliente/index.jsx';
import DetalhesPedido from './pages/frontoffice/detalhesPedido/index.jsx';

import MenuLateralCarrinho from './components/menuLateralCarrinho/index.jsx';
import LoginPage from './pages/frontoffice/LoginPage/LoginPage.jsx';
import Checkout from './pages/frontoffice/checkout/index.jsx';
import CheckoutEndereco from './pages/frontoffice/checkout/CheckoutEndereco.jsx';
import CheckoutPagamento from './pages/frontoffice/checkout/CheckoutPagamento.jsx';
import CheckoutResumo from './pages/frontoffice/checkout/CheckoutResumo.jsx';
import CheckoutSucesso from './pages/frontoffice/checkout/CheckoutSucesso.jsx';



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
            <Route path="/cadastro-cliente" element={<CadastroCliente/>}/>
            <Route path="/perfil-cliente" element={<PerfilCliente/>}/>
            <Route path="/meus-pedidos" element={<PedidosCliente/>}/>
            <Route path="/pedidos/:id/detalhes" element={<DetalhesPedido/>}/>
            <Route path="/checkout" element={<Checkout/>}/>
            <Route path="/checkout/endereco" element={<CheckoutEndereco/>}/>
            <Route path="/checkout/pagamento" element={<CheckoutPagamento/>}/>
            <Route path="/checkout/resumo" element={<CheckoutResumo/>}/>
            <Route path="/checkout/sucesso/:pedidoId" element={<CheckoutSucesso/>}/>
            <Route path="/login-adm" element={<LoginAdmPage/>} />
            <Route path="/loginAdm" element={<LoginAdmPage/>} /> {/* Manter para compatibilidade */}
            <Route path="/admdashboard" element={<AdminProtectedRoute allowedGroups={["Administrador","Estoquista"]}><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/usuarios" element={<AdminProtectedRoute allowedGroups={["Administrador"]}><ListarUsuarios /></AdminProtectedRoute>} />
            <Route path="/criar-usuario" element={<AdminProtectedRoute allowedGroups={["Administrador"]}><CriarUsuario /></AdminProtectedRoute>} />
            <Route path="/editar-usuario/:id" element={<AdminProtectedRoute allowedGroups={["Administrador"]}><EditarUsuario /></AdminProtectedRoute>} />
            <Route path="/produtos" element={<AdminProtectedRoute allowedGroups={["Administrador","Estoquista"]}><ListaProdutos /></AdminProtectedRoute>} />
            <Route path="/criar-produto" element={<AdminProtectedRoute allowedGroups={["Administrador"]}><CadastroProduto/></AdminProtectedRoute>} />
            <Route path="/visualizar-produto/:id" element={<AdminProtectedRoute allowedGroups={["Administrador","Estoquista"]}><VisualizarProduto/></AdminProtectedRoute>} />
            <Route path="/editar-produto/:id" element={<AdminProtectedRoute allowedGroups={["Administrador","Estoquista"]}><EditarProduto/></AdminProtectedRoute>} />
            <Route path="/detalhes-produto" element={<DetalhesProduto />} />
            <Route path="/listar-pedidos" element={<AdminProtectedRoute allowedGroups={["Estoquista"]}><ListarPedidos /></AdminProtectedRoute>} />
            <Route path="/editar-pedido/:id" element={<AdminProtectedRoute allowedGroups={["Estoquista"]}><EditarPedido /></AdminProtectedRoute>} />
          </Routes>
          <MenuLateralCarrinho />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
