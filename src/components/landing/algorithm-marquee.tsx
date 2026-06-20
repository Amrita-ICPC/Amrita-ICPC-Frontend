const ALGORITHMS = [
    { name: "Dijkstra's Algorithm", color: "#6f97ff" },
    { name: "Segment Tree", color: "#a78bfa" },
    { name: "BFS / DFS", color: "#14b8a6" },
    { name: "Dynamic Programming", color: "#22d3ee" },
    { name: "Kruskal's MST", color: "#6f97ff" },
    { name: "Binary Search", color: "#8b5cf6" },
    { name: "Fenwick Tree", color: "#14b8a6" },
    { name: "Z-Algorithm", color: "#22d3ee" },
    { name: "Convex Hull", color: "#a78bfa" },
    { name: "Floyd–Warshall", color: "#6f97ff" },
    { name: "Suffix Array", color: "#8b5cf6" },
    { name: "Heavy-Light Decomp.", color: "#14b8a6" },
    { name: "KMP Matching", color: "#22d3ee" },
    { name: "Tarjan SCC", color: "#a78bfa" },
];

export function AlgorithmMarquee() {
    const items = [...ALGORITHMS, ...ALGORITHMS];

    return (
        <div className="landing-marquee">
            <div className="landing-marquee-track">
                {items.map((algo, i) => (
                    <div key={`${algo.name}-${i}`} className="landing-marquee-item">
                        <span className="landing-marquee-dot" style={{ background: algo.color }} />
                        {algo.name}
                    </div>
                ))}
            </div>
        </div>
    );
}
