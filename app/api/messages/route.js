import { NextResponse } from "next/server";
import { getCollections } from "@/lib/collections";

export async function GET() {
  try {
    const { messages } = await getCollections();
    const data = await messages.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unable to load messages", error);
    return NextResponse.json({ message: "Unable to load messages." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const relationship = (body.relationship || "").trim();
    const message = (body.message || "").trim();

    if (!name || !email || !relationship) {
      return NextResponse.json({ message: "Name, email, and relationship are required." }, { status: 400 });
    }

    const { messages } = await getCollections();
    const payload = { name, email, relationship, message, createdAt: new Date() };
    await messages.insertOne(payload);
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error("Unable to save message", error);
    return NextResponse.json({ message: "Unable to save message." }, { status: 500 });
  }
}
