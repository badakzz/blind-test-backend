resource "aws_ecs_cluster" "blindtest_app_cluster" {
  name = "blind-test-cluster"
}

resource "aws_ecs_task_definition" "blindtest_backend_task" {
  family                   = "blind-test-backend-task"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = "arn:aws:iam::${local.account.id}:role/ECSTaskExecutionRole"

  container_definitions = jsonencode([
    {
      name      = "blind-test-backend"
      image     = "${local.account.id}.dkr.ecr.${local.account.region}.amazonaws.com/blind-test-backend:latest"
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 3002
          hostPort      = 3002
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "POSTGRES_HOST", value = "${data.sops_file.secrets.data["postgresHost"]}" },
        { name = "POSTGRES_DATABASE", value = "${data.sops_file.secrets.data["postgresDb"]}" },
        { name = "POSTGRES_PASSWORD", value = "${data.sops_file.secrets.data["masterUserDbPw"]}" },
        { name = "POSTGRES_USER", value = "${data.sops_file.secrets.data["postgresUser"]}" },
        { name = "SPOTIFY_CLIENT_ID", value = "${data.sops_file.secrets.data["spotifyClientId"]}" },
        { name = "SPOTIFY_CLIENT_SECRET", value = "${data.sops_file.secrets.data["spotifyClientSecret"]}" },
        { name = "STRIPE_PUBLIC_KEY", value = "${data.sops_file.secrets.data["stripePk"]}" },
        { name = "STRIPE_SECRET_KEY", value = "${data.sops_file.secrets.data["stripeSecret"]}" },
        { name = "JWT_SECRET_KEY", value = "${data.sops_file.secrets.data["jwtSecretKey"]}" },
        { name = "JWT_COOKIE_NAME", value = "${data.sops_file.secrets.data["jwtCookieName"]}" },
        { name = "COOKIE_PARSER_SECRET", value = "${data.sops_file.secrets.data["cookieParserSecret"]}" },
        { name = "NODE_SERVER_DOMAIN", value = "${data.sops_file.secrets.data["apiBaseUrl"]}" },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.blindtest_backend_ecs_logs.name}"
          awslogs-region        = "${local.account.region}"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}


resource "aws_ecs_task_definition" "blindtest_client_task" {
  family                   = "blind-test-client-task"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = "arn:aws:iam::${local.account.id}:role/ECSTaskExecutionRole"

  container_definitions = jsonencode([
    {
      name      = "blind-test-client"
      image     = "${local.account.id}.dkr.ecr.${local.account.region}.amazonaws.com/blind-test-client:latest"
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.blindtest_client_ecs_logs.name}"
          awslogs-region        = "${local.account.region}"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "blindtest_backend_service" {
  name            = "blind-test-backend-service"
  cluster         = aws_ecs_cluster.blindtest_app_cluster.id
  task_definition = aws_ecs_task_definition.blindtest_backend_task.arn
  launch_type     = "FARGATE"

  desired_count = 1

  network_configuration {
    subnets          = [data.terraform_remote_state.central.outputs.ecs_subnet_id]
    security_groups  = [data.terraform_remote_state.central.outputs.ecs_sg_id]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = data.terraform_remote_state.central.outputs.blindtest_backend_tg_arn
    container_name   = "blind-test-backend"
    container_port   = 3002
  }
}

resource "aws_ecs_service" "blindtest_client_service" {
  name            = "blind-test-client-service"
  cluster         = aws_ecs_cluster.blindtest_app_cluster.id
  task_definition = aws_ecs_task_definition.blindtest_client_task.arn
  launch_type     = "FARGATE"

  desired_count = 1

  network_configuration {
    subnets          = [data.terraform_remote_state.central.outputs.ecs_subnet_id]
    security_groups  = [data.terraform_remote_state.central.outputs.ecs_sg_id]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = data.terraform_remote_state.central.outputs.blindtest_client_tg_arn
    container_name   = "blind-test-client"
    container_port   = 3001
  }
}

resource "aws_appautoscaling_target" "blindtest_backend_ecs_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.blindtest_app_cluster.name}/${aws_ecs_service.blindtest_backend_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 10
}

resource "aws_appautoscaling_policy" "blindtest_backend_cpu_based" {
  name               = "backend-cpu-based-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.blindtest_backend_ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.blindtest_backend_ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.blindtest_backend_ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_target" "blindtest_client_ecs_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.blindtest_app_cluster.name}/${aws_ecs_service.blindtest_client_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 10
}

resource "aws_appautoscaling_policy" "blindtet_client_cpu_based" {
  name               = "client-cpu-based-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.blindtest_client_ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.blindtest_client_ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.blindtest_client_ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
