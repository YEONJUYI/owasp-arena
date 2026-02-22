# A03: Software Supply Chain Failures

## 설명
취약한 npm 패키지를 사용하는 애플리케이션에서 의존성 정보를 찾아 Flag 획득

## 목표
package.json 파일을 찾아 Flag 획득

## 풀이
1. 웹사이트 접속
2. URL에 `/package.json` 입력
3. package.json 내용 확인
4. `config.FLAG` 찾기: `OWASP{supp1y_ch41n_vuln3r4b1l1ty}`

## Flag
`OWASP{supp1y_ch41n_vuln3r4b1l1ty}`

## 취약점
- package.json 파일이 웹에서 접근 가능
- 취약한 버전의 라이브러리 사용
- 민감한 설정 정보 노출