import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';

const linksData = "datas/links.json"; 
const resultData = "../../datas/datas.json"; 

async function readJsonFile(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      const data = await fs.readFile(absolutePath, 'utf8');
      const jsonData = JSON.parse(data);
      return jsonData;
    } catch (error) {
      console.error('Error reading JSON file:', error);
    }
}

async function getLinkDatas(link) {
    let data = {};
    try {
        const url = link;
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('title').text();
        const metaDescription = $('meta[name="description"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');
        
        data = {
            link: link,
            title: title,
            description: metaDescription,
            ogimage: ogImage
        };
    } catch(err) {
        return null;
    }
  
    return data;
}

async function writeJsonFile(filePath, data) {
    try {
        const absolutePath = path.resolve(filePath);
        const json = JSON.stringify(data, null, 2);
        await fs.writeFile(absolutePath, json, 'utf8');
        console.log('File successfully written to', absolutePath);
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
  }

async function init() {
    console.log("Start collecting...")
    const jsonData = await readJsonFile(linksData);
    const datas = [];

    if (jsonData && Array.isArray(jsonData)) {
        for (const item of jsonData) {
            if (item.link) {
                try {
                    let linkData = await getLinkDatas(item.link);
                    if (linkData) {
                        if (item.title) {
                            linkData.title = item.title;
                        }
                        if (item.description) {
                            linkData.description = item.description;
                        }
                        if (item.date) {
                            linkData.date = item.date;
                        }
                        if (item.author) {
                            linkData.author = item.author;
                        }
                        if (item.category) {
                            linkData.category = item.category;
                        }
                        if (item.type) {
                            linkData.type = item.type;
                        }
                        datas.push(linkData);
                    }
                    
                } catch (error) {
                    console.error('Error fetching link data:', error);
                }
            }
        };
    } else {
        console.error('Invalid JSON data');
    }
    await writeJsonFile(resultData, datas);
}
init()

