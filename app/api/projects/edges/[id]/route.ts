import { NextResponse } from 'next/server';
import { updateEdge, deleteEdge } from '@/lib/project/server';

type Params = Promise<{ id: string }>;

export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const edge = await updateEdge(id, body);
    if (!edge) {
      return NextResponse.json({ error: 'Edge not found' }, { status: 404 });
    }
    return NextResponse.json(edge);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update edge' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const success = await deleteEdge(id);
    if (!success) {
      return NextResponse.json({ error: 'Edge not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete edge' }, { status: 500 });
  }
}
