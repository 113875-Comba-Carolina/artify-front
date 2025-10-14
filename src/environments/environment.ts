export const environment = {
  production: false,
  apiUrl: 'https://alberta-postsymphysial-buddy.ngrok-free.dev',
  frontendUrl: 'https://treasurable-almeda-unsimply.ngrok-free.dev',
  // Credenciales para autenticación básica con el backend
  // Usuarios de prueba disponibles (todos con password: "password"):
  // - admin@artify.com (ROL: ADMIN)
  // - usuario@test.com (ROL: USUARIO)  
  // - artesano@test.com (ROL: ARTESANO)
  basicAuth: {
    username: 'usuario@test.com', // Usuario de prueba
    password: 'password' // Contraseña para todos los usuarios de prueba
  }
};