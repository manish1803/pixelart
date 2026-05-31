import { auth } from '@/lib/auth/auth';
import { deleteFolder, updateFolder } from '@/services/folder.service';
import { NextRequest, NextResponse } from 'next/server';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;

  try {
    const { name } = await req.json();
    const updated = await updateFolder(session.user.id, id, name);
    if (!updated) return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;

  try {
    const deleted = await deleteFolder(session.user.id, id);
    if (!deleted) return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ success: true, data: null });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
