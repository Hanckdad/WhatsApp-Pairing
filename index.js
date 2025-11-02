import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { LOGIN } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "secure-session-key",
    resave: false,
    saveUninitialized: true,
  })
);

function requireLogin(req, res, next) {
  if (req.session.loggedIn) next();
  else res.redirect("/");
}

app.get("/", (req, res) => {
  if (req.session.loggedIn) return res.redirect("/pairing");
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === LOGIN.username && password === LOGIN.password) {
    req.session.loggedIn = true;
    res.redirect("/pairing");
  } else {
    res.send("<script>alert('Username atau password salah'); window.location='/';</script>");
  }
});

app.get("/pairing", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "pairing.html"));
});

app.post("/send-code", requireLogin, (req, res) => {
  const { phone, count } = req.body;
  // Di sini hanya simulasi (tidak mengirim WhatsApp sungguhan)
  const codes = Array.from({ length: count }, () =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  res.send(`
    <h2>Pairing Code terkirim ke ${phone}</h2>
    <p>${codes.join("<br>")}</p>
    <a href="/pairing">Kembali</a>
  `);
});

app.listen(3000, () => console.log("Server berjalan di port 3000"));
