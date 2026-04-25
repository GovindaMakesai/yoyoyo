import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class SocketService {
  io.Socket? _socket;

  io.Socket connect({
    required String roomId,
    required String userId,
    required void Function(Map<String, dynamic>) onMessage,
    required void Function(List<dynamic>) onParticipants,
  }) {
    _socket = io.io(
      dotenv.env['SOCKET_BASE_URL'] ?? 'http://10.0.2.2:3000',
      io.OptionBuilder().setTransports(['websocket']).disableAutoConnect().build(),
    );
    _socket!.connect();
    _socket!.emit('join-room', {'roomId': roomId, 'userId': userId});
    _socket!.on('message', (data) => onMessage(Map<String, dynamic>.from(data as Map)));
    _socket!.on('participants', (data) => onParticipants(List<dynamic>.from(data as List)));
    return _socket!;
  }

  void sendMessage(String roomId, String userName, String text) {
    _socket?.emit('send-message', {'roomId': roomId, 'userName': userName, 'text': text});
  }

  void disconnect(String roomId, String userId) {
    _socket?.emit('leave-room', {'roomId': roomId, 'userId': userId});
    _socket?.dispose();
  }
}
