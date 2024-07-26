import { Relay } from 'nostr-tools/relay';
import { useWebSocketImplementation } from 'nostr-tools/relay';
import WebSocket from 'ws';
import fs from 'fs/promises';
import { bech32 } from 'bech32';

const filePath = '../../datas/nostr.json'

useWebSocketImplementation(WebSocket);

async function readJsonData() {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading JSON data:', error);
        return [];
    }
}

async function writeJsonData(data) {
    try {
        data.sort((a, b) => b.timestamp - a.timestamp);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing JSON data:', error);
    }
}

function npubToHex(npub) {
  const { words } = bech32.decode(npub);
  const data = bech32.fromWords(words);
  return Buffer.from(data).toString('hex');
}

async function main() {
    try {
        let jsonData = await readJsonData();
        const relay = await Relay.connect('wss://relay.damus.io');
        const sub = relay.subscribe([
        {
            authors: [npubToHex('npub1klkk3vrzme455yh9rl2jshq7rc8dpegj3ndf82c3ks2sk40dxt7qulx3vt')],
            limit: 100,
            kinds: [1,6]
        },
        ], {
            onevent(event) {
                const date = new Date(event.created_at * 1000);
                const readableDate = date.toLocaleString();
                let content = '';
                if (event.kind == 6) {
                    try{
                        content = JSON.parse(event.content).content;
                    } catch(error){}                  
                } else {
                  content = event.content;
                }
                const newEvent = {
                  content: content,
                  timestamp: event.created_at.toString(),
                  date: readableDate,
                  id: event.id,
                  kind: event.kind
                };

                const exists = jsonData.some(item => item.timestamp === newEvent.timestamp);
                if (!exists) {
                  jsonData.push(newEvent);
                }
            },
            oneose() {
                sub.close();
                relay.close();
            }
        });
        const handleTimeout = async () => {
            relay.close();          
            await writeJsonData(jsonData);
        };
        setTimeout(handleTimeout, 10000);
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

main();
