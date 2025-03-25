import jwt from "jsonwebtoken"

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized, login again",
      });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decode.id;
    next();
  } catch (error) {
    console.log("Auth error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
  
  export default authUser;
  