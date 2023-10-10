const Lesson = require("../models/lesson");
const LessonTranslate = require("../models/lessonTranslate");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose")


const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let language = req.query.language || 'uz';
    console.log(req.query)
    let specialties = await Lesson.find().sort({_id:-1}).limit(quantity).skip(next).lean();
    specialties = await Promise.all(specialties.map(async item => {
        let LessonTrans = await LessonTranslate.findOne({specId: item._id, language: language })
        item.title = LessonTrans.title
        return item
    }))
    const count = await Lesson.find().count()
    res.status(200).json({ specialties, count });
}


// Admin panel
const adminPanelAll = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    console.log(req.query)
    let specialties = await Lesson.find().sort({_id:-1}).limit(quantity).skip(next).lean();
    specialties = await Promise.all(specialties.map(async item => {
        let LessonTrans = await LessonTranslate.find({specId: item._id })
        item.specialties = LessonTrans
        return item
    }))
    const count = await Lesson.find().count()
    res.status(200).json({ specialties, count });
}



const allActive = async (req, res) => {
    try {
        let specialties = await Lesson.find({ status:1 }).sort({_id:-1}).lean();
        specialties = await Promise.all(specialties.map(async item => {
            let LessonTrans = await LessonTranslate.findOne({specId: item._id })
            item.specialties = LessonTrans
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
            let Lesson = await Lesson.findOne({_id}).lean()
            if(req.query.status) {
                Lesson.status = parseInt(status)
            } else {
                Lesson.status = Lesson.status == 0 ? 1 : 0
            }
            await Lesson.findByIdAndUpdate(_id,Lesson)
            let saveLesson = await Lesson.findOne({_id:_id}).lean()
            let LessonTrans = await LessonTranslate.find({specId: saveLesson._id })
            saveLesson.specialties = LessonTrans
            res.status(200).send(saveLesson)
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
        let specialties = req.body.specialties;
        const Lesson = await new Lesson({ createdAt: Date.now() } );
        await Lesson.validate();
        await Lesson.save();
        if (specialties.length > 0) {
            specialties = await Promise.all(specialties.map(async item => {
                let specTrans = await new LessonTranslate({ specId:Lesson._id, title: item.title, language: item.language, createdAt: Date.now() });
                await specTrans.validate();
                await specTrans.save();
                return item
            }))
        }
        let newLesson = await Lesson.findOne({_id:Lesson._id}).lean()
        let newLessonTrans = await LessonTranslate.find({specId:Lesson._id }).lean();
        newLesson.specialties = newLessonTrans
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
        let specialties = req.body.specialties;
        console.log("specialties", specialties)
        let speciality = await Lesson.findOneAndUpdate({_id:_id},{ updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveSpeciality = await Lesson.findOne({_id:_id}).lean();
        if (specialties) {
            specialties = await Promise.all(specialties.map(async item => {
                let catTrans = await LessonTranslate.findOneAndUpdate({_id:item._id},{ specId:speciality._id, title: item.title, language: item.language, updatedAt: Date.now() },{returnDocument: 'after'});
                return item
            }))
            let saveSpecialityTrans = await LessonTranslate.find({specId:_id }).lean();
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
        let Lesson = await Lesson.findOne({_id:_id}).lean();
        Lesson.specialties = await LessonTranslate.find({specId:Lesson._id}).lean();
        res.status(200).json(Lesson);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        console.log( _id)
        let Lesson = await Lesson.findByIdAndDelete(_id);
        console.log(Lesson)
        let LessonTrans = await LessonTranslate.find({specId:Lesson._id}).lean();
        LessonTrans.forEach(async item => {
            await LessonTranslate.findByIdAndDelete(item._id);
        })
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all,  allActive, changeStatus, create, update, findOne, del, adminPanelAll }