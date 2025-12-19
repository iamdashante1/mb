"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [galleryItems, setGalleryItems] = useState([]);
  const [status, setStatus] = useState("Loading photos...");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useReveal([filter, galleryItems.length]);

  useEffect(() => {
    async function loadGallery() {
      try {
        setStatus("Loading photos...");
        const response = await fetch("/api/gallery", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load gallery");
        const data = await response.json();
        if (Array.isArray(data)) {
          setGalleryItems(data);
        } else {
          setGalleryItems([]);
        }
        setStatus("");
      } catch {
        setStatus("Unable to load gallery right now. Please try again.");
        setGalleryItems([]);
      }
    }

    loadGallery();
  }, []);

  const filteredItems = filter === "all" ? galleryItems : galleryItems.filter((item) => item.category === filter);
  const currentItem = typeof lightboxIndex === "number" ? galleryItems[lightboxIndex] : null;

  const closeLightbox = () => setLightboxIndex(null);
  const showNext = (offset) => {
    if (typeof lightboxIndex !== "number" || !galleryItems.length) return;
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
          {status ? <p className="gallery__status">{status}</p> : null}
          {!status && !filteredItems.length ? (
            <p className="gallery__status">Add photos to public/assets to see them here automatically.</p>
          ) : null}
          {filteredItems.map((item, index) => (
            <article
              className="gallery-card reveal"
              key={`${item.title}-${index}`}
              onClick={() => setLightboxIndex(galleryItems.findIndex((entry) => entry.src === item.src))}
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
