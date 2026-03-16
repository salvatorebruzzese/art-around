/*
File: mongo.js
Author: Fabio Vitali
Version: 1.0 
Last change on: 10 April 2021


Copyright (c) 2021 by Fabio Vitali

   Permission to use, copy, modify, and/or distribute this software for any
   purpose with or without fee is hereby granted, provided that the above
   copyright notice and this permission notice appear in all copies.

   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
   SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
   OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
   CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/
let fn = "/public/data/country-by-capital-city.json"
let dbname = "countries"
let fieldname = "country"

const mongoose = require("mongoose");
const fs = require("fs").promises;
const template = require(global.rootDir + "/scripts/tpl.js");

const capitalSchema = new mongoose.Schema({
	country: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: false
	}
});

const Capital = mongoose.model("Capital", capitalSchema);
mongoose.set('strictQuery', false);



// //localhost
// exports.create = async () => {
// 	let debug = []
// 	try {
// 		const mongouri = `mongodb://localhost:27017/${dbname}?writeConcern=majority`;

exports.create = async (credentials) => {
    let debug = [];
    try {
        const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}/${dbname}?authSource=admin&writeConcern=majority`;
        await mongoose.connect(mongouri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
		debug.push(`Connected to ${credentials.site}'s MongoDB instance using Mongoose...`)
		debug.push(`Trying to read JSON file...`)
        let doc = await fs.readFile(rootDir + fn, 'utf8')
        let data = JSON.parse(doc)
        debug.push(`... read ${data.length} records successfully. `)
        debug.push(`Trying to remove all records in table '${dbname}'... `)
        
        let cleared = await Capital.deleteMany({});
        debug.push(`... ${cleared.deletedCount || 0} records deleted.`)

        debug.push(`Trying to add ${data.length} new records... `)
		let insertedCount = 0;
		await Capital.insertMany(data).then(() => {
			insertedCount += data.length;
		});

		debug.push(`... ${insertedCount || 0} records added.`)
        await mongoose.connection.close();
        debug.push("Managed to close connection to MongoDB.")
		return {
			message: `<h1>Removed ${cleared?.deletedCount || 0} records, added ${insertedCount || 0} records</h1>`, 
			debug: debug
		}
	} catch (e) {
		e.debug = debug
		return e
	}
}



// // localhost
// exports.search = async (q) => {
// 	const mongouri = `mongodb://localhost:27017/${dbname}?writeConcern=majority`;
exports.search = async (q, credentials) => {
    const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}/${dbname}?authSource=admin&writeConcern=majority`;

    let debug = [];
    let data = { query: q.country, result: null };
    try {
        await mongoose.connect(mongouri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        debug.push(`Trying to connect to MongoDB using Mongoose locally...`);
        debug.push("Querying collection...");
        const countries = await Capital.find({
            country: { $regex: new RegExp(q.country, "i") },
        });

        if (countries.length === 0) {
            debug.push("No countries found for the given query.");
        } else {
	        debug.push(`Found the following ${countries.length} countries: ${countries.map(country => country.country).join(", ")}`);
		}
		
        mongoose.connection.close();
        debug.push("MongoDB disconnected...");

        data.result = countries.map(country => {
            const { _id, __v, ...rest } = country._doc;
            return rest;
        });
        data.debug = debug;
        if (typeof q === "object" && q.hasOwnProperty("ajax")) {
            return data;
         } else {
            const out = await template.generate("mongoose.html", data);
            return out;
         }
    } catch (e) {
        console.error(e);
        data.debug = debug;
        data.error = e;
        return data;
    }
};


/* Untested */
// https://stackoverflow.com/questions/39599063/check-if-mongodb-is-connected/39602781
exports.isConnected = async function () {
	let client = await mongoose.connect(mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
	return !!client && !!client.topology && client.topology.isConnected()
}