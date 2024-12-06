// src/services/userService.js
const User = require('../models/userModel');
const { createCustomer , updateCustomer, deleteCustomer} = require('../apis/facturapi');

const userService = {
  createUser: async (args) => {
    const user = new User(args);
    const facturapiCustomer = await createCustomer(user);
    user.facturapiid = facturapiCustomer.id;
    return await user.save();
  },
  updateUser: async ({ _id, ...rest }) => {
    const userToUpdate = await User.findById(_id);
    if (!userToUpdate) throw new Error('Usuario no encontrado');

    await updateCustomer(userToUpdate.facturapiid, rest);
    Object.assign(userToUpdate, rest);
    return await userToUpdate.save();
  },
  deleteUser: async (_id) => {
    const userToDelete = await User.findById(_id);
    if (!userToDelete) throw new Error('Usuario no encontrado');

    await deleteCustomer(userToDelete.facturapiid);
    return await User.findByIdAndDelete(_id);
  },
  getUsers: async () => await User.find(),
};

module.exports = userService;