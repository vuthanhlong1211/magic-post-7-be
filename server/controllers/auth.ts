import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import USERS from '../models/users';
import { Request, Response } from 'express';
import { SECRET_KEY } from '../middlewares/auth';
import { Position } from '../utils/utils';
import DELIVERYPOINTS from '../models/deliveryPoints';
import GATHERINGPOINTS from '../models/gatheringPoints';

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (email === undefined || password === undefined) {
        return res.status(400).send();
    }

    if (email.length == 0) {
        return res.status(400).send({ message: 'Authentication failed. Invalid Email', success: false });
    };

    const user = await USERS.findOne({ email: email })
    if (!user) {
        res.status(401).json({ message: 'Authentication failed. User not found', success: false });
        return;
    } else {
        const truePassword = user.password;
        if (truePassword == undefined) {
            res.json({ success: false });
            return;
        } else {
            const isMatch = bcrypt.compareSync(password, truePassword);
            if (!isMatch) {
                res.status(401).json({ message: 'Authentication failed. Wrong password', success: false });
                return;
            }
        }
    }
    const position = user.position;

    let curLocation, locationType;
    if (position === Position.DeliveryPointManager) {
        curLocation = await DELIVERYPOINTS.findOne({ manager: user._id })
        locationType = "Điểm giao dịch"
    } else if (position === Position.GatheringPointManager) {
        curLocation = await GATHERINGPOINTS.findOne({ manager: user._id })
        locationType = "Điểm tập kết"
    } else if (position === Position.DeliveryPointStaff) {
        curLocation = await DELIVERYPOINTS.findOne({ staffs: { "$in": user._id } })
        locationType = "Điểm giao dịch"
    } else if (position === Position.GatheringPointStaff) {
        curLocation = await GATHERINGPOINTS.findOne({ staffs: { "$in": user._id } })
        locationType = "Điểm tập kết"
    } else {
        curLocation = {
            name: "everywhere",
        }
        locationType = "everything"
    } 
    console.log(curLocation)

    if (curLocation) {
        console.log (position)
        res.status(200).send({
            token: jwt.sign({
                username: user.username,
                position: position,
                location: curLocation.name,
                locationType: locationType
    }, SECRET_KEY, {
                expiresIn: '1 day'
            }), message: {
                username: user.username,
                position: user.position,
                location: curLocation.name,
                locationType: locationType
            }, success: true
        });
    } else res.status(400).send("location_find_failed")

}

export { login };