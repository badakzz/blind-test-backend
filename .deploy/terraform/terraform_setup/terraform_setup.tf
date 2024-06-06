module "terraform_setup" {
  source      = "../../../terraform_modules/terraform_setup"
  name_prefix = local.account.name

  tags = merge(local.common_tags, {
    owner = "lucas.deray@gmail.com"
  })
}
