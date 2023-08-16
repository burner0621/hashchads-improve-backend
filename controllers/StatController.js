const fetch = require('cross-fetch')
const config = require('../config/config');
const utils = require('../utils')

module.exports.getInfo = async () => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/stats`, {agent: proxy})
        if (response.status === 200) {
            const jsonData = await response.json();
            return jsonData
        }
        return {};
    } catch (e) {
        console.log (e)
        return {}
    }
}

module.exports.getDailyVolumes = async () => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/stats/volume/daily`, {agent: proxy})
        if (response.status === 200) {
            const jsonData = await response.json();
            return jsonData
        }
        return {};
    } catch (e) {
        console.log (e)
        return {}
    }
}

module.exports.getIntervalInfo = async ({from, to, interval, field}) => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/stats/platformData?field=${field}&interval=${interval}&from=${from}&to=${to}`, {agent: proxy})
        if (response.status === 200) {
            const jsonData = await response.json()
            return jsonData
        }
        return {};
    } catch (e) {
        console.log (e)
        return {}
    }
}

module.exports.getStatsLiquidityData = async () => {
    const now_data = Date.now ()
    const prices = await utils.getHbarPrices ()
    let data = await this.getIntervalInfo({
        from: now_data/1000 - 86400 * 3,
        to: now_data/1000,
        interval: "DAY",
        field: "LIQUIDITY"
    })
    const tl = (Number(data[data.length - 1]['valueHbar']) / 100000000 * prices[prices.length - 2][1]).toFixed(4)
    const otl = (Number(data[data.length - 2]['valueHbar']) / 100000000 * prices[prices.length - 3][1]).toFixed(4)
    return {
        success: true,
        data: {
            dtl_usd: tl,
            dl_changeusd: utils.getPercentChange (tl, otl)
        }
    }
}

module.exports.getStatsDVolumeData = async () => {
    const now_data = Date.now ()
    const prices = await utils.getHbarPrices ()
    let data = await this.getIntervalInfo({
        from: now_data/1000 - 86400 * 4,
        to: now_data/1000,
        interval: "DAY",
        field: "VOLUME"
    })
    const tv = (Number(data[data.length - 1]['valueHbar']) / 100000000 * prices[prices.length - 2][1]).toFixed(4)
    const otv = (Number(data[data.length - 2]['valueHbar']) / 100000000 * prices[prices.length - 3][1]).toFixed(4)
    return {
        success: true,
        data: {
            dtv_usd: tv,
            dv_changeusd: utils.getPercentChange (tv, otv)
        }
    }
}

module.exports.getStatsWVolumeData = async () => {
    const now_data = Date.now ()
    const prices = await utils.getHbarPrices ()
    let data = await this.getIntervalInfo({
        from: now_data/1000 - 86400 * 30,
        to: now_data/1000,
        interval: "WEEK",
        field: "VOLUME"
    })
    const wtv = (Number(data[data.length - 1]['valueHbar']) / 100000000 * prices[prices.length - 2][1]).toFixed(4)
    const wotv = (Number(data[data.length - 2]['valueHbar']) / 100000000 * prices[prices.length - 3][1]).toFixed(4)
    return {
        success: true,
        data: {
            wtv_usd: wtv,
            wv_changeusd: utils.getPercentChange (wtv, wotv)
        }
    }
}

module.exports.getChartData = async({start}) => {
    let dailyData = []
    let weekelyData = []
    const now_date = Date.now()
    const prices = await utils.getHbarPrices ()
    let data = await this.getIntervalInfo({
        from: start,
        to: now_date/1000,
        interval: "DAY",
        field: "LIQUIDITY"
    });
    if (data.length > 0) {
      if (prices.length > 0) {
        data.pop()
        let diff = prices.length > data.length? prices.length - data.length: 0
        let s = prices.length > data.length? data.length : prices.length
        for (var i = s - 1; i >= 0; i--) {
            dailyData.push({ "liquidity": Number(data[i]['valueHbar']) / 100000000 * prices[diff + i][1], "date": data[i]['timestampSeconds'] })
        }
        dailyData = dailyData.reverse()
      }

    }

    data = await this.getIntervalInfo({
        from: start,
        to: now_date,
        interval: "DAY",
        field: "VOLUME"
    });
    if (data.length > 0) {
      if (prices.length > 0) {
        data.pop()
        let diff = prices.length > data.length? prices.length - data.length: 0
        let s = prices.length > data.length? data.length : prices.length
        for (var i = s - 1; i >= 0; i--) {
            dailyData[i]["dailyVolumeUSD"] = Number(data[i]['valueHbar']) / 100000000 * prices[diff + i][1]
        }
        dailyData = dailyData.reverse()
      }
    }

    data = await this.getIntervalInfo({
        from: start,
        to: now_date,
        interval: "WEEK",
        field: "VOLUME"
    });
    if (data.length > 0) {
      if (prices.length > 0) {
        let diff = prices.length > data.length? prices.length - data.length: 0
        let s = prices.length > data.length? data.length : prices.length
        for (var i = s - 1; i >= 0; i--) {
          weekelyData.push({ "weeklyVolumeUSD": Number(data[i]['valueHbar']) / 100000000 * prices[diff + i][1], "date": data[i]['timestampSeconds'] })
        }
        weekelyData = weekelyData.reverse()
      }
    }
    return [dailyData, weekelyData]
}