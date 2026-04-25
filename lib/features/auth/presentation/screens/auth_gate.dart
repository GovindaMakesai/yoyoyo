import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:voice_social_mvp/features/auth/presentation/providers/auth_controller.dart';
import 'package:voice_social_mvp/features/auth/presentation/screens/login_screen.dart';
import 'package:voice_social_mvp/features/home/presentation/screens/home_screen.dart';

class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    return authState.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Auth error: $e'))),
      data: (user) => user == null ? const LoginScreen() : const HomeScreen(),
    );
  }
}
