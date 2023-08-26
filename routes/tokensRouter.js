const express = require("express");
const router = express.Router();
const tokensController = require("../controllers/TokenController");
const utils = require ("../utils")

router.get("/all", async (req, res) => {
    try {
        let data = await tokensController.getAll();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/simple_all", async (req, res) => {
    try {
        let data = await tokensController.getSimpleAll();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_token_by_address", async (req, res) => {
    try {
        let data = await tokensController.getTokenByAddress(req.query);
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
        let data = await tokensController.getDailyVolumes();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_price_changes", async (req, res) => {
    try {
        let data = await tokensController.getPriceChanges();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_hbar_prices", async (req, res) => {
    try {
        let data = await utils.getHbarPrices();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/get_top_tokens", async (req, res) => {
    try {
        let data = await tokensController.getTopTokenData();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            success: false,
            data: {}
        });
    }
});

router.get("/get_new_tokens", async (req, res) => {
    try {
        let data = await tokensController.getNewTokenData(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            success: false,
            data: []
        });
    }
});

router.get("/get_tokens_stats_data", async (req, res) => {
    try {
        let data = await tokensController.getTokensStatsData(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            success: false,
            data: {}
        });
    }
});

router.get("/get_top_stats_data", async (req, res) => {
    try {
        let data = await tokensController.getTopStatsData(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            success: false,
            data: {}
        });
    }
});

router.get("/get_hbar_price", async (req, res) => {
    try {
        let data = await tokensController.getHbarPrice();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            success: false,
            data: 0
        });
    }
});

router.get("/get_token_prices", async (req, res) => {
    try {
        let data = await tokensController.getTokenPrices(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            success: false,
        });
    }
});

router.get("/get_token_latest_prices", async (req, res) => {
    try {
        let data = await tokensController.getTokenLatestPrices(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            success: false,
        });
    }
});

router.get("/get_token_prices_dh", async (req, res) => {
    try {
        let data = await tokensController.getTokenPricesDH(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            success: false,
        });
    }
});

router.get("/get_social", async (req, res) => {
    try {
        let data = await tokensController.getSocialInfo(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            data
        });
    }
});

router.get("/get_transactions", async (req, res) => {
    try {
        // {tokenId, pageNum, pageSize} = req.query
        let data = await tokensController.getTransactionHistory(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({data: [], count: 0});
    }
});

router.get("/get_statistics", async (req, res) => {
    try {
        // {tokenId, pageNum, pageSize} = req.query
        let data = await tokensController.getStatistics(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({data: [], count: 0});
    }
});

router.get("/get_feed_data", async (req, res) => {
    try {
        let data = await tokensController.getFeedData(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            data
        });
    }
});

module.exports = router;