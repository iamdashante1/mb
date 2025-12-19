import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const GALLERY_DIR = path.join(process.cwd(), "public", "assets");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const KNOWN_METADATA = {
  "hero.jpg": {
    title: "Sunlit Florals",
    description: "Flowers from the celebration of life service that Michele adored.",
    category: "celebration",
    order: 1,
  },
  "biography.jpg": {
    title: "Journaling Moments",
    description: "Michele journaling gratitude notes on Sunday mornings.",
    category: "quiet",
    order: 2,
  },
  "service.jpg": {
    title: "Sanctuary Light",
    description: "Soft morning light streaming into the sanctuary before guests arrived.",
    category: "celebration",
    objectFit: "contain",
    order: 3,
  },
  "garden-walk.jpg": {
    title: "Garden Walk",
    description: "Evening walk through the garden Michele tended with care.",
    category: "quiet",
    order: 4,
  },
  "WhatsApp Image 2025-12-16 at 13.46.50_2156d165.jpg": {
    title: "Fun Spot Laughter",
    description: "Holiday smiles at Fun Spot in matching festive outfits.",
    category: "celebration",
    order: 5,
  },
  "WhatsApp Image 2025-12-16 at 13.46.50_6628f6c9.jpg": {
    title: "Palm Garden Pause",
    description: "Soaking up sunshine beside the sparkling gift display.",
    category: "quiet",
    order: 6,
  },
  "WhatsApp Image 2025-12-16 at 13.46.50_6fb7c87d.jpg": {
    title: "Neighborhood Stroll",
    description: "Sunday stroll through the neighborhood with a peaceful grin.",
    category: "quiet",
    order: 7,
  },
  "WhatsApp Image 2025-12-16 at 13.46.50_d2987e6e.jpg": {
    title: "Deckside Adventure",
    description: "Cruise deck adventure taking in the sea breeze together.",
    category: "family",
    order: 8,
  },
  "WhatsApp Image 2025-12-16 at 13.47.01_3b37bbc8.jpg": {
    title: "Proud Embrace",
    description: "Celebrating a military milestone with a tight embrace.",
    category: "celebration",
    order: 9,
  },
  "WhatsApp Image 2025-12-16 at 13.47.21_81b780aa.jpg": {
    title: "Tropical Catch-Up",
    description: "Laughing with family during a tropical afternoon visit.",
    category: "family",
    order: 10,
  },
};

function titleFromFilename(filename) {
  const base = filename.replace(path.extname(filename), "");
  return base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "Untitled";
}

export async function GET() {
  try {
    const files = await fs.readdir(GALLERY_DIR);
    const items = files
      .filter((file) => ALLOWED_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .map((file) => {
        const meta = KNOWN_METADATA[file] || {};
        return {
          src: `/assets/${file}`,
          title: meta.title || titleFromFilename(file),
          description: meta.description || "Shared by the Bailey family.",
          category: meta.category || "celebration",
          objectFit: meta.objectFit,
          objectPosition: meta.objectPosition,
          order: meta.order ?? 1000,
        };
      })
      .sort((a, b) => (a.order ?? 1000) - (b.order ?? 1000) || a.title.localeCompare(b.title))
      .map(({ order, ...rest }) => rest);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Unable to load gallery assets", error);
    return NextResponse.json({ message: "Unable to load gallery." }, { status: 500 });
  }
}
