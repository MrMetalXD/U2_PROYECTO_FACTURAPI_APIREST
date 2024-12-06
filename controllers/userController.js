const userService = require('../services/userService');

const userController = {

    getUsers: async (req, res) => {
        try {
          const users = await userService.getUsers();
          res.status(200).json(users);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
    
      // Crear un usuario
      createUser: async (req, res) => {
        try {
          const user = await userService.createUser(req.body);
          res.status(201).json(user);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      },
    
      // Actualizar un usuario
      updateUser: async (req, res) => {
        try {
          const { id } = req.params;
          const updatedUser = await userService.updateUser({ _id: id, ...req.body });
          res.status(200).json(updatedUser);
        } catch (error) {
          res.status(404).json({ error: error.message });
        }
      },
    
      // Eliminar un usuario
      deleteUser: async (req, res) => {
        try {
          const { id } = req.params;
          const deletedUser = await userService.deleteUser(id);
          res.status(200).json({ message: 'Usuario eliminado', user: deletedUser });
        } catch (error) {
          res.status(404).json({ error: error.message });
        }
      },
     
};

module.exports = userController;