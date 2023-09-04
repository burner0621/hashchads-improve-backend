const fetch = require("cross-fetch")
const config = require('./config/config');
const db = require('./config/db');
const { ProxyAgent } = require('proxy-agent')

const Token = require('./models/Token');
const Pool = require('./models/Pool');
const Transaction = require('./models/Transaction');

const utils = require('./utils')

let dProxyList = {}
let PRICE_INTERVAL = 10 // (seconds)
let TOKEN_INTERVAL = 10
let POOL_INTERVAL = 900
let DAILY_VOLUME_INTERVAL = 43200

global.pools = []
global.tokens = []

const dbConnect = () => {
    db.mongoose
        .connect(db.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Connected to the database!");
        })
        .catch(err => {
            console.log("Cannot connect to the database!", err);
            process.exit();
        });
}

const sleep = (delay) => {
    var start = new Date().getTime() / 1000;
    while (new Date().getTime() / 1000 < start + delay);
}

const saveTokens = async () => {
    while (1) {
        const proxyNum = Math.floor(Math.random() * dProxyList.length);
        const proxy = new ProxyAgent(`${dProxyList[proxyNum][2].toLowerCase()}://${dProxyList[proxyNum][0]}:${dProxyList[proxyNum][1]}`);
        try {
            let response = await fetch(`${config.apiURL}/tokens`, { agent: proxy })
            if (response.status === 200) {
                const jsonData = await response.json();
                tokens = jsonData
                console.log("================== Save Tokens Start ==================", jsonData.length)
                for (t of jsonData) {
                    const _t = await Token.findOne({ id: t['id'] });
                    if (_t) {
                        await Token.findOneAndUpdate(
                            { id: t['id'] },
                            t
                        )
                        continue
                    }
                    _newToken = new Token(t);
                    await _newToken.save()
                }
            }
        } catch (e) {
            console.log(e)
        }
        sleep (TOKEN_INTERVAL)
        console.log("++++++++++++++++++++ Save Tokens End ++++++++++++++++++++")
    }
}

const savePools = async () => {
    const proxyNum = Math.floor(Math.random() * dProxyList.length);
    const proxy = new ProxyAgent(`${dProxyList[proxyNum][2].toLowerCase()}://${dProxyList[proxyNum][0]}:${dProxyList[proxyNum][1]}`);
    try {
        let response = await fetch(`${config.apiURL}/pools`, { agent: proxy })
        if (response.status === 200) {
            const jsonData = await response.json();
            pools = jsonData
            console.log("================== Save Pools Start ==================", jsonData.length)
            for (p of jsonData) {
                const _p = await Pool.findOne({ contractId: p['contractId'] });
                if (_p) {
                    await Pool.findOneAndUpdate(
                        { contractId: p['contractId'] },
                        p
                    )
                    continue
                }
                _newPool = new Pool(p);
                await _newPool.save()
            }
        }
    } catch (e) {
        console.log(e)
    }
    console.log("++++++++++++++++++++ Save Pools End ++++++++++++++++++++")
}

const savePriceChanges = async () => {
    while (1) {
        const proxyNum = Math.floor(Math.random() * dProxyList.length);
        const proxy = new ProxyAgent(`${dProxyList[proxyNum][2].toLowerCase()}://${dProxyList[proxyNum][0]}:${dProxyList[proxyNum][1]}`);
        try {
            let response = await fetch(`${config.apiURL}/tokens/price-change`, { agent: proxy })
            if (response.status === 200) {
                const jsonData = await response.json();
                console.log("================== Save PriceChange Start ==================", Object.keys(jsonData).length)
                for (key of Object.keys(jsonData)) {
                    const _t = await Token.findOne({ id: key });
                    if (_t) {
                        await Token.findOneAndUpdate(
                            { id: key },
                            {
                                dailyPriceChange: jsonData[key],
                            }
                        );
                    } else {
                        _newToken = new Token({
                            id: key,
                            dailyPriceChange: jsonData[key]
                        });
                        await _newToken.save()
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
        sleep(3)
        console.log("++++++++++++++++++++ Save PriceChange End ++++++++++++++++++++")
    }
}

const saveDailyVolumes = async () => {
    const proxyNum = Math.floor(Math.random() * dProxyList.length);
    const proxy = new ProxyAgent(`${dProxyList[proxyNum][2].toLowerCase()}://${dProxyList[proxyNum][0]}:${dProxyList[proxyNum][1]}`);
    try {
        let response = await fetch(`${config.apiURL}/tokens/daily-volumes`, { agent: proxy })
        if (response.status === 200) {
            const jsonData = await response.json();
            console.log("================== Save DailyVolumes Start ==================", Object.keys(jsonData).length)
            for (key of Object.keys(jsonData)) {
                const _t = await Token.findOne({ id: key });
                if (_t) {
                    await Token.findOneAndUpdate(
                        { id: key },
                        {
                            dailyVolume: jsonData[key],
                        }
                    );
                } else {
                    _newToken = new Token({
                        id: key,
                        dailyVolume: jsonData[key]
                    });
                    await _newToken.save()
                }
            }
        }
    } catch (e) {
        console.log(e)
    }
    console.log("++++++++++++++++++++ Save DailyVolumes End ++++++++++++++++++++")
}

const saveLiquidity = async () => {
    pools = await Pool.find({})
    if (pools.length === 0) return
    let _tokenData = {}
    for (let pool of pools) {
        if (_tokenData[pool.tokenA.id]) {
            _tokenData[pool.tokenA.id] += Number(pool.tokenReserveA) / Math.pow(10, Number(pool.tokenA.decimals)) * Number(pool.tokenA.priceUsd)
        } else {
            _tokenData[pool.tokenA.id] = {}
            _tokenData[pool.tokenA.id] = Number(pool.tokenReserveA) / Math.pow(10, Number(pool.tokenA.decimals)) * Number(pool.tokenA.priceUsd)
        }
        if (_tokenData[pool.tokenB.id]) {
            _tokenData[pool.tokenB.id] += Number(pool.tokenReserveB) / Math.pow(10, Number(pool.tokenB.decimals)) * Number(pool.tokenB.priceUsd)
        } else {
            _tokenData[pool.tokenB.id] = {}
            _tokenData[pool.tokenB.id] = Number(pool.tokenReserveB) / Math.pow(10, Number(pool.tokenB.decimals)) * Number(pool.tokenB.priceUsd)
        }
    }
    for (key of Object.keys(_tokenData)) {
        const _t = await Token.findOne({ id: key });
        if (_t) {
            await Token.findOneAndUpdate(
                { id: key },
                {
                    liquidity: _tokenData[key],
                }
            );
        } else {
            _newToken = new Token({
                id: key,
                liquidity: _tokenData[key]
            });
            await _newToken.save()
        }
    }
}

const saveMonthlyPriceData = async () => {
    const now_date = new Date() / 1000
    const start_date = now_date - 86400 * 31
    while (1) {
        let tmpTokens = await Token.find({})

        for (let token of tmpTokens) {
            const proxyNum = Math.floor(Math.random() * dProxyList.length);
            const proxy = new ProxyAgent(`${dProxyList[proxyNum][2].toLowerCase()}://${dProxyList[proxyNum][0]}:${dProxyList[proxyNum][1]}`);
            try {
                let res = await fetch(`https://api.saucerswap.finance/tokens/prices/${token.id}?interval=DAY&from=${start_date}&to=${now_date}`, { agent: proxy })
                console.log("saveMonthlyPriceData >>> ", token.id, " ... status=", res.status)
                if (res.status === 200) {
                    const dailyPrice = await res.json()
                    const _t = await Token.findOne({ id: token.id });
                    console.log(token.id, dailyPrice.length)
                    if (_t) {
                        await Token.findOneAndUpdate(
                            { id: token.id },
                            {
                                monthlyPrice: dailyPrice,
                            }
                        );
                    } else {
                        _newToken = new Token({
                            id: token.id,
                            monthlyPrice: dailyPrice
                        });
                        await _newToken.save()
                    }
                }
            } catch (e) {
                console.log(e)
            }
            sleep(3)
        }
        sleep(60)
    }
}

const saveMarketCapData = async () => {
    let period = 0
    while (1) {
        let tmpTokens = await Token.find({})
        for (let item of tmpTokens) {
            try {
                let response = await fetch(config.MIRROR_NODE_URL + "/api/v1/tokens/" + item.id);
                console.log("saveMarketCapData >>> ", item['id'], " ... status = ", response.status)
                if (response.status === 200) {
                    let jsonData = await response.json()
                    try {
                        let response1 = await fetch(config.MIRROR_NODE_URL + `/api/v1/tokens/${item.id}/balances?account.id=${jsonData?.treasury_account_id}`);
                        if (response1.status === 200) {
                            let jsonData1 = await response1.json()
                            let balances = jsonData1?.balances
                            let p = (Number(jsonData?.total_supply) - Number(balances[0]['balance'])) / Math.pow(10, Number(jsonData?.decimals)) * item.priceUsd
                            await Token.findOneAndUpdate(
                                { id: item['id'] },
                                {
                                    marketcap: p,
                                }
                            );
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
        sleep(POOL_INTERVAL)
    }
}


const saveToeknLatestPrices = async () => {
    while (1) {
        let tmpTokens = await Token.find({})
        for (let item of tmpTokens) {
            const proxyNum = Math.floor(Math.random() * dProxyList.length);
            const proxy = new ProxyAgent(`${dProxyList[proxyNum][2].toLowerCase()}://${dProxyList[proxyNum][0]}:${dProxyList[proxyNum][1]}`);
            try {
                let response = await fetch(`${config.apiURL}/tokens/prices/latest/${item.id}?interval=DAY`, { agent: proxy });
                console.log("saveToeknLatestPrices >>> ", item['id'], " ... status = ", response.status)
                if (response.status === 200) {
                    let jsonData = await response.json()
                    await Token.findOneAndUpdate(
                        { id: item['id'] },
                        {
                            priceUsd: jsonData.closeUsd,
                        }
                    );
                }
            } catch (e) {
                console.log(e)
            }
            sleep(3)
        }
        sleep(10)
    }
}

async function main() {
    dbConnect()
    dProxyList = await utils.readCSVData("proxylist/" + config.proxyListFile)
    saveTokens()
    saveMonthlyPriceData()
    saveToeknLatestPrices()
    saveMarketCapData()
    savePriceChanges()
    mainSaveData()
}

async function mainSaveData() {
    let period = 0
    while (1) {
        // if (period % TOKEN_INTERVAL === 0) await saveTokens()
        if (period % POOL_INTERVAL === 0) await savePools()
        if (period % DAILY_VOLUME_INTERVAL === 0) await saveDailyVolumes()
        // if (period % POOL_INTERVAL === 0) await saveMarketCapData()
        // await savePriceChanges()
        await saveLiquidity()
        sleep(PRICE_INTERVAL)
        period += PRICE_INTERVAL
    }
}
main()