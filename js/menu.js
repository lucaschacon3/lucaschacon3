function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-overlay");
  menu.classList.toggle("translate-x-full");
  menu.classList.toggle("translate-x-0");
  overlay.classList.toggle("hidden");
}
