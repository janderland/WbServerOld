import * as msg from "./messages.js";

class ClientCallbacks {
  #onError = (_) => {};

  set onError(value) {
    if (!value) {
      this.#onError = (_) => {};
      return;
    }
    this.#onError = value;
  }

  get onError() {
    return this.#onError;
  }

  #onName = (_) => {};

  set onName(value) {
    if (!value) {
      this.#onName = (_) => {};
      return;
    }
    this.#onName = value;
  }

  get onName() {
    return this.#onName;
  }

  #onClick = () => {};

  set onClick(value) {
    if (!value) {
      this.#onClick = () => {};
      return;
    }
    this.#onClick = value;
  }

  get onClick() {
    return this.#onClick;
  }

  #onClose = () => {};

  set onClose(value) {
    if (!value) {
      this.#onClose = () => {};
      return;
    }
    this.#onClose = value;
  }

  get onClose() {
    return this.#onClose;
  }
}

export class Client extends ClientCallbacks {
  #conn;

  #send(message) {
    this.#conn.send(JSON.stringify(message));
  }

  constructor(conn) {
    super();

    this.#conn = conn;

    // In the WebSocket event handlers below, 'this'
    // is rebound to the WebSocket object, so we need
    // to capture the client object in this const.
    const client = this;

    conn.addEventListener("message", function (ev) {
      if (typeof ev.data != "string") {
        client.onError(new Error("Received non-string message"));
        return;
      }

      let message;
      try {
        message = JSON.parse(ev.data);
      } catch (error) {
        client.onError(error);
        return;
      }

      switch (message.id) {
        case msg.IDs.Name:
          client.onName(message.name);
          break;
        case msg.IDs.Click:
          client.onClick();
          break;
        default:
          client.onError(new Error("Unknown message ID: " + message.id));
      }
    });

    conn.addEventListener("close", function (_) {
      client.onClose();
    });
  }

  winCount(count) {
    this.#send(msg.WinCount(count));
  }

  namePlease() {
    this.#send(msg.NamePlease());
  }

  matched(opponentName) {
    this.#send(msg.Matched(opponentName));
  }

  countDown(count) {
    this.#send(msg.CountDown(count));
  }

  clickCount(yourCount, theirCount) {
    this.#send(msg.ClickCount(yourCount, theirCount));
  }

  gameOver(win) {
    this.#send(msg.GameOver(win));
  }

  close() {
    this.#conn.close();
  }
}

export class NullClient extends ClientCallbacks {
  #intervalId;

  winCount(_) {}

  namePlease() {
    this.onName("NULL");
  }

  matched(_) {}

  countDown(count) {
    if (count === 0) {
      this.#intervalId = setInterval(() => {
        this.onClick();
      }, 500);
    }
  }

  clickCount(_, __) {}

  gameOver(_) {
    clearInterval(this.#intervalId);
  }

  close() {}
}
