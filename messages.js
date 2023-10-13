export const IDs = {
  Matched: 0,
  CountDown: 1,
  Click: 2,
  GameOver: 3,
  Name: 4,
  NamePlease: 5,
  ClickCount: 6,
  WinCount: 7,
};

export function WinCount(count) {
  return {
    id: IDs["WinCount"],
    count: count,
  };
}

export function NamePlease() {
  return {
    id: IDs["NamePlease"],
  };
}

export function Name(name) {
  return {
    id: IDs["Name"],
    name: name,
  };
}

export function Matched(opponentName) {
  return {
    id: IDs["Matched"],
    opponentName: opponentName,
  };
}

export function CountDown(value) {
  return {
    id: IDs["CountDown"],
    value: value,
  };
}

export function Click() {
  return {
    id: IDs["Click"],
  };
}

export function ClickCount(yourCount, theirCount) {
  return {
    id: IDs["ClickCount"],
    yourCount: yourCount,
    theirCount: theirCount,
  };
}

export function GameOver(won) {
  return {
    id: IDs["GameOver"],
    won: won,
  };
}
