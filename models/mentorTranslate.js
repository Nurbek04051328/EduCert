const {Schema, model} = require('mongoose')

const mentorTranslate = new Schema({
    mentorId: {
        type: Schema.Types.ObjectId,
        ref: 'Mentor',
        required: [true, "Заполните Mentor"]
    },
    // Iloji bulsa Lotin harflarida kiriting
    name: {
        type: String,
        // required: [true, "Заполните Имя"]
    },
    // Iloji bulsa Lotin harflarida kiriting
    lname: {
        type: String,
        // required: [true, "Заполните Фамилия"]
    },
    text: {
        type: String
    },
    language: {
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


module.exports = model('MentorTranslate', mentorTranslate)