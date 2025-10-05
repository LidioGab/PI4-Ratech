import MenuLateral from "../../../components/menuLateral";
import Header from "../../../components/header";
import { useAuth } from '../../../context/AuthContext.jsx';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './index.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function admpage(){
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProdutos: 0,
    produtosAtivos: 0,
    produtosInativos: 0,
    totalUsuarios: 0,
    valorTotalEstoque: 0,
    baixoEstoque: 0,
    produtosCriticos: [],
    loading: true
  });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  async function carregarEstatisticas() {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      const statsResp = await api.get('/dashboard/estatisticas');
      const statsData = statsResp.data;
      
      let produtosCriticos = [];
      if (statsData.baixoEstoque > 0) {
        try {
          const criticosResp = await api.get('/dashboard/produtos-criticos');
          produtosCriticos = criticosResp.data.slice(0, 5);
        } catch (e) {
          console.warn('Erro ao buscar produtos críticos:', e);
        }
      }

      setStats({
        totalProdutos: statsData.totalProdutos || 0,
        produtosAtivos: statsData.produtosAtivos || 0,
        produtosInativos: statsData.produtosInativos || 0,
        totalUsuarios: statsData.totalUsuarios || 0,
        valorTotalEstoque: statsData.valorTotalEstoque || 0,
        baixoEstoque: statsData.baixoEstoque || 0,
        produtosCriticos,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({
        totalProdutos: 0,
        produtosAtivos: 0,
        produtosInativos: 0,
        totalUsuarios: 0,
        valorTotalEstoque: 0,
        baixoEstoque: 0,
        produtosCriticos: [],
        loading: false
      });
    }
  }

  const statusChartData = {
    labels: ['Ativos', 'Inativos'],
    datasets: [{
      data: [stats.produtosAtivos, stats.produtosInativos],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } }
    }
  };

  if (stats.loading) {
    return (
      <div className="admin-layout">
        <MenuLateral />
        <div className="admin-main">
          <Header nome={"Dashboard"} />
          <div className="page-content">
            <div className="loading-dashboard">
              <div className="spinner"></div>
              <p>Carregando estatísticas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <MenuLateral />
      <div className="admin-main">
        <Header nome={"Dashboard"} />
        <div className="page-content">
          <div className="dashboard-container">
            <div className="welcome-section">
              <h1>Dashboard - {user?.nome}</h1>
              <p>Visão geral do sistema</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon products">
                  <span>📦</span>
                </div>
                <div className="stat-info">
                  <h3>{stats.totalProdutos}</h3>
                  <p>Total Produtos</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon active">
                  <span>✅</span>
                </div>
                <div className="stat-info">
                  <h3>{stats.produtosAtivos}</h3>
                  <p>Ativos</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon warning">
                  <span>⚠️</span>
                </div>
                <div className="stat-info">
                  <h3>{stats.baixoEstoque}</h3>
                  <p>Baixo Estoque</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon value">
                  <span>💰</span>
                </div>
                <div className="stat-info">
                  <h3>R$ {Number(stats.valorTotalEstoque).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                  <p>Valor Estoque</p>
                </div>
              </div>

              {user?.grupo === 'Administrador' && (
                <div className="stat-card">
                  <div className="stat-icon users">
                    <span>👥</span>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalUsuarios}</h3>
                    <p>Usuários</p>
                  </div>
                </div>
              )}
            </div>

            <div className="status-criticos-section">
              <div className="chart-card">
                <h3>Status dos Produtos</h3>
                <div className="chart-container">
                  <Doughnut data={statusChartData} options={chartOptions} />
                </div>
                <div className="chart-summary">
                  <span className="summary-item active">
                    <span className="dot green"></span>
                    {stats.produtosAtivos} Ativos
                  </span>
                  <span className="summary-item inactive">
                    <span className="dot red"></span>
                    {stats.produtosInativos} Inativos
                  </span>
                </div>
              </div>

              {stats.produtosCriticos.length > 0 && (
                <div className="criticos-card">
                  <h3>⚠️ Produtos com Estoque Crítico</h3>
                  <div className="criticos-list">
                    {stats.produtosCriticos.map(produto => (
                      <div key={produto.id} className="critico-item">
                        <div className="critico-info">
                          <span className="critico-nome" title={produto.nome}>
                            {produto.nome.length > 25 ? produto.nome.substring(0, 25) + '...' : produto.nome}
                          </span>
                          <span className={`critico-estoque ${produto.quantidadeEstoque === 0 ? 'zero' : 'baixo'}`}>
                            {produto.quantidadeEstoque === 0 ? 'SEM ESTOQUE' : `${produto.quantidadeEstoque} unidades`}
                          </span>
                        </div>
                        <span className="critico-preco">R$ {Number(produto.preco).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
