import { auth } from '@/lib/auth/auth';
import { createFolder, getFoldersByUser } from '@/services/folder.service';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const folders = await getFoldersByUser(session.user.id);
    return NextResponse.json({ success: true, data: folders });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const { name } = await req.json();
    const folder = await createFolder(session.user.id, name);
    return NextResponse.json({ success: true, data: folder }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
