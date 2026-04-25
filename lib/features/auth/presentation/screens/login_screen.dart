import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:voice_social_mvp/features/auth/presentation/providers/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _avatarCtrl = TextEditingController();
  String? _verificationId;
  bool _isBusy = false;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _otpCtrl.dispose();
    _nameCtrl.dispose();
    _avatarCtrl.dispose();
    super.dispose();
  }

  Future<void> _run(Future<void> Function() action) async {
    setState(() => _isBusy = true);
    try {
      await action();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.read(authControllerProvider.notifier);
    return Scaffold(
      appBar: AppBar(title: const Text('Welcome')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone (+countrycode)'),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _otpCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'OTP code'),
                  ),
                ),
                const SizedBox(width: 10),
                FilledButton(
                  onPressed: _isBusy
                      ? null
                      : () => _run(() async {
                            _verificationId = await auth.sendOtp(_phoneCtrl.text.trim());
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('OTP sent')),
                            );
                          }),
                  child: _isBusy ? const SizedBox.square(dimension: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Send OTP'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: (_isBusy || _verificationId == null)
                  ? null
                  : () => _run(() async {
                        await auth.verifyOtp(_verificationId!, _otpCtrl.text.trim());
                      }),
              child: const Text('Verify OTP'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _isBusy ? null : () => _run(auth.signInWithGoogle),
              icon: const Icon(Icons.login),
              label: const Text('Continue with Google'),
            ),
            const Divider(height: 28),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Display name'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _avatarCtrl,
              decoration: const InputDecoration(labelText: 'Avatar URL'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _isBusy
                  ? null
                  : () => _run(() => auth.saveProfile(_nameCtrl.text.trim(), _avatarCtrl.text.trim())),
              child: const Text('Save Profile'),
            ),
          ],
        ),
      ),
    );
  }
}
