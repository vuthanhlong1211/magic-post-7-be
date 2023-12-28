import { Request, Response, NextFunction } from "express";
import USERS from "../models/users";
import { CustomRequest } from "./auth";

export const checkPosition = (requiredPosition: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const position = (req as CustomRequest).position;

        if (position == requiredPosition){
            (req as CustomRequest).position = position;
            res.sendStatus(200).send("Authorized")
            next()
        } else {
            res.status(401).send("Unauthorized");
            return;
        };
    }
}