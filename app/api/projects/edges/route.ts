import { NextResponse } from 'next/server';
import { createEdge } from '@/lib/project/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !body.projectId || !body.sourceId || !body.targetId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const edge = await createEdge(body);
    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create edge' }, { status: 500 });
  }
}
