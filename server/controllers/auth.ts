import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import USERS from '../models/users';
import { Request, Response } from 'express';
import { SECRET_KEY } from '../middlewares/auth';

const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    if (!(email && password)) {
        res.status(400).send();
      }

    if (email.length == 0 ) {
        res.status(401).json({message: 'Authentication failed. Invalid Email',success: false});
        return;
    };

    const user = await USERS.findOne({email: email})
    if (!user) {
        res.status(401).json({message: 'Authentication failed. User not found',success: false});
        return;
    } else {
        const truePassword = user.password;
        if (truePassword == undefined) {
            res.json({success: false});
            return;
        } else {
            const isMatch = bcrypt.compareSync(password, truePassword);
            if (!isMatch) {
                res.status(401).json({message: 'Authentication failed. Wrong password',success: false});
                return;
            }
        }
    }

    res.status(200).send({token : jwt.sign({username: user.username, position: user.position}, SECRET_KEY, {
        expiresIn: '1 day'
    }), message:{
        username: user.username,
        position: user.position
    }, success: true});
}

export {login};