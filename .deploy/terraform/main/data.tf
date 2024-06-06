data "terraform_remote_state" "central" {
  backend = "s3"
  config = {
    bucket = "badak-terraform-states"
    key    = "central/terraform.tfstate"
    region = "eu-west-3"
  }
}
