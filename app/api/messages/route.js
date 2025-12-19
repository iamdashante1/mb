import { NextResponse } from "next/server";
import { getCollections } from "@/lib/collections";
import { sendNotification } from "@/lib/notify";

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

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB per file
const ALLOWED_TYPES = ["image/", "video/"];

async function serializeFiles(files) {
  if (!files?.length) return [];

  const saved = [];
  for (const file of files) {
    const type = file.type || "";
    const isAllowed = ALLOWED_TYPES.some((prefix) => type.startsWith(prefix));
    if (!isAllowed) continue;

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) continue;

    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${type};base64,${base64}`;

    saved.push({
      url: dataUrl,
      type,
      name: file.name || "attachment",
      size: buffer.length,
    });
  }
  return saved;
}

async function parseJson(request) {
  const body = await request.json();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const relationship = (body.relationship || "").trim();
  const message = (body.message || "").trim();
  return { name, email, relationship, message, attachments: [] };
}

async function parseMultipart(request) {
  const formData = await request.formData();
  const files = formData.getAll("attachments").filter((file) => typeof file === "object" && "arrayBuffer" in file);
  const attachments = await serializeFiles(files);
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const relationship = (formData.get("relationship") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();
  return { name, email, relationship, message, attachments };
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const { name, email, relationship, message, attachments } = isMultipart
      ? await parseMultipart(request)
      : await parseJson(request);

    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    if (!name || (!hasAttachments && (!email || !relationship))) {
      return NextResponse.json({ message: "Name is required; email and relationship are needed unless files are attached." }, { status: 400 });
    }

    const { messages } = await getCollections();
    const payload = { name, email, relationship, message, attachments, createdAt: new Date() };
    await messages.insertOne(payload);
    await sendNotification({
      subject: `New RSVP from ${name}`,
      data: {
        Name: name,
        Email: email,
        Relationship: relationship,
        Message: message || "(no additional details)",
        Attachments: attachments?.length ? attachments.map((file) => file.name).join(", ") : "None",
      },
    });
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error("Unable to save message", error);
    return NextResponse.json({ message: "Unable to save message." }, { status: 500 });
  }
}
