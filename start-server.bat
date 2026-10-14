@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo  개복치 신입사원 로컬 서버
echo  ----------------------------------------
echo  PC:  http://localhost:8080
echo  폰:  같은 와이파이에서 아래 IPv4 주소:8080 으로 접속
ipconfig | findstr /i "IPv4"
echo  ----------------------------------------
echo  종료하려면 이 창을 닫으세요.
echo.
python -m http.server 8080
