import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, city, photoUrl, purse, isIcon } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'name, email, password and role are required');
  }

  const exists = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    throw new ApiError(StatusCodes.CONFLICT, 'A user with this email already exists');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name,
    email: String(email).toLowerCase(),
    password: hashed,
    role,
    phone,
    city,
    photoUrl,
    purse,
    isIcon,
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });

  res.status(StatusCodes.CREATED).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      photoUrl: user.photoUrl,
      purse: user.purse,
      isIcon: user.isIcon,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'email and password are required');
  }

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });

  res.status(StatusCodes.OK).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      purse: user.purse,
      photoUrl: user.photoUrl,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId).select('-password');
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  res.status(StatusCodes.OK).json({ success: true, user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, city, photoUrl, purse } = req.body;

  const user = await UserModel.findById(req.user?.userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (typeof name === 'string' && name.trim()) user.name = name.trim();
  if (typeof phone === 'string') user.phone = phone.trim() || undefined;
  if (typeof city === 'string') user.city = city.trim() || undefined;
  if (typeof photoUrl === 'string') user.photoUrl = photoUrl;
  if (typeof purse === 'number' && Number.isFinite(purse)) user.purse = purse;

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      purse: user.purse,
      photoUrl: user.photoUrl,
      isIcon: user.isIcon,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'currentPassword and newPassword are required');
  }

  const user = await UserModel.findById(req.user?.userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is incorrect');
  }

  if (String(newPassword).length < 6) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'New password must be at least 6 characters');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, message: 'Password changed successfully' });
});

export const forgotPasswordDemo = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required');
  }

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No account found with this email address');
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let newPassword = '';
  for (let i = 0; i < 10; i++) newPassword += chars[Math.floor(Math.random() * chars.length)];

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'A new password has been sent to your registered email address.',
    newPassword,
    demoMode: true,
  });
});
