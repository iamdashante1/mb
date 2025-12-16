import { NextResponse } from "next/server";
import { getCollections } from "@/lib/collections";

export async function GET() {
  try {
    const { tributes } = await getCollections();
    const data = await tributes.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unable to load tributes", error);
    return NextResponse.json({ message: "Unable to load tributes." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    const message = (body.message || "").trim();

    if (!name || !message) {
      return NextResponse.json({ message: "Name and message are required." }, { status: 400 });
    }

    const { tributes } = await getCollections();
    const entry = { name, message, createdAt: new Date() };
    const result = await tributes.insertOne(entry);
    return NextResponse.json({ ...entry, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Unable to save tribute", error);
    return NextResponse.json({ message: "Unable to save tribute." }, { status: 500 });
  }
}
