import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:voice_social_mvp/features/auth/presentation/providers/auth_controller.dart';
import 'package:voice_social_mvp/features/room/data/agora_service.dart';
import 'package:voice_social_mvp/features/room/data/socket_service.dart';

class RoomMessage {
  const RoomMessage({required this.userName, required this.text});
  final String userName;
  final String text;
}

class VoiceRoomScreen extends ConsumerStatefulWidget {
  const VoiceRoomScreen({super.key, required this.roomId, required this.roomTitle});
  final String roomId;
  final String roomTitle;

  @override
  ConsumerState<VoiceRoomScreen> createState() => _VoiceRoomScreenState();
}

class _VoiceRoomScreenState extends ConsumerState<VoiceRoomScreen> {
  final _agora = AgoraService();
  final _socket = SocketService();
  final _chatCtrl = TextEditingController();
  final _messages = <RoomMessage>[];
  final _participants = <String>{};
  bool _isMuted = false;
  bool _isJoining = true;

  @override
  void initState() {
    super.initState();
    _joinRoom();
  }

  Future<void> _joinRoom() async {
    final user = ref.read(authControllerProvider).valueOrNull;
    if (user == null) return;
    try {
      await _agora.init(
        channel: widget.roomId,
        uid: Random().nextInt(100000),
        onParticipant: (uid, joined) {
          setState(() {
            if (joined) {
              _participants.add('user_$uid');
            } else {
              _participants.remove('user_$uid');
            }
          });
        },
      );
      _participants.add(user.name);
      _socket.connect(
        roomId: widget.roomId,
        userId: user.id,
        onMessage: (data) {
          setState(() {
            _messages.add(RoomMessage(userName: data['userName'] as String, text: data['text'] as String));
          });
        },
        onParticipants: (data) {
          setState(() {
            _participants
              ..clear()
              ..addAll(data.cast<String>());
          });
        },
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Unable to join room: $e')));
    } finally {
      if (mounted) setState(() => _isJoining = false);
    }
  }

  @override
  void dispose() {
    final user = ref.read(authControllerProvider).valueOrNull;
    _chatCtrl.dispose();
    _socket.disconnect(widget.roomId, user?.id ?? '');
    _agora.leave();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).valueOrNull;
    return Scaffold(
      appBar: AppBar(title: Text(widget.roomTitle)),
      body: _isJoining
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Expanded(
                        child: _ParticipantsList(participants: _participants.toList()),
                      ),
                      Expanded(
                        child: _ChatPanel(
                          messages: _messages,
                          controller: _chatCtrl,
                          onSend: () {
                            final text = _chatCtrl.text.trim();
                            if (text.isEmpty) return;
                            _socket.sendMessage(widget.roomId, user?.name ?? 'Guest', text);
                            _chatCtrl.clear();
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: FilledButton.icon(
                    onPressed: () async {
                      _isMuted = !_isMuted;
                      await _agora.toggleMute(_isMuted);
                      setState(() {});
                    },
                    icon: Icon(_isMuted ? Icons.mic_off : Icons.mic),
                    label: Text(_isMuted ? 'Unmute' : 'Mute'),
                  ),
                ),
              ],
            ),
    );
  }
}

class _ParticipantsList extends StatelessWidget {
  const _ParticipantsList({required this.participants});
  final List<String> participants;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(12),
      child: participants.isEmpty
          ? const Center(child: Text('No participants yet'))
          : ListView.builder(
              itemCount: participants.length,
              itemBuilder: (_, index) => ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                title: Text(participants[index]),
              ),
            ),
    );
  }
}

class _ChatPanel extends StatelessWidget {
  const _ChatPanel({
    required this.messages,
    required this.controller,
    required this.onSend,
  });
  final List<RoomMessage> messages;
  final TextEditingController controller;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(12),
      child: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: messages.length,
              itemBuilder: (_, i) {
                final msg = messages[i];
                return ListTile(title: Text(msg.userName), subtitle: Text(msg.text));
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(child: TextField(controller: controller, decoration: const InputDecoration(hintText: 'Type a message'))),
                IconButton(onPressed: onSend, icon: const Icon(Icons.send)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
