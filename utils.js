const axios = require('axios')

const ACCOUNT_ID = process.env.NEWRELIC_ACCOUNT_ID 
const INSERT_KEY = process.env.NEWRELIC_INSERT_KEY
const QUERY_KEY = process.env.NEWRELIC_QUERY_KEY 
//------------------------------------------------------------------------------
const TELEMETRY_EVENT_API = `https://insights-collector.newrelic.com/v1/accounts/${ACCOUNT_ID}/events`
const TELEMETRY_LOG_API = 'https://log-api.newrelic.com/log/v1'
const TELEMETRY_METRIC_API = 'https://metric-api.newrelic.com/metric/v1'
const TELEMETRY_TRACE_API = 'https://trace-api.newrelic.com/trace/v1'
//------------------------------------------------------------------------------
const QUERY_URL = `https://insights-api.newrelic.com/v1/accounts/${ACCOUNT_ID}/query?nrql=`
//------------------------------------------------------------------------------
const WAIT_TIME = 200

/***** PUBLISH TELEMETRY */

exports.publishMetric = async (insert_id) =>{
    const startTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000
    try {
        await axios({
            method:"POST",
            url: TELEMETRY_METRIC_API,
            headers: {
            'Api-Key': INSERT_KEY,
            'Content-Type': 'application/json'
            },
            data: JSON.stringify([{ 
            "metrics":[{ 
                "name":"timetoglass",
                "type":"gauge",
                "timestamp": new Date().getTime(),
                "value": 1,
                "attributes":{
                "insert_id": insert_id
                }
            }]}])
        })
        const endTimeMs = await queryMetricFunction(insert_id)
        return {startTimeMs, endTimeMs}
        
    } catch(error){
       console.log(error)
       return null
    }
}

exports.publishLog = async (insert_id) =>{
    const startTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000
    try {
        await axios({
            method:"POST",
            url: TELEMETRY_LOG_API,
            headers: {
            'Api-Key': INSERT_KEY,
            'Content-Type': 'application/json'
            },
            data: JSON.stringify([{"logs": [{
                    "message":"Log via API to measure new relic time to glass",
                    "insert_id": insert_id
                }]
            }])
        })
        const endTimeMs = await queryLogFunction(insert_id)
        return {startTimeMs, endTimeMs}
        
    } catch(error){
       console.log(error)
       return null
    }
}


exports.publishTrace = async (insert_id) =>{
    const startTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000
    try {
        await axios({
            method:"POST",
            url: TELEMETRY_TRACE_API,
            headers: {
            'Api-Key': INSERT_KEY,
            'Content-Type': 'application/json',
            'Data-Format': 'newrelic',
            'Data-Format-Version': '1'
            },
            data: JSON.stringify([{"spans": [{
                    "trace.id": insert_id,
                    "id": "ABC",
                    "attributes": {
                        "duration.ms": 12.53,
                        "name": "/home"
                    }
                }]
            }])
        })
        const endTimeMs = await queryTraceFunction(insert_id)
        return {startTimeMs, endTimeMs}
        
    } catch(error){
       console.log(error)
       return null
    }
}


exports.publishEvent = async (insert_id) =>{
    const startTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000
    try {
        await axios({
            method:"POST",
            url: TELEMETRY_EVENT_API,
            headers: {
              'x-insert-key': INSERT_KEY,
              'Content-Type': 'application/json'
            },
            data: JSON.stringify([{"eventType":"TimeToGlass", "insertId": insert_id}])
        })
        const endTimeMs = await queryEventFunction(insert_id)
        return {startTimeMs, endTimeMs}
        
    } catch(error){
       console.log(error)
       return null
    }
}


//------ QUERY TELEMETRY DATA FUNCTIONS --------------------------------------------------------
const queryEventFunction = async (insert_id) => {
    let retries = 0, endTimeMs =-1, endloop =false
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    while(retries <=30 && endloop == false){
        await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
        let response = await axios({
            method:"GET",
            url: `${QUERY_URL}${encodeURIComponent(`SELECT count(*) FROM TimeToGlass WHERE insertId = '${insert_id}'`)}`,
            headers: {'X-Query-Key': QUERY_KEY}
        })
        retries ++
        
        if (response.status >= 200 && response.status<=399 && response.data && response.data.results && response.data.results[0].count >0) {
            endTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000
            //console.log('successfully queried Event with insert ID ' + insert_id)
            endloop=true
        }
    }
    return endTimeMs
}
  
const queryLogFunction = async(insert_id) => {
    let retries = 0, endTimeMs =-1, endloop =false
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    while(retries <=30 && endloop == false){
        await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
        let response = await axios({
            method:"GET",
            url: `${QUERY_URL}${encodeURIComponent(`SELECT count(*) FROM Log WHERE insert_id = '${insert_id}'`)}`,
            headers: {'X-Query-Key': QUERY_KEY}
        })
        retries ++
        if (response.status >= 200 && response.status<=399 && response.data && response.data.results && response.data.results[0].count >0) {
            endTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000
            //console.log('successfully queried Log with insert ID ' + insert_id)
            endloop=true
        }
    }
    return endTimeMs
}
  
  const queryMetricFunction = async (insert_id) =>{
    let retries = 0, endTimeMs =-1, endloop =false
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    while(retries <=30 && endloop == false){
        await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
        let response = await axios({
            method:"GET",
            url: `${QUERY_URL}${encodeURIComponent(`SELECT count(*) FROM Metric WHERE insert_id = '${insert_id}'`)}`,
            headers: {'X-Query-Key': QUERY_KEY}
        })
        retries ++
        if (response.status >= 200 && response.status<=399 && response.data && response.data.results && response.data.results[0].count >0) {
            endTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000
            //console.log('successfully queried Metric with insert ID ' + insert_id)
            endloop=true
        }
    }
    return endTimeMs
  }
  
  const queryTraceFunction = async (insert_id)=> {
    let retries = 0, endTimeMs =-1, endloop =false
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    while(retries <=30 && endloop == false){
        await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
        let response = await axios({
            method:"GET",
            url: `${QUERY_URL}${encodeURIComponent(`SELECT count(*) FROM Span WHERE trace.id = '${insert_id}'`)}`,
            headers: {'X-Query-Key': QUERY_KEY}
        })
        retries ++

        if (response.status >= 200 && response.status<=399 && response.data && response.data.results && response.data.results[0].count >0) {
            endTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000
            //console.log('successfully queried Trace with insert ID ' + insert_id)
            endloop=true
        }
    }
    return endTimeMs
  }
  