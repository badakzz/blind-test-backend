module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "blind-test-db"

  engine            = "postgres"
  engine_version    = "14"
  instance_class    = "db.t3.micro"
  allocated_storage = 5

  db_name  = "BlindtestDB"
  username = "BlindtestAdm"
  port     = "5432"

  manage_master_user_password = false

  password = data.sops_file.secrets.data["masterUserDbPw"]

  vpc_security_group_ids = [data.terraform_remote_state.central.outputs.rds_sg_id]

  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"

  create_db_subnet_group = true
  subnet_ids             = [data.terraform_remote_state.central.outputs.rds_subnet_a_id, data.terraform_remote_state.central.outputs.rds_subnet_b_id]

  family = "postgres14"

  major_engine_version = "14"

  deletion_protection = true

  master_user_secret_kms_key_id = data.terraform_remote_state.central.outputs.kms_key_db_id

  publicly_accessible = true

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
}
