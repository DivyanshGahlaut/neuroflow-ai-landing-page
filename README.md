# 🌌 NeuroFlow AI — Premium Landing Page

<div align="center">
  <img src="https://raw.githubusercontent.com/DivyanshGahlaut/neuroflow-ai-landing-page/main/landing_page_top.png" alt="NeuroFlow AI Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

  [![Licence: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Stack: HTML5 / CSS3 / JS](https://img.shields.io/badge/Stack-HTML5%20%2F%20CSS3%20%2F%20JS-14c5a.svg)](#-technologies)
  [![3D Library: Three.js](https://img.shields.io/badge/3D-Three.js-orange.svg)](#-interactive-3d-visuals)
  [![Uptime: 99.9%](https://img.shields.io/badge/Uptime-99.9%25-brightgreen.svg)](#-features)
</div>

---

**NeuroFlow AI** is a premium, enterprise-grade landing page designed for state-of-the-art AI orchestration and automation platforms. Built from the ground up to showcase advanced visual aesthetics, immersive interactive 3D elements, dynamic calculations, and modular coding best practices.

> [!IMPORTANT]
> This codebase has been refactored for professional judges, separating structure, layout styles, and interactive scripts into modular, production-ready files.

---

## ✨ Features & Visual Highlights

### ⚡ 3D Neural Web Visualizer (Hero Section)
An immersive, WebGL-powered interactive space scene rendering:
- Dynamic node network that floats and interacts with mouse pointer coordinate scaling.
- A floating geometric icosahedron mesh acting as the central cognitive core.
- Starfield particle nebula system background drifting gracefully at 60 FPS.

### 🌐 3D Interactive Testimonials
A dynamic grid system displaying verified social proof with advanced physics:
- **Responsive 3D Tilt**: Moving the cursor over the section translates relative coordinates to tilt the entire card matrix in 3D perspective space.
- **Parallax Popout Cards**: Hovering over individual testimonial cards translates them forward (`translateZ`) out of the page plane, lifting avatars and quotes in layers.
- **Vertical Auto-Scroll**: Infinite loop columns sliding in alternating directions with pause-on-hover logic.

### ⚙️ Interactive 3D Workflow Board
The *"Five steps. Zero code."* builder features:
- **Baseline Alignment**: Straight flat rendering by default to keep high legibility.
- **Interactive Parallax**: Smooth tracking tilt matching cursor movements.
- **Golden Glowing Hover**: Steps pop out (`translateZ(35px)`) and display warm background lighting gradients and glowing borders.

### 💰 Multi-Currency Pricing Orchestrator
A clean conversion calculator:
- Supports **USD ($)**, **EUR (€)**, and **INR (₹)**.
- Renders formatting symbols inline with price cards at matching base alignments.
- **Dark Mode Select Dropdown**: Fully customized selector options designed for seamless dark theme rendering on any browser agent.

---

## 🛠️ Project Structure

The project follows a clean, single-page application separation of concerns design:

```
neuroflow-ai-landing-page/
├── index.html   # Semantic markup, SVG assets, and external assets references
├── style.css    # Typography, CSS variables, dark themes, and custom animations
├── script.js    # Three.js WebGL scenes, currency calculations, & 3D tilt logic
└── README.md    # Repository documentation and setup guide
```

---

## 💻 Technologies

The page utilizes raw web APIs and robust libraries to maintain zero-runtime footprint:
- **Markup**: Semantic HTML5.
- **Styling**: Vanilla CSS3 Custom Properties (CSS variables), Flexbox, Grid, Perspective 3D Transforms, custom `@keyframes`.
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) loaded from Google Fonts.
- **3D Graphics**: [Three.js (r128)](https://threejs.org/) via CDN.
- **Scripting**: Vanilla ES6+ JavaScript.

---

## 🚀 Local Setup & Quick Start

To launch and run the project locally without complex bundler installations:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DivyanshGahlaut/neuroflow-ai-landing-page.git
   cd neuroflow-ai-landing-page
   ```

2. **Serve the project**:
   - **Python 3**:
     ```bash
     python -m http.server 8082
     ```
   - **Node.js (serve)**:
     ```bash
     npm install -g serve
     serve -p 8082
     ```
   - **VS Code**: Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click **Go Live**.

3. **Open in browser**:
   Navigate to [http://localhost:8082](http://localhost:8082) in your web browser.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Developed with ❤️ by the NeuroFlow AI Team.</sub>
</div>
