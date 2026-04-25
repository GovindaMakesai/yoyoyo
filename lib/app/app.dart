import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:voice_social_mvp/core/theme/app_theme.dart';
import 'package:voice_social_mvp/features/auth/presentation/providers/auth_controller.dart';
import 'package:voice_social_mvp/features/auth/presentation/screens/auth_gate.dart';

class VoiceSocialApp extends ConsumerWidget {
  const VoiceSocialApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(authControllerProvider);
    return MaterialApp(
      title: 'Voice Social MVP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const AuthGate(),
    );
  }
}
