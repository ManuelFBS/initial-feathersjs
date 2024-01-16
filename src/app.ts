import { feathers } from '@feathersjs/feathers';
import { koa, rest, bodyParser, errorHandler, serveStatic } from '@feathersjs/koa';
import socketio from '@feathersjs/socketio';

// Esta es la interfaz para los datos del mensaje...
interface Message {
  id?: number;
  text: string;
}

// Un servicio de mensajes que nos permite crear nuevos
// mensajes y devolver todos los mensajes existentes...
class MessageService {
  messages: Message[] = [];

  async find() {
    // Solo retorna nuestros mensajes...
    return this.messages;
  }

  async create(data: Pick<Message, 'text'>) {
    // El nuevo mensaje es el texto de datos con un idntificador
    // único agregado usando la longitud del mensaje ya que
    // cambia cada vez que agregamos uno...
    const message: Message = {
      id: this.messages.length,
      text: data.text
    };

    // Se agrega un mensaje nuevo a la lista...
    this.messages.push(message);

    return message;
  }
}

// Esto le dice a TypeScript qué servicios estamos registrando...
type ServiceTypes = {
  messages: MessageService;
};

// Se crea un KoaJS compatible con la aplicación Feathers...
const app = koa<ServiceTypes>(feathers());

// Usa la carpeta actual para el alojamiento de archivos estáticos
app.use(serveStatic('.'));

// Registra el identificador de error
app.use(errorHandler());

// Analizar los cuerpos de solicitud JSON
app.use(bodyParser());

// Registrar el controlador del servicio REST...
app.configure(rest());

// Configura en tiempo real, el Socket.io de la API...
app.configure(socketio());

// const app = feathers<ServiceTypes>();

// Registra el servicio de mensajes en la aplicación Feathers...
app.use('messages', new MessageService());

// Agrega cualquier conección en tiempo real al canal "todos"...
app.on('connection', (connection) => app.channel('everybody').join(connection));

// Se publican todos los eventos al canal "todos"...
app.publish((_data) => app.channel('everybody'));

// Inicia el servidor...
app.listen(3030).then(() => console.log('Feathers server listening on localhost:3030'));

// Por si acaso, se crea un mensaje...
// Para que la API no parezca tan vacía...
app.service('messages').create({
  text: 'Hello world from the server...!!!'
});
