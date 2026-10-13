/* ===== HIT Gaming Club - main.js ===== */

// ---- JavaScript OBJECT: club details ----
var club = {
  name: "HIT Gaming Club",
  motto: "Press Start. Play Together.",
  founded: 2024,
  members: 120,
  email: "gaming@hit.ac.zw",
  describe: function () { return this.name + " - " + this.motto; }
};

// ---- ARRAY of OBJECTS: club events ----
var events = [
  { title: "Campus FIFA Cup",           date: "2026-10-24T14:00:00", type: "tournament", venue: "Computer Lab 3",   desc: "Knockout bracket open to all students. Winner takes the HIT Gaming trophy." },
  { title: "Retro Game Night",          date: "2026-10-30T18:00:00", type: "social",     venue: "Student Centre",   desc: "Classic consoles, snacks and friendly rivalry. Bring a friend!" },
  { title: "Intro to Game Dev (Unity)", date: "2026-11-07T10:00:00", type: "workshop",   venue: "Lecture Room B12", desc: "Build your first 2D game in a single morning. No experience needed." },
  { title: "eFootball Showdown",        date: "2026-11-14T13:00:00", type: "tournament", venue: "Computer Lab 1",   desc: "1v1 league format with live commentary and prizes." },
  { title: "Esports Strategy Seminar",  date: "2026-11-21T15:00:00", type: "workshop",   venue: "Seminar Room 2",   desc: "Team coordination, communication and mental training for competitive play." },
  { title: "End-of-Year LAN Party",     date: "2026-12-05T17:00:00", type: "social",     venue: "Main Hall",        desc: "Overnight LAN with tournaments, giveaways and music." }
];

var galleryItems = [
  { src: "images/gallery1.png", caption: "FIFA Cup finals" },
  { src: "images/gallery2.png", caption: "Retro night setup" },
  { src: "images/gallery3.png", caption: "Game dev workshop" },
  { src: "images/gallery4.png", caption: "LAN party crew" },
  { src: "images/gallery5.png", caption: "Trophy presentation" },
  { src: "images/gallery6.png", caption: "Committee meet-up" },
  { src: "images/gallery7.png", caption: "Freshers' welcome" },
  { src: "images/gallery8.png", caption: "Inter-varsity friendly" }
];

// ---- Helpers (functions, variables, operators) ----
function formatDate(iso) {
  var d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) +
         " at " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function upcomingEvents() {
  var now = new Date(), result = [];
  for (var i = 0; i < events.length; i++) {          // loop
    if (new Date(events[i].date) > now) {            // conditional
      result.push(events[i]);
    }
  }
  return result;
}

function eventCard(ev) {
  return '<article class="card" data-type="' + ev.type + '">' +
         '<span class="tag ' + ev.type + '">' + ev.type + '</span>' +
         '<h3>' + ev.title + '</h3><p>' + ev.desc + '</p>' +
         '<p class="event-meta">📅 ' + formatDate(ev.date) + '<br>📍 ' + ev.venue + '</p></article>';
}

// ---- Mobile menu (onclick event) ----
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

// ---- Home: next events + live countdown ----
function renderHome() {
  var box = document.getElementById("homeEvents");
  if (!box) return;
  var list = upcomingEvents().slice(0, 3), html = "";
  for (var i = 0; i < list.length; i++) { html += eventCard(list[i]); }
  box.innerHTML = html || "<p>No upcoming events - check back soon!</p>";

  var cd = document.getElementById("countdown");
  if (cd && list.length > 0) {
    document.getElementById("nextName").textContent = list[0].title;
    var target = new Date(list[0].date).getTime();
    var tick = function () {
      var diff = target - Date.now();
      if (diff < 0) diff = 0;
      document.getElementById("cdDays").textContent  = Math.floor(diff / 86400000);
      document.getElementById("cdHours").textContent = Math.floor(diff % 86400000 / 3600000);
      document.getElementById("cdMins").textContent  = Math.floor(diff % 3600000 / 60000);
      document.getElementById("cdSecs").textContent  = Math.floor(diff % 60000 / 1000);
    };
    tick(); setInterval(tick, 1000);
  }
  var count = document.getElementById("memberCount");
  if (count) count.textContent = club.members + "+";
}

// ---- Events page: render + filter (interactive feature) ----
function renderEvents(filter) {
  var box = document.getElementById("eventList");
  if (!box) return;
  var html = "";
  for (var i = 0; i < events.length; i++) {
    if (filter === "all" || events[i].type === filter) { html += eventCard(events[i]); }
  }
  box.innerHTML = html;
  var btns = document.querySelectorAll(".filters button");
  for (var j = 0; j < btns.length; j++) {
    btns[j].classList.toggle("active", btns[j].getAttribute("data-filter") === filter);
  }
}

// ---- Gallery + lightbox ----
function renderGallery() {
  var g = document.getElementById("gallery");
  if (!g) return;
  var html = "";
  galleryItems.forEach(function (item, i) {
    html += '<figure onclick="openLightbox(' + i + ')"><img src="' + item.src + '" alt="' + item.caption + '">' +
            '<figcaption>' + item.caption + '</figcaption></figure>';
  });
  g.innerHTML = html;
}
function openLightbox(i) {
  document.getElementById("lbImg").src = galleryItems[i].src;
  document.getElementById("lbCap").textContent = galleryItems[i].caption;
  document.getElementById("lightbox").classList.add("open");
}
function closeLightbox() { document.getElementById("lightbox").classList.remove("open"); }

// ---- Mouseover / mouseout events on committee cards ----
function highlight(el, on) { el.style.borderColor = on ? "#00e5ff" : ""; }

// ---- Join/Contact form validation ----
function setError(id, msg) {
  var field = document.getElementById(id);
  document.getElementById(id + "Err").textContent = msg;
  field.classList.toggle("invalid", msg !== "");
  return msg === "";
}

function validateForm() {
  var ok = true;
  var name = document.getElementById("fullname").value.trim();
  var reg = document.getElementById("regnumber").value.trim();
  var email = document.getElementById("email").value.trim();
  var phone = document.getElementById("phone").value.trim();
  var program = document.getElementById("program").value;
  var message = document.getElementById("message").value.trim();

  if (name.length < 3 || !/^[A-Za-z' .-]+$/.test(name)) { setError("fullname", "Enter your full name (letters only, min 3 characters)."); ok = false; } else { setError("fullname", ""); }
  if (!/^[A-Za-z0-9\/-]{5,20}$/.test(reg)) { setError("regnumber", "Enter a valid student registration number."); ok = false; } else { setError("regnumber", ""); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Enter a valid email address."); ok = false; } else { setError("email", ""); }
  if (phone !== "" && !/^\+?[0-9 ]{9,15}$/.test(phone)) { setError("phone", "Phone should be 9-15 digits (optional)."); ok = false; } else { setError("phone", ""); }
  if (program === "") { setError("program", "Please choose your programme."); ok = false; } else { setError("program", ""); }
  if (message.length > 0 && message.length < 10) { setError("message", "Message should be at least 10 characters."); ok = false; } else { setError("message", ""); }

  var consent = document.getElementById("consent");
  document.getElementById("consentErr").textContent = consent.checked ? "" : "You must agree to the club rules.";
  if (!consent.checked) ok = false;
  return ok;     // false blocks submission
}

function updateCounter() {
  var len = document.getElementById("message").value.length;
  document.getElementById("counter").textContent = len + " / 300";
}

// ---- onload event: set up the page ----
window.onload = function () {
  renderHome();
  renderEvents("all");
  renderGallery();
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
  var msg = document.getElementById("message");
  if (msg) { msg.addEventListener("input", updateCounter); updateCounter(); }
  var f = document.getElementById("joinForm");
  if (f) f.addEventListener("submit", function (e) { if (!validateForm()) e.preventDefault(); });
};
document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
