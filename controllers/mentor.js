const Mentor = require("../models/mentor");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose")


const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1; 
    next = (next-1)*quantity;
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
    mentors = await Mentor.find({...fil })
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    const count = await Mentor.find({...fil }).count()
    res.status(200).json({ mentors, count });
}


const allActive = async (req, res) => {
    try {
        let mentors = await Mentor.find({ status:1 }).lean()
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
            let mentor = await Mentor.findOne({_id}).lean()
            if(req.query.status) {
                mentor.status = parseInt(status)
            } else {
                mentor.status = mentor.status == 0 ? 1 : 0
            }
            await Mentor.findByIdAndUpdate(_id,mentor)
            let saveMentor = await Mentor.findOne({_id:_id}).lean()
            res.status(200).send(saveMentor)
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
        req.body.createdTime = Date.now()
        const mentor = await new Mentor({...req.body} );
        await mentor.validate();
        await mentor.save();
        let newMentor = await Mentor.findOne({_id:mentor._id}).lean()
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
        req.body.updateTime = Date.now()
        let mentor = await Mentor.findOneAndUpdate({_id:_id},{ ...req.body }, {returnDocument: 'after'});
        let saveMentor = await Mentor.findOne({_id:mentor._id}).lean();
        res.status(200).json(saveMentor);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let mentor = await Mentor.findOne({_id:_id}).lean();
        res.status(200).json(mentor);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        await Mentor.findByIdAndDelete(_id);
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all,  allActive, changeStatus, create, update, findOne, del }