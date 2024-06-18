const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

// URL of the page we want to scrape
const url = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3";


// Async function which scrapes the data
async function scrapeData() {
  try {
    // getURL
    const { data } = await axios.get(url);
    // get HTML element from the URL
    const $ = cheerio.load(data);
    // Select the element you want to scrape
    const listItems = $(".plainlist ul li");
    // initialize Stores data 変数 
    const countries = [];
    // Use .each method to loop through the li we selected
    listItems.each((idx, el) => {
      // Object holding data for each country/jurisdiction
      const country = { name: "", iso3: "" };
      // Select the text content of a and span elements
      // Store the textcontent in the above object
      country.name = $(el).children("a").text();
      country.iso3 = $(el).children("span").text();
      // Populate countries array with country data
      countries.push(country);
    });
    // Logs countries array to the console
    //.logと違い、階層がコンソールに表示される
    console.dir(countries);
    // Write countries array in countries.json file
    fs.writeFile("coutries.json", JSON.stringify(countries, null, 2), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Successfully written data to file");
      });
    } catch (err) {
      console.error(err);
    }
  }
  // Invoke the above function
  scrapeData();

  //参考
  //https://www.freecodecamp.org/news/how-to-scrape-websites-with-node-js-and-cheerio/