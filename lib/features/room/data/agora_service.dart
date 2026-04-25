import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AgoraService {
  RtcEngine? _engine;

  Future<RtcEngine> init({
    required String channel,
    required int uid,
    required void Function(int uid, bool joined) onParticipant,
  }) async {
    final appId = dotenv.env['AGORA_APP_ID'] ?? '';
    _engine = createAgoraRtcEngine();
    await _engine!.initialize(RtcEngineContext(appId: appId));
    await _engine!.setClientRole(role: ClientRoleType.clientRoleBroadcaster);
    await _engine!.enableAudio();
    _engine!.registerEventHandler(
      RtcEngineEventHandler(
        onUserJoined: (connection, remoteUid, elapsed) => onParticipant(remoteUid, true),
        onUserOffline: (connection, remoteUid, reason) => onParticipant(remoteUid, false),
      ),
    );
    await _engine!.joinChannel(
      token: '',
      channelId: channel,
      uid: uid,
      options: const ChannelMediaOptions(),
    );
    return _engine!;
  }

  Future<void> toggleMute(bool mute) async {
    await _engine?.muteLocalAudioStream(mute);
  }

  Future<void> leave() async {
    await _engine?.leaveChannel();
    await _engine?.release();
    _engine = null;
  }
}
