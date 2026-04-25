import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:voice_social_mvp/features/home/domain/voice_room.dart';

class RoomRepository {
  RoomRepository()
      : _dio = Dio(
          BaseOptions(
            baseUrl: dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:3000',
            connectTimeout: const Duration(seconds: 10),
          ),
        );

  final Dio _dio;

  Future<List<VoiceRoom>> fetchRooms() async {
    final response = await _dio.get('/rooms');
    final rooms = (response.data as List<dynamic>)
        .cast<Map<String, dynamic>>()
        .map(VoiceRoom.fromJson)
        .toList();
    return rooms;
  }

  Future<VoiceRoom> createRoom(String title, String hostName) async {
    final response = await _dio.post('/rooms', data: {'title': title, 'hostName': hostName});
    return VoiceRoom.fromJson(response.data as Map<String, dynamic>);
  }
}

final roomRepositoryProvider = Provider<RoomRepository>((ref) => RoomRepository());
