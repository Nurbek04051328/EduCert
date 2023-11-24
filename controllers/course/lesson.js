const Lesson = require("../../models/course/lesson");
const Chapter = require("../../models/course/chapter");
const User = require("../../models/user");
const decoded = require("../../service/decoded");
const kirilLotin = require("../../service/kirilLotin");
const mongoose = require("mongoose");
const fs = require('fs');


const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next - 1) * quantity;
    let title = req.query.title || null;
    let partId = req.query.partId || null;
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
    if (partId) fil = {...fil, partId};
    let lessons = await Lesson.find({...fil, status:1}).populate('chapterId').sort({_id: -1})
        .limit(quantity)
        .skip(next).lean();


    res.status(200).json(lessons);


}
// Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let chapterId = req.query.chapterId || null;
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
    if (chapterId) fil = {...fil, chapterId};
    let lessons = await Lesson.find({...fil }).populate('chapterId').sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();

    const count = await Lesson.find({...fil }).limit(quantity).count()


    res.status(200).json({ lessons, count });
}



const changeStatus = async (req, res) => {
    try {
        const _id = req.params.id
        let status = req.query.status;
        let lesson = await Lesson.findOne({_id}).lean()
        if (!lesson) {
            res.status(403).send({message: "Lesson не найдено"})
        }
        if(req.query.status) {
            lesson.status = parseInt(status)
        } else {
            lesson.status = lesson.status == 0 ? 1 : 0
        }
        await Lesson.findByIdAndUpdate(_id,lesson)
        let saveLesson = await Lesson.findOne({_id:_id}).populate('chapterId').lean()

        res.status(200).send(saveLesson)

    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let { chapterId, title, type, text, link, file, ordNumber, time } = req.body;
        let chapter = await Chapter.findOne({_id:chapterId}).lean();
        if(!chapter) return res.status(500).json({message: "Chapter по этому id не найден"});
        const lesson = await new Lesson({ userId:userFunction.id, chapterId, title, type, text, link, file, ordNumber, time, createdAt: Date.now() } );
        await lesson.validate();
        await lesson.save();

        let newLesson = await Lesson.findOne({_id:lesson._id}).populate('chapterId').lean()

        return res.status(201).json(newLesson);
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
        let findLesson = await Lesson.findOne({_id:_id}).lean();
        if(!findLesson) return res.status(500).json({message: "Lesson по этому id не найден"});
        let { chapterId, title, type, text, link, file, ordNumber, time } = req.body;
        let chapter = await Chapter.findOne({_id:chapterId}).lean();
        if(!chapter) return res.status(500).json({message: "Chapter по этому id не найден"});
        let lesson = await Lesson.findOneAndUpdate({_id:_id},{ chapterId, title, type, text, link, file, ordNumber, time, updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveLesson = await Lesson.findOne({_id:_id}).populate('chapterId').lean();

        res.status(200).json(saveLesson);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}
//
//
const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let findLesson = await Lesson.findOne({_id:_id}).lean();
        if(!findLesson) return res.status(500).json({message: "Lesson по этому id не найден"});
        let lesson = await Lesson.findOne({_id:_id}).populate('chapterId').lean();

        res.status(200).json(lesson);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    const _id = req.params.id;
    let findLesson = await Lesson.findOne({_id:_id}).lean();
    if(!findLesson) return res.status(500).json({message: "Lesson по этому id не найден"});
    await Lesson.findByIdAndDelete(_id);

    res.status(200).json(_id);
}



module.exports = { adminPanelAll, create, update, findOne, del, all, changeStatus }