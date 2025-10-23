import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FreteCalculator from '../../../components/FreteCalculator';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:8080/login';

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                const mensagem = data.message || "Erro desconhecido ao fazer login.";
                throw new Error(mensagem);
            }

            localStorage.setItem('userSession', JSON.stringify(data));
            localStorage.setItem('authToken', data.grupo === 'Cliente' ? 'cliente_token_fake' : 'admin_token_fake');

            navigate('/');

        } catch (error) {
            setErro(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd' }}>
            <h2>Acesse sua conta</h2>
            <form onSubmit={handleLogin}>
                {erro && <p style={{ color: 'red', textAlign: 'center' }}>{erro}</p>}

                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu.email@exemplo.com"
                    style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
                />

                <label>Senha:</label>
                <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    placeholder="Sua senha"
                    style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', background: 'navy', color: 'white', border: 'none' }}
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            {/*  */}
            {/*  */}
        </div>
    );
};

export default LoginPage;