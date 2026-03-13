// Particle System yang dioptimalkan
document.addEventListener("DOMContentLoaded", function () {
  // Cek apakah di halaman login atau dashboard
  const isLoginPage = document.querySelector(".login-card");
  const isDashboard = document.querySelector(".admin-container");

  // Non-aktifkan particle di dashboard (tidak perlu)
  if (isDashboard) {
    console.log("🚫 Particle system disabled on dashboard for performance");
    return;
  }

  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Kurangi particle count berdasarkan ukuran layar
    const particleCount = Math.min(
      40, // MAX 40 particle (dari 100)
      Math.floor((canvas.width * canvas.height) / 40000),
    );

    initParticles(particleCount);
  }

  // Particle class yang dioptimalkan
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5; // Lebih kecil
      this.speedX = Math.random() * 1 - 0.5; // Lebih lambat
      this.speedY = Math.random() * 1 - 0.5;
      this.color = this.getLightColor();
      this.alpha = Math.random() * 0.3 + 0.1; // Lebih transparan
    }

    getLightColor() {
      const colors = ["rgba(0, 217, 255, ALPHA)", "rgba(0, 255, 136, ALPHA)"];
      return colors[Math.floor(Math.random() * colors.length)].replace(
        "ALPHA",
        this.alpha,
      );
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Boundary check dengan bounce sederhana
      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0;
      if (this.y < 0) this.y = canvas.height;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let particles = [];

  function initParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  // Animation loop dengan FPS limit
  let lastTime = 0;
  const fpsLimit = 30; // Turun dari 60fps ke 30fps
  const fpsInterval = 1000 / fpsLimit;

  function animate(timestamp) {
    // Limit FPS
    if (timestamp - lastTime < fpsInterval) {
      requestAnimationFrame(animate);
      return;
    }
    lastTime = timestamp;

    // Clear dengan opacity rendah untuk efek trail
    ctx.fillStyle = "rgba(10, 10, 20, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    requestAnimationFrame(animate);
  }

  // Handle window resize dengan debounce
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 250);
  });

  // Initialize
  resizeCanvas();
  animate(0);

  console.log("✅ Optimized particle system initialized");
});
