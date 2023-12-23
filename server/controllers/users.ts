import USERS from '../models/users';
import GATHERINGPOINTS from '../models/gatheringPoints';
import DELIVERYPOINTS from '../models/deliveryPoints';
import { hashPassword, validateEmail, validatePassword, Position, getErrorMessage } from '../utils/utils';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

const validateInput = (password: string, email: string) => {
    if (!validatePassword(password)) {
        throw Error("password_invalid");
        }

    if (!validateEmail(email)) {
        throw Error("email_invalid");
    } 
    return true;
}

const createUser = async (username: string, password: string, email: string, name: string, position: string) => {

    //causing error

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) throw Error("hashing_failed");
    const user = await USERS.create({
        username: username,
        password: hashedPassword,
        email: email,//change to hashedPassword
        name: name,
        position: position});
    if (!user) throw Error("create_user_failed");
    const userId = user._id;
    const userPosition = user.position;
    return [userId, userPosition] as const;

    
};

const createManager = async (req: Request, res: Response) => {
    const {username, password, email, name, position, location} = req.body;
    console.log(req.body);
    //location is the name of either gathering point or delivery point, based on position

    //Input validation

    //name auto-correct should be fe
    //username should be auto-generated no need for input validation
    //Validate input style
    try {
        validateInput(password, email)
    } catch (err) {
        return res.status(500).send(getErrorMessage(err));
    }
    
    if (position != Position.DeliveryPointManager && position != Position.GatheringPointManager){
        return res.status(500).send('position_invalid')
    }

    //Validate from database
    const userByEmail = await USERS.findOne({email});
    if (userByEmail) {
        return res.status(500).send('email_unavailable');
    }

    try {
        await createUser(username, password, email, name, position).then(async ([_id, position]) => {
            try {
                await assignManager(_id,position, location).then(() => {
                    return res.status(201).send("manager_created")
                });
            } catch (err) {
                return res.status(500).send(getErrorMessage(err));
            }
        });   
    } catch (err) {
        return res.status(500).send(getErrorMessage(err));
    }
}
    

const assignManager = async (userId: Types.ObjectId, position: string, location: string) => {
    if (position == Position.GatheringPointManager){
        const currentGatheringPoint = await GATHERINGPOINTS.findOne({name:location});
        if (currentGatheringPoint){
            if (currentGatheringPoint.manager){
                throw Error("manager_existed");
            }
            else {
                currentGatheringPoint.manager = userId;
                currentGatheringPoint.save()
            }
        }
    } else {
        const currentDeliveryPoint = await DELIVERYPOINTS.findOne({name:location});
        if (currentDeliveryPoint){
            if (currentDeliveryPoint.manager){
                throw Error("manager_existed");
            }
            else {
                currentDeliveryPoint.manager = userId;
                currentDeliveryPoint.save()
            }
        }
    }
    return;
}

const createStaff = async (req: Request, res: Response) => {
    const {username, password, email, name, position, location} = req.body;
    console.log(req.body);
    //location is the name of either gathering point or delivery point, based on position

    //Input validation

    //name auto-correct should be fe
    //username should be auto-generated no need for input validation
    //Validate input style
    try {
        validateInput(password, email)
    } catch (err) {
        return res.status(500).send(getErrorMessage(err));
    }
    
    if (position != Position.DeliveryPointStaff && position != Position.GatheringPointStaff){
        return res.status(500).send('position_invalid')
    }

    //Validate from database
    const userByEmail = await USERS.findOne({email});
    if (userByEmail) {
        return res.status(500).send('email_unavailable');
    }

    try {
        await createUser(username, password, email, name, position).then(async ([_id, position]) => {
            try {
                await assignStaff(_id,position, location).then(() => {
                    return res.status(201).send("manager_created")
                });
            } catch (err) {
                return res.status(500).send(getErrorMessage(err));
            }
        });   
    } catch (err) {
        return res.status(500).send(getErrorMessage(err));
    }
}
    

const assignStaff = async (userId: Types.ObjectId, position: string, location: string) => {
    if (position == Position.GatheringPointStaff){
        const currentGatheringPoint = await GATHERINGPOINTS.findOne({name:location});
        if (currentGatheringPoint){
            currentGatheringPoint.staffs.push(userId);
            currentGatheringPoint.save()
        }
    } else {
        const currentDeliveryPoint = await DELIVERYPOINTS.findOne({name:location});
        if (currentDeliveryPoint){
            currentDeliveryPoint.staffs.push(userId);
            currentDeliveryPoint.save();
        }
    }
    return;
}


//return all users
const getUsers = async (req: Request, res: Response) => {
    const users = await USERS.find();
    if (users) return users;
}

//return all users from a gathering point or a delivery point
const getUsersByLocationName = async (req: Request, res: Response) =>{
    const [name, locationType] = req.body;
    const userIDs = [];
    var users = [];
    if (locationType == "Điểm tập kết") {
        const currentLocation = await GATHERINGPOINTS.findOne({name: name});
        if (currentLocation) {
            userIDs.push(currentLocation.manager);
            for (var id of currentLocation.staffs) {
                userIDs.push(id);
            }
        }
    } else if (locationType == "Điểm giao dịch") {
        const currentLocation = await DELIVERYPOINTS.findOne({name: name});
        if (currentLocation) {
            userIDs.push(currentLocation.manager);
            for (var id of currentLocation.staffs) {
                userIDs.push(id);
            }
        }
    } else throw Error("location_type_missing")

    for (var id of userIDs) {
        userIDs.push(await USERS.findById(id))
    }

    res.status(200).send(userIDs)
}

const getUserByEmail = async (req: Request, res: Response) => {
    const email = req.body;
    const user = await USERS.findOne({email: email});
    if (user) return user;
    else throw Error("user_not_exist")
}


const deleteUser = async (req: Request, res: Response) => {
    const {email} = req.body;
    await USERS.findOneAndDelete({email: email}).then(() => {
        res.status(204).send("user_deleted")
    })
}

export {createManager, createStaff, getUsers, getUsersByLocationName, getUserByEmail};