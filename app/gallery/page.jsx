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
    src: "/assets/family-brunch.jpg",
    title: "Family Brunch",
    description: "A candid from the Bailey brunch table filled with laughter.",
    category: "family",
  },
  {
    src: "/assets/garden-walk.jpg",
    title: "Garden Walk",
    description: "Evening walk through the garden Michele tended with care.",
    category: "quiet",
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
                <figcaption className="gallery-card__caption">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </figcaption>
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
