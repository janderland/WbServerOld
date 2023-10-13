import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { delay } from "https://deno.land/std@0.204.0/async/delay.ts";
import { NullClient } from "../client.js";

Deno.test("NullClient", async (t) => {
  const client = new NullClient();

  await t.step("namePlease", () => {
    let name = "";
    client.onName = (n) => {
      name = n;
    };
    client.namePlease();
    assertEquals(name, "NULL");
  });

  await t.step("countDown", async () => {
    let clicked = false;
    client.onClick = () => {
      clicked = true;
    };
    client.countDown(0);
    await delay(750);
    assertEquals(clicked, true);

    // Call gameOver so the
    // interval is cleared.
    client.gameOver(true);
  });
});
