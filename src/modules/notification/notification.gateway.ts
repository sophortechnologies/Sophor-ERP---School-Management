import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import * as jwt from 'jsonwebtoken'

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1]

      if (!token) {
        client.disconnect()
        return
      }

      const payload: any = jwt.verify(token, process.env.JWT_SECRET)
      const userId = payload.sub || payload.id

      if (!userId) {
        client.disconnect()
        return
      }

      client.join(`user_${userId}`)
    } catch (err) {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    // optional logging
  }

  emitToUser(userId: number, payload: any) {
    this.server.to(`user_${userId}`).emit('notification', payload)
  }
}
