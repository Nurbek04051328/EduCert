const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
require('dotenv').config();
const axios = require('axios');


const addadmin = async (req, res) => {
    let check = await User.findOne({login:'admin'});
    if (check){
        res.json("Ошибка, Такой админ уже есть");
    } else {
        const hashPass = await bcrypt.hash('12345', 10)
        let admin =  await new User({login:'admin', password: hashPass,role:'admin',name:'SuperAdmin', createdAt:Date.now()})
        await admin.save()
        res.json("Админ создан")
    }
}



const reg = async (req, res) => {
    if (req.body){
        let {login,password, name, avatar} = req.body
        if (login && password){
            login = login.toLowerCase();
            let check = await User.findOne({login})
            if (!check){
                const hashPass = await bcrypt.hash(password, 10)
                let user =  await new User({login, password: hashPass, role: "user", name, avatar})
                await user.save()
                res.status(201).send('success')
            } else {
                res.status(500).send('Такой ползовател есть')
            }
        } else {
            res.status(500).send('required')
        }
        return true
    }
    res.status(500).send('empty')
}



const checkLogin = async(req,res) => {
    let {login} = req.body
    if(login) {
        login = login.toLowerCase()
    }
    const user = await User.findOne({login})
    if (user) {
        return res.status(200).json("yes")
    } else {
        return res.status(200).json("no")
    }
}


const login = async (req, res) => {
    console.log(req.body)
    let {login, password} = req.body
    if (login) login = login.toLowerCase()
    const user = await User.findOne({login})
    if (!user) {
        return res.status(400).send('Пользователь не найден')
    }
    const isPassValid = bcrypt.compareSync(password, user.password)
    if (!isPassValid) {
        return res.status(400).send('В пароле ошибка')
    }
    if (user.status !== 1) {
        return res.status(404).json( "У вас нет доступа к этому сайту")
    }
    const token = jwt.sign({id: user.id}, process.env.SecretKey, {expiresIn: "1d"})
    user.loginAt.push(Date.now())
    await User.findByIdAndUpdate(user._id,user);
    let data = {
        id: user.id,
        login: user.login,
        role: user.login == 'admin' ? 'admin' : 'user',
        name: user.name
    }
    return res.status(200).send({
        token,
        user: data
    })
}

const checkUser = async (req,res) => {
    const user = await User.findOne({_id: req.user.id})
    if (!user){
        return res.status(404).json("Пользователь не найдено!")
    }
    let data = {
        id: user.id,
        login: user.login,
        role: user.login == 'admin' ? 'admin' : 'user',
        name: user.name
    }
    res.status(200).json(data)
}

const getUser = async (req, res) => {
    const user = await User.findOne({_id: req.user.id});
    const token = jwt.sign({id: user.id}, process.env.SecretKey, {expiresIn: "1d"})
    return res.json({
        token,
        user: {
            id: user.id,
            login: user.login,
        }
    })
}



const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        await User.findByIdAndDelete(_id);

        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}

module.exports = { addadmin, reg, checkLogin, login, checkUser, getUser, del }