import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Connection {
  id: string;
  from: number;
  to: number;
  active: boolean;
  opacity: number;
}

const NeuralNetworkLoader = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const initNodes = useCallback(() => {
    const newNodes: Node[] = [];
    for (let i = 0; i < 20; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }
    setNodes(newNodes);
  }, []);

  useEffect(() => {
    initNodes();
  }, [initNodes]);

  useEffect(() => {
    const updateNodes = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;
          let newVx = node.vx;
          let newVy = node.vy;

          // Bounce off walls
          if (newX < 0 || newX > 100) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(100, newX));
          }
          if (newY < 0 || newY > 100) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(100, newY));
          }

          return { ...node, x: newX, y: newY, vx: newVx, vy: newVy };
        })
      );
    };

    const updateConnections = () => {
      setConnections((prev) => {
        // Fade out existing connections
        const updated = prev
          .map((c) => ({ ...c, opacity: c.opacity - 0.02 }))
          .filter((c) => c.opacity > 0);

        // Add new random connections
        if (Math.random() < 0.15 && nodes.length > 1) {
          const fromIdx = Math.floor(Math.random() * nodes.length);
          let toIdx = Math.floor(Math.random() * nodes.length);
          while (toIdx === fromIdx) {
            toIdx = Math.floor(Math.random() * nodes.length);
          }

          const from = nodes[fromIdx];
          const to = nodes[toIdx];
          const distance = Math.sqrt(
            Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2)
          );

          // Only connect nearby nodes
          if (distance < 40) {
            const id = `${from.id}-${to.id}-${Date.now()}`;
            if (!updated.find((c) => c.from === from.id && c.to === to.id)) {
              updated.push({
                id,
                from: from.id,
                to: to.id,
                active: true,
                opacity: 1,
              });
            }
          }
        }

        return updated;
      });
    };

    const animate = () => {
      updateNodes();
      updateConnections();
      animationRef.current = requestAnimationFrame(animate);
    };

    const interval = setInterval(animate, 50);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes.length]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-background"
    >
      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(205 100% 60%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(215 90% 50%)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <AnimatePresence>
          {connections.map((connection) => {
            const fromNode = nodes.find((n) => n.id === connection.from);
            const toNode = nodes.find((n) => n.id === connection.to);
            if (!fromNode || !toNode) return null;

            return (
              <motion.line
                key={connection.id}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: connection.opacity }}
                exit={{ opacity: 0 }}
                style={{
                  filter: connection.active ? "drop-shadow(0 0 6px hsl(205 100% 60%))" : "none",
                }}
              />
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Dots */}
      {nodes.map((node, index) => (
        <motion.div
          key={node.id}
          className="absolute w-2.5 h-2.5 rounded-full bg-primary"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 8px hsl(205 100% 60% / 0.6)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="flex items-center gap-1 mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </motion.div>
        <p className="text-sm font-medium text-muted-foreground">ThinkCap is thinking...</p>
      </div>
    </div>
  );
};

export default NeuralNetworkLoader;
