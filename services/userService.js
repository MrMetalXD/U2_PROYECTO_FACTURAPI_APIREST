const User = require('../models/userModel');
const { createCustomer, updateCustomer, deleteCustomer } = require('../apis/facturapi');

const userService = {
  getUsers: async () => {
    try {
      return await User.find();
    } catch (error) {
      throw new Error('Error al obtener los usuarios: ' + error.message);
    }
  },

  getUserById: async (_id) => {
    try {
      const user = await User.findById(_id);
      if (!user) throw new Error('Usuario no encontrado');
      return user;
    } catch (error) {
      throw new Error('Error al obtener el usuario: ' + error.message);
    }
  },

  getUserByEmail: async (email) => {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw new Error('Error al obtener el usuario por email: ' + error.message);
    }
  },

  createUser: async ({ direccion, ...args }) => {
    try {
      if (!direccion || !direccion.zip || !direccion.calle) {
        throw new Error('La dirección con los campos zip y street son obligatorios.');
      }

      const facturapiCustomer = await createCustomer({
        ...args,
        direccion, 
      });

      const user = new User({
        ...args,
        direccion,
        facturapiid: facturapiCustomer.id,
      });

      return await user.save();
    } catch (error) {
      throw new Error('Error al crear el usuario: ' + error.message);
    }
  },

  updateUser: async ({ _id, direccion, ...rest }) => {
    try {
      const userToUpdate = await User.findById(_id);
      if (!userToUpdate) throw new Error('Usuario no encontrado');

      if (direccion || rest.email) {
        await updateCustomer(userToUpdate.facturapiid, {
          legal_name: rest.nombreCompleto || userToUpdate.nombreCompleto,
          email: rest.email || userToUpdate.email,
          address: direccion
            ? {
                street: direccion.street || userToUpdate.direccion.street,
                zip: direccion.zip || userToUpdate.direccion.zip,
                municipality: direccion.municipio || userToUpdate.direccion.municipio,
                state: direccion.estado || userToUpdate.direccion.estado,
              }
            : undefined,
          phone: rest.telefono || userToUpdate.telefono,
        });
      }

      Object.assign(userToUpdate, rest);
      if (direccion) userToUpdate.direccion = direccion;

      return await userToUpdate.save();
    } catch (error) {
      throw new Error('Error al actualizar el usuario: ' + error.message);
    }
  },

  deleteUser: async (_id) => {
    try {
      const userToDelete = await User.findById(_id);
      if (!userToDelete) throw new Error('Usuario no encontrado');

      await deleteCustomer(userToDelete.facturapiid);

      return await User.findByIdAndDelete(_id);
    } catch (error) {
      throw new Error('Error al eliminar el usuario: ' + error.message);
    }
  }
};
//cambios
module.exports = userService;
