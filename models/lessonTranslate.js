const {Schema, model} = require('mongoose')

const lessonTranslate = new Schema({
    lessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Specialty',
        required: [true, "Заполните Specialty"]
    },
    title: {
        type: String,
        required: [true, "Заполните название"]
    },
    language: {
        type: String,
        required: [true, "Заполните language"]
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('LessonTranslate', lessonTranslate)