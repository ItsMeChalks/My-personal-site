"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".nav");
    const menu = document.querySelector(".nav__links");
    const toggle = document.querySelector(".nav__toggle");
    const navLinks = Array.from(document.querySelectorAll(".nav__links a[href^=\"#\"]"));
    const basePath = `${window.location.pathname}${window.location.search}`;
    const trackedSections = [];
    const sectionIds = new Set();
    let activeSectionId = null;

    const setActiveSection = (id) => {
        if (!id || !sectionIds.has(id) || activeSectionId === id) {
            return;
        }

        activeSectionId = id;

        navLinks.forEach((link) => {
            const linkId = link.getAttribute("href").slice(1);
            link.classList.toggle("is-active", linkId === id);
        });

        const desiredHash = `#${id}`;
        if (window.location.hash !== desiredHash) {
            if (history.replaceState) {
                history.replaceState(null, "", `${basePath}${desiredHash}`);
            } else {
                window.location.hash = desiredHash;
            }
        }
    };

    let setExpanded = null;

    if (toggle && nav && menu) {
        setExpanded = (expanded) => {
            toggle.setAttribute("aria-expanded", String(expanded));
            nav.classList.toggle("is-active", expanded);
        };

        toggle.addEventListener("click", () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            setExpanded(!expanded);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 880) {
                setExpanded(false);
            }
        });
    }

    navLinks.forEach((link) => {
        const id = link.getAttribute("href").slice(1);

        if (id) {
            const section = document.getElementById(id);
            if (section) {
                trackedSections.push(section);
                sectionIds.add(id);
            }
        }

        link.addEventListener("click", () => {
            if (setExpanded && window.innerWidth <= 880) {
                setExpanded(false);
            }

            if (id) {
                setActiveSection(id);
            }
        });
    });

    if ("IntersectionObserver" in window && trackedSections.length) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
        );

        trackedSections.forEach((section) => sectionObserver.observe(section));
    }

    if (window.location.hash && sectionIds.has(window.location.hash.slice(1))) {
        setActiveSection(window.location.hash.slice(1));
    } else if (trackedSections.length) {
        setActiveSection(trackedSections[0].id);
    }

    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const baseDuration = prefersReducedMotion ? 0.01 : 1.05;
        const baseEase = prefersReducedMotion ? "none" : "power3.out";

        const animateElement = (element) => {
            const type = element.dataset.animate || "fade";
            const defaults = {
                duration: baseDuration,
                ease: baseEase,
                autoAlpha: 1
            };

            let fromVars = { autoAlpha: 0 };

            switch (type) {
                case "up":
                    fromVars = { autoAlpha: 0, y: 64 };
                    break;
                case "fade":
                    fromVars = { autoAlpha: 0, y: 24 };
                    break;
                case "scale":
                    fromVars = { autoAlpha: 0, scale: 0.92 };
                    break;
                case "blur":
                    fromVars = { autoAlpha: 0, filter: "blur(14px)", scale: 1.04 };
                    break;
                default:
                    fromVars = { autoAlpha: 0, y: 24 };
            }

            const timeline = gsap.timeline({
                defaults,
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    once: true
                }
            });

            timeline.fromTo(element, fromVars, { autoAlpha: 1, y: 0, scale: 1, filter: "none" });
        };

        gsap.set("[data-animate]", { autoAlpha: 0 });
        gsap.utils.toArray("[data-animate]").forEach(animateElement);

        const heroTl = gsap.timeline({ defaults: { duration: baseDuration, ease: baseEase } });
        heroTl
            .fromTo(".hero__title", { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0)
            .fromTo(".hero__lead", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, "-=0.6")
            .fromTo(".hero__cta", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, "-=0.5")
            .fromTo(".hero__stats div", { y: 60, autoAlpha: 0 }, {
                y: 0,
                autoAlpha: 1,
                stagger: 0.12
            }, "-=0.4");

        gsap.to(".orb--left", {
            xPercent: -10,
            yPercent: 6,
            duration: 20,
            ease: "none",
            repeat: -1,
            yoyo: true
        });

        gsap.to(".orb--right", {
            xPercent: 8,
            yPercent: -10,
            duration: 24,
            ease: "none",
            repeat: -1,
            yoyo: true
        });
    }
});
