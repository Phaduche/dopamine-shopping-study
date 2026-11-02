"""참가자용 로컬 묶음 만들기.

참가자 컴퓨터에서 서버 없이 index.html 을 더블클릭해 실험을 진행할 수 있는 폴더(+zip)를 만든다.
자료는 data_local/ 이 있으면 그것을, 없으면 data/ 의 SAMPLE 을 data.js 로 묶어 넣는다.
문항 이미지(data_local/img/)도 같이 복사하고 경로를 상대경로로 바꾼다.

사용:  python3 mockgap/build_local.py           →  mockgap/local_bundle/  와  mockgap/local_bundle.zip
결과물에는 실제 문항이 들어 있으므로 저장소에 올리지 않는다(.gitignore).
참가자는 끝 화면에서 P001.json 을 내려받아 연구자에게 보내고, 연구자는 콘솔이나 session-frame 의 researcher.html 로 합친다.
"""

import json
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from server import mg_bundle  # noqa: E402  (서버와 같은 규칙으로 자료를 모은다)

OUT = HERE / "local_bundle"


def main():
    bundle = mg_bundle()
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for name in ("index.html", "app.js", "style.css"):
        shutil.copy(HERE / name, OUT / name)
    # 문항 이미지: /mockgap/data_local/img/... → img/...
    img_src = HERE / "data_local" / "img"
    if img_src.is_dir():
        shutil.copytree(img_src, OUT / "img")
    for coll in ("practice_sets", "tests"):
        for items in bundle[coll].values():
            for it in items:
                if it.get("img"):
                    it["img"] = "img/" + it["img"].split("/img/")[-1]
    (OUT / "data.js").write_text("window.MOCKGAP_DATA = " + json.dumps(bundle, ensure_ascii=False) + ";\n", encoding="utf-8")
    (OUT / "README.txt").write_text(
        "참가자용 로컬 묶음\n\n"
        "1. 이 폴더를 참가자 컴퓨터에 복사합니다.\n"
        "2. index.html 을 더블클릭해 브라우저(크롬·엣지)로 엽니다.\n"
        "3. 연구자가 준 참가자 번호(P001 …)를 입력하고 진행합니다. 창을 닫아도 같은 번호로 다시 열면 이어집니다.\n"
        "4. 끝 화면에서 '기록 파일 내려받기'를 눌러 P001.json 을 연구자에게 보냅니다.\n\n"
        f"자료 출처: {bundle['source']}\n", encoding="utf-8")
    zip_path = shutil.make_archive(str(HERE / "local_bundle"), "zip", OUT)
    n = sum(1 for _ in OUT.rglob("*") if _.is_file())
    print(f"{OUT}  ({n}개 파일, 자료 출처: {bundle['source']})\n{zip_path}")


if __name__ == "__main__":
    main()
