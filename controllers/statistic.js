const count = async (req, res) => {
    try {
        let users = await User.find().count();
        res.status(200).json(users);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}