const Koa = require('koa');
const app = new Koa();
const Weather = require('./lib/weather');
const Data = require('./lib/data');

app.use(async ctx => {
    //If user had provide target area id, return the weather info of area
    const targetArea = ctx.query.area;
    const currentTime = Date.now();
    const eorzeaTime = getEorzeaTime(currentTime);
    if(targetArea){
        const weatherInfo = getWeather(currentTime, targetArea);
        ctx.body = {
            realTime: Date(currentTime),
            eorzeaTime,
            weatherInfo
        }
        return;   
    }
    //Otherwise, provide weather info of all area.
    const weatherList = {};
    for(let i = 0; i < Object.keys(Data).length; i++){
        const area = Object.keys(Data)[i];
        const weatherInfo = getWeather(currentTime, area);
        weatherList[area] = weatherInfo;
    }
    ctx.body = {
        realTime: Date(currentTime),
        eorzeaTime,
        weatherList
    }
});

app.listen(5555);
console.log('Start at 5555 port.');

function getWeather(currentTime, area){
    const EORZEA_8_HOUR = 8 * 175 * 1000; // number of real life milliseconds in 8 Eorzean hours

    const areaData = getAreaData(area);
    const currentWeather =  areaData[Weather.calculateWeatherValue(currentTime)];
    const previousWeather = areaData[Weather.calculateWeatherValue(currentTime - EORZEA_8_HOUR)];
    const nextWeather = areaData[Weather.calculateWeatherValue(currentTime + EORZEA_8_HOUR)];
    return {
        currentWeather,
        previousWeather,
        nextWeather,
    };
}

function getEorzeaTime(currentTime){
    const eorzeaTime = Weather.convertToNearestEorzeanIntervalStart(currentTime);
    return eorzeaTime;
}

function getAreaData(area){
    const areaData = Data[area];
    let result = [];
    for (const weather of areaData) {
        result = result.concat(Array(weather.chance).fill(weather.name));
    }
    return result;
};