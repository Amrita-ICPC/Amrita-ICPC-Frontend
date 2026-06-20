"use client";

import { useEffect, useRef } from "react";

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
}

const NODE_COUNT = 78;
const LINK_DISTANCE = 138;

export function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        const ctx2d = canvasEl?.getContext("2d");
        if (!canvasEl || !ctx2d) return;

        const canvas = canvasEl;
        const ctx = ctx2d;

        let width = 0;
        let height = 0;
        let nodes: Node[] = [];
        let frameId = 0;

        function init() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            nodes = Array.from({ length: NODE_COUNT }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28,
                r: Math.random() * 1.6 + 0.7,
            }));
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const d = Math.hypot(dx, dy);
                    if (d < LINK_DISTANCE) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(111,151,255,${(1 - d / LINK_DISTANCE) * 0.16})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(111,151,255,.4)";
                ctx.fill();
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;
            });

            frameId = requestAnimationFrame(draw);
        }

        init();
        draw();
        window.addEventListener("resize", init);

        return () => {
            window.removeEventListener("resize", init);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="landing-canvas" />;
}
