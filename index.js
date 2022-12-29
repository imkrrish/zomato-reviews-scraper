// const axios = require("axios")
const cheerio = require("cheerio")
const puppeteer = require("puppeteer")
const moment = require("moment")

const anardanaZomatoLinks = [
  "https://www.zomato.com/ncr/anardana-vasant-vihar-new-delhi/reviews",
  "https://www.zomato.com/ncr/anardana-2-karkardooma-new-delhi/reviews",
  "https://www.zomato.com/ncr/anardana-sector-69-gurgaon/reviews",
  "https://www.zomato.com/ncr/anardana-r-k-puram-new-delhi/reviews"
]

var browserLoader = async function (link) {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  // await page.setUserAgent(
  //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
  // )
  await page.setViewport({ width: 1587, height: 937 })
  await page.goto(link)

  const commentButtons = await page.$x(
    '//*[@id="root"]/div/main/div/section/div/div/section/div/section/div[2]'
  )

  if (commentButtons) {
    commentButtons.forEach(async (button, i) => {
      await button.evaluate((button) => button.click())
    })
  }

  return { page, browser }
}

async function getreviews(link, dataArray) {
  const formatDate = (date) => {
    const dateArray = date.split(" ")
    var fromattedDate = moment()
      .subtract(dateArray[0], dateArray[1])
      .toISOString()
    return fromattedDate
  }

  try {
    const { page, browser } = await browserLoader(link)
    const data = await page.evaluate(() => {
      return document.documentElement.innerHTML
    })

    const $ = cheerio.load(data)

    const nameSelector =
      "#root > div > main > div > section > div > div > section > div > section > div > div > a > p"

    const ratingSelector =
      "#root > div > main > div > section > div > div > section > div > div > div > div > div > div > div:nth-child(1)"

    const dateSelector =
      "#root > div > main > div > section > div > div > section > div > div > p"

    const reviewsSelector =
      "#root > div > main > div > section > div > div > section > div > p"

    const replySelector =
      "#root > div > main > div > section > div > div > section > div > div.sc-guDjWT.hyGsHu > div"

    $(reviewsSelector).each((i, e) => {
      const obj = { plateform: "Zomato" }
      const review = $(e).text()

      $(nameSelector).each((index, element) => {
        if (index === i) {
          const name = $(element).text()
          obj.name = name
        }
      })

      $(ratingSelector).each((index, element) => {
        if (index === i) {
          const rating = $(element).text()
          obj.rating = rating
        }
      })

      $(dateSelector).each((index, element) => {
        if (index === i) {
          const date = $(element).text()
          const formattedDate = formatDate(date)
          obj.date = formattedDate
        }
      })
      obj.review = review

      $(replySelector).each((index, element) => {
        if (
          $(element).find("div > div > a > span").text().toLowerCase() ===
          "anardana"
        ) {
          if (index === i) {
            const reply = $(element)
              .find("div > div > div > div:nth-child(1)")
              .text()
            obj.reply = reply
          }
        }
      })
      dataArray.push(obj)
    })

    browser.close()
  } catch (err) {
    console.error(err)
    browser.close()
    main()
  }
}

async function main() {
  const dataArray = []
  anardanaZomatoLinks.forEach(async (link, index) => {
    await getreviews(link, dataArray)
    // console.log("🚀", index, dataArray)
  })
}

main()
