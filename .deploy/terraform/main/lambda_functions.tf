# resource "aws_iam_role" "lambda_execution_role" {
#   name = "lambda_execution_role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Action = "sts:AssumeRole",
#         Principal = {
#           Service = "lambda.amazonaws.com"
#         },
#         Effect = "Allow",
#       },
#     ]
#   })
# }

# resource "aws_iam_role" "lambda_forward_logs_s3_cloudwatch_role" {
#   name = "${local.account.name}-lambda-forward-logs-s3-cloudwatch-role"

#   assume_role_policy = <<EOF
# {
#     "Version": "2012-10-17",
#     "Statement": [
#         {
#             "Effect": "Allow",
#             "Principal": {
#                 "Service": "lambda.amazonaws.com"
#             },
#             "Action": "sts:AssumeRole"
#         }
#     ]
# }
# EOF
#   tags = merge({
#     Name = "${local.account.name}-iam-role"
#     }
#   )
# }

# resource "aws_iam_role_policy" "lambda_forward_logs_s3_cloudwatch_role_policy" {
#   name   = "${local.account.name}-lambda-forward-logs-s3-cloudwatch-policy"
#   role   = aws_iam_role.lambda_forward_logs_s3_cloudwatch_role.id
#   policy = <<EOF
# {
#     "Version": "2012-10-17",
#     "Statement": [
#       {
#         "Effect": "Allow",
#         "Action": [
#           "logs:CreateLogGroup",
#           "logs:CreateLogStream",
#           "logs:DescribeLogGroups",
#           "logs:DescribeLogStreams",
#           "logs:PutLogEvents",
#           "logs:GetLogEvents",
#           "logs:FilterLogEvents",
#           "ec2:CreateNetworkInterface",
#           "ec2:DescribeNetworkInterfaces",
#           "ec2:DeleteNetworkInterface"
#         ],
#         "Resource": "*"
#       },
#       {
#         "Action": [
#           "s3:GetObject"
#         ],
#         "Effect": "Allow",
#         "Resource": ["*"]
#       }
#     ]
#   }
#   EOF
# }

# resource "aws_iam_role_policy" "lambda_policy" {
#   role = aws_iam_role.lambda_execution_role.id

#   policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Effect = "Allow",
#         Action = [
#           "rds-db:connect",
#           "ec2:CreateNetworkInterface",
#           "ec2:DeleteNetworkInterface",
#           "ec2:DescribeNetworkInterfaces"
#         ],
#         Resource = "*"
#       }
#     ]
#   })
# }

# resource "aws_lambda_function" "delete_old_records" {
#   filename         = "../../../lambda_functions/cronDeleteOldPricesRecords/cronDeleteOldPricesRecords.zip"
#   function_name    = "delete_old_records"
#   role             = aws_iam_role.lambda_execution_role.arn
#   handler          = "index.handler"
#   runtime          = "nodejs20.x"
#   source_code_hash = filebase64sha256("../../../lambda_functions/cronDeleteOldPricesRecords/cronDeleteOldPricesRecords.zip")
#   timeout          = 30

#   vpc_config {
#     subnet_ids         = [data.terraform_remote_state.central.outputs.rds_subnet_a_id, data.terraform_remote_state.central.outputs.rds_subnet_b_id]
#     security_group_ids = [aws_security_group.lambda_sg.id]
#   }

#   environment {
#     variables = {
#       DB_USER     = "${data.sops_file.secrets.data["databaseUser"]}",
#       DB_PASSWORD = "${data.sops_file.secrets.data["databasePassword"]}",
#       DB_NAME     = "${data.sops_file.secrets.data["databaseName"]}",
#       DB_HOST     = "${data.sops_file.secrets.data["databaseHost"]}",
#       DB_PORT     = "${data.sops_file.secrets.data["databasePort"]}"
#     }
#   }
# }

# resource "aws_lambda_function" "forward_logs_s3_cloudwatch" {
#   filename         = "../../../lambda_functions/sendToCloudWatch/sendToCloudWatch.zip"
#   function_name    = "alb_log_processor"
#   role             = aws_iam_role.lambda_forward_logs_s3_cloudwatch_role.arn
#   handler          = "index.handler"
#   runtime          = "nodejs20.x"
#   source_code_hash = filebase64sha256("../../../lambda_functions/sendToCloudWatch/sendToCloudWatch.zip")

#   timeout = 30

#   tracing_config {
#     mode = "Active"
#   }

#   environment {
#     variables = {
#       logGroupName = "${aws_cloudwatch_log_group.lb_logs.name}"
#     }
#   }
# }

# resource "aws_lambda_permission" "allow_bucket_forward_logs" {
#   statement_id   = "AllowExecutionFromS3Bucket"
#   action         = "lambda:InvokeFunction"
#   function_name  = aws_lambda_function.forward_logs_s3_cloudwatch.arn
#   principal      = "s3.amazonaws.com"
#   source_arn     = data.terraform_remote_state.central.outputs.lb_logs_bucket_arn
#   source_account = local.account.id
# }
