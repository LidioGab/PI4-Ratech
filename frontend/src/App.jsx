import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/backoffice/loginAdmPage/index.jsx';
import AdminDashboard from "./pages/backoffice/admDashboard/index.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admdashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
