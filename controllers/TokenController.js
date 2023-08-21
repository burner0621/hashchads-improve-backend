const fetch = require('cross-fetch')
const Token = require('../models/Token');
const PriceChange = require('../models/PriceChange');
const SocialInfo = require("../models/SocialInfo")
const Transaction = require("../models/Transaction")
const config = require('../config/config');
const utils = require('../utils')

module.exports.getAll = async () => {
    try {
        const data = await Token.find({});
        return data;
    } catch (e) {
        console.log(e)
        return []
    }
}

module.exports.getSimpleAll = async () => {
    try {
        const tokens = await Token.find({}, {monthlyPrice: 0});
        return tokens;
    } catch (e) {
        console.log(e)
        return []
    }
}

module.exports.getTokenByAddress = async ({address}) => {
    try {
        const token = await Token.findOne({id: address});
        return token;
    } catch (e) {
        console.log(e)
        return []
    }
}

module.exports.getDailyVolumes = async () => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/tokens/daily-volumes`, { agent: proxy })
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

module.exports.getPriceChanges = async () => {
    try {
        const pc = await Token.find({}, {id:1, dailyPriceChange: 1});
        let data = {}
        for (let c of pc) {
            data[c['id']] = c['dailyPriceChange'] ? c['dailyPriceChange'] : 0
        }
        return data;
    } catch (e) {
        console.log(e)
        return {}
    }
}

module.exports.getNewTokenData = async ({count}) => {
    let tokens = await Token.find({}, {monthlyPrice: 0});
    tokens = tokens &&
            tokens
                .sort((a, b) => {
                    return a['timestampSecondsLastListingChange'] > b['timestampSecondsLastListingChange'] ? -1 : 1
                })
    tokens = tokens.slice (0, count)
    let tmpTokens = []
    for (let token of tokens) {
        let tmp = {}
        tmp.id = token.id
        tmp.price = Number(token.priceUsd).toFixed(6) || 0.0
        tmp.img = `https://saucerswap.finance${token.icon}`
        tmp.iconPath = token.icon
        tmp.change = Number(token.dailyPriceChange).toFixed(6)
        tmp.coinName = token.name
        tmp.dailyVolume = token.dailyVolume
        if (Number(token.dailyPriceChange) > 0) {
            tmp.iconClass = "success"
            tmp.icon = "mdi mdi-trending-up"
        } else {
            tmp.iconClass = "danger"
            tmp.icon = "mdi mdi-trending-down"
        }
        tmpTokens.push(tmp)
    }
    return {
        success: true,
        data: tmpTokens
    }
}

module.exports.getTopTokenData = async () => {
    const hbarPrices = await utils.getHbarPrices()
    let currentHbarPrice = 0
    if (hbarPrices.length > 0) currentHbarPrice = hbarPrices[hbarPrices.length - 1][0]
    const tokens = await Token.find({});

    let gainers = [], losers = [];
    for (let token of tokens) {
        if (Number(token.dailyPriceChange) >= 0) {
            gainers.push(token);
        } else {
            losers.push(token);
        }
    }

    gainers = gainers.sort((a, b) => {
        if (Number(a.dailyPriceChange) < Number(b.dailyPriceChange)) {
            return 1;
        } else if (Number(a.dailyPriceChange) > Number(b.dailyPriceChange)) {
            return -1;
        }
        return 0;
    });
    gainers = gainers.slice(0, 25)

    losers = losers.sort((a, b) => {
        if (Number(a.dailyPriceChange) < Number(b.dailyPriceChange)) {
            return -1;
        } else if (Number(a.dailyPriceChange) > Number(b.dailyPriceChange)) {
            return 1;
        }
        return 0;
    });
    losers = losers.slice(0, 25)

    let tmpGainers = [], tmpLosers = []
    for (let token of gainers) {
        let tmp = {}
        tmp.id = token.id
        tmp.price = Number(token.priceUsd).toFixed(6) || 0.0
        tmp.img = `https://saucerswap.finance${token.icon}`
        tmp.iconPath = token.icon
        tmp.change = Number(token.dailyPriceChange).toFixed(6)
        tmp.coinName = token.name
        tmp.dailyVolume = token.dailyVolume
        if (Number(token.dailyPriceChange) > 0) {
            tmp.iconClass = "success"
            tmp.icon = "mdi mdi-trending-up"
        } else {
            tmp.iconClass = "danger"
            tmp.icon = "mdi mdi-trending-down"
        }
        tmpGainers.push(tmp)
    }

    for (let token of losers) {
        let tmp = {}
        tmp.id = token.id
        tmp.price = Number(token.priceUsd).toFixed(6) || 0.0
        tmp.img = `https://saucerswap.finance${token.icon}`
        tmp.iconPath = token.icon
        tmp.change = Number(token.dailyPriceChange).toFixed(6)
        tmp.coinName = token.name
        tmp.dailyVolume = token.dailyVolume
        if (Number(token.dailyPriceChange) > 0) {
            tmp.iconClass = "success"
            tmp.icon = "mdi mdi-trending-up"
        } else {
            tmp.iconClass = "danger"
            tmp.icon = "mdi mdi-trending-down"
        }
        tmpLosers.push(tmp)
    }
    return {
        success: true,
        data: {
            gainers: tmpGainers,
            losers: tmpLosers
        }
    }
}

module.exports.getTokensStatsData = async ({ sortedColumn, sortDirection, pageNum, pageCount, type, liq }) => {
    try {
        const tokens = await Token.find({});
        let tmpTokens = []
        for (let token of tokens) {
            let tmpToken = token.toObject({ getters: true });
            delete tmpToken['monthlyPrice']
            if (token.monthlyPrice) {
                let tmpPriceChart = ""
                let closeUsdList = []
                let i = 0
                if (token.monthlyPrice[token.monthlyPrice.length - 7]) tmpToken['weeklyChanged'] = utils.getPercentChange(token['priceUsd'], token.monthlyPrice[token.monthlyPrice.length - 7]['closeUsd'])
                if (token.monthlyPrice[1]) tmpToken['monthlyChanged'] = utils.getPercentChange(token['priceUsd'], token.monthlyPrice[1]['closeUsd'])
                for (let p of token.monthlyPrice) {
                    closeUsdList.push(parseFloat(p['closeUsd']))
                }
                const min = Math.min(...closeUsdList);
                const max = Math.max(...closeUsdList);
                let normalised_prices = [];

                for (let p of closeUsdList) {
                    let new_price = (parseFloat(p) - min) / (min - max);
                    if (isNaN(new_price)) {
                        new_price = 0;
                    }
                    normalised_prices.push(Math.abs((Math.abs(new_price * 80)) - 80));
                }
                for (let p of normalised_prices) {
                    tmpPriceChart += i.toString() + "," + p + " "
                    i += 15;
                }
                tmpToken['priceChart'] = tmpPriceChart
            }
            tmpTokens.push(tmpToken)
        }
        
        if (liq === '1')
            tmpTokens = tmpTokens && tmpTokens
                .filter(item => {
                    if (parseFloat (item['liquidity']) >= 500) return 1;
                })
        else if (liq === '0')
            tmpTokens = tmpTokens && tmpTokens
                .filter(item => {
                    if (parseFloat (item['liquidity']) < 500) return 1;
                })
        
        if (type === 'gainer')
            tmpTokens = tmpTokens && tmpTokens
                .filter(item => {
                    if (parseFloat (item['dailyPriceChange']) >= 0) return 1;
                })
        else if (liq === '0')
            tmpTokens = tmpTokens && tmpTokens
                .filter(item => {
                    if (parseFloat (item['dailyPriceChange']) < 0) return 1;
                })

        const rlt = tmpTokens && tmpTokens
            .sort((a, b) => {
                if (sortedColumn === "symbol" || sortedColumn === "name") {
                    return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn]) ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
                }
                if (isNaN(parseFloat(a[sortedColumn])) === false && isNaN(parseFloat(b[sortedColumn])) === false)
                    return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
                        ? (sortDirection ? -1 : 1) * 1
                        : (sortDirection ? -1 : 1) * -1
                else if (isNaN(parseFloat(a[sortedColumn])) && isNaN(parseFloat(b[sortedColumn])) === false)
                    return sortDirection ? 1 : -1
                else if (isNaN(parseFloat(a[sortedColumn])) === false && isNaN(parseFloat(b[sortedColumn])))
                    return sortDirection ? -1 : 1
                else
                    return 0
            })
            .slice(pageCount * (pageNum - 1), pageCount * pageNum)
        
        return {
            success: true,
            data: rlt
        }
    } catch (e) {
        console.log(e)
        return {success: false}
    }
}


module.exports.getTopStatsData = async ({ count }) => {
    try {
        const tokens = await Token.find({});
        let tmpTokens = [], gainers = [], losers = [], newers = []
        for (let token of tokens) {
            let tmpToken = token.toObject({ getters: true });
            delete tmpToken['monthlyPrice']
            if (token.monthlyPrice) {
                let tmpPriceChart = ""
                let closeUsdList = []
                let i = 0
                if (token.monthlyPrice[token.monthlyPrice.length - 7]) tmpToken['weeklyChanged'] = utils.getPercentChange(token['priceUsd'], token.monthlyPrice[token.monthlyPrice.length - 7]['closeUsd'])
                if (token.monthlyPrice[1]) tmpToken['monthlyChanged'] = utils.getPercentChange(token['priceUsd'], token.monthlyPrice[1]['closeUsd'])
                for (let p of token.monthlyPrice) {
                    closeUsdList.push(parseFloat(p['closeUsd']))
                }
                const min = Math.min(...closeUsdList);
                const max = Math.max(...closeUsdList);
                let normalised_prices = [];

                for (let p of closeUsdList) {
                    let new_price = (parseFloat(p) - min) / (min - max);
                    if (isNaN(new_price)) {
                        new_price = 0;
                    }
                    normalised_prices.push(Math.abs((Math.abs(new_price * 80)) - 80));
                }
                for (let p of normalised_prices) {
                    tmpPriceChart += i.toString() + "," + p + " "
                    i += 15;
                }
                tmpToken['priceChart'] = tmpPriceChart
            }
            tmpTokens.push(tmpToken)
        }

        gainers = tmpTokens && tmpTokens
            .filter(item => {
                if (parseFloat (item['dailyPriceChange']) >= 0) return 1;
            })
        losers = tmpTokens && tmpTokens
            .filter(item => {
                if (parseFloat (item['dailyPriceChange']) < 0) return 1;
            })
        newers = tmpTokens &&
                tmpTokens
                .sort((a, b) => {
                    return a['timestampSecondsLastListingChange'] > b['timestampSecondsLastListingChange'] ? -1 : 1
                })
                .slice(0, count)
        const rlt = tmpTokens && tmpTokens
            .sort((a, b) => {
                if (isNaN(parseFloat(a['dailyVolume'])) === false && isNaN(parseFloat(b['dailyVolume'])) === false)
                    return parseFloat(a['dailyVolume']) > parseFloat(b['dailyVolume']) ? -1 : 1
                else if (isNaN(parseFloat(a['dailyVolume'])) && isNaN(parseFloat(b['dailyVolume'])) === false)
                    return 1
                else if (isNaN(parseFloat(a['dailyVolume'])) === false && isNaN(parseFloat(b['dailyVolume'])))
                    return -1
                else
                    return 0
            })
            .slice(0, count)
        
        gainers = gainers && gainers
            .sort((a, b) => {
                if (isNaN(parseFloat(a['dailyVolume'])) === false && isNaN(parseFloat(b['dailyVolume'])) === false)
                    return parseFloat(a['dailyVolume']) > parseFloat(b['dailyVolume']) ? -1 : 1
                else if (isNaN(parseFloat(a['dailyVolume'])) && isNaN(parseFloat(b['dailyVolume'])) === false)
                    return 1
                else if (isNaN(parseFloat(a['dailyVolume'])) === false && isNaN(parseFloat(b['dailyVolume'])))
                    return -1
                else
                    return 0
            })
            .slice(0, count)
        
        losers = losers && losers
            .sort((a, b) => {
                if (isNaN(parseFloat(a['dailyVolume'])) === false && isNaN(parseFloat(b['dailyVolume'])) === false)
                    return parseFloat(a['dailyVolume']) > parseFloat(b['dailyVolume']) ? -1 : 1
                else if (isNaN(parseFloat(a['dailyVolume'])) && isNaN(parseFloat(b['dailyVolume'])) === false)
                    return 1
                else if (isNaN(parseFloat(a['dailyVolume'])) === false && isNaN(parseFloat(b['dailyVolume'])))
                    return -1
                else
                    return 0
            })
            .slice(0, count)
        let tops = await setMarketcap (rlt);
        newers = await setMarketcap (newers);
        gainers = await setMarketcap (gainers);
        losers = await setMarketcap (losers);
        
        return {
            success: true,
            data: {
                tops: tops,
                gainers: gainers,
                losers: losers,
                newers: newers
            }
        }
    } catch (e) {
        console.log(e)
        return {success: false}
    }
}

async function setMarketcap(_tokens) {
    let tmpTokens = []
    for (let item of _tokens) {
        let tmp = item;
        let response = await fetch(config.MIRROR_NODE_URL + "/api/v1/tokens/" + item.id);
        if (response.status === 200) {
            let jsonData = await response.json()
            let response1 = await fetch(config.MIRROR_NODE_URL + `/api/v1/tokens/${item.id}/balances?account.id=${jsonData?.treasury_account_id}`);
            if (response1.status === 200) {
                let jsonData1 = await response1.json()
                let balances = jsonData1?.balances
                let p = (Number(jsonData?.total_supply) - Number(balances[0]['balance'])) / Math.pow(10, Number(jsonData?.decimals)) * item.priceUsd
                tmp['marketcap'] = p
            }
        }
        tmpTokens.push (tmp)
    }
    return tmpTokens;
}
module.exports.getHbarPrice = async () => {
    const hbarPrices = await utils.getHbarPrices()
    if (hbarPrices.length > 0) {
        return {
            success: true,
            data: hbarPrices[hbarPrices.length - 1][1]
        }
    }
    return {
        success: true,
        data: 0
    }
}

module.exports.getTokenPrices = async ({address, interval, from, to}) => {
    try {
        const proxy = utils.getProxy()
        let response = await fetch(`${config.apiURL}/tokens/prices/${address}?interval=${interval}&from=${from}&to=${to}`, { agent: proxy })
        if (response.status === 200) {
            let jsonData = await response.json();
            return jsonData
        }
        return {};
    } catch (e) {
        console.log(e)
        return {}
    }
}

module.exports.getTokenPricesDH = async ({address, from, to}) => {
    try {
        const proxy = utils.getProxy()
        let daily = await this.getTokenPrices ({address, interval:'DAY', from, to})
        let hourly = await this.getTokenPrices ({address, interval:'HOUR', from, to})
        
        return {
            success: true,
            dailyData: daily,
            hourlyData: hourly
        };
    } catch (e) {
        console.log(e)
        return {success: false}
    }
}

module.exports.getSocialInfo = async ({ tokenId }) => {
    try {
        let data = await SocialInfo.find({ "Contract ID": tokenId })
        if (data === null || data === undefined) return {}
        if (data.length === 0) return {}
        return data[0]
    } catch (error) {
        console.log(error)
        return {}
    }
}

const getPagination = (page, size) => {
    const limit = size ? size : 10;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
};

module.exports.getTransactionHistory = async ({ tokenId, pageNum, pageSize }) => {
    const { limit, offset } = getPagination(pageNum, pageSize);
    try {
        let data = await Transaction.find({ tokenId: tokenId }).sort({ timestamp: -1 }).skip(offset).limit(limit).exec()
        let count = await Transaction.find({ tokenId: tokenId }).count()
        // let data = await TradeHistory.find({tokenId: tokenId}).sort({timestamp: -1}).skip(offset).limit(limit).exec()
        // let count = await TradeHistory.find({tokenId: tokenId}).count()
        return { data, count }
    } catch (e) {
        return { data: [], count: 0 }
    }
}

module.exports.getStatistics = async ({ tokenId, timeRangeType }) => {
    let timeStart = 0;
    let nowDate = Date.now() / 1000;
    if (timeRangeType === '5m') timeStart = nowDate - 300;
    else if (timeRangeType === '1h') timeStart = nowDate - 3600;
    else if (timeRangeType === '6h') timeStart = nowDate - 3600 * 6;
    else if (timeRangeType === '1d') timeStart = nowDate - 86400;
    else if (timeRangeType === '1w') timeStart = nowDate - 86400 * 7;
    try {
        let txs = await Transaction.find({ tokenId: tokenId, timestamp: { $gte: timeStart } }).count();
        let buys = await Transaction.find({ tokenId: tokenId, state: 'buy', timestamp: { $gte: timeStart } }).count();
        let records = await Transaction.find({ tokenId: tokenId, timestamp: { $gte: timeStart } });
        let totalVol = 0
        for (let record of records) {
            totalVol += Math.abs(Number(record.amount))
        }
        return { txs, buys, sells: txs - buys, vol: totalVol }
    } catch (e) {
        return { data: [], count: 0 }
    }
}

module.exports.getFeedData = async ({ tokenId, from, to }) => {
    var nowDate = (Date.now()) / 1000 + 1;
    var startDate = nowDate - 864000
    try {
        let url = ''
        if (from && to) {
            url = `${config.apiURL}/tokens/prices/${tokenId}?interval=FIVEMIN&from=${from}&to=${to}`;
        } else {
            url = `${config.apiURL}/tokens/prices/${tokenId}?interval=FIVEMIN&from=${startDate}&to=${nowDate}`;
        }
        let response = await fetch(url)

        if (response.status === 200) {
            let jsonData = await response.json();
            let data = []
            for (var i = 0; i < jsonData.length; i++) {
                let tmp = jsonData[i]['low']
                jsonData[i]['lowTokens'] = tmp
                jsonData[i]['low'] = jsonData[i]['lowUsd']
                tmp = jsonData[i]['high']
                jsonData[i]['highTokens'] = tmp
                jsonData[i]['high'] = jsonData[i]['highUsd']
                tmp = jsonData[i]['open']
                jsonData[i]['openTokens'] = tmp
                jsonData[i]['open'] = jsonData[i]['openUsd']
                tmp = jsonData[i]['close']
                jsonData[i]['closeTokens'] = tmp
                jsonData[i]['close'] = jsonData[i]['closeUsd']
                delete jsonData[i]['lowUsd']
                delete jsonData[i]['highUsd']
                delete jsonData[i]['openUsd']
                delete jsonData[i]['closeUsd']
            }
            return jsonData;
        }
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}