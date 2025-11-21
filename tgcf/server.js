const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({ success: true, user: { username, role: "admin" } });
  } else if (username === "user1" && password === "user123") {
    res.json({ success: true, user: { username, role: "user" } });
  } else {
    res.json({ success: false, message: "用户名或密码错误" });
  }
});

app.post("/api/register", (req, res) => {
  res.json({ success: true, message: "注册成功" });
});

app.listen(3003, () => console.log("Server running on port 3003"));