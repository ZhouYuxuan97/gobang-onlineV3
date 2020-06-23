# Gobang-OnlineV3
Simple Online Gobang Game, learning basic knowledge of node.js and websocket, using package of websocket.io.<br>
Previous demo [Gobang-OnlineV2](https://github.com/ZhouYuxuan97/gobang-onlineV2)

## Compare to V2 add:
1. Room function
2. Connection detection(heartbeat)
3. fix the bugs when client leave game
4. Optimized notification and reset mechanism when leave a room and disconnection

## Existing function:
1. Join/Leave a room
2. Playing game
3. Restart game(need both sides approved)
4. View in-playing game
5. Connection detection

### Expect to add:
1. Main page contains room list
2. Count online people 
3. Use username to log-in, store the game 
4. Return the game after refreshing or offline suddenly
5. Set checkerboard size
6. Beautify the interface


Final goal:
Move the server to Java SpringBoot, use nginx and redis 
