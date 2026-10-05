#!/usr/bin/env python3
"""Drive Nalana (Blender 5.1 with an AI modelling agent) from a terminal.

Each instance is a GUI Nalana launched with a startup hook. The hook writes
{pid, port, token} to the state dir once the bridge is up, and watches a
command file so this CLI can save or quit the instance without anyone typing
into Blender. Generation runs on Nalana's servers, so several instances can
run side by side without loading the machine.

  nalana.py up N                 launch N instances
  nalana.py ls                   list live instances (index, pid, port, auth)
  nalana.py ask I "prompt"       send a prompt to instance I, wait, print result
  nalana.py ctx I                dump /scene/context of instance I
  nalana.py save I out.blend     save instance I's scene to a .blend
  nalana.py down                 quit every instance

State dir: $NALANA_CLI_DIR, default ~/.nalana/cli.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

STATE_DIR = os.environ.get("NALANA_CLI_DIR") or os.path.expanduser("~/.nalana/cli")
APP = os.environ.get("NALANA_APP", "Nalana")
RUNS_DIR = os.path.expanduser("~/.nalana/scratch-generation-runs")

HOOK = r'''
import bpy, json, os
STATE_DIR = %(state)r
PID = os.getpid()
INFO = os.path.join(STATE_DIR, f"{PID}.json")
CMD = os.path.join(STATE_DIR, f"{PID}.cmd")

def _write_info():
    from nalana import bridge_server, auth_client
    if not bridge_server.is_running():
        return False
    info = {"pid": PID, "port": bridge_server.get_port(), "token": bridge_server.get_token(),
            "started": __import__("time").time()}
    tmp = INFO + ".tmp"
    with _private(tmp) as f:
        json.dump(info, f)
    os.replace(tmp, INFO)
    return True

def _private(path):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    return os.fdopen(fd, "w")

_ready = [False]

def tick():
    try:
        if not _ready[0]:
            _ready[0] = _write_info()
            return 1.0
        if os.path.exists(CMD):
            with open(CMD) as f:
                cmd = json.load(f)
            os.remove(CMD)
            out = cmd.get("reply")
            result = {"ok": True}
            try:
                if cmd["op"] == "save":
                    bpy.ops.wm.save_as_mainfile(filepath=cmd["path"], copy=True)
                    result["path"] = cmd["path"]
                elif cmd["op"] == "quit":
                    if out:
                        with _private(out) as f:
                            json.dump(result, f)
                    bpy.ops.wm.quit_blender()
                    return None
            except Exception as exc:
                result = {"ok": False, "error": repr(exc)}
            if out:
                with _private(out) as f:
                    json.dump(result, f)
    except Exception as exc:
        print("nalana-cli hook:", exc)
    return 0.5

bpy.app.timers.register(tick, first_interval=2.0, persistent=True)
'''


def _private(path: str):
    """Open for writing with 0600 from creation, so a token is never world-readable."""
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    return os.fdopen(fd, "w")


def _ensure_state_dir() -> None:
    os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
    os.chmod(STATE_DIR, 0o700)


def _instances() -> list[dict]:
    if not os.path.isdir(STATE_DIR):
        return []
    found = []
    for name in os.listdir(STATE_DIR):
        if not name.endswith(".json") or name.startswith("reply-"):
            continue
        try:
            with open(os.path.join(STATE_DIR, name)) as f:
                info = json.load(f)
        except (OSError, ValueError):
            continue
        if _alive(info["pid"]):
            found.append(info)
        else:
            os.remove(os.path.join(STATE_DIR, name))
    return sorted(found, key=lambda i: i.get("started", 0))


def _alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def _req(info: dict, path: str, body: dict | None = None, timeout: float = 30.0) -> dict:
    url = f"http://127.0.0.1:{info['port']}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method="POST" if body is not None else "GET")
    req.add_header("Authorization", f"Bearer {info['token']}")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as err:
        return json.loads(err.read() or b"{}") | {"http_status": err.code}


def _pick(index: str) -> dict:
    live = _instances()
    i = int(index)
    if i >= len(live):
        sys.exit(f"no instance {i}; {len(live)} running (nalana.py ls)")
    return live[i]


def cmd_up(count: str) -> None:
    _ensure_state_dir()
    hook = os.path.join(STATE_DIR, "hook.py")
    with _private(hook) as f:
        f.write(HOOK % {"state": STATE_DIR})
    before = {i["pid"] for i in _instances()}
    want = len(before) + int(count)
    for _ in range(int(count)):
        subprocess.run(["open", "-n", "-a", APP, "--args", "--python", hook], check=True)
        # Two launches in the same second raced for port 8765 on 2026-10-05;
        # spacing them lets each bridge bind before the next one starts.
        time.sleep(4)
    deadline = time.time() + 120
    while time.time() < deadline and len(_instances()) < want:
        time.sleep(2)
    cmd_ls()


def cmd_ls() -> None:
    for i, info in enumerate(_instances()):
        try:
            state = _req(info, "/state", timeout=5)
            auth = state.get("auth") or {}
            line = f"signed_in={auth.get('signed_in')} status={state.get('status')}"
        except Exception as exc:
            line = f"unreachable: {exc}"
        print(f"{i}  pid={info['pid']}  port={info['port']}  {line}")


def cmd_ask(index: str, prompt: str) -> None:
    info = _pick(index)
    state = _req(info, "/state")
    if not (state.get("auth") or {}).get("signed_in"):
        sys.exit("BLOCKED: instance is not signed in to Nalana; sign in from its chat panel")
    count_before = len(state.get("conversation") or [])
    sent = _req(info, "/chat/send", {"text": prompt})
    if not sent.get("ok"):
        sys.exit(f"send failed: {json.dumps(sent)[:400]}")
    started = time.time()
    last_status = ""
    while time.time() - started < 900:
        time.sleep(5)
        try:
            state = _req(info, "/state", timeout=10)
        except Exception:
            continue
        convo = state.get("conversation")
        status = state.get("status") or ""
        if status != last_status:
            print(f"[{time.time() - started:5.0f}s] {status}", file=sys.stderr)
            last_status = status
        if not convo or len(convo) <= count_before + 1:
            continue
        last = convo[-1]
        if last.get("role") != "user" and status.upper().startswith("READY"):
            text = last.get("text") or ""
            print(text)
            blend = _result_blend(text)
            if blend:
                print(f"blend: {blend}")
            return
    sys.exit("timed out after 15 minutes")


def _result_blend(text: str) -> str | None:
    marker = "Evidence: "
    if marker not in text:
        return None
    run = text.split(marker, 1)[1].split()[0].rstrip(".")
    try:
        with open(os.path.join(run, "RESULT.json")) as f:
            return json.load(f).get("selected_blend_path")
    except (OSError, ValueError):
        return None


def cmd_ctx(index: str) -> None:
    print(json.dumps(_req(_pick(index), "/scene/context"), indent=1))


def _command(info: dict, cmd: dict, timeout: float = 60) -> dict:
    reply = os.path.join(STATE_DIR, f"reply-{info['pid']}-{time.time_ns()}.json")
    cmd["reply"] = reply
    _ensure_state_dir()
    tmp = os.path.join(STATE_DIR, f"{info['pid']}.cmd.tmp")
    with _private(tmp) as f:
        json.dump(cmd, f)
    os.replace(tmp, os.path.join(STATE_DIR, f"{info['pid']}.cmd"))
    deadline = time.time() + timeout
    while time.time() < deadline:
        if os.path.exists(reply):
            time.sleep(0.2)
            with open(reply) as f:
                result = json.load(f)
            os.remove(reply)
            return result
        if not _alive(info["pid"]):
            return {"ok": True, "exited": True}
        time.sleep(0.5)
    return {"ok": False, "error": "no reply from instance hook"}


def cmd_save(index: str, path: str) -> None:
    result = _command(_pick(index), {"op": "save", "path": os.path.abspath(path)})
    print(json.dumps(result))


def cmd_down() -> None:
    for info in _instances():
        result = _command(info, {"op": "quit"}, timeout=20)
        if _alive(info["pid"]):
            os.kill(info["pid"], 15)
        print(f"pid={info['pid']} {json.dumps(result)}")


COMMANDS = {"up": cmd_up, "ls": cmd_ls, "ask": cmd_ask, "ctx": cmd_ctx, "save": cmd_save, "down": cmd_down}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        sys.exit(__doc__)
    COMMANDS[sys.argv[1]](*sys.argv[2:])
