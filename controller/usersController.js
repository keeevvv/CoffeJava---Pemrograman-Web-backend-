import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import cloudinary from "cloudinary";
import { jwtDecode } from "jwt-decode";

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const prisma = new PrismaClient();
export const getAllUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nama: true,
        tanggalLahir: true,
        profileImage: true,
      },
    });
    res.status(200).json(users); // Mengirimkan data users dalam bentuk JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const Register = async (req, res) => {
  const { nama, email, password, confirmPassword, gender, tanggalLahir } =
    req.body;
  try {
    let formattedTanggalLahir = new Date(tanggalLahir);
    formattedTanggalLahir = formattedTanggalLahir.toISOString();
    updateData.tanggalLahir = formattedTanggalLahir;
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "please input the correct format of yyyy-mm-dd" });
  }
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ msg: "Password and confirm password do not match" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ msg: `User with email ${email} already exists` });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        nama,
        password: hashPassword,
        tanggalLahir: formattedTanggalLahir,
        gender,
      },
    });

    await prisma.cart.create({
      data: {
        user_id: newUser.id,
      },
    });

    return res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "An error occurred while registering the user" });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const User = await prisma.user.findUnique({ where: { email } });
    if (!User)
      return res
        .status(404)
        .json({ msg: `User with email ${email} not found` });

    const match = await bcrypt.compare(password, User.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    const userId = User.id; // Mengambil UUID dari model User
    const name = User.nama;
    const emailUser = User.email;
    const profileImage = User.profileImage;
    const tanggalLahir = User.tanggalLahir;

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: userId, name, email: emailUser, profileImage, tanggalLahir },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15d" }
    );
    const refreshToken = jwt.sign(
      { id: userId, name, email: emailUser, profileImage, tanggalLahir },
      process.env.REFRESH_TOKEN,
      { expiresIn: "30d" }
    );

    // Store refresh token in database
    await prisma.token.create({
      data: {
        userId: userId,
        RefreshToken: refreshToken,
      },
    });

    // Set refresh token in cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send access token in response
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const Logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    const cookie = req.cookies["refreshToken"];

    let refreshToken;

    if (cookie) {
      refreshToken = cookie;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      refreshToken = authHeader.split(" ")[1];
    } else {
      return res.status(400).json({ message: "Token tidak ditemukan" });
    }

    const token = await prisma.token.findFirst({
      where: { RefreshToken: refreshToken },
    });

    if (!token) {
      return res
        .status(400)
        .json({ message: "Token tidak valid atau sudah dihapus" });
    }

    await prisma.token.delete({
      where: { id: token.id },
    });

    if (cookie) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
      });
    }

    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const editUser = async (req, res) => {
  const { id } = req.params;
  const { nama, email, gender, tanggalLahir } = req.body;
  const cookie = req.cookies["refreshToken"];
  const curentUser = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwtDecode(curentUser);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (existingUser.id != decoded.id) {
      return res.status(403).json({ msg: "you can oly edit your account" });
    }

    if (!existingUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const updateData = {};

    if (nama) updateData.nama = nama;
    if (email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email },
      });

      if (emailExists && emailExists.id !== existingUser.id) {
        return res.status(400).json({ msg: "Email is already taken" });
      }

      updateData.email = email;
    }
    if (gender) updateData.gender = gender;

    if (tanggalLahir) {
      try {
        let formattedTanggalLahir = new Date(tanggalLahir);
        formattedTanggalLahir = formattedTanggalLahir.toISOString();
        updateData.tanggalLahir = formattedTanggalLahir;
      } catch (error) {
        return res
          .status(400)
          .json({ msg: "please input the correct format of yyyy-mm-dd" });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: "No valid fields to update" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    const accessToken = jwt.sign(
      {
        id: updatedUser.id,
        name: updatedUser.nama,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        tanggalLahir: updatedUser.tanggalLahir,
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15d" }
    );

    const refreshToken = jwt.sign(
      {
        id: updatedUser.id,
        name: updatedUser.nama,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        tanggalLahir: updatedUser.tanggalLahir,
      },
      process.env.REFRESH_TOKEN,
      { expiresIn: "30d" }
    );

    await prisma.token.updateMany({
      where: {
        RefreshToken: cookie,
        userId: id,
      },
      data: {
        RefreshToken: refreshToken,
      },
    });

    res.clearCookie("refreshToken");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      msg: "User updated successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const changeProfile = async (req, res) => {
  const { id } = req.params;
  const filePath = req.file.path;
  const cookie = req.cookies["refreshToken"];
  const curentUser = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwtDecode(curentUser);
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (existingUser.id != decoded.id) {
      return res.status(403).json({ msg: "you can oly edit your account" });
    }

    if (!existingUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    cloudinary.v2.uploader.upload(filePath, async (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Upload failed", error });
      }

      const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
          profileImage: result.secure_url,
        },
      });

      const accessToken = jwt.sign(
        {
          id: updatedUser.id,
          name: updatedUser.nama,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          tanggalLahir: updatedUser.tanggalLahir,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15d" }
      );

      const refreshToken = jwt.sign(
        {
          id: updatedUser.id,
          name: updatedUser.nama,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          tanggalLahir: updatedUser.tanggalLahir,
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: "30d" }
      );

      await prisma.token.updateMany({
        where: {
          RefreshToken: cookie,
          userId: id,
        },
        data: {
          RefreshToken: refreshToken,
        },
      });

      res.clearCookie("refreshToken");

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(200).json({
        msg: "User updated successfully",
        accessToken,
        refreshToken,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ msg: "New password and confirm new password do not match" });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id },
      data: { password: hashPassword },
    });

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
