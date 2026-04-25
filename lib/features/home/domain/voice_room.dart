class VoiceRoom {
  const VoiceRoom({
    required this.id,
    required this.title,
    required this.hostName,
  });

  final String id;
  final String title;
  final String hostName;

  factory VoiceRoom.fromJson(Map<String, dynamic> json) {
    return VoiceRoom(
      id: json['id'] as String,
      title: json['title'] as String,
      hostName: json['hostName'] as String,
    );
  }
}
