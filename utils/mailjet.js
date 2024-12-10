const mailjet = require('node-mailjet');

const client = mailjet.apiConnect(
    '8009328334404e59668c415aacd3fa7e',
    'd0ddbe6566d2c6ccbb4d3bfdf5af30e8'
);

const sendEmail = async (email, subject, htmlContent) => {
    try{
        const request = await client.post('send', { version: 'v3.1'}).request({
            Messages: [
                {
                    From: {
                        Email: 'jorobanuelosga@ittepic.edu.mx',
                        Name: 'Instituto Tecnologico de Tepic',
                    },
                    To: [
                        {
                            Email: email,
                            Name: email,
                        },
                    ],
                    Subject: subject,
                    HTMLPart: htmlContent,
                },
            ],
        });
        console.log(`Email sent successfully: ${request.body.Messages[0].Status}`);
    }catch(error){
        console.error('Error al enviar el correo:', error.response ? error.response.body : error);
    }
};
//cambios
module.exports = { sendEmail };