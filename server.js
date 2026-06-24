const mineflayer = require('mineflayer');
const { WebSocketServer } = require('ws');
const http = require('http');

// 1. マイクラサーバーに接続するボットの設定
const bot = mineflayer.createBot({
    host: 'localhost',
    port: 25565,
    username: 'Goku_Bot',
    version: '1.20.1',
    skipValidation: true
});

// 2. 自宅サーバーからテクスチャ画像を配信するためのHTTPサーバー (ポート: 8081)
// ※簡易的に、Web用の緑の草ブロックドットテクスチャ（Base64）を出力します
const textureBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABw2UxFAAAADFBMVEVFXG59jZ6drb7///8Aip9XAAAAAXRSTlMAQObYZgAAADFJREFUCNdjYOBgYGBgYGFgYPrAwPD/AcP///8ZGP6/YGBgYwAxmBiYwByGBlwK8AEAorwNf69E6p8AAAAASUVORK5CYII=";

http.createServer((req, res) => {
    if (req.url === '/texture.png') {
        const imData = textureBase64.split(',')[1];
        const img = Buffer.from(imData, 'base64');
        res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' });
        res.end(img);
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(8081, () => {
    console.log('📦 テクスチャ配信サーバーがポート 8081 で起動しました！');
});

// 3. WEB画面(複数人)と通信するためのWebSocketサーバー (ポート: 8080)
const wss = new WebSocketServer({ port: 8080 });
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'move') {
                bot.setControlState('forward', data.forward);
                bot.setControlState('back', data.back);
                bot.setControlState('left', data.left);
                bot.setControlState('right', data.right);
                bot.setControlState('jump', data.jump);
            }
        } catch (e) {}
    });
});

bot.on('spawn', () => {
    console.log('🤖 Goku_Bot がマイクラサーバーに正常にログインしました！');
    setInterval(() => {
        if (clients.size === 0) return;
        const status = JSON.stringify({
            type: 'status',
            pos: bot.entity.position,
            inventory: bot.inventory.items().map(item => ({ name: item.name, count: item.count }))
        });
        for (const client of clients) {
            if (client.readyState === 1) client.send(status);
        }
    }, 100);
});
