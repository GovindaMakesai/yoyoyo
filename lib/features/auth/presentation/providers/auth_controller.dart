import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'package:voice_social_mvp/features/auth/data/auth_service.dart';
import 'package:voice_social_mvp/features/auth/domain/app_user.dart';

final authServiceProvider = Provider<AuthService>(
  (ref) => AuthService(FirebaseAuth.instance),
);

class AuthController extends StateNotifier<AsyncValue<AppUser?>> {
  AuthController(this._authService) : super(const AsyncValue.loading()) {
    _sub = _authService.authStateChanges.listen((_) => _refreshUser());
    _refreshUser();
  }

  final AuthService _authService;
  late final StreamSubscription<User?> _sub;

  Future<void> _refreshUser() async {
    state = AsyncValue.data(_authService.mapCurrentUser());
  }

  Future<String> sendOtp(String phone) async {
    state = const AsyncValue.loading();
    late final String verificationId;
    await _authService.sendOtp(
      phoneNumber: phone,
      onCodeSent: (id) => verificationId = id,
    );
    state = AsyncValue.data(_authService.mapCurrentUser());
    return verificationId;
  }

  Future<void> verifyOtp(String verificationId, String otp) async {
    state = const AsyncValue.loading();
    await _authService.verifyOtp(verificationId: verificationId, smsCode: otp);
    await _refreshUser();
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncValue.loading();
    await _authService.signInWithGoogle();
    await _refreshUser();
  }

  Future<void> saveProfile(String name, String avatarUrl) async {
    state = const AsyncValue.loading();
    await _authService.updateProfile(name: name, avatarUrl: avatarUrl);
    await _refreshUser();
  }

  Future<void> signOut() => _authService.signOut();

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AsyncValue<AppUser?>>(
  (ref) => AuthController(ref.read(authServiceProvider)),
);
