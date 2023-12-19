const USERS = require('../models/users');
const GATHERINGPOINTS = require('../models/gatheringPoints')
const DELIVERYPOINTS = require('../models/deliveryPoints')
const {hashPassword, validateEmail, validatePassword} = require('../utils/utils');

const createUser = async (username, password, email, name, position) => {

    //causing error
    // const hashedPassword = await hashPassword(password);
    
    // await USERS.create({username, password: hashedPassword, email, name, position});
    const createdUser = await USERS.create({
        username: username,
        password: password,
        email: email,
        name: name,
        position: position});

    return createdUser;
};

const createManager = async (req, res) => {
    const {username, password, email, name, position, location} = req.body;
    console.log(req.body);
    //location is the name of either gathering point or delivery point, based on position

    //Input validation

    //name auto-correct deligated to front-end
    //username should be auto-generated 
    //possibly no need for input validation
    //Validate input style
    if (!validatePassword(password)) {
        return res.json({message: 'password_invalid'});
    }

    if (!validateEmail(email)) {
        return res.json({message: 'email_invalid'});
    } 

    if (position != "Trưởng điểm tập kết" && position != "Trưởng điểm giao dịch"){
        return res.json({message: 'position_invalid'})
    }

    //Validate from database
    const userByUsername = await USERS.findOne({username});
    if (userByUsername) {
        return res.json({message: 'username_unavailable'});
    }

    const userByEmail = await USERS.findOne({email});
    if (userByEmail) {
        return res.json({message: 'email_unavailable'});
    }

    const createdUser = await createUser(username, password, email, name, position);
    await assignManager(createdUser, location);
    
    return res.json({message: "manager_created"})
}

const assignManager = async (user, location) => {
    if (user.position == "Trưởng điểm tập kết") {
        try {
            const gatheringPoint = await GATHERINGPOINTS.findOne({ name: location });
            const currentManager = await gatheringPoint.populate('manager');
            if (currentManager != null) {
                console.log("Manager existed");
                return;
            } else {
                gatheringPoint.manager = user;
                await gatheringPoint.save().then(() => {
                    console.log("Manager saved");
                });

            }
        } catch (err) {
            console.log("Failed manager assignment to selected gathering point");
        }
    } else if (user.position == "Trưởng điểm giao dịch") {
        try {
            const deliveryPoint = await DELIVERYPOINTS.findOne({ name: location });
            const currentManager = await deliveryPoint.populate('manager');
            if (currentManager != null) {
                console.log("Manager existed");
                return;
            } else {
                deliveryPoint.manager = user;
                await deliveryPoint.save().then(() => {
                    console.log("Manager saved");
                });
            }
        } catch (err) {
            console.log("Failed manager assignment to selected gathering point");
        }
    } 
}

const createStaff = async (req, res) => {
    const {username, password, email, name, position, location} = req.body;
    console.log(req.body);
    //location is the name of either gathering point or delivery point, based on position

    //Input validation

    //name auto-correct deligated to front-end
    //username should be auto-generated 
    //possibly no need for input validation
    //Validate input style
    if (!validatePassword(password)) {
        return res.json({message: 'password_invalid'});
    }

    if (!validateEmail(email)) {
        return res.json({message: 'email_invalid'});
    } 

    if (position != "Trưởng điểm tập kết" && position != "Trưởng điểm giao dịch"){
        return res.json({message: 'position_invalid'})
    }

    //Validate from database
    const userByUsername = await USERS.findOne({username});
    if (userByUsername) {
        return res.json({message: 'username_unavailable'});
    }

    const userByEmail = await USERS.findOne({email});
    if (userByEmail) {
        return res.json({message: 'email_unavailable'});
    }

    const createdUser = await createUser(username, password, email, name, position);
    await assignStaff(createdUser, location);
    
    return res.json({message: "staff_created"})
}

const assignStaff = async (user, location) => {
    if (user.position == "Nhân viên điểm tập kết") {
        try {
            const gatheringPoint = await GATHERINGPOINTS.findOne({ name: location });
            const staffs = await gatheringPoint.populate('staffs')
            console.log(staffs);
            const staff = await staffs.findOne({email: user.email});
            if (staff) {
                console.log("Staff already assigned");
                return;
            } else {
                gatheringPoint.staffs.push(user);
                await gatheringPoint.save().then(() => {
                    console.log("Staff saved");
                });
            }
        } catch (err) {
            console.log("Failed staff assignment to selected gathering point");
        }
    } else if (user.position == "Giao dịch viên") {
        try {
            const deliveryPoint = await DELIVERYPOINTS.findOne({ name: location });
            const staffs = await deliveryPoint.populate('staffs')
            console.log(staffs);
            const staff = await staffs.findOne({email: user.email});
            if (staff) {
                console.log("Staff already assigned");
                return;
            } else {
                deliveryPoint.staffs.push(user);
                await deliveryPoint.save().then(() => {
                    console.log("Staff saved");
                });
            }
        } catch (err) {
            console.log("Failed staff assignment to selected delivery point");
        }
    } 
}

module.exports = {createManager, createStaff};