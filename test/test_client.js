import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { Client, NullClient } from "../client.js";
import * as msg from "../messages.js";

Deno.test("NullClient", async (t) => {
  const client = new NullClient();

  await t.step("name", () => {
    let name = "";
    client.onName = (n) => {
      name = n;
    };
    client.namePlease();
    assertEquals(name, "NULL");
  });

  await t.step("clicking", async () => {
    let clicked = new Promise((resolve) => {
      client.onClick = resolve;
    });

    client.countDown(0);
    await clicked;

    // Call gameOver so the
    // interval is cleared.
    client.gameOver(true);
  });
});

Deno.test("Client", async (t) => {
  let client;
  let conn;

  const server = Deno.serve((req) => {
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response(null, { status: 501 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);
    client = new Client(socket);
    return response;
  });

  conn = new WebSocket("ws://localhost:8000");
  await new Promise((resolve) => {
    conn.addEventListener("open", resolve);
  });

  const name = new Promise((resolve) => {
    client.onName = resolve;
  });

  await conn.send(JSON.stringify(msg.Name("test")));
  assertEquals(await name, "test");

  conn.close();
  await server.shutdown();
});
