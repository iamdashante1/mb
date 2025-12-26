"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SERVICE_DETAILS = {
  date: "Saturday, December 27, 2025",
  time: "1:00 PM",
  locationLines: [
    "New Macedonia Missionary Baptist Church",
    "748 W Ninth St",
    "Riviera Beach, FL 33404",
  ],
};

const BURIAL_DETAILS =
  "Interment will follow at Royal Palm Funeral Home & Memorial Garden, 5601 Greenwood Ave, West Palm Beach, FL 33407.";

const RSVP_DETAILS = [
  { label: "Name of the Deceased", value: "Michele Bailey" },
  { label: "Type of Service", value: "Celebration of life worship service with tributes, praise, and thanksgiving." },
  { label: "Date of Service", value: SERVICE_DETAILS.date },
  { label: "Start Time", value: SERVICE_DETAILS.time },
  {
    label: "Venue Name & Address",
    value: (
      <>
        {SERVICE_DETAILS.locationLines[0]}
        <br />
        {SERVICE_DETAILS.locationLines[1]}
        <br />
        {SERVICE_DETAILS.locationLines[2]}
      </>
    ),
  },
  {
    label: "Burial Details",
    value: BURIAL_DETAILS,
  },
  {
    label: "Reception / Repast",
    value: "Light brunch at 1710 E Tiffany Dr, Mangonia Park, FL 33407",
  },
  {
    label: "RSVP Purpose",
    value: "Attendance confirmation only so seating, programs, and the repast headcount can be prepared.",
  },
  { label: "Response Deadline", value: "Please respond by Tuesday, December 23, 2025." },
  {
    label: "Response Method",
    value: (
      <>
        Please send a text message with your name and headcount to (561) 727-5032. Text-only responses are preferred so the family
        can keep an organized list.
      </>
    ),
  },
  {
    label: "Guest Guidance",
    value: "Open attendance—family, friends, church members, and coworkers who loved Michele are welcome.",
  },
  {
    label: "Dress Guidance",
    value: "Honoring colors are green, white, and gold; traditional funeral attire is welcome if that feels most comfortable.",
  },
  {
    label: "Livestream Information",
    value: (
      <>
        Livestream available at{" "}
        <a href="https://www.youtube.com/@bishopmasters7" target="_blank" rel="noreferrer">https://www.youtube.com/@bishopmasters7
        </a>{" "}
        with access code MICHELELOVE (stream opens at 12:45 PM).
      </>
    ),
  },
];

function formatDate(value) {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function useReveal(deps = []) {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) return;

    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      revealElements.forEach((element) => element.classList.add("reveal--visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, deps);
}

export default function HomePage() {
  const [tributes, setTributes] = useState([]);
  const [rsvpForm, setRsvpForm] = useState({ name: "", email: "", relationship: "", message: "" });
  const [memoryForm, setMemoryForm] = useState({ name: "", message: "" });
  const [tributeFiles, setTributeFiles] = useState([]);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);
  const tributeFileInputRef = useRef(null);

  useReveal([tributes.length]);

  useEffect(() => {
    async function loadTributes() {
      try {
        const response = await fetch("/api/tributes");
        if (!response.ok) throw new Error("Unable to load tributes");
        const data = await response.json();
        if (Array.isArray(data)) {
          setTributes(data);
        }
      } catch {
        // ignore failures to keep UI responsive
      }
    }

    loadTributes();
  }, []);

  const handleRsvpChange = (event) => {
    const { name, value } = event.target;
    setRsvpForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTributeFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    const withPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type || "",
      name: file.name,
    }));
    setTributeFiles(withPreviews);
  };

  useEffect(
    () => () => {
      tributeFiles.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
    },
    [tributeFiles]
  );

  const handleTributeChange = (event) => {
    const { name, value } = event.target;
    setMemoryForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!lightboxItem) return;
    const handleKey = (event) => {
      if (event.key === "Escape") setLightboxItem(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxItem]);

  const openLightbox = (item) => {
    if (!item) return;
    setLightboxItem(item);
  };

  const closeLightbox = () => setLightboxItem(null);

  async function handleRsvpSubmit(event) {
    event.preventDefault();
    if (!rsvpForm.name || !rsvpForm.email || !rsvpForm.relationship) {
      setHasError(true);
      setThankYouMessage("Please share your name, email, and relationship before submitting your RSVP.");
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rsvpForm),
      });

      if (!response.ok) throw new Error("Network error");
      setHasError(false);
      setThankYouMessage(`Thank you, ${rsvpForm.name}. Your RSVP has been shared with the family.`);
      setRsvpForm({ name: "", email: "", relationship: "", message: "" });
    } catch {
      setHasError(true);
      setThankYouMessage("We were unable to save your RSVP. Please try again shortly.");
    }
  }

  async function handleTributeSubmit(event) {
    event.preventDefault();
    const hasMedia = tributeFiles.length > 0;
    if (!memoryForm.name || (!memoryForm.message && !hasMedia)) return;

    try {
      const formData = new FormData();
      formData.append("name", memoryForm.name);
      formData.append("message", memoryForm.message);
      tributeFiles.forEach((item) => formData.append("attachments", item.file));

      const response = await fetch("/api/tributes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Unable to save tribute");
      const createdTribute = await response.json();
      setTributes((prev) => [createdTribute, ...prev]);
      setMemoryForm({ name: "", message: "" });
      setTributeFiles([]);
      if (tributeFileInputRef.current) tributeFileInputRef.current.value = "";
    } catch {
      alert("We are unable to save your memory at the moment. Please try again later.");
    }
  }

  return (
    <>
      <header className="hero">
        <div className="hero__content reveal">
          <p className="hero__eyebrow">Forever Loved</p>
          <h1>Michele "Rosey" Bailey</h1>
          <p className="hero__dates">June 19, 1972 – December 12, 2025</p>
          <p className="hero__quote">“She had a heart that made everyone feel at home.”</p>
          <div className="hero__actions">
            <a href="#service-details" className="hero__cta">
              View Service Details
            </a>
            <Link href="/gallery" className="hero__cta hero__cta--secondary">
              Photo Gallery
            </Link>
          </div>
        </div>
        <div className="hero__image reveal" aria-hidden="true">
          <Image src="/assets/hero.jpg" alt="Soft light floral arrangement" width={640} height={720} priority />
        </div>
      </header>

      <main>
        <section id="biography" className="card reveal">
          <div className="card__image">
            <Image src="/assets/biography.jpg" alt="Open journal with flowers" width={600} height={500} />
          </div>
          <div className="card__content">
            <h2>Her Story</h2>
            <p>
              Michele Bailey spent her life uplifting others through compassion, laughter, and unwavering generosity. Born on
              June 19, 1972, she cultivated a love for family, faith, and gathering people together so no one ever felt alone.
              Every stage of her journey embodied grace, resilience, and a steadfast commitment to those she cherished.
            </p>
            <p>
              She poured her energy into mentoring, volunteering, and quietly helping wherever there was a need. Michele
              believed that a kind word could change a life, and countless friends, relatives, and neighbors carry that
              kindness with them today.
            </p>
          </div>
        </section>

        <section id="service-details" className="card card--highlight reveal">
          <div>
            <h2>Celebration of Life</h2>
            <p>
              <strong>Date:</strong> {SERVICE_DETAILS.date}
            </p>
            <p>
              <strong>Time:</strong> {SERVICE_DETAILS.time}
            </p>
            <p>
              <strong>Burial:</strong> {BURIAL_DETAILS}
            </p>
            <p>
              <strong>Location:</strong>
              <br />
              {SERVICE_DETAILS.locationLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
          <div className="service__image">
            <Image src="/assets/service.jpg" alt="Sunlight through trees" width={600} height={500} />
          </div>
        </section>

        <section id="rsvp" className="card reveal">
          <div className="card__content">
            <h2>RSVP</h2>
            <p>Please let the Bailey family know if you plan to attend the service and include any details they should know.</p>
            <div className="rsvp-guidance">
              <h3>Service & RSVP Details</h3>
              <dl className="rsvp-guidance__list">
                {RSVP_DETAILS.map((detail) => (
                  <div key={detail.label} className="rsvp-guidance__item">
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="card__content">
            <form id="rsvp-form" onSubmit={handleRsvpSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" value={rsvpForm.name} onChange={handleRsvpChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" value={rsvpForm.email} onChange={handleRsvpChange} />
              </div>
              <div className="form-group">
                <label htmlFor="relationship">Relationship to Michele</label>
                <input
                  type="text"
                  id="relationship"
                  name="relationship"
                  placeholder="Friend, cousin, coworker..."
                  value={rsvpForm.relationship}
                  onChange={handleRsvpChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Additional Details (optional)</label>
                <textarea id="message" name="message" rows={4} value={rsvpForm.message} onChange={handleRsvpChange} />
              </div>
              <button type="submit" className="button">
                Submit RSVP
              </button>
              {thankYouMessage ? (
                <p className={`success-message${hasError ? " error" : ""}`}>{thankYouMessage}</p>
              ) : null}
            </form>
          </div>
        </section>

        <section id="tributes" className="card reveal">
          <div className="card__content tribute-form">
            <p className="tribute-form__eyebrow">Tribute Wall</p>
            <div className="tribute-form__header">
              <div>
                <h2>Share a Tribute</h2>
                <p className="tribute-form__lead">
                  Write a note, prayer, or memory to honor Michele. Add photos or video if you like; everything shared appears on the wall below.
                </p>
              </div>
              <div className="tribute-form__stats">
                <span className="pill">
                  Tributes posted <strong>{tributes.length}</strong>
                </span>
                <span className="pill pill--ghost">
                  Media selected <strong>{tributeFiles.length}</strong>
                </span>
              </div>
            </div>

            <form id="memory-form" onSubmit={handleTributeSubmit} className="tribute-form__body">
              <div className="input-card">
                <div className="form-row form-row--stacked">
                  <div className="form-group">
                    <label htmlFor="memory-name">Your Name</label>
                    <input type="text" id="memory-name" name="name" value={memoryForm.name} onChange={handleTributeChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="memory-message">Message</label>
                    <textarea
                      id="memory-message"
                      name="message"
                      rows={4}
                      placeholder="Share a memory, prayer, or encouragement..."
                      value={memoryForm.message}
                      onChange={handleTributeChange}
                    />
                  </div>
                </div>

                <div className="form-row form-row--stacked">
                  <div className="form-group form-group--file">
                    <div className="file-upload file-upload--card">
                      <div className="file-upload__header">
                        <div>
                          <label htmlFor="tribute-attachments">Photos or videos (optional)</label>
                          <p className="muted small-text">Images and MP4s up to 15MB each.</p>
                        </div>
                        <button type="button" className="button file-upload__button" onClick={() => tributeFileInputRef.current?.click()}>
                          Choose files
                        </button>
                      </div>
                      <input
                        type="file"
                        id="tribute-attachments"
                        name="attachments"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleTributeFilesChange}
                        ref={tributeFileInputRef}
                        className="file-upload__input"
                      />
                      <span className="file-upload__info">
                        {tributeFiles.length ? `${tributeFiles.length} selected` : "No media selected yet."}
                      </span>
                    </div>
                {tributeFiles.length ? (
                  <div className="attachment-previews">
                    {tributeFiles.map((item, index) => (
                      <div className="attachment-previews__item" key={`${item.preview}-${index}`}>
                        {item.type.startsWith("video/") ? (
                          <video src={item.preview} controls preload="metadata" onClick={() => openLightbox(item)} />
                        ) : (
                          <img src={item.preview} alt={item.name} onClick={() => openLightbox(item)} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
                  </div>
                </div>

                <div className="tribute-form__actions">
                  <div className="muted">You can submit text alone; media is optional.</div>
                  <button type="submit" className="button button--secondary">
                    Add Memory
                  </button>
                </div>
              </div>
            </form>

            <div className="tribute-list">
              <h3>Tributes from loved ones</h3>
              <div className="tributes" id="tributes-list">
                {tributes.length ? (
                  tributes.map((tribute, index) => (
                    <article className="tribute" key={`${tribute.name}-${index}`}>
                      <div className="tribute__content">
                        <h3>{tribute.name || "Anonymous"}</h3>
                        <p className="tribute__date">{tribute.createdAt ? formatDate(tribute.createdAt) : ""}</p>
                        {tribute.message ? <p className="tribute__message">{tribute.message}</p> : null}
                      </div>
                      {tribute.attachments?.length ? (
                        <div className="tribute__media record__attachments">
                          <p className="muted">Shared media:</p>
                          <div className="record__attachment-list">
                            {tribute.attachments.map((file, fileIndex) => (
                              <div className="record__attachment" key={`${file.url}-${fileIndex}`}>
                                {file.type?.startsWith("image/") ? (
                                  <img
                                    src={file.url}
                                    alt={file.name || `Attachment ${fileIndex + 1}`}
                                    onClick={() => openLightbox({ url: file.url, type: file.type, name: file.name })}
                                  />
                                ) : file.type?.startsWith("video/") ? (
                                  <video
                                    src={file.url}
                                    controls
                                    preload="metadata"
                                    onClick={() => openLightbox({ url: file.url, type: file.type, name: file.name })}
                                  />
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p className="tributes__empty">No tributes have been shared yet. Please add a memory above.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>With love from the Bailey family.</p>
        <p>Please consider planting a tree or donating to your favorite literacy nonprofit in Michele’s honor.</p>
        <p>
          <Link href="/dashboard" className="dashboard-link">
            Family dashboard
          </Link>
        </p>
      </footer>

      <div className={`lightbox${lightboxItem ? " lightbox--visible" : ""}`} onClick={closeLightbox}>
        <div className="lightbox__content" onClick={(event) => event.stopPropagation()}>
          <button className="lightbox__close" aria-label="Close" onClick={closeLightbox}>
            &times;
          </button>
          {lightboxItem?.type?.startsWith("video/") ? (
            <video src={lightboxItem.url || lightboxItem.preview} controls autoPlay preload="metadata" />
          ) : (
            <img src={lightboxItem?.url || lightboxItem?.preview} alt={lightboxItem?.name || "Attachment"} />
          )}
          {lightboxItem?.name ? <p className="lightbox__caption">{lightboxItem.name}</p> : null}
        </div>
      </div>
    </>
  );
}
