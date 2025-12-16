"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SERVICE_DETAILS = {
  date: "Saturday, December 27, 2025",
  time: "1:00 PM",
  locationLines: [
    "New Macedonia Missionary Baptist Church",
    "748 W Ninth St",
    "Riviera Beach, FL 33404",
  ],
};

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
    value: "Family interment will follow immediately at Riviera Beach Memorial Park; guests who wish to attend may follow the caravan.",
  },
  {
    label: "Reception / Repast",
    value: "Light brunch at the Bailey residence (1240 W 34th St, West Palm Beach, FL 33407) beginning at 3:30 PM.",
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
    label: "Donations or Flowers",
    value:
      "Please consider planting a tree or donating to Michele’s favorite literacy nonprofits; modest floral tributes may be delivered to the church between 10:00 AM and noon.",
  },
  {
    label: "Livestream Information",
    value: (
      <>
        Livestream available at{" "}
        <a href="https://watch.baileyfamily.com" target="_blank" rel="noreferrer">
          watch.baileyfamily.com
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
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [hasError, setHasError] = useState(false);

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

  const handleTributeChange = (event) => {
    const { name, value } = event.target;
    setMemoryForm((prev) => ({ ...prev, [name]: value }));
  };

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
    if (!memoryForm.name || !memoryForm.message) return;

    try {
      const response = await fetch("/api/tributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoryForm),
      });

      if (!response.ok) throw new Error("Unable to save tribute");
      const createdTribute = await response.json();
      setTributes((prev) => [createdTribute, ...prev]);
      setMemoryForm({ name: "", message: "" });
    } catch {
      alert("We are unable to save your memory at the moment. Please try again later.");
    }
  }

  return (
    <>
      <header className="hero">
        <div className="hero__content reveal">
          <p className="hero__eyebrow">Forever Loved</p>
          <h1>Michele Bailey</h1>
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
                <input type="email" id="email" name="email" value={rsvpForm.email} onChange={handleRsvpChange} required />
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
                  required
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
          <div className="card__content">
            <h2>Share a Tribute</h2>
            <p>Leave a note, memory, or prayer for Michele’s loved ones to read on this page.</p>
            <form id="memory-form" onSubmit={handleTributeSubmit}>
              <div className="form-group">
                <label htmlFor="memory-name">Your Name</label>
                <input type="text" id="memory-name" name="name" value={memoryForm.name} onChange={handleTributeChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="memory-message">Message</label>
                <textarea
                  id="memory-message"
                  name="message"
                  rows={3}
                  value={memoryForm.message}
                  onChange={handleTributeChange}
                  required
                />
              </div>
              <button type="submit" className="button button--secondary">
                Add Memory
              </button>
            </form>
          </div>
          <div className="tributes" id="tributes-list">
            {tributes.length ? (
              tributes.map((tribute, index) => (
                <article className="tribute" key={`${tribute.name}-${index}`}>
                  <h3>{tribute.name || "Anonymous"}</h3>
                  <p className="tribute__date">{tribute.createdAt ? formatDate(tribute.createdAt) : ""}</p>
                  <p className="tribute__message">{tribute.message}</p>
                </article>
              ))
            ) : (
              <p className="tributes__empty">No tributes have been shared yet. Please add a memory above.</p>
            )}
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
    </>
  );
}
