import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signUserToken } from "../middleware/auth.js";
import { validateRegister } from "../middleware/validation.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

router.post("/register", validateRegister, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    res.status(409).json({ message: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
  });
  const token = signUserToken(user._id.toString());
  res.status(201).json({
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
    },
  });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  if (!user.password) {
    res.status(401).json({ message: "This account uses Google sign-in" });
    return;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  const token = signUserToken(user._id.toString());
  res.json({
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
    },
  });
}));

router.post("/google", asyncHandler(async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const nameRaw = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const googleId = typeof body.googleId === "string" ? body.googleId.trim() : "";
  const avatar = typeof body.avatar === "string" ? body.avatar.trim() : undefined;

  if (!email || !googleId) {
    res.status(400).json({ message: "Email and googleId are required" });
    return;
  }

  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.findOne({ email });
  }

  if (!user) {
    user = await User.create({
      name: nameRaw || email.split("@")[0] || "User",
      email,
      googleId,
      avatar,
    });
  } else {
    if (!user.googleId) {
      user.googleId = googleId;
    }
    if (nameRaw) user.name = nameRaw;
    if (avatar) user.avatar = avatar;
    await user.save();
  }

  const token = signUserToken(user._id.toString());
  res.json({
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
    },
  });
}));

export { router as authRoutes };
