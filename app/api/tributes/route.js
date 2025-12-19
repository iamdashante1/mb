import { NextResponse } from "next/server";
import { getCollections } from "@/lib/collections";
import { sendNotification } from "@/lib/notify";

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
  const message = (body.message || "").trim();
  return { name, message, attachments: [] };
}

async function parseMultipart(request) {
  const formData = await request.formData();
  const files = formData.getAll("attachments").filter((file) => typeof file === "object" && "arrayBuffer" in file);
  const attachments = await serializeFiles(files);
  const name = (formData.get("name") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();
  return { name, message, attachments };
}

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
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const { name, message, attachments } = isMultipart ? await parseMultipart(request) : await parseJson(request);

    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    if (!name || (!message && !hasAttachments)) {
      return NextResponse.json({ message: "Name and either a message or media are required." }, { status: 400 });
    }

    const { tributes } = await getCollections();
    const entry = { name, message, attachments, createdAt: new Date() };
    const result = await tributes.insertOne(entry);
    await sendNotification({
      subject: `New tribute from ${name}`,
      data: {
        Name: name,
        Message: message || "(no message provided)",
        Attachments: attachments?.length ? attachments.map((file) => file.name).join(", ") : "None",
      },
    });
    return NextResponse.json({ ...entry, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Unable to save tribute", error);
    return NextResponse.json({ message: "Unable to save tribute." }, { status: 500 });
  }
}
