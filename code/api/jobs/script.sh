#!/bin/bash
docker exec -it mysql-db mysqldump  -u root -psecret todoapp  > ./database/dumps/$(date "+%b_%d_%Y_%H_%M_%S").sql 
