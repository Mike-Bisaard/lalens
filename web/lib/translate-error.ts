// แปล error message จาก Supabase Auth / DB เป็นภาษาไทย
// ใช้ toLowerCase + includes เพื่อรองรับ message ที่ Supabase อาจส่งมาต่างกันเล็กน้อย

const AUTH_MAP: [string, string][] = [
  ['invalid login credentials',              'อีเมลหรือรหัสผ่านไม่ถูกต้อง'],
  ['invalid credentials',                    'อีเมลหรือรหัสผ่านไม่ถูกต้อง'],
  ['email not confirmed',                    'อีเมลยังไม่ได้รับการยืนยัน กรุณาตรวจสอบ inbox'],
  ['user already registered',                'อีเมลนี้มีบัญชีอยู่แล้ว'],
  ['email already in use',                   'อีเมลนี้มีบัญชีอยู่แล้ว'],
  ['already been registered',                'อีเมลนี้มีบัญชีอยู่แล้ว'],
  ['password should be at least',            'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
  ['weak password',                          'รหัสผ่านไม่ปลอดภัยพอ กรุณาใช้ตัวอักษรผสมตัวเลข'],
  ['unable to validate email address',       'รูปแบบอีเมลไม่ถูกต้อง'],
  ['invalid email',                          'รูปแบบอีเมลไม่ถูกต้อง'],
  ['email rate limit exceeded',              'ส่งอีเมลบ่อยเกินไป กรุณารอสักครู่'],
  ['email link is invalid or has expired',   'ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอใหม่'],
  ['token has expired',                      'ลิงก์หมดอายุแล้ว กรุณาขอใหม่'],
  ['signup is disabled',                     'ระบบปิดการสมัครชั่วคราว'],
  ['signups not allowed',                    'ระบบปิดการสมัครชั่วคราว'],
  ['for security purposes',                  'กรุณารอสักครู่ก่อนลองใหม่'],
  ['too many requests',                      'คำขอบ่อยเกินไป กรุณารอสักครู่'],
  ['rate limit',                             'คำขอบ่อยเกินไป กรุณารอสักครู่'],
  ['user not found',                         'ไม่พบบัญชีนี้'],
  ['only an administrator',                  'ไม่มีสิทธิ์ดำเนินการ'],
  ['network error',                          'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต'],
  ['fetch failed',                           'ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่'],
]

export function translateAuthError(message: string): string {
  const lower = message.toLowerCase()
  for (const [key, thai] of AUTH_MAP) {
    if (lower.includes(key)) return thai
  }
  return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}

export function translateDbError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('duplicate') || lower.includes('unique')) return 'ข้อมูลนี้มีอยู่ในระบบแล้ว'
  if (lower.includes('network') || lower.includes('fetch'))    return 'ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่'
  return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}
