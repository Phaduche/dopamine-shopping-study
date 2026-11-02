"""연구용 로컬 서버 (파이썬 표준 라이브러리만 사용, 설치 불필요).

실행:  python3 server.py          →  http://localhost:8000 (이 컴퓨터에서만)
      python3 server.py --lan    →  같은 와이파이의 다른 기기(폰·태블릿)에서도 접속 가능
  /            사전 설문(T0) → 조건 배정 → 0: 데모(/shop/), 1: 실제 쿠팡
  /admin.html  연구자 콘솔 (조건 설정, 참가자 목록, CSV 다운로드)

데이터는 data/study.db (SQLite)에 저장되며 git에 올라가지 않는다(.gitignore).
--lan 으로 열면 같은 네트워크의 누구나 연구자 콘솔에도 들어올 수 있으니 실험용 와이파이에서만 쓴다.
"""

import csv
import io
import json
import secrets
import socket
import sqlite3
import sys
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "data" / "study.db"
REAL_SITE_URL = "https://www.coupang.com/"
CONDITIONS = {0: "demo", 1: "real"}


def now():
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def db():
    DB_PATH.parent.mkdir(exist_ok=True)
    fresh = not DB_PATH.exists()  # 서버 실행 중에 DB 파일을 지워도 다시 만들어지도록
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    if fresh:
        init_db(conn)
    return conn


def init_db(conn=None):
    with conn or db() as c:
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS participants (
                pid TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                condition INTEGER NOT NULL,
                assignment_mode TEXT NOT NULL,
                answers TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pid TEXT,
                ts TEXT NOT NULL,
                type TEXT NOT NULL,
                detail TEXT
            );
            INSERT OR IGNORE INTO settings VALUES ('assignment_mode', 'fixed');
            INSERT OR IGNORE INTO settings VALUES ('fixed_condition', '0');
            -- ORDERTRACE(VISTA-01) 시각 순서 과제
            CREATE TABLE IF NOT EXISTS ot_sessions (
                sid TEXT PRIMARY KEY,
                code TEXT NOT NULL,
                created_at TEXT NOT NULL,
                trial_order TEXT NOT NULL,
                finished_at TEXT,
                confirm TEXT
            );
            CREATE TABLE IF NOT EXISTS ot_trials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sid TEXT,
                code TEXT,
                ts TEXT NOT NULL,
                kind TEXT, clip_id TEXT, method TEXT, obs_fps INTEGER, soa_ms INTEGER, profile TEXT, truth TEXT,
                response TEXT, confidence INTEGER, rt_ms INTEGER, skipped_frames INTEGER, play_ms INTEGER, anomaly INTEGER,
                trial_index INTEGER, attempt INTEGER
            );
            """
        )


def get_settings(c):
    s = {r["key"]: r["value"] for r in c.execute("SELECT key, value FROM settings")}
    return {"assignment_mode": s["assignment_mode"], "fixed_condition": int(s["fixed_condition"])}


def new_pid(c):
    while True:
        pid = "P" + secrets.token_hex(3).upper()
        if not c.execute("SELECT 1 FROM participants WHERE pid=?", (pid,)).fetchone():
            return pid


def to_csv(header, rows):
    buf = io.StringIO()
    buf.write("﻿")  # 엑셀에서 한글이 깨지지 않도록 BOM
    w = csv.writer(buf)
    w.writerow(header)
    w.writerows(rows)
    return buf.getvalue().encode("utf-8")


def participants_csv(c):
    rows = [dict(r) for r in c.execute("SELECT * FROM participants ORDER BY created_at")]
    keys = []
    for r in rows:
        for k in json.loads(r["answers"]):
            if k not in keys:
                keys.append(k)
    header = ["pid", "created_at", "condition", "condition_name", "assignment_mode"] + keys
    out = []
    for r in rows:
        a = json.loads(r["answers"])
        out.append(
            [r["pid"], r["created_at"], r["condition"], CONDITIONS[r["condition"]], r["assignment_mode"]]
            + [a.get(k, "") for k in keys]
        )
    return to_csv(header, out)


def events_csv(c):
    rows = c.execute("SELECT id, pid, ts, type, detail FROM events ORDER BY id").fetchall()
    return to_csv(["id", "pid", "ts", "type", "detail"], [tuple(r) for r in rows])


OT_COLS = ["sid", "code", "ts", "kind", "trial_index", "attempt", "clip_id", "method", "obs_fps", "soa_ms", "profile", "truth",
           "response", "confidence", "rt_ms", "skipped_frames", "play_ms", "anomaly"]


def ordertrace_csv(c):
    rows = c.execute(f"SELECT {', '.join(OT_COLS)} FROM ot_trials ORDER BY id").fetchall()
    # wrong_definite: 실제 순서와 다른 특정 순서(red/blue)를 단정한 시행 = 1차 결과
    out = []
    for r in rows:
        d = dict(zip(OT_COLS, r))
        wrong = 1 if d["response"] in ("red", "blue") and d["truth"] in ("red", "blue") and d["response"] != d["truth"] else 0
        out.append(list(r) + [wrong])
    return to_csv(OT_COLS + ["wrong_definite"], out)


def ordertrace_summary(c):
    n_sess = c.execute("SELECT COUNT(*) FROM ot_sessions").fetchone()[0]
    n_done = c.execute("SELECT COUNT(*) FROM ot_sessions WHERE finished_at IS NOT NULL").fetchone()[0]
    by = {}
    for m, truth, resp, n in c.execute(
            "SELECT method, truth, response, COUNT(*) FROM ot_trials WHERE kind='main' GROUP BY method, truth, response"):
        b = by.setdefault(m, {"trials": 0, "wrong_definite": 0})
        b["trials"] += n
        if resp in ("red", "blue") and truth in ("red", "blue") and resp != truth:
            b["wrong_definite"] += n
    return {"sessions": n_sess, "finished": n_done, "by_method": by}


def ot_manifest_order():
    """manifest의 본시행 clip id를 무작위 순서로. manifest가 없으면 빈 목록."""
    p = ROOT / "ordertrace" / "stimuli" / "manifest.json"
    if not p.exists():
        return []
    ids = [cl["id"] for cl in json.loads(p.read_text())["clips"] if cl["kind"] == "main"]
    rng = secrets.SystemRandom()
    rng.shuffle(ids)
    return ids


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    # 데이터 폴더·DB·서버 코드는 브라우저로 내려받을 수 없게 막는다
    def send_head(self):
        path = urlparse(self.path).path
        if path.startswith("/data") or path.startswith("/.git") or path.endswith(".py"):
            self.send_error(404)
            return None
        return super().send_head()

    # 파일을 고치면 새로고침만으로 바로 보이도록 브라우저 캐시를 쓰지 않게 한다
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        if "/api/log" not in self.path:
            sys.stderr.write("%s %s\n" % (self.log_date_time_string(), fmt % args))

    def send_json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, body, name):
        self.send_response(200)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", f'attachment; filename="{name}"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"{}")

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/settings":
            with db() as c:
                return self.send_json(get_settings(c))
        if path == "/api/photos":
            # shop/img/<상품id>.jpg|png|webp 가 있으면 그 사진을 SVG 대신 쓴다
            img_dir = ROOT / "shop" / "img"
            photos = {}
            if img_dir.is_dir():
                for f in sorted(img_dir.iterdir()):
                    if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
                        photos.setdefault(f.stem, f"img/{f.name}")
            return self.send_json(photos)
        if path == "/api/export/ordertrace.csv":
            with db() as c:
                return self.send_file(ordertrace_csv(c), f"ordertrace_{datetime.now():%Y%m%d_%H%M}.csv")
        if path == "/api/ot/summary":
            with db() as c:
                return self.send_json(ordertrace_summary(c))
        if path == "/api/admin/summary":
            with db() as c:
                ps = [dict(r) for r in c.execute(
                    "SELECT p.pid, p.created_at, p.condition, p.assignment_mode,"
                    " (SELECT COUNT(*) FROM events e WHERE e.pid = p.pid) AS events"
                    " FROM participants p ORDER BY p.created_at DESC")]
                return self.send_json({"settings": get_settings(c), "participants": ps})
        if path == "/api/export/participants.csv":
            with db() as c:
                return self.send_file(participants_csv(c), f"participants_{datetime.now():%Y%m%d_%H%M}.csv")
        if path == "/api/export/events.csv":
            with db() as c:
                return self.send_file(events_csv(c), f"events_{datetime.now():%Y%m%d_%H%M}.csv")
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            data = self.read_json()
        except (ValueError, json.JSONDecodeError):
            return self.send_json({"error": "bad json"}, 400)

        if path == "/api/start":
            answers = data.get("answers") or {}
            with db() as c:
                s = get_settings(c)
                mode = s["assignment_mode"]
                cond = secrets.randbelow(2) if mode == "random" else s["fixed_condition"]
                pid = new_pid(c)
                ts = now()
                c.execute("INSERT INTO participants VALUES (?,?,?,?,?)",
                          (pid, ts, cond, mode, json.dumps(answers, ensure_ascii=False)))
                c.execute("INSERT INTO events (pid, ts, type, detail) VALUES (?,?,?,?)",
                          (pid, ts, "assigned", json.dumps({"condition": cond, "mode": mode})))
            target = "/shop/" if cond == 0 else REAL_SITE_URL
            return self.send_json({"pid": pid, "condition": cond, "redirect": target})

        # ── ORDERTRACE(VISTA-01) ──────────────────────────────
        if path == "/api/ot/start":
            code = str(data.get("code") or "").strip().upper()[:32]
            if len(code) < 4:
                return self.send_json({"error": "code"}, 400)
            order = ot_manifest_order()
            sid = "S" + secrets.token_hex(4).upper()
            with db() as c:
                c.execute("INSERT INTO ot_sessions (sid, code, created_at, trial_order) VALUES (?,?,?,?)",
                          (sid, code, now(), json.dumps(order)))
            return self.send_json({"sid": sid, "order": order})

        if path == "/api/ot/response":
            row = {k: data.get(k) for k in OT_COLS if k not in ("sid", "code", "ts", "trial_index")}

            def num(v):   # 숫자가 아닌 값(객체 등)이 섞여 들어와도 저장이 실패하지 않게
                return v if isinstance(v, (int, float)) else None
            for k in ("obs_fps", "soa_ms", "confidence", "rt_ms", "skipped_frames", "play_ms", "anomaly"):
                row[k] = num(row[k])
            for k in ("kind", "clip_id", "method", "profile", "truth", "response"):
                row[k] = str(row[k])[:40] if row[k] is not None else None
            with db() as c:
                c.execute(
                    "INSERT INTO ot_trials (sid, code, ts, kind, clip_id, method, obs_fps, soa_ms, profile, truth, response, confidence,"
                    " rt_ms, skipped_frames, play_ms, anomaly, trial_index, attempt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    (data.get("sid"), str(data.get("code") or "")[:32], now(), row["kind"], row["clip_id"], row["method"], row["obs_fps"],
                     row["soa_ms"], row["profile"], row["truth"], row["response"], row["confidence"], row["rt_ms"], row["skipped_frames"],
                     row["play_ms"], row["anomaly"], num(data.get("index")), num(data.get("attempt"))))
            return self.send_json({"ok": True})

        if path == "/api/ot/finish":
            sid = str(data.get("sid") or "")
            with db() as c:
                r = c.execute("SELECT confirm FROM ot_sessions WHERE sid=?", (sid,)).fetchone()
                if not r:
                    return self.send_json({"error": "unknown sid"}, 404)
                confirm = r["confirm"] or ("V" + secrets.token_hex(3).upper())
                c.execute("UPDATE ot_sessions SET finished_at=COALESCE(finished_at, ?), confirm=? WHERE sid=?", (now(), confirm, sid))
            return self.send_json({"confirm": confirm})

        if path == "/api/log":
            with db() as c:
                c.execute("INSERT INTO events (pid, ts, type, detail) VALUES (?,?,?,?)",
                          (data.get("pid"), now(), str(data.get("type", "unknown"))[:50],
                           json.dumps(data.get("detail") or {}, ensure_ascii=False)))
            return self.send_json({"ok": True})

        if path == "/api/admin/settings":
            mode = data.get("assignment_mode")
            cond = data.get("fixed_condition")
            if mode not in ("fixed", "random") or cond not in (0, 1):
                return self.send_json({"error": "invalid settings"}, 400)
            with db() as c:
                c.execute("UPDATE settings SET value=? WHERE key='assignment_mode'", (mode,))
                c.execute("UPDATE settings SET value=? WHERE key='fixed_condition'", (str(cond),))
                return self.send_json(get_settings(c))

        return self.send_json({"error": "not found"}, 404)


def lan_ip():
    """이 컴퓨터의 와이파이(LAN) IP. 못 찾으면 None."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))  # 실제로 보내지 않고 경로만 고른다
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return None


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    port = int(args[0]) if args else 8000
    lan = "--lan" in sys.argv
    init_db()
    print(f"연구 서버 실행 중: http://localhost:{port}  (연구자 콘솔: http://localhost:{port}/admin.html)")
    if lan:
        ip = lan_ip()
        print(f"같은 와이파이의 다른 기기에서: http://{ip}:{port}" if ip else "와이파이 IP를 찾지 못했습니다. 시스템 설정 > 네트워크에서 IP를 확인하세요.")
    ThreadingHTTPServer(("0.0.0.0" if lan else "127.0.0.1", port), Handler).serve_forever()
