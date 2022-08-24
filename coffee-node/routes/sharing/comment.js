const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../../modules/mysql-connect");

let member_sid, post_sid = 0;
const op = {
    success: false,
    error: "",
};

router.use("", async (req, res, next) => {
    if (!res.locals.loginUser) {
        // Check JWT
        res.status(401).send({
            error: {
                status: 401,
                message: "Wrong verify.",
            },
        });
        return;
    } else if (!req.body.post_sid) {
        res.status(400).send({
            error: {
                status: 400,
                message: "Request body cannot be empty",
            },
        });
        return;
    } else {
        member_sid = res.locals.loginUser.sid;
        post_sid = req.body.post_sid;
        next();
    }
});

router.post("/", async (req, res) => {
    const content = req.body.content;
    if (!content) {
        res.status(400).send({
            error: {
                status: 400,
                message: "Request body cannot be empty",
            },
        });
        return;
    }

    const sql = `
    INSERT INTO comment (member_sid, content, post_sid, created_at) VALUES (?, ?, ?, NOW());
    UPDATE post SET comments = comments + 1 WHERE sid = ?;
    `;

    try {
        const [r] = await db.query(sql, [member_sid, content, post_sid, post_sid]);
        if (r) op.success = true;
        res.json(op);

    } catch (error) {
        op.error = error;
        res.json(op);
        return;
    }



});

router.delete("/:comment_sid", async (req, res) => {
    const comment_sid = req.params.comment_sid;
    if (!comment_sid) {
        res.status(400).send({
            error: {
                status: 400,
                message: "Request body cannot be empty",
            },
        });
        return;
    }


    const sql = `
    DELETE FROM comment WHERE sid = ? AND member_sid = ?;
    UPDATE post SET comments = comments - 1 WHERE sid = ?;
    `;

    try {
        const [r] = await db.query(sql, [comment_sid, member_sid, post_sid]);
        if (r) op.success = true;
        res.json(op);
    } catch (error) {
        op.error = error;
        res.json(op);
        return
    }


});

module.exports = router;
