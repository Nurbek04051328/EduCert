const Mentor = require("../models/mentor");
const MentorTranslate = require("../models/mentorTranslate");
const Specialty = require("../models/specialty");
const SpecialtyTranslate = require("../models/specialtyTranslate");
const kirilLotin = require("../service/kirilLotin");
const latinToKiril = require("../service/latinToKiril");
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const fs = require('fs');
const decoded = require("../service/decoded");



const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    let login = req.query.login || 'admin'
    if (login) login = login.toLowerCase()
    next = (next-1)*quantity;
    let language = req.query.language || 'uz';
    let user = await User.findOne({login: login }).lean();
    if (!user)  res.status(500).send({message: "Bunday logindagi foydalanuvchi topilmadi"})
    console.log(req.query)
    let mentors = await Mentor.find({userId:user._id, status:1}).sort({_id:-1}).limit(quantity).skip(next).lean();
    mentors = await Promise.all(mentors.map(async item => {
        let mentorTrans = await MentorTranslate.findOne({mentorId: item._id, language: language })
        item.name = mentorTrans.name
        item.lname = mentorTrans.lname
        item.text = mentorTrans.text? mentorTrans.text : ''

        let mentorSpecialties = await Specialty.findOne({_id:item.specialty }).lean();
        let mentorSpecialtiesTRans = await SpecialtyTranslate.findOne({specId: mentorSpecialties._id, language: language })
        mentorSpecialties.specialties = mentorSpecialtiesTRans.title
        return item
    }))
    const count = await Mentor.find({userId:user._id, status:1}).limit(quantity).count()
    res.status(200).json({ mentors, count });
}



const adminPanelAll = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1; 
    next = (next-1)*quantity;
    let userFunction = decoded(req,res)
    let name = req.query.name || null;
    let mentors = [];
    let fil = {};
    let othername = kirilLotin.kirlot(name)
    if (name) {
        fil = {
            ...fil, $or: [
                {'name': {$regex: new RegExp(name.toLowerCase(), 'i')}},
                {'name': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
            ]
        }
    }
    mentors = await Mentor.find({...fil, userId:userFunction.id }).populate([
        {path:"user",model:User, select:'login role'}])
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    mentors = await Promise.all(mentors.map(async item => {
        let mentorTranslates = await MentorTranslate.find({mentorId:item._id}).lean();
        let mentorSpecialties = await Specialty.findOne({_id:item.specialty }).lean();
        let mentorSpecialtiesTRans = await SpecialtyTranslate.find({specId: mentorSpecialties._id })
        mentorSpecialties.specialties = mentorSpecialtiesTRans

        item.mentors = mentorTranslates
        item.specialty = mentorSpecialties
        return item
    }))

    const count = await Mentor.find({...fil }).limit(quantity).count()
    res.status(200).json({ mentors, count });
}


const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let mentors = await Mentor.find({ userId:userFunction.id, status:1 }).lean()
        mentors = await Promise.all(mentors.map(async item => {
            let mentorTranslates = await MentorTranslate.find({mentorId:item._id}).lean();
            let mentorSpecialties = await Specialty.findOne({_id:item.specialty }).lean();
            let mentorSpecialtiesTRans = await SpecialtyTranslate.find({specId: mentorSpecialties._id })
            mentorSpecialties.specialties = mentorSpecialtiesTRans

            item.mentors = mentorTranslates
            item.specialty = mentorSpecialties
            return item
        }))
        res.status(200).json(mentors);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const changeStatus = async (req, res) => {
    try {
        if (req.params.id) {
            const _id = req.params.id
            let status = req.query.status;
            let mentor = await Mentor.findOne({_id}).populate('user').lean()
            let user = await User.findOne({_id: mentor.user._id}).lean()
            if(req.query.status) {
                mentor.status = parseInt(status)
                user.status = parseInt(status)
            } else {
                mentor.status = mentor.status == 0 ? 1 : 0
                user.status = user.status == 0 ? 1 : 0
            }
            await Mentor.findByIdAndUpdate(_id,mentor)
            await User.findByIdAndUpdate({_id: user._id},user)
            let newMentor = await Mentor.findOne({_id:_id}).populate([
                {path:"user",model:User, select:'login role status'}]).lean()
            let mentorTranslates = await MentorTranslate.find({mentorId:mentor._id}).lean();
            let mentorSpecialties = await Specialty.findOne({_id:mentor.specialty }).lean();
            let mentorSpecialtiesTRans = await SpecialtyTranslate.find({specId: mentorSpecialties._id })
            mentorSpecialties.specialties = mentorSpecialtiesTRans

            newMentor.mentors = mentorTranslates
            newMentor.specialty = mentorSpecialties

            res.status(200).send(newMentor)
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
        let userFunction = decoded(req,res)
        let { login, password, name, lname, telegram, phone, specialty, avatar } = req.body;
        login = login.toLowerCase()
        const haveLogin = await User.findOne({login});
        if (haveLogin) {
            return res.status(400).json({message: `Такой логин есть`});
        }
        const hashPass = await bcrypt.hash(password, 10);
        let newUser =  new User({ login, password:hashPass, role:'teacher' });
        await newUser.validate();
        await newUser.save();

        const mentor = await new Mentor({ userId:userFunction.id, user:newUser._id, specialty, avatar, phone, telegram} );
        await mentor.save();
        let mentorTRanslate = [
            {
                name: '',
                lname: '',
                language: 'uz'
            },
            {
                name: '',
                lname: '',
                language: 'ru'
            },
            {
                name: '',
                lname: '',
                language: 'en'
            }
        ]

        mentorTRanslate = await Promise.all(mentorTRanslate.map(async item => {
            if (item.language == 'ru' ) {
                item.name = latinToKiril.lotkir(name);
                item.lname = latinToKiril.lotkir(lname);
            } else {
                item.name = name;
                item.lname = lname;
            }

            let mentorTrans = await new MentorTranslate({ mentorId:mentor._id, name: item.name, lname:item.lname, language: item.language, createdAt: Date.now() });
            await mentorTrans.validate();
            await mentorTrans.save();
            return item
        }))


        let newMentor = await Mentor.findOne({_id:mentor._id}).populate([
            {path:"user",model:User, select:'login role'}]).lean()
        let mentorTranslates = await MentorTranslate.find({mentorId:mentor._id}).lean();
        let mentorSpecialties = await Specialty.findOne({_id:mentor.specialty }).lean();
        let mentorSpecialtiesTRans = await SpecialtyTranslate.find({specId: mentorSpecialties._id })
        mentorSpecialties.specialties = mentorSpecialtiesTRans

        newMentor.mentors = mentorTranslates
        newMentor.specialty = mentorSpecialties
        return res.status(201).json(newMentor);
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
        let _id = req.body._id;
        let { login, password, telegram, phone, specialty, avatar, lname, name, text } = req.body;
        let mentors = req.body.mentors;
        let mentor = await Mentor.findOneAndUpdate({_id:_id},{ specialty, avatar, phone, telegram }, {returnDocument: 'after'});
        let findMentor = await Mentor.findOne({_id:_id}).populate('user').lean();
        console.log(findMentor)
        let userId = findMentor.user._id;
        let user = await User.findOne({_id: userId});
        if (login) user.login = login;
        if(password) {
            const hashPass = await bcrypt.hash(password, 10);
            user.password = hashPass;
        }
        await User.findByIdAndUpdate(user._id,user);
        let saveMentor = await Mentor.findOne({_id:_id}).populate([
            {path:"user",model:User, select:'login role'}]).lean()
        let othername = latinToKiril.lotkir(name);
        let otherlname = latinToKiril.lotkir(lname);
        let findCourseTrans = await MentorTranslate.find({mentorId: _id});
        if (findCourseTrans) {
            findCourseTrans = await Promise.all(findCourseTrans.map(async item => {
                if (item.language == 'uz' || item.language == 'en') {
                    let mentorTrans = await MentorTranslate.findOneAndUpdate({_id:item._id},{ mentorId:saveMentor._id, name: name, text: text, lname: lname, updatedAt: Date.now() },{returnDocument: 'after'});
                } else {
                    let mentorTransru = await MentorTranslate.findOneAndUpdate({_id:item._id},{ mentorId:saveMentor._id, name: othername, text: text, lname: otherlname,  updatedAt: Date.now() },{returnDocument: 'after'});
                }
                
                return item
            }))
            let saveMentorTrans = await MentorTranslate.find({mentorId:_id }).lean();
            saveMentor.mentors = saveMentorTrans
            let mentorSpecialties = await Specialty.findOne({_id:mentor.specialty }).lean();
            let mentorSpecialtiesTRans = await SpecialtyTranslate.find({specId: mentorSpecialties._id })
            mentorSpecialties.specialties = mentorSpecialtiesTRans
            saveMentor.specialty = mentorSpecialties
        }
        res.status(200).json(saveMentor);

    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let newMentor = await Mentor.findOne({_id:_id}).populate([
            {path:"user",model:User, select:'login role'}]).lean()
        let mentorTranslates = await MentorTranslate.find({mentorId:newMentor._id}).lean();
        let mentorSpecialties = await Specialty.findOne({_id:newMentor.specialty }).lean();
        let mentorSpecialtiesTRans = await SpecialtyTranslate.find({specId: mentorSpecialties._id })
        mentorSpecialties.specialties = mentorSpecialtiesTRans

        newMentor.mentors = mentorTranslates
        newMentor.specialty = mentorSpecialties
        res.status(200).json(newMentor);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let findMentor = await Mentor.findOne({_id:_id}).populate('user').lean();
        let userId = findMentor.user._id;
        await Mentor.findByIdAndDelete(_id);
        await User.findByIdAndDelete({_id: userId});
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


// upload Img

const createPhoto = async  (req,res) =>{
    if (req.files) {
        let file = req.files.file
        console.log("files",req.files)
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `files/avatar/${uniquePreffix}_${file.name}`
        await file.mv(filepath)
        res.status(200).send(filepath)
    }

}

// delete Img
const deleteImg = async (req,res)=>{

    let delFiles = req.body.file
    if (fs.existsSync(delFiles)) {
        fs.unlinkSync(delFiles)
    }
    res.status(200).send({message: "Успешно"})
}


module.exports = { all, adminPanelAll,  allActive, changeStatus, create, update, findOne, del, createPhoto, deleteImg }