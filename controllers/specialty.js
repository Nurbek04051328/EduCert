const Specialty = require("../models/specialty");
const SpecialtyTranslate = require("../models/specialtyTranslate");
const kirilLotin = require("../service/kirilLotin");
const User = require("../models/user");
const mongoose = require("mongoose");
const decoded = require("../service/decoded");


const all = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let login = req.query.login || 'admin'
    let language = req.query.language || 'uz';
    let user = await User.findOne({login: login }).lean();
    if (!user)  res.status(500).send({message: "Bunday logindagi foydalanuvchi topilmadi"})
    let specialties = await Specialty.find({userId:user._id, status:1}).sort({_id:-1}).limit(quantity).skip(next).lean();
    specialties = await Promise.all(specialties.map(async item => {
        let specialtyTrans = await SpecialtyTranslate.findOne({specId: item._id, language: language })
        item.title = specialtyTrans.title
        return item
    }))
    const count = await Specialty.find({userId:user._id, status:1}).limit(quantity).count()
    res.status(200).json({ specialties, count });
}


// Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    console.log(req.query)
    let title = req.query.title || null;
    let fil = {};
    let othername = kirilLotin.kirlot(title)
    if (title) {
        fil = {
            ...fil, $or: [
                {'title': {$regex: new RegExp(title.toLowerCase(), 'i')}},
                {'title': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
            ]
        }
    }
    let specialtyTrans = await SpecialtyTranslate.find({...fil })
    let specialties = await Specialty.find({userId:userFunction.id, '_id': {$in: specialtyTrans.map(val => val.specId)}})
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    const count = await Specialty.find({userId:userFunction.id, '_id': {$in: specialtyTrans.map(val => val.specId)}}).limit(quantity).count()

    specialties = await Promise.all(specialties.map(async spec => {
        spec.specialties = await SpecialtyTranslate.find({specId: spec._id});
        return spec
    }))
    res.status(200).json({ specialties, count });
}



const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let specialties = await Specialty.find({ userId:userFunction.id, status:1 }).sort({_id:-1}).lean();
        specialties = await Promise.all(specialties.map(async item => {
            let specialtyTrans = await SpecialtyTranslate.findOne({specId: item._id })
            item.specialties = specialtyTrans
            return item
        }))
        res.status(200).json(specialties);
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
            let specialty = await Specialty.findOne({_id}).lean()
            if(req.query.status) {
                specialty.status = parseInt(status)
            } else {
                specialty.status = specialty.status == 0 ? 1 : 0
            }
            await Specialty.findByIdAndUpdate(_id,specialty)
            let saveSpecialty = await Specialty.findOne({_id:_id}).lean()
            let specialtyTrans = await SpecialtyTranslate.find({specId: saveSpecialty._id })
            saveSpecialty.specialties = specialtyTrans
            res.status(200).send(saveSpecialty)
        } else {
            res.ststus(400).send({message: "Id не найдено"})
        }
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let specialties = req.body.specialties;
        const specialty = await new Specialty({ userId:userFunction.id, createdAt: Date.now() } );
        await specialty.validate();
        await specialty.save();
        if (specialties.length > 0) {
            specialties = await Promise.all(specialties.map(async item => {
                let specTrans = await new SpecialtyTranslate({ specId:specialty._id, title: item.title, language: item.language, createdAt: Date.now() });
                await specTrans.validate();
                await specTrans.save();
                return item
            }))
        }
        let newSpecialty = await Specialty.findOne({_id:specialty._id}).lean()
        let newSpecialtyTrans = await SpecialtyTranslate.find({specId:specialty._id }).lean();
        newSpecialty.specialties = newSpecialtyTrans
        return res.status(201).json(newSpecialty);
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
        let specialties = req.body.specialties;
        console.log("specialties", specialties)
        let speciality = await Specialty.findOneAndUpdate({_id:_id},{ updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveSpeciality = await Specialty.findOne({_id:_id}).lean();
        if (specialties) {
            specialties = await Promise.all(specialties.map(async item => {
                let catTrans = await SpecialtyTranslate.findOneAndUpdate({_id:item._id},{ specId:speciality._id, title: item.title, language: item.language, updatedAt: Date.now() },{returnDocument: 'after'});
                return item
            }))
            let saveSpecialityTrans = await SpecialtyTranslate.find({specId:_id }).lean();
            saveSpeciality.specialties = saveSpecialityTrans
        }
        res.status(200).json(saveSpeciality);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let specialty = await Specialty.findOne({_id:_id}).lean();
        if (!specialty) {
            res.status(403).send({message: "Specialty не найдено"})
        }
        specialty.specialties = await SpecialtyTranslate.find({specId:specialty._id}).lean();
        res.status(200).json(specialty);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let findSpecialty = await Specialty.findOne({_id:_id}).lean();
        if (!findSpecialty) {
            res.status(403).send({message: "Specialty не найдено"})
        }
        let specialty = await Specialty.findByIdAndDelete(_id);
        let specialtyTrans = await SpecialtyTranslate.find({specId:specialty._id}).lean();
        specialtyTrans.forEach(async item => {
            await SpecialtyTranslate.findByIdAndDelete(item._id);
        })
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all,  allActive, changeStatus, create, update, findOne, del, adminPanelAll }