const Database = require("better-sqlite3");
const { randomBytes } = require("crypto");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "dev.db"));

function cuid() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString("hex");
  return `c${timestamp}${random}`;
}

function now() {
  return new Date().toISOString();
}

// Clear existing data
db.exec("DELETE FROM Booking");
db.exec("DELETE FROM FinancialItem");
db.exec("DELETE FROM LegalItem");
db.exec("DELETE FROM Project");

// Projects
const insertProject = db.prepare(`
  INSERT INTO Project (id, title, status, priority, notes, dueDate, nextAction, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const projects = [
  ["Brand Identity System", "active", "high", "Developing the full visual identity for The Hous. Includes logo suite, typography system, color palette, and brand guidelines document.", "2026-05-15T00:00:00.000Z", "Review final logo variations with designer"],
  ["Website V1 \u2014 Public Landing", "active", "high", "First live web presence on housofthedarlingstarling.com. Soft launch with landing page, about section, and owner portal.", "2026-04-10T00:00:00.000Z", "Deploy to Vercel and configure DNS"],
  ["Universe Bible \u2014 Core Canon", "active", "medium", "The foundational creative document for the Hous universe. Defines the world, its rules, its characters, and its tone.", "2026-07-01T00:00:00.000Z", "Complete Chapter 3: The Rooms"],
  ["First Performance Concept", "paused", "medium", "Early concept development for the debut live performance. Paused pending completion of core canon and venue research.", null, "Resume after Universe Bible Chapter 5"],
  ["Merchandise \u2014 Initial Collection", "paused", "low", "Exploratory designs for a small initial merchandise collection. Waiting on brand identity finalization.", null, "Begin after brand identity is locked"],
  ["Social Media Strategy", "active", "medium", "Define voice, cadence, and platform strategy for The Hous across social channels.", "2026-05-01T00:00:00.000Z", "Draft content calendar for soft launch period"],
];

for (const [title, status, priority, notes, dueDate, nextAction] of projects) {
  insertProject.run(cuid(), title, status, priority, notes, dueDate, nextAction, now(), now());
}

// Legal Items
const insertLegal = db.prepare(`
  INSERT INTO LegalItem (id, title, type, status, deadline, notes, documentRef, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const legalItems = [
  ["LLC Formation \u2014 Hous of The Darling Starling", "formation", "in-progress", "2026-04-15T00:00:00.000Z", "Filing Articles of Organization. Registered agent selected. Need to finalize operating agreement.", "State filing portal"],
  ["EIN Application", "filing", "pending", "2026-04-20T00:00:00.000Z", "Apply for Employer Identification Number after LLC is approved.", null],
  ["Trademark \u2014 HOUS OF THE DARLING STARLING", "trademark", "pending", "2026-06-01T00:00:00.000Z", "Federal trademark application for the primary brand name. Need to conduct clearance search first.", "USPTO TEAS application"],
  ["Operating Agreement", "contract", "in-progress", "2026-04-15T00:00:00.000Z", "Single-member LLC operating agreement. Template sourced, needs customization for creative IP provisions.", null],
  ["Domain Registration & IP Protection", "filing", "completed", null, "housofthedarlingstarling.com registered and secured. Additional defensive domains acquired.", "Domain registrar dashboard"],
  ["Business Bank Account Setup", "formation", "pending", "2026-04-25T00:00:00.000Z", "Open dedicated business checking account. Requires EIN and LLC docs.", null],
];

for (const [title, type, status, deadline, notes, documentRef] of legalItems) {
  insertLegal.run(cuid(), title, type, status, deadline, notes, documentRef, now(), now());
}

// Financial Items
const insertFinancial = db.prepare(`
  INSERT INTO FinancialItem (id, title, category, status, amount, frequency, notes, dueDate, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const financialItems = [
  ["Domain \u2014 housofthedarlingstarling.com", "subscription", "active", 14.99, "annual", "Primary domain registration. Auto-renews.", null],
  ["Vercel Pro Hosting", "subscription", "active", 20.00, "monthly", "Production hosting for the website.", null],
  ["Figma Professional", "subscription", "active", 15.00, "monthly", "Design tool for brand identity and UI work.", null],
  ["LLC Filing Fee", "obligation", "pending", 125.00, "one-time", "State filing fee for Articles of Organization.", "2026-04-15T00:00:00.000Z"],
  ["Trademark Filing Fee (per class)", "obligation", "pending", 250.00, "one-time", "USPTO TEAS Plus filing fee. May need multiple classes.", "2026-06-01T00:00:00.000Z"],
  ["Google Workspace", "subscription", "active", 7.20, "monthly", "Business email and workspace tools.", null],
  ["Registered Agent Service", "subscription", "active", 119.00, "annual", "Statutory registered agent for the LLC.", null],
  ["Initial Branding Package \u2014 Designer", "expense", "active", 2500.00, "one-time", "Contract with designer for logo suite, brand guidelines, and initial visual assets.", null],
];

for (const [title, category, status, amount, frequency, notes, dueDate] of financialItems) {
  insertFinancial.run(cuid(), title, category, status, amount, frequency, notes, dueDate, now(), now());
}

// Bookings
const insertBooking = db.prepare(`
  INSERT INTO Booking (id, title, dateTime, endTime, location, status, notes, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const bookings = [
  ["Brand Identity Review \u2014 Designer Meeting", "2026-04-08T14:00:00.000Z", "2026-04-08T15:30:00.000Z", "Video call", "confirmed", "Review second round of logo concepts and discuss typography direction."],
  ["Attorney Consultation \u2014 LLC & IP", "2026-04-12T10:00:00.000Z", "2026-04-12T11:00:00.000Z", "Law office \u2014 Downtown", "confirmed", "Review operating agreement draft. Discuss trademark strategy and IP protection."],
  ["Photography Session \u2014 Press Kit", "2026-04-22T16:00:00.000Z", "2026-04-22T19:00:00.000Z", "Studio \u2014 TBD", "tentative", "Headshots and atmospheric photos for press kit and website."],
  ["Venue Research Visit \u2014 The Atheneum", "2026-05-05T11:00:00.000Z", "2026-05-05T13:00:00.000Z", "The Atheneum", "tentative", "Walk-through of potential performance venue. Evaluate acoustics, capacity, and ambiance."],
  ["Website V1 Launch", "2026-04-10T09:00:00.000Z", null, "Remote", "confirmed", "Go-live for housofthedarlingstarling.com. Final checks, DNS propagation, and soft announce."],
  ["Accountant Meeting \u2014 Business Setup", "2026-04-18T13:00:00.000Z", "2026-04-18T14:00:00.000Z", "Video call", "confirmed", "Discuss tax structure, bookkeeping setup, and quarterly filing requirements."],
];

for (const [title, dateTime, endTime, location, status, notes] of bookings) {
  insertBooking.run(cuid(), title, dateTime, endTime, location, status, notes, now(), now());
}

db.close();
console.log("Seed data created successfully.");
