# Mahjong Ways Demo V3

Demo Node.js + HTML để học logic game kiểu Mahjong Ways trước khi port sang Java.

## Chạy demo

```bash
npm install
npm start
```

Mở trình duyệt:

```text
http://localhost:3000
```

## Tính năng chính

- Dashboard KPI: balance, cost, total win, lãi/lỗ, session RTP, hit rate, bonus rate.
- Board 5x4 có tô sáng ô thắng.
- Điều hướng từng frame: initial board, cascade win, after cascade.
- API response viewer.
- Audit log viewer.
- Config viewer.
- Simulation RTP.
- Buy Feature / mua scatter: trừ phí theo `FREE_SPIN_RULES.buyFeatureCostMultiplier`, kích hoạt free spin ngay.

## API chính

```http
POST /api/spin
POST /api/buy-feature
POST /api/simulate
GET  /api/config
GET  /api/audit/latest
GET  /api/wallet/:playerId
GET  /api/stats/:playerId
POST /api/wallet/reset
```

## Ghi chú

Đây là demo học logic, chưa phải math-certified production. RTP trên UI là RTP phiên chơi hiện tại, không phải RTP dài hạn đã được chứng nhận.
