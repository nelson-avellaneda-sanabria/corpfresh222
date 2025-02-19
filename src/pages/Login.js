import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/sytles2.css";
import { useAuth } from "../services/AuthContext"; // Usar AuthContext
import GoogleLogin from "react-google-login";
import { gapi } from "gapi-script";

const clientID = "590045182886-8jfebo35qqi7mpc4dtldu48m3skpu6ne.apps.googleusercontent.com";

const Login = () => {
  const { user, login } = useAuth(); // Obtener el estado global de autenticación
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Redirige al perfil si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Configuración de Google API para la autenticación
  useEffect(() => {
    const start = () => {
      gapi.auth2.init({ client_id: clientID });
    };
    gapi.load("client:auth2", start);
  }, []);

  // Manejo del inicio de sesión con Google
  const onSuccess = (response) => {
    const googleUser = {
      name: response.profileObj.name,
      email: response.profileObj.email,
      avatar: response.profileObj.imageUrl,
    };

    login(googleUser); // Guarda usuario en contexto y localStorage
    navigate("/dashboard");
  };

  const onFailure = () => {
    console.log("Error en inicio de sesión con Google");
  };

  // Toggle para mostrar/ocultar la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Manejo del envío del formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos vacíos
    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Campos vacíos",
        text: "Por favor, ingresa tus credenciales.",
        background: "#f7f7f7",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      // Llamada al servidor para autenticar al usuario
      const response = await fetch("http://localhost/corpfresh-php/authenticate.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error(`Error: ${await response.text()}`);

      const data = await response.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Inicio de sesión exitoso",
          background: "#f7f7f7",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Continuar",
        }).then(() => {
          const userData = { name: data.name, email };
          login(userData); // Guarda usuario en contexto y localStorage
          navigate("/Dashboard");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Inicio no válido",
          text: data.message || "Usuario o contraseña incorrectos",
          background: "#f7f7f7",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Volver a intentar",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        background: "#f7f7f7",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  return (
    <div className="container">
      <div className="login-container container">
        <div className="login-header">
          <img src="../imagenes/corp-freshh.jfif" alt="Corp Freshh" />
          <h2> ¡Bienvenido a CorpFreshh!</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={showPassword}
              onChange={togglePasswordVisibility}
            />
            <label className="form-check-label small-text">Mostrar contraseña</label>
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
          </div>
        </form>

        <div className="text-center mt-3 small-text">
          <p>No tienes cuenta? <a href="/register">Regístrate</a></p>
          <p>¿Olvidaste tu contraseña? <a href="/reset-password">Recuperar Contraseña</a></p>
          <p><a href="/">Página Principal</a></p>
        </div>

        <div className="social-login text-center">
          <p className="small-text">O inicia sesión con:</p>
          <div className="row">
            <div className="mb-3">
              <GoogleLogin
                clientId={clientID}
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_policy'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;