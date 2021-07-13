FROM newrelic/infrastructure:latest
ADD newrelic-infra.yml /etc/newrelic-infra.yml
ADD ping.yml /etc/newrelic-infra/integrations.d/