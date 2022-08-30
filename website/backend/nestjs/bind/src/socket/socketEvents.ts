import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
}
)
export class SocketEvents {

  @WebSocketServer()
  server: Server;

  // Connexion
  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`, )
  }
  
  // Deconnexion
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected : ${client.id}`, )
  }
  
  // recevoir un event (s'aboner a un message)
  @SubscribeMessage('message')
  handleEvent(@MessageBody() data:string, @ConnectedSocket() client: Socket) {
    console.log(`Client message : ${data}`, )
    // envoyer un event
    this.server.emit('message', client.id, data);
  }

  
}