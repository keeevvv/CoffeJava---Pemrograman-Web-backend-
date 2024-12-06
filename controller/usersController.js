import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


const prisma = new PrismaClient();
export const getAllUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nama: true,
        tanggalLahir: true,
        profileImage: true
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
  let formattedTanggalLahir = new Date(tanggalLahir);
  formattedTanggalLahir = formattedTanggalLahir.toISOString();
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
        user_id: newUser.id
      }
    })

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
    if (!User) return res.status(404).json({ msg: `User with email ${email} not found` });

    const match = await bcrypt.compare(password, User.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    const userId = User.id; // Mengambil UUID dari model User
    const name = User.nama;
    const emailUser = User.email;
    const profileImage =  User.profileImage;

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: userId, name, email: emailUser,profileImage }, // Pastikan id, name, dan email diteruskan ke token
      process.env.ACCESS_TOKEN,
      { expiresIn: "15d" }
    );
    const refreshToken = jwt.sign(
      { id: userId, name, email: emailUser,profileImage }, // Pastikan id, name, dan email diteruskan ke token
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
    const authHeader = req.headers["authorization"]; // Untuk Flutter

    const cookie = req.cookies["refreshToken"]; // Untuk Website

    let refreshToken;

    if (cookie) {
      refreshToken = cookie;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      refreshToken = authHeader.split(" ")[1];
    } else {
      return res.status(400).json({ message: "Token tidak ditemukan" });
    }

    // Cari token berdasarkan refreshToken di database
    const token = await prisma.token.findFirst({
      where: { RefreshToken: refreshToken },
    });

    // Jika token tidak ditemukan, kirim respons error
    if (!token) {
      return res
        .status(400)
        .json({ message: "Token tidak valid atau sudah dihapus" });
    }

    // Hapus token dari database
    await prisma.token.delete({
      where: { id: token.id },
    });

    // Jika pengguna menggunakan website, hapus cookie
    if (cookie) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
      });
    }

    // Berikan respons logout berhasil
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};


