import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import face1 from "./assets/1.png";
import face2 from "./assets/2.png";
import face3 from "./assets/3.png";
import face4 from "./assets/4.png";
import face5 from "./assets/5.png";
import face6 from "./assets/6.png";

function App() {
  const API_URL = "https://oecd-mpg-requires-grab.trycloudflare.com/generate";

  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const faces = [face1, face2, face3, face4, face5, face6];
  const containerRef = useRef(null);

  const floatingObjects = useRef(
    faces.map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      element: null,
    }))
  );

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    function animate() {
  const objs = floatingObjects.current;

  const container = containerRef.current;

  // 🔥 ALWAYS use LIVE container size
  const width = container.clientWidth;
  const height = container.clientHeight;

  objs.forEach((obj) => {
    if (!obj.element) return;

    obj.x += obj.vx;
    obj.y += obj.vy;

    const maxX = width - 180;
    const maxY = height - 180;

    if (obj.x < 0) { obj.x = 0; obj.vx *= -1; }
    if (obj.x > maxX) { obj.x = maxX; obj.vx *= -1; }

    if (obj.y < 0) { obj.y = 0; obj.vy *= -1; }
    if (obj.y > maxY) { obj.y = maxY; obj.vy *= -1; }

    // anti-sticking + friction
    if (Math.abs(obj.vx) < 0.2) obj.vx += (Math.random() - 0.5) * 0.3;
    if (Math.abs(obj.vy) < 0.2) obj.vy += (Math.random() - 0.5) * 0.3;

    obj.vx *= 0.995;
    obj.vy *= 0.995;

    obj.element.style.transform = `translate(${obj.x}px, ${obj.y}px)`;
  });

  requestAnimationFrame(animate);
}


    animate();
  }, []);

  const handleHover = (index, e) => {
    const obj = floatingObjects.current[index];
    if (!obj) return;

    const rect = obj.element.getBoundingClientRect();

    const dx = (rect.left + rect.width / 2) - e.clientX;
    const dy = (rect.top + rect.height / 2) - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    obj.vx = (dx / dist) * 8;
    obj.vy = (dy / dist) * 8;
  };

  // ⭐ Generate Image
  const handleGenerate = async () => {
    if (!prompt.trim()) return alert("Please enter a prompt!");

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setGeneratedImage("data:image/png;base64," + data.image);
    } catch (error) {
      alert("Backend offline — restart colab & tunnel");
    }

    setIsLoading(false);
  };

  // ⭐ Download button
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "cartoon.png";
    link.click();
  };

  return (
    <div className="page" ref={containerRef}>
      {faces.map((img, i) => (
        <img
          key={i}
          src={img}
          className="float"
          ref={(el) => (floatingObjects.current[i].element = el)}
          onMouseEnter={(e) => handleHover(i, e)}
          alt=""
        />
      ))}

      <h1 className="main-title">CartoonGen</h1>

      <div className="card">

        {/* Show input when no image yet */}
        {!generatedImage && (
          <>
            <h2 className="title">Enter Your Prompt</h2>

            <input
              type="text"
              className="prompt-input"
              placeholder="Describe your cartoon…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="prompt-example">
              Example: "round glasses, green hair, smiling"
            </div>

            <button className="generate-btn" onClick={handleGenerate}>
              {isLoading ? "Generating…" : "Generate ✨"}
            </button>
          </>
        )}

        {/* Show generated image */}
        {generatedImage && (
          <div className="result-section">
            <img src={generatedImage} className="result-img" alt="generated" />

            <button className="download-btn" onClick={handleDownload}>
              Download Image
            </button>

            <button className="generate-btn" onClick={() => setGeneratedImage(null)}>
              Generate Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
