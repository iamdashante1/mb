"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const galleryItems = [
  {
    src: "/assets/hero.jpg",
    title: "Sunlit Florals",
    description: "Flowers from the celebration of life service that Michele adored.",
    category: "celebration",
  },
  {
    src: "/assets/biography.jpg",
    title: "Journaling Moments",
    description: "Michele journaling gratitude notes on Sunday mornings.",
    category: "quiet",
  },
  {
    src: "/assets/service.jpg",
    title: "Sanctuary Light",
    description: "Soft morning light streaming into the sanctuary before guests arrived.",
    category: "celebration",
    objectFit: "contain",
  },
  {
    src: "/assets/garden-walk.jpg",
    title: "Garden Walk",
    description: "Evening walk through the garden Michele tended with care.",
    category: "quiet",
  },
  {
    src: "/assets/WhatsApp Image 2025-12-16 at 13.46.50_2156d165.jpg",
    title: "Fun Spot Laughter",
    description: "Holiday smiles at Fun Spot in matching festive outfits.",
    category: "celebration",
  },
  {
    src: "/assets/WhatsApp Image 2025-12-16 at 13.46.50_6628f6c9.jpg",
    title: "Palm Garden Pause",
    description: "Soaking up sunshine beside the sparkling gift display.",
    category: "quiet",
  },
  {
    src: "/assets/WhatsApp Image 2025-12-16 at 13.46.50_6fb7c87d.jpg",
    title: "Neighborhood Stroll",
    description: "Sunday stroll through the neighborhood with a peaceful grin.",
    category: "quiet",
  },
  {
    src: "/assets/WhatsApp Image 2025-12-16 at 13.46.50_d2987e6e.jpg",
    title: "Deckside Adventure",
    description: "Cruise deck adventure taking in the sea breeze together.",
    category: "family",
  },
  {
    src: "/assets/WhatsApp Image 2025-12-16 at 13.47.01_3b37bbc8.jpg",
    title: "Proud Embrace",
    description: "Celebrating a military milestone with a tight embrace.",
    category: "celebration",
  },
  {
    src: "/assets/WhatsApp Image 2025-12-16 at 13.47.21_81b780aa.jpg",
    title: "Tropical Catch-Up",
    description: "Laughing with family during a tropical afternoon visit.",
    category: "family",
  },
];

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

export default function GalleryPage() {
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useReveal([filter]);

  const filteredItems = filter === "all" ? galleryItems : galleryItems.filter((item) => item.category === filter);
  const currentItem = typeof lightboxIndex === "number" ? galleryItems[lightboxIndex] : null;

  const closeLightbox = () => setLightboxIndex(null);
  const showNext = (offset) => {
    if (typeof lightboxIndex !== "number") return;
    const nextIndex = (lightboxIndex + offset + galleryItems.length) % galleryItems.length;
    setLightboxIndex(nextIndex);
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (typeof lightboxIndex !== "number") return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") showNext(1);
      if (event.key === "ArrowLeft") showNext(-1);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex]);

  return (
    <div className="gallery-page">
      <header className="gallery-hero">
        <div className="gallery-hero__content reveal">
          <p className="hero__eyebrow">Celebrating Michele</p>
          <h1>Photo Gallery</h1>
          <p className="hero__subtitle">
            Snapshots from gatherings, celebrations, and quiet moments that reflect Michele&apos;s warmth.
          </p>
          <div className="hero__actions">
            <Link href="/" className="hero__cta">
              Back to Memorial
            </Link>
            <a href="#gallery" className="hero__cta hero__cta--secondary">
              Browse Gallery
            </a>
          </div>
        </div>
        <div className="gallery-hero__image reveal">
          <Image src="/assets/hero.jpg" alt="Floral arrangement in soft light" width={640} height={640} />
        </div>
      </header>

      <main>
        <section className="gallery-intro reveal">
          <p>
            Each image was lovingly curated by family and friends. Hover for details, filter moments by theme, or tap to
            expand a photo.
          </p>
          <div className="gallery-filter" role="tablist">
            {[
              { id: "all", label: "All" },
              { id: "celebration", label: "Celebrations" },
              { id: "family", label: "Family" },
              { id: "quiet", label: "Quiet Moments" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`gallery-filter__button${filter === item.id ? " active" : ""}`}
                data-filter={item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section id="gallery" className="gallery-grid">
          {filteredItems.map((item, index) => (
            <article
              className="gallery-card reveal"
              key={`${item.title}-${index}`}
              onClick={() => setLightboxIndex(galleryItems.indexOf(item))}
            >
              <figure className="gallery-card__figure">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                  className="gallery-card__image"
                  style={{
                    objectFit: item.objectFit ?? "cover",
                    objectPosition: item.objectPosition ?? "center",
                  }}
                />
              </figure>
            </article>
          ))}
        </section>
      </main>

      {currentItem ? (
        <div className="lightbox lightbox--visible" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <button className="lightbox__close" aria-label="Close gallery" onClick={closeLightbox}>
            &times;
          </button>
          <button className="lightbox__nav lightbox__nav--prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); showNext(-1); }}>
            &#10094;
          </button>
          <figure className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <Image src={currentItem.src} alt={currentItem.title} width={900} height={700} />
            <figcaption>
              <h3>{currentItem.title}</h3>
              <p>{currentItem.description}</p>
            </figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); showNext(1); }}>
            &#10095;
          </button>
        </div>
      ) : null}
    </div>
  );
}
