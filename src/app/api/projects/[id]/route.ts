import { auth } from '@/lib/auth/auth';
import { ToggleFieldSchema, UpdateProjectSchema } from '@/lib/validations/project';
import {
    deleteProject,
    getProjectById,
    toggleProjectField,
    updateProject,
} from '@/services/project.service';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json(
    { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
    { status: 401 }
  );
}

function notFound() {
  return NextResponse.json(
    { success: false, error: { message: 'Project not found', code: 'NOT_FOUND' } },
    { status: 404 }
  );
}

type Params = { params: Promise<{ id: string }> };

// GET /api/projects/[id] — fetch a single project
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;

  try {
    const project = await getProjectById(session.user.id, id);
    if (!project) return notFound();
    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error('[GET /api/projects/[id]]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] — full update (save canvas state)
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;

  try {
    const body = await req.json();
    const validated = UpdateProjectSchema.parse(body);
    const updated = await updateProject(session.user.id, id, validated);
    if (!updated) return notFound();
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: err.issues } },
        { status: 400 }
      );
    }
    console.error('[PUT /api/projects/[id]]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] — remove a project
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;

  try {
    const deleted = await deleteProject(session.user.id, id);
    if (!deleted) return notFound();
    return NextResponse.json({ success: true, data: null });
  } catch (err) {
    console.error('[DELETE /api/projects/[id]]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] — toggle isFavourite or isDraft
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;

  try {
    const body = await req.json();
    const { field } = ToggleFieldSchema.parse(body);
    const updated = await toggleProjectField(session.user.id, id, field);
    if (!updated) return notFound();
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: err.issues } },
        { status: 400 }
      );
    }
    console.error('[PATCH /api/projects/[id]]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
