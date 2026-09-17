import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    hasServiceRole: !!serviceRole,
    serviceRolePrefix: serviceRole ? serviceRole.substring(0, 15) : "MISSING",
    serviceRoleLength: serviceRole ? serviceRole.length : 0,
    isMatchingAnon: serviceRole === anonKey,
    anonKeyPrefix: anonKey ? anonKey.substring(0, 15) : "MISSING"
  });
}
