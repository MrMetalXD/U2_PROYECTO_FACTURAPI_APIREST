const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Obtener todos los usuarios
router.get('/', userController.getUsers);

// Obtener un usuario por ID
router.get('/:id', userController.getUserById); // Asegúrate de que esta ruta esté configurada correctamente
// Crear un nuevo usuario
router.post('/', userController.createUser);
// Actualizar un usuario
router.put('/:id', userController.updateUser);
// Eliminar un usuario
router.delete('/:id', userController.deleteUser);
//cambios
module.exports = router;
