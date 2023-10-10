const Category = require("../models/category");
const CategoryTranslate = require("../models/categoryTranslate");
const Mentor = require("../models/mentor");
const MentorTranslate = require("../models/mentorTranslate");
const Course = require("../models/course");
const User = require("../models/user");

const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose");
const fs = require('fs')
const decoded = require("../service/decoded");


// const all = async (req, res) => {
//     let quantity = req.query.quantity || 20;
//     let next = req.query.next || 1;
//     next = (next-1)*quantity;
//     let language = req.query.language || 'uz';
//     console.log(req.query)
//     let categories = await Category.find().sort({_id:-1}).limit(quantity).skip(next).lean();
//     categories = await Promise.all(categories.map(async item => {
//         let categoryTrans = await CategoryTranslate.findOne({catId: item._id, language: language })
//         item.title = categoryTrans.title
//         return item
//     }))
//     const count = await Category.find().count()
//     res.status(200).json({ categories, count });
// }





// Admin panel
const adminPanelAll = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    console.log(req.query)
    let courses = await Course.find().sort({_id:-1}).limit(quantity).skip(next).lean();
    courses = await Promise.all(courses.map(async item => {
        let courseCat = await Category.findOne({_id:item.category}).lean()
        let courseCategoryTrans = await CategoryTranslate.find({catId:courseCat._id}).lean();
        courseCat.categories = courseCategoryTrans;
        item.category = courseCat;

        let courseMentor = await Mentor.findOne({_id:item.mentor}).populate([
            {path:"user",model:User, select:'login role'}]).lean()
        let mentorTranslates = await MentorTranslate.find({mentorId:courseMentor._id}).lean();
        courseMentor.mentors = mentorTranslates;
        item.mentor = courseMentor;

        return item
    }))
    const count = await Course.find().count()
    res.status(200).json({ courses, count });
}


const allActive = async (req, res) => {
    try {

        let courses = await Course.find({ status:1 }).sort({_id:-1}).lean();
        courses = await Promise.all(courses.map(async item => {
            let courseTrans = await CourseTranslate.find({courseId: item._id })
            item.courses = categcourse

            let courseCat = await Category.findOne({_id:item.category}).lean()
            let courseCategoryTrans = await CategoryTranslate.find({catId:courseCat._id}).lean();
            courseCat.categories = courseCategoryTrans;
            item.category = courseCat;

            let courseMentor = await Mentor.findOne({_id:item.mentor}).populate([
                {path:"user",model:User, select:'login role'}]).lean()
            let mentorTranslates = await MentorTranslate.find({mentorId:courseMentor._id}).lean();
            courseMentor.mentors = mentorTranslates;
            item.mentor = courseMentor;

            return item
        }))

        res.status(200).json(courses);
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
            let course = await Course.findOne({_id}).lean()
            if(req.query.status) {
                course.status = parseInt(status)
            } else {
                course.status = course.status == 0 ? 1 : 0
            }
            await Course.findByIdAndUpdate(_id,course)

            let newCourse = await Course.findOne({_id:_id}).lean()
            let newCourseTrans = await CourseTranslate.find({courseId:newCourse._id}).lean();
            newCourse.courses = newCourseTrans;

            let newCorseCat = await Category.findOne({_id:newCourse.category}).lean()
            let newCourseCategoryTrans = await CategoryTranslate.find({catId:newCorseCat._id}).lean();
            newCorseCat.categories = newCourseCategoryTrans;
            newCourse.category =newCorseCat;

            let newCourseMentor = await Mentor.findOne({_id:newCourse.mentor}).populate([
                {path:"user",model:User, select:'login role'}]).lean()
            let mentorTranslates = await MentorTranslate.find({mentorId:newCourseMentor._id}).lean();
            newCourseMentor.mentors = mentorTranslates;
            newCourse.mentor =newCourseMentor;





            res.status(200).send(newCourse)
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
        let { img, title, desc, text, learn, request, degree, language, category, mentor, price } = req.body;

        const course = await new Course({ userId:userFunction.id, img, title, desc, text, learn, request, degree, language, category, mentor, price, createdAt: Date.now() } );
        await course.validate();
        await course.save();
        console.log(course)

        let newCourse = await Course.findOne({_id:course._id}).lean()

        let newCorseCat = await Category.findOne({_id:newCourse.category}).lean()
        let newCourseCategoryTrans = await CategoryTranslate.find({catId:newCorseCat._id}).lean();
        newCorseCat.categories = newCourseCategoryTrans;
        newCourse.category =newCorseCat;

        let newCourseMentor = await Mentor.findOne({_id:newCourse.mentor}).populate([
            {path:"user",model:User, select:'login role'}]).lean()
        let mentorTranslates = await MentorTranslate.find({mentorId:newCourseMentor._id}).lean();
        newCourseMentor.mentors = mentorTranslates;
        newCourse.mentor =newCourseMentor;
        return res.status(201).json(newCourse);
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
        let courses = req.body.courses;
        let { img, title, desc, text, learn, request, degree, language, category, mentor, price, } = req.body;


        let course = await Course.findOneAndUpdate({_id:_id},{ img, title, desc, text, learn, request, degree, language, category, mentor, price, updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveCourse = await Course.findOne({_id:_id}).lean();

        let newCourse = await Course.findOne({_id:course._id}).lean()
        let newCorseCat = await Category.findOne({_id:newCourse.category}).lean()
        let newCourseCategoryTrans = await CategoryTranslate.find({catId:newCorseCat._id}).lean();
        newCorseCat.categories = newCourseCategoryTrans;
        newCourse.category = newCorseCat;

        let newCourseMentor = await Mentor.findOne({_id:newCourse.mentor}).populate([
            {path:"user",model:User, select:'login role'}]).lean()
        let mentorTranslates = await MentorTranslate.find({mentorId:newCourseMentor._id}).lean();
        newCourseMentor.mentors = mentorTranslates;
        newCourse.mentor = newCourseMentor;

        res.status(200).json(newCourse);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let newCourse = await Course.findOne({_id:_id}).lean()
        let newCourseTrans = await CourseTranslate.find({courseId:newCourse._id}).lean();
        newCourse.courses = newCourseTrans;

        let newCorseCat = await Category.findOne({_id:newCourse.category}).lean()
        let newCourseCategoryTrans = await CategoryTranslate.find({catId:newCorseCat._id}).lean();
        newCorseCat.categories = newCourseCategoryTrans;
        newCourse.category =newCorseCat;

        let newCourseMentor = await Mentor.findOne({_id:newCourse.mentor}).populate([
            {path:"user",model:User, select:'login role'}]).lean()
        let mentorTranslates = await MentorTranslate.find({mentorId:newCourseMentor._id}).lean();
        newCourseMentor.mentors = mentorTranslates;
        newCourse.mentor =newCourseMentor;
        res.status(200).json(newCourse);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let course = await Course.findByIdAndDelete(_id);
        let courseTrans = await CourseTranslate.find({catId:course._id}).lean();
        courseTrans.forEach(async item => {
            let course = await CourseTranslate.findByIdAndDelete(item._id);
        })
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


// upload Img

const createImg = async  (req,res) =>{
    if (req.files) {
        let file = req.files.file
        console.log("files",req.files)
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `files/img/${uniquePreffix}_${file.name}`
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


module.exports = {  allActive, changeStatus, create, update, findOne, del, adminPanelAll, createImg, deleteImg }