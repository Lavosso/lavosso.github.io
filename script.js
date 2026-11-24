const sectionLinks = document.querySelectorAll('.site-header .nav a[href^="#"]');

function markCurrentSection() {
  const target = document.getElementById(location.hash.slice(1)) ?? document.querySelector(':target');
  for (const link of sectionLinks) {
    const section = document.getElementById(link.hash.slice(1));
    if (target && section?.contains(target)) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

markCurrentSection();
window.addEventListener('hashchange', markCurrentSection);
