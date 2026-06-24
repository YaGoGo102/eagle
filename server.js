const mineflayer = require('mineflayer');
const { WebSocketServer } = require('ws');

// 1. マイクラサーバーに接続するボットの設定
const bot = mineflayer.createBot({
    host: 'localhost',
    port: 25565,
    username: 'Goku_Bot',
    version: '1.20.1',
    skipValidation: true
});

// 2. WEB画面(複数人)と通信するためのWebSocketサーバーを起動
const wss = new WebSocketServer({ port: 8080 });
const clients = new Set();

wss.on('connection', (ws) => {
    console.log(`🌐 新しいプレイヤーがWebパネルに接続しました！ (現在: ${clients.size + 1}人)`);
    clients.add(ws);

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`📴 プレイヤーが切断しました。 (現在: ${clients.size}人)`);
    });

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
        } catch (e) {
            console.error('パケット解析エラー:', e);
        }
    });
});

// 3. ボットがマイクラ世界にログインしたときの処理
bot.on('spawn', () => {
    console.log('🤖 Goku_Bot がマイクラサーバーに正常にログインしました！');
    
    setInterval(() => {
        if (clients.size === 0) return;

        const status = JSON.stringify({
            type: 'status',
            pos: bot.entity.position,
            hp: bot.health,
            food: bot.food,
            inventory: bot.inventory.items().map(item => ({
                name: item.name,
                count: item.count
            }))
        });

        for (const client of clients) {
            if (client.readyState === 1) {
                client.send(status);
            }
        }
    }, 100);
});

bot.on('error', (err) => console.log('⚠️ ボットエラー:', err));
bot.on('end', () => console.log('❌ サーバーから切断されました。'));
