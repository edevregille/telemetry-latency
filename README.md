
Instructions for 
- m5a.large or similar or larger instance
- Ubuntu OS (you can adapt the instructions if you go with different OS)

# What it does
Using docker-compose, it deploys:
- 1 container with new relic infrastructure and Flex integration to measure network latency and packets loss for each new relic telemetry api endpoint

- n containers to measure telemetry API time to glass which is the time to ingest + time to query for each new relic telemetry api endpoint

# Instructions

1. Install DOCKER

```
sudo apt update \
&& sudo apt install -y apt-transport-https ca-certificates curl software-properties-common \
&& curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - \
&& sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" \
&& sudo apt update \
&& sudo apt install docker-ce -y 
```

2. Install Docker-Compose
```
sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose \
&& sudo chmod +x /usr/local/bin/docker-compose 
```

3. Clone the app
```git clone https://github.com/edevregille/telemetry-latency && cd telemetry-latency```

4. Update Dockerfile `telemetry-api/telemetry-api.dockerfile` with the New Relic keys for your New Relic account (license key, accountId, User-Key and Insert keys)

5. Update the New Relic Infrastructure yaml `newrelic-infra-setup/newrelic-infra.yml` file with your license key.

6. Run the application and generate traffic. Ensure everything is working fine and resources are all good.
```sudo docker-compose up -d --scale telemetry=8```  

You can then scale up to get to 1,000 req/min by running 
```sudo docker-compose up -d --scale telemetry=17```
