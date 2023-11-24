const {Schema, model} = require('mongoose')

const part = new Schema({
    userId: String,
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, "Заполните course"]
    },
    title: {
        type: String,
        required: [true, "Заполните название"]
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Part', part)