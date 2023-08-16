
const fs = require('fs');
const getStream = require('get-stream');
const fetch = require('cross-fetch')
const { ProxyAgent } = require('proxy-agent')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { parse } = require('csv-parse');

const timeframeOptions = {
    WEEK: '1 week',
    MONTH: '1 month',
    // THREE_MONTHS: '3 months',
    YEAR: '1 year',
    // HALF_YEAR: '6 months',
    ALL_TIME: 'All time',
}

module.exports.readCSVData = async (filePath) => {
    const parseStream = parse({ delimiter: ',' });
    const data = await getStream.array(fs.createReadStream(filePath).pipe(parseStream));
    return data
}

module.exports.getProxy = () => {
    const proxyNum = Math.floor(Math.random() * proxyList.length);
    const proxy = new ProxyAgent(`${proxyList[proxyNum][2].toLowerCase()}://${proxyList[proxyNum][0]}:${proxyList[proxyNum][1]}`);
    return proxy;
}

module.exports.getDailyTimestampInYear = () => {
    dayjs.extend(utc)
    return dayjs
        .utc()
        .subtract(
            1,
            'year'
        )
        .startOf('day')
        .unix() - 1
}

module.exports.getDailyTimestampInWeek = () => {
    dayjs.extend(utc)
    return dayjs
        .utc()
        .subtract(
            1,
            'week'
        )
        .startOf('day')
        .unix() - 1
}

module.exports.getHbarPrices = async () => {
    const startDailyTimestamp = this.getDailyTimestampInYear()
    try {
        if (hbarPrices.length === 0 || (hbarPrices.length > 0 && Date.now() - hbarPrices[hbarPrices.length - 1][0] > 50000000)) {
            const proxy = this.getProxy()
            let response = await fetch(`https://api.coingecko.com/api/v3/coins/hedera-hashgraph/market_chart/range?vs_currency=USD&from=${startDailyTimestamp}&to=${Date.now() / 1000 + 1}`, { agent: proxy })
            if (response.status === 200) {
                jsonData = await response.json();
                hbarPrices = jsonData['prices']
                return hbarPrices
            }
        }
        return hbarPrices;
    } catch (e) {
        console.log(e)
        return hbarPrices
    }
}

module.exports.getPercentChange = (valueNow, value24HoursAgo) => {
    const adjustedPercentChange =
        ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
    if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
        return 0
    }
    return adjustedPercentChange
}

module.exports.getTimeframe = (timeWindow) => {
    const utcEndTime = dayjs.utc()
    // based on window, get starttime
    let utcStartTime
    switch (timeWindow) {
        case timeframeOptions.WEEK:
            utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1
            break
        case timeframeOptions.MONTH:
            utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1
            break
        case timeframeOptions.ALL_TIME:
            utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1
            break
        default:
            utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1
            break
    }
    return utcStartTime
}