const express = require("express");
const router = express.Router();
const Event = require("../models/events.model");
const { Op } = require('sequelize');
const moment = require("moment");
const sequelize = require("../db/db.config");

router.route("/").get(async (req, res, next) => {
    try {
        const eventType = req.query?.type;
        const currentTime = req.query.currentTime ? moment(req.query.currentTime).utc() : moment(new Date()).utc()

        // const currentTime = moment(new Date()).utc();
        const currentTimeFormatted = currentTime.format("YYYY-MM-DD HH:mm:ss");
        const currentTimePlusTenMin = currentTime.clone().add(10, 'm');

        if (!eventType || eventType === "all") {
            const events = await Event.findAll();
            res.json({ success: true, data: events });

        } else if (eventType === "live") {
            const events = await Event.findAll({
                where: {
                    [Op.and]: [
                        {
                            startTime: {
                                [Op.lte]: currentTimePlusTenMin
                            }
                        }, {
                            startTime: {
                                [Op.gte]: sequelize.fn(
                                    'DATE_SUB',
                                    sequelize.literal(`"${currentTimeFormatted}"`),
                                    sequelize.literal("INTERVAL `event`.`duration` MINUTE"))
                            }
                        }
                    ]

                },

            });

            res.json({ success: true, data: events });

        } else if (eventType === "upcomming") {

            const events = await Event.findAll({
                where: {
                    startTime: {
                        [Op.gt]: currentTime
                    }
                }
            })

            res.json({ success: true, data: events });
        }


    } catch (err) {
        // res.status(500).json({ success: false, message: err.message })
        next(err)
    }

}).post(async (req, res, next) => {
    try {
        const { name, startTime, duration } = req.body;
        const savedEvent = await Event.findOrCreate({
            where: {
                name
            }, defaults: {
                name, startTime, duration
            }

        })

        if (savedEvent[1] === false) {
            res.status(503).json({ success: false, message: "Event already exists" })
        }

        res.status(201).json({ success: true, data: savedEvent[0] })
    } catch (err) {
        // res.status(500).json({ success: false, message: err.message })
        next(err);
    }

})

router.route("/:id").get(async (req, res, next) => {
    try {
        const id = req.params.id;

        const event = await Event.findByPk(id);

        console.log(event);
        const data = [];
        if (event) {
            data.push(event);
        }

        res.status(201).json({ success: true, data })

    } catch (err) {
        // res.status(500).json({ success: false, message: err.message })
        next(err);
    }

}).put(async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, startTime, duration } = req.body;

        const existingEvent = await Event.findByPk(id);

        let data;

        if (!existingEvent) {
            data = "record does not exists";
            res.status(200).json({ success: true, data })
            return;
        }

        const countOfUpdatedEvent = await Event.update(
            {
                name: name, startTime: startTime, duration: duration
            },
            {
                where: {
                    [Op.and]: [{
                        id: id
                    }, {
                        name: {
                            [Op.ne]: name
                        }
                    }]
                }, returning: true

            })

        if (countOfUpdatedEvent[1] > 0) {
            data = await Event.findByPk(id);
            res.status(200).json({ success: true, data })
        } else if (countOfUpdatedEvent[1] === 0) {
            data = "Event already exists";
            res.status(200).json({ success: true, data })
        }

        res.status(200).json({ success: true, data })
    } catch (err) {
        // res.status(500).json({ success: false, message: err.message })
        next(err)
    }
}).delete(async (req, res, next) => {
    try {
        const id = req.params.id;

        const deleted = await Event.destroy({
            where: {
                id: id
            }
        })

        if (deleted > 0) {
            res.status(200).json({ success: true, message: `record deleted successfully` })
        } else {
            res.status(404).json({ success: false, message: `no record found` })
        }


    } catch (err) {
        // res.status(500).json({ success: false, message: err.message })
        next(err)
    }
})

// router.route("/populate").post(async (req, res) => {
//     try {
//         const event = req.body;
//         const newEvent = new Event(event);
//         const savedEvent = await newEvent.save();
//         res.status(201).json({ success: true, data: savedEvent })
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message })
//     }

// })

router.route("/deleteAll").delete(async (req, res, next) => {
    try {
        const deleted = await Event.destroy({
            where: {},
            truncate: true
        })

        res.status(200).json({ success: true, message: `${deleted} records deleted` })

    } catch (err) {
        // res.status(500).json({ success: false, message: err.message })
        next(err)
    }
})

module.exports = router