import { useState } from 'react';
import { login } from '../services/authService';
import type { User } from '../types';

export function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('agente@soporte360.local');
  const [password, setPassword] = useState('Soporte360-2026!');
  const [error, setError] = useState('');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const user = login(email, password);
    if (user) onLogin(user);
    else setError('Credenciales incorrectas.');
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-badge">S360</div>
        <h1>Soporte que sigue el ritmo de tus clientes.</h1>
        <p>Centralizá consultas, prioridades y seguimiento del equipo en un único lugar.</p>
        <div className="testimonial">“Ahora vemos qué casos necesitan atención antes de que el cliente tenga que reclamar.”<strong>Equipo de Operaciones</strong></div>
      </div>
      <form className="login-card" onSubmit={submit}>
        <div className="logo-row"><span className="logo-mark">S</span><strong>Soporte360</strong></div>
        <div><h2>Bienvenido</h2><p>Ingresá a tu espacio de trabajo.</p></div>
        <label>Correo<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="primary full">Ingresar</button>
        <small className="demo-hint">Las credenciales demo ya están cargadas.</small>
      </form>
    </div>
  );
}
