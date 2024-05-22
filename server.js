// Modulos
const express = require('express');
const jwt = require('jsonwebtoken');
const agents = require('./data/agentes.js'); // Ruta al archivo de agentes

// Configuración de Express
const app = express();
const port = process.env.PORT || 3000; // Puerto para el servidor

// Ruta para el login de agentes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Buscar al agente por correo electrónico y contraseña
  const foundAgent = agents.find(a => a.email === email && a.password === password);

  if (!foundAgent) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  // Genera y envía token JWT
  const token = jwt.sign({ email: foundAgent.email }, 'secretKey', { expiresIn: '2m' });
  res.json({ message: 'Autenticación exitosa', token });
});

// Ruta protegida para la sección restringida
app.get('/restricted-route', async (req, res) => {
  // Verificar si el usuario está autenticado (token JWT válido)
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    // Decodifica el token JWT y verifica su validez
    const decoded = jwt.verify(token, 'secretKey');
    if (decoded.email) {
      // El usuario está autenticado, permite el acceso
      res.send('¡Bienvenido a la sección restringida!');
    } else {
      // El token es inválido
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    // Error al decodificar o verificar el token
    console.error(error);
    return res.status(401).json({ message: 'Token inválido' });
  }
});

// Arrancar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
