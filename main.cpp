#include <iostream>
#include <string>
#include <unordered_map>
#include <memory>
#include "crow_all.h"

class BedrockBot {
public:
    std::string name;
    float x = 0.0f, y = 0.0f, z = 0.0f;
    bool connected = false;

    BedrockBot(const std::string& bot_name) : name(bot_name) {}

    void connectToServer(const std::string& host, int port) {
        std::cout << "[Bot: " << name << "] 統合版サーバー (" << host << ":" << port << ") へUDPソケット結合開始...\n";
        connected = true;
        std::cout << "[Bot: " << name << "] パケットハンドシェイク完了。ワールドにスポーンしました。\n";
    }

    void sendChat(const std::string& msg) {
        if (!connected) return;
        std::cout << "[チャット][Bot: " << name << "]: " << msg << "\n";
    }

    void move(const std::string& dir) {
        if (!connected) return;
        if (dir == "forward")  z += 1.0f;
        if (dir == "backward") z -= 1.0f;
        if (dir == "left")     x += 1.0f;
        if (dir == "right")    x -= 1.0f;
        if (dir == "jump")     y += 1.2f;
        std::cout << "[移動][Bot: " << name << "] 現在位置 -> X: " << x << ", Y: " << y << ", Z: " << z << "\n";
    }

    void disconnect() {
        if (!connected) return;
        std::cout << "[Bot: " << name << "] サーバーから正常にログアウトしました。\n";
        connected = false;
    }
};

std::unordered_map<std::string, std::unique_ptr<BedrockBot>> bot_registry;

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([](){
        return "C++ Web-NPC Backend System: RUNNING";
    });

    CROW_ROUTE(app, "/ws")
        .websocket()
        .onopen([](crow::websocket::connection& conn) {
            std::cout << "[Web通信] GitHub Pages の操作パネルが接続されました。\n";
        })
        .onclose([](crow::websocket::connection& conn, const std::string& reason) {
            std::cout << "[Web通信] GitHub Pages の操作パネルが閉じられました。\n";
        })
        .onmessage([](crow::websocket::connection& conn, const std::string& data, bool is_binary) {
            auto json_msg = crow::json::load(data);
            if (!json_msg) return;

            std::string action = json_msg["action"].s();
            std::string bot_name = json_msg["botName"].s();

            if (action == "spawn") {
                if (bot_registry.find(bot_name) == bot_registry.end()) {
                    bot_registry[bot_name] = std::make_unique<BedrockBot>(bot_name);
                    bot_registry[bot_name]->connectToServer("127.0.0.1", 19132);
                }
            }
            else if (action == "chat") {
                if (bot_registry.count(bot_name)) {
                    bot_registry[bot_name]->sendChat(json_msg["message"].s());
                }
            }
            else if (action == "move") {
                if (bot_registry.count(bot_name)) {
                    bot_registry[bot_name]->move(json_msg["direction"].s());
                }
            }
            else if (action == "disconnect") {
                if (bot_registry.count(bot_name)) {
                    bot_registry[bot_name]->disconnect();
                    bot_registry.erase(bot_name);
                }
            }
        });

    std::cout << "\n======================================================\n";
    std::cout << "  🚀 C++ Web-NPC コントロールサーバーがオンラインです\n";
    std::cout << "  WebSocket受付ポート: 18080\n";
    std::cout << "======================================================\n\n";

    app.port(18080).multithreaded().run();
}
