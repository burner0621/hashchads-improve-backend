const express = require("express");
const router = express.Router();
const poolsController = require("../controllers/PoolController");

router.get("/all", async (req, res) => {
    try {
        let data = await poolsController.getAll();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_pool_by_id", async (req, res) => {
    try {
        let data = await poolsController.getPoolById(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_daily_volumes", async (req, res) => {
    try {
        let data = await poolsController.getDailyVolumes();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_weekly_volumes", async (req, res) => {
    try {
        let data = await poolsController.getWeeklyVolumes();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_conversion_rates", async (req, res) => {
    try {
        let data = await poolsController.getConversionRates(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_chart_data", async (req, res) => {
    try {
        let data = await poolsController.getChartData(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

module.exports = router;