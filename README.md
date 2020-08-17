Instructions for Ubuntu (you can adapt if you go with different OS)

1. Install New Relic Infrastructure https://one.newrelic.com/launcher/nr1-core.settings?pane=eyJuZXJkbGV0SWQiOiJzZXR1cC1uZXJkbGV0LnNldHVwLW9zIiwiZGF0YVNvdXJjZSI6IlVCVU5UVSIsImFjY291bnRJZCI6MTM4NzM2OH0=

2. Run Flex with ping to each telemetry endpoints to measure Network Latency and Packet Loss
In the folder /etc/newrelic-infra/integrations.d/ create a file ping.xml with following content:
```
---
integrations:
  - name: nri-flex
    interval: 15s
    config:
      name: pingFlex
      apis:
        - name: ping
          commands:
            - name: trace
              run: ping -c 5 trace-api.newrelic.com || true
              split_output: statistics ---
              regex_matches:
                - expression: ([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)
                  keys: [min, avg, max, stddev]
                  ### there are two different variants for the packet statistics returned, below allows support for both
                - expression: (\d+) packets transmitted, (\d+) packets received, (\S+)% packet loss
                  keys: [packetsTransmitted, packetsReceived, packetLoss]
                - expression: (\d+) packets transmitted, (\d+) received, (\d+)% packet loss, time (\d+)
                  keys:
                    [packetsTransmitted, packetsReceived, packetLoss, timeMs]
          custom_attributes:
            url: trace-api.newrelic.com
        - name: ping
          commands:
            - name: metric
              run: ping -c 5 metric-api.newrelic.com || true
              split_output: statistics ---
              regex_matches:
                - expression: ([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)
                  keys: [min, avg, max, stddev]
                  ### there are two different variants for the packet statistics returned, below allows support for both
                - expression: (\d+) packets transmitted, (\d+) packets received, (\S+)% packet loss
                  keys: [packetsTransmitted, packetsReceived, packetLoss]
                - expression: (\d+) packets transmitted, (\d+) received, (\d+)% packet loss, time (\d+)
                  keys:
                    [packetsTransmitted, packetsReceived, packetLoss, timeMs]
          custom_attributes:
            url: metric-api.newrelic.com
        - name: ping
          commands:
            - name: event
              run: ping -c 5 insights-collector.newrelic.com || true
              split_output: statistics ---
              regex_matches:
                - expression: ([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)
                  keys: [min, avg, max, stddev]
                  ### there are two different variants for the packet statistics returned, below allows support for both
                - expression: (\d+) packets transmitted, (\d+) packets received, (\S+)% packet loss
                  keys: [packetsTransmitted, packetsReceived, packetLoss]
                - expression: (\d+) packets transmitted, (\d+) received, (\d+)% packet loss, time (\d+)
                  keys:
                    [packetsTransmitted, packetsReceived, packetLoss, timeMs]
          custom_attributes:
            url: insights-collector.newrelic.com
        - name: ping
          commands:
            - name: log
              run: ping -c 5 log-api.newrelic.com || true
              split_output: statistics ---
              regex_matches:
                - expression: ([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)
                  keys: [min, avg, max, stddev]
                  ### there are two different variants for the packet statistics returned, below allows support for both
                - expression: (\d+) packets transmitted, (\d+) packets received, (\S+)% packet loss
                  keys: [packetsTransmitted, packetsReceived, packetLoss]
                - expression: (\d+) packets transmitted, (\d+) received, (\d+)% packet loss, time (\d+)
                  keys:
                    [packetsTransmitted, packetsReceived, packetLoss, timeMs]
          custom_attributes:
            url: insights-collector.newrelic.com
        - name: ping
          commands:
            - name: log
              run: ping -c 5 log-api.newrelic.com || true
              split_output: statistics ---
              regex_matches:
                - expression: ([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)\/([0-9]+\.?[0-9]+)
                  keys: [min, avg, max, stddev]
                  ### there are two different variants for the packet statistics returned, below allows support for both
                - expression: (\d+) packets transmitted, (\d+) packets received, (\S+)% packet loss
                  keys: [packetsTransmitted, packetsReceived, packetLoss]
                - expression: (\d+) packets transmitted, (\d+) received, (\d+)% packet loss, time (\d+)
                  keys:
                    [packetsTransmitted, packetsReceived, packetLoss, timeMs]
          custom_attributes:
            url: log-api.newrelic.com
```

3. Install DOCKER

```
sudo apt update \
&& sudo apt install -y apt-transport-https ca-certificates curl software-properties-common \
&& curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - \
&& sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" \
&& sudo apt update \
&& sudo apt install docker-ce -y 
```

2. Install Doceker-Compose
```
sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose \
&& sudo chmod +x /usr/local/bin/docker-compose 
```

3. Update Dockerfile with the New Relic keys

4. Run sudo docker-compose up -d --scale web=5