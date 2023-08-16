const fetch = require("cross-fetch");
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const Visitor = require('../models/Visitor');
const tokensController = require ("../controllers/TokenController")

dayjs.extend(utc)

let visitors = {}

const getDateHourString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    const hours = now.getHours()
    return (new Date(year, month, day, hours).valueOf()).toString()
}

const getDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    return (new Date(year, month, day).valueOf()).toString()
}

const initVisitors = async () => {
    for (let t = Number(getDateString()); t < Date.now(); t += 3600000) {
        let _data = await Visitor.find({ timestamp: t.toString() }).limit(1)
        if (_data === null || _data === undefined || _data.length === 0) continue
        visitors[_data[0]["timestamp"]] = _data[0]["count"]
    }
}

initVisitors()

const globalDataSocket = async (io) => {
    const tokens = await tokensController.getSimpleAll()

    io.on('connection', (socket) => {
        socket.on('visit', async ({ socketID }) => {
            if (visitors[getDateHourString()] === undefined) visitors[getDateHourString()] = 0
            visitors[getDateHourString()]++
            io.emit('visited', visitors);
            delete visitors[(Number(getDateHourString()) - 86400000).toString()]
            let _data = await Visitor.find({ timestamp: getDateHourString() }).limit(1)
            if (_data === null || _data === undefined || _data.length === 0) {
                newVisitor = new Visitor({
                    timestamp: getDateHourString(),
                    count: visitors[getDateHourString()]
                })
                await newVisitor.save()
            } else {
                await Visitor.findOneAndUpdate(
                    { timestamp: getDateHourString() },
                    {
                        count: visitors[getDateHourString()],
                    }
                );
            }
        });

        socket.on('SubAdd', async ({ subs }) => {
            // io.emit('getPricesResponse', data);
            const [symbolId, symbolName, tokenSymbol, currency] = subs.split('~')
            let tokenId = -1
            for (let token of tokens) {
                if (token.symbol === tokenSymbol) {
                    tokenId = token.id; break;
                }
            }
            if (tokenId === -1) {
                io.emit("m", "~~~~~~~~0")
                return
            }
            const url = `https://api.saucerswap.finance/tokens/prices/latest/${tokenId}?interval=HOUR`;
            const res = await fetch(url)
            if (res.status === 200) {
                const jsonData = await res.json()
                const data = `subAdd~exchange~${jsonData.startTimestampSeconds}~${jsonData.timestampSeconds}~~~${jsonData.timestampSeconds}~~${jsonData.closeUsd}`
                io.emit('m', data)
                return
            }
            io.emit("m", "~~~~~~~~0")
        });

        socket.on('disconnect', () => {
            console.log('🔥: A user disconnected');
        });
    });

    // fetch("https://api.saucerswap.finance/tokens")
    //     .then(async (res1) => {
    //         if (res1.status !== 200) {
    //             console.log("Getting tokens info request failed!")
    //             return;
    //         }
    //         let tokens = await res1.json()

    //         io.on('connection', (socket) => {

    //             socket.on('SubAdd', async ({ subs }) => {
    //                 // io.emit('getPricesResponse', data);
    //                 const [symbolId, symbolName, tokenSymbol, currency] = subs.split('~')
    //                 let tokenId = -1
    //                 for (let token of tokens) {
    //                     if (token.symbol === tokenSymbol) {
    //                         tokenId = token.id; break;
    //                     }
    //                 }
    //                 if (tokenId === -1) {
    //                     io.emit("m", "~~~~~~~~0")
    //                     return
    //                 }
    //                 const url = `https://api.saucerswap.finance/tokens/prices/latest/${tokenId}?interval=HOUR`;
    //                 const res = await fetch(url)
    //                 if (res.status === 200) {
    //                     const jsonData = await res.json()
    //                     const data = `subAdd~exchange~${jsonData.startTimestampSeconds}~${jsonData.timestampSeconds}~~~${jsonData.timestampSeconds}~~${jsonData.closeUsd}`
    //                     io.emit('m', data)
    //                     return
    //                 }
    //                 io.emit("m", "~~~~~~~~0")
    //             });

    //             socket.on('disconnect', () => {
    //                 console.log('🔥: A user disconnected');
    //                 clearInterval(intervalPrices);
    //             });
    //         });
    //     });
}

module.exports = globalDataSocket
