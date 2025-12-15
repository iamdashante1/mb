import { NextResponse } from "next/server";
import { getCollections } from "@/lib/collections";

export async function GET() {
  try {
    const { messages, tributes } = await getCollections();
    const [rsvps, tributeList] = await Promise.all([
      messages.find().sort({ createdAt: -1 }).toArray(),
      tributes.find().sort({ createdAt: -1 }).toArray(),
    ]);
    return NextResponse.json({ rsvps, tributes: tributeList });
  } catch (error) {
    console.error("Unable to load data", error);
    return NextResponse.json({ message: "Unable to load data." }, { status: 500 });
  }
}
