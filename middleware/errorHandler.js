
function errorHandler(err, req, res, next) {
    console.error("Error:", err.message);

    if (err.statusCode) {
        return res.status(err.statusCode).json({"success": false,error: err.message });
    }

    // fallback for unexpected errors
    res.status(500).json({ error: "Server error" });
}

module.exports = errorHandler;
