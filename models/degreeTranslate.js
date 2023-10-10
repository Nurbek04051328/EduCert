const {Schema, model} = require('mongoose')

const degreeTranslate = new Schema({
    degreeId: {
        type: Schema.Types.ObjectId,
        ref: 'Degree',
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


module.exports = model('DegreeTranslate', degreeTranslate)