import { WebSocketServer } from "ws";

import { verifyToken } from "./auth.js";

import Room from "./models/Room.js";

import Message from "./models/Message.js";

import User from "./models/User.js";

import { sub, publish } from "./redis.js";

const rooms = new Map(); // roomId -> Map<ws, user>

const sockets = new Map(); // ws -> metadata


function broadcast(roomId, payload, except = null) {
  const clients = rooms.get(roomId);

  if (!clients) return;

  const encoded = JSON.stringify(payload);

  for (const ws of clients.keys()) {
    if (ws !== except && ws.readyState === 1) {
      ws.send(encoded);
    }
  }
}


// Get online and offline users for a room
async function presence(roomId) {
  const clients = rooms.get(roomId);

  const onlineUsers = clients
    ? [...clients.values()].map(x => ({
        id: x.id,
        username: x.username,
        avatarColor: x.avatarColor
      }))
    : [];

  const room = await Room.findById(roomId).populate(
    "members",
    "username avatarColor"
  );

  if (!room) {
    return {
      onlineUsers,
      offlineUsers: []
    };
  }

  const onlineIds = new Set(
    onlineUsers.map(user => user.id)
  );

  const offlineUsers = room.members
    .filter(user => !onlineIds.has(user._id.toString()))
    .map(user => ({
      id: user._id.toString(),
      username: user.username,
      avatarColor: user.avatarColor
    }));

  return {
    onlineUsers,
    offlineUsers
  };
}

async function globalPresence() {
  const onlineIds = new Set(
    [...sockets.values()].map(user => user.id)
  );

  const allUsers = await User.find({})
    .select("_id username avatarColor")
    .lean();

  return allUsers.map(user => ({
    id: user._id.toString(),
    username: user.username,
    avatarColor: user.avatarColor,
    online: onlineIds.has(user._id.toString())
  }));
}

async function broadcastGlobalPresence() {
  const users = await globalPresence();

  const payload = JSON.stringify({
    type: "global_presence",
    users
  });

  for (const ws of sockets.keys()) {
    if (ws.readyState === 1) {
      ws.send(payload);
    }
  }
}

function addToRoom(ws, roomId, user) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  rooms.get(roomId).set(ws, user);

  sockets.get(ws).rooms.add(roomId);
}


function removeFromRoom(ws, roomId) {
  const clients = rooms.get(roomId);

  if (!clients) return;

  clients.delete(ws);

  sockets.get(ws)?.rooms.delete(roomId);

  if (!clients.size) {
    rooms.delete(roomId);
  }
}


export function createWebSocketServer(server) {

  const wss = new WebSocketServer({ server });


  wss.on("connection", async (ws, request) => {

    const url = new URL(
      request.url,
      "http://localhost"
    );

    const token = url.searchParams.get("token");


    try {

      const user = verifyToken(token);


      const dbUser = await User.findById(user.id);


      if (!dbUser) {
        throw new Error("User not found");
      }


      sockets.set(ws, {

        id: dbUser._id.toString(),

        username: dbUser.username,

        avatarColor: dbUser.avatarColor,

        rooms: new Set()

      });

      await broadcastGlobalPresence();

      ws.send(
        JSON.stringify({
          type: "connected",
          userId: user.id
        })
      );


      ws.on("message", async raw => {

        try {

          const data = JSON.parse(
            raw.toString()
          );

          const meta = sockets.get(ws);


          if (!meta) return;


          // =========================
          // JOIN ROOM
          // =========================

          if (data.type === "join_room") {

            const room = await Room.findById(
              data.roomId
            );


            if (!room) return;


            addToRoom(
              ws,
              room._id.toString(),
              meta
            );


            const roomPresence =
              await presence(
                room._id.toString()
              );


            broadcast(
              room._id.toString(),
              {
                type: "presence",

                users:
                  roomPresence.onlineUsers,

                offlineUsers:
                  roomPresence.offlineUsers
              }
            );


            ws.send(
              JSON.stringify({
                type: "room_joined",

                roomId:
                  room._id.toString()
              })
            );

          }


          // =========================
          // TYPING
          // =========================

          if (data.type === "typing") {

            broadcast(

              data.roomId,

              {
                type: "typing",

                username:
                  meta.username,

                isTyping:
                  Boolean(data.isTyping)
              },

              ws

            );

          }


          // =========================
          // MESSAGE
          // =========================

          if (data.type === "message") {

            const text =
              String(data.text || "").trim();


            if (
              !text ||
              text.length > 1000
            ) {
              return;
            }


            const room =
              await Room.findById(
                data.roomId
              );


            if (!room) return;


            const message =
              await Message.create({

                roomId:
                  room._id,

                userId:
                  meta.id,

                username:
                  meta.username,

                text

              });


            const payload = {

              type: "message",

              message: {

                id:
                  message._id.toString(),

                roomId:
                  room._id.toString(),

                username:
                  meta.username,

                userId:
                  meta.id,

                text,

                reactions: {},

                createdAt:
                  message.createdAt

              }

            };


            broadcast(
              data.roomId,
              payload
            );


            await publish({

              ...payload,

              source:
                process.pid

            });

          }


          // =========================
          // REACTION
          // =========================

          if (data.type === "reaction") {

            const message =
              await Message.findById(
                data.messageId
              );


            if (!message) return;


            const emoji =
              String(
                data.emoji || ""
              ).trim();


            if (!emoji) return;


            // Fix messages that don't
            // have reactions yet

            if (!message.reactions) {

              message.reactions =
                new Map();

            }


            const current =
              message.reactions.get(
                emoji
              ) || [];


            const userId =
              meta.id;


            const exists =
              current.some(
                id =>
                  id.toString() ===
                  userId
              );


            const next = exists

              ? current.filter(
                  id =>
                    id.toString() !==
                    userId
                )

              : [
                  ...current,
                  userId
                ];


            message.reactions.set(
              emoji,
              next
            );


            await message.save();


            const reactionPayload = {

              type: "reaction",

              messageId:
                message._id.toString(),

              emoji,

              count:
                next.length

            };


            broadcast(
              data.roomId,
              reactionPayload
            );


            await publish({

              ...reactionPayload,

              roomId:
                data.roomId,

              source:
                process.pid

            });

          }

        } catch (error) {

          console.error(
            "WebSocket ERROR:",
            error
          );


          ws.send(
            JSON.stringify({

              type: "error",

              message:
                "Invalid real-time event."

            })
          );

        }

      });


      // =========================
      // CONNECTION CLOSED
      // =========================

      ws.on("close", async () => {

        const meta =
          sockets.get(ws);


        if (!meta) return;


        for (const roomId of meta.rooms) {

          removeFromRoom(
            ws,
            roomId
          );


          const roomPresence =
            await presence(roomId);


          broadcast(

            roomId,

            {

              type: "presence",

              users:
                roomPresence.onlineUsers,

              offlineUsers:
                roomPresence.offlineUsers

            }

          );

        }


        sockets.delete(ws);
        await broadcastGlobalPresence();

      });

    } catch (error) {

      console.error(
        "WebSocket authentication error:",
        error
      );


      ws.close(
        1008,
        "Invalid authentication token"
      );

    }

  });


  // =========================
  // REDIS PUB/SUB
  // =========================

  sub.subscribe(
    "pulseroom:events"
  );


  sub.on(
    "message",
    (_channel, raw) => {

      try {

        const event =
          JSON.parse(raw);


        if (
          event.source ===
            process.pid ||
          !event.roomId
        ) {
          return;
        }


        broadcast(
          event.roomId,
          event
        );

      } catch (error) {

        console.error(
          "Redis event error:",
          error
        );

      }

    }
  );


  return wss;

}