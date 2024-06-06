provider "aws" {
  allowed_account_ids = [local.account.id]
  region              = local.account.region

  assume_role {
    role_arn = "arn:aws:iam::${local.account.id}:role/${local.account.role}"
  }
}

data "aws_caller_identity" "current" {
}

provider "sops" {}

data "sops_file" "secrets" {
  source_file = "${path.module}/secrets.enc.yaml"
}
