import { NextResponse } from 'next/server';
import { getComponentById, updateComponent, deleteComponent } from '@/lib/inventory/supabase/server';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const component = await getComponentById(id);
    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    return NextResponse.json(component);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const component = await updateComponent(id, body);
    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    return NextResponse.json(component);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const success = await deleteComponent(id);
    if (!success) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
