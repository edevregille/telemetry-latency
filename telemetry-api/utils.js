const axios = require('axios');

const ACCOUNT_ID = process.env.NEWRELIC_ACCOUNT_ID ;
const INSERT_KEY = process.env.NEWRELIC_INSERT_KEY;
const USER_API_KEY = process.env.NEWRELIC_USER_API_KEY ;
//------------------------------------------------------------------------------
const TELEMETRY_EVENT_API = `https://insights-collector.newrelic.com/v1/accounts/${ACCOUNT_ID}/events`;
const TELEMETRY_LOG_API = 'https://log-api.newrelic.com/log/v1';
const TELEMETRY_METRIC_API = 'https://metric-api.newrelic.com/metric/v1';
const TELEMETRY_TRACE_API = 'https://trace-api.newrelic.com/trace/v1';
//------------------------------------------------------------------------------
const WAIT_TIME = 50;
const MAX_RETRIES =30;

/***** PUBLISH TELEMETRY */

exports.publishMetric = async (insert_id) =>{
    const startTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000;
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
        });
        //console.log("Metric published");
        const endTimeMs = await queryNRDB(insert_id, "metric");
        return {startTimeMs, endTimeMs};
        
    } catch(error){
       console.log("Error publishing Metric", error);
       return null;
    }
}

exports.publishLog = async (insert_id) =>{
    const startTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000;
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
        });
        //console.log("Log published");
        const endTimeMs = await queryNRDB(insert_id, "log");
        return {startTimeMs, endTimeMs};
        
    } catch(error){
       console.log(error);
       return null;
    }
}


exports.publishTrace = async (insert_id) =>{
    const startTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000;
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
        });
        //console.log("Trace published");
        const endTimeMs = await queryNRDB(insert_id, "trace");
        return {startTimeMs, endTimeMs};
        
    } catch(error){
       console.log(error);
       return null;
    }
}


exports.publishEvent = async (insert_id) =>{
    const startTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000;
    try {
        await axios({
            method:"POST",
            url: TELEMETRY_EVENT_API,
            headers: {
              'x-insert-key': INSERT_KEY,
              'Content-Type': 'application/json'
            },
            data: JSON.stringify([{"eventType":"TimeToGlass", "insertId": insert_id}])
        });
        //console.log("Event published");
        const endTimeMs = await queryNRDB(insert_id, "event");
        return {startTimeMs, endTimeMs};
        
    } catch(error){
       console.log(error);
       return null;
    }
}
  
const queryNRDB = async(insert_id, type) => {
    // Initiate query value depending on type
    let nrql = ''; 
    switch (type){
        case "event":
            nrql = `SELECT count(*) FROM TimeToGlass WHERE insertId = '${insert_id}'`;
            break;
        case "trace":
            nrql = `SELECT count(*) FROM Span WHERE trace.id = '${insert_id}'`;
            break;
        case "metric":
            nrql = `SELECT count(*) FROM Metric WHERE insert_id = '${insert_id}'`;
            break;
        case "log":
            nrql = `SELECT count(*) FROM Log WHERE insert_id = '${insert_id}'`;
            break;
    }
    let retries = 0, endTimeMs =-1, endloop =false
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    while(retries <=MAX_RETRIES && endloop == false){
        await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
        try{
            let response = await axios({
                method:"POST",
                url: "https://api.newrelic.com/graphql",
                headers:{
                    'Content-type': 'application/json',
                    'API-Key': USER_API_KEY,
                },
                data: JSON.stringify({query: `{actor{account(id:${ACCOUNT_ID}){
                    nrql(query:"${nrql}"){
                        results
                    }
                }}}`})
            });
            retries ++
            //console.log(`Retry ${retries} for ${type} and result is ${response.data.data.actor.account.nrql.results[0].count}`)
            if (response.status >= 200 && response.status<=399 && response.data && response.data.data && response.data.data.actor.account.nrql.results && response.data.data.actor.account.nrql.results[0].count >0) {
                endTimeMs = new Date().getTime()+ new Date().getTimezoneOffset()*60*1000;
                //console.log(`Retry ${retries} successful - ${endTimeMs}`);
                endloop=true;
            }
        }catch(e){
            console.log("ERROR - Exception querying telemetry data:", JSON.stringify(e));
        }
    }
    return endTimeMs
}