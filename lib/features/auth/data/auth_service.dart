import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:voice_social_mvp/features/auth/domain/app_user.dart';

class AuthService {
  AuthService(this._firebaseAuth);

  final FirebaseAuth _firebaseAuth;
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  User? get currentUser => _firebaseAuth.currentUser;
  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  Future<void> sendOtp({
    required String phoneNumber,
    required void Function(String verificationId) onCodeSent,
  }) async {
    await _firebaseAuth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (credential) async => _firebaseAuth.signInWithCredential(credential),
      verificationFailed: (e) => throw Exception(e.message ?? 'OTP verification failed'),
      codeSent: (verificationId, _) => onCodeSent(verificationId),
      codeAutoRetrievalTimeout: (_) {},
    );
  }

  Future<void> verifyOtp({
    required String verificationId,
    required String smsCode,
  }) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    await _firebaseAuth.signInWithCredential(credential);
  }

  Future<void> signInWithGoogle() async {
    await _googleSignIn.initialize();
    final account = await _googleSignIn.authenticate();
    final auth = account.authentication;
    final credential = GoogleAuthProvider.credential(
      idToken: auth.idToken,
    );
    await _firebaseAuth.signInWithCredential(credential);
  }

  Future<void> updateProfile({
    required String name,
    required String avatarUrl,
  }) async {
    final user = _firebaseAuth.currentUser;
    if (user == null) return;
    await user.updateDisplayName(name);
    await user.updatePhotoURL(avatarUrl);
    await user.reload();
  }

  AppUser? mapCurrentUser() {
    final user = _firebaseAuth.currentUser;
    if (user == null) return null;
    return AppUser(
      id: user.uid,
      name: user.displayName ?? 'Guest',
      avatarUrl: user.photoURL ?? '',
      phoneNumber: user.phoneNumber ?? '',
    );
  }

  Future<void> signOut() async {
    await _firebaseAuth.signOut();
    await _googleSignIn.signOut();
  }
}
