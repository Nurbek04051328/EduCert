const Lesson = require("../../models/course/lesson");
const Test = require("../../models/course/test");
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
    let tests = await Test.find({...fil, status:1}).populate('lessonId').sort({_id: -1})
        .limit(quantity)
        .skip(next).lean();


    res.status(200).json(tests);


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
    let tests = await Test.find({...fil }).populate('lessonId').sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();

    const count = await Test.find({...fil }).limit(quantity).count()


    res.status(200).json({ tests, count });
}



const changeStatus = async (req, res) => {
    try {
        const _id = req.params.id
        let status = req.query.status;
        let test = await Test.findOne({_id}).lean()
        if (!test) {
            res.status(403).send({message: "Test не найдено"})
        }
        if(req.query.status) {
            test.status = parseInt(status)
        } else {
            test.status = test.status == 0 ? 1 : 0
        }
        await Test.findByIdAndUpdate(_id,test)
        let saveTest = await Test.findOne({_id:_id}).populate('lessonId').lean()

        res.status(200).send(saveTest)

    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let { lessonId, question, answer, variants, ordNumber } = req.body;
        let lesson = await Lesson.findOne({_id:lessonId}).lean();
        if(!lesson) return res.status(500).json({message: "Lesson по этому id не найден"});
        const test = await new Test({ userId:userFunction.id, lessonId, question, answer, variants, ordNumber, createdAt: Date.now() } );
        await test.validate();
        await test.save();

        let newTest = await Test.findOne({_id:test._id}).populate('lessonId').lean()

        return res.status(201).json(newTest);
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
        let findTest = await Test.findOne({_id:_id}).lean();
        if(!findTest) return res.status(500).json({message: "Test по этому id не найден"});
        let { lessonId, question, answer, variants, ordNumber } = req.body;
        let lesson = await Lesson.findOne({_id:lessonId}).lean();
        if(!lesson) return res.status(500).json({message: "Lesson по этому id не найден"});
        let test = await Test.findOneAndUpdate({_id:_id},{ lessonId, question, answer, variants, ordNumber, updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveTest = await Lesson.findOne({_id:_id}).populate('lessonId').lean();

        res.status(200).json(saveTest);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}
//
//
const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let findTest = await Test.findOne({_id:_id}).lean();
        if(!findTest) return res.status(500).json({message: "Test по этому id не найден"});
        let test = await Test.findOne({_id:_id}).populate('lessonId').lean();

        res.status(200).json(test);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    const _id = req.params.id;
    let findTest = await Test.findOne({_id:_id}).lean();
    if(!findTest) return res.status(500).json({message: "Test по этому id не найден"});
    await Test.findByIdAndDelete(_id);

    res.status(200).json(_id);
}



module.exports = { adminPanelAll, create, update, findOne, del, all, changeStatus }