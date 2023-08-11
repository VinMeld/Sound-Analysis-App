import { IClientOptions, MqttClient, MqttProtocol, connect } from 'mqtt'; // assuming you're using the 'mqtt' npm package
import fs from 'fs';
const options: IClientOptions = {
    key: fs.readFileSync('./secrets/private-key.key'),
    cert: fs.readFileSync('./secrets/device-certificate.certificate.pem.crt'),
    ca: fs.readFileSync('./secrets/Root CA1 certificate.pem'),
    clientId: 'FrontEnd',
    host: 'a3ocln6ms6dr86-ats.iot.us-east-2.amazonaws.com',
    protocol: 'mqtts' as MqttProtocol,
    port: 8883
};
const client = connect(options);
export default client;
