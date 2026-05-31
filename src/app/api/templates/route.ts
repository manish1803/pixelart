import { auth } from '@/lib/auth/auth';
import { defaultTemplates } from '@/lib/data/defaultTemplates';
import { connectToDatabase } from '@/lib/mongodb';
import { Template } from '@/models/Template';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json(
    { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
    { status: 401 }
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    await connectToDatabase();
    
    // Fetch user created templates
    const userTemplates = await Template.find({ userId: session.user.id }).sort({ createdAt: -1 });
    
    // Convert to plan objects and flatten maps
    const serializedUserTemplates = userTemplates.map(doc => {
      const obj = doc.toObject({ flattenMaps: true });
      return {
        ...obj,
        id: (obj._id as { toString(): string }).toString(),
        _id: undefined,
        __v: undefined,
      };
    });

    // Merge with default hardcoded templates
    // Mark them as isSystem: true
    const systemTemplates = defaultTemplates.map(t => ({ ...t, isSystem: true }));
    
    const allTemplates = [...serializedUserTemplates, ...systemTemplates];

    return NextResponse.json({ success: true, data: allTemplates });
  } catch (err) {
    console.error('[GET /api/templates]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const body = await req.json();
    
    await connectToDatabase();
    
    const doc = await Template.create({
      userId: session.user.id,
      name: body.name || 'Untitled Template',
      description: body.description || '',
      gridSize: body.gridSize,
      palette: body.palette || [],
      pixels: body.pixels || {},
      isSystem: false,
    });

    const obj = doc.toObject({ flattenMaps: true });
    const serialized = {
      ...obj,
      id: (obj._id as { toString(): string }).toString(),
      _id: undefined,
      __v: undefined,
    };

    return NextResponse.json({ success: true, data: serialized }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/templates]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
