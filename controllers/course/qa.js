const Lesson = require("../../models/course/lesson");
const Qa = require("../../models/course/qa");
const User = require("../../models/user");
const decoded = require("../../service/decoded");
const kirilLotin = require("../../service/kirilLotin");
const mongoose = require("mongoose");
const fs = require('fs');


const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next - 1) * quantity;
    let question = req.query.question || null;
    let lessonId = req.query.lessonId || null;
    let fil = {};
    let othername = kirilLotin.kirlot(question)
    if (question) {
        fil = {
            ...fil, $or: [
                {'question': {$regex: new RegExp(question.toLowerCase(), 'i')}},
                {'question': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
            ]
        }
    }
    if (lessonId) fil = {...fil, lessonId};
    let qa = await Qa.find({...fil, status:1}).populate('lessonId').sort({_id: -1})
        .limit(quantity)
        .skip(next).lean();


    res.status(200).json(qa);


}
// Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let question = req.query.question || null;
    let lessonId = req.query.lessonId || null;
    let fil = {};
    let othername = kirilLotin.kirlot(question)
    if (question) {
        fil = {
            ...fil, $or: [
                {'question': {$regex: new RegExp(question.toLowerCase(), 'i')}},
                {'question': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
            ]
        }
    }
    if (lessonId) fil = {...fil, lessonId};
    let qa = await Qa.find({...fil }).populate('lessonId').sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();

    const count = await Qa.find({...fil }).limit(quantity).count()


    res.status(200).json({ qa, count });
}



const changeStatus = async (req, res) => {
    try {
        const _id = req.params.id
        let status = req.query.status;
        let qa = await Qa.findOne({_id}).lean()
        if (!qa) {
            res.status(403).send({message: "Qa не найдено"})
        }
        if(req.query.status) {
            qa.status = parseInt(status)
        } else {
            qa.status = test.status == 0 ? 1 : 0
        }
        await Qa.findByIdAndUpdate(_id,qa)
        let saveQa = await Qa.findOne({_id:_id}).populate('lessonId').lean()

        res.status(200).send(saveQa)

    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let { lessonId, question, answer, ordNumber } = req.body;
        let lesson = await Lesson.findOne({_id:lessonId}).lean();
        if(!lesson) return res.status(500).json({message: "Lesson по этому id не найден"});
        const qa = await new Qa({ userId:userFunction.id, lessonId, question, answer, ordNumber, createdAt: Date.now() } );
        await qa.validate();
        await qa.save();

        let newQa = await Qa.findOne({_id:qa._id}).populate('lessonId').lean()

        return res.status(201).json(newQa);
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
        let findQa = await Qa.findOne({_id:_id}).lean();
        if(!findQa) return res.status(500).json({message: "Qa по этому id не найден"});
        let { lessonId, question, answer, ordNumber } = req.body;
        let lesson = await Lesson.findOne({_id:lessonId}).lean();
        if(!lesson) return res.status(500).json({message: "Lesson по этому id не найден"});
        let qa = await Qa.findOneAndUpdate({_id:_id},{ lessonId, question, answer, ordNumber, updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveQa = await Qa.findOne({_id:_id}).populate('lessonId').lean();

        res.status(200).json(saveQa);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}
//
//
const findOne = async (req, res) => {
    try {
        const _id = req.params.id;

        let qa = await Qa.findOne({_id:_id}).populate('lessonId').lean();
        if(!qa) return res.status(500).json({message: "Qa по этому id не найден"});
        res.status(200).json(qa);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    const _id = req.params.id;
    let findQa = await Qa.findOne({_id:_id}).lean();
    if(!findQa) return res.status(500).json({message: "Qa по этому id не найден"});
    await Qa.findByIdAndDelete(_id);

    res.status(200).json(_id);
}



module.exports = { adminPanelAll, create, update, findOne, del, all, changeStatus }