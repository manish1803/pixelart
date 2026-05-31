import { auth } from '@/lib/auth/auth';
import { CreateProjectSchema } from '@/lib/validations/project';
import { createProject, getProjectsByUser } from '@/services/project.service';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json(
    { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
    { status: 401 }
  );
}

// GET /api/projects — list all projects for the authenticated user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const trash = searchParams.get('trash') === 'true';
    
    const projects = await getProjectsByUser(session.user.id, trash);
    return NextResponse.json({ success: true, data: projects });
  } catch (err) {
    console.error('[GET /api/projects]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const body = await req.json();
    const validated = CreateProjectSchema.parse(body);
    const project = await createProject(session.user.id, validated);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: err.issues } },
        { status: 400 }
      );
    }
    console.error('[POST /api/projects]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
