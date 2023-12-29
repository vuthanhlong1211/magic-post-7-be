import jwt, {Secret, JwtPayload} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const SECRET_KEY: Secret = "107686e6ae05b995de2a0513378dea7836b865832c9ce3ccf607642af6e8d508a3f5d1be3f90fd83d29b455a7929e0579825d9faa27f955430917ae1fa856c25";

interface CustomRequest extends Request {
  token: string | JwtPayload;
  username: string,
  position: string
 }

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer','').replace(" ",  '');
    // console.log(token);
    if (!token) {
      throw new Error("missing_token");
    }

   const decoded = jwt.verify(token, SECRET_KEY);
  //  console.log(decoded);
   if (!decoded) {
      throw new Error("failed_verification")
   }
   (req as CustomRequest).token = decoded;
   (req as CustomRequest).username = (decoded as JwtPayload).username;
   (req as CustomRequest).position = (decoded as JwtPayload).position;
    next();
  } catch (err) {
    if (err == "missing_token"){
      res.status(400).send('Please return token');
    } else {
      res.status(401).send('Verification failed')
    }
    
  }
};

export {auth, SECRET_KEY, CustomRequest};