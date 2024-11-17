import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const refreshToken = async (req, res) => {
  const token = req.cookies["refreshToken"] || req.headers["authorization"]?.split(" ")[1];

 
  try {
    const tokenRecord = await prisma.token.findFirst({
      where: {
        RefreshToken: token,
      },
      include: {
        user: true, 
        
      },
    });

    if (!tokenRecord) {
      return res.status(404).json({ msg: "Token not found" });
    }

    const user = tokenRecord.user;
   
    if (!tokenRecord) return res.sendStatus(403);
    jwt.verify(tokenRecord.RefreshToken, process.env.REFRESH_TOKEN, (err, decode) => {
      if (err) return res.sendStatus(403);
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          nama: user.nama,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15s" }
      );
      res.json({ accessToken });
    });
  } catch (error) {
    console.log(error);
  }
};
