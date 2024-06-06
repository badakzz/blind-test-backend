provider "aws" {
  allowed_account_ids = [local.account.id]
  region              = local.account.region

  assume_role {
    role_arn = "arn:aws:iam::${local.account.id}:role/${local.account.role}"
  }
}

data "aws_caller_identity" "current" {
}
