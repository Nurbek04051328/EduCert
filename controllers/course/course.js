const Category = require("../../models/category");
const CategoryTranslate = require("../../models/categoryTranslate");
////
const Degree = require("../../models/degree");
const DegreeTranslate = require("../../models/degreeTranslate");
////
const Mentor = require("../../models/mentor");
const MentorTranslate = require("../../models/mentorTranslate");
///
const Course = require("../../models/course/course");
const User = require("../../models/user");
const Part = require("../../models/course/part");
const Chapter = require("../../models/course/chapter");
const Lesson = require("../../models/course/lesson");
const Test = require("../../models/course/test");
const Qa = require("../../models/course/qa");


const kirilLotin = require("../../service/kirilLotin");
const mongoose = require("mongoose");
const fs = require('fs')
const decoded = require("../../service/decoded");





const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    let language = req.query.language || 'uz';
    next = (next-1)*quantity;
    let courses = await Course.find({language:language}).sort({_id:-1}).limit(quantity).skip(next).lean();
    courses = await Promise.all(courses.map(async item => {
        let newCorseCat = await Category.findOne({_id:item.category}).select(['_id', 'title']).lean()
        let newCourseCategoryTrans = await CategoryTranslate.findOne({catId:newCorseCat._id, language: language}).lean();
        newCorseCat.title = newCourseCategoryTrans.title;
        item.category = newCorseCat;
        let newCorseDegree = await Degree.findOne({_id:item.degree}).select(['_id', 'title']).lean()
        let newCourseDegreeTrans = await DegreeTranslate.findOne({degreeId:newCorseDegree._id, language: language}).lean();
        newCorseDegree.title = newCourseDegreeTrans.title;
        item.degree = newCorseDegree;
        let newCourseMentor = await Mentor.findOne({_id:item.mentor}).select(['_id', 'name', 'lname', 'avatar']).lean()
        let mentorTranslate = await MentorTranslate.findOne({mentorId:newCourseMentor._id, language: language}).lean();
        newCourseMentor.name = mentorTranslate.name;
        newCourseMentor.lname = mentorTranslate.lname;
        item.mentor = newCourseMentor;

        return item
    }))
    const count = await Course.find({language:language}).limit(quantity).count()
    res.status(200).json({ courses, count });
}





// Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    let language = req.query.language || 'uz';
    next = (next-1)*quantity;
    let courses = await Course.find({userId:userFunction.id,}).sort({_id:-1}).limit(quantity).skip(next).lean();
    courses = await Promise.all(courses.map(async item => {
        let newCorseCat = await Category.findOne({_id:item.category}).select(['_id', 'title']).lean()
        let newCourseCategoryTrans = await CategoryTranslate.findOne({catId:newCorseCat._id, language: language}).lean();
        newCorseCat.title = newCourseCategoryTrans.title;
        item.category = newCorseCat;
        let newCorseDegree = await Degree.findOne({_id:item.degree}).select(['_id', 'title']).lean()
        let newCourseDegreeTrans = await DegreeTranslate.findOne({degreeId:newCorseDegree._id, language: language}).lean();
        newCorseDegree.title = newCourseDegreeTrans.title;
        item.degree = newCorseDegree;
        let newCourseMentor = await Mentor.findOne({_id:item.mentor}).select(['_id', 'name', 'lname', 'avatar']).lean()
        let mentorTranslate = await MentorTranslate.findOne({mentorId:newCourseMentor._id, language: language}).lean();
        newCourseMentor.name = mentorTranslate.name;
        newCourseMentor.lname = mentorTranslate.lname;
        item.mentor = newCourseMentor;

        return item
    }))
    const count = await Course.find().limit(quantity).count()
    res.status(200).json({ courses, count });
}


const allActive = async (req, res) => {
    try {
        let quantity = req.query.quantity || 20;
        let next = req.query.next || 1;
        next = (next-1)*quantity;
        let language = req.query.language || 'uz';
        let userFunction = decoded(req,res)
        let courses = await Course.find({userId:userFunction.id, status: 1}).select(['_id', 'img', 'title', 'degree', 'category', 'mentor', 'price', 'status']).sort({_id:-1}).limit(quantity).skip(next).lean();
        courses = await Promise.all(courses.map(async item => {
            let newCorseCat = await Category.findOne({_id:item.category}).select(['_id', 'title']).lean()
            let newCourseCategoryTrans = await CategoryTranslate.findOne({catId:newCorseCat._id, language: language}).lean();
            newCorseCat.title = newCourseCategoryTrans.title;
            item.category = newCorseCat;
            let newCorseDegree = await Degree.findOne({_id:item.degree}).select(['_id', 'title']).lean()
            let newCourseDegreeTrans = await DegreeTranslate.findOne({degreeId:newCorseDegree._id, language: language}).lean();
            newCorseDegree.title = newCourseDegreeTrans.title;
            item.degree = newCorseDegree;
            let newCourseMentor = await Mentor.findOne({_id:item.mentor}).select(['_id', 'name', 'lname', 'avatar']).lean()
            let mentorTranslate = await MentorTranslate.findOne({mentorId:newCourseMentor._id, language: language}).lean();
            newCourseMentor.name = mentorTranslate.name;
            newCourseMentor.lname = mentorTranslate.lname;
            item.mentor = newCourseMentor;

            return item
        }))

        res.status(200).json(courses);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}



const byCat = async (req, res) => {
    try {
        const _id = req.params.id;
        let language = req.query.language || 'uz';
        let type = req.query.type || null
        let fil = {};
        if (type) fil = {...fil, type};
        let category = await Category.findOne({_id:_id}).lean();
        let newCourseCategoryTrans = await CategoryTranslate.findOne({catId:category._id, language: language}).lean();
        category.title = newCourseCategoryTrans.title
        category.courses = await Course.find({status: 1, category: category, ...fil}).select(['_id', 'img', 'title', 'degree', 'price', 'category', 'type', 'mentor']).sort({_id:-1}).lean();
        category.allSum = 0
        category.countCourse = await Course.find({status: 1, category: category}).count();
        category.courses = await Promise.all(category.courses.map(async item => {
            category.allSum  += item.price
            let newCorseDegree = await Degree.findOne({_id:item.degree}).select(['_id', 'title']).lean()
            let newCourseDegreeTrans = await DegreeTranslate.findOne({degreeId:newCorseDegree._id, language: language}).lean();
            newCorseDegree.title = newCourseDegreeTrans.title;
            item.degree = newCorseDegree;
            let newCourseMentor = await Mentor.findOne({_id:item.mentor}).select(['_id', 'name', 'lname', 'avatar']).lean()
            let mentorTranslate = await MentorTranslate.findOne({mentorId:newCourseMentor._id, language: language}).lean();
            newCourseMentor.name = mentorTranslate.name;
            newCourseMentor.lname = mentorTranslate.lname;
            item.mentor = newCourseMentor;

            return item
        }))

        res.status(200).json(category);
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
            let language = newCourse.language
            let newCorseCat = await Category.findOne({_id:newCourse.category}).lean()
            let newCourseCategoryTrans = await CategoryTranslate.findOne({catId:newCorseCat._id, language: language}).lean();
            newCorseCat.title = newCourseCategoryTrans.title;
            newCourse.category = newCorseCat;
            let newCorseDegree = await Degree.findOne({_id:newCourse.degree}).lean()
            let newCourseDegreeTrans = await DegreeTranslate.findOne({degreeId:newCorseDegree._id, language: language}).lean();
            newCorseDegree.title = newCourseDegreeTrans.title;
            newCourse.degree = newCorseDegree;
            let newCourseMentor = await Mentor.findOne({_id:newCourse.mentor}).select(['_id', 'name', 'lname', 'avatar']).lean()
            let mentorTranslate = await MentorTranslate.findOne({mentorId:newCourseMentor._id, language: language}).lean();
            newCourseMentor.name = mentorTranslate.name;
            newCourseMentor.lname = mentorTranslate.lname;
            newCourse.mentor = newCourseMentor;

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
        let { img, title, desc, text, learn, request, degree, language, category, mentor, price, sale, sertifikat, type, comment, intro, parts } = req.body;
        console.log("body",req.body)
        const course = await new Course({ userId:userFunction.id, img, title, desc, text, learn, request, degree, language, category, mentor, price, sale, sertifikat, type, comment, intro, createdAt: Date.now() } );
        await course.validate();
        await course.save();
        let findCourse = await Course.findOne({_id:course._id}).lean()
        // forEach Parts
         if (parts.length>0) {
             parts.forEach(async (part, index) => {
                 const savePart = await new Part({ userId:userFunction.id,courseId:findCourse._id, title: part.title, ordNumber:index, createdAt: Date.now() });
                 await savePart.validate();
                 await savePart.save();
                 if (part.chapters.length>0 && savePart) {
                     part.chapters.forEach(async (chapter, index) => {
                         const saveChapter = await new Chapter({ userId:userFunction.id, partId:savePart._id, title: chapter.title, ordNumber:index, createdAt: Date.now() });
                         await saveChapter.validate();
                         await saveChapter.save();
                         if (chapter.lessons.length> 0 && saveChapter) {
                             chapter.lessons.forEach(async (lesson, index) => {
                                 const saveLesson = await new Lesson({ userId:userFunction.id,chapterId:saveChapter._id, ordNumber:index, createdAt: Date.now(), ...lesson });
                                 await saveLesson.validate();
                                 await saveLesson.save();
                                 if (lesson.tests?.length>0 && saveLesson) {
                                     lesson.tests.forEach(async (test, index) => {
                                         const saveTest = await new Test({ userId:userFunction.id, lessonId:saveLesson._id, question: test.question, answer: test.answer, variants: test.variants, ordNumber:index, createdAt: Date.now() });
                                         await saveTest.validate();
                                         await saveTest.save();

                                     })
                                 }
                                 if (lesson.qa?.length>0 && saveLesson){
                                     lesson.qa.forEach(async (qa, index) => {
                                         const saveQa = await new Qa({ userId:userFunction.id, lessonId:saveLesson._id, question: qa.question, answer: qa.answer, ordNumber:index, createdAt: Date.now() });
                                         await saveQa.validate();
                                         await saveQa.save();

                                     })
                                 }

                             })
                         }
                     })
                 }

             })
         }



        let newCourse = await Course.findOne({_id:course._id}).lean()
        let newCorseCat = await Category.findOne({_id:newCourse.category}).select(['_id', 'title']).lean()
        let newCourseCategoryTrans = await CategoryTranslate.findOne({catId:newCorseCat._id, language: language}).lean();
        newCorseCat.title = newCourseCategoryTrans.title;
        newCourse.category = newCorseCat;
        let newCorseDegree = await Degree.findOne({_id:newCourse.degree}).select(['_id', 'title']).lean()
        let newCourseDegreeTrans = await DegreeTranslate.findOne({degreeId:newCorseDegree._id, language: language}).lean();
        newCorseDegree.title = newCourseDegreeTrans.title;
        newCourse.degree = newCorseDegree;
        let newCourseMentor = await Mentor.findOne({_id:newCourse.mentor}).select(['_id', 'name', 'lname', 'avatar']).lean()
        let mentorTranslate = await MentorTranslate.findOne({mentorId:newCourseMentor._id, language: language}).lean();
        newCourseMentor.name = mentorTranslate.name;
        newCourseMentor.lname = mentorTranslate.lname;
        newCourse.mentor = newCourseMentor;
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
        let { _id, img, title, desc, text, learn, request, degree, language, category, mentor, price, sale, sertifikat, type, comment, intro } = req.body;


        let course = await Course.findOneAndUpdate({_id:_id},{ img, title, desc, text, learn, request, degree, language, category, mentor, price, sale, sertifikat, type, comment, intro, updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveCourse = await Course.findOne({_id:_id}).lean();

        let newCourse = await Course.findOne({_id:course._id}).lean()
        let newCorseCat = await Category.findOne({_id:newCourse.category}).select(['_id', 'title']).lean()
        let newCourseCategoryTrans = await CategoryTranslate.findOne({catId:newCorseCat._id, language: language}).lean();
        newCorseCat.title = newCourseCategoryTrans.title;
        newCourse.category = newCorseCat;
        let newCorseDegree = await Degree.findOne({_id:newCourse.degree}).select(['_id', 'title']).lean()
        let newCourseDegreeTrans = await DegreeTranslate.findOne({degreeId:newCorseDegree._id, language: language}).lean();
        newCorseDegree.title = newCourseDegreeTrans.title;
        newCourse.degree = newCorseDegree;
        let newCourseMentor = await Mentor.findOne({_id:newCourse.mentor}).select(['_id', 'name', 'lname', 'avatar']).lean()
        let mentorTranslate = await MentorTranslate.findOne({mentorId:newCourseMentor._id, language: language}).lean();
        newCourseMentor.name = mentorTranslate.name;
        newCourseMentor.lname = mentorTranslate.lname;
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
        let language = newCourse.language
        let newCorseCat = await Category.findOne({_id:newCourse.category}).lean()
        let newCourseCategoryTrans = await CategoryTranslate.findOne({catId:newCorseCat._id, language: language}).lean();
        newCorseCat.title = newCourseCategoryTrans.title;
        newCourse.category = newCorseCat;
        let newCorseDegree = await Degree.findOne({_id:newCourse.degree}).lean()
        let newCourseDegreeTrans = await DegreeTranslate.findOne({degreeId:newCorseDegree._id, language: language}).lean();
        newCorseDegree.title = newCourseDegreeTrans.title;
        newCourse.degree = newCorseDegree;
        let newCourseMentor = await Mentor.findOne({_id:newCourse.mentor}).select(['_id', 'name', 'lname', 'avatar']).lean()
        let mentorTranslate = await MentorTranslate.findOne({mentorId:newCourseMentor._id, language: language}).lean();
        newCourseMentor.name = mentorTranslate.name;
        newCourseMentor.lname = mentorTranslate.lname;
        newCourse.mentor = newCourseMentor;

        newCourse.parts = await Part.find({courseId:_id}).lean()

        newCourse.parts = await Promise.all(newCourse.parts.map(async part => {
            part.chapters = await Chapter.find({partId: part._id}).lean()

            part.chapters = await Promise.all(part.chapters.map(async chapter => {
                chapter.lessons = await Lesson.find({chapterId:chapter._id}).lean()
                console.log(chapter.lessons)
                return chapter
            }))

            return part
        }))


        res.status(200).json(newCourse);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}



const forRates = async (req, res) => {
    try {
        const _id = req.body._id;
        let newCourse = await Course.findOne({_id:_id}).lean()
        let { rate } = req.body
        newCourse.rates.push(rate)
        let course = await Course.findOneAndUpdate({_id:_id},{ rates: newCourse.rates,  updatedAt: Date.now() }, {returnDocument: 'after'});

        res.status(200).json({message: "ok"});
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}





const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        await Course.findByIdAndDelete(_id);
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}

module.exports = { all, allActive, changeStatus, create, update, findOne, del, adminPanelAll, byCat, forRates }