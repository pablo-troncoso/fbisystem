// Modulos
const express = require('express');
const jwt = require('jsonwebtoken');
const agents = require('./data/agentes.js').results; // Ruta al archivo de agentes
const bodyParser = require('body-parser');
const path = require('path');

// Express
const app = express();
const port = process.env.PORT || 3000; // Puerto para el servidor

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para Login Agentes
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Buscar al agente, Correo Electrónico y Contraseña
  const foundAgent = agents.find(a => a.email === email && a.password === password);

  if (!foundAgent) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  // Generar, Enviar Token JWT
  const token = jwt.sign({ email: foundAgent.email }, 'secretKey', { expiresIn: '2m' });

  // Devolver JSON con Token
  res.json({ token });
});

// Ruta Protegida Sección restringida
app.get('/restricted-route', (req, res) => {
  // Verificar si el usuario está autenticado (token JWT válido)
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token sin el "Bearer"
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    // Decodifica el token JWT y verifica su validez
    const decoded = jwt.verify(token, 'secretKey');
    if (decoded.email) {
      // El usuario está autenticado, permite el acceso
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>FBI System</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
          </head>
          <body>
            <div class="container text-center mt-5">
              <h1>¡Bienvenido a la sección restringida, ${decoded.email}!</h1>
            </div>
          </body>
        </html>
      `);
    } else {
      // Token es Inválido
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    // Error Verificar Token
    console.error(error);
    return res.status(401).json({ message: 'Token inválido' });
  }
});

// Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
