const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const dataFile = path.join(__dirname, "data", "emails.json");
let users = [];
if (fs.existsSync(dataFile)) {
  users = JSON.parse(fs.readFileSync(dataFile));
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nekostudio84@gmail.com",
    pass: "mnqp uudy pqqe cqru"
  }
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.get("/count", (req, res) => {
  res.json({ count: users.length });
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return res.send("Неверный email.");
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.send("Этот email уже зарегистрирован.");
  }

  const code = generateCode();
  const newUser = { email, code };
  users.push(newUser);
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));

  const mailOptions = {
    from: '"Neko Studio" <nekostudio84@gmail.com>',
    to: email,
    subject: "Код подтверждения Starry Sky",
    text: `Привет!\\n\\nВы зарегистрировались в предрегистрации игры Starry Sky.\\n\\nВаш код подтверждения: ${code}\\n\\nС уважением,\\nNeko Studio`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Ошибка отправки:", error);
      return res.send("Ошибка при отправке email.");
    }
    res.send("Код отправлен на вашу почту!");
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
