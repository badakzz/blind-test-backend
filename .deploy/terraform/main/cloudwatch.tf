resource "aws_cloudwatch_log_group" "blindtest_backend_ecs_logs" {
  name              = "/ecs/blind-test-backend"
  retention_in_days = 30

  tags = {
    Project = "blind-test"
  }
}

resource "aws_cloudwatch_log_group" "blindtest_client_ecs_logs" {
  name              = "/ecs/blind-test-client"
  retention_in_days = 30

  tags = {
    Project = "blind-test"
  }
}
