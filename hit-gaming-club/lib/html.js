// lib/html.js - shared page shell + escaping (replaces the PHP templates)
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function page(title, body, activeJoin = true) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | HIT Gaming Club</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<header>
  <nav class="container">
    <a class="logo" href="/index.html">HIT<span>GAMING</span></a>
    <ul class="nav-links">
      <li><a href="/index.html">Home</a></li>
      <li><a href="/about.html">About Us</a></li>
      <li><a href="/events.html">Events</a></li>
      <li><a href="/gallery.html">Gallery</a></li>
      <li><a href="/join.html"${activeJoin ? ' class="active"' : ''}>Join / Contact</a></li>
    </ul>
  </nav>
</header>
<main>
${body}
</main>
<footer><div class="container"><p>&copy; ${new Date().getFullYear()} HIT Gaming Club</p></div></footer>
</body>
</html>`;
}

module.exports = { esc, page };
