const fs = require('fs')
const csv_parser = require('csv-parser');

const read_csv = async (path) => {
	try{
		results = {headers: [], data: []}
		return new Promise((resolve, reject) => {
			fs.createReadStream(path)
			.pipe(csv_parser())
            .on('headers', (headers) => {
                results.headers = headers;
            })
			.on('data', (data) => results.data.push(data))
			.on('end', () => resolve(results))
			.on('error', (err) => reject(err))
		})
  	}
	catch(err){
		console.error('file_helper:read_csv:err', err);
		throw err;
	}
};

module.exports = {
    read_csv,
}