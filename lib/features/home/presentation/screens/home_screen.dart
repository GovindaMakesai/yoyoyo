import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:voice_social_mvp/features/auth/presentation/providers/auth_controller.dart';
import 'package:voice_social_mvp/features/home/data/room_repository.dart';
import 'package:voice_social_mvp/features/room/presentation/voice_room_screen.dart';

final roomsProvider = FutureProvider.autoDispose((ref) async {
  return ref.read(roomRepositoryProvider).fetchRooms();
});

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roomsAsync = ref.watch(roomsProvider);
    final authData = ref.watch(authControllerProvider).valueOrNull;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Voice Rooms'),
        actions: [
          IconButton(
            onPressed: () => ref.read(authControllerProvider.notifier).signOut(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: roomsAsync.when(
        data: (rooms) => ListView.separated(
          itemCount: rooms.length,
          separatorBuilder: (context, _) => const Divider(height: 1),
          itemBuilder: (_, index) {
            final room = rooms[index];
            return ListTile(
              title: Text(room.title),
              subtitle: Text('Host: ${room.hostName}'),
              trailing: const Icon(Icons.keyboard_arrow_right),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => VoiceRoomScreen(roomId: room.id, roomTitle: room.title),
                ),
              ),
            );
          },
        ),
        error: (e, _) => Center(child: Text('Failed to load rooms: $e')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final title = await _askRoomTitle(context);
          if (title == null || !context.mounted) return;
          try {
            final room = await ref.read(roomRepositoryProvider).createRoom(
                  title,
                  authData?.name ?? 'Host',
                );
            ref.invalidate(roomsProvider);
            if (!context.mounted) return;
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => VoiceRoomScreen(roomId: room.id, roomTitle: room.title),
              ),
            );
          } catch (e) {
            if (!context.mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Create room failed: $e')));
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Create Room'),
      ),
    );
  }

  Future<String?> _askRoomTitle(BuildContext context) async {
    final ctrl = TextEditingController();
    final result = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Create Room'),
        content: TextField(controller: ctrl, decoration: const InputDecoration(hintText: 'Room title')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, ctrl.text.trim()), child: const Text('Create')),
        ],
      ),
    );
    ctrl.dispose();
    return result;
  }
}
