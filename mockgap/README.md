# MOCKGAP · 공부 방법 실험 진행 페이지

**연구 질문:** 고등학생이 AI가 만든 예상문제로 단원 시험을 준비하면, 기출 기반 문제로 준비할 때보다
시험 직전 **예상 점수와 실제 점수의 차이(보정 오차)** 가 커지는가? 검사기 경고를 보면 그 차이가 줄어드는가?

설계: 2(문제 출처: 본인 AI 세트 / 기출 세트, 참가자 내) × 2(검사기 경고: 있음 / 없음, 참가자 간).
팀 공개 저장소 [session-frame](https://github.com/Sunlitkoreakorea/session-frame)(MIT)의 흐름·기록 형식·지표 규칙을 그대로 따르고, 화면만 꾸밈 없는 기본 HTML로 만들었습니다.
기록 형식이 같아서 그쪽 `researcher.html`로도 합칠 수 있습니다.

## 실행 (연구자 노트북)

```bash
python3 server.py --lan
```

- 참가자: 같은 와이파이에서 `http://<노트북 IP>:8000/mockgap/` → 번호(P001 …) 입력
- 연구자 콘솔: http://localhost:8000/admin.html → 진행 현황, 참가자별 CSV
- 기록은 `data/study.db`(SQLite)와 `data/mockgap/<번호>.json`에 남습니다. `data/`는 git에 올라가지 않습니다.
  윤리 서류대로 **클라우드 동기화 폴더 밖**에 두세요.

## 흐름 (참가자 한 명)

번호 입력 → 시작 설문(쓰는 AI, 빈도, 신뢰·확인 습관, 과목 자신감)
→ **1번째 단원**: 문제 출처 화면 → (경고 집단만) 검사 결과 → 연습(40분, 정답·해설 열람, "교과서를 찾아봤다" 횟수) → 예상 점수·준비됐다는 느낌·유사성·정답지 신뢰 → 시험(25분)
→ **2번째 단원**: 같은 순서, 다른 출처
→ 마지막 설문(오류 인지, 연습 중 AI 사용) → 끝(연구 설명)

- AI 조건: 참가자가 평소 쓰는 AI 앱에 고정 문장을 붙여 넣고 받은 답 전체를 붙여 넣는다. 페이지가 문항을 나누고(20문항 미만이면 다시 요청) 교과서 겹침·학습목표 덮임·기출 형식 거리를 계산한다. 경고 집단에만 그 결과를 보여 준다.
- 기출 조건: 연구자가 준비한 공통 연습 세트.
- 배정: 번호에서 결정되는 균형 블록 배정(4명 블록, seed는 `config.json`). session-frame과 같은 규칙이라 같은 번호는 같은 조건이다.

## 자료 폴더

| 폴더 | 내용 | git |
| --- | --- | --- |
| `mockgap/data/` | 설정, 단원 쪽수, **SAMPLE** 연습 세트·시험·교과서 본문 자리 표시 | 올라감 |
| `mockgap/data_local/` | **실제** 연습 세트·시험·교과서 본문·문항 이미지·학습목표·기출 형식 | **올라가지 않음** (`.gitignore`) |

서버는 `data_local/`이 있으면 그것을 쓰고, 없는 파일은 `data/`의 SAMPLE로 채웁니다. 콘솔의 "자료 출처"가 `data_local`인지 확인한 뒤 실험하세요.

`data_local/` 구조 (파일 이름은 단원 이름의 공백을 `_`로):

```
data_local/
  config.json                 # 제목, prompt_template, 시간, 디브리핑 (data/config.json 복사해서 수정)
  units.json
  unit_text/I-2_화학_변화.txt  # 교과서 본문 (겹침 계산용)
  practice_sets/I-2_화학_변화.json   # {"items":[{"id":1,"type":"객관식","stem":"…","options":[…],"answer":"3","explanation":"…"}, …]}
  tests/I-2_화학_변화.json           # 같은 형식. 문항 이미지면 "img":"/mockgap/data_local/img/I-2_01.png" 를 넣고 stem은 비워도 됨
  img/…                       # 문항 이미지 (경기도교육청 자료집, 평가원 예시 등 원본은 공개 저장소에 올리지 않음)
  objectives/I-2_화학_변화.json      # {"objectives":[{"id":"O1","text":"…"}, …]}  (있으면 학습목표 덮임 계산)
  past_formats/I-2_화학_변화.json    # ["개념 확인","계산", …]  (있으면 기출 형식 거리 계산)
```

## CSV 열

`id, group(warn/ctrl), order(ai_first/exam_first), stage`, 시작 설문, 단원별(A/B) `source, ai_app, n_parsed, overlap4, coverage, format_tv, warning_dwell_s, confirm_count, practice_min, predicted, readiness, similar, key_trust, mc_correct, mc_pct, err`(예상 − 객관식 점수),
그리고 `err_ai, err_exam, delta = err_ai − err_exam`(1차 결과), 마지막 설문.
서술형은 따로 채점해서 더합니다.

## 주의

- 유료 API는 쓰지 않습니다. 모든 계산은 브라우저와 로컬 서버에서만 합니다.
- 사람 대상 자료 수집은 학교 IRB 승인 뒤에만 합니다. 이 페이지는 동의 서류를 대신하지 않습니다.
- 연구 내용·문항·교과서 본문은 이 공개 저장소에 올리지 않습니다 (`data_local/`만 씁니다).
