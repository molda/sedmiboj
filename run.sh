kill -9 $(lsof -i :5001 | grep "total" | awk {'print $2'}) > /dev/null
cp /home/pi/sedmiboj/index.log /home/pi/sedmiboj/index_$(date +%F_%R).log
/usr/bin/node /home/pi/sedmiboj/index.js > /home/pi/sedmiboj/index.log &