import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ACESLogo from "./ACESLogo";
import ProfileCard from "./ProfileCard";
import CursorGrid from "./CursorGrid";
import StrokeText from "./StrokeText";
import Domains from "./Domains";
import Events from "./Events";
import DockNav from "./DockNav";
import Recruit from "./Recruit";
import Console from "./Console";
import ConsoleLogin from "./ConsoleLogin";

import "./App.css";

gsap.registerPlugin(ScrollTrigger);

export default function App() {

  /* =========================================================
     ROUTING

     /                 -> main ACES site
     /recruit          -> public recruitment page
     /console/login    -> private console login
     /console          -> private recruitment console
  ========================================================= */

  const pathname = window.location.pathname;

  if (pathname === "/recruit") {
    return <Recruit />;
  }

  if (pathname === "/console/login") {
    return <ConsoleLogin />;
  }

  if (pathname === "/console") {
    return <Console />;
  }

  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* =====================================================
         HERO
      ===================================================== */

      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-wrap",
          start: "top top",
          end: "+=115%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      heroTimeline
        .to(
          ".hero-tech-word",
          {
            opacity: 0,
            scale: 0.98,
            filter: "blur(2px)",
            ease: "power2.inOut",
            duration: 0.34,
          },
          0.50
        )
        .to(
          ".hero-visual-stage",
          {
            scale: 0.88,
            opacity: 0,
            filter: "blur(4px)",
            ease: "power3.inOut",
            duration: 0.38,
          },
          0.52
        )
        .to(
          ".hero-ui, .hero-bottom",
          {
            opacity: 0,
            ease: "power2.out",
            duration: 0.18,
          },
          0.70
        );


      /* =====================================================
         TEAM

         Desktop/tablet only:
         Leadership cards enter from outside -> center, then
         park into their final positions, followed by support.

         MOBILE:
         Disable the desktop ScrollTrigger/pinning animation
         completely. The CSS mobile layout becomes a normal
         document flow so every card is simply scrolled through.
      ===================================================== */

      const isMobile = window.matchMedia("(max-width: 700px)").matches;

      if (!isMobile) {
      const teamTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".team-wrap",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: ".team-stage",
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const leaders = [
        {
          selector: ".team-card-01",
          fromX: "-115vw",
          fromY: "-45vh",
          fromR: -22,
        },
        {
          selector: ".team-card-02",
          fromX: "112vw",
          fromY: "-48vh",
          fromR: 20,
        },
        {
          selector: ".team-card-03",
          fromX: "-118vw",
          fromY: "18vh",
          fromR: -18,
        },
        {
          selector: ".team-card-04",
          fromX: "115vw",
          fromY: "25vh",
          fromR: 22,
        },
      ];

      const support = [
        {
          selector: ".team-card-05",
          fromX: "-105vw",
          fromY: "8vh",
          fromR: 17,
        },
        {
          selector: ".team-card-06",
          fromX: "104vw",
          fromY: "4vh",
          fromR: -16,
        },
        {
          selector: ".team-card-07",
          fromX: "-110vw",
          fromY: "45vh",
          fromR: -14,
        },
        {
          selector: ".team-card-08",
          fromX: "108vw",
          fromY: "45vh",
          fromR: 16,
        },
        {
          selector: ".team-card-09",
          fromX: "-15vw",
          fromY: "105vh",
          fromR: 14,
        },
        {
          selector: ".team-card-10",
          fromX: "112vw",
          fromY: "72vh",
          fromR: 18,
        },
      ];

      const finalRotations = [
        -2.0,
        1.2,
        -1.4,
        1.8,
        -2.7,
        2.0,
        -1.5,
        2.3,
        -1.8,
        -1.4,
      ];

      const stage =
        document.querySelector(".team-stage");

      if (stage) {
        const stageRect =
          stage.getBoundingClientRect();


        /* ===================================================
           LEADERS
        =================================================== */

        leaders.forEach((card, index) => {
          const element =
            document.querySelector(card.selector);

          if (!element) return;

          const rect =
            element.getBoundingClientRect();

          const cardCenterX =
            rect.left -
            stageRect.left +
            rect.width / 2;

          const cardCenterY =
            rect.top -
            stageRect.top +
            rect.height / 2;

          const centerX =
            stageRect.width / 2 -
            cardCenterX;

          const centerY =
            stageRect.height / 2 -
            cardCenterY;

          gsap.set(element, {
            x: card.fromX,
            y: card.fromY,
            rotation: card.fromR,
            scale: 0.82,
            opacity: 0,
            transformOrigin: "50% 50%",
          });

          const arrival =
            index * 0.62;


          /* Outside -> center */

          teamTimeline.to(
            element,
            {
              x: centerX,
              y: centerY,
              rotation:
                index % 2 === 0
                  ? -0.7
                  : 0.7,
              scale: 1,
              opacity: 1,
              duration: 0.52,
              ease: "power3.out",
            },
            arrival
          );


          /* Center hold */

          teamTimeline.to(
            {},
            {
              duration: 0.20,
            },
            arrival + 0.52
          );


          /* Center -> final */

          teamTimeline.to(
            element,
            {
              x: 0,
              y: 0,
              rotation:
                finalRotations[index],
              scale: 1,
              duration: 0.48,
              ease: "power2.inOut",
            },
            arrival + 0.72
          );
        });


        /* ===================================================
           SUPPORTING CARDS
        =================================================== */

        const supportStart = 3.18;

        support.forEach((card, index) => {
          const element =
            document.querySelector(
              card.selector
            );

          if (!element) return;

          gsap.set(element, {
            x: card.fromX,
            y: card.fromY,
            rotation: card.fromR,
            scale: 0.86,
            opacity: 0,
            transformOrigin:
              "50% 50%",
          });

          const start =
            supportStart +
            index * 0.30;

          teamTimeline.to(
            element,
            {
              x: 0,
              y: 0,
              rotation:
                finalRotations[index + 4],
              scale: 1,
              opacity: 1,
              duration: 0.50,
              ease: "power3.out",
            },
            start
          );
        });
      }


      } else {
        /* =====================================================
           MOBILE TEAM CARD REVEALS
           -----------------------------------------------------
           Normal document flow is preserved on phones.
           Cards fade/slide in as they enter the viewport and
           fade back out as they leave it.

           No pinning. No artificial 500vh scroll sequence.
        ===================================================== */

        const mobileCards = gsap.utils.toArray(".team-card-slot");

        mobileCards.forEach((card) => {
          gsap.set(card, {
            autoAlpha: 0,
            y: 24,
            scale: 0.985,
            transformOrigin: "50% 50%",
          });

          ScrollTrigger.create({
            trigger: card,
            start: "top 84%",
            end: "bottom 16%",

            onEnter: () => {
              gsap.to(card, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.55,
                ease: "power3.out",
                overwrite: true,
              });
            },

            onLeave: () => {
              gsap.to(card, {
                autoAlpha: 0,
                y: -18,
                scale: 0.985,
                duration: 0.40,
                ease: "power2.inOut",
                overwrite: true,
              });
            },

            onEnterBack: () => {
              gsap.to(card, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.50,
                ease: "power3.out",
                overwrite: true,
              });
            },

            onLeaveBack: () => {
              gsap.to(card, {
                autoAlpha: 0,
                y: 24,
                scale: 0.985,
                duration: 0.40,
                ease: "power2.inOut",
                overwrite: true,
              });
            },
          });
        });
      }

    }, root);

    return () => ctx.revert();
  }, []);


  /* =========================================================
     MAIN SITE
  ========================================================= */

  return (
    <main
      ref={root}
      className="site"
    >

      {/* =====================================================
          GLOBAL DOCK NAVIGATION
      ===================================================== */}

      <DockNav />


      <div className="frame" />


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero-wrap"
        id="home"
      >
        <div className="hero">

          <CursorGrid
            cellSize={38}
            radius={190}
            lineColor="rgba(255,255,255,0.03)"
            glowColor="32,227,178"
            opacity={0.78}
          />


          <header className="hero-ui">

            <div className="center-meta">
              DYPCOE · PUNE · COMPUTER ENGINEERING
            </div>

            <div className="menu">
              MENU <b>+</b>
            </div>

          </header>


          <StrokeText
            className="hero-tech-word"
            phrase="ASSOCIATION OF COMPUTER ENGINEERING STUDENTS"
            fontSize={54}
            baseOpacity={0.10}
            revealRadius={120}
          />


          <div className="hero-visual-stage">

            <div className="hero-logo-wrap">
              <ACESLogo />
            </div>

          </div>


          <div className="hero-bottom">

            <span>
              SCROLL TO REVEAL
            </span>

            <span className="down">
              ↓
            </span>

            <span>
              001 / 004
            </span>

          </div>

        </div>
      </section>


      {/* =====================================================
          TEAM
      ===================================================== */}

      <section
        className="team-wrap"
        id="team"
      >
        <div className="team-stage">

          <div
            className="team-grid"
            aria-hidden="true"
          />


          <div className="team-kicker">
            01 / THE PEOPLE · COMMITTEE / 2026
          </div>


          <div className="team-heading">

            <span className="team-heading-solid">
              MEET
            </span>

            <span className="team-heading-outline">
              THE TEAM.
            </span>

          </div>


          <div className="team-description">
            The people who keep ACES moving.
          </div>


          <div className="team-coordinates">

            <span>
              DYPCOE / PUNE
            </span>

            <span>
              COMMITTEE / 2026
            </span>

            <span>
              10 CARDS
            </span>

          </div>


          {/* =================================================
              CARD 01 — PRESIDENT
          ================================================= */}

          <div className="team-card-slot team-card-01">

            <ProfileCard
              number="01"
              name="Pradyumn Pandhurnekar"
              title="President"
              avatarUrl="/team/pradyumn.jpeg"
              accent="mint"
              meta="ACES // 2026"
              instagram="https://www.instagram.com/pradzyyy"
              linkedin="https://www.linkedin.com/in/pradyumnpandhurnekar"
            />

          </div>


          {/* =================================================
              CARD 02 — VICE PRESIDENT
          ================================================= */}

          <div className="team-card-slot team-card-02">

            <ProfileCard
              number="02"
              name="Khushi Zaware"
              title="Vice President"
              avatarUrl="/team/khushi.jpeg"
              accent="blue"
              meta="ACES // 2026"
              instagram="https://www.instagram.com/khushikhu_08"
              linkedin="https://www.linkedin.com/in/khushi-zaware-58ba9331b/"
            />

          </div>


          {/* =================================================
              CARD 03 — VICE PRESIDENT
          ================================================= */}

          <div className="team-card-slot team-card-03">

            <ProfileCard
              number="03"
              name="Siddhesh Jadhav"
              title="Vice President"
              avatarUrl="/team/siddhesh.jpeg"
              accent="blue"
              meta="ACES // 2026"
              instagram="https://www.instagram.com/a_neww_sid"
              linkedin="https://www.linkedin.com/in/siddhesh-jadhav-uwu/"
            />

          </div>


          {/* =================================================
              CARD 04 — TREASURER
          ================================================= */}

          <div className="team-card-slot team-card-04">

            <ProfileCard
              number="04"
              name="Anush Chawla"
              title="Treasurer"
              avatarUrl="/team/anush.jpeg"
              accent="violet"
              meta="ACES // 2026"
              instagram="https://www.instagram.com/acesdypcoe"
              linkedin="https://www.linkedin.com/in/anush-chawla-154388315/"
            />

          </div>


          {/* =================================================
              CARD 05 — TECHNICAL
          ================================================= */}

          <div className="team-card-slot team-card-05">

            <ProfileCard
              number="05"
              title="Technical"
              accent="blue"
              meta="Technical Leads"
              compact
              member1="Chandan Wani"
              member2="Abhishek Kumar Jha"
              member3="Salyyad Zaki Ali"
              member4="Nirav Warade"
              instagram="#"
              linkedin="#"
            />

          </div>


          {/* =================================================
              CARD 06 — SPORTS / LOGISTICS
          ================================================= */}

          <div className="team-card-slot team-card-06">

            <ProfileCard
              number="06"
              title="Sports / Logistics"
              accent="mint"
              meta="Sports Leads"
              compact
              member1="Chaitanya Nakhate"
              member2="Lavesh Tapar"
              member3="Yashwardhan Patil"
              instagram="#"
              linkedin="#"
            />

          </div>


          {/* =================================================
              CARD 07 — CULTURAL
          ================================================= */}

          <div className="team-card-slot team-card-07">

            <ProfileCard
              number="07"
              title="Cultural"
              accent="violet"
              meta="Cultural Leads"
              compact
              member1="Janhvi Mehta"
              member2="Sweety Urade"
              instagram="#"
              linkedin="#"
            />

          </div>


          {/* =================================================
              CARD 08 — MEDIA / PR / DESIGN
          ================================================= */}

          <div className="team-card-slot team-card-08">

            <ProfileCard
              number="08"
              title="Media / PR / Design"
              accent="cyan"
              meta="Media / PR / Design"
              compact
              member1="Nikhil D Bansode"
              member2="Nihal Bora"
              member3="Prathamesh Mali"
              instagram="#"
              linkedin="#"
            />

          </div>


          {/* =================================================
              CARD 09 — DOCUMENTATION / MANAGEMENT
          ================================================= */}

          <div className="team-card-slot team-card-09">

            <ProfileCard
              number="09"
              title="Documentation / Management"
              accent="blue"
              meta="Documentation · Management"
              compact
              member1="Bhavika Patil"
              member2="Parth Jadhav"
              member3="Kartik Raut"
            />

          </div>


          {/* =================================================
              CARD 10 — FACULTY
          ================================================= */}

          <div className="team-card-slot team-card-10">

            <ProfileCard
              number="00"
              name="Dr Mrs Dipalee Rane"
              title="Faculty Co-ordinator"
              accent="mint"
              meta="DYPCOE // COMPUTER ENGINEERING"
              compact
            />

          </div>


          <div className="team-footer">

            <span>
              SCROLL / REVEAL
            </span>

            <span>
              LEADERSHIP · DOMAIN TEAMS · FACULTY
            </span>

            <span>
              01 — 10
            </span>

          </div>

        </div>
      </section>


      {/* =====================================================
          DOMAINS
      ===================================================== */}

      <Domains />


      {/* =====================================================
          EVENTS
      ===================================================== */}

      <Events />

    </main>
  );
}