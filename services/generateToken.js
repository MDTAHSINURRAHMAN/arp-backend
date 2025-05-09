import jwt from "jsonwebtoken";

const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

export default generateToken;
