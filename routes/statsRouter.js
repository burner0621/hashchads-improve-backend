const express = require("express");
const router = express.Router();
const statsController = require("../controllers/StatController");

router.get("/", async (req, res) => {
    try {
        let data = await statsController.getInfo();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({});
    }
});

router.get("/get_daily_volumes", async (req, res) => {
    try {
        let data = await statsController.getDailyVolumes();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_interval_info", async (req, res) => {
    try {
        let data = await statsController.getIntervalInfo(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_stats_liquidity_data", async (req, res) => {
    try {
        let data = await statsController.getStatsLiquidityData();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_stats_dvolume_data", async (req, res) => {
    try {
        let data = await statsController.getStatsDVolumeData();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_stats_wvolume_data", async (req, res) => {
    try {
        let data = await statsController.getStatsWVolumeData();
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
        let data = await statsController.getChartData(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([[], []]);
    }
});
module.exports = router;