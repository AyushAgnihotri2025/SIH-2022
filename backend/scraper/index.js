/**
 * This file is the root scraper
 */

const logger = (message) => console.log("✅ " + message);

const puppeteer = require("puppeteer-extra");
const data = require("./input.json");
var fs = require("fs");
async function single_page_scraper(URL) {
  logger("STARTED SCRAPPING FOR ", URL);
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    slowMo: 10,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(URL, { timeout: 0 });
  const university_names = await page.evaluate(() => {
    let names = Array.from(document.querySelectorAll("b"));
    let names_final = [];
    names.map((each) => {
      console.log(each.innerText);
      if (each.innerText) names_final.push(each.innerText);
    });
    return names_final;
  });
  // const f = await page.$('[class="box200"]');
  // console.log(f)
  const university_address = await page.evaluate((page) => {
    let names = Array.from(document.getElementsByClassName("box200"));
    console.log(names);
    let names_final = [];

    for (let i = 0; i < names.length; i++) {
      let final_state = names[i + 1].innerHTML.trim();

      names_final.push({
        address: names[i].innerHTML
          .trim()
          .replace("  ", "")
          .replace("<br>", ""),
        state: final_state.substring(0, final_state.indexOf("\n")),
      });
      i += 1;
    }
    return names_final;
  });
  let final_data = [];
  let total_unis = university_names.length;
  for (let i = 0; i < total_unis; i++) {
    final_data.push({
      university_name: university_names[i],
      ...university_address[i],
    });
  }
  console.log(final_data);
  await browser.close();
  return final_data;
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function scrape_university(university_type) {
  //to call single_page_extraction for each url

  let state = data.types[university_type];
  let final_data = [];

  for (let i = 0; i < state.length; i++) {
    try {
      let res = await single_page_scraper(state[i]);
      console.log(res);
      Array.prototype.push.apply(final_data, res);
    } catch (err) {
      console.log(err);
    }
  }
  fs.writeFile(
    `${university_type}.json`,
    JSON.stringify({ state: final_data }),
    "utf8",
    () => {
      logger("SUCCESSFULLY UPDATED THE FILES");
    }
  );
}

//run these functions one at a time and then comment the other three
// scrape_university('state');
// scrape_university('central')
scrape_university('deemed');

