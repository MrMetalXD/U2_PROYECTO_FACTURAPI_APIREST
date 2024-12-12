#Sistema Integral de Carrito de Compras 
Equipo: Insanitos V2
    -Jose Rodolfo Bañuelos Garcia
    -Luis Angel Ortega Miramontes
    -Jorge Eduardo Gonzalez Cortes
    -Alan Cuevas Alaniz

Introducción
    Este proyecto implementa un sistema integral de carrito de compras que permite gestionar productos,
    clientes y facturas. Incluye APIs REST y GraphQL para proporcionar versatilidad, y se conecta a 
    servicios externos como FacturAPI para facturación, Stripe para pagos electrónicos, Cloudinary 
    para almacenamiento, y MailJet para envío de correos electrónicos.

Requisitos Previos
    -Node.js v16 o superior.
    -MongoDB Atlas o local.
    -Cuenta de FacturAPI, Stripe, Cloudinary y MailJet.

Instalación
-Clona el repositorio:
    git clone <URL_DEL_REPOSITORIO>

-Instala las dependencias:
    cd <CARPETA_DEL_PROYECTO>
    npm install

-Crea un archivo .env en la raíz del proyecto con las siguientes variables:
    PORT=3000
    MONGO_URI=<CONEXION_MONGO>
    FACTURAPI_KEY=<TU_LLAVE_FACTURAPI>
    STRIPE_SECRET_KEY=<TU_LLAVE_STRIPE>
    CLOUDINARY_URL=<TU_URL_CLOUDINARY>
    MAILJET_API_KEY=<TU_LLAVE_MAILJET>
    MAILJET_API_SECRET=<TU_SECRETO_MAILJET>

-Inicia el servidor:
    node src/index.js

-Estructura del Proyecto
    src/: Contiene el código fuente del sistema.
    apis/: Integraciones externas (FacturAPI, Stripe, Cloudinary, MailJet).
    models/: Modelos de datos para MongoDB.
    resolvers/: Lógica de resolución de GraphQL.
    schemas/: Definiciones de GraphQL.
    services/: Lógica de negocio.
    utils/: Funciones auxiliares.
    routes/: Rutas de la API REST.

-Uso del Proyecto
    -Accede a la API REST en http://localhost:4000/api.
        Rutas disponibles:
            GET /api/users: Obtiene todos los usuarios.
            POST /api/users: Crea un nuevo usuario.
            PUT /api/users/:id: Actualiza un usuario existente.
            DELETE /api/users/:id: Elimina un usuario.

    -Accede al Playground de GraphQL en http://localhost:4000/graphql.

    -Página HTML de Interfaz
        El proyecto incluye una página HTML que integra el Playground de GraphQL, la documentación de la API REST y el Servidor en una interfaz web interactiva.

        Pagina Web: https://srwicho13.github.io/Documentacion_Proyecto/
