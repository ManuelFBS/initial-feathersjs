import { feathers } from '@feathersjs/feathers';

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
    // Solo retrorna nuestros mensajes...
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

const app = feathers<ServiceTypes>();

// Registra el servicio de mensajes en la aplicación Feathers...
app.use('messages', new MessageService());

// Registra cada vez que se crea un nuevo mensaje...
app.service('messages').on('created', (message: Message) => {
  console.log('A new message has been created', message);
});

// Una función que crea mensajes y luego registra
// todos los mensajes existentes en el servicio...
const main = async () => {
  // Se crea un nueevo mensaje en nuestro servicio de mensajes...
  await app.service('messages').create({
    text: 'Hello Feathers...!'
  });

  // Y otro nuevo...
  await app.service('messages').create({
    text: 'Hello again...!'
  });

  // Encuentra todos los mensajes existentes...
  const messages = await app.service('messages').find();

  console.log('All messages', messages);
};

main();
