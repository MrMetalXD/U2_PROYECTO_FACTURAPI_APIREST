const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dsrqzb3nv', 
  api_key: '152769284338851',       
  api_secret: 'LYpYV9j8UUalQrTMEGKl7JVAAA0', 
});
//cambios
async function subirArchivoCloudinary(rutaArchivo) {
  try {
    console.log(`Subiendo archivo ${rutaArchivo} a Cloudinary...`);
    const result = await cloudinary.uploader.upload(rutaArchivo, {
      folder: 'facturas', 
      resource_type: 'raw', 
    });

    console.log(`Archivo subido exitosamente: ${result.secure_url}`);
    return result.secure_url; 
  } catch (error) {
    console.error('Error subiendo archivo a Cloudinary:', error.message || error);
    throw new Error('No se pudo subir el archivo a Cloudinary.');
  }
}

module.exports = { subirArchivoCloudinary };
