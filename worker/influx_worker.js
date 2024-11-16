require('dotenv').config();

const {InfluxDB} = require('@influxdata/influxdb-client');
const { AuthorizationsAPI, BucketsAPI } = require('@influxdata/influxdb-client-apis');
const { Point } = require('@influxdata/influxdb-client');


class InfluxWoker {
    constructor(){
        const {INFLUX_BUCKET: bucket, INFLUX_ORG: org, INFLUX_TOKEN: token, INFLUX_URL: url} = process.env;
        this.org = org;
        this.bucke = bucket;
        this.influxdb = new InfluxDB({url, token});
        this.writeClient = this.influxdb.getWriteApi(org, bucket, 'ms');
        this.queryClient = this.influxdb.getQueryApi(org);
    }

    createPoint(measurement, tags, fields, ts){
        const point = new Point(measurement);
            
        //create tags
        Object.keys(tags).forEach((tag) => {
            point.tag(tag, tags[tag]);
        });

        //create fields
        Object.keys(fields).forEach((field) => {
            point.floatField(field, fields[field])
        });

        //enter timestamp
        point.timestamp(ts);
        console.log('point: ', point);

        return point;
    }

    async writePoint(measurement, tags, fields, ts){
        try{
            const point = this.createPoint(measurement, tags, fields, ts);
            
            this.writeClient.writePoint(point);
            await this.writeClient.close();
        }
        catch(err){
            console.log('influx_worker:err', err);
            throw err;
        }
    }

    async writePoints(points){
        try{
            this.writeClient.writePoints(points);
            await this.writeClient.flush();
        }
        catch(err){
            console.log('influx_worker:err', err);
            throw err;
        }
    }

    openWriteAPI(){
        try{
            if(this.writeClient != null) return;
            this.writeClient = this.influxdb.getWriteApi(this.org, this.bucket, 'ms');
        }
        catch(err){
            console.log('influx_worker:err', err);
            throw err;
        }
    }

    async closeWriteAPI(){
        try{    
            await this.writeClient.close();
            this.writeClient = null;
        }
        catch(err){
            console.log('influx_worker:err', err);
            throw err;
        }
    }
}

const influxWorker = new InfluxWoker();
module.exports = influxWorker;