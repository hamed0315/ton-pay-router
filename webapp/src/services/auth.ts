
// این سرویس فعلاً با Mock کار می‌کند. بعد از اتصال به بک‌اند، این‌ها را با fetch جایگزین کنید.

const API_BASE = '/api/auth/qr';

export async function initQR() {
  // Mock: شبیه‌سازی دریافت توکن از بک‌اند
  return { qr_token: 'mock_token_123', expires_in: 120 };
}

export async function getQRStatus(token: string) {
  // Mock: شبیه‌سازی این‌که کاربر بعد از ۳ ثانیه اسکن کرده است!
  await new Promise(resolve => setTimeout(resolve, 3000));
  return { status: 'confirmed', jwt: 'mock_jwt_token' };
}
