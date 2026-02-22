# A02: Security Misconfiguration

## 설명
잘못 설정된 서버에서 민감한 파일을 찾아 Flag를 획득하는 챌린지

## 목표
환경 변수 파일(.env)을 찾아 Flag 획득

## 풀이
1. 웹사이트 접속
2. URL에 `/.env` 입력
3. 환경 변수 파일 노출됨
4. FLAG 찾기: `OWASP{c0nf1g_f1l3s_sh0uld_b3_h1dd3n}`

## Flag
`OWASP{c0nf1g_f1l3s_sh0uld_b3_h1dd3n}`

## 취약점
- .env 파일이 웹에서 접근 가능
- 민감한 설정 정보 노출
- 적절한 웹 서버 설정 부재