const bcrypt = require('bcrypt');
const User = require("../models/user");
const decoded = require("../service/decoded");
const mongoose = require("mongoose");
const fs = require('fs');


const all = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let quantity = req.query.quantity || 20;
        let next = req.query.next || 1;
        next = (next-1) * quantity;
        let name = req.query.name || null;
        let users = [];
        let fil = {};
        if (name) fil = {...fil, 'name': { $regex: new RegExp( name.toLowerCase(), 'i')}};
        users = await User.find({...fil,  _id: { $ne: userFunction.id} }, '-password')
            .populate(['role'])
            .sort({_id:-1})
            .limit(quantity)
            .skip(next).lean();

        let count = await User.find({...fil, _id: { $ne: userFunction.id}}).count();
        res.status(200).json({users, count});
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}



const changeStatus = async (req, res) => {
    try {
        console.log(req.params);
        if (req.params.id) {
            const _id = req.params.id
            let status = req.query.status;
            let user = await User.findOne({_id}).lean()
            if (user) {
                if(req.query.status) {
                    user.status = parseInt(status)
                } else {
                    user.status = user.status == 0 ? 1 : 0
                }
                let upstatus = await User.findByIdAndUpdate(_id,user, {returnDocument: 'after'})
                let saveUser = await User.findOne({_id:upstatus._id}, '-password').populate(['role']).lean()
                res.status(200).send(saveUser)
            } else {
                res.status(400).send({message: "User не найдено"})
            }
        } else {
            res.status(400).send({message: "Id не найдено"})
        }
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}

const create = async (req, res) => {
    try {
        let { login, password, role, type, avatar, name, phone, status } = req.body;
        console.log(req.body)
        status = status || 1
        login = login.toLowerCase()
        const haveLogin = await User.findOne({login});  
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }
        const hashPass = await bcrypt.hash(password, 10);
        let newUser =  new User({ login, password:hashPass, role, name, phone, role, avatar, status, createdAt:Date.now() });
        await newUser.validate();
        await newUser.save();
        let findUser = await User.findOne({_id:newUser._id}, '-password').populate(['role']).lean();
        return res.status(201).json(findUser);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = {};
            for (let key in error.errors) {
                errors[key] = error.errors[key].message;
            }
            res.status(400).send(errors);
        } else {
            res.status(500).send(error);
        }
    }
}

const update = async (req, res) => {
    if (req.body._id) {
        let { _id, login, password, role, avatar, name, phone, status } = req.body;
        if(password) {
            const hashPass = await bcrypt.hash(password, 10);
            password = hashPass;
        }
        
        let saveUser = await User.findByIdAndUpdate({_id:_id},{ login, password, role, name, phone, avatar, status, updateAt:Date.now()}, {returnDocument: 'after'});
        let findUser = await User.findOne({_id:saveUser._id}, '-password').populate(['role']).lean();
        res.status(200).json(findUser);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}

const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let user = await User.findOne({_id}, '-password').populate(['role']).lean();
        res.status(200).json(user);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}

const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id
        let user = await User.findByIdAndDelete(_id);
        if (user) {
            user.avatar.forEach(item => {
                if (fs.existsSync(item)) {
                    fs.unlinkSync(item)
                }
            })
        }
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all,  changeStatus, create, update, findOne, del }