const userService = require('../services/userService');

const userController = {
  getUsers: async (req, res) => {
    try {
      const users = await userService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
  },
//cambios
  getUserById: async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el usuario' });
    }
  },

  createUser: async (req, res) => {
    try {
      const { email, password, nombreCompleto, direccion } = req.body;

      // Validación de campos obligatorios
      if (!email || !password || !nombreCompleto || !direccion || !direccion.calle || !direccion.zip) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, incluida la dirección con calle y zip' });
      }

      // Verificación de email único
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }

      // Crear usuario
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el usuario' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await userService.updateUser({ _id: id, ...req.body });

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await userService.deleteUser(id);

      if (!deletedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.status(200).json({ message: 'Usuario eliminado', user: deletedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  }
};

module.exports = userController;
