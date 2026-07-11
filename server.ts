/**
 * server.ts — Custom Next.js server with Socket.io (Signaling Server)
 *
 * Run: npm run dev  (uses tsx server.ts)
 *
 * ── Signaling Flow ────────────────────────────────────────────────────────────
 *
 *  Transmitter (HP)                 Server                  Receiver (Laptop/OBS)
 *       |                             |                              |
 *       |-- transmitter:ready ------->|                              |
 *       |                             |-- slot:status(live) -------->|
 *       |                             |<-- receiver:watch -----------|
 *       |                             |<-- webrtc:request-offer -----|
 *       |<-- webrtc:request-offer ----|                              |
 *       |-- webrtc:offer ------------>|-- webrtc:offer ------------->|
 *       |                             |<-- webrtc:answer ------------|
 *       |<-- webrtc:answer -----------|                              |
 *       |-- webrtc:ice-candidate ---->|-- webrtc:ice-candidate ----->|
 *       |<-- webrtc:ice-candidate ----|<-- webrtc:ice-candidate -----|
 *       |                             |                              |
 *       |         P2P stream established (server no longer involved) |
 *
 * ── Socket.io Rooms ───────────────────────────────────────────────────────────
 *  Room name: `slot:{slotId}`
 *  Both transmitter and receivers join the same room.
 *  Server relays WebRTC messages between sockets in the same room.
 */

import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev      = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port     = parseInt(process.env.PORT ?? "3000", 10);

// Next.js app — jangan pass hostname/port ke constructor,
// biarkan httpServer yang handle binding
const app    = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url!, true));
  });

  // ── Socket.io ──────────────────────────────────────────────────────────────
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[io] +connect  ${socket.id}`);

    // ── 1. Transmitter: camera is live ───────────────────────────────────────
    socket.on("transmitter:ready", ({ slotId }: { slotId: string }) => {
      console.log(`[io] transmitter:ready  slot=${slotId}`);
      socket.data.role  = "transmitter";
      socket.data.slotId = slotId;
      socket.join(`slot:${slotId}`);

      // Tell all watchers this slot is live
      io.to(`slot:${slotId}`).emit("slot:status", { slotId, status: "live" });
    });

    // ── 2. Receiver: start watching a slot ───────────────────────────────────
    socket.on("receiver:watch", ({ slotId }: { slotId: string }) => {
      console.log(`[io] receiver:watch  slot=${slotId}`);
      socket.data.role   = "receiver";
      socket.data.slotId = slotId;
      socket.join(`slot:${slotId}`);

      // If a transmitter is already in the room, ask it to create an offer
      const room    = io.sockets.adapter.rooms.get(`slot:${slotId}`);
      const hasTx   = room && [...room].some((id) => {
        const s = io.sockets.sockets.get(id);
        return s?.data.role === "transmitter";
      });

      if (hasTx) {
        // Ask transmitter to send offer to this new receiver
        socket.to(`slot:${slotId}`).emit("webrtc:request-offer", {
          slotId,
          receiverSocketId: socket.id,
        });
      }
    });

    // ── 3. WebRTC: offer from transmitter → forward to specific receiver ─────
    socket.on(
      "webrtc:offer",
      ({ slotId, offer, targetSocketId }: {
        slotId: string;
        offer: RTCSessionDescriptionInit;
        targetSocketId: string;
      }) => {
        console.log(`[io] webrtc:offer  slot=${slotId}  target=${targetSocketId}`);
        io.to(targetSocketId).emit("webrtc:offer", {
          slotId,
          offer,
          senderSocketId: socket.id,
        });
      }
    );

    // ── 4. WebRTC: answer from receiver → forward to transmitter ─────────────
    socket.on(
      "webrtc:answer",
      ({ slotId, answer, targetSocketId }: {
        slotId: string;
        answer: RTCSessionDescriptionInit;
        targetSocketId: string;
      }) => {
        console.log(`[io] webrtc:answer  slot=${slotId}  target=${targetSocketId}`);
        io.to(targetSocketId).emit("webrtc:answer", { slotId, answer });
      }
    );

    // ── 5. ICE candidates: relay between any two peers in the same slot ──────
    socket.on(
      "webrtc:ice-candidate",
      ({ slotId, candidate, targetSocketId }: {
        slotId: string;
        candidate: RTCIceCandidateInit;
        targetSocketId: string;
      }) => {
        io.to(targetSocketId).emit("webrtc:ice-candidate", {
          slotId,
          candidate,
          senderSocketId: socket.id,
        });
      }
    );

    // ── 6. Transmitter stopped ───────────────────────────────────────────────
    socket.on("transmitter:disconnect", ({ slotId }: { slotId: string }) => {
      console.log(`[io] transmitter:disconnect  slot=${slotId}`);
      io.to(`slot:${slotId}`).emit("slot:status", { slotId, status: "disconnect" });
    });

    // ── 7. Auto cleanup ──────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const { role, slotId } = socket.data as { role?: string; slotId?: string };
      console.log(`[io] -disconnect  ${socket.id}  role=${role}`);
      if (role === "transmitter" && slotId) {
        io.to(`slot:${slotId}`).emit("slot:status", { slotId, status: "disconnect" });
      }
    });
  });

  (globalThis as Record<string, unknown>).__socketio__ = io;

  httpServer.listen(port, hostname, () => {
    console.log(
      `▲ CamCast ready → http://${hostname === "0.0.0.0" ? "localhost" : hostname}:${port}`
    );
  });
});
