terraform {
  backend "s3" {
    bucket  = "badak-terraform-states"
    encrypt = true
    key     = "blind-test/terraform.tfstate"
    region  = "eu-west-3"

    role_arn       = "arn:aws:iam::637423496590:role/admin"
    dynamodb_table = "terraform-state-lock"
  }
  required_providers {
    sops = {
      source  = "carlpett/sops"
      version = "~> 0.7"
    }
  }
}
