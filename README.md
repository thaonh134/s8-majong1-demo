# Mahjong Ways Demo

Demo mô phỏng slot kiểu Mahjong Ways (Node.js + HTML).

## Chạy thử

```bash
cd mahjong-demo
npm install
npm start
```

Mở trình duyệt: [http://localhost:3000](http://localhost:3000)

## Tính năng trong demo

- HTML nút Spin
- Node.js API `POST /api/spin`
- Gen board 5×4
- Symbol weight
- Payout ways từ trái sang phải
- Wild
- Scatter
- Cascade
- Multiplier tăng sau mỗi cascade
- JSON debug đầy đủ
- Deterministic seed + replay
- Wallet giả lập in-memory
- Audit log in-memory
- Tool simulation RTP
- Math config tách riêng (RTP target, reel weight base/free)
- Free spin thật (state theo player)

## API mới (production-like)

- `POST /api/spin`: hỗ trợ `seed`, `nonce` để deterministic/replay.
- `POST /api/replay`: nhận `spinId`, trả replay result và `deterministicMatch`.
- `GET /api/wallet/:playerId`: xem wallet mock.
- `POST /api/wallet/deposit`: nạp thêm số dư mock.
- `GET /api/audit?limit=100`: lấy audit log gần nhất.
- `POST /api/simulate`: chạy simulation RTP nhanh qua API.

## Simulation CLI

```bash
cd mahjong-demo
npm run simulate -- 50000 1000 seed-v1
```

Output gồm tổng bet/win, RTP, số free spin đã dùng, start/end balance.

---

## Luồng tổng thể

Khi user bấm **Spin**, hệ thống chạy:

```text
Frontend HTML
  ↓
POST /api/spin
  ↓
spinEngine.spin()
  ↓
generateBoard()
  ↓
checkWins()
  ↓
cascade()
  ↓
final result
  ↓
trả JSON
```

### API spin

Khi frontend gọi `fetch("/api/spin")`, handler tương ứng chạy (ví dụ):

```js
app.post("/api/spin", (req, res) => {
  // ...
});
```

### Spin engine

Đây là phần lõi game, file: `game/spinEngine.js`.

---

## Generate board

Bước đầu tiên:

```js
const board = generateBoard();
```

### Board là gì?

- **Kích thước:** 5 cột × 4 hàng

Ví dụ minh họa:

```text
A B C D E
A B C D E
A W C D E
S B C D E
```

### Symbol weight

Trong `symbols.js` có dạng:

```js
[
  { symbol: "A", weight: 30 },
  { symbol: "B", weight: 25 },
  // ...
]
```

**Ý nghĩa:** weight càng lớn → symbol xuất hiện càng thường xuyên.

Ví dụ: `A = 30`, `WILD = 2` → A xuất hiện nhiều, WILD hiếm.

---

## Random symbol

Generator dùng `pickRandomSymbol()`.

### Logic

- Tổng weight (ví dụ): `100`
- Random: `Math.random() * 100` → ví dụ ra `67`

**Mapping (minh họa):**

```text
0–30   → A
31–55  → B
56–70  → C
...
```

`67` nằm trong range **C** → symbol **C**.

### Tạo board

Vòng lặp theo hàng/cột, fill symbol vào board. Kết quả dạng:

```js
[
  ["A", "B", "C", "D", "E"],
  ["A", "A", "C", "W", "E"],
  // ...
]
```

---

## Check win

Sau khi có board:

```js
checkWins(board);
```

### Logic win (WAYS)

Demo dùng **WAYS SYSTEM** (tương tự Mahjong Ways):

- Không cần line cố định
- Cần **symbol giống nhau từ trái sang phải** trên các cột liên tiếp

Ví dụ chưa đủ (giả sử rule cần tối thiểu 3 cột):

```text
A X X X X
A A X X X
A X X X X
```

Cột 1 và 2 có A liên tiếp → nếu rule là **3 columns minimum** thì chưa thắng.

Ví dụ thắng: A xuất hiện liên tiếp ở col1, col2, col3 → **WIN**.

### Wild

Wild `W` có thể thay cho symbol thường.

Ví dụ: `A | W | A` được tính như `A A A`.

### Payout

Sau khi xác định win:

```js
payout = paytable[symbol][matchCount];
```

Ví dụ paytable cho A:

- 3 match → 5×
- 4 match → 10×
- 5 match → 20×

Nếu bet `100` và line A ×5 → win `2000` (theo công thức demo).

---

## Cascade engine

Sau khi thắng, symbol thắng biến mất.

**Trước:**

```text
A A A
B C D
```

**Sau xóa:**

```text
_ _ _
B C D
```

### Gravity

Symbol rơi xuống:

```text
_ _ _
B C D
```

thành:

```text
B C D
_ _ _
```

### Fill symbol mới

Sinh symbol mới phía trên:

```text
X Y Z
B C D
```

### Check win lại

Board mới tiếp tục `checkWins()`. Nếu lại thắng → cascade tiếp.

### Multiplier

Mỗi cascade (minh họa): ×1, ×2, ×3, ×5, …

Ví dụ: cascade 1 win `1000`; cascade 2 `1500 × 2 = 3000`.

### Vòng lặp cascade

Spin engine có dạng `while (hasWin)`:

```text
generate
  ↓
check win
  ↓
cascade
  ↓
check again
  ↓
cascade again
  ↓
dừng khi không còn win
```

### Final result

Backend trả object (rút gọn ý nghĩa các field) từ `spinEngine.spin()`:

```json
{
  "spinId": "SPIN-...",
  "playerId": "demo-player",
  "betAmount": 1000,
  "totalWin": 0,
  "initialBoard": [],
  "finalBoard": [],
  "scatterCount": 0,
  "freeSpinTriggered": false,
  "steps": []
}
```

Mỗi phần tử trong `steps` gồm board, wins, multiplier, v.v.; bước cascade cuối có thể có `newCellsAfterCascade`.

### Frontend render

`renderBoard()` vẽ board ra HTML.

---

## Điểm quan trọng

Demo hiện là **random board system** — board được sinh theo weight/random đơn giản.

### Game production khác gì?

Game thật **không** random board đơn giản như demo. Thường có:

```text
RNG → outcome class
  → math model
  → controlled RTP
  → generate matching board
```

Mahjong Ways thật **không** random hoàn toàn tự do; là **controlled random** để giữ RTP, volatility, hit rate, bonus frequency, v.v.

### Demo này dùng để học gì?

- Cascade flow
- Payout flow
- Win detection
- Board structure
- State machine
- API design
- Animation flow
- Replay structure

### Chưa có gì?

Demo **chưa** có:

- RTP control
- Reel strip
- Feature buy
- Near miss
- Probability tuning
- Free spin logic thật
- Deterministic RNG
- Audit log
- Wallet transaction
- Provably fair
- Multi-thread simulation
