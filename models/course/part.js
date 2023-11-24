const {Schema, model} = require('mongoose')

const part = new Schema({
    userId: String,
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
    },
    title: {
        type: String,
    },
    ordNumber:Number,
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Part', part)