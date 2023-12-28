import { Request, Response, NextFunction } from "express";
import USERS from "../models/users";
import { CustomRequest } from "./auth";

export const checkPosition = (requiredPosition: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let position = (req as CustomRequest).position;

        if (requiredPosition == "Trưởng điểm") {
            position = position.slice(0, 11)
        }

        if (position == requiredPosition){
            (req as CustomRequest).position = position;
            next()
        } else {
            res.status(401).send("Unauthorized");
            return;
        };
    }
}