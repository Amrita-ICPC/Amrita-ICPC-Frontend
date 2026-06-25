"use client";

import { IBM_Plex_Mono, Public_Sans } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/global/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import styles from "./official-landing.module.css";

const plexSans = Public_Sans({
    subsets: ["latin"],
    variable: "--landing-font-sans",
    weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    variable: "--landing-font-mono",
    weight: ["400", "500", "600"],
});

const NAV_ITEMS = [
    { id: "overview", label: "Overview" },
    { id: "structure", label: "Structure" },
    { id: "workflow", label: "Workflow" },
    { id: "evaluation", label: "Evaluation" },
    { id: "access", label: "Access" },
] as const;

const PLATFORM_ENTITIES = [
    {
        name: "Contests",
        purpose: "Publish scheduled programming events with rules, timing, and participation flow.",
        output: "Schedules, access windows, standings",
    },
    {
        name: "Problems",
        purpose: "Maintain question statements, limits, tags, and reusable problem sets.",
        output: "Banks, statements, constraints",
    },
    {
        name: "Teams",
        purpose: "Organize participant membership for practice sessions and live contests.",
        output: "Membership, eligibility, activity",
    },
    {
        name: "Judging",
        purpose: "Compile, run, and verify submissions against the configured test cases.",
        output: "Verdicts, runtime, memory",
    },
    {
        name: "Rankings",
        purpose: "Reflect solved counts, penalties, and contest order as results change.",
        output: "Leaderboards, contest results",
    },
] as const;

const WORKFLOW_STEPS = [
    {
        step: "01",
        title: "Prepare",
        description: "Define the contest, assemble the problem set, and publish the schedule.",
    },
    {
        step: "02",
        title: "Register",
        description:
            "Participants sign in, join teams, and confirm access before the contest opens.",
    },
    {
        step: "03",
        title: "Solve",
        description: "Teams work through the problem set within the contest window.",
    },
    {
        step: "04",
        title: "Judge",
        description:
            "Each submission is compiled, executed, and checked against the expected output.",
    },
    {
        step: "05",
        title: "Rank",
        description:
            "Standings update from verdicts and remain available for review after the contest.",
    },
] as const;

const VERDICTS = [
    { label: "Accepted", state: "success" },
    { label: "Wrong Answer", state: "error" },
    { label: "Time Limit Exceeded", state: "warning" },
    { label: "Compilation Error", state: "neutral" },
] as const;

const ROLE_SCOPE = [
    {
        title: "Students",
        description: "Join teams, solve problems, and review standings and submission outcomes.",
    },
    {
        title: "Instructors",
        description: "Prepare question banks, schedule contests, and review contest activity.",
    },
    {
        title: "Coordinators",
        description: "Manage participation, oversee delivery, and preserve contest continuity.",
    },
] as const;

const ARCHIVE_ITEMS = [
    "Contest schedules and standings",
    "Problem banks and tagged statements",
    "Submission verdict histories",
    "Team participation records",
] as const;

function SectionLabel({
    number,
    label,
    active,
}: {
    number: string;
    label: string;
    active: boolean;
}) {
    return (
        <div className={styles.sectionLabelWrap}>
            <div className={styles.sectionRule} aria-hidden="true">
                <span className={styles.sectionRuleFill} data-active={active} />
            </div>
            <p className={styles.sectionLabelNumber}>{number}</p>
            <p className={styles.sectionLabelText}>{label}</p>
        </div>
    );
}

export function OfficialLanding() {
    const [activeSection, setActiveSection] =
        useState<(typeof NAV_ITEMS)[number]["id"]>("overview");
    const [headerHidden, setHeaderHidden] = useState(false);

    useEffect(() => {
        const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]?.target.id) {
                    setActiveSection(visible[0].target.id as (typeof NAV_ITEMS)[number]["id"]);
                }
            },
            {
                rootMargin: "-20% 0px -55% 0px",
                threshold: [0.15, 0.4, 0.7],
            },
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let previousY = window.scrollY;

        const handleScroll = () => {
            const currentY = window.scrollY;
            const delta = currentY - previousY;

            if (currentY < 24) {
                setHeaderHidden(false);
            } else if (delta > 8) {
                setHeaderHidden(true);
            } else if (delta < -8) {
                setHeaderHidden(false);
            }

            previousY = currentY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`${styles.page} ${plexSans.variable} ${plexMono.variable}`}>
            <a href="#main-content" className={styles.skipLink}>
                Skip to content
            </a>

            <header className={styles.header} data-hidden={headerHidden}>
                <div className={styles.headerBrand}>
                    <p className={styles.headerInstitution}>Amrita University</p>
                    <a href="#overview" className={styles.headerWordmark}>
                        Amrita ICPC
                    </a>
                    <p className={styles.headerDescriptor}>Official contest platform</p>
                </div>

                <nav className={styles.headerNav} aria-label="Landing sections">
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={styles.headerNavLink}
                            aria-current={activeSection === item.id ? "true" : undefined}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-3 justify-self-end">
                    <ThemeToggle />
                    <Button asChild variant="default" size="lg" className="no-underline">
                        <Link href="/auth/login">Sign in</Link>
                    </Button>
                </div>
            </header>

            <main id="main-content" className={styles.main}>
                <section id="overview" data-section className={styles.hero}>
                    <div className={styles.heroIntro}>
                        <p className={styles.heroKicker}>Official platform</p>
                        <h1 className={styles.heroBrand}>Amrita ICPC</h1>
                        <p className={styles.heroStatement}>
                            Official contest and practice platform for programming competitions at
                            Amrita University.
                        </p>
                        <div className={styles.heroActions}>
                            <Button
                                asChild
                                variant="default"
                                size="lg"
                                className={styles.primaryAction}
                            >
                                <Link href="/auth/login">Sign in</Link>
                            </Button>
                            <Button
                                asChild
                                variant="secondary"
                                size="default"
                                className={styles.secondaryAction}
                            >
                                <a href="#structure">Explore the platform</a>
                            </Button>
                        </div>
                    </div>

                    <Card
                        variant="default"
                        className={styles.heroPlane}
                        aria-label="Platform overview"
                    >
                        <div className={styles.heroPlaneHeader}>
                            <div>
                                <p className={styles.heroPlaneEyebrow}>Competition model</p>
                                <p className={styles.heroPlaneTitle}>
                                    How the platform is organized
                                </p>
                            </div>
                            <p className={styles.heroPlaneMeta}>Contests, teams, judging</p>
                        </div>

                        <div className={styles.heroPlaneRow}>
                            <span className={styles.heroPlaneLabel}>Contest flow</span>
                            <div className={styles.heroTimeline}>
                                <span>Schedule</span>
                                <span>Registration</span>
                                <span>Submissions</span>
                                <span>Results</span>
                            </div>
                        </div>

                        <div className={styles.heroPlaneRow}>
                            <span className={styles.heroPlaneLabel}>Core entities</span>
                            <div className={styles.heroInlineList}>
                                <span>Contests</span>
                                <span>Problems</span>
                                <span>Teams</span>
                                <span>Rankings</span>
                            </div>
                        </div>

                        <div className={styles.heroPlaneRow}>
                            <span className={styles.heroPlaneLabel}>Languages</span>
                            <div className={styles.heroInlineList}>
                                <span>C++</span>
                                <span>Java</span>
                                <span>Python</span>
                            </div>
                        </div>

                        <div className={styles.heroPlaneRow}>
                            <span className={styles.heroPlaneLabel}>Verdicts</span>
                            <div className={styles.heroVerdicts}>
                                {VERDICTS.map((verdict) => (
                                    <span
                                        key={verdict.label}
                                        className={styles.heroVerdict}
                                        data-state={verdict.state}
                                    >
                                        {verdict.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Card>
                </section>

                <section
                    id="structure"
                    data-section
                    className={styles.section}
                    data-active={activeSection === "structure"}
                >
                    <SectionLabel
                        number="01"
                        label="Platform structure"
                        active={activeSection === "structure"}
                    />

                    <div className={styles.sectionBody}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Core entities and outputs</h2>
                            <p className={styles.sectionSummary}>
                                The platform is organized around the same objects that define a
                                programming contest: events, problems, teams, judging, and results.
                            </p>
                        </div>

                        <Card
                            variant="default"
                            className={styles.entityTable}
                            role="table"
                            aria-label="Platform entities"
                        >
                            <div className={styles.entityTableHead} role="rowgroup">
                                <div className={styles.entityRow} role="row">
                                    <span role="columnheader">Entity</span>
                                    <span role="columnheader">Used for</span>
                                    <span role="columnheader">Produces</span>
                                </div>
                            </div>
                            <CardContent className={styles.entityTableContent} role="rowgroup">
                                {PLATFORM_ENTITIES.map((entity) => (
                                    <div key={entity.name} className={styles.entityRow} role="row">
                                        <span className={styles.entityName} role="cell">
                                            {entity.name}
                                        </span>
                                        <span role="cell">{entity.purpose}</span>
                                        <span className={styles.entityOutput} role="cell">
                                            {entity.output}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section
                    id="workflow"
                    data-section
                    className={styles.section}
                    data-active={activeSection === "workflow"}
                >
                    <SectionLabel
                        number="02"
                        label="Contest workflow"
                        active={activeSection === "workflow"}
                    />

                    <div className={styles.sectionBody}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                How a contest moves through the system
                            </h2>
                            <p className={styles.sectionSummary}>
                                Each contest follows a clear sequence from preparation and access
                                control to judging and final standings.
                            </p>
                        </div>

                        <Card variant="default" className={styles.workflowCard}>
                            <ol className={styles.workflowList}>
                                {WORKFLOW_STEPS.map((item) => (
                                    <li key={item.step} className={styles.workflowItem}>
                                        <div className={styles.workflowMarker}>
                                            <span>{item.step}</span>
                                        </div>
                                        <div className={styles.workflowContent}>
                                            <h3 className={styles.workflowTitle}>{item.title}</h3>
                                            <p className={styles.workflowDescription}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </Card>
                    </div>
                </section>

                <section
                    id="evaluation"
                    data-section
                    className={styles.section}
                    data-active={activeSection === "evaluation"}
                >
                    <SectionLabel
                        number="03"
                        label="Evaluation model"
                        active={activeSection === "evaluation"}
                    />

                    <div className={styles.sectionBody}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>From submission to ranking</h2>
                            <p className={styles.sectionSummary}>
                                Every attempt produces an evaluation trail: language, execution
                                result, verdict, and its effect on standings.
                            </p>
                        </div>

                        <Card variant="default" className={styles.evaluationGrid}>
                            <div className={styles.evaluationBlock}>
                                <h3 className={styles.evaluationTitle}>Submission states</h3>
                                <ul className={styles.evaluationList}>
                                    {VERDICTS.map((verdict) => (
                                        <li key={verdict.label}>
                                            <span
                                                className={styles.evaluationDot}
                                                data-state={verdict.state}
                                                aria-hidden="true"
                                            />
                                            <span>{verdict.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.evaluationBlock}>
                                <h3 className={styles.evaluationTitle}>Languages in use</h3>
                                <ul className={styles.languageList}>
                                    <li>C++</li>
                                    <li>Java</li>
                                    <li>Python</li>
                                </ul>
                            </div>

                            <div className={styles.evaluationBlock}>
                                <h3 className={styles.evaluationTitle}>Ranking outputs</h3>
                                <ul className={styles.evaluationList}>
                                    <li>Solved count</li>
                                    <li>Penalty time</li>
                                    <li>Contest order</li>
                                    <li>Post-contest review</li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </section>

                <section
                    id="access"
                    data-section
                    className={styles.section}
                    data-active={activeSection === "access"}
                >
                    <SectionLabel
                        number="04"
                        label="Access and continuity"
                        active={activeSection === "access"}
                    />

                    <div className={styles.sectionBody}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                Built for recurring academic use
                            </h2>
                            <p className={styles.sectionSummary}>
                                The platform supports live contests, practice cycles, and archived
                                records across university cohorts.
                            </p>
                        </div>

                        <Card variant="default" className={styles.accessGrid}>
                            <div className={styles.accessBlock}>
                                <h3 className={styles.evaluationTitle}>User scope</h3>
                                <div className={styles.roleList}>
                                    {ROLE_SCOPE.map((role) => (
                                        <div key={role.title} className={styles.roleRow}>
                                            <p className={styles.roleName}>{role.title}</p>
                                            <p className={styles.roleDescription}>
                                                {role.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.accessBlock}>
                                <h3 className={styles.evaluationTitle}>Records preserved</h3>
                                <ul className={styles.archiveList}>
                                    {ARCHIVE_ITEMS.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <p>Amrita ICPC</p>
                <p>Amrita Vishwa Vidyapeetham</p>
            </footer>
        </div>
    );
}
