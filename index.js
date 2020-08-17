const newrelic = require('newrelic')
const uuid = require('uuid')

const {publishEvent, publishMetric, publishLog, publishTrace} = require('./utils')


//------- INIT ---------------------
const measureLatency= async ()=>{
    const insert_id = uuid.v1()
    let results = await Promise.all([publishMetric(insert_id), publishLog(insert_id), publishEvent(insert_id), publishTrace(insert_id)])
    newrelic.recordCustomEvent('TelemetryTimeToGlassChina', {
        "metricTimeToGlass": (results && results[0] && results[0].endTimeMs && results[0].startTimeMs && results[0].endTimeMs > 0) ? results[0].endTimeMs - results[0].startTimeMs: null,
        "logTimeToGlass": (results && results[1] && results[1].endTimeMs && results[1].startTimeMs && results[1].endTimeMs > 0) ? results[1].endTimeMs - results[1].startTimeMs: null,
        "eventTimeToGlass": (results && results[2] && results[2].endTimeMs && results[2].startTimeMs && results[2].endTimeMs > 0) ? results[2].endTimeMs - results[2].startTimeMs: null,
        "traceTimeToGlass": (results && results[3] && results[3].endTimeMs && results[3].startTimeMs && results[3].endTimeMs > 0) ? results[3].endTimeMs - results[3].startTimeMs: null,
        "location":process.env.NEWRELIC_LOCATION || ""
    })
} 
setInterval(measureLatency, 1000)

