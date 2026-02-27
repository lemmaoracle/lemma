import { Lock, Shield, Filter, Search, Anchor } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface OrbitNode {
  orbitIndex: number;
  nodeIndex: number;
  type: number;
  angleOffset: number;
}

export function ProvenanceChainBg() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1400, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const nodeTypes = [
    { Icon: Lock, label: "encrypt" },
    { Icon: Shield, label: "prove" },
    { Icon: Filter, label: "disclose" },
    { Icon: Search, label: "query" },
    { Icon: Anchor, label: "provenance" },
  ];

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Center point
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Orbit configuration
  const orbits = [
    { radius: 80, nodeCount: 3, speed: 0.15, direction: 1 }, // Innermost, clockwise
    { radius: 140, nodeCount: 5, speed: -0.12, direction: -1 }, // Counter-clockwise
    { radius: 200, nodeCount: 6, speed: 0.09, direction: 1 }, // Clockwise
    { radius: 260, nodeCount: 8, speed: -0.07, direction: -1 }, // Counter-clockwise
    { radius: 320, nodeCount: 10, speed: 0.05, direction: 1 }, // Outermost, clockwise
  ];

  // Generate orbit nodes
  const orbitNodes: OrbitNode[] = [];
  orbits.forEach((orbit, orbitIndex) => {
    for (let i = 0; i < orbit.nodeCount; i++) {
      orbitNodes.push({
        orbitIndex,
        nodeIndex: i,
        type: (orbitIndex + i) % nodeTypes.length,
        angleOffset: (i / orbit.nodeCount) * Math.PI * 2,
      });
    }
  });

  const currentTime = prefersReducedMotion ? 0 : Date.now() / 1000;

  // Calculate node positions
  const nodePositions = orbitNodes.map((node) => {
    const orbit = orbits[node.orbitIndex];
    const angle = node.angleOffset + currentTime * orbit.speed;
    const x = centerX + Math.cos(angle) * orbit.radius;
    const y = centerY + Math.sin(angle) * orbit.radius;

    return {
      ...node,
      x,
      y,
      angle,
    };
  });

  // Calculate connections between adjacent orbits
  const connections: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> =
    [];
  const maxConnectionDistance = 100;

  nodePositions.forEach((node1, i) => {
    nodePositions.forEach((node2, j) => {
      if (i >= j) return;

      // Only connect nodes on adjacent orbits
      if (Math.abs(node1.orbitIndex - node2.orbitIndex) === 1) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxConnectionDistance) {
          const opacity = (1 - distance / maxConnectionDistance) * 0.06;
          connections.push({
            x1: node1.x,
            y1: node1.y,
            x2: node2.x,
            y2: node2.y,
            opacity,
          });
        }
      }
    });
  });

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Render faint orbit paths */}
        {orbits.map((orbit, i) => (
          <circle
            key={`orbit-${i}`}
            cx={centerX}
            cy={centerY}
            r={orbit.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.03"
            className="text-black"
          />
        ))}

        {/* Render connections */}
        {connections.map((conn, i) => (
          <line
            key={`conn-${i}`}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="currentColor"
            strokeWidth="1"
            opacity={conn.opacity}
            className="text-black"
          />
        ))}

        {/* Render nodes */}
        {nodePositions.map((node, i) => {
          const NodeIcon = nodeTypes[node.type].Icon;

          // Pulse based on position in orbit
          const pulseOpacity = prefersReducedMotion
            ? 0.12
            : 0.08 + Math.sin(currentTime * 2 + node.angle) * 0.05;

          return (
            <g key={`node-${i}`}>
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r="7"
                fill="currentColor"
                opacity={pulseOpacity}
                className="text-black"
              />

              {/* Icon overlay */}
              <foreignObject
                x={node.x - 6}
                y={node.y - 6}
                width="12"
                height="12"
                opacity={pulseOpacity + 0.04}
              >
                <div className="flex h-full w-full items-center justify-center"></div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
