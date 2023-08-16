const fetch = require('cross-fetch')
const Pool = require('../models/Pool');
const config = require('../config/config');
const utils = require('../utils')

module.exports.getAll = async () => {
    try {
        const pools = await Pool.find({}, {_id:0, tokenA:{description:0}, tokenB:{description:0}});
        return pools;
    } catch (e) {
        console.log(e)
        return []
    }
}

module.exports.getPoolById = async ({poolId}) => {
    try {
        const pool = await Pool.findOne({contracId: poolId}, {_id:0, tokenA:{description:0}, tokenB:{description:0}});
        return pool;
    } catch (e) {
        console.log(e)
        return {}
    }
}

module.exports.getDailyVolumes = async () => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/pools/daily-volumes`, { agent: proxy })
        if (response.status === 200) {
            const jsonData = await response.json();
            return jsonData
        }
        return {};
    } catch (e) {
        console.log(e)
        return {}
    }
}

module.exports.getWeeklyVolumes = async () => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/pools/weekly-volumes`, { agent: proxy })
        if (response.status === 200) {
            const jsonData = await response.json();
            return jsonData
        }
        return {};
    } catch (e) {
        console.log(e)
        return {}
    }
}

module.exports.getConversionRates = async ({ poolId, interval }) => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/pools/conversionRates/latest/${poolId}?interval=${interval}`, { agent: proxy })
        if (response.status === 200) {
            const jsonData = await response.json();
            return jsonData
        }
        return {};
    } catch (e) {
        console.log(e)
        return {}
    }
}

module.exports.getChartData = async ({ poolId, from, to }) => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/pools/conversionRates/${poolId}?interval=DAY&from=${from}&to=${to}`, { agent: proxy })
        if (response.status === 200) {
            const dailyData = await response.json()
            response = await fetch(`${config.apiURL}/pools/conversionRates/${poolId}?interval=HOUR&from=${from}&to=${to}`, { agent: proxy })
            if (response.status === 200) {
                const hourlyData = await response.json()
                return [hourlyData, dailyData]
            }
            return [undefined, dailyData]
        }
        return []
    } catch (e) {
        console.log(e)
        return []
    }
}