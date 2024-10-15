export const getHome = async (req, res) => {
    res.status(200).json({ message: "Database is live..." });
}