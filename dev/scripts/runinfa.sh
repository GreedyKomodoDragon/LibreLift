docker-compose -f docker-compose.yaml down
rm -rf ./certs
rm -rf ./data
rm -rf ./esdata01
rm -rf ./kibanadata
docker-compose -f docker-compose.yaml up
