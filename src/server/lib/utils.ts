import 'dotenv/config'

export function getClientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
export function hashIp(ip: string): string {
  return Bun.hash(ip + process.env.JWT_SECRET).toString(16)
}
